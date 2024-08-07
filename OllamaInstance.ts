import { ChatOllama, ChatOllamaInput } from "@langchain/ollama";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import z from "zod";
import { TavilyClient } from 'tavily';

const { OLLAMA_HOST, OLLAMA_MODEL } = Bun.env;

export interface TranslationResponse {
  translation?: string;
  code?: string;
}

export class OllamaInstance {
  private createModel = (options?: ChatOllamaInput): ChatOllama => {
    if (OLLAMA_HOST?.length > 0 && OLLAMA_MODEL?.length > 0) {
      return new ChatOllama({
        baseUrl: OLLAMA_HOST,
        model: OLLAMA_MODEL,
        temperature: 0,
        maxRetries: 2,
        ...options,
      });
    }
  };

  getHexForColour = async (colour: string) => {
    const schemaForHex = z.object({
      hexCode: z.string().describe("The hex code for the string colour. For example white would be #FFFFFF. If you are asked for the hex code for black, return #000001"),
    });
    
    // Pass the schema to the withStructuredOutput method to bind it to the model.
    const llmWithStructuredOutput = this.createModel().withStructuredOutput(schemaForHex, {
      name: "get_colour_hexcode",
    });
    
    const resultFromWSO = await llmWithStructuredOutput.invoke(
      `What's the hex colour code equivalent for ${colour} ? Ensure you use the 'get_colour_hexcode' tool.`
    );
    return resultFromWSO.hexCode;
  }

  ask = async (
    prompt: string,
    system?: string,
    user?: string,
    webSearch?: boolean,
  ): Promise<string> => {
    let context: string | null = null;
    if(webSearch) {
      const tavily = new TavilyClient();
      const result = await tavily.search({query: prompt, max_results: 3});
      context = result.results.map((result) => `${result.url} - ${result.title}:\r\n${result.content}`).join("\r\n\r\n");
      
    }
    const msg = await this.createModel().invoke([
      [
        "system",
        system ??
          `You are a helpful assistant that is used for information, as well as general chatting.`,
      ],
      ["user", user ?? "A discord user."],
      ["human", `${prompt} ${context !== null ? `Use the following context to heavily influence your response ${context}` : ""}`],
    ]);
    return msg.content as string;
  };

  translate = async (
    to: string,
    text: string
  ): Promise<TranslationResponse> => {
    const prompt = ChatPromptTemplate.fromMessages([
      [
        "system",
        `You are an expert translator. 
          Format all responses as JSON objects with two keys: 'code' which is the ISO 639-1 code of detected original language, and "translation" which is the english translation.`,
      ],
      ["human", "Translate {input} into {output_language}"],
    ]);

    const model = this.createModel({ format: "json" });

    const chain = prompt.pipe(model);
    const msg = await chain.invoke({
      output_language: to,
      input: text,
    });
    return JSON.parse(msg.content as string) as TranslationResponse;
  };

  tldrify = async (text: string): Promise<string> => {
    const prompt = ChatPromptTemplate.fromMessages([
      ["system", "You are excellent at summarising content."],
      ["human", "Summarise {input}"],
    ]);

    const model = this.createModel();

    const chain = prompt.pipe(model);
    const msg = await chain.invoke({
      input: text,
    });
    return msg.content as string;
  };

  generateMovieAnnouncement = async (
    guildName: string,
    movieName: string,
    when: string
  ): Promise<string> => {
    const prompt = ChatPromptTemplate.fromMessages([
      [
        "system",
        `You are an event planner for the discord server '{guild_name}'. 
        You create invitation text for the server to watch movies with the information provided from the user.
        Be sure to give a bit of information about the movie and get people wanting to come watch (over discord).
        Include some emojis where appropriate.
        The timezone is Europe/London, taking into account whenever its DST.`,
      ],
      [
        "human",
        "Create a movie invitation for the movie {movie_name} at {movie_time}",
      ],
    ]);

    const model = this.createModel();

    const chain = prompt.pipe(model);
    const msg = await chain.invoke({
      guild_name: guildName,
      movie_name: movieName,
      movie_time: when,
    });
    return msg.content as string;
  };

  ready = async (): Promise<boolean> => {
    try {
      await this.createModel().client.list();
      return true;
    } catch (error) {
      return false;
    }
  };
}
