import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { SSEClientTransport } from "@modelcontextprotocol/sdk/client/sse.js";

// One shared client instance for the whole app — a single browser tab talking
// to one local MCP server doesn't need connection pooling.
let clientPromise: Promise<Client> | null = null;

export function getMcpClient(serverUrl = new URL("/sse", window.location.origin).toString()): Promise<Client> {
  if (!clientPromise) {
    clientPromise = (async () => {
      const client = new Client({ name: "mcp-file-assistant-client", version: "1.0.0" });
      await client.connect(new SSEClientTransport(new URL(serverUrl)));
      return client;
    })();
  }
  return clientPromise;
}

export async function listTools() {
  const client = await getMcpClient();
  return (await client.listTools()).tools;
}

export async function callTool(name: string, args: Record<string, unknown>) {
  const client = await getMcpClient();
  return client.callTool({ name, arguments: args });
}
