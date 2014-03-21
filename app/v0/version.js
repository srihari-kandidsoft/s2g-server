"use strict";

module.exports = function(server) {
  server.get('/version', function(req, res, next) {
    res.send( {'version': require('../../package.json').version} );
    return next();
  });
};