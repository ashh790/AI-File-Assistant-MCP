import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { createServer } from "./server.js";

// stdio entrypoint — for desktop MCP clients (Claude Desktop, etc.) that spawn this process.
// For the browser client in this repo, run `npm run start:http` instead.
await createServer().connect(new StdioServerTransport());
