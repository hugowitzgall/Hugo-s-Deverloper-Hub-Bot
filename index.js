const {
  Client,
  GatewayIntentBits,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelType,
  PermissionsBitField,
  Events,
  SlashCommandBuilder,
  REST,
  Routes
} = require("discord.js");

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});


// ================= CONFIG =================

const TOKEN = process.env.TOKEN;

const GUILD_ID = "1474737014732493012";

const LEITUNG_ROLE_ID = "1474814614406430771";
const SERVER_ROLE_ID = "1474739183128940676";

const KAUF_KATEGORIE_ID = "1475187295450566828";
const SUPPORT_KATEGORIE_ID = "1475207417800167466";


// ================= SLASH COMMANDS =================

const commands = [

  new SlashCommandBuilder()
    .setName("panel")
    .setDescription("Kauf Panel senden"),

  new SlashCommandBuilder()
    .setName("vip-panel")
    .setDescription("VIP Panel senden"),

  new SlashCommandBuilder()
    .setName("preise-panel")
    .setDescription("Preise Panel senden"),

  new SlashCommandBuilder()
    .setName("support")
    .setDescription("Support Panel senden")

];

client.once("clientReady", async () => {

  console.log(`${client.user.tag} online`);

  const rest = new REST({ version: "10" }).setToken(TOKEN);

  await rest.put(
    Routes.applicationGuildCommands(client.user.id, GUILD_ID),
    { body: commands }
  );

});


// ================= CREATE TICKET =================

async function createTicket(interaction, name, reason, category) {

  if (!interaction.member.roles.cache.has(SERVER_ROLE_ID))
    return interaction.reply({ content: "Keine Berechtigung", ephemeral: true });

  const channel = await interaction.guild.channels.create({

    name: name,
    type: ChannelType.GuildText,
    parent: category,

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
        id: LEITUNG_ROLE_ID,
        allow: [
          PermissionsBitField.Flags.ViewChannel,
          PermissionsBitField.Flags.SendMessages
        ]
      }

    ]

  });

  const closeRow = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId("close_ticket")
      .setLabel("Ticket schließen")
      .setStyle(ButtonStyle.Danger)
  );

  await channel.send({
    content: `<@${interaction.user.id}>`,
    embeds: [
      new EmbedBuilder()
        .setTitle("🎫 Ticket erstellt")
        .setDescription(`Grund: ${reason}`)
        .setColor("Green")
    ],
    components: [closeRow]
  });

  // Fragen automatisch senden

  let questions = "";

  if (reason === "Bot Einrichtung") {
    questions =
`📋 Bot Fragen
1. Bot Name
2. Funktionen
3. Slash Commands?
4. Wünsche`;
  }

  if (reason === "Server Einrichtung") {
    questions =
`📋 Server Fragen
1. Server Art
2. Rollen Anzahl
3. Moderation?
4. Design Wünsche`;
  }

  if (reason === "Bundle") {
    questions =
`📋 Bundle Fragen
1. Bot Wünsche
2. Server Wünsche
3. Extras`;
  }

  if (reason === "VIP") {
    questions =
`⭐ VIP Fragen
1. Wunsch
2. Priorität
3. Extras`;
  }

  if (reason === "Support") {
    questions =
`📋 Support
Beschreibe dein Problem genau.`;
  }

  if (questions !== "") channel.send({ content: questions });

  interaction.reply({ content: `Ticket erstellt: ${channel}`, ephemeral: true });

}


// ================= INTERACTIONS =================

client.on(Events.InteractionCreate, async interaction => {

  // ================= COMMANDS =================

  if (interaction.isChatInputCommand()) {

    if (!interaction.member.roles.cache.has(LEITUNG_ROLE_ID))
      return interaction.reply({ content: "Keine Berechtigung", ephemeral: true });


    // ===== KAUF PANEL =====

    if (interaction.commandName === "panel") {

      const embed = new EmbedBuilder()
        .setTitle("🛒 Kaufanfrage")
        .setDescription(`
Wähle dein Produkt:

• Professionelle Entwicklung
• Schneller Support
• Individuelle Wünsche möglich
`)
        .setColor("Blue");

      const row = new ActionRowBuilder().addComponents(

        new ButtonBuilder()
          .setCustomId("bot")
          .setLabel("Bot Einrichtung")
          .setStyle(ButtonStyle.Primary),

        new ButtonBuilder()
          .setCustomId("server")
          .setLabel("Server Einrichtung")
          .setStyle(ButtonStyle.Primary),

        new ButtonBuilder()
          .setCustomId("bundle")
          .setLabel("Bundle")
          .setStyle(ButtonStyle.Success)

      );

      return interaction.reply({ embeds: [embed], components: [row] });

    }


    // ===== VIP PANEL (ALT) =====

    if (interaction.commandName === "vip-panel") {

      const embed = new EmbedBuilder()
        .setTitle("⭐ VIP Support")
        .setDescription(`
• Schnellere Bearbeitung
• Priorität
• Direkter Kontakt
`)
        .setColor("Gold");

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId("vip")
          .setLabel("VIP Ticket öffnen")
          .setStyle(ButtonStyle.Success)
      );

      return interaction.reply({ embeds: [embed], components: [row] });

    }


    // ===== PREISE PANEL (ALTES EMBED) =====

    if (interaction.commandName === "preise-panel") {

      const embed = new EmbedBuilder()

        .setTitle("💰 Preise")

        .setDescription(`

🤖 **Bot Einrichtung**
Preis auf Anfrage
• Individuelle Bot Entwicklung
• Slash Commands möglich
• Datenbank Integration
• Updates inklusive

⚙️ **Server Einrichtung**
Preis auf Anfrage
• Komplettes Setup
• Rollen & Permissions
• Modernes Design
• Sicherheit optimiert

🔥 **Bundle**
Preis auf Anfrage
• Bot + Server
• Rabattierter Gesamtpreis
• Perfekt abgestimmt

⭐ **Extras**
Preis individuell
• Zusatzfunktionen
• Spezial Features
• Erweiterungen möglich

━━━━━━━━━━━━━━━━━━━━
• Hochwertige Entwicklung
• Schneller Support
• Sicher & zuverlässig
`)
        .setColor("Gold");

      return interaction.reply({ embeds: [embed] });

    }


    // ===== SUPPORT PANEL =====

    if (interaction.commandName === "support") {

      const embed = new EmbedBuilder()
        .setTitle("🆘 Support")
        .setDescription("Klicke unten um ein Support Ticket zu öffnen.")
        .setColor("Red");

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId("support")
          .setLabel("Support Ticket")
          .setStyle(ButtonStyle.Danger)
      );

      return interaction.reply({ embeds: [embed], components: [row] });

    }

  }


  // ================= BUTTONS =================

  if (interaction.isButton()) {

    if (interaction.customId === "bot")
      return createTicket(interaction, `bot-${interaction.user.username}`, "Bot Einrichtung", KAUF_KATEGORIE_ID);

    if (interaction.customId === "server")
      return createTicket(interaction, `server-${interaction.user.username}`, "Server Einrichtung", KAUF_KATEGORIE_ID);

    if (interaction.customId === "bundle")
      return createTicket(interaction, `bundle-${interaction.user.username}`, "Bundle", KAUF_KATEGORIE_ID);

    if (interaction.customId === "vip")
      return createTicket(interaction, `vip-${interaction.user.username}`, "VIP", KAUF_KATEGORIE_ID);

    if (interaction.customId === "support")
      return createTicket(interaction, `support-${interaction.user.username}`, "Support", SUPPORT_KATEGORIE_ID);

    if (interaction.customId === "close_ticket") {

      if (!interaction.member.roles.cache.has(LEITUNG_ROLE_ID))
        return interaction.reply({ content: "Keine Berechtigung", ephemeral: true });

      interaction.channel.delete();

    }

  }

});


client.login(TOKEN);
