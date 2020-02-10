FROM node:12-slim
RUN apt update
RUN apt install -y --no-install-recommends build-essential autogen autoconf libtool automake libtool pkg-config libx11-dev libxtst-dev libxt-dev libx11-xcb-dev libxkbcommon-dev libxkbcommon-x11-dev libxinerama-dev libxkbfile-dev cmake
CMD ["bash"]
