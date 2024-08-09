import { OllamaInput, Ollama } from "@langchain/ollama";

const { OLLAMA_HOST, OLLAMA_MODEL } = Bun.env;

export const createInstance = (
  options?: OllamaInput
): Ollama => {
  if (OLLAMA_HOST?.length > 0 && OLLAMA_MODEL?.length > 0) {
    return new Ollama({
      baseUrl: OLLAMA_HOST,
      model: OLLAMA_MODEL,
      temperature: 0,
      maxRetries: 2,
      ...options,
    });
  }
  throw new Error("Ollama env not configured.");
};
