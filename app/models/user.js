'use strict';

var mongoose = require('mongoose')
  , Schema = mongoose.Schema
  , logger = require('../logging').logger
  , validator = require('validator')
  ;

var User = new Schema({
  username: { type: String, required: true, unique: true, index: true, trim: true},
  neighborhoodId: { type: String, index: true },
  firstName: { type: String, required: true, trim: true },
  lastName: { type: String, required: true, trim: true },
  address:  { type: String, required: true },
  avatar: String,
});

User.path('avatar').validate( function (url) {
  return validator.isURL( url, {
    protocols: ['http', 'https'],
    require_tld: true,
    require_protocol: true
  });
});

// TODO gotta rename this to email pronto!
User.path('username').validate( validator.isEmail );

module.exports = mongoose.model('User', User);