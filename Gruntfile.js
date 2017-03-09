module.exports = function (grunt) {

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
                    'test/dest/all.js': grunt.option('testFile') ?
                        [grunt.option('testFile')] :
                        ['test/src/unit/*.js', 'test/src/ui/*.js']
                },
                options: {
                    transform: ['brfs']
                }
            },
            site: {
                files: {
                    "dist/site2/js/main.js": "resources/site2/js-src/main.js"
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
                        src: ["tmp/yellowCode.zip"],
                        dest: "dist/site2/dist"
                    },
                    {
                        expand: true,
                        flatten: true,
                        src: ["tmp/yellowCode.min.js"],
                        dest: "dist/site2/js"
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
            site2: {
                files: [
                    {
                        expand: true,
                        flatten: true,
                        src: ["resources/site2/examples/*"],
                        dest: "dist/site2/examples"
                    },

                    {
                        expand: true,
                        flatten: true,
                        src: ["resources/site2/js/*"],
                        dest: "dist/site2/js"
                    },

                    {
                        expand: true,
                        flatten: true,
                        src: ["resources/site2/css/*"],
                        dest: "dist/site2/css"
                    },

                    {
                        cwd: "resources/site2/font",
                        expand: true,
                        src: "**/*",
                        dest: "dist/site2/font"
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

        compress: {
            main: {
                options: {
                    archive: "tmp/yellowCode.zip",
                    mode: "zip"
                },
                files: [
                    {
                        cwd: "tmp",
                        expand: true,
                        src: ["yellowCode.min.js", "yellowCode.js"]
                    }
                ]
            }
        },

        includes: {
            examples: {
                src: ["resources/site2/examples/*.html"],
                dest: "dist/site2/examples",
                flatten: true,
                cwd: '.'
            },
            files: {
                src: ["resources/site2/*.html"],
                dest: "dist/site2",
                flatten: true,
                cwd: '.'
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
            },
            site2: {
                src: ["dist/site2/*.*"],
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
                    banner: '/*\n' +
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

        sass: {
            options: {
                sourceMap: true
            },
            dist: {
                files: {
                    'dist/site2/css/main.css': 'resources/site2/sass/main.scss'
                }
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
    grunt.loadNpmTasks('grunt-includes');
    grunt.loadNpmTasks('grunt-sass');
    grunt.loadNpmTasks('grunt-contrib-compress');

    grunt.registerTask(
        'default',
        [
            'clean:before_dist',
            'browserify',
            'uglify',
            //'copy:dummyUglify',
            'usebanner',
            "compress",
            'copy',
            'replace',
            'browserify:tests',
            'includes',
            "copy:site2", "includes", "sass","replace:site2", "browserify:site"/*,
            'clean:after_dist'*/
        ]
    );

    grunt.registerTask("site2", ["copy:site2", "includes", "sass", "compress", "replace:site2", "browserify:site"]);

};
