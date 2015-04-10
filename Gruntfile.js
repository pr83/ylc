module.exports = function(grunt) {

  grunt.initConfig({

    pkg: grunt.file.readJSON('package.json'),

    browserify: {
      dist: {
        files: {
          'tmp/yellowCode.js': ['src/yellowCode.js']
        }
      }
    },

    uglify: {
      dist: {
        src: 'tmp/yellowCode.js',
        dest: 'tmp/yellowCode.min.js'
      }
    },

    copy: {
      dist: {
        files: [
          {
            expand: true,
            flatten: true,
            src: ["resources/test/*", "tmp/yellowCode.min.js"],
            dest: "dist/tests"
          },
          {
            expand: true,
            flatten: true,
            src: ["resources/site/*", "tmp/yellowCode.min.js", "tmp/yellowCode.js"],
            dest: "dist/site"
          },
          {
            expand: true,
            flatten: true,
            src: ["resources/site/examples/*"],
            dest: "dist/site/examples"
          }
        ]
      }
    },

    replace: {
      dist: {
        src: ["dist/site/*.*"],
        overwrite: true,
        replacements: [
          {
            from: /\{\{VERSION\}\}/g,
            to: "<%= pkg.version %>"
          },
          {
            from: /\{\{YEAR\}\}/g,
            to: "2014-<%= grunt.template.today('yyyy') %>"
          },
          {
            from: /\{\{AUTHOR\}\}/g,
            to: "<%= pkg.author.name %>"
          }
        ]
      }
    },

    usebanner: {
      dist: {
        options: {
          position: 'top',
          banner:
              '/*\n' +
              '<%= pkg.description %>, version <%= pkg.version %> ' +
              '(<%= pkg.homepage %>). ' +
              'Distributed under the 2-clause BSD license ' +
              '(<%= pkg.homepage %>/LICENSE.txt). ' +
              'Internally uses JavaScript Expression Parser (JSEP) ' +
              ' 0.3.0 distributed under the MIT License (http://jsep.from.so/).' +
              '\n*/\n\n',
          linebreak: true
        },
        files: {
          src: ["tmp/yellowCode.min.js", "tmp/yellowCode.js"]
        }
      }
    },

    clean: {
      before_dist: {
        src: 'dist'
      },
      after_dist: {
        src: 'tmp'
      }
    }

  });

  grunt.loadNpmTasks('grunt-browserify');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-text-replace');
  grunt.loadNpmTasks('grunt-banner');
  grunt.loadNpmTasks('grunt-contrib-clean');

  grunt.registerTask(
      'default',
      [
        'clean:before_dist',
        'browserify',
        'uglify',
        'usebanner',
        'copy',
        'replace',
        'clean:after_dist'
      ]
  );

};
