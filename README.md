# MCP PDF Assistant

A full-stack PDF assistant built on the Model Context Protocol (MCP). A CLI
chat client (the "host") talks to Claude, which calls PDF tools exposed by a
standalone MCP server over stdio.

```
ai-pdf-assistant/
├── mcp-server/     # MCP server: PDF tools (extract, merge, split, search)
├── host/           # CLI chat client: Claude + MCP client
├── web/            # Browser UI: list + preview PDFs (also an MCP client)
├── shared/         # Shared TypeScript types for tool arguments
└── storage/        # PDFs the tools read from / write to
```

## Tools exposed by the MCP server

| Tool | Description |
|---|---|
| `list_pdfs` | List PDFs currently in `storage/` |
| `extract_text` | Extract text from a PDF (optionally a page range) — feeds summarization |
| `merge_pdfs` | Combine multiple PDFs into one, in order |
| `split_pdf` | Pull a page range out into a new PDF |
| `search_pdf` | Full-text search across one or all stored PDFs |

Summarization isn't a separate tool: the host calls `extract_text`, then asks
Claude to summarize the returned text. That's the MCP-idiomatic split —
the server handles PDF I/O, the LLM handles reasoning over content.

## Setup

```bash
# 1. Install deps in both packages
cd mcp-server && npm install && npm run build && cd ..
cd host && npm install && npm run build && cd ..

# 2. Configure your API key
cp host/.env.example host/.env
# edit host/.env and set ANTHROPIC_API_KEY

# 3. Drop a PDF or two into storage/

# 4. Run the assistant
cd host && npm start
```

For active development, use `npm run dev` in each package (runs via `tsx`
without a separate build step). Rebuild `mcp-server` after editing it — the
host spawns the compiled `mcp-server/dist/server.js`, not the TS source.

## Example prompts (CLI host)

Type these at the `you>` prompt once `host` is running. Each maps to one or
more of the MCP tools above — Claude picks the tool(s) and arguments.

```
list the pdfs you have
summarize sample.pdf
extract the text from sample.pdf
what does sample.pdf say about <topic>?
extract pages 2 to 4 of sample.pdf as text
search all pdfs for "invoice"
search sample.pdf for "total due"
merge a.pdf and b.pdf into combined.pdf
merge a.pdf, b.pdf and c.pdf into one file called all.pdf, in that order
split sample.pdf pages 1-2 into intro.pdf
pull the last 3 pages of report.pdf into a new file called appendix.pdf
compare the contents of a.pdf and b.pdf
how many pages does sample.pdf have?
```

Anything phrased as a natural request over the files in `storage/` works —
these are just concrete starting points, not a fixed command syntax.

## Web UI (list + preview PDFs)

`web/` is a small browser UI for seeing what's in `storage/` without going
through chat. It spawns its own connection to `mcp-server` (same as `host/`
does) and calls the `list_pdfs` tool to populate the sidebar, so the UI and
the chat assistant are always looking at the same file list. Clicking a file
loads it in an embedded PDF preview, served directly from `storage/`.

```bash
cd mcp-server && npm install && npm run build && cd ..   # if not done already
cd web && npm install && npm run build && npm start
```

Then open http://localhost:4000. No API key needed — this package doesn't
talk to Claude, just to the MCP server and the filesystem. It can run at the
same time as `host/`; they each spawn their own `mcp-server` child process.

## Data flow

1. You type a request in the CLI (`host/src/cli.ts`).
2. The host sends it to Claude along with the tool manifest fetched from the
   MCP server at startup (`host/src/mcpClient.ts` → `listTools()`).
3. Claude decides if a tool is needed and returns a structured `tool_use`
   block (tool name + arguments) — no PDF logic runs on the LLM side.
4. The host's MCP client forwards that call over stdio JSON-RPC to
   `mcp-server` (`mcp.callTool(...)`).
5. The server's tool handler (`mcp-server/src/tools/*.ts`) does the actual
   PDF work and returns a JSON result.
6. The host feeds that result back to Claude as a `tool_result`, and Claude
   produces the final natural-language answer, which prints to the CLI.

MCP is the transport in steps 3→4 and 5→6: it's what lets the LLM's tool
decisions turn into real file operations without the host containing any
PDF-specific code itself.

## Extending

Add a new tool by: writing a handler in `mcp-server/src/tools/`, adding its
zod schema + registration in `mcp-server/src/server.ts`, then rebuilding.
The host picks it up automatically via `listTools()` — no host changes
needed unless you want custom pre/post-processing around that tool.
