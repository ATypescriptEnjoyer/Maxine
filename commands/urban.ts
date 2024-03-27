import * as Discord from "discord.js";
import { SlashCommandBuilder } from "discord.js";
import axios from "axios";

interface urbanListItem { definition: string; word: string }
interface urbanResponse { list: urbanListItem[] }

const data = new SlashCommandBuilder()
  .setName("urban")
  .setDescription("Queries urban dictionary")
  .addStringOption((option) =>
    option
      .setName("query")
      .setDescription("What to look-up.")
      .setRequired(true)
  );

const execute = async (interaction: Discord.CommandInteraction) => {

  const toUrban = interaction.options.get("query").value as string;
  let resultsToUse: urbanListItem[] = [];
  try {
    const results = await axios.get<urbanResponse>(`https://api.urbandictionary.com/v0/define?term=${toUrban}`);
    resultsToUse = results.data.list;
  } catch (error) {
    /** Error occurred! **/
  }
  if (resultsToUse.length > 0) {
    const result = resultsToUse[0];
    const sendBack = `${result.word}: ${result.definition}`;
    interaction.reply(sendBack);
  } else {
    interaction.reply(`Sorry! I'm not sure what "${toUrban}" is :cry: `);
  }
};

export { data, execute };