#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const readdir = require('recursive-readdir');
const debug = require('debug')('iohook:signer');
const args = require('minimist')(process.argv.slice(2));

// Checking help request
if (

  typeof args.help !== 'undefined' ||
  typeof args.key !== 'string' ||
  (typeof args.recursive === 'undefined' && typeof args.file === 'undefined')

) {

  console.log('\n', 'Signs a built binary file');
  console.log('  --key=/path/to/keyfile', '\t\t', 'Path to keyfile in PEM format (required)');
  console.log('  --recursive=/path/to/directory', '\t', 'Sign all files in this directory recursively');
  console.log('  --file=/path/to/file.node', '\t\t', 'Sign single file');
  console.log('  --no-write-signature', '\t\t\t', 'Print signature in stdout, instead of saving into .sig file', '\n');
  process.exit(0);

}

// Enable log
debug.enabled = (typeof args['no-write-signature'] === 'undefined');
debug('hey (^._.^)ﾉ');

// Reading key file
let key = '';
try {

  key = fs.readFileSync(path.resolve(args.key), 'utf-8');

} catch (error) {

  debug('shit happened during key file read:', error.message);
  process.exit(1);

}

debug('key file read completed');

// Signing a single file
if (typeof args.file === 'string') {

  // Resolving path and checking existance
  const filePath = path.resolve(args.file);
  if (!fs.existsSync(filePath)) {

    debug('cannot find file:', filePath);
    process.exit(1);

  }

  // Signing file
  const signature = crypto.createSign('sha256').update(fs.readFileSync(filePath)).sign(key).toString('base64');

  // Saving signature into stdout
  if (typeof args['no-write-signature'] !== 'undefined') {

    console.log(signature);
    process.exit(0);

  }

  // Saving signature into file
  try {

    fs.writeFileSync(`${filePath}.sig`, signature, 'utf-8');

  } catch (error) {

    debug('error occured during signature writing: ', error);
    process.exit(1);

  }

  debug('saved signature into ', `${filePath}.sig`);

}

if (typeof args.recursive === 'string') {

  // Resolving path and checking path existence
  const dirPath = path.resolve(args.recursive);
  if (!fs.existsSync(dirPath)) {

    debug('cannot find path:', dirPath);
    process.exit(1);

  }

  // Listing all files recursively
  readdir(dirPath, ['.*', '*.sig'], (err, files) => {

    // Catch error
    if (err) {

      debug('error occured during directory enlisting:', err.message);
      process.exit(1);

    }

    // Iterate over file paths
    files.forEach(filePath => {

      // Calculating file signature
      const signature = crypto.createSign('sha256').update(fs.readFileSync(filePath)).sign(key).toString('base64');

      // Saving signature into file
      try {

        fs.writeFileSync(`${filePath}.sig`, signature, 'utf-8');
        debug('signature saved:', `${filePath}.sig`);

      } catch (error) {

        debug('error occured during signature writing: ', error);
        process.exit(1);

      }

    });

  });

}
