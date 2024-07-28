import axios from "axios";
import ollama, { GenerateResponse, Ollama } from "ollama";

const { OLLAMA_HOST, OLLAMA_MODEL } = Bun.env;

export class OllamaInstance {
  ask = async (prompt: string, system?: string): Promise<string> => {
    const request = {
      model: OLLAMA_MODEL,
      prompt,
      stream: false,
      system,
    };

    const resp = await axios.post<GenerateResponse>(
      OLLAMA_HOST + "/api/generate",
      request
    );

    return resp.data.response;
  };

  ready = (): boolean => {
    return OLLAMA_HOST?.length > 0 && OLLAMA_MODEL?.length > 0; 
  };
}
