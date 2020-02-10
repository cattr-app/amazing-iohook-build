#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const mkdirp = require('mkdirp').sync;
const debug = require('debug')('iohook:builder');
const args = require('minimist')(process.argv.slice(2));

// Enable debug for all messages
debug.enabled = true;
debug('hello ✧ (^･o･^)ﾉ');

// Obtaining build configuration opts
const buildOpts = {

  runtimeVersion: args['runtime-version'] || process.versions.node,
  arch: process.arch,
  runtime: args.runtime || 'node'

};

// Getting current platform
let platform = (process.platform === 'win64') ? 'win' : process.platform;
platform += (process.arch.length === 3 && process.arch[0] === 'x') ? process.arch.substring(1) : process.arch;
debug(`target platform is ${platform}`);
debug(`building binary for ${buildOpts.runtime} v${buildOpts.runtimeVersion}`);

// Checking is libuiohook directory exists
if (!fs.existsSync(path.resolve(__dirname, '../libuiohook'))) {

  debug('we cannot find the libuiohook directory, so PLEASE DO SOMETHING!!!');
  process.exit(1);

}

// Put CMakeLists.txt file into libuiohook directory if neccessary
if (!fs.existsSync(path.resolve(__dirname, '../libuiohook/CMakeLists.txt'))) {

  debug('putting CMakeLists.txt file into libuiohook directory..');
  fs.copyFileSync(

    path.resolve(__dirname, '../CMakeLists-libuiohook.txt'),
    path.resolve(__dirname, '../libuiohook/CMakeLists.txt')

  );
  debug('.. ok!');

}

// Build path to cmake-js executable
const cmakePath = `"${path.join(__dirname, '../', 'node_modules', 'cmake-js', 'bin', 'cmake-js')}"`;

// Build argumets string
const cmakeOpts = [

  cmakePath,
  'rebuild',
  `--runtime-version=${buildOpts.runtimeVersion}`,
  `--target_arch=${buildOpts.arch}`,
  `--runtime=${buildOpts.runtime}`

];

// Clone environment variables
const cmakeEnvironment = Object.assign(process.env);

// Set compiler versions for builds on Windows
if (process.platform.indexOf('win') === 0) {

  /* eslint dot-notation: 0 */
  cmakeEnvironment['msvs_toolset'] = 15;
  cmakeEnvironment['msvs_version'] = 2017;

}

// It's time to go
debug('take your seats, we\'re ready to takeoff');
const buildProcess = spawn('node', cmakeOpts, { env: cmakeEnvironment, shell: true });

// Piping cmake-js output to this process
debug('<< cmake-js output starts here >>');
buildProcess.stdout.pipe(process.stdout);
buildProcess.stderr.pipe(process.stderr);

// Catching cmake-js exit
buildProcess.on('exit', code => {

  // Catch unsuccessfull status code
  if (code !== 0) {

    debug('we are fucked up, please check log above');
    process.exit(1);

  }

  // Copy built binary to dist folder
  debug('build successfull. stealing binary from the build directory..');

  // Checking full destination path
  // dist/[runtime]/[version]/iohook.[architecture].node
  mkdirp(path.resolve(__dirname, '../dist/', buildOpts.runtime, buildOpts.runtimeVersion));

  // Copy binary
  fs.copyFileSync(

    path.resolve(__dirname, '../build/Release/iohook.node'),
    path.resolve(__dirname, '../dist/', buildOpts.runtime, buildOpts.runtimeVersion, `iohook.${platform}.node`)

  );

  // Copy dll for win platform
  if (platform === 'win3264') {
    fs.copyFileSync(

      path.resolve(__dirname, '../build/Release/uiohook.dll'),
      path.resolve(__dirname, '../dist/', buildOpts.runtime, buildOpts.runtimeVersion, `uiohook.dll`)
  
    );
  }

  // Keep build directory
  if (args['keep-build-directory']) {

    debug('that\'s all, folks! Your .node file is:', path.resolve(__dirname, '../dist/', buildOpts.runtime, buildOpts.runtimeVersion, `iohook.${platform}.node`));
    if ((platform === 'win3264')) {
      debug('And here\'s your iohook.dll library, Mr. IWillNotInstallLinux:', path.resolve(__dirname, '../dist/', buildOpts.runtime, buildOpts.runtimeVersion, `uiohook.dll`));
    }
    process.exit(0);

  }

  // Removing build directory
  const cleaner = spawn('node', [cmakePath, 'clean'], { env: cmakeEnvironment, shell: true });
  cleaner.on('exit', code => {

    // Catch error
    if (code !== 0) {

      debug('error occured during cmake cleaning');
      process.exit(1);

    }

    debug('build directory cleaned');
    debug('that\'s all, folks! Your file is:', path.resolve(__dirname, '../dist/', buildOpts.runtime, buildOpts.runtimeVersion, `iohook.${platform}.node`));
    if ((platform === 'win3264')) {
      debug('And here\'s your iohook.dll library, Mr. IWillNotInstallLinux:', path.resolve(__dirname, '../dist/', buildOpts.runtime, buildOpts.runtimeVersion, `uiohook.dll`));
    }

  });

});
