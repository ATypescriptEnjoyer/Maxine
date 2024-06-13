import {
	AttachmentBuilder,
	CommandInteraction,
	SlashCommandBuilder,
} from "discord.js";
import { runGPTAssistant } from "../runGPTAssistant";

const data = new SlashCommandBuilder()
	.setName("ask")
	.setDescription("Ask me anything :)")
	.addStringOption((option) =>
		option.setName("query").setDescription("Query to ask").setRequired(true),
	);

const execute = async (interaction: CommandInteraction) => {
	await interaction.deferReply();

	const runAssistant = await runGPTAssistant(
		interaction.options.get("query").value as string, 
		interaction.user.displayName
	)
	if (typeof runAssistant === "string") {
		await interaction.followUp(runAssistant);
	}
	else if(Buffer.isBuffer(runAssistant)) {
		await interaction.followUp({
			files: [new AttachmentBuilder(runAssistant, { name: "generation.png" })],
		});
	}
};

export { data, execute };
