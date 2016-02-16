var gulp = require('gulp');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var ts = require('gulp-typescript');
var util = require('util');
var inject = require('gulp-inject');
var sass = require('gulp-sass');

// Create the type script project file
var tsProject = ts.createProject('tsconfig.json');

// Adds all HTML files to the temp/index.html
gulp.task('html', function() {
    var target = gulp.src('./lib/index.html');
    var sources = gulp.src(['./lib/**/*.html', '!./lib/**/index.html']);

    return target.pipe(inject(sources, {
        starttag: '<!-- inject:html -->',
        transform: function (filePath, file) {
            return file.contents.toString('utf8')
        }}))
        .pipe(gulp.dest('./temp'));
});

// Compile all sass files to css and add to the index html
gulp.task('css', function() {

    // Compile all sass files into temp/css
    var target = gulp.src('./temp/index.html');
    var sassFiles = gulp.src('./lib/**/*.scss')
        .pipe(sass().on('error', sass.logError))
        .pipe(gulp.dest('./temp/css'));

    // Add each css file in temp to the index in temp/index.html
    return target.pipe( inject(sassFiles, {
            starttag: '<!-- inject:css -->',
            read: false,
            addRootSlash: false,
            relative: true
         }))
        .pipe(gulp.dest('./temp'));
});

// Concatenates and builds all TS code into a single file
gulp.task('ts-code', function() {

    var target = gulp.src('./temp/index.html');

    var jsFiles = tsProject.src()
        .pipe(ts(tsProject))
        //.pipe(uglify())
        //.pipe(concat('application.js'))
        .pipe(gulp.dest('./temp/js'));

    // Add each css file in temp to the index in temp/index.html
    return target.pipe( inject(jsFiles, {
            starttag: '<!-- inject:js -->',
            read: false,
            addRootSlash: false,
            relative: true
         }))
        .pipe(gulp.dest('./temp'));
});

gulp.task('watch', function () {
    gulp.watch('lib/**/*.ts', ['ts-code']);
});

gulp.task('build-all', ['html', 'css', 'ts-code']);