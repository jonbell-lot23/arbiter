FROM node:20

# Install basic development tools
RUN apt update && apt install -y less man-db sudo

# Ensure default `node` user has access to `sudo`
ARG USERNAME=node
RUN echo $USERNAME ALL=\(root\) NOPASSWD:ALL > /etc/sudoers.d/$USERNAME \
    && chmod 0440 /etc/sudoers.d/$USERNAME

# Install ospeak and other dependencies
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    && pip3 install ospeak

# Set the default user
USER node

# Set the working directory
WORKDIR /workspaces/app 