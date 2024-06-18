import tmp from "tmp";
import Jimp from "jimp";
import {
	AttachmentBuilder,
	CommandInteraction,
	SlashCommandBuilder,
} from "discord.js";

const { NICKNAME } = process.env;

const cropImage = (jimpImage: Jimp, cb: (jimp: Jimp) => void): void => {
	const w = jimpImage.bitmap.width;
	const h = jimpImage.bitmap.height;
	const leftStart = findLeftSide(jimpImage, w, h);
	const rightStart = findRightSide(jimpImage, w, h);
	const topStart = findTopSide(jimpImage, w, h);
	const bottomStart = findBottomSide(jimpImage, w, h);
	const width = rightStart - leftStart;
	const height = bottomStart - topStart;
	jimpImage.crop(leftStart, topStart, width, height, (_, jimp) => cb(jimp));
};

const findLeftSide = (scope: Jimp, w: number, h: number): number => {
	for (let x = 0; x < w; x++) {
		const clr = scope.getPixelColor(x, h / 2);

		if (clr !== 255) {
			return x;
		}
	}
};

const findRightSide = (scope: Jimp, w: number, h: number): number => {
	for (let x = w; x > 0; x--) {
		const clr = scope.getPixelColor(x, h / 2);

		if (clr !== 255) {
			return x;
		}
	}
};

const findTopSide = (scope: Jimp, w: number, h: number): number => {
	for (let y = 0; y < h; y++) {
		const clr = scope.getPixelColor(w / 2, y);

		if (clr !== 255) {
			return y;
		}
	}
};

const findBottomSide = (scope: Jimp, w: number, h: number): number => {
	for (let y = h; y > 0; y--) {
		const clr = scope.getPixelColor(w / 2, y);

		if (clr !== 255) {
			return y;
		}
	}
};

const data = new SlashCommandBuilder()
	.setName("crop")
	.setDescription("crop images to 16:9")
	.addSubcommand((subcommand) =>
		subcommand
			.setName("url")
			.setDescription("Image URL to crop")
			.addStringOption((option) =>
				option.setName("url").setDescription("image URL").setRequired(true),
			),
	)
	.addSubcommand((subcommand) =>
		subcommand
			.setName("attachment")
			.setDescription("Attachment to crop")
			.addAttachmentOption((option) =>
				option
					.setName("attachment")
					.setDescription("image attachment")
					.setRequired(true),
			),
	);

const execute = async (interaction: CommandInteraction) => {
	await interaction.deferReply();
	const url = interaction.options.get("url");
	const attachment = interaction.options.get("attachment");

	const link =
		(url?.value as string) || (attachment?.attachment?.url);

	const fileExt = link.split(".").slice(-1)[0];
	const tmpFileName = tmp.tmpNameSync({
		prefix: `${NICKNAME}-img`,
		postfix: `.${fileExt}`,
	});

	const jimpImg = await Jimp.read(link);
	cropImage(jimpImg, async (jimp) => {
		await jimp.writeAsync(tmpFileName);
		interaction.followUp({
			content: "Here you go ^_^",
			files: [new AttachmentBuilder(tmpFileName)],
		});
	});
};

export { data, execute };
