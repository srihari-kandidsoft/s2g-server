"use strict";

var Neighborhood = require( '../model/neighborhood.js');

module.exports = function(server) {
  server.get('/v0/neighborhoods', function(req, res, next) {
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
      next();      
    });
  });
};
