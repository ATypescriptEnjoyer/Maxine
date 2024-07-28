import {
  ApplicationCommandType,
  CacheType,
  CommandInteraction,
  ContextMenuCommandBuilder,
  MessageContextMenuCommandInteraction,
} from "discord.js";
import OpenAI from "openai";
import { OllamaInstance } from "../OllamaInstance";

const data = new ContextMenuCommandBuilder()
  .setName("tldrify")
  .setType(ApplicationCommandType.Message);

const execute = async (interaction: CommandInteraction) => {
  if (!interaction.isMessageContextMenuCommand) return;
  const msg = (interaction as MessageContextMenuCommandInteraction<CacheType>)
    .targetMessage.content;

  await interaction.deferReply();


  const ollama = new OllamaInstance();
  const openai = new OpenAI({
	apiKey: process.env.CHATGPT_API_KEY,
  });

  if (!openai.apiKey && !ollama.ready()) {
	interaction.followUp("No AI models available to complete the request.");
	return;
  }

  if(ollama.ready()) {
	const response = await ollama.ask(msg, "Shorten messages (TLDR) from users.");
	await interaction.followUp(response);
	return;
}

  const chatCompletion = await openai.chat.completions.create({
    user: interaction.user.username,
    messages: [
      {
        role: "user",
        name: interaction.user.displayName,
        content: `TLDR the following: ${msg}`,
      },
    ],
    model: "gpt-3.5-turbo",
  });

  const result = chatCompletion.choices[0].message;
  await interaction.followUp(result.content);
};

export { data, execute };
