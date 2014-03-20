'use strict';

var mysql = require('mysql');
var config = require('yaml-config');
var path = require('path');

var settings = config.readConfig(path.join(__dirname, '../config.yaml'), 'default');

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
      host: settings.mysql.host,
      user: settings.mysql.user,
      password: settings.mysql.password,
      database: settings.mysql.database
    });

  return next(connection);
}