/*global module:true, require:true */

'use strict';

var fs = require('fs'),
  path = require('path'),
  bunyan = require('bunyan'),
  conf = require('./config');

/*
 * configure and start logging
 * @param {Object} config The configuration object for defining dir: log directory, level: loglevel
 * @return the created logger instance
 */
function createLogger() {

  /* istanbul ignore next */
  var pkg = require('../package'),
    appName = pkg.name,
    appVersion = pkg.version,
    logDir = conf.get('logs.dir'),
    logFile = path.join(logDir, appName + '-log.json'),
    logErrorFile = path.join(logDir, appName + '-errors.json'),
    streamLogLevel = conf.has('logs.stream.level') ? conf.get('logs.stream.level') : conf.get('logs.level'),
    fileLogLevel = conf.has('logs.file.level') ? conf.get('logs.file.level') : conf.get('logs.level'),
    errLogLevel = 'error';

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
  log.info('Environment set to ' + conf.get('env'));
  log.debug('Logging setup completed.');

  return log;
}

exports.logger = createLogger();