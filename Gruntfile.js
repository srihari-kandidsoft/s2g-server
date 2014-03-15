'use strict';

module.exports = function(grunt) {

  grunt.loadNpmTasks('grunt-forever');
  grunt.loadNpmTasks('grunt-mocha-test');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-mocha-istanbul');

  grunt.initConfig({

    //     "start": "./node_modules/.bin/forever start --append -o ./forever.log -e ./forever.log server.js",
    forever: {
      server: {
        options: {
          index: 'main.js',
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
          src: ['Gruntfile.js', 'app/**/*.js']
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

    mocha_istanbul: {
      coverage: {
        src: 'spec', // the folder, not the files,
        options: {
          reporter: 'spec',
          mask: '**/*Spec.js',
          check: {
            lines: '81',
            statements: '79',
            branches: '51',
            functions: '81'
          }
        }
      }
    },

    watch: {
      jshint: {
        files: ['app/**/*.js', '.jshintrc'],
        tasks: ['jshint:sources', 'coverage', 'forever:server:restart']
      },
      jshintTest: { // test updates don't require a server restart.
        files: ['spec/**/*.js', '.jshintrc-tests'],
        tasks: ['jshint:tests', 'coverage']
      },
      grunt: {
        files: ['Gruntfile.js'],
        tasks: ['jshint:sources']
      }
    }

  });

  grunt.registerTask('coverage', ['mocha_istanbul']);
};