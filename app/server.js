/*global module:true, require:true, console:true, process:true */

'use strict';

module.exports = function(params) {

  // if process.env.NODE_ENV has not been set, default to development
  var NODE_ENV = params.env || 'default';

  var path = require('path')
    , cluster = require('cluster')
    , config = require('yaml-config')
    , worker = require('./worker')
    , logging = require('./logging');

  params["settings"] = config.readConfig(path.join(__dirname, '../config.yaml'), NODE_ENV);

  function spawnWorker (logger) {

    // create servers
    var server = worker.createServer(logger);

    server.on('error', function(err) {
      logger.error(err);
      server.close();
    });

    // start listening
    var port = params.port || process.env.PORT || params.settings.server.port || 8000;

    server.listen(port, function () {
      logger.info('%s listening at %s', server.name, server.url);
    });
  }

  function createCluster (logger) {
    
    // Set up cluster and start servers
    if (cluster.isMaster) {
      var numCpus = require('os').cpus().length;

      logger.info('Starting master, pid ' + process.pid + ', spawning ' + numCpus + ' workers');

      // fork workers
      for (var i = 0; i < numCpus; i++) {
        cluster.fork();
      }

      cluster.on('listening', function (worker) {
        logger.info('Worker ' + worker.id + ' started');
      });

      // if a worker dies, respawn
      cluster.on('exit', function (worker, code, signal) {
        logger.warn('Worker ' + worker.id + ' died, restarting...');
        cluster.fork();
      });

      cluster.on('disconnect', function (worker) {
        logger.warn('Worker ' + worker.id + ' disconnected.');
      });
    } 
    // Worker processes
    else {
      spawnWorker(logger);
    }
  }

  function doRun (cluster) {

    // Set up logging
    var logger = logging.createLogger(params.settings.logs, NODE_ENV);

    // In production environment, create a cluster
    if (NODE_ENV === 'production' || Boolean(params.settings.server.cluster) || cluster ) {
      createCluster(logger);
    }
    else {
      spawnWorker(logger);
    }

  }

  return {
    run: function() {
      doRun();
    }
  };

};
