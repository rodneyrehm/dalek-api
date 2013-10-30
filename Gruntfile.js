module.exports = function(grunt) {
  'use strict';
  
  var jshintOptions = grunt.file.readJSON('.jshintrc');
  jshintOptions.reporter = require('jshint-stylish');
  
  // project config
  grunt.initConfig({

    // linting
    jshint: {
      options: jshintOptions,
      target: ['Gruntfile.js', 'lib/**/*.js', 'test/**/*.js']
    }
  });

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.registerTask('lint', 'jshint');

};
