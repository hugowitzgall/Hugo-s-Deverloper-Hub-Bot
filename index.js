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
// SLASH COMMANDS
// ========================

const commands = [

  new SlashCommandBuilder()
    .setName("panel")
    .setDescription("Sendet das Kaufanfrage Panel")
    .toJSON(),

  new SlashCommandBuilder()
    .setName("vip-panel")
    .setDescription("Sendet das VIP Panel")
    .toJSON(),

  new SlashCommandBuilder()
    .setName("preise")
    .setDescription("Sendet die Preisliste")
    .toJSON(),

];


const rest = new REST({ version: "10" }).setToken(TOKEN);

(async () => {
  try {

    await rest.put(
      Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
      { body: commands }
    );

    console.log("Slash Commands registriert");

  } catch (error) {
    console.log(error);
  }
})();


// ========================
// INTERACTIONS
// ========================

client.on("interactionCreate", async (interaction) => {


  // ========================
  // KAUFANFRAGE PANEL
  // ========================

  if (interaction.isChatInputCommand()) {

    if (interaction.commandName === "panel") {

      const embed = new EmbedBuilder()
        .setTitle("🛍️ Kaufanfrage Ticket")
        .setDescription("Wähle deinen Service aus dem Menü")
        .setColor("Blue");


      const menu = new StringSelectMenuBuilder()
        .setCustomId("ticket_select")
        .setPlaceholder("Service auswählen")
        .addOptions([
          {
            label: "🤖 Bot Einrichtung",
            value: "bot"
          },
          {
            label: "⚙️ Server Einrichtung",
            value: "server"
          },
          {
            label: "🔥 Server + Bot Einrichtung",
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
    // VIP PANEL
    // ========================

    if (interaction.commandName === "vip-panel") {

      const embed = new EmbedBuilder()
        .setTitle("👑 VIP Anfrage Ticket")
        .setDescription("Erstelle ein Ticket für das VIP Bundle")
        .setColor("Gold");


      const menu = new StringSelectMenuBuilder()
        .setCustomId("vip_select")
        .setPlaceholder("VIP auswählen")
        .addOptions([
          {
            label: "👑 VIP Bundle kaufen",
            value: "vip"
          }
        ]);

      const row = new ActionRowBuilder().addComponents(menu);

      await interaction.reply({
        embeds: [embed],
        components: [row],
      });

    }


    // ========================
    // PREISE EMBED
    // ========================

    if (interaction.commandName === "preise") {

      const embed = new EmbedBuilder()
        .setColor("Blue")
        .setTitle("💰 Preise")
        .setDescription(
`**🤖 Bot Einrichtung**
💶 Preis: 3€ – 8€
📦 Beinhaltet:
• 🎫 Ticket System
• 🛡️ Moderations Commands
• ⚙️ Custom Commands
• 👥 Rollen & Permissions Integration
• ✅ Fertig eingerichteter Bot

━━━━━━━━━━━━━━━━━━━━

**⚙️ Server Einrichtung**
💶 Preis: 3€ – 8€
📦 Beinhaltet:
• 📁 Kategorien & Channels Setup
• 👥 Rollen System
• 🔒 Permissions Setup
• 🎨 Übersichtliches & sauberes Design
• ✅ Komplett fertiger Server

━━━━━━━━━━━━━━━━━━━━

**🔥 Server + Bot Einrichtung**
💶 Preis: 18€ – 22€
📦 Beinhaltet:
• ⚙️ Komplettes Server Setup
• 🤖 Komplettes Bot Setup
• 🔗 Perfekt aufeinander abgestimmt
• 🚀 Sofort einsatzbereit
• ⭐ Beste Wahl für Communities

━━━━━━━━━━━━━━━━━━━━

**⭐ Extras**
• ⚙️ Extra Commands → +2€
• 🔧 Zusätzliche Features → +2€ – 5€
• ⚡ Priorität → +3€

━━━━━━━━━━━━━━━━━━━━

📩 **Bestellung**
Öffne ein Ticket unter:
🛍️ 『𝑲𝒂𝒖𝒇-𝒂𝒏𝒇𝒓𝒂𝒈𝒆』

⚡ Schnelle Bearbeitung  
🔒 Zuverlässiger Service  
💬 Support jederzeit verfügbar`
        );

      await interaction.reply({
        embeds: [embed]
      });

    }

  }


  // ========================
  // NORMAL TICKET ERSTELLEN
  // ========================

  if (interaction.isStringSelectMenu()) {

    if (interaction.customId === "ticket_select") {

      const service = interaction.values[0];

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
        .setDescription(`Service: ${service}`)
        .setColor("Green");


      await channel.send({
        content: `<@${interaction.user.id}>`,
        embeds: [embed],
      });


      await interaction.reply({
        content: `✅ Ticket erstellt: ${channel}`,
        ephemeral: true,
      });

    }


    // ========================
    // VIP TICKET ERSTELLEN
    // ========================

    if (interaction.customId === "vip_select") {

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
        .setTitle("👑 VIP Ticket erstellt")
        .setDescription("VIP Anfrage wurde erstellt")
        .setColor("Gold");


      await channel.send({
        content: `<@${interaction.user.id}>`,
        embeds: [embed],
      });


      await interaction.reply({
        content: `👑 VIP Ticket erstellt: ${channel}`,
        ephemeral: true,
      });

    }

  }

});


client.login(TOKEN);
