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
  },
  users: {
    AzureDiamond: {
      password: "hunter2"
    },
    Cthon98: {
      password: "*********"
    }
  },
  tokensToUsernames: {}
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

function grantUserToken_ (username, password, cb) {
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
      return err ? cb(err, false) : cb(null, token.token);
    });
  });
}
exports.grantUserToken = grantUserToken_;

// /* istanbul ignore next */
// exports.grantUserToken = function(username, password, cb) {
//   var isValid = _.has(database.users, username) && database.users[username].password === password;
//   if (isValid) {
//     // If the user authenticates, generate a token for them and store it so `exports.authenticateToken` below
//     // can look it up later.

//     var token = generateToken(username + ":" + password);
//     database.tokensToUsernames[token] = username;

//     // Call back with the token so Restify-OAuth2 can pass it on to the client.
//     return cb(null, token);
//   }

//   // Call back with `false` to signal the username/password combination did not authenticate.
//   // Calling back with an error would be reserved for internal server error situations.
//   cb(null, false);
// };

function authenticateToken_ (token, cb) {
  Oauth2Token.authenticate(token, function (err, oauth2Token) {
    // internal error
    if (err) return cb(err, false);
    // invalid token
    if (!oauth2Token) return cb(null, false);
    // With a match, callback with the username
    cb(null,oauth2Token.username);
  });
}
exports.authenticateToken = authenticateToken_;

// /* istanbul ignore next */
// exports.authenticateToken = function(token, cb) {
//   if (_.has(database.tokensToUsernames, token)) {
//     // If the token authenticates, call back with the corresponding username. Restify-OAuth2 will put it in the
//     // request's `username` property.
//     var username = database.tokensToUsernames[token];
//     return cb(null, username);
//   }

//   // If the token does not authenticate, call back with `false` to signal that.
//   // Calling back with an error would be reserved for internal server error situations.
//   cb(null, false);
// };