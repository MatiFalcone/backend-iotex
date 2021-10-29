// Requires
if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}
const http = require("http");
const express = require("express");
const jwt = require("jsonwebtoken");
const { Server } = require("socket.io");
const app = express();
const bcrypt = require("bcrypt");
const cors = require("cors");
const server = http.createServer(app);
const verifyToken = require("../middlewares/authentication");
app.use(express.urlencoded({ extended: true }));
app.use(cors({
  origin: "*"
}));

// Process ID
console.log(process.pid);

const io = new Server(server);

// All active connections go in this object
const clients = {};

// SOCKETS MANAGEMENT
io.on("connection", (client) => {

  const userID = getUniqueID();
  
  console.log((new Date()) + ": Received a new connection from origin " + client.id + ".");
  // You can rewrite this part of the code to accept only the requests from allowed origin
  //const connection = io.accept(null, socket.origin);
  clients[userID] = client;
  console.log("Connected: " + userID + " in " + Object.getOwnPropertyNames(clients))

  // DISCONNECTION
  client.on("disconnect", (reason) => {
    const disconnectedUser = userID;
    delete clients[userID];
    console.log("The client disconnected.");
  });

});

// LISTEN
server.listen(process.env.PORT, () => {
  console.log(`Server listening on ${process.env.PORT}`);

});

app.post("/auth", (req, res) => {

  let body = req.body;

  if(!bcrypt.compareSync(body.password, process.env.PASS)) { // PolyT00ls2021@#
    return res.status(400).json({
      ok: false,
      err: {
        message: "Incorrect authentication"
      } 
    });
  }

  let token = jwt.sign({
      user: "Correct Authentication"
  }, process.env.SEED, { expiresIn: process.env.TOKEN_EXPIRATION })

  res.json({
    ok: true,
    token
  });

})

////////////////////////////
// INICIO API REST TOKENS //
////////////////////////////
const getTokenInfo = require("./query/token_info");
const getLastTrades = require("./query/token_last_trades");
const getCandleData = require("./query/ohlc");
const getPairData = require("./query/pair_mint_burn_swap");
const getPairInfoAt = require("./query/pair_info");
const { getBlockNumberBsc, getBlockNumberEth, getBlockNumberMatic } = require("./query/blocks");

// Retrieves the information of the token address specified in :token using WMATIC as quote currency
app.get("/tokenInfo", verifyToken, async (req, res) => {
//app.get("/tokenInfo", async (req, res) => {

  let network = req.query.network;
  let tokenAddress = req.query.token;
  let exchangeAddress = req.query.exchange;

  const tokenInfo = await getTokenInfo(network, tokenAddress, exchangeAddress);

  res.json({
    ok: true,
    tokenInfo
  });

});

// Retrieves the last 5 QuickSwap trades of the token address specified in :token
app.get("/lastTrades", verifyToken, async (req, res) => {
//app.get("/lastTrades", async (req, res) => {

  let network = req.query.network;
  let tokenAddress = req.query.token;
  let exchangeAddress = req.query.exchange;

  const tokenLastTrades = await getLastTrades(network, tokenAddress, exchangeAddress);

  res.json({
    ok: true,
    tokenLastTrades
  });

});

// Retrieves OHLC data 
app.get("/ohlc", verifyToken, async (req, res) => {
//app.get("/ohlc", async (req, res) => {

  let network = req.query.network;
  let exchange = req.query.exchange;
  let base = req.query.baseToken;
  let quote = req.query.quoteCurrency;
  let until = req.query.until;
  let window = req.query.window;
  let limit = req.query.limit;

  const dataOHLC = await getCandleData(network, exchange, base, quote, until, window, limit);

  res.json({
    ok: true,
    dataOHLC
  });

});

// Retrieves the information of a Pair
app.get("/pairData", verifyToken, async (req, res) => {
//app.get("/pairData", async (req, res) => {

  let network = req.query.network;
  let pairAddress = req.query.pair;

  // When BSC => PancakeSwap pair address
  // When ETH => SushiSwap pair address
  // When MATIC => QuickSwap pair address
  const pairData = await getPairData(network, pairAddress);

  res.json({
    ok: true,
    pairData
  });

});

// Retrieves the block number at the last height of the MATIC network 
app.get("/pairInfo", verifyToken, async (req, res) => {
//app.get("/pairInfo", async (req, res) => {

  let network = req.query.network;
  let pairAddress = req.query.pair;

  let timestamp = Math.floor(Date.now() / 1000);

  var blockData;

  if(network === "bsc") {
    blockData = await getBlockNumberBsc(timestamp);
  }

  if(network === "ethereum") {
    blockData = await getBlockNumberEth(timestamp);
  }

  if(network === "matic") {
    blockData = await getBlockNumberMatic(timestamp);
  }

  let blockNumber = parseInt(blockData.data.blocks[0].number);

  const pairInfo = await getPairInfoAt(network, blockNumber, pairAddress);

  res.json({
    ok: true,
    pairInfo
  });

});