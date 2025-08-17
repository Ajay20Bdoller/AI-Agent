import { config } from 'dotenv';
import readline from 'readline/promises';
import { GoogleGenAI } from "@google/genai";
import { Client} from'@modelcontextprotocol/sdk/client/index.js';

import { SSEClientTransport } from '@modelcontextprotocol/sdk/client/sse.js';

config();

 let tools = [];
//   

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const mcpClient = new Client({
  name: "exmaple-client",
  description: "example client",
  version: "0.0.1",
  //--yha pe humne mcp client ko setup kiya hai
})

//ek basic setup karna hai fn, ye fn continuoulsy user se input manta rahega and yhi input baar baar AI ko feed karega jisse humari conti chat ban jayegi
const chatHistory = [];
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});



mcpClient.connect(new SSEClientTransport(new URL("http://localhost:3001/sse")))

.then(async () => { 

console.log("Connected to mcp server");
//yha pe humne server se connect ho gaye hai

//yha pe humne server se connect hone ke baad kuch bhi kar sakte hai, jaise ki tools ko list karna, ya kisi tool ko call karna
//ab hum tools ko list/call karenge
tools = (await mcpClient.listTools()).tools.map(tool => {
  return {       
  name: tool.name,
  description: tool.description,
  parameters:{
       type: tool.inputSchema.type,
       properties: tool.inputSchema.properties,
       required: tool.inputSchema.required
  }
  }

 
  })


// console.log("Available tools: ", tools);  

chatLoop();

});




async function chatLoop(toolCall){
//user se question lena hai


if(toolCall) {
console.log("calling tool", toolCall.name);







chatHistory.push({
  role: 'model',
  parts: [{
 text: `calling tool ${toolCall.name}`,
type: 'text',


  }]})


  


const toolResult = await mcpClient.callTool({
name: toolCall.name,
arguments: toolCall.args
//yha pe humne tool ko call kiya hai aur uska result liya hai

});

// console.log(toolResult);


chatHistory.push({
  role: 'user',
  parts: [{
 text: "Tool result :" + toolResult.content[0].text,
type: 'text',

  }]

})


}else{
const question = await rl.question('You: ');
//yha pe humne user se question/input le liya hai

//ab hum is user ke input ko chat history me daalenge/push karenge
chatHistory.push({ 
  
  role: 'user', 
  parts: [{//ye parts gemini ka part hai


text:question,
type:"text",

}]

});

}
//-- dekho chat do taraf se hogi ek user karega aur ek AI chat/respons karega
//ab hum AI ko ye input denge aur uska response lenge

//--yha pe humne AI ko input diya hai and usska response liya hai

const response = await ai.models.generateContent({
    model: "gemini-2.0-flash",
    contents: chatHistory,
    config: {//config bhi ek paramerter hai jiske under hum list kar sakte hai ki kounse kounse se tool hai
tools: [
{

functionDeclarations: tools,
//yha pe humne tools ko list kiya hai jo humne upar banaye the
//-toh kuchh iss tarike se hum Ai ko bataye hai ye ye tools hai jo tum use kar sakte ho


}]}});



//check karte hai ki response kya aa rha hai, sahi aa raha hai ya nahi


// console.log(response.candidates[0].content.parts[0].text);
//ab hum is response ko bhi chat history me daalenge taaki ye bhi baar baar chale


const functionCall = response.candidates[0].content.parts[0].functionCall;  


///upar chat toh ho rha tha lekin history maintin nhi ho rhi thi ab maintain krne ke liye yha pe likhenge
const responseText = response.candidates[0].content.parts[0].text;//isko hum direct text me daal bhi sakte the resposeTest ki jagah

// console.log(response.candidates[0].content.parts[0]);//yha se fn kaise call hora hai ye dikh jayega after node index.js in client
// console.log(response);


if(functionCall)  {

return chatLoop(functionCall)



}











chatHistory.push({ 
  role: 'model', 
  parts: [{
role: 'model',
text: responseText, 
type: "text",
 } ]

  });

console.log(`AI: ${responseText}`);

chatLoop();
}//-- yha pe call kene se ye baar baar respone dega and baar baar input lega, sirf niche wala chatLoop call fn se ek hi baar chat chalegi and te resonse ke niche lagane se conti ho jayegi ye chat.

//yha hum chatLoop ko call karenge taaki ye function baar baar chale aur humari chat continue rahe
// chatLoop();-- but in this case iss chtLopp fn ko call tab karenge jab hum mcp server se conncet kar jayenge , isko upar likh dete hai tools wale ke sabse niche.
