'use strict';

var gulp = require('gulp');
var sass = require('gulp-sass');
var babel = require('gulp-babel');
var path = require('path');
var del = require('del');
var connect = require('gulp-connect');

var basePath = path.join(__dirname, '..');

var srcDir = path.join(basePath, 'app');
var destDir = path.join(basePath, 'build');

var paths = {
  jsCodeToTranspile: [
    'app/**/*.js',
    '!app/node_modules/**',
    '!app/bower_components/**',
    '!app/vendor/**'
  ],
  toCopy: [
    'app/node_modules/**',
    'app/bower_components/**',
    'app/**/*.html',
    'app/favicon.ico',
    'app/assets/**/*',
    'app/data/**',
    'app/css/**',
    'app/images/**',
    'app/vendor/**'
  ]
}

gulp.task('clean', function(cb) {
  del(destDir, cb);
});

var copyTask = function() {
  return gulp.src(paths.toCopy, {base: srcDir})
    .pipe(gulp.dest(destDir))
    .pipe(connect.reload());
}
gulp.task('copy', ['clean'], copyTask);
gulp.task('copy-watch', copyTask);

var transpileTask = function() {
  return gulp.src(paths.jsCodeToTranspile)
    .pipe(babel())
    .pipe(gulp.dest(destDir))
    .pipe(connect.reload());
}
gulp.task('transpile', ['clean'], transpileTask);
gulp.task('transpile-watch', transpileTask);

gulp.task('watch', function() {
  gulp.watch(paths.jsCodeToTranspile, ['transpile-watch']);
  gulp.watch(paths.toCopy, ['copy-watch']);
  // TODO Add sass support
})

gulp.task('build', ['transpile', 'copy']);

gulp.task('connect', ['build', 'watch'], function() {
  connect.server({
    root: destDir,
    livereload: true
  });
});
