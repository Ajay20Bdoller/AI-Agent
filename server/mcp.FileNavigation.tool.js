// Load Node.js file system and path modules
import fs from 'fs/promises'; // fs for file system operations
import path from 'path'; // path for handling directory paths

// This is the tool function that will be called by the server
export async function listFiles(directoryPath) {
  try {
    // Resolve absolute path
    const absolutePath = path.resolve(directoryPath);

    // Read all items in the directory
    const files = await fs.readdir(absolutePath);

    return {
      content: [
        {
          type: "text",
          text: `Files in ${absolutePath}:\n${files.join('\n')}`,
        },
      ],
      raw: files,
    };
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `Error reading directory: ${error.message}`,
        },
      ],
      error: error.message,
    };
  }
}
