module.exports = function(grunt) {

  grunt.initConfig({

    browserify: {
      dist: {
        files: {
          'colorWidget.all.js': ['colorWidget.js']
        },
        options: {
          transform: ['html2js-browserify']
        }
      }
    }

  });

  grunt.loadNpmTasks('grunt-browserify');

  grunt.registerTask(
      'default',
      [
        'browserify',
      ]
  );

};
