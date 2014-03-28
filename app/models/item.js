'use strict';

var mongoose = require('mongoose')
  , Schema = mongoose.Schema
  , logger = require('../logging').logger
  , validator = require('validator')
  ;

var Item = new Schema({
  email: { type: String, required: true, unique: true, index: true, trim: true},
  name: { type: String, required: true, trim: true},
  description: { type: String },
  picture: String,
});

Item.path('picture').validate( function (url) {
  return validator.isURL( url, {
    protocols: ['http', 'https'],
    require_tld: true,
    require_protocol: true
  });
});

Item.path('email').validate( validator.isEmail );

module.exports = mongoose.model('Item', Item);