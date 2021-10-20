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

async function getPairInfoAt(network, blockNumber, pairAddress) {

  var url = "";
  var derived = "";
  var trackedReserve = "";
  var reserve = "";

  if(network === "bsc") {
    url = "https://api.thegraph.com/subgraphs/name/vmatskiv/pancakeswap-v2";
    derived = "derivedBNB";
    trackedReserve = "trackedReserveBNB";
    reserve = "reserveBNB";
  }

  if(network === "ethereum") {
    url = "https://api.thegraph.com/subgraphs/name/dimitarnestorov/sushiswap-subgraph";
    derived = "derivedETH";
    trackedReserve = "trackedReserveETH";
    reserve = "reserveETH";
  }

  if(network === "matic") {
    url = "https://api.thegraph.com/subgraphs/name/proy24/quickswap-polygon";
    derived = "derivedETH";
    trackedReserve = "trackedReserveETH";
    reserve = "reserveETH";
  }

  const query = `
  fragment PairFields on Pair {
    id
    token0 {
      id
      symbol
      name
      totalLiquidity
      ${derived}
    }
    token1 {
      id
      symbol
      name
      totalLiquidity
      ${derived}
    }
    reserve0
    reserve1
    reserveUSD
    totalSupply
    ${trackedReserve}
    ${reserve}
    volumeUSD
    untrackedVolumeUSD
    token0Price
    token1Price
    createdAtTimestamp
  }
  
  query pairs {
    pairs(block: {number: ${blockNumber}}, where: {id: "${pairAddress}"}) {
      ...PairFields
    }
  }
`;

const opts = {
    method: "POST",
    headers: {
        "Content-Type": "application/json",
        "X-API-KEY": process.env.API_KEY_THE_GRAPH
    },
    body: JSON.stringify({
        query
    })
};

// Check if I have a cache value for this response
let cacheEntry = await redis.get(`pairInfoAt:${network}+${blockNumber}+${pairAddress}`);

// If we have a cache hit
if (cacheEntry) {
    cacheEntry = JSON.parse(cacheEntry);
    // return that entry
    return cacheEntry;
}

const response = await fetch(url, opts);
const data = await response.json();
// Save entry in cache for 1 minute
redis.set(`pairInfoAt:${network}+${blockNumber}+${pairAddress}`, JSON.stringify(data), "EX", 120);
return data;

}

module.exports = getPairInfoAt;

