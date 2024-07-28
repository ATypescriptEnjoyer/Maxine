import { Client, Collection, Events, GatewayIntentBits, REST, Routes } from "discord.js";
import path from "path";
import { clientReady, guildCreate, guildLeave } from "./functions";
import { submitPostsForChannel } from "./commands/reddit";
import cron from "node-cron";
import { startInspector } from "./inspector";
import _ from "underscore";
import { Sequelize } from "sequelize";
import { Reddit, Sequelize as SequelizeModel } from "./models";
import { Glob } from "bun";

const { DISCORD_TOKEN, ENABLE_INSPECTOR } = process.env;

const client = new Client({ intents: [
	GatewayIntentBits.Guilds, 
	GatewayIntentBits.GuildMessages, 
	GatewayIntentBits.MessageContent,
	GatewayIntentBits.GuildScheduledEvents,
	GatewayIntentBits.GuildMembers,
	GatewayIntentBits.GuildMessageReactions,
	GatewayIntentBits.GuildInvites,
 ] });

const commands = [];

client.commands = new Collection();

const glob = new Glob("**/!(*.d).ts");

const commandsPath = path.join(import.meta.dir, "commands");
const commandFiles = glob.scan(commandsPath);

for await (const file of commandFiles) {
	const filePath = path.join(commandsPath, file);
	const command = await import(filePath);
	if ("data" in command && "execute" in command) {
		client.commands.set(command.data.name, command);
		commands.push(command.data.toJSON());
	} else {
		console.log(
			`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`,
		);
	}
}

//Auto convert twitter messages to vxtwitter
client.on("messageCreate", async (msg) => {
	if(msg.author.bot) return;
	const urls = msg.content.match(/\bhttps?:\/\/(x\.com|twitter\.com)\S*/gi);
	if(urls?.length > 0) {
		await msg.suppressEmbeds(true);
		const newUrls = urls.map((url) => "https://vxtwitter.com" + url.slice(url.indexOf(".com/") + 4));
		await msg.channel.send(newUrls.join("; "));
	}
});

client.on("ready", async () => {
	clientReady(client);
	if (ENABLE_INSPECTOR === "true") {
		startInspector(client);
	}
	// Construct and prepare an instance of the REST module
	const rest = new REST({ version: "10" }).setToken(DISCORD_TOKEN);
	try {
		console.log(
			`Started refreshing ${commands.length} application (/) commands.`,
		);

		// The put method is used to fully refresh all commands in the guild with the current set
		const data = (await rest.put(Routes.applicationCommands(client.user.id), {
			body: commands,
		})) as { length: number };

		console.log(
			`Successfully reloaded ${data.length} application (/) commands.`,
		);
	} catch (error) {
		// And of course, make sure you catch and log any errors!
		console.error(error);
	}

	const sequelize = new Sequelize(SequelizeModel.configuration);
	const reddit = Reddit.init(Reddit.configuration, { sequelize });
	await reddit.sync();

	if (cron.getTasks().size === 0) {
		cron.schedule("*/30 * * * *", async () => {
			const startPostTimes = 12;
			const endPostTimes = 23;
			const timeNow = new Date().getHours();
			if (timeNow < startPostTimes || timeNow > endPostTimes) return;
			console.info("CRON Starting...");
			const tasks: Reddit[] = await reddit.findAll();
			const groups = _.groupBy(tasks, (x) => x.channelId);
			for (const channel of Object.keys(groups)) {
				const grp = groups[channel];
				await submitPostsForChannel(client, grp, false);
			}
			console.info("CRON Ended...");
		});
	}
});

client.on("guildCreate", (guild) => guildCreate(guild, client));

client.on("guildDelete", (guild) => guildLeave(guild, client));

client.on(Events.InteractionCreate, async (interaction): Promise<void> => {
	if (!interaction.isChatInputCommand() && !interaction.isContextMenuCommand())
		return;
	const command = interaction.client.commands.get(interaction.commandName);

	if (!command) {
		console.error(`No command matching ${interaction.commandName} was found.`);
		return;
	}
	console.log(
		`${interaction.user.username} - ${interaction.guild.name}: ${interaction.commandName}`,
	);

	try {
		await command.execute(interaction);
	} catch (error) {
		console.error(error);
		if (!interaction.replied) {
			const errBody = {
				content: `There was an error while executing this command:\r\n\r\n${error.toString()}`,
			};
			if (interaction.deferred) {
				await interaction.followUp(errBody);
				return;
			}
			await interaction.reply(errBody);
		}
	}
});

client.on("error", (err) => {
	console.log(err.name);
});

client.login(DISCORD_TOKEN);
