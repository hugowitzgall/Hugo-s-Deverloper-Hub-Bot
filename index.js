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
  console.log(`✅ Bot ist online als ${client.user.tag}`);
});


// ========================
// SLASH COMMANDS
// ========================

const commands = [

  new SlashCommandBuilder()
    .setName("panel")
    .setDescription("Sendet das Kaufanfrage Panel")
    .toJSON(),

  new SlashCommandBuilder()
    .setName("vip-panel")
    .setDescription("Sendet das VIP Kaufanfrage Panel")
    .toJSON(),

];

const rest = new REST({ version: "10" }).setToken(TOKEN);

(async () => {
  try {

    await rest.put(
      Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
      { body: commands }
    );

    console.log("✅ Slash Commands registriert");

  } catch (error) {
    console.log(error);
  }
})();


// ========================
// INTERACTIONS
// ========================

client.on("interactionCreate", async (interaction) => {

  // ========================
  // NORMAL PANEL COMMAND
  // ========================

  if (interaction.isChatInputCommand()) {

    if (interaction.commandName === "panel") {

      const embed = new EmbedBuilder()
        .setTitle("🛍️ Kaufanfrage Panel")
        .setDescription(
          "Willkommen im Kaufbereich!\n\n" +
          "Wähle unten den Service aus, den du kaufen möchtest.\n\n" +
          "💰 **Bundle Preis:** 18-22€\n\n" +
          "Nach Auswahl wird automatisch ein Ticket erstellt."
        )
        .setColor("#2b6cff")
        .setFooter({ text: "Support antwortet schnellstmöglich" });

      const menu = new StringSelectMenuBuilder()
        .setCustomId("ticket_select")
        .setPlaceholder("Service auswählen")
        .addOptions([
          {
            label: "Bot Erstellung",
            description: "Individueller Discord Bot",
            value: "bot"
          },
          {
            label: "Server Einrichtung",
            description: "Komplette Server Einrichtung",
            value: "server"
          },
          {
            label: "Bot + Server Bundle",
            description: "Komplettes Bundle für 18-22€",
            value: "bundle"
          }
        ]);

      const row = new ActionRowBuilder().addComponents(menu);

      await interaction.reply({
        embeds: [embed],
        components: [row],
      });

    }


    // ========================
    // VIP PANEL COMMAND
    // ========================

    if (interaction.commandName === "vip-panel") {

      const embed = new EmbedBuilder()
        .setTitle("💎 VIP Bundle Kaufanfrage")
        .setDescription(
          "**Preis: 25€**\n\n" +

          "**VIP Vorteile:**\n" +
          "• Komplett individueller Bot\n" +
          "• Professionelle Server Einrichtung\n" +
          "• Prioritäts Support\n" +
          "• Exklusive VIP Features\n" +
          "• Schnellere Fertigstellung\n" +
          "• Anpassungen nach Wunsch\n\n" +

          "Wähle unten aus, um ein VIP Ticket zu erstellen."
        )
        .setColor("#ffd700")
        .setFooter({ text: "VIP Kunden erhalten Priorität" });

      const menu = new StringSelectMenuBuilder()
        .setCustomId("vip_ticket_select")
        .setPlaceholder("VIP Anfrage starten")
        .addOptions([
          {
            label: "VIP Bundle kaufen (25€)",
            description: "VIP Bot + Server + exklusive Vorteile",
            value: "vip"
          }
        ]);

      const row = new ActionRowBuilder().addComponents(menu);

      await interaction.reply({
        embeds: [embed],
        components: [row],
      });

    }

  }


  // ========================
  // NORMAL TICKET ERSTELLUNG
  // ========================

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
        .setTitle("🎫 Kaufanfrage Ticket")
        .setDescription(
          `**Service:** ${thema}\n\n` +
          "Das Team wird dir bald antworten.\n\n" +
          "Bitte beschreibe genau, was du möchtest."
        )
        .setColor("#00b300");

      await channel.send({
        content: `<@${interaction.user.id}> <@&${TEAM_ROLE_ID}>`,
        embeds: [embed],
      });

      await interaction.reply({
        content: `✅ Ticket erstellt: ${channel}`,
        ephemeral: true,
      });

    }


    // ========================
    // VIP TICKET ERSTELLUNG
    // ========================

    if (interaction.customId === "vip_ticket_select") {

      const channel = await interaction.guild.channels.create({
        name: `vip-${interaction.user.username}`,
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
        .setTitle("💎 VIP Ticket erstellt")
        .setDescription(
          "**VIP Bundle Anfrage (25€)**\n\n" +
          "Danke für dein Interesse am VIP Bundle!\n\n" +
          "Ein Teammitglied wird sich mit höchster Priorität um dich kümmern."
        )
        .setColor("#ffd700");

      await channel.send({
        content: `<@${interaction.user.id}> <@&${TEAM_ROLE_ID}>`,
        embeds: [embed],
      });

      await interaction.reply({
        content: `💎 VIP Ticket erstellt: ${channel}`,
        ephemeral: true,
      });

    }

  }

});

client.login(TOKEN);

