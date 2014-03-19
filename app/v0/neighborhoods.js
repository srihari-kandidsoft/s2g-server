"use strict";

var mongoose = require('mongoose');

var Neighborhood = appquire( './model/neighborhood.js');

module.exports = function(restify,server) {
  server.get('/neighborhoods', function(req, res, next) {
    try {
      Neighborhood.find().exec( function(err, d) {
        var reply = { 
          status: 'success',
          data: d
        };
        if ( err ) {
          reply.status = 'error';
          reply.message = err;
        }
        res.send( reply );
        return next();      
      });
    } catch (e) {
      console.log(e);
    }
  });
};
