'use strict';

var convict = require('convict');

var conf = convict({
  env: {
    doc: 'The application environment.',
    format: ['production', 'development', 'test', 'heroku'],
    default: 'test',
    env: 'NODE_ENV'
  },
  server: {
    port: {
      doc: 'The port to bind.',
      format: 'port',
      default: '8000',
      env: 'PORT'
    },
    cluster: {
      doc: 'Run in cluster mode',
      format: Boolean,
      default: false,
      env: 'CLUSTER'
    }
  },
  logs: {
    dir: 'logs',
    level: {
      doc: 'The global log level',
      format: ['debug', 'info', 'warn', 'error'],
      default: 'debug',
      env: 'LOG_LEVEL'
    }
  },
  mysql: {
    host: 'share2give-db-instance.caobw7uurd0v.us-west-1.rds.amazonaws.com',
    user: 'share2Give',
    password: 'share2give2014',
    database: 'share2give_db' 
  },
  mongo: {
    db: 'mongodb://s2g-server:share2give@oceanic.mongohq.com:10094/roquefort'
  }
});

var env = conf.get('env');
conf.loadFile('./app/config/'+ env + '.json');
conf.validate();
module.exports = conf;