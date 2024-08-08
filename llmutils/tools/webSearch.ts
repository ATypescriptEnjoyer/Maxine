import { tool } from "@langchain/core/tools";
import { TavilyClient, tavily } from "tavily";
import z from "zod";

export const webSearch = (options?: Omit<tavily.SearchOptions, "query">) =>
  tool(
    async ({ query }) => {
      const tavilyClient = new TavilyClient();
      const searchResponse = await tavilyClient.search({ query, ...options });
      return searchResponse;
    },
    {
      name: "websearch",
      description: "Searches the web",
      schema: z.object({
        query: z.string().describe("Search query to search the web for"),
      }),
    }
  );
