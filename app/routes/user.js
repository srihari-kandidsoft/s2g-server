"use strict";

var restify = require('restify')
  , restifyValidation = require('node-restify-validation')
  // , accounts = require('../controllers/accounts' )
  , users = require('../controllers/users')
  , logger = require('../logging').logger
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
        nickname: 'updateUser'              
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

  // Save an item
  server.put({
    url: '/users/:email/items/:id',
    swagger: {
      summary: 'Update a User',
      notes: 'The item must have been created first using a post',
      nickname: 'updateUserItem'
    },
    validation: {
      email: { isRequired: true, isEmail: true, scope: 'path', description: 'Your email for login.'},
      id: { isRequired: true, scope: 'path', regex: /^[0-9a-f]{1,24}$/, description: '24 digit hex unique identifier.'},
      name: { isRequired: true, scope: 'query', description: 'A name for the item to list'},
      description: { isRequired: true, scope: 'query', description: 'A short description of the item.'}
    }
  },[ // middleware
    restify.queryParser(),
    restify.bodyParser(),
    restifyValidation.validationPlugin({errorsAsArray: false})
  ],
  function (req, res, next) {
    if (!req.username || req.username !== req.params.email) {
      return res.sendUnauthenticated();
    }
    return users.putItem(req, res, next);
  });

  // Get all items
  server.get({
    url: '/users/:email/items',
    swagger: {
      summary: 'Get all items for a user',
      notes: 'Returns a 200 with an empty array if there are no items',
      nickname: 'getUserItems'
    },
    validation: {
      email: { isRequired: true, isEmail: true, scope: 'path', description: 'Your email for login.'}
    }
  },[
    restify.queryParser(),
    restifyValidation.validationPlugin({errorsAsArray: false})
  ],
  function (req, res, next) {
    if (!req.username || req.username !== req.params.email) {
      return res.sendUnauthenticated();
    }
    return users.getItems(req, res, next);
  });

  // Get 1 item
  server.get({
    url: '/users/:email/items/:id',
    swagger: {
      summary: 'Get all a specific item for the user',
      notes: 'Returns a 404 if the item or user doesn\'t exist',
      nickname: 'getUserItem'
    },
    validation: {
      email: { isRequired: true, isEmail: true, scope: 'path', description: 'Your email for login.'},
      id: { isRequired: true, scope: 'path', regex: /^[0-9a-f]{1,24}$/, description: '24 digit hex unique identifier.'},      
    }
  },[
    restify.queryParser(),
    restifyValidation.validationPlugin({errorsAsArray: false})
  ],
  function (req, res, next) {
    if (!req.username || req.username !== req.params.email) {
      return res.sendUnauthenticated();
    }
    return users.getItem(req, res, next);
  });  

};

