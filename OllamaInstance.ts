import { ChatPromptTemplate } from "@langchain/core/prompts";
import z from "zod";
import { DuckDuckGoSearch } from "@langchain/community/tools/duckduckgo_search";
import { createInstance } from "./llmutils/createInstance";
import { runTool } from "./llmutils/runTool";

export interface TranslationResponse {
  translation?: string;
  code?: string;
}

export class OllamaInstance {
  getHexForColour = async (colour: string) => {
    const schemaForHex = z.object({
      hexCode: z
        .string()
        .describe(
          "The hex code for the string colour. For example white would be #FFFFFF. If you are asked for the hex code for black, return #000001"
        ),
    });

    // Pass the schema to the withStructuredOutput method to bind it to the model.
    const llmWithStructuredOutput = createInstance().withStructuredOutput(
      schemaForHex,
      {
        name: "get_colour_hexcode",
      }
    );

    const resultFromWSO = await llmWithStructuredOutput.invoke(
      `What's the hex colour code equivalent for ${colour} ? Ensure you use the 'get_colour_hexcode' tool.`
    );
    return resultFromWSO.hexCode;
  };

  ask = async (
    prompt: string,
    user?: string,
    shouldWebSearch?: boolean
  ): Promise<string> => {
    let context: string | null = null;
    if (shouldWebSearch) {
      const webSearcher = new DuckDuckGoSearch({ maxResults: 10 })
      const searchResponses = await runTool<{title: string; link: string; snippet: string}[]>(
        webSearcher,
        prompt
      );
      context = searchResponses
        ?.map(
          (searchResult) => `URL [${searchResult.link}] - TITLE [${searchResult.title}] - SNIPPET [${searchResult.snippet}]`
        )
        .join("\r\n\r\n");
    }
    const chatTemplate = ChatPromptTemplate.fromMessages([
      ["system", "{system}"],
      ["assistant", "context: {context}"],
      ["assistant", `The users name is {user}`],
      ["human", "{prompt}"],
    ]);

    const msg = await chatTemplate.pipe(createInstance()).invoke({
      system: `
      You are a helpful assistant. Use the assistant provided context that may have been provided to respond the users request. 
      Don't make any mention of the fact that you have a 'provided context'`,
      context,
      prompt: prompt,
      user: user,
    });

    return msg.content as string;
  };

  translate = async (
    to: string,
    text: string
  ): Promise<TranslationResponse> => {
    const translateSchema = z.object({
      code: z
        .string()
        .describe("the ISO 639-1 code of detected original language"),
      translation: z.string().describe("The english translation"),
    });

    const llmWithStructuredOutput = createInstance().withStructuredOutput(
      translateSchema,
      {
        name: "get_translation",
      }
    );

    const chatTemplate = ChatPromptTemplate.fromMessages([
      [
        "system",
        "You are excellent at detecting languages and translating text to {output_lang}.",
      ],
      ["human", "Translate {content} into {output_lang}."],
    ]);

    const response = await chatTemplate
      .pipe(llmWithStructuredOutput)
      .invoke({ content: text, output_lang: to });

    return response;
  };

  tldrify = async (text: string): Promise<string> => {
    const prompt = ChatPromptTemplate.fromMessages([
      ["system", "You are excellent at summarising content."],
      ["human", "Summarise {input}"],
    ]);

    const model = createInstance();

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

    const model = createInstance();

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
      await createInstance().client.list();
      return true;
    } catch (error) {
      return false;
    }
  };
}
