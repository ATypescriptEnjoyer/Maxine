import {
  ChannelType,
  CommandInteraction,
  GuildScheduledEventEntityType,
  GuildScheduledEventPrivacyLevel,
  GuildVoiceChannelResolvable,
  SlashCommandBuilder,
} from "discord.js";
import { parse } from "date-fns";
import { OllamaInstance } from "../OllamaInstance";

const data = new SlashCommandBuilder()
  .setName("movie")
  .setDescription("Sets an event for movie night")
  .addStringOption((opt) =>
    opt.setRequired(true).setName("name").setDescription("Name of the movie")
  )
  .addStringOption((opt) =>
    opt
      .setRequired(true)
      .setName("when")
      .setDescription("When in the format dd/MM/yyyy HH:mm")
  )
  .addChannelOption((opt) =>
    opt
      .setRequired(true)
      .setName("channel")
      .setDescription("Which channel the viewing will take place")
      .addChannelTypes(ChannelType.GuildVoice)
  )
  .addRoleOption((opt) =>
    opt
      .setRequired(false)
      .setName("role")
      .setDescription("@ this role in the invite")
  )
  .addStringOption((opt) =>
    opt
      .setRequired(false)
      .setName("banner")
      .setDescription("Optional URL to a movie banner to use in the event")
  );

const execute = async (interaction: CommandInteraction) => {
  const movieName = interaction.options.get("name").value as string;
  const when = interaction.options.get("when").value as string;
  const channel = interaction.options.get("channel").channel;
  const role = interaction.options.get("role").role;
  const banner = interaction.options.get("banner").value as string;

  const whenDate = parse(when, "dd/MM/yyyy HH:mm", new Date());

  if (isNaN(whenDate.getTime())) {
    return await interaction.reply(
      `Invalid date provided. Please ensure the date is in the format dd/MM/yyyy HH:mm. Example: 31/12/2024 21:00`
    );
  }

  await interaction.deferReply();

  const { url } = await interaction.guild.scheduledEvents.create({
    name: `Movie Night! - ${movieName}`,
    scheduledStartTime: whenDate,
    privacyLevel: GuildScheduledEventPrivacyLevel.GuildOnly,
    entityType: GuildScheduledEventEntityType.Voice,
    description: `${movieName} viewing!`,
    channel: channel as GuildVoiceChannelResolvable,
    image: banner ? banner : null,
    reason: `Requested by ${interaction.member.nickname}`,
  });

  const ollama = new OllamaInstance();

  const message = await ollama.generateMovieAnnouncement(interaction.guild.name, movieName, when);

  await interaction.followUp(`${role} ${message}`);
  return await interaction.channel.send(url);
};

export { data, execute };
