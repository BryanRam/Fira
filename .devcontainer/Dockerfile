FROM mcr.microsoft.com/devcontainers/typescript-node:1-22-bookworm

ARG USERNAME=node

# OS tooling:
#  - cypher-shell (+ Java runtime it needs) for working with Neo4j from the terminal
#  - ldap-utils (ldapsearch etc.) for debugging the API's LDAP auth
#  - general CLI helpers used day-to-day and by Claude Code
RUN apt-get update \
    && export DEBIAN_FRONTEND=noninteractive \
    && apt-get install -y --no-install-recommends \
        ca-certificates curl gnupg \
    && curl -fsSL https://debian.neo4j.com/neotechnology.gpg.key | gpg --dearmor -o /usr/share/keyrings/neo4j.gpg \
    && echo "deb [signed-by=/usr/share/keyrings/neo4j.gpg] https://debian.neo4j.com stable 5" > /etc/apt/sources.list.d/neo4j.list \
    && apt-get update \
    && apt-get install -y --no-install-recommends \
        openjdk-17-jre-headless \
        cypher-shell \
        ldap-utils \
        jq ripgrep fd-find fzf less vim nano \
        dnsutils iputils-ping netcat-openbsd procps lsof htop \
    && ln -s "$(which fdfind)" /usr/local/bin/fd \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Bun (API runtime, package manager and test runner)
COPY --from=oven/bun:1 /usr/local/bin/bun /usr/local/bin/bun
RUN ln -s /usr/local/bin/bun /usr/local/bin/bunx

# Directories that are mounted as named volumes. Creating them here owned by
# the non-root user means Docker seeds fresh volumes with the right ownership,
# so nothing ends up root-owned. post-create.sh re-asserts this in case the
# UID was remapped to match the host (WSL/Linux) after the volume was created.
RUN mkdir -p /home/${USERNAME}/.claude /commandhistory \
    && touch /commandhistory/.bash_history /commandhistory/.zsh_history \
    && chown -R ${USERNAME}:${USERNAME} /home/${USERNAME}/.claude /commandhistory

# Persist shell history across rebuilds
RUN echo 'export HISTFILE=/commandhistory/.bash_history PROMPT_COMMAND="history -a;${PROMPT_COMMAND}"' >> /home/${USERNAME}/.bashrc \
    && echo 'export HISTFILE=/commandhistory/.zsh_history; setopt INC_APPEND_HISTORY' >> /home/${USERNAME}/.zshrc

USER ${USERNAME}

# Claude Code CLI (native installer). It installs into the user's home
# (~/.local), so it can self-update without root.
RUN curl -fsSL https://claude.ai/install.sh | bash
ENV PATH="/home/${USERNAME}/.local/bin:${PATH}"
