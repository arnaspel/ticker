const bodyParser = require('body-parser');
const express = require('express');
const ramda = require('ramda');
const got = require('got');
const http = require('http');
const cors = require('cors');
const { Server } = require("socket.io");

const { router } = require('./routes');
const { pool } = require("./services/postgresql.service");


const PORT = process.env.PORT;
const TICKER_URL = process.env.UPHOLD_TICKER_URL;
const STATE = {
  interval: 5000,
  currency: "BTC-USD",
}
let refreshIntervalId;
const start = async () => {
  const app = express();
  
  
  app.use(cors({
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS'
  }));
  app.use(bodyParser.json());
  app.use(express.json());
  const httpServer = http.createServer(app);

  const ioServer = new Server(httpServer, {cors: {origin: "*"}});;
  
  
  app.use('/', router);
  
  ioServer.on("connection", (socket) => {
    console.log('SOCKET_CONNECTION');

    socket.on("changeRefreshTime", (data) => {
      clearInterval(refreshIntervalId);
      const INTERVAL = data * 1000;
      STATE.interval = INTERVAL;
      startPollingTicker(ioServer, INTERVAL, STATE.currency);
    });
    socket.on("changeCurrency", (data) => {
      clearInterval(refreshIntervalId);
      STATE.currency = data;
      startPollingTicker(ioServer, STATE.interval, data);
    });
  });
  
  
  
  startPollingTicker(ioServer, 5000);

  httpServer.listen(PORT, () => {
    console.log(`Ticker Server is running on: ${PORT}`);
  });
};

const startPollingTicker = (ioServer, interval, currency = "BTC-USD") => {
  console.log(`startPollingTicker`);

  const REQUEST_URL = TICKER_URL + currency;
  const REQUEST_OPTIONS = {
    timeout: 3000,
    throwHttpErrors: false,
  };
  
    refreshIntervalId = setInterval( async () => {
    const RESPONSE = await got(REQUEST_URL, REQUEST_OPTIONS);
    const RESPONSE_BODY = JSON.parse(ramda.path(['body'], RESPONSE));
    insertData(RESPONSE_BODY);
    console.log('RESPONSE_BODY', RESPONSE_BODY);
    ioServer.sockets.emit('tick', {...RESPONSE_BODY, timestamp: new Date().getTime()});
}, interval);
};

const insertData = async (tick) => {
  const TICK = {
    ...tick,
    timestamp: new Date().getTime(),
  }
  try {
    const res = await pool.query(
      `INSERT INTO tick.ticks(ask, bid, currency, timestamp) VALUES($1, $2, $3, $4)`,
      [parseFloat(TICK.ask), parseFloat(TICK.bid), TICK.currency, TICK.timestamp]
    );
    console.log(`Added a tick with the ask ${tick.ask}`);

  } catch (error) {
    console.log('Error inserting data: ', JSON.stringify(error, null, 2));

  }
}

module.exports = {
  start,
};
