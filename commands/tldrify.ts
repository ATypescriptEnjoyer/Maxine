import {
  ApplicationCommandType,
  CacheType,
  CommandInteraction,
  ContextMenuCommandBuilder,
  MessageContextMenuCommandInteraction,
} from "discord.js";
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

  if (!ollama.ready()) {
    interaction.followUp("No AI models available to complete the request.");
    return;
  }

  const response = await ollama.ask(
    msg,
    "Shorten messages (TLDR) from users."
  );
  await interaction.followUp(response);
};

export { data, execute };
