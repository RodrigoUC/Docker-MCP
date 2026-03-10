import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

const transport = new StdioClientTransport({
  command: "node",
  args: ["C:\\Users\\Rodri\\OneDrive\\Desktop\\Docker-MCP\\app\\index.js"],
});

const client = new Client({
  name: "test-client",
  version: "1.0.0",
}, {
  capabilities: {},
});

await client.connect(transport);

const tools = await client.listTools();
console.log("Herramientas disponibles:", tools);

const result = await client.callTool({
  name: "list_containers",
  arguments: {},
});

console.log("Resultado:", result);

await client.close();
