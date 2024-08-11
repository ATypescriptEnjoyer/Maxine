import { Tool , StructuredTool} from "@langchain/core/tools";
import type { AIMessageChunk, ToolMessage } from "@langchain/core/messages";
import { createInstance } from "./createInstance";

export const runTool = async <T>(
  tool: Tool | StructuredTool,
  prompt: string
): Promise<T> => {
  return createInstance()
    .bindTools([tool])
    .pipe(async (chunk: AIMessageChunk) => {
      if (!chunk.tool_calls || chunk.tool_calls.length === 0)
        throw new Error("Failed to call tool");
      console.log("LLM tool call: ", chunk.tool_calls[0]);
      return JSON.parse(
        ((await tool.invoke(chunk.tool_calls[0])) as ToolMessage)
          .content as string
      ) as T;
    })
    .invoke(prompt);
};
