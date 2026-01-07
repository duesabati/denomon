FROM denoland/deno:alpine AS compiler

ARG WORKSPACE_DIR="/workspace"

WORKDIR ${WORKSPACE_DIR}

COPY .denomon .denomon
COPY source source
COPY deno.jsonc deno.jsonc

ENV DENOMON_REPO_DIR="${WORKSPACE_DIR}"
ENV DENOMON_PATH="${WORKSPACE_DIR}/bin/denomon"

ENV SOURCE="${WORKSPACE_DIR}/source/apps/cli/main.ts"

RUN deno compile \
  --no-lock \
  --allow-all \
  --output=${DENOMON_PATH} \
  /workspace/source/apps/cli/main.ts

FROM debian:bookworm-slim AS base

# Setup user and directories to ease permissions management
ARG USERNAME=developer

RUN useradd --create-home ${USERNAME}

ARG WORKSPACE_DIR="/home/${USERNAME}/workspace"

ENV HOME=/home/${USERNAME}
RUN mkdir -p ${WORKSPACE_DIR} \
  && chown -R ${USERNAME}:${USERNAME} ${HOME}

ENV DENO_DIR="/home/${USERNAME}/.cache"
COPY --from=denoland/deno:bin-2.6.3 /deno "/home/${USERNAME}/.deno/bin/deno"
ENV PATH="/home/${USERNAME}/.deno/bin:${PATH}"


# Set Denomon environment variables
ENV DENOMON_PATH="/usr/local/bin/denomon"

ENV DENOMON_WORKSPACE_DIR="${WORKSPACE_DIR}"
ENV DENOMON_DIR="${WORKSPACE_DIR}/.denomon"
ENV DENOMON_TMP_DIR="${DENOMON_DIR}/tmp"
ENV DENOMON_REPO_DIR="${DENOMON_DIR}/repo"
ENV DENOMON_KITS_CONFIG="${DENOMON_DIR}/configs.json"
ENV DENOMON_ARTIFACTS_DIR="${DENOMON_DIR}/artifacts"
ENV DENOMON_KITS_DIR="${DENOMON_DIR}/kits"
ENV DENOMON_ENVS_DIR="${WORKSPACE_DIR}/source/envs"
ENV DENOMON_APPS_DIR="${WORKSPACE_DIR}/source/apps"

# Install Denomon binary
COPY --from=compiler --chown=${USERNAME}:${USERNAME} "/workspace/bin/denomon" "${DENOMON_PATH}"
ENV PATH="/usr/local/bin:${PATH}"

USER $USERNAME

WORKDIR ${WORKSPACE_DIR}

ENV TERM=xterm

