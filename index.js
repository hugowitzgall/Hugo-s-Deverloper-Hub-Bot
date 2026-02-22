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
// ENV VARS (Railway)
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

client.once("clientReady", () => {
  console.log(`✅ Bot ist online als ${client.user.tag}`);
});


// ========================
// SLASH COMMANDS REGISTRIEREN
// ========================

const commands = [

  new SlashCommandBuilder()
    .setName("panel")
    .setDescription("Sendet das Kaufanfrage Panel"),

  new SlashCommandBuilder()
    .setName("vip-panel")
    .setDescription("Sendet das VIP Panel"),

  new SlashCommandBuilder()
    .setName("preise")
    .setDescription("Zeigt die Preisliste"),

].map(cmd => cmd.toJSON());


const rest = new REST({ version: "10" }).setToken(TOKEN);

async function registerCommands() {

  try {

    console.log("🔄 Registriere Slash Commands...");

    await rest.put(
      Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
      { body: commands }
    );

    console.log("✅ Slash Commands registriert");

  } catch (error) {
    console.error(error);
  }

}


// ========================
// INTERACTIONS
// ========================

client.on("interactionCreate", async (interaction) => {

  if (!interaction.isChatInputCommand()) return;


  // ========================
  // PREISE COMMAND
  // ========================

  if (interaction.commandName === "preise") {

    const embed = new EmbedBuilder()
      .setColor("#2b2d31")
      .setTitle("💰 PREISE")
      .setDescription(`
**🤖 Bot Einrichtung**
💶 Preis: 3€ – 8€
• Ticket System
• Moderations Commands
• Custom Commands
• Rollen & Permissions
• Fertig eingerichtet

━━━━━━━━━━━━━━━━━━━━

**⚙️ Server Einrichtung**
💶 Preis: 3€ – 8€
• Kategorien & Channels
• Rollen Setup
• Permissions Setup
• Sauberes Design
• Komplett fertig

━━━━━━━━━━━━━━━━━━━━

**🔥 Bundle**
💶 Preis: 18€ – 22€
• Server Setup
• Bot Setup
• Perfekt abgestimmt
• Sofort bereit

━━━━━━━━━━━━━━━━━━━━

**⭐ Extras**
• Extra Commands → +2€
• Features → +2€ – 5€
• Priorität → +3€

━━━━━━━━━━━━━━━━━━━━

📩 Ticket öffnen unter:
🛍️ Kaufanfrage Ticket

⚡ Schnell  
🔒 Sicher  
💬 Support verfügbar
`);

    await interaction.reply({
      embeds: [embed]
    });

  }


  // ========================
  // NORMAL PANEL
  // ========================

  if (interaction.commandName === "panel") {

    const embed = new EmbedBuilder()
      .setTitle("🛍️ Kaufanfrage Ticket")
      .setDescription("Wähle deinen Service")
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
          label: "🔥 Bundle",
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
      .setTitle("👑 VIP Anfrage")
      .setDescription("VIP Ticket erstellen")
      .setColor("Gold");

    const menu = new StringSelectMenuBuilder()
      .setCustomId("vip_select")
      .setPlaceholder("VIP auswählen")
      .addOptions([
        {
          label: "👑 VIP Bundle",
          value: "vip"
        }
      ]);

    const row = new ActionRowBuilder().addComponents(menu);

    await interaction.reply({
      embeds: [embed],
      components: [row],
    });

  }

});


// ========================
// START
// ========================

client.login(TOKEN);
registerCommands();
