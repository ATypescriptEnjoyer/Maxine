import {
  ApplicationCommandType,
  CacheType,
  CommandInteraction,
  ContextMenuCommandBuilder,
  MessageContextMenuCommandInteraction,
} from "discord.js";
import { OpenAI } from "openai";
import { OllamaInstance, TranslationResponse } from "../OllamaInstance";

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

  let textResultPromise: Promise<TranslationResponse | void> = Promise.resolve();
  let imageResultPromise: Promise<string | void> = Promise.resolve();
  if (contextAttachments.length > 0) {
    const imgUrl = targetMessage.attachments.first().url;
    const openAIObj = new OpenAI({
      apiKey: process.env.CHATGPT_API_KEY,
    });

    if (openAIObj.apiKey) {
      imageResultPromise = openAIObj.chat.completions
        .create({
          model: "gpt-4o",
          messages: [
            {
              role: "user",
              content: [
                { type: "text", text: `Can you translate this image for me?` },
                {
                  type: "image_url",
                  image_url: {
                    url: imgUrl,
                  },
                },
              ],
            },
          ],
        })
        .withResponse()
        .then((response) => response.data.choices[0].message.content);
    }
  }
  if (contextText.trim().length > 0) {
    const ollama = new OllamaInstance();
    if (ollama.ready()) {
      textResultPromise = ollama.translate(contextText, "");
    }
  }
  const settledPromises = await Promise.all([
    textResultPromise,
    imageResultPromise,
  ]);
  const ParsedLLMResponse = settledPromises[0];
  let text =
    typeof ParsedLLMResponse === "object"
      ? `${ParsedLLMResponse.code.toUpperCase()}: ${contextText} \r\n\r\nEN: ${
          ParsedLLMResponse.translation
        }`
      : "";
  if (settledPromises[1]) {
    text += `\r\n\r\n${settledPromises[1]}`;
  }
  await interaction.followUp({ content: text.trim() });
};

export { data, execute };
