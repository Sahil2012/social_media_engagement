import LangflowClient from "./langflowClient.js";

const applicationToken = process.env.LANGFLOW_TOKEN || "<YOUR_APPLICATION_TOKEN>";
const langflowClient = new LangflowClient(
  "https://api.langflow.astra.datastax.com",
  applicationToken
);

const FLOW_ID = "032c5b75-6942-4b5b-88be-1bb2d0683aa9"; 
const LANGFLOW_ID = "f3404b22-6eb8-4eb1-9229-bf3580d89c03"; 

export async function handleWebSocketMessage(ws, message) {
  console.log("Received:", message);

  try {
    const inputValue = message.toString('utf8');
    const response = await langflowClient.runFlow(
      FLOW_ID,
      LANGFLOW_ID,
      inputValue,
      "chat",
      "chat",
      {}, 
      false,
      (data) => ws.send(JSON.stringify({ type: "update", data })), // Streaming updates
      () => ws.send(JSON.stringify({ type: "close", message: "Stream closed" })), // Stream close
      (error) => ws.send(JSON.stringify({ type: "error", error })) // Stream error
    );
    ws.send(JSON.stringify({ type: "response", "agent": response.outputs[0].outputs[0].results.message.text })); // Send final response
  } catch (error) {
    console.error("Error:", error.message);
    ws.send(JSON.stringify({ type: "error", error: error.message }));
  }
}

