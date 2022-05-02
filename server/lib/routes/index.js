const express = require('express');
const path = require('path');
const router = express.Router();
const controllers = require('./controllers');

router.get('/ticker', controllers.ticker.getTick);

router.use('/tracker-client', express.static(path.join(__dirname, '../../../../tracker-client/dist')));


module.exports = {
  router,
};
