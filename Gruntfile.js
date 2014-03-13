'use strict';

module.exports = function(grunt) {

  grunt.loadNpmTasks('grunt-forever');
  grunt.loadNpmTasks('grunt-mocha-test');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');

  grunt.initConfig({

    //     "start": "./node_modules/.bin/forever start --append -o ./forever.log -e ./forever.log server.js",
    forever: {
      server: {
        options: {
          index: 'server.js',
          logFile: 'forever.log',
          errFile: 'forever.log',
          command: 'node'
        }
      }
    },

    mochaTest: {
      test: {
        options: {
          reporter: 'spec'
        },
        src: ['spec/**/*.js']
      }
    },

    jshint: {
      sources: {
        options: {
          reporter: require('jshint-stylish'),
          jshintrc: '.jshintrc'
        },
        files: {
          src: ['Gruntfile.js', 'app/**/*.js' ]
        }
      },
      tests: {
        options: {
          reporter: require('jshint-stylish'),
          jshintrc: '.jshintrc-tests'
        },
        files: {
          src: ['spec/**/*.js']
        }
      }
    },

    watch: {
      jshint: {
        files: ['app/**/*.js', '.jshintrc'],
        tasks: ['jshint:sources', 'mochaTest' , 'forever:server:restart' ]
      },
      jshintTest: { // test updates don't require a server restart.
        files: ['spec/**/*.js', '.jshintrc-tests'],
        tasks: ['jshint:tests', 'mochaTest']
      },
      grunt: {
        files: ['Gruntfile.js'],
        tasks: ['jshint:sources']
      }
    }

  });

};