var gulp = require('gulp');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var ts = require('gulp-typescript');
var util = require('util');


// Create the type script project file
var tsProject = ts.createProject('tsconfig.json');

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

gulp.task('default', ['ts-code']);