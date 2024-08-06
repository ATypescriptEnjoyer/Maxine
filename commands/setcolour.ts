import _, { intersection } from "underscore";
import {
  ColorResolvable,
  CommandInteraction,
  SlashCommandBuilder,
  resolveColor,
} from "discord.js";
import { OllamaInstance } from "../OllamaInstance";

const data = new SlashCommandBuilder()
  .setName("setcolour")
  .setDescription("Sets your discord name colour :)")
  .addStringOption((option) =>
    option
      .setName("colour_code")
      .setDescription("Discord recognisable colour code")
      .setRequired(true)
  );

const execute = async (interaction: CommandInteraction) => {
  const guildUser = interaction.guild.members.cache.find(
    (member) => member.id === interaction.user.id
  );
  await interaction.deferReply();
  const colourCode = interaction.options.get("colour_code").value as string;
  const colourKey = "CLR-" + colourCode;
  let assignableColour = null;
  try {
    assignableColour = resolveColor(colourCode as ColorResolvable);
  } catch (err) {
    const ollama = new OllamaInstance();
    assignableColour = await ollama.getHexForColour(colourCode);
    console.log(`LLM told us ${colourCode} is ${assignableColour}`);
  }
  const botTopmostRole = Math.max(
    ...interaction.guild.members.me.roles.cache.map((role) => role.position)
  );
  const usersTopmostRole = Math.max(
    ...guildUser.roles.cache
      .filter((role) => role.color > 0)
      .map((role) => role.position)
  );
  if (usersTopmostRole >= botTopmostRole) {
    return interaction.followUp({
      content:
        "You're too high up for me to be able to assign your coloured role :(",
      ephemeral: true,
    });
  }
  const roleExistsForColour = interaction.guild.roles.cache.find(
    (role) => role.name === colourKey
  );
  const usersColourRoles = guildUser.roles.cache.filter((role) =>
    role.name.startsWith("CLR-")
  );
  await guildUser.roles.remove(usersColourRoles);
  const newColourRole = roleExistsForColour
    ? roleExistsForColour
    : await interaction.guild.roles.create({
        name: colourKey,
        color: assignableColour,
        position: usersTopmostRole + 1,
      });
  await guildUser.roles.add(newColourRole);
  const emptyRoles = interaction.guild.roles.cache.filter(
    (role) => role.name.startsWith("CLR-") && role.members.size === 0
  );
  for await (const [_, role] of emptyRoles) {
    await interaction.guild.roles.delete(role);
  }
  return interaction.followUp({ content: "Sorted! :)", ephemeral: true });
};

export { data, execute };
