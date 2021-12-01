const fetch = require("node-fetch");

async function getBlockNumberIotex(timestamp) {

  const query = `
    {
      blocks(first: 1, orderBy: timestamp, orderDirection: desc, where: {timestamp_gt: ${timestamp-180000}, timestamp_lt: ${timestamp-120000}}) {
        number
      }
    }
  `;
  
  const url = "https://api.thegraph.com/subgraphs/name/venomprotocol/bsc-blocks";
  
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
  
  const response = await fetch(url, opts);
  const data = await response.json();
  return data;
  
}

async function getBlockNumberBsc(timestamp) {

  const query = `
    {
      blocks(first: 1, orderBy: timestamp, orderDirection: desc, where: {timestamp_gt: ${timestamp-180000}, timestamp_lt: ${timestamp-120000}}) {
        number
      }
    }
  `;
  
  const url = "https://api.thegraph.com/subgraphs/name/venomprotocol/bsc-blocks";
  
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
  
  const response = await fetch(url, opts);
  const data = await response.json();
  return data;
  
}

async function getBlockNumberMatic(timestamp) {

  const query = `
    {
      blocks(first: 1, orderBy: timestamp, orderDirection: desc, where: {timestamp_gt: ${timestamp-180000}, timestamp_lt: ${timestamp-120000}}) {
        number
      }
    }
  `;
  
  const url = "https://api.thegraph.com/subgraphs/name/sameepsi/maticblocks";
  
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
  
  const response = await fetch(url, opts);
  const data = await response.json();
  return data;
 
}

async function getBlockNumberEth(timestamp) {

  const query = `
    {
      blocks(first: 1, orderBy: timestamp, orderDirection: desc, where: {timestamp_gt: ${timestamp-180000}, timestamp_lt: ${timestamp-120000}}) {
        number
      }
    }
  `;
  
  const url = "https://api.thegraph.com/subgraphs/name/elkfinance/eth-blocks";
  
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
  
  const response = await fetch(url, opts);
  const data = await response.json();
  return data;
 
}

module.exports = {
  getBlockNumberBsc,
  getBlockNumberMatic,
  getBlockNumberEth,
  getBlockNumberIotex
}