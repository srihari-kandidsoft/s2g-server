"use strict";

var restify = require('restify')
  , restifyValidation = require('node-restify-validation')
  , accounts = require('../controllers/accounts' )
  ;

module.exports = function(server) {

  server.post({
      url: '/accounts',
      swagger: {
        summary: 'Create an account',
        notes: 'A unique email is expected. Passwords are hashed before being stored.',
        nickname: 'createAccount'        
      }, 
      validation: {
        email: { isRequired: true, isEmail: true, scope: 'query', description: 'Your email for login.'},
        password: { isRequired: true, scope: 'query', description: 'A new password for your account.'}
      }
    },[
      restify.queryParser(),
      restifyValidation.validationPlugin({errorsAsArray: false}),
      restify.bodyParser()
    ],
    accounts.create);
};
