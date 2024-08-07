import { CommandInteraction, SlashCommandBuilder } from "discord.js";
import { OllamaInstance } from "../OllamaInstance";

const data = new SlashCommandBuilder()
  .setName("ask")
  .setDescription("Ask me anything :)")
  .addStringOption((option) =>
    option.setName("query").setDescription("Query to ask").setRequired(true)
  )
  .addBooleanOption((option) =>
    option
      .setName("useweb")
      .setDescription("Uses a web search to help assist with accurate results")
      .setRequired(false)
  );

const execute = async (interaction: CommandInteraction) => {
  await interaction.deferReply();

  const ollama = new OllamaInstance();
  const runAssistant = await ollama.ask(
    interaction.options.get("query").value as string,
    `You are a helpful assistant and are happy to chat.`,
    interaction.user.displayName,
    (interaction.options.get("useweb")?.value as boolean)
  );
  await interaction.followUp(runAssistant);
};

export { data, execute };
