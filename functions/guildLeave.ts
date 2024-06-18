import { ActivityType, Client, Guild } from "discord.js";
import { pluralise } from "../utils";

const { STATUS } = process.env;

export const guildLeave = (guild: Guild, client: Client) => {
	console.log(
		`Left/Kicked from guild: ${guild.name}. We're now in ${
			client.guilds.cache.size
		} ${pluralise("guild", client.guilds.cache.size !== 1)}!`,
	);

	if (STATUS) {
		const renderedStatus = STATUS.replaceAll(
			"{guildsCount}",
			client.guilds.cache.size.toString(),
		);
		client.user.setActivity(renderedStatus, {
			type: ActivityType.Playing,
		});
	}
};
