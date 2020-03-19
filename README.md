Amazing IOHook build
======
Cross-platform iohook builder & signer.

## General instruction
```bash
# Build iohook for specific runtime
yarn build --runtime=electron --runtime-version=7.1.2

# Generate signatures for all redist assets
yarn sign --key=/path/to/sign/key.pem --recursive=dist/
```

## Build on Debian / Ubuntu
There are two ways to build iohook in Debian / Ubuntu.

### Docker
```bash
# Build image
npm run docker-build

# Create and log into container
npm docker-run

# < now you are inside of the container >
cd /iohook

# Install deps
npm i

# Build
npm run build -- --runtime=electron --runtime-version=7.1.2

# <here you can exit from the container with Ctrl+D or "exit">

# Sign redist with signing key on your host machine
npm run sign -- --key=/path/to/sign/key.pem --recursive=dist/
```
### On the host machine
```bash
# Ensure that Node.js >10 is already installed
# Install additional dependencies
apt install -y --no-install-recommends build-essential autogen autoconf libtool automake libtool pkg-config libx11-dev libxtst-dev libxt-dev libx11-xcb-dev libxkbcommon-dev libxkbcommon-x11-dev libxinerama-dev libxkbfile-dev cmake

# Install builder deps
npm i

# Build
npm run build -- --runtime=electron --runtime-version=7.1.2

# Sign
npm run sign -- --key=/path/to/sign/key.pem --recursive=dist/
```

## Windows
Ensure that Node.js is installed, as well as [CMake](https://cmake.org/)
```bash
# Install node-gyp system deps
npm install -g --production --debug windows-build-tools@4.0.0

# Then, reboot (I've spent about two hours investigating why cmakejs can't find MSVC Build Tools)
shutdown /r

# Install deps
npm i

# Build
npm run build -- --runtime=electron --runtime-version=7.1.2

# Sign
npm run sign -- --key=/path/to/sign/key.pem --recursive=dist/
```

## macOS
```bash
# Ensure that cmake is installed and available through CLI
# If cmake is installed as macOS application, but it is not accessible via terminal
# run the command below:
sudo "/Applications/CMake.app/Contents/bin/cmake-gui" --install

# Install required build tools via brew
brew install automake autoconf libtool pkg-config

# Install deps
npm i

# Build
npm run build -- --runtime=electron --runtime-version=7.1.2

# Sign
npm run sign -- --key=/path/to/sign/key.pem --recursive=dist/
```
