import { canUploadToAzure, uploadFile } from "../storage";
import {
	AttachmentBuilder,
	CommandInteraction,
	RESTJSONErrorCodes,
	SlashCommandBuilder,
} from "discord.js";
import { unlink } from "node:fs/promises";
import { convertFile } from "../convertFile";

const data = new SlashCommandBuilder()
	.setName("convert")
	.setDescription("Convert/Optimise video")
	.addSubcommand((subcommand) =>
		subcommand
			.setName("url")
			.setDescription("Video URL to convert/optimise")
			.addStringOption((option) =>
				option.setName("url").setDescription("video URL").setRequired(true),
			)
			.addStringOption((option) =>
				option
					.setName("as")
					.setDescription("custom file format (gif, webm) default is MP4."),
			),
	)
	.addSubcommand((subcommand) =>
		subcommand
			.setName("attachment")
			.setDescription("Attachment to convert/optimise")
			.addAttachmentOption((option) =>
				option
					.setName("attachment")
					.setDescription("video attachment")
					.setRequired(true),
			)
			.addStringOption((option) =>
				option
					.setName("as")
					.setDescription("custom file format (gif, webm) default is MP4."),
			),
	);

const execute = async (interaction: CommandInteraction) => {
	await interaction.deferReply();
	const link = interaction.options.get("url");
	const attachment = interaction.options.get("attachment");

	const url = (link ? link.value : attachment.attachment.url) as string;
	const ext = (interaction.options.get("as")?.value as string) || "mp4";
	const { exitCode, stdout, file } = await convertFile(url, ext, false);
	if (exitCode !== 0) {
		const stdoutstr = await new Response(stdout).text();
		return await interaction.followUp(stdoutstr);
	}
	try {
		const interactionReply = await interaction.followUp({
			content: "Here you go!",
			files: [new AttachmentBuilder(file)],
		});
		interactionReply.edit(
			interactionReply.content +
				`\r\n\r\nCopyable Link: <${interactionReply.attachments.first().url}>`,
		);
	} catch (error) {
		if (error.code === RESTJSONErrorCodes.RequestEntityTooLarge) {
			if (canUploadToAzure()) {
				const azureUrl = await uploadFile(file);
				await interaction.followUp({
					content: `Here you go ^_^ \r\n\r\n ${azureUrl}`,
				});
			} else {
				await interaction.followUp({ content: "File size too large." });
			}
		} else {
			console.log(error);
			interaction.followUp(`Sorry babe, there was an error :( ${error.code}`);
		}
	}
	unlink(file).catch();
};

export { data, execute };
