'use strict';

var path = require('path')
  , cluster = require('cluster')
  , worker = require('./worker')
  , logger = require('./logging').logger
  , conf = require('./config')
  , events = require('events')
  ;

module.exports = createServer;

// This module throws a 'ready' event
// when a worker has completed 
// initialization.
events.EventEmitter.call(createServer);
createServer.__proto__ = events.EventEmitter.prototype; // jshint ignore:line

function createServer() {

  var singleServer;
  function spawnWorker () {

    // create servers
    var server = worker.createServer();
    singleServer = server;

    server.on('error', function(err) {
      logger.error(err);
      server.close();
    });

    // start listening
    var port = conf.get('server.port');

    server.listen(port, function () {
      logger.info('%s listening at %s', server.name, server.url);
      createServer.emit('ready', server);
    });
  }

  function createCluster () {
    
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
      spawnWorker();
    }
  }

  function doRun (cluster) {
    // In production environment, create a cluster
    if (conf.get('server.cluster')) {
      createCluster();
    } else {
      spawnWorker();
    }
  }

  return {
    run: function() {
      doRun();
    },

    close: function(done) {
      if (cluster.workers.length > 0 ) {
        cluster.disconnect(done);
      } 
      else {
        singleServer.close(done);
      } 
    }
  };

}
