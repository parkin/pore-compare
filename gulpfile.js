'use strict';

/*** Add tasks from tasks folder */
require('./tasks/build');
/*** tasks from tasks folder */

var gulp = require('gulp');
var ghPages = require('gulp-gh-pages');
var child = require('child_process');

/**
 * Return a timestamp with the format "m/d/yy h:MM:ss TT"
 * @type {Date}
 */

function timeStamp() {
  // Create a date object with the current time
  var now = new Date();
  // Create an array with the current month, day and time
  var date = [now.getMonth() + 1, now.getDate(), now.getFullYear()];
  // Create an array with the current hour, minute and second
  var time = [now.getHours(), now.getMinutes(), now.getSeconds()];
  // Determine AM or PM suffix based on the hour
  var suffix = (time[0] < 12) ? "AM" : "PM";
  // Convert hour from military time
  time[0] = (time[0] < 12) ? time[0] : time[0] - 12;
  // If hour is 0, set it to 12
  time[0] = time[0] || 12;
  // If seconds and minutes are less than 10, add a zero
  for (var i = 1; i < 3; i++) {
    if (time[i] < 10) {
      time[i] = "0" + time[i];
    }
  }
  // Return the formatted string
  return date.join("/") + " " + time.join(":") + " " + suffix;
}

var paths = {
  toDeploy: [
    './build/**/*',
    'README.md'
  ]
}

gulp.task('deploy', ['build'], function() {
  var gitMessage;
  if(typeof child.execSync === "function") {
    // git message: "[short hash] :: [previous commit message]"
    gitMessage = child.execSync('git log -1 --pretty=format:\'%h :: %B\'', {
      encoding: 'utf8'
    }).replace(/\r?\n/g, ""); // replace newlines with nothing
  } else {
    // fallback to nothing
    gitMessage = '';
  }
  // commit message: "[Timestamp] :: [gitMessage]"
  var message = timeStamp() + ' :: ' + gitMessage;
  return gulp.src(paths.toDeploy)
    .pipe(ghPages({
      message: message
    }))
});
