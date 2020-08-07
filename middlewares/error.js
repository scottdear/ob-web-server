const winston = require('winston');

module.exports = function (error, req, res) {
  winston.error(error.message, error);
  res.status(500).send(error.message);
};
