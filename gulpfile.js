var gulp = require('gulp');
var ghPages = require('gulp-gh-pages');

var paths = {
  toDeploy: [
    './app/**/*',
    'README.md'
  ]
}

gulp.task('deploy', function() {
  return gulp.src(paths.toDeploy)
    .pipe(ghPages())
});
