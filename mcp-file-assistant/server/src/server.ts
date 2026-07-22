import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { listDir, listDirSchema, readFileTool, readFileSchema } from "./tools/read.js";
import { writeFileTool, writeFileSchema, editFileTool, editFileSchema } from "./tools/write.js";
import { searchContent, searchContentSchema } from "./tools/search.js";
import { moveFile, moveFileSchema, deleteFile, deleteFileSchema } from "./tools/manage.js";

const asText = (data: unknown) => ({
  content: [{ type: "text" as const, text: typeof data === "string" ? data : JSON.stringify(data, null, 2) }],
});

// Shared by both transports (stdio for desktop MCP clients, SSE for the browser client)
// so tool registration lives in exactly one place.
export function createServer() {
  const server = new McpServer({ name: "mcp-file-assistant", version: "1.0.0" });

  server.tool("list_dir", "List files and directories at a path", listDirSchema, async (args) => asText(await listDir(args)));
  server.tool("read_file", "Read a text file's contents", readFileSchema, async (args) => asText(await readFileTool(args)));
  server.tool("write_file", "Create or overwrite a file", writeFileSchema, async (args) => asText(await writeFileTool(args)));
  server.tool("edit_file", "Find-and-replace text within a file", editFileSchema, async (args) => asText(await editFileTool(args)));
  server.tool("search_content", "Search file contents for a substring", searchContentSchema, async (args) => asText(await searchContent(args)));
  server.tool("move_file", "Move or rename a file", moveFileSchema, async (args) => asText(await moveFile(args)));
  server.tool("delete_file", "Delete a file or directory", deleteFileSchema, async (args) => asText(await deleteFile(args)));

  return server;
}
