"use strict";

var restify = require('restify')
  , restifyValidation = require('node-restify-validation')
  , neighborhoods = require('../controllers/neighborhoods')
  ;

module.exports = function(server) {
  // server.use(restify.bodyParser());
  // server.use(restifyValidation.validationPlugin({errorsAsArray: false}));  
  server.get({
    url: '/routes/neighborhoods',
    swagger: {
      summary: 'Page through the neighborhoods',
      notes: 'Pagination api needed!',
      nickname: 'getNeighborhoods'
    },
    validation: {}
  }, 
  neighborhoods.get);
};