const fetch = require("node-fetch");
const Redis = require("ioredis");
let redis;
// Redis instance
if(process.env.NODE_ENV !== "production") {
  redis = new Redis({
    "port":6379,
    "host":"localhost"
  })
} else {
  redis = new Redis(process.env.REDIS_URL);
}
 
async function getTokenInfo(network, tokenAddress, exchangeAddress) {

  let quoteCurrency = "";

  if(network === "bsc") {
    quoteCurrency = "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c"; //WBNB
  }

  if(network === "ethereum") {
    quoteCurrency = "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2"; //WETH
  }

  if(network === "matic") {
    quoteCurrency = "0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270"; //WMATIC
  }

  const query = `
{
  ethereum(network: ${network}) {
    dexTrades(
      options: {desc: ["block.height","tradeIndex"], limit: 1}
      exchangeName: {in: ["${exchangeAddress}"]}
      baseCurrency: {is: "${tokenAddress}"}
      quoteCurrency: {is: "${quoteCurrency}"}
      date: {since: null, till: null}
    ) {
      transaction {
        hash
      }
      tradeIndex
      smartContract {
        address {
          address
        }
        contractType
        currency {
          name
        }
      }
      tradeIndex
      block {
        height
      }
      baseCurrency {
        name
        symbol
        address
      }
      quoteCurrency {
        name
        symbol
        address
      }
      quotePrice
    }
  }
}
`;

const url = "https://graphql.bitquery.io/";

const opts = {
    method: "POST",
    headers: {
        "Content-Type": "application/json",
        "X-API-KEY": process.env.API_KEY
    },
    body: JSON.stringify({
        query
    })
};

// Check if I have a cache value for this response
let cacheEntry = await redis.get(`tokenInfo:${network}+${tokenAddress}+${exchangeAddress}+${quoteCurrency}`);

// If we have a cache hit
if (cacheEntry) {
    cacheEntry = JSON.parse(cacheEntry);
    // return that entry
    return cacheEntry;
}

const response = await fetch(url, opts);
const data = await response.json();
// Save entry in cache for 5 minutes
redis.set(`tokenInfo:${network}+${tokenAddress}+${exchangeAddress}+${quoteCurrency}`, JSON.stringify(data), "EX", 300);
return data;

}

module.exports = getTokenInfo;

