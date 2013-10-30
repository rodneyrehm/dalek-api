module.exports = function(grunt) {
  'use strict';
  
  var jshintOptions = grunt.file.readJSON('.jshintrc');
  jshintOptions.reporter = require('jshint-stylish');
  
  // project config
  grunt.initConfig({

    mochaTest: {
      src: ['test/**/test.*.js']
    },

    // linting
    jshint: {
      options: jshintOptions,
      target: ['Gruntfile.js', 'lib/**/*.js', 'test/**/*.js']
    }
  });

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-mocha-test');
  
  grunt.registerTask('lint', 'jshint');
  grunt.registerTask('test', 'mochaTest');

};
