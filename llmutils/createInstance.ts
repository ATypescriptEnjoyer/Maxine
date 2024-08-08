import { ChatOllamaInput, ChatOllama } from "@langchain/ollama";

const { OLLAMA_HOST, OLLAMA_MODEL } = Bun.env;

export const createInstance = (
  options?: ChatOllamaInput
): ChatOllama => {
  if (OLLAMA_HOST?.length > 0 && OLLAMA_MODEL?.length > 0) {
    return new ChatOllama({
      baseUrl: OLLAMA_HOST,
      model: OLLAMA_MODEL,
      temperature: 0,
      maxRetries: 2,
      ...options,
    });
  }
  throw new Error("Ollama env not configured.");
};
