const {
  Client,
  GatewayIntentBits,
  EmbedBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelType,
  PermissionsBitField,
  SlashCommandBuilder,
  REST,
  Routes,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  InteractionType
} = require("discord.js");

const TOKEN = process.env.TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;
const GUILD_ID = process.env.GUILD_ID;

// HIER DEINE IDs EINTRAGEN
const SERVER_MITGLIED_ROLE_ID = "1475052544383389718";
const TICKET_CATEGORY_ID = "1474868652896555080";
const LOG_CHANNEL_ID = "1475085569456607272";

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers
  ]
});

// ========================
// SLASH COMMANDS
// ========================

const commands = [

  new SlashCommandBuilder()
    .setName("panel")
    .setDescription("Sendet Kaufanfrage Panel"),

  new SlashCommandBuilder()
    .setName("vip")
    .setDescription("Sendet VIP Panel"),

  new SlashCommandBuilder()
    .setName("preise")
    .setDescription("Preise eingeben und senden")

].map(c => c.toJSON());

const rest = new REST({ version: "10" }).setToken(TOKEN);

client.once("ready", async () => {

  console.log(`Logged in as ${client.user.tag}`);

  await rest.put(
    Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
    { body: commands }
  );

});

// ========================
// INTERACTION HANDLER
// ========================

client.on("interactionCreate", async interaction => {

  // ========================
  // SLASH COMMANDS
  // ========================

  if (interaction.isChatInputCommand()) {

    // ========================
    // KAUFANFRAGE PANEL
    // ========================

    if (interaction.commandName === "panel") {

      const embed = new EmbedBuilder()
        .setTitle("🛒 Kaufanfrage")
        .setDescription("Wähle einen Service aus")
        .setColor("Blue");

      const menu = new StringSelectMenuBuilder()
        .setCustomId("service_select")
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
          },
          {
            label: "Extras",
            value: "Extras"
          }
        ]);

      const row = new ActionRowBuilder().addComponents(menu);

      await interaction.reply({
        embeds: [embed],
        components: [row]
      });

    }

    // ========================
    // VIP PANEL
    // ========================

    if (interaction.commandName === "vip") {

      const embed = new EmbedBuilder()
        .setTitle("💎 VIP Bundle")
        .setDescription(`
• Prioritäts Support
• Schnellere Bearbeitung
• Premium Features
• Extra Commands
• Exklusive Vorteile

Drücke den Button um ein VIP Ticket zu öffnen
`)
        .setColor("Gold");

      const button = new ButtonBuilder()
        .setCustomId("vip_ticket")
        .setLabel("VIP Ticket öffnen")
        .setStyle(ButtonStyle.Primary);

      const row = new ActionRowBuilder().addComponents(button);

      await interaction.reply({
        embeds: [embed],
        components: [row]
      });

    }

    // ========================
    // PREISE COMMAND
    // ========================

    if (interaction.commandName === "preise") {

      const modal = new ModalBuilder()
        .setCustomId("preise_modal")
        .setTitle("Preise eingeben");

      const botInput = new TextInputBuilder()
        .setCustomId("bot_price")
        .setLabel("Bot Preis")
        .setStyle(TextInputStyle.Short)
        .setRequired(true);

      const serverInput = new TextInputBuilder()
        .setCustomId("server_price")
        .setLabel("Server Preis")
        .setStyle(TextInputStyle.Short)
        .setRequired(true);

      const bundleInput = new TextInputBuilder()
        .setCustomId("bundle_price")
        .setLabel("Bundle Preis")
        .setStyle(TextInputStyle.Short)
        .setRequired(true);

      const extrasInput = new TextInputBuilder()
        .setCustomId("extras_price")
        .setLabel("Extras Preis")
        .setStyle(TextInputStyle.Short)
        .setRequired(true);

      modal.addComponents(
        new ActionRowBuilder().addComponents(botInput),
        new ActionRowBuilder().addComponents(serverInput),
        new ActionRowBuilder().addComponents(bundleInput),
        new ActionRowBuilder().addComponents(extrasInput)
      );

      await interaction.showModal(modal);

    }

  }

  // ========================
  // MODAL SUBMIT PREISE
  // ========================

  if (
    interaction.type === InteractionType.ModalSubmit &&
    interaction.customId === "preise_modal"
  ) {

    const botPrice = interaction.fields.getTextInputValue("bot_price");
    const serverPrice = interaction.fields.getTextInputValue("server_price");
    const bundlePrice = interaction.fields.getTextInputValue("bundle_price");
    const extrasPrice = interaction.fields.getTextInputValue("extras_price");

    const embed = new EmbedBuilder()
      .setTitle("💰 Preise")
      .setColor("Blue")
      .setDescription(`
🤖 Bot Einrichtung  
Preis: ${botPrice}

⚙️ Server Einrichtung  
Preis: ${serverPrice}

🔥 Bundle  
Preis: ${bundlePrice}

⭐ Extras  
Preis: ${extrasPrice}
`);

    await interaction.reply({
      embeds: [embed]
    });

  }

  // ========================
  // SERVICE SELECT
  // ========================

  if (interaction.isStringSelectMenu()) {

    if (interaction.customId === "service_select") {

      await createTicket(interaction, interaction.values[0]);

    }

  }

  // ========================
  // VIP BUTTON
  // ========================

  if (interaction.isButton()) {

    if (interaction.customId === "vip_ticket") {

      await createTicket(interaction, "VIP");

    }

    if (interaction.customId === "close_ticket") {

      const logChannel = interaction.guild.channels.cache.get(LOG_CHANNEL_ID);

      if (logChannel) {

        logChannel.send(`
Ticket geschlossen

User: ${interaction.user.tag}
Ticket: ${interaction.channel.name}
`);

      }

      await interaction.channel.delete();

    }

  }

});

// ========================
// CREATE TICKET FUNCTION
// ========================

async function createTicket(interaction, service) {

  if (!interaction.member.roles.cache.has(SERVER_MITGLIED_ROLE_ID)) {

    return interaction.reply({
      content: "Du hast keine Berechtigungen",
      ephemeral: true
    });

  }

  const channel = await interaction.guild.channels.create({

    name: `ticket-${interaction.user.username}`,
    type: ChannelType.GuildText,
    parent: TICKET_CATEGORY_ID,

    permissionOverwrites: [

      {
        id: interaction.guild.id,
        deny: [PermissionsBitField.Flags.ViewChannel]
      },

      {
        id: interaction.user.id,
        allow: [
          PermissionsBitField.Flags.ViewChannel,
          PermissionsBitField.Flags.SendMessages
        ]
      },

      {
        id: SERVER_MITGLIED_ROLE_ID,
        allow: [
          PermissionsBitField.Flags.ViewChannel,
          PermissionsBitField.Flags.SendMessages
        ]
      }

    ]

  });

  const embed = new EmbedBuilder()
    .setTitle("Ticket erstellt")
    .setDescription(`
User: ${interaction.user}
Service: ${service}
`)
    .setColor("Green");

  const closeButton = new ButtonBuilder()
    .setCustomId("close_ticket")
    .setLabel("Ticket schließen")
    .setStyle(ButtonStyle.Danger);

  const row = new ActionRowBuilder().addComponents(closeButton);

  await channel.send({
    content: `${interaction.user}`,
    embeds: [embed],
    components: [row]
  });

  const logChannel = interaction.guild.channels.cache.get(LOG_CHANNEL_ID);

  if (logChannel) {

    logChannel.send(`
Ticket erstellt

User: ${interaction.user.tag}
Service: ${service}
Channel: ${channel.name}
`);

  }

  await interaction.reply({
    content: `Ticket erstellt: ${channel}`,
    ephemeral: true
  });

}

// ========================

client.login(TOKEN);
