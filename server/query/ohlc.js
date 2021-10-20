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

async function getCandleData(network, exchange, baseToken, quoteCurrency, until, window, limit) {

  const query = `
  {
    ethereum(network: ${network}) {
      dexTrades(
        options: {desc: "timeInterval.minute", limit: ${limit}}
        date: {till: "${until}"}
        exchangeName: {in: "${exchange}"}
        baseCurrency: {is: "${baseToken}"}
        quoteCurrency: {is: "${quoteCurrency}"}
      ) {
        timeInterval {
          minute(count: ${window}, format: "%Y-%m-%dT%H:%M:%SZ")
        }
        baseCurrency {
          symbol
          address
        }
        quoteCurrency {
          symbol
          address
        }
        tradeAmount(in: USD)
        trades: count
        quotePrice
        quoteAmount
        maximum_price: quotePrice(calculate: maximum)
        minimum_price: quotePrice(calculate: minimum)
        open_price: minimum(of: block, get: quote_price)
        close_price: maximum(of: block, get: quote_price)
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
let cacheEntry = await redis.get(`ohlc:${network}+${exchange}+${baseToken}+${quoteCurrency}+${until}+${window}+${limit}`);

// If we have a cache hit
if (cacheEntry) {
    cacheEntry = JSON.parse(cacheEntry);
    // return that entry
    return cacheEntry;
}

const response = await fetch(url, opts);
const data = await response.json();
// Save entry in cache for 1 minute
redis.set(`ohlc:${network}+${exchange}+${baseToken}+${quoteCurrency}+${until}+${window}+${limit}`, JSON.stringify(data), "EX", 60);
return data;

}

module.exports = getCandleData;

