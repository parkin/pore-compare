/**
 Runs npm install in the app directory.
*/

var childProcess = require('child_process');
var path = require('path');

var appPath = path.join(__dirname, '..', 'app');

var npmCommand = 'npm' + (process.platform === 'win32' ? '.cmd' : '');
var params = ['install'];

var install = childProcess.spawn(npmCommand, params, {
  cwd: appPath,
  env: process.env,
  stdio: 'inherit'
});
