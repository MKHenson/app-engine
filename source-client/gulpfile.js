var gulp = require('gulp');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var ts = require('gulp-typescript');
var util = require('util');
var inject = require('gulp-inject');

// Create the type script project file
var tsProject = ts.createProject('tsconfig.json');

// Adds all HTML files to the index html
gulp.task('html', function() {
    var target = gulp.src('./lib/index.html'); 
    
    // It's not necessary to read the files (will speed up things), we're only after their paths:
    var sources = gulp.src(['./lib/**/*.html', '!./lib/**/index.html']);

    return target.pipe(inject(sources, {
        starttag: '<!-- inject:html -->',
        transform: function (filePath, file) {
            // return file contents as string
            return file.contents.toString('utf8')
        }}))
        .pipe(gulp.dest('./temp/html'));
});

// Concatenates and builds all TS code into a single file
gulp.task('ts-code', function() {

    return tsProject.src()
        .pipe(ts(tsProject))
        .pipe(uglify())
        .pipe(concat('application.js'))
        .pipe(gulp.dest('../client/resources'));
});

gulp.task('watch', function () {
    gulp.watch('lib/**/*.ts', ['ts-code']);
});

gulp.task('build-all', ['ts-code', 'html']);