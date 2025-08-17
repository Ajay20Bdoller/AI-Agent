// console.log("Gemini Key:", process.env.GEMINI_API_KEY);

require('dotenv').config();

const readline = require('readline/promises');

const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });


//ek basic setup karna hai fn, ye fn continuoulsy user se input manta rahega and yhi input baar baar AI ko feed karega jisse humari conti chat ban jayegi
const chatHistory = [];
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

async function chatLoop(){

//user se question lena hai

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


//-- dekho chat do taraf se hogi ek user karega aur ek AI chat/respons karega
//ab hum AI ko ye input denge aur uska response lenge

//--yha pe humne AI ko input diya hai and usska response liya hai

const response = await ai.models.generateContent({
    model: "gemini-2.0-flash",
    contents: chatHistory
})

//check karte hai ki response kya aa rha hai, sahi aa raha hai ya nahi


// console.log(response.candidates[0].content.parts[0].text);
//ab hum is response ko bhi chat history me daalenge taaki ye bhi baar baar chale



///upar chat toh ho rha tha lekin history maintin nhi ho rhi thi ab maintain krne ke liye yha pe likhenge 

const responseText = response.candidates[0].content.parts[0].text;//isko hum direct text me daal bhi sakte the resposeTest ki jagah
chatHistory.push({ 
  role: 'model', 
  parts: [{
role: 'model',
text: responseText, 
type: "text",
 } ]

  })

console.log(`AI: ${responseText}`);

chatLoop();//-- yha pe call kene se ye baar baar respone dega and baar baar input lega, sirf niche wala chatLoop call fn se ek hi baar chat chalegi and te resonse ke niche lagane se conti ho jayegi ye chat.
}
//yha hum chatLoop ko call karenge taaki ye function baar baar chale aur humari chat continue rahe
chatLoop();
