import {
	ApplicationCommandType,
	CacheType,
	CommandInteraction,
	ContextMenuCommandBuilder,
	MessageContextMenuCommandInteraction,
} from "discord.js";
import OpenAI from "openai";

const data = new ContextMenuCommandBuilder()
	.setName("tldrify")
	.setType(ApplicationCommandType.Message);

const execute = async (interaction: CommandInteraction) => {
	if (!interaction.isMessageContextMenuCommand) return;
	const msg = (interaction as MessageContextMenuCommandInteraction<CacheType>)
		.targetMessage.content;

	const openai = new OpenAI({
		apiKey: process.env.CHATGPT_API_KEY,
	});

	if (!openai.apiKey) {
		interaction.followUp("Chat GPT API key not provided.");
		return;
	}

	await interaction.deferReply();

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
