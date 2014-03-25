/*global module:true, require:true */

'use strict';

var fs = require('fs'),
  path = require('path'),
  bunyan = require('bunyan'),
  settings = require('./settings');

/*
 * configure and start logging
 * @param {Object} config The configuration object for defining dir: log directory, level: loglevel
 * @return the created logger instance
 */
function createLogger(config, environment) {

  /* istanbul ignore next */
  var pkg = require('../package'),
    appName = pkg.name,
    appVersion = pkg.version,
    logDir = config.dir || path.join(__dirname, 'logs'),
    logFile = path.join(logDir, appName + '-log.json'),
    logErrorFile = path.join(logDir, appName + '-errors.json'),
    streamLogLevel = config.stream && config.stream.level || config.level || 'warn',
    fileLogLevel = config.file && config.file.level || config.level || 'debug',
    errLogLevel = config.error && config.error.level || config.level || 'error';

  // Create log directory if it doesnt exist
  /* istanbul ignore next */
  if (!fs.existsSync(logDir)) fs.mkdirSync(logDir);

  // Log to console and log file
  var log = bunyan.createLogger({
    name: appName,
    streams: [{
      stream: process.stdout,
      level: streamLogLevel
    }, {
      path: logFile,
      level: fileLogLevel,
      type: 'rotating-file',
      period: '1d'
    }, {
      path: logErrorFile,
      level: errLogLevel
    }],
    serializers: bunyan.stdSerializers
  });

  log.info('Starting ' + appName + ', version ' + appVersion);
  log.info('Environment set to ' + config.environment);
  log.debug('Logging setup completed.');

  return log;
}

exports.logger = createLogger(settings.config.logs);

