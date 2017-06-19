const
    MINIFIED_EXTENSION = '.min.js';

const
    fs = require('fs'),
    _ = require('lodash'),
    glob = require('glob'),
    gulp = require('gulp'),
    source = require('vinyl-source-stream'),
    buffer = require('vinyl-buffer'),
    browserify = require('browserify'),
    watchify = require('watchify'),
    browserifyDerequire = require('browserify-derequire'),
    gulpSourcemaps = require('gulp-sourcemaps'),
    gulpUglify = require('gulp-uglify'),
    rename = require('gulp-rename'),
    zip = require('gulp-zip'),
    include = require('gulp-include'),
    sass = require('gulp-sass'),
    gulpReplace = require('gulp-replace'),
    gulpHeader = require('gulp-header'),
    yargs = require('yargs');

const
    PKG = JSON.parse(fs.readFileSync('./package.json')),
    COMMENT =
        '/*\n' +
        '<%= pkg.description %>, version <%= pkg.version %> ' +
        '(<%= pkg.homepage %>). ' +
        'Distributed under the <%= pkg.ylc.licenseName %>. ' +
        'Internally uses JavaScript Expression Parser (JSEP) ' +
        ' 0.3.0 distributed under the MIT License (http://jsep.from.so/).' +
        '\n*/\n\n';

const BROWSERIFY_OPTIONS = {
    cache: {},
    packageCache: {},
    plugin: [watchify, browserifyDerequire],
    debug: true
};

gulp.task(
    'compileTestsJs',
    function() {
        getTestPaths();
        return browserifyModule(
            getTestPaths(),
            'test/dest',
            'all.js'
        );
    }
);

function getTestPaths() {
    if (yargs.argv.test) {
        return ['./test/src/' + yargs.argv.test + '.js'];
    } else {
        return resolveGlobPaths(['./test/src/unit/*.js', './test/src/ui/*.js']);
    }
}

gulp.task(
    'compileDistributionJs',
    function() {
        return browserifyModule('./src/yellowCode.js', 'dist/site/js', 'yellowCode.js');
    }
);

gulp.task(
    'compileSiteJs',
    function() {
        return browserifyModule('./resources/site/js-src/main.js', 'dist/site/js', 'main.js');
    }
);

gulp.task(
    'zipDistribution',
    ['compileDistributionJs'],
    function() {
        return gulp.src(['./dist/site/js/yellowCode.js', './dist/site/js/yellowCode.min.js'])
            .pipe(zip('yellowCode.zip'))
            .pipe(gulp.dest('dist/site/dist'))
    }
);

gulp.task(
    'processHtml',
    function() {
        return gulp.src(['./resources/site/*.html', './resources/site/examples/*.html'], {base: './resources/site'})
            .pipe(include())
            .pipe(gulpReplace(/{{VERSION}}/g, PKG.version))
            .pipe(gulp.dest('dist/site'));
    }
);
gulp.watch(['./resources/site/*.html', './resources/site/examples/*.html'], ['processHtml']);

gulp.task(
    'compileSiteSass',
    function() {
        return gulp.src('resources/site/sass/main.scss')
            .pipe(sass())
            .pipe(gulp.dest('dist/site/css'));
    }
);
gulp.watch(['resources/site/sass/**/*'], ['compileSiteSass']);

gulp.task(
    'copySiteJs',
    function() {
        return gulp.src('resources/site/js/*').pipe(gulp.dest('dist/site/js'));
    }
);

gulp.task(
    'copySiteCss',
    function() {
        return gulp.src('resources/site/css/*').pipe(gulp.dest('dist/site/css'));
    }
);

gulp.task(
    'copySiteFont',
    function() {
        return gulp.src('resources/site/font/**/*').pipe(gulp.dest('dist/site/font'));
    }
);

gulp.task('copySiteStaticAssets', ['copySiteJs', 'copySiteCss', 'copySiteFont']);

gulp.task('default', ['compileTestsJs', 'compileDistributionJs', 'compileSiteJs', 'zipDistribution', 'processHtml', 'compileSiteSass', 'copySiteStaticAssets']);

function resolveGlobPaths(globPaths) {
    var allFiles = [];

    _.forEach(
        globPaths,
        function(globPath) {
            allFiles = allFiles.concat(allFiles, glob.sync(globPath));
        }
    );

    return allFiles;
}

function browserifyModule(entryFilePath, destinationDirectory, destinationFileName) {
    var browserifyBundler =
        browserify(entryFilePath, BROWSERIFY_OPTIONS)
            .transform("brfs")
            .on('error', console.error.bind(console))
            .on('update', bundle);

    return bundle();

    function bundle() {
        return browserifyBundler
            .bundle()
            .pipe(source(destinationFileName))
            .pipe(buffer())
            .pipe(gulpSourcemaps.init({loadMaps: true}))
            .pipe(gulp.dest(destinationDirectory))
            .pipe(gulpUglify())
            .pipe(gulpHeader(COMMENT, {pkg: PKG}))
            .pipe(rename({extname: MINIFIED_EXTENSION}))
            .pipe(gulpSourcemaps.write('./'))
            .pipe(gulp.dest(destinationDirectory));
    }

}