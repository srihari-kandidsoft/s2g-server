"use strict";

var restify = require('restify')
  , restifyValidation = require('node-restify-validation')
  // , accounts = require('../controllers/accounts' )
  ;

module.exports = function(server) {
  server.use(restify.bodyParser());
  server.use(restifyValidation.validationPlugin({errorsAsArray: false}));
  server.get({
      url: '/user/:username',
      swagger: {
        summary: 'Get the user profile',
        notes: 'Returns profile information',
        nickname: 'getUser'        
      },
      validation: {
        // email: { isRequired: true, isEmail: true, scope: 'query', description: 'Your email for login.'},
        // password: { isRequired: true, scope: 'query', description: 'A new password for your account.'}
      }
    },
    function (req, res, next) {
      if (!req.username) {
        return res.sendUnauthenticated();
      }
      res.send({});
      return next();
    });
};
