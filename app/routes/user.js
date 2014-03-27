"use strict";

var restify = require('restify')
  , restifyValidation = require('node-restify-validation')
  // , accounts = require('../controllers/accounts' )
  , users = require('../controllers/users')
  ;

module.exports = function(server) {

  var plugins = [ restify.bodyParser(),
    restifyValidation.validationPlugin({errorsAsArray: false})
  ];

  // Get a user
  server.get({
      url: '/users/:username',
      swagger: {
        summary: 'Get the user profile',
        notes: 'Returns profile information',
        nickname: 'getUser'        
      },
      validation: {
        // email: { isRequired: true, isEmail: true, scope: 'query', description: 'Your email for login.'},
        // password: { isRequired: true, scope: 'query', description: 'A new password for your account.'}
      }
    },[  // middleware
      restify.bodyParser(),
      restifyValidation.validationPlugin({errorsAsArray: false})
    ], 
    function (req, res, next) {
      if (!req.username) {
        return res.sendUnauthenticated();
      }
      return users.get(req, res, next);
    });

  // Save a user
  server.put({
      url: '/users/:username',
      swagger: {
        summary: 'Add or update a User',
        notes: '',
        nickname: 'update user'              
      },
      validation: {}
    },[ // middleware
      restify.queryParser(),
      restify.bodyParser(),
      restifyValidation.validationPlugin({errorsAsArray: false})
    ],
    function (req, res, next) {
      if (!req.username || req.username !== req.params.username) {
        return res.sendUnauthenticated();
      }
      return users.put(req, res, next);
    });
};

