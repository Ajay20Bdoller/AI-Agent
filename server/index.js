

import express from "express"; 
// 'express' is a minimal and flexible Node.js web app framework.
// We use it to create APIs and handle HTTP requests.

import {McpServer} from "@modelcontextprotocol/sdk/server/mcp.js";
// 'McpServer' is the main class for creating an MCP server (Model Context Protocol).
// It handles tool registration and communication with clients.

import {SSEServerTransport} from "@modelcontextprotocol/sdk/server/sse.js";
// 'SSEServerTransport' provides Server-Sent Events support for real-time communication.
// It is used to send and receive messages over a persistent connection.

import {z} from "zod";
// 'zod' is a schema validation library. 
// We use it to validate input arguments for tools (like ensuring a number or string is provided).

import { createPost } from "./mcp.twiter.tool.js";
// Custom function to post on Twitter. Defined in a separate file.

import { getWeather } from "./mcp.weather.tool.js";
// Custom function to fetch weather data for a city. Defined in another file.

import {listFiles} from "./mcp.FileNavigation.tool.js";
// Custom function to list files in a directory. Defined in its own file.

import dotenv from "dotenv"; 
// 'dotenv' is used to load environment variables from a .env file.

dotenv.config(); 
// This loads all environment variables defined in the .env file into process.env

// Create MCP Server instance
const server = new McpServer({
  name: "example-server",     // Name of your MCP server
  version: "0.0.1",           // Version of your server
}); 

// Create Express app
const app = express();  

// app.use(express.json()); 
// This middleware allows the server to parse incoming requests with JSON payloads.



// MCP Tool 1 - Add Two Numbers
// ==============================

server.tool(
  "addTwoNumber",             // Unique tool ID
  "addTwoNumber",             // Human-readable name

  {
    a: z.number(),            // Validate input 'a' as number
    b: z.number(),            // Validate input 'b' as number
  }, 

  async (arg) => {            // Tool logic is async (to support future await calls)
    const {a, b} = arg; 
            // Destructure arguments
            // console.log(`Adding numbers: ${a} + ${b}`);
        

    return {
      content: [              // Tool must return an array of messages (MCP format)
        {
          type: "text",
          text: `The sum is ${sum}.`, 
          // spoken: `The result of ${a} and ${b} is ${a+b}` // Final output message

        },

       

      ]

}



        
      
  }

);



// MCP Tool 2 - Twitter Post
// ==============================

server.tool(
  "createPost",                      // Tool ID
  "Create a Post on Twitter/X",      // Description for client

  {
    status: z.string(),              // Expect a string input (tweet content)
  },

  async (arg) => {
    const {status} = arg;
    console.log("Received status argument:", status);  // Debug log

    if (typeof status !== "string") {
      throw new Error("Invalid input: status must be a string.");
    }

    return await createPost(status); // Calls external helper function to post tweet
  }
);



// MCP Tool 3 - Weather Tool
// ==============================

server.tool(
  "getWeather",                      // Tool ID
  "Get Weather for a given city",    // Description

  {
    city: z.string(),                // Expect a city name as string
  },

  async (args) => {
    const {city} = args;
    return getWeather(city);        // Calls external weather function
  }
);



// MCP Tool 4 - File Navigator
// ==============================

server.tool(
  "listFiles",                       // Tool ID
  "List all files in a given directory",  // Description

  {
    directoryPath: z.string(),       // Directory path as string input
  },  

  async (args) => {
    const {directoryPath} = args;
    return listFiles(directoryPath);  // Calls external file listing function
  }
);



// Handle Real-Time Connections
// ==============================

// 'transports' maps sessionId to transport object (used for real-time communication)
const transports = {};


// Endpoint to handle SSE connections from client
app.get("/sse", async (req, res) => {
  const transport = new SSEServerTransport('/messages', res); 
  // Create a new transport over the current response stream

  transports[transport.sessionId] = transport; 
  // Store it with its sessionId

  res.on("close", () => {
    delete transports[transport.sessionId]; 
    // Clean up when connection closes
  });

  await server.connect(transport); 
  // Bind this transport to the MCP server
});


// Endpoint to receive client messages
app.post("/messages", async (req, res) => {
  console.log("Received from client", req.body);  // Debug log
  const sessionId = req.query.sessionId;          // Get sessionId from URL query
  const transport = transports[sessionId];        // Find the matching transport

  if (transport) {
    await transport.handlePostMessage(req, res);  // Let it handle the message
  } else {
    res.status(404).send("No transport found for sessionId"); // Error if no match
  }
});


// Start the Express server
app.listen(3001, () => {  
  console.log("Server is running on port http://localhost:3001");
});
// This will start the server and listen for incoming requests on port 3001
// You can access the server at this URL in your browser or client