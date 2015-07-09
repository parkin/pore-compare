'use strict';

var gulp = require('gulp');
var connect = require('gulp-connect');
var sass = require('gulp-sass');
var babel = require('gulp-babel');
var svgSprite = require('gulp-svg-sprite');
var path = require('path');
var del = require('del');

var basePath = path.join(__dirname, '..');

var srcDir = path.join(basePath, 'app');
var destDir = path.join(basePath, 'build');
var stylesheetsDir = path.join(destDir, 'stylesheets');

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
    '!app/bower_components/octicons',
    'app/**/*.html',
    'app/favicon.ico',
    'app/assets/**/*',
    'app/data/**',
    'app/css/**',
    'app/images/**',
    'app/vendor/**',
    '!app/**/*.scss'
  ],
  octicons: [
    'app/bower_components/octicons/svg/*.svg'
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

var sassTask = function() {
  return gulp.src('app/stylesheets/main.scss')
    .pipe(sass())
    .pipe(gulp.dest(stylesheetsDir))
    .pipe(connect.reload());
}
gulp.task('sass', ['clean'], sassTask);
gulp.task('sass-watch', sassTask);

var octiconTask = function() {
  return gulp.src(paths.octicons)
    .pipe(svgSprite({
      mode: {
        defs: true,
      },
      shape: {
        id: {
          generator: "octicon-%s"
        }
      }
    }))
    .pipe(gulp.dest(destDir))
    .pipe(connect.reload())
}
gulp.task('octicons', ['clean'], octiconTask);
gulp.task('octicons-watch', octiconTask);

gulp.task('watch', function() {
  gulp.watch(paths.jsCodeToTranspile, ['transpile-watch']);
  gulp.watch(paths.toCopy, ['copy-watch']);
  gulp.watch(paths.octicons, ['octicons-watch']);
  gulp.watch('app/stylesheets/**/*.scss', ['sass-watch']);
})

gulp.task('build', ['transpile', 'octicons', 'sass', 'copy']);

gulp.task('connect', ['build', 'watch'], function() {
  connect.server({
    root: destDir,
    livereload: true
  });
});
