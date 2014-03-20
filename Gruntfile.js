'use strict';

module.exports = function(grunt) {

  grunt.loadNpmTasks('grunt-forever');
  grunt.loadNpmTasks('grunt-mocha-test');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-mocha-istanbul');
  grunt.loadNpmTasks('grunt-env');

  grunt.initConfig({

    env: {
      dev: {
        NODE_ENV: grunt.option('env') || 'test' 
      }
    },

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
        src: ['test/**/*.js']
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
          src: ['test/**/*.js']
        }
      }
    },

    mocha_istanbul: {
      coverage: {
        src: 'test', // the folder, not the files,
        options: {
          reporter: 'spec',
          mask: '**/*Spec.js',
          check: {
            statements: '79',
            branches: '56',
            functions: '64',
            lines: '79'
          }
        }
      }
    },

    watch: {
      jshint: {
        files: ['main.js', 'app/**/*.js', '.jshintrc'],
        tasks: ['env', 'jshint:sources', 'mochaTest', 'mocha_istanblul', 'forever:server:restart']
      },
      jshintTest: { // test updates don't require a server restart.
        files: ['test/**/*.js', '.jshintrc-tests'],
        tasks: ['env', 'jshint:tests', 'mochaTest', 'mocha_istanbul']
      },
      grunt: {
        files: ['Gruntfile.js'],
        tasks: ['jshint:sources']
      }
    }

  });

  grunt.registerTask('coverage', ['env','mocha_istanbul']);
  grunt.registerTask('test', ['env','mochaTest' ]);

};