'use strict';

var mysql = require('mysql');
var config = require('./config');
var path = require('path');

/* istanbul ignore next */
module.exports = {
  query: function (query, res, next) {
    get_connection(function (connection) {
      connection.query(query, function (err, rows, fields) {
        if (err) {
          throw err;
        } else {
          return next(rows);
        }
      });
    });
  },
  execute: function (query, res, next) {
    get_connection(function (connection) {
      connection.query(query, function (err, rows, fields) {
        if (err) {
          throw err;
        } else {
          return next();
        }
      });
    });
  },
};

function get_connection(next) {

  var connection =
    mysql.createConnection({
      host: config.get(mysql.host),
      user: config.get(mysql.user),
      password: config.get(mysql.password),
      database: config.get(mysql.database)
    });

  return next(connection);
}