import { CommandInteraction, SlashCommandBuilder } from "discord.js";
import axios from "axios";

const data = new SlashCommandBuilder()
	.setName("cat")
	.setDescription("Returns a picture of a cat");

const execute = async (interaction: CommandInteraction) => {
	const { data } = await axios.get(
		"https://api.thecatapi.com/v1/images/search",
	);

	await interaction.reply(data[0].url);
};

export { data, execute };
