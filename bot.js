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
// HIER DEINE DATEN EINTRAGEN
// ========================

const TOKEN = "MTQ3NDg2NzEwMjkyOTEyNTQ4OQ.GXYZqn.jISS4WUmU4INAwXsu_Ef8gg1aZckRcEVuYnejU";
const CLIENT_ID = "1474867102929125489";
const GUILD_ID = "1474737014732493012";
const CATEGORY_ID = "1474868652896555080";
const TEAM_ROLE_ID = "1474814614406430771";


// ========================
// BOT STARTEN
// ========================

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds
  ]
});

client.once("ready", () => {
  console.log("Ticket Bot ist online!");
});


// ========================
// SLASH COMMAND ERSTELLEN
// ========================

const commands = [
  new SlashCommandBuilder()
    .setName("panel")
    .setDescription("Sendet das Ticket Panel")
    .toJSON()
];

const rest = new REST({ version: "10" }).setToken(TOKEN);

(async () => {
  try {
    await rest.put(
      Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
      { body: commands }
    );
    console.log("Slash Command wurde erstellt.");
  } catch (error) {
    console.error(error);
  }
})();


// ========================
// SLASH COMMAND AUSFÜHREN
// ========================

client.on("interactionCreate", async (interaction) => {

  if (interaction.isChatInputCommand()) {

    if (interaction.commandName === "panel") {

      const embed = new EmbedBuilder()
        .setTitle("🎫 Support Ticket")
        .setDescription("Wähle ein Thema aus, um ein Ticket zu erstellen.")
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
            label: "Bot + Server Einrichtung",
            value: "both"
          }
        ]);

      const row = new ActionRowBuilder().addComponents(menu);

      await interaction.reply({
        embeds: [embed],
        components: [row]
      });

    }

  }


  // ========================
  // TICKET ERSTELLEN
  // ========================

  if (interaction.isStringSelectMenu()) {

    if (interaction.customId === "ticket_select") {

      let thema = "";

      if (interaction.values[0] === "bot")
        thema = "🤖 BOT ERSTELLUNG";

      if (interaction.values[0] === "server")
        thema = "⚙️ SERVER EINRICHTUNG";

      if (interaction.values[0] === "both")
        thema = "🔥 BOT + SERVER EINRICHTUNG";


      const channel = await interaction.guild.channels.create({
        name: `ticket-${interaction.user.username}`,
        type: ChannelType.GuildText,
        parent: CATEGORY_ID,

       permissionOverwrites: [

  {
    id: interaction.guild.id,
    deny: [
      PermissionsBitField.Flags.ViewChannel
    ],
  },

  {
    id: interaction.user.id,
    allow: [
      PermissionsBitField.Flags.ViewChannel,
      PermissionsBitField.Flags.SendMessages,
      PermissionsBitField.Flags.ReadMessageHistory,
      PermissionsBitField.Flags.AttachFiles,
      PermissionsBitField.Flags.EmbedLinks
    ],
  },

  {
    id: TEAM_ROLE_ID,
    allow: [
      PermissionsBitField.Flags.ViewChannel,
      PermissionsBitField.Flags.SendMessages,
      PermissionsBitField.Flags.ReadMessageHistory,
      PermissionsBitField.Flags.AttachFiles,
      PermissionsBitField.Flags.EmbedLinks
    ],
  }

]
      });


      const embed = new EmbedBuilder()
        .setTitle("🎫 Ticket erstellt")
        .setDescription(`# ${thema}`)
        .setColor("Green");


      await channel.send({
        content: `<@${interaction.user.id}>`,
        embeds: [embed]
      });


      await interaction.followUp({
  content: `✅ Dein Ticket wurde erstellt: ${channel}`,
  ephemeral: true
});

    }

  }

});

client.login(TOKEN);