const mongoose = require('mongoose');

module.exports = function (Schema, definition, options) {
  return new mongoose.Schema(
    Object.assign({}, Schema.obj, definition),
    options
  );
};
