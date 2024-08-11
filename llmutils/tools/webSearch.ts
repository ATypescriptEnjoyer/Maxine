import { tool } from "@langchain/core/tools";
import { DuckDuckGoSearch, DuckDuckGoSearchParameters } from "@langchain/community/tools/duckduckgo_search";
import z from "zod";

export const webSearch = (options?: Omit<DuckDuckGoSearchParameters, "query">) =>
  tool(
    async ({ query }) => {
      const webSearcher = new DuckDuckGoSearch({ maxResults: 10, ...options});
      const searchResponse = await webSearcher.invoke({ query, ...options });
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
