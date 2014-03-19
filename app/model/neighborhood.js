"use strict";

var mongoose = require('mongoose')
  , Schema = mongoose.Schema;

var Neighborhood = new Schema({
  name: String,
  city: String,
  country: String,
  state: {
    short: String,
    long: String
  }
});

Neighborhood.statics.createAndSave = function(spec, cb) {
  var n = new Neighborhood(spec);
  n.save(function(err,result) {
    cb(err,result);
  });
  return n;
};

module.exports = mongoose.model('Neighborhood', Neighborhood);