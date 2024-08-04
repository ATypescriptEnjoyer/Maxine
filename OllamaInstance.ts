import { ChatOllama, ChatOllamaInput } from "@langchain/ollama";
import { ChatPromptTemplate } from "@langchain/core/prompts";

const { OLLAMA_HOST, OLLAMA_MODEL, WEATHERAPI_APIKEY } = Bun.env;

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

  ask = async (
    prompt: string,
    system?: string,
    user?: string
  ): Promise<string> => {
    const msg = await this.createModel().invoke([
      [
        "system",
        system ??
          `You are a helpful assistant that is used for information, as well as general chatting. You have the following tools:
          "get_current_weather" for retrieving the current weather as a weatherapi current weather JSON schema.`,
      ],
      ["user", user ?? "A discord user."],
      ["human", prompt],
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
