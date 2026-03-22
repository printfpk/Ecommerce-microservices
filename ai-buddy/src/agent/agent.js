require("dotenv").config();

const { StateGraph, MessagesAnnotation } = require("@langchain/langgraph");
const { ChatGroq } = require("@langchain/groq");
const { ChatOpenAI } = require("@langchain/openai");
const { ToolMessage, AIMessage } = require("@langchain/core/messages");
const tools = require("./tools");

// ✅ Groq (PRIMARY - FREE)
const groqModel = new ChatGroq({
  apiKey: process.env.GROQ_API_KEY,
  model: "openai/gpt-oss-120b",
  temperature: 0.5,
});

// ✅ OpenAI (FALLBACK)
const openaiModel = new ChatOpenAI({
  model: "gpt-4o-mini",
  temperature: 0.5,
  apiKey: process.env.OPENAI_API_KEY,
});

// ✅ Fallback wrapper
async function invokeWithFallback(messages, options) {
  try {
    console.log("👉 Using Groq");
    return await groqModel.invoke(messages, options);
  } catch (err) {
    console.error("❌ Groq failed:", err.message);

    console.log("👉 Switching to OpenAI");
    return await openaiModel.invoke(messages, options);
  }
}

const graph = new StateGraph(MessagesAnnotation)

  // 🔧 TOOLS NODE
  .addNode("tools", async (state, config) => {
    const lastMessage = state.messages[state.messages.length - 1];

    const toolsCall = lastMessage.tool_calls || [];

    const toolCallResults = await Promise.all(
      toolsCall.map(async (call) => {
        const tool = tools[call.name];

        if (!tool) {
          throw new Error(`Tool ${call.name} not found`);
        }

        console.log("🔧 Invoking tool:", call.name);

        const toolResult = await tool.func({
          ...call.args,
          token: config.metadata.token,
        });

        return new ToolMessage({
          content: toolResult,
          name: call.name,
           tool_call_id: call.id,
        });
      })
    );

    state.messages.push(...toolCallResults);

    return state;
  })

  // 💬 CHAT NODE
  .addNode("chat", async (state, config) => {
    try {
      const response = await invokeWithFallback(state.messages, {
        tools: [tools.searchProduct, tools.addProductToCart],
      });

      state.messages.push(
        new AIMessage({
          content: response.text,
          tool_calls: response.tool_calls,
        })
      );
    } catch (err) {
      console.error("❌ AI Error:", err.message);

      state.messages.push(
        new AIMessage({
          content: "AI service temporarily unavailable",
        })
      );
    }

    return state;
  })

  .addEdge("__start__", "chat")

  .addConditionalEdges("chat", async (state) => {
    const lastMessage = state.messages[state.messages.length - 1];

    if (lastMessage.tool_calls && lastMessage.tool_calls.length > 0) {
      return "tools";
    } else {
      return "__end__";
    }
  })

  .addEdge("tools", "chat");

const agent = graph.compile();

module.exports = agent;