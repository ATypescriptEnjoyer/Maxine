import tmp from "tmp";
import Jimp from "jimp";
import {
	AttachmentBuilder,
	CommandInteraction,
	SlashCommandBuilder,
} from "discord.js";

const { NICKNAME } = process.env;

const data = new SlashCommandBuilder()
	.setName("resize")
	.setDescription("resizes images by X times")
	.addSubcommand((subcommand) =>
		subcommand
			.setName("url")
			.setDescription("Image URL to resize")
			.addStringOption((option) =>
				option.setName("url").setDescription("image URL").setRequired(true),
			)
			.addNumberOption((option) =>
				option
					.setName("by_x")
					.setDescription(
						"times to resize, -x or x (-2, 2) for double in size or shrink by half",
					)
					.setRequired(true),
			),
	)
	.addSubcommand((subcommand) =>
		subcommand
			.setName("attachment")
			.setDescription("Attachment to resize")
			.addAttachmentOption((option) =>
				option
					.setName("attachment")
					.setDescription("image attachment")
					.setRequired(true),
			)
			.addNumberOption((option) =>
				option
					.setName("by_x")
					.setDescription(
						"times to resize, -x or x (-2, 2) for double in size or shrink by half",
					)
					.setRequired(true),
			),
	);

const execute = async (interaction: CommandInteraction) => {
	await interaction.deferReply();
	const url = interaction.options.get("url");
	const attachment = interaction.options.get("attachment");
	const xTimes = interaction.options.get("by_x").value as number;

	if ([-1, 0, 1].includes(xTimes)) {
		await interaction.followUp({
			content: `Invalid parameter "${xTimes}" given for xTimes.`,
		});
		return;
	}

	const link =
		(url?.value as string) || (attachment?.attachment?.url);

	const fileExt = link.split(".").slice(-1)[0];
	const tmpFileName = tmp.tmpNameSync({
		prefix: `${NICKNAME}-img`,
		postfix: `.${fileExt}`,
	});

	let jimpImg = null;

	try {
		jimpImg = await Jimp.read(link);
	} catch (error) {
		await interaction.followUp(error.message);
		return;
	}

	const currSize = { width: jimpImg.getWidth(), height: jimpImg.getHeight() };
	const newSize = {
		width:
			xTimes > 0 ? currSize.width * xTimes : currSize.width / Math.abs(xTimes),
		height:
			xTimes > 0
				? currSize.height * xTimes
				: currSize.height / Math.abs(xTimes),
	};

	jimpImg.resize(newSize.width, newSize.height, async (_, jimp) => {
		await jimp.writeAsync(tmpFileName);
		await interaction.followUp({
			content: "Here you go ^_^",
			files: [new AttachmentBuilder(tmpFileName)],
		});
	});
};

export { data, execute };
