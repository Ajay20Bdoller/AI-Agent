# AI Agent (CLI) + MCP Server

A lightweight **AI chat client** that talks to a local **MCP (Model Context Protocol) server** over **SSE** and can call real tools:
- `getWeather` via OpenWeatherMap
- `listFiles` to explore the filesystem
- `createPost` to post to Twitter
- `addTwoNumber` as a simple example

This repo is intentionally **framework-free** (plain Node.js). The **client** runs in your terminal, the **server** is an Express app that hosts the MCP server and tools.

,,
## Project Structure

```
AI-Agent-main/
├─ client/                # Terminal chat client
│  ├─ index.js            # Entry point (connects to MCP server, chats with AI)
│  ├─ package.json        # Scripts: dev (nodemon), start (node)
│  └─ .env                # GEMINI_API_KEY (Google AI Studio)
├─ server/                # MCP HTTP server
│  ├─ index.js            # Express + MCP server + SSE endpoints
│  ├─ mcp.weather.tool.js # Weather tool (OpenWeatherMap)
│  ├─ mcp.FileNavigation.tool.js # Filesystem listing tool
│  ├─ mcp.twiter.tool.js  # Twitter posting tool
│  ├─ mcp-stdio-proxy.js  # (optional) proxy to HTTP from STDIO
│  ├─ package.json        # Scripts: dev (nodemon), start (node)
│  └─ .env                # Tool API keys (OpenWeather, Twitter)
└─ README.md / notes
```

> Server defaults to **http://localhost:3001** and exposes `/sse` and `/messages` routes for the SSE transport and message posting.



## Prerequisites

- **Node.js 18+** (tested with Node 22)
- An internet connection for API-backed tools
- API keys:
  - **Google AI (Gemini)** → `GEMINI_API_KEY` (client)
  - **OpenWeatherMap** → `OPENWEATHER_API_KEY` (server)
  - **Twitter API v2** (optional) → `TWITTER_API_KEY`, `TWITTER_API_SECRET`, `TWITTER_ACCESS_TOKEN`, `TWITTER_ACCESS_TOKEN_SECRET` (server)

> Never commit real keys. Use `.env` files locally and a `.env.example` in version control.



## Setup

### 1) Install dependencies
```bash
# Server
cd server
npm install

# Client (new terminal)
cd ../client
npm install
```

### 2) Configure environment

**client/.env**
```
# Google AI Studio key (Gemini)
GEMINI_API_KEY=your_gemini_api_key
```

**server/.env**
```
# OpenWeatherMap (for getWeather)
OPENWEATHER_API_KEY=your_openweather_api_key

# Twitter API v2 (for createPost). Optional—omit if you won't tweet.
TWITTER_API_KEY=your_twitter_api_key
TWITTER_API_SECRET=your_twitter_api_secret
TWITTER_ACCESS_TOKEN=your_twitter_access_token
TWITTER_ACCESS_TOKEN_SECRET=your_twitter_access_token_secret
```

> The server currently listens on port **3001** (hard-coded). If you need to change it, update `server/index.js` accordingly.



## Run (Local Development)

Open **two terminals**.

**Terminal A – server**
```bash
cd server
npm run dev    # uses nodemon for auto-restart
# or: npm start  # plain node index.js
```

**Terminal B – client**
```bash
cd client
npm run dev    # or: npm start
```
You should see on the client:
```
Connected to mcp server
You:
```
Type your message and press **Enter**.



## How It Works

### High level
- The **server** is an Express app embedding an **MCP server**. It registers tools and exposes:
  - `GET /sse` – establishes a Server‑Sent Events stream per session (handled by the MCP SDK)
  - `POST /messages?sessionId=...` – forwards client messages to the matching SSE transport
- The **client** connects with `SSEClientTransport("http://localhost:3001/sse")` and chats via **Google AI (Gemini)** using `@google/genai`. When the model decides to use a tool, the client executes it through the MCP connection and streams the result back into the conversation.

### Registered tools (server)
| Tool name      | Params (type)        | What it does                                  |
|----------------|----------------------|-----------------------------------------------|
| `addTwoNumber` | `a` (number), `b` (number) | Returns `a + b` (example of zod‑validated tool) |
| `getWeather`   | `city` (string)      | Current weather via OpenWeatherMap            |
| `listFiles`    | `directoryPath` (string) | Reads a directory and returns file metadata   |
| `createPost`   | `content` (string)   | Posts a tweet using Twitter API v2            |

> The server validates tool inputs using **zod** and each tool returns MCP‑compatible content (e.g., text/JSON).



## Usage Examples (client)

At the `You:` prompt, try:

- **Weather**
  ```
  what is the weather of delhi
  ```
  The client will call `getWeather` and show something like:
  `The weather in Delhi is clear sky with a temperature of 33.0°C ...`

- **Math**
  ```
  add 7 and 12
  ```
  (Model may call `addTwoNumber` under the hood.)

- **Files**
  ```
  list files in ./
  ```
  (Model may call `listFiles` with a directory on the **server** filesystem.)

- **Tweet**
  ```
  post a tweet: "Hello from my MCP agent!"
  ```
  (Requires valid Twitter credentials in `server/.env`.)

> Tip: If a tool doesn't trigger, try rephrasing to be more explicit (e.g., “use the weather tool for Delhi”).





## Production Notes

- Use `npm start` for both client and server in production.


