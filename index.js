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

const fs = require("fs");


// ========================
// RAILWAY VARIABLES
// ========================

const TOKEN = process.env.TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;
const GUILD_ID = process.env.GUILD_ID;
const CATEGORY_ID = process.env.CATEGORY_ID;
const TEAM_ROLE_ID = process.env.TEAM_ROLE_ID;
const MEMBER_ROLE_ID = process.env.MEMBER_ROLE_ID;


// ========================
// PREISE LADEN
// ========================

let preise = {
  bot: "3€ – 8€",
  server: "3€ – 8€",
  bundle: "18€ – 22€",
  extras: "2€ – 5€"
};

if (fs.existsSync("./preise.json")) {
  preise = JSON.parse(fs.readFileSync("./preise.json"));
}


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
    .setDescription("Kaufanfrage Panel senden")
    .setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator)
    .toJSON(),

  new SlashCommandBuilder()
    .setName("vip-panel")
    .setDescription("VIP Panel senden")
    .setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator)
    .toJSON(),

  new SlashCommandBuilder()
    .setName("preise")
    .setDescription("Preise Embed senden")
    .setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator)
    .toJSON(),

];

const rest = new REST({ version: "10" }).setToken(TOKEN);

(async () => {

  console.log("Registriere Commands...");

  await rest.put(
    Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
    { body: commands }
  );

  console.log("Commands registriert");

})();


// ========================
// TICKET CREATE FUNCTION
// ========================

async function createTicket(interaction, type, serviceName) {

  if (!interaction.member.roles.cache.has(MEMBER_ROLE_ID)) {

    return interaction.reply({
      content: "❌ Du hast keine Berechtigung!",
      ephemeral: true
    });

  }

  const channel = await interaction.guild.channels.create({

    name: `${type}-${interaction.user.username}`,

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
        ],
      },

      {
        id: TEAM_ROLE_ID,
        allow: [
          PermissionsBitField.Flags.ViewChannel,
          PermissionsBitField.Flags.SendMessages,
        ],
      }

    ]

  });


  const embed = new EmbedBuilder()
    .setTitle("🎫 Ticket erstellt")
    .setColor("Green")
    .setDescription(
      type === "vip"
        ? "VIP Anfrage wurde erstellt"
        : `Service: ${serviceName}`
    );

  await channel.send({
    content: `<@${interaction.user.id}> <@&${TEAM_ROLE_ID}>`,
    embeds: [embed]
  });

  await interaction.reply({
    content: `✅ Ticket erstellt: ${channel}`,
    ephemeral: true
  });

}


// ========================
// INTERACTIONS
// ========================

client.on("interactionCreate", async interaction => {

  // ========================
  // SLASH COMMANDS
  // ========================

  if (interaction.isChatInputCommand()) {

    // Kaufanfrage Panel
    if (interaction.commandName === "panel") {

      const embed = new EmbedBuilder()
        .setTitle("🛍️ Kaufanfrage")
        .setDescription("Wähle deinen Service")
        .setColor("Blue");

      const menu = new StringSelectMenuBuilder()
        .setCustomId("buy_select")
        .setPlaceholder("Service auswählen")
        .addOptions([
          {
            label: "Bot Einrichtung",
            value: "Bot Einrichtung"
          },
          {
            label: "Server Einrichtung",
            value: "Server Einrichtung"
          },
          {
            label: "Bundle",
            value: "Bundle"
          }
        ]);

      const row = new ActionRowBuilder().addComponents(menu);

      await interaction.reply({
        embeds: [embed],
        components: [row]
      });

    }


    // VIP PANEL
    if (interaction.commandName === "vip-panel") {

      const embed = new EmbedBuilder()
        .setTitle("👑 VIP Anfrage")
        .setDescription("Erstelle ein VIP Ticket")
        .setColor("Gold");

      const menu = new StringSelectMenuBuilder()
        .setCustomId("vip_select")
        .setPlaceholder("VIP auswählen")
        .addOptions([
          {
            label: "VIP Ticket erstellen",
            value: "vip"
          }
        ]);

      const row = new ActionRowBuilder().addComponents(menu);

      await interaction.reply({
        embeds: [embed],
        components: [row]
      });

    }


    // PREISE
    if (interaction.commandName === "preise") {

      const embed = new EmbedBuilder()
        .setTitle("💰 Preise")
        .setColor("Blue")
        .setDescription(`

**🤖 Bot Einrichtung**
Preis: ${preise.bot}

**⚙️ Server Einrichtung**
Preis: ${preise.server}

**🔥 Bundle**
Preis: ${preise.bundle}

**⭐ Extras**
Preis: ${preise.extras}

📩 Ticket über Kaufanfrage Panel erstellen
`);

      await interaction.reply({
        embeds: [embed]
      });

    }

  }


  // ========================
  // SELECT MENUS
  // ========================

  if (interaction.isStringSelectMenu()) {

    if (interaction.customId === "buy_select") {

      const service = interaction.values[0];

      createTicket(interaction, "ticket", service);

    }

    if (interaction.customId === "vip_select") {

      createTicket(interaction, "vip", "VIP Bundle");

    }

  }

});


client.login(TOKEN);
