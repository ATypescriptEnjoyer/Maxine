import { CommandInteraction, SlashCommandBuilder } from "discord.js";
import rizzLines from "../rizz.json";
import _ from "underscore";

const data = new SlashCommandBuilder()
	.setName("rizz")
	.addUserOption((user) =>
		user
			.setName("user")
			.setDescription("User you want to rizz")
			.setRequired(true),
	)
	.setDescription("Rizz command. Nuff said.");

const execute = async (interaction: CommandInteraction) => {
	const rizz = _.sample(rizzLines);
	const userToRizz = interaction.options.get("user").user;
	await interaction.reply(`${userToRizz}\r\n\r\n${rizz}`);
};

export { data, execute };
