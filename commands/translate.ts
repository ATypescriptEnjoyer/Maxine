import _ from "underscore";
import {
  ApplicationCommandType,
  CacheType,
  CommandInteraction,
  ContextMenuCommandBuilder,
  MessageContextMenuCommandInteraction,
} from "discord.js";
import * as deepl from "deepl-node";
import { OpenAI } from "openai";

const isDeeplResult = (
  result: deepl.TextResult | void
): result is deepl.TextResult => {
  return (<deepl.TextResult>result)?.text !== undefined;
};

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

  let textResultPromise: Promise<deepl.TextResult | void> = Promise.resolve();
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
    const authKey = process.env.DEEPL_API_KEY;
    if (authKey) {
		const translator = new deepl.Translator(authKey);
		textResultPromise = translator.translateText(contextText, null, "en-GB");
    }
  }
  const settledPromises = await Promise.all([
    textResultPromise,
    imageResultPromise,
  ]);
  let text = isDeeplResult(settledPromises[0])
    ? `${settledPromises[0].detectedSourceLang.toUpperCase()}: ${contextText}\r\n\r\nEN: ${
        settledPromises[0].text
      }`
    : "";
	if(settledPromises[1]) {
		text += `\r\n\r\n${settledPromises[1]}`;
	}
  await interaction.followUp({ content: text.trim() });
};

export { data, execute };
