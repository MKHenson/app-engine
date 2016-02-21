var gulp = require('gulp');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var ts = require('gulp-typescript');
var util = require('util');
var inject = require('gulp-inject');
var sass = require('gulp-sass');
var filter = require('gulp-filter');
var print = require('gulp-print');

// CONFIG
// ==============================
var outDir = "../client/resources";

// Create the type script project file
var tsProject = ts.createProject('tsconfig.json', { sortOutput: true });
var target = gulp.src('./lib/index.html');

// Adds the relevant bower files to the index html
gulp.task('bower', function() {

    var f = filter(['**/*.js']);
    var sources = gulp.src([
        './bower_components/jquery/dist/jquery.js',
        './bower_components/jquery.hotkeys/jquery.hotkeys.js',
        './bower_components/jquery-mousewheel/jquery.mousewheel.js',
        './bower_components/jstepper/jquery.jstepper.js',
        './bower_components/jquery.scrollTo/jquery.scrollTo.js',
        './bower_components/jquery-ui/ui/jquery.ui.core.js',
        './bower_components/jquery-ui/ui/jquery.ui.widget.js',
        './bower_components/jquery-ui/ui/jquery.ui.mouse.js',
        './bower_components/jquery-ui/ui/jquery.ui.draggable.js',
        './bower_components/jquery-ui/ui/jquery.ui.droppable.js',
        './bower_components/jquery-ui/ui/jquery.ui.resizable.js',
        './bower_components/es6-promise/es6-promise.js',
        './bower_components/google-recaptcha-api/index.js',
        './bower_components/jscolor/*.*',
        './bower_components/ace/src-noconflict/*.js',
        './bower_components/ace/src-noconflict/snippets/javascript.js',
        './bower_components/ace/src-noconflict/snippets/typescript.js',
        './bower_components/ace/src-noconflict/snippets/html.js',
        './bower_components/ace/src-noconflict/snippets/json.js',
        './bower_components/google-recptcha-api/index.js'
    ], { base: "." } ).pipe(gulp.dest(outDir));



    // Add each of the bower files as a reference
    return target.pipe(inject(sources.pipe(f), {
        starttag: '<!-- inject:bower -->',
            read: false,
            relative: true
        }))
        .pipe(gulp.dest(outDir));
});

// Adds all HTML files to the temp/index.html
gulp.task('html', function() {
    var sources = gulp.src(['./lib/**/*.html', '!./lib/**/index.html']);

    return target.pipe(inject(sources, {
        starttag: '<!-- inject:html -->',
        transform: function (filePath, file) {
            return file.contents.toString('utf8')
        }}))
        .pipe(gulp.dest(outDir));
});

// Compile all sass files to css and add to the index html
gulp.task('css', function() {

    // Compile all sass files into temp/css
    var sassFiles = gulp.src('./lib/**/*.scss')
        .pipe(sass().on('error', sass.logError))
        .pipe(gulp.dest(outDir + '/css'));

    // Add each css file in temp to the index in temp/index.html
    return target.pipe( inject(sassFiles, {
            starttag: '<!-- inject:css -->',
            read: false,
            addRootSlash: false,
            relative: true
         }))
        .pipe(gulp.dest(outDir));
});

// Concatenates and builds all TS code into a single file
gulp.task('ts-code', function() {

    return tsProject.src()
        .pipe(ts(tsProject))
        .pipe(gulp.dest(outDir + '/js'));
});

// Concatenates and builds all TS code into a single file
gulp.task('ts-code-release', function() {

    var jsFiles = tsProject.src()
        .pipe(ts(tsProject))
        .pipe(uglify())
        .pipe(concat('application.js'))
        .pipe(gulp.dest(outDir + '/js'));

    // Add each css file in temp to the index in temp/index.html
    return target.pipe( inject(jsFiles, {
            starttag: '<!-- inject:js -->',
            read: false,
            addRootSlash: false,
            relative: true
         }))
        .pipe(gulp.dest(outDir));
});

gulp.task('watch', function () {
    gulp.watch('lib/**/*.ts', ['ts-code']);
});

gulp.task('build-all', ['html', 'css', 'ts-code', 'bower']);