import express from "express";
import cors from "cors";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import { createServer } from "./server.js";

// HTTP/SSE entrypoint — this is what the React client connects to.
// ponytail: single global transport var, fine for one browser tab talking to
// one local server; swap to a session map if multiple clients connect at once.
const app = express();
app.use(cors()); // client (5173) and server (3001) are different origins — no CORS, no fetch.
let transport: SSEServerTransport | undefined;

app.get("/sse", async (_req, res) => {
  transport = new SSEServerTransport("/messages", res);
  await createServer().connect(transport);
});

app.post("/messages", async (req, res) => {
  if (!transport) return res.status(400).send("No active SSE connection");
  await transport.handlePostMessage(req, res);
});

const port = Number(process.env.PORT ?? 3001);
app.listen(port, () => console.log(`mcp-file-assistant server listening on :${port}`));
