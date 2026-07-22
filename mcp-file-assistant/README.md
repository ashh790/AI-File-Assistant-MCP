# MCP file assistant

A minimal full-stack file assistant: a React client talking to a Node MCP
server that can list, read, write, edit, search, move, and delete files
inside one sandboxed root directory.

## Run it

```bash
cd server && npm install && npm run start:http   # MCP server on :3001 (SSE)
cd client && npm install && npm run dev           # React app on :5173
```

Set `MCP_FILE_ROOT` (server env var) to the directory you want the assistant
to operate on. Defaults to the server's working directory.

To run the server as a desktop-MCP-client target instead (Claude Desktop,
etc.), use `npm run dev` (stdio transport) rather than `start:http`.

## Check the sandbox logic

```bash
cd server && npm run test
```

## What's here vs. what's skipped

- Tool calls go straight from the client UI to the server — no LLM decides
  which tool to call yet. Add that by sending user text + `listTools()`
  output to a model and executing whatever tool call comes back.
- One fixed root directory, one global SSE connection — fine for a single
  local user. Add per-session transports / a root registry if this needs to
  serve multiple users or multiple projects at once.
- `edit_file` is exact find/replace. Swap in a diff/patch library if edits
  need fuzzy matching.
