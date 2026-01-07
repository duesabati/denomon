FROM debian:bookworm-slim AS base

ARG WORKSPACE_DIR="/home/developer/workspace"

ENV USERNAME=developer
ENV DENO_DIR="/home/${USERNAME}/.cache"

# Create `developer` user
RUN useradd --shell /bin/zsh --home /home/${USERNAME} ${USERNAME}

RUN apt-get update

RUN apt-get update \
  && apt-get -y install git-all \
  && apt-get -y install sudo \
  && apt-get -y install curl \
  && apt-get -y install unzip \
  && apt-get -y install wget \
  && apt-get -y install zsh \
  && apt-get -y install sqlite3 \
  && apt-get autoremove -y \
  && apt-get clean -y \
  && rm -rf /var/lib/apt/lists/*

# Add `developer` to `sudo` group
RUN usermod -aG sudo developer
RUN echo "developer ALL=(ALL) NOPASSWD: ALL" > /etc/sudoers.d/developer

ENV HOME=/home/${USERNAME}

RUN mkdir -p ${WORKSPACE_DIR}

RUN chown -R developer:developer /home/developer

# Create docker group
RUN groupadd docker
RUN usermod -aG docker developer

# Set Denomon environment variables
ENV DENOMON_WORKSPACE_DIR="${WORKSPACE_DIR}"
ENV DENOMON_DIR="${WORKSPACE_DIR}/.denomon"
ENV DENOMON_PATH="${WORKSPACE_DIR}/.denomon/bin/denomon"
ENV DENOMON_TMP_DIR="${DENOMON_DIR}/tmp"
ENV DENOMON_REPO_DIR="${DENOMON_DIR}/repo"
ENV DENOMON_KITS_CONFIG="${DENOMON_DIR}/configs.json"
ENV DENOMON_ARTIFACTS_DIR="${DENOMON_DIR}/artifacts"
ENV DENOMON_KITS_DIR="${DENOMON_DIR}/kits"
ENV DENOMON_ENVS_DIR="${WORKSPACE_DIR}/source/envs"
ENV DENOMON_APPS_DIR="${WORKSPACE_DIR}/source/apps"

COPY ./build/omz.sh /tmp/omz.sh
RUN chmod +x /tmp/omz.sh && /tmp/omz.sh
RUN echo 'export ZSH="/home/${USERNAME}/.oh-my-zsh"' >> /home/developer/.zshrc && \
  echo 'ZSH_THEME="robbyrussell"' >> /home/developer/.zshrc && \
  echo 'plugins=(git)' >> /home/developer/.zshrc && \
  echo 'setopt no_share_history' >> /home/developer/.zshrc && \
  echo 'unsetopt share_history' >> /home/developer/.zshrc && \
  echo 'source ${HOME}/.oh-my-zsh/oh-my-zsh.sh' >> /home/developer/.zshrc


USER $USERNAME

COPY --from=denoland/deno:bin-2.6.3 /deno /home/developer/.deno/bin/deno
ENV PATH="/home/developer/.deno/bin:${PATH}"

RUN mkdir -p /home/developer/.zsh

ENV TERM=xterm

# Set the default shell to bash rather than sh
ENV SHELL=/bin/zsh
