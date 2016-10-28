module.exports = function(grunt) {

  grunt.initConfig({

    pkg: grunt.file.readJSON('package.json'),

    browserify: {
      dist: {
        files: {
          'tmp/yellowCode.js': ['src/yellowCode.js'],
          'tmp/nakedYellowCode.js': ['src/nakedYellowCode.js']
        }
      },
      tests: {
        files: {
          'test/dest/all.js':
              grunt.option('testFile') ?
                  [grunt.option('testFile')] :
                  ['test/src/unit/*.js', 'test/src/ui/*.js']
        },
        options: {
          transform: ['brfs']
        }
      }
    },

    uglify: {
      dist: {
        src: 'tmp/yellowCode.js',
        dest: 'tmp/yellowCode.min.js',
        options: {
          sourceMap: true
        }
      }
    },

    copy: {
      dist: {
        files: [
          {
            expand: true,
            cwd: "resources/test",
            src: ["**"],
            dest: "dist/tests"
          },
          {
            expand: true,
            flatten: true,
            src: [
              "tmp/yellowCode.min.js",
              "tmp/yellowCode.min.js.map",
              "tmp/nakedYellowCode.js"
            ],
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
      },
      dummyUglify: {
        files: [
          {
            src: ['tmp/yellowCode.js'],
            dest: 'tmp/yellowCode.min.js'
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
          },
          {
            from: /\{\{LICENSE_URL\}\}/g,
            to: "<%= pkg.ylc.licenseUrl %>"
          },
          {
            from: /\{\{LICENSE_NAME\}\}/g,
            to: "<%= pkg.ylc.licenseName %>"
          },
          {
            from: /\{\{EMAIL\}\}/g,
            to: "<%= pkg.author.email %>"
          },
          {
            from: /\{\{REPOSITORY_URL\}\}/g,
            to: "<%= pkg.repository.url %>"
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
              'Distributed under the <%= pkg.ylc.licenseName %> ' +
              '(<%= pkg.ylc.licenseUrl %>). ' +
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
    },

    watch: {
      tests: {
        files: [
          'src/**',
          'test/src/**',
          'test/resources/**'
        ],
        tasks: ['browserify:tests']
      }
    }

  });

  grunt.loadNpmTasks('grunt-browserify');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-text-replace');
  grunt.loadNpmTasks('grunt-banner');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-watch');

  grunt.registerTask(
      'default',
      [
        'clean:before_dist',
        'browserify',
        'uglify',
        //'copy:dummyUglify',
        'usebanner',
        'copy',
        'replace',
        'clean:after_dist',
        'browserify:tests'
      ]
  );

};
