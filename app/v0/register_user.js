'use strict';

var sql = require('../sql_connect');

module.exports = function (restify, server) {
  server.post('/v0/register_user', function (req, res, next) {
    var query = "INSERT INTO Users(Email, Password) VALUES('" + req.params.email_id +
      "','" + req.params.password + "')";

    sql.execute(query, res, function () {
      var response = {
        "status": "success"
      };
      res.send(response);
      return next();
    });
  });
};