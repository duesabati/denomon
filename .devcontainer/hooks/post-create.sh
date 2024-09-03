#!/bin/sh

USER=${USERNAME:-developer}
WORKSPACE=${WORKSPACE:-/home/${USER}/workspace}

mkdir -p /home/${USER}/workspace/.denomon/bin

if [ -d "/home/${USER}/workspace/.denomon/repo" ]; then
    # Check if there is something to pull, if so, pull it and recompile
    echo ".denomon/repo already exists, skipping clone."

    if [ -n "$(git -C /home/${USER}/workspace/.denomon/repo status --porcelain)" ]; then
        echo "There are uncommitted changes in .denomon/repo, skipping pull."
    elif [ "$(git -C /home/${USER}/workspace/.denomon/repo rev-parse HEAD)" != "$(git -C /home/${USER}/workspace/.denomon/repo ls-remote origin -h refs/heads/main | cut -f1)" ]; then
        echo "There are changes to pull in .denomon/repo, pulling..."
        git -C /home/${USER}/workspace/.denomon/repo pull origin main
        deno compile --no-lock --allow-all --config=/home/${USER}/workspace/.denomon/repo/source/apps/cli/deno.json --output=/home/${USER}/workspace/.denomon/bin/denomon /home/${USER}/workspace/.denomon/repo/source/apps/cli/main.ts
    else
        echo ".denomon/repo is up to date, no pull needed."
    fi
else
    git clone https://github.com/duesabati/denomon.git .denomon/repo
    deno compile --no-lock --allow-all --config=.denomon/repo/source/apps/cli/deno.json --output=.denomon/bin/denomon .denomon/repo/source/apps/cli/main.ts
fi

mkdir -p "${WORKSPACE}/source/apps"
mkdir -p "${WORKSPACE}/source/libs"
mkdir -p "${WORKSPACE}/source/core"
mkdir -p "${WORKSPACE}/source/ship"

echo "export PATH=\$PATH:/home/${USER}/workspace/.denomon/bin" >> /home/${USER}/.zshrc

# Configure git to use the correct email and username by prompting the user
GIT_USERNAME=$(git config user.name)
GIT_USEREMAIL=$(git config user.email)

if [ -z "$GIT_USERNAME" ]; then
    echo "Enter your name for git commits:"
    read -r GIT_USERNAME < /dev/tty
    git config user.name "$GIT_USERNAME"
fi

if [ -z "$GIT_USEREMAIL" ]; then
    echo "Enter your email for git commits:"
    read -r GIT_USEREMAIL < /dev/tty
    git config user.email "$GIT_USEREMAIL"
fi