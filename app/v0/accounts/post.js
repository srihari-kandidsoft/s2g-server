"use strict";

var Account = require( '../../model/account.js')
  , restify = require('restify')
  , restifyValidation = require('node-restify-validation')
  ;

module.exports = function(server) {
  server.use(restify.bodyParser());
  server.use(restifyValidation.validationPlugin({errorsAsArray: false}));
  server.post({
      url: '/v0/accounts',
      swagger: {
        summary: 'Create an account',
        notes: 'A unique email is expected. Passwords are hashed before being stored.',
        nickname: 'createAccount'        
      },
      validation: {
        email: { isRequired: true, isEmail: true, scope: 'query', description: 'Your email for login.'},
        password: { isRequired: true, scope: 'query', description: 'A new password for your account.'}
      }
    },
    function(req, res, next) {
      var account = new Account({ 
        email: req.params.email, 
        passwordHash: Account.hashPassword(req.params.password) 
      });
      var reply = null ;
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
    }
  );
};
