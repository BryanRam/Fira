FROM mcr.microsoft.com/devcontainers/typescript-node:1-22-bookworm

# Bun (API runtime/test runner) and Claude Code CLI
RUN npm install -g bun @anthropic-ai/claude-code

# Pre-create the Claude config dir owned by the non-root user so the named
# volume mounted there inherits the right ownership (no permission issues).
RUN mkdir -p /home/node/.claude && chown -R node:node /home/node/.claude
