'use strict';

var _ = require('underscore')
  , crypto = require('crypto')
  , mongoose = require('mongoose')
  , Oauth2Token = mongoose.model('Oauth2Token')
  , Account = mongoose.model('Account')
  , logger = require('../logging').logger
  ;

/* istanbul ignore next */
var database = {
  clients: {
    officialApiClient: {
      secret: "C0FFEE"
    },
    unofficialClient: {
      secret: "DECAF"
    }
  }
};

/* istanbul ignore next */
function generateToken(data) {
  var random = Math.floor(Math.random() * 100001);
  var timestamp = (new Date()).getTime();
  var sha256 = crypto.createHmac("sha256", random + "WOO" + timestamp);

  return sha256.update(data).digest("base64");
}

/* istanbul ignore next */
exports.validateClient = function(clientId, clientSecret, cb) {
  // Call back with `true` to signal that the client is valid, and `false` otherwise.
  // Call back with an error if you encounter an internal server error situation while trying to validate.
  var isValid = _.has(database.clients, clientId) && database.clients[clientId].secret === clientSecret;
  cb(null, isValid);
};

exports.grantUserToken = function (username, password, cb) {
  logger.info('#grantUserToken_ ' + username + ',' + password ); 
  Account.authenticate(username, password, function (err, user) {
    logger.info('#grantUserToken_.callback ' + username + ',' + password );
    // internal error
    if (err) return cb(err, false);
    // authentication failure
    if (!user) return cb(null, false);
    // generate a token
    var token = new Oauth2Token({
      email: user.email, 
      token: username + ':' + password
    });
    token.save(function(err) {
      return err ? cb(err, false) : cb(null, token.tokenHash);
    });
  });
};

exports.authenticateToken  = function (token, cb) {
  logger.info( "#authenticateToken: %s", token );
  Oauth2Token.authenticate(token, function (err, oauth2Token) {
    logger.info( "#authenticateToken.callback: %s", oauth2Token );
    console.log( oauth2Token );
    // internal error
    if (err) return cb(err, false);
    // invalid token
    if (!oauth2Token) return cb(null, false);
    // With a match, callback with the username
    cb(null,oauth2Token.email);
  });
};

