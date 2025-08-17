import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import fetch from "node-fetch";
import { stdin, stdout } from "process";

const mcpServer = new McpServer({
  name: "stdio-proxy",
  version: "0.0.1",
});

const httpServerUrl = "http://localhost:3001";

async function proxyToHttp(tool, args) {
  try {
    const response = await fetch(`${httpServerUrl}/messages?sessionId=stdio-session`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tool, args }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status}`);
    }

    const result = await response.json();
    return {
      content: [
        {
          type: "text",
          text: result.content[0].text,
        },
      ],
      raw: result.raw,
    };
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `Error communicating with HTTP server: ${error.message}`,
        },
      ],
      error: error.message,
    };
  }
}

mcpServer.tool(
  "addTwoNumber",
  "Add two numbers",
  {
    a: z.number(),
    b: z.number(),
  },
  async (args) => {
    return proxyToHttp("addTwoNumber", args);
  }
);

mcpServer.tool(
  "createPost",
  "Create a Post on Twitter/X",
  {
    status: z.string(),
  },
  async (args) => {
    return proxyToHttp("createPost", args);
  }
);

mcpServer.tool(
  "getWeather",
  "Get Weather for a given city",
  {
    city: z.string(),
  },
  async (args) => {
    return proxyToHttp("getWeather", args);
  }
);

mcpServer.tool(
  "listFiles",
  "List all files in a given directory",
  {
    directoryPath: z.string(),
  },
  async (args) => {
    return proxyToHttp("listFiles", args);
  }
);

// Start the server with STDIO transport using a fallback method
try {
  if (typeof mcpServer.start === "function") {
    mcpServer.start({ transport: "stdio", input: stdin, output: stdout });
  } else {
    console.error("MCP Server does not support STDIO transport with this SDK version.");
    process.exit(1);
  }
} catch (error) {
  console.error("Failed to start MCP Server with STDIO:", error.message);
  process.exit(1);
};

// 