const {
  Client,
  GatewayIntentBits,
  EmbedBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  ChannelType,
  PermissionsBitField,
  SlashCommandBuilder,
  REST,
  Routes
} = require("discord.js");


// ========================
// VARIABLES VON RAILWAY
// ========================

const TOKEN = process.env.TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;
const GUILD_ID = process.env.GUILD_ID;
const CATEGORY_ID = process.env.CATEGORY_ID;
const TEAM_ROLE_ID = process.env.TEAM_ROLE_ID;


// ========================
// CLIENT
// ========================

const client = new Client({
  intents: [GatewayIntentBits.Guilds],
});


client.once("ready", () => {
  console.log("Bot ist online!");
});


// ========================
// SLASH COMMAND REGISTRIEREN
// ========================

const commands = [
  new SlashCommandBuilder()
    .setName("panel")
    .setDescription("Sendet das Ticket Panel")
    .toJSON(),
];


const rest = new REST({ version: "10" }).setToken(TOKEN);

(async () => {
  try {

    await rest.put(
      Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
      { body: commands }
    );

    console.log("Slash Command registriert");

  } catch (error) {
    console.log(error);
  }
})();


// ========================
// INTERACTIONS
// ========================

client.on("interactionCreate", async (interaction) => {

  // PANEL COMMAND
  if (interaction.isChatInputCommand()) {

    if (interaction.commandName === "panel") {

      const embed = new EmbedBuilder()
        .setTitle("🎫 Support Ticket")
        .setDescription("Wähle dein Thema")
        .setColor("Blue");


      const menu = new StringSelectMenuBuilder()
        .setCustomId("ticket_select")
        .setPlaceholder("Thema auswählen")
        .addOptions([
          {
            label: "Bot Erstellung",
            value: "bot"
          },
          {
            label: "Server Einrichtung",
            value: "server"
          },
          {
            label: "Bot + Server",
            value: "both"
          }
        ]);


      const row = new ActionRowBuilder().addComponents(menu);


      await interaction.reply({
        embeds: [embed],
        components: [row],
      });

    }

  }


  // TICKET ERSTELLEN
  if (interaction.isStringSelectMenu()) {

    if (interaction.customId === "ticket_select") {

      const thema = interaction.values[0];


      const channel = await interaction.guild.channels.create({
        name: `ticket-${interaction.user.username}`,
        type: ChannelType.GuildText,
        parent: CATEGORY_ID,

        permissionOverwrites: [

          {
            id: interaction.guild.id,
            deny: [PermissionsBitField.Flags.ViewChannel],
          },

          {
            id: interaction.user.id,
            allow: [
              PermissionsBitField.Flags.ViewChannel,
              PermissionsBitField.Flags.SendMessages,
              PermissionsBitField.Flags.ReadMessageHistory,
            ],
          },

          {
            id: TEAM_ROLE_ID,
            allow: [
              PermissionsBitField.Flags.ViewChannel,
              PermissionsBitField.Flags.SendMessages,
              PermissionsBitField.Flags.ReadMessageHistory,
            ],
          }

        ]

      });


      const embed = new EmbedBuilder()
        .setTitle("🎫 Ticket erstellt")
        .setDescription(`Thema: ${thema}`)
        .setColor("Green");


      await channel.send({
        content: `<@${interaction.user.id}>`,
        embeds: [embed],
      });


      await interaction.reply({
        content: `Ticket erstellt: ${channel}`,
        ephemeral: true,
      });

    }

  }

});


client.login(TOKEN);