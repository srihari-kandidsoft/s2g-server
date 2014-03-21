"use strict";

var Account = require( '../../model/account.js')
, restify = require('restify')
;

module.exports = function(server) {
  server.use(restify.bodyParser());
  server.post('/v0/accounts', function(req, res, next) {
    var account = new Account( { email: req.params.email } )
      , reply = null ;
    console.log('in post route');
    account.save( function(err) {
      console.log('in save callback');
      if (err) {
        reply = { status: 'error', message: err};
      }
      else {
        reply = {
          status: 'success',
          data: { email: account.email, id: account.id }
        };
      }
      res.send(reply);
      return next();
    });
  });
};