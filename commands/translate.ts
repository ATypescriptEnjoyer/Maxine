import {
  ApplicationCommandType,
  CacheType,
  CommandInteraction,
  ContextMenuCommandBuilder,
  MessageContextMenuCommandInteraction,
} from "discord.js";
import { OpenAI } from "openai";
import { OllamaInstance } from "../OllamaInstance";
import { GenerateResponse } from "ollama";

const isLlmResult = (
  result: GenerateResponse | void
): result is GenerateResponse => {
  return (<GenerateResponse>result)?.response !== undefined;
};

const llmResultToTranslateObject = (response: string | void): {code: string; text: string} | null => {
  if(typeof response !== "string") return null;
  return JSON.parse(response) as {code: string; text: string};
}

const data = new ContextMenuCommandBuilder()
  .setName("translate")
  .setType(ApplicationCommandType.Message);

const execute = async (interaction: CommandInteraction) => {
  if (!interaction.isMessageContextMenuCommand) return;
  await interaction.deferReply();
  const targetMessage = (
    interaction as MessageContextMenuCommandInteraction<CacheType>
  ).targetMessage;
  const contextText = targetMessage.content;
  const contextAttachments = await Array.fromAsync(
    targetMessage.attachments.values()
  );

  let textResultPromise: Promise<string | void> = Promise.resolve();
  let imageResultPromise: Promise<string | void> = Promise.resolve();
  if (contextAttachments.length > 0) {
	const imgUrl = targetMessage.attachments.first().url;
	const openAIObj = new OpenAI({
		apiKey: process.env.CHATGPT_API_KEY,
	});

	if (openAIObj.apiKey) {
		imageResultPromise = openAIObj.chat.completions.create({
			model: "gpt-4o",
			messages: [
			  {
				role: "user",
				content: [
				  { type: "text", text: `Can you translate this image for me?` },
				  {
					type: "image_url",
					image_url: {
					  "url": imgUrl,
					},
				  },
				],
			  },
			],
		  }).withResponse().then((response) => response.data.choices[0].message.content);
	}
  }
  if (contextText.trim().length > 0) {
    const ollama = new OllamaInstance();
    if(ollama.ready()) {
      textResultPromise = ollama.ask(contextText, "Translate the text to english, and return the result and the ISO 639-1 code in a JSON object of 'text' and 'code'.");
    }
  }
  const settledPromises = await Promise.all([
    textResultPromise,
    imageResultPromise,
  ]);
  const ParsedLLMResponse = llmResultToTranslateObject(settledPromises[0]);
  let text = `${ParsedLLMResponse.code.toUpperCase()}: ${contextText} \r\n\r\nEN: ${ParsedLLMResponse.text}`;
	if(settledPromises[1]) {
		text += `\r\n\r\n${settledPromises[1]}`;
	}
  await interaction.followUp({ content: text.trim() });
};

export { data, execute };
