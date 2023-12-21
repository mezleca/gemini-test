import { GoogleGenerativeAI } from "@google/generative-ai";
import { api_key } from "./config.js";
import fs from "node:fs";
import Prompt from "prompt-sync"

const prompt = Prompt();

const ai = new GoogleGenerativeAI(api_key);
const model = ai.getGenerativeModel( { model: "gemini-pro"} );

let history = [];

// peguei da api do google :ok:
function fileToGenerativePart(path, mimeType) {
    return {
      inlineData: {
        data: Buffer.from(fs.readFileSync(path)).toString("base64"),
        mimeType
      },
    };
};

const gerar_piroca = async (prompt) => {
    try {
      // nao sei se preciso iniciar a cada msg mas fds
      const h = [...history].reverse();
      const chat = model.startChat({ history: h, generationConfig: { temperature: 0.75 } });

      const message = await chat.sendMessage(prompt);
      const text = message.response.text();

      history.push({ role: "model", parts: text });
      console.log("R:", text);
    } catch(err) {
      history.push({ role: "model", parts: "prompt blocked" });
      console.log("R:", "prompt blocked")
    } 
};

const new_question = async() => {

    const question = prompt("Q: ");
    if (question == "exit") {
        console.log("programa finalizado");
        return;
    }

    await gerar_piroca(question, "text");
    
    history.push({ role: "user", parts: question });

    new_question();
};

const main = async () => {
    await new_question();
};

main();