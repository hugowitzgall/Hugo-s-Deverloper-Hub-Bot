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

const TOKEN = process.env.TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;
const GUILD_ID = process.env.GUILD_ID;

const LEITUNG_ROLE_ID = "1474814614406430771";
const KAUF_KATEGORIE_ID = "1475187295450566828";
const SUPPORT_KATEGORIE_ID = "1475207417800167466";



/* ================= COMMANDS ================= */

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

].map(c => c.toJSON());



/* ================= READY ================= */

client.once("clientReady", async () => {

  console.log(`${client.user.tag} online`);

  const rest = new REST({ version: "10" }).setToken(TOKEN);

  await rest.put(
    Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
    { body: commands }
  );

  console.log("Commands synchronisiert");

});



/* ================= TICKET SYSTEM ================= */

async function createTicket(interaction, name, reason, categoryId, sendQuestions = false) {

  const channel = await interaction.guild.channels.create({
    name: name,
    type: ChannelType.GuildText,
    parent: categoryId,
    permissionOverwrites: [
      {
        id: interaction.guild.id,
        deny: [PermissionsBitField.Flags.ViewChannel]
      },
      {
        id: interaction.user.id,
        allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages]
      },
      {
        id: LEITUNG_ROLE_ID,
        allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages]
      }
    ]
  });

  await interaction.reply({
    content: `Ticket erstellt: ${channel}`,
    ephemeral: true
  });

  if (sendQuestions) {

    let fragen = "";

    if (reason === "Bot Einrichtung") {
      fragen =
`📋 Bot Fragen
• Bot Name?
• Funktionen?
• Slash Commands?
• Weitere Wünsche?`;
    }

    if (reason === "Server Einrichtung") {
      fragen =
`📋 Server Fragen
• Welche Art Server?
• Wie viele Rollen?
• Design Wünsche?`;
    }

    if (reason === "Bundle") {
      fragen =
`📋 Bundle Fragen
• Bot Wünsche?
• Server Wünsche?
• Extras?`;
    }

    if (fragen !== "")
      channel.send({ content: `<@${interaction.user.id}>\n${fragen}` });

  }

}



/* ================= INTERACTIONS ================= */

client.on(Events.InteractionCreate, async interaction => {

  /* ========= COMMANDS ========= */

  if (interaction.isChatInputCommand()) {

    if (!interaction.member.roles.cache.has(LEITUNG_ROLE_ID))
      return interaction.reply({ content: "Keine Berechtigung", ephemeral: true });



    /* ===== KAUF PANEL ===== */

    if (interaction.commandName === "panel") {

      const embed = new EmbedBuilder()
        .setTitle("🛒 Kauf Panel")
        .setDescription("Wähle dein Paket")
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



    /* ===== VIP PANEL ===== */

    if (interaction.commandName === "vip-panel") {

      const embed = new EmbedBuilder()
        .setTitle("⭐ VIP Panel")
        .setDescription("VIP Ticket öffnen")
        .setColor("Gold");

      const row = new ActionRowBuilder().addComponents(

        new ButtonBuilder()
          .setCustomId("vip")
          .setLabel("VIP Ticket")
          .setStyle(ButtonStyle.Success)

      );

      return interaction.reply({ embeds: [embed], components: [row] });

    }



    /* ===== SUPPORT PANEL ===== */

    if (interaction.commandName === "support") {

      const embed = new EmbedBuilder()
        .setTitle("🆘 Support Panel")
        .setDescription("Support Ticket öffnen")
        .setColor("Red");

      const row = new ActionRowBuilder().addComponents(

        new ButtonBuilder()
          .setCustomId("support_ticket")
          .setLabel("Support Ticket öffnen")
          .setStyle(ButtonStyle.Danger)

      );

      return interaction.reply({ embeds: [embed], components: [row] });

    }



    /* ===== PREISE PANEL (ALTES EMBED) ===== */

    if (interaction.commandName === "preise-panel") {

      const embed = new EmbedBuilder()

        .setTitle("💰 Preise")

        .setDescription(`

🤖 **Bot Einrichtung**
• Individuelle Bot Entwicklung
• Slash Commands möglich
• Datenbank Integration
Preis auf Anfrage

⚙️ **Server Einrichtung**
• Komplettes Setup
• Rollen & Permissions
• Modernes Design
Preis auf Anfrage

🔥 **Bundle**
• Bot + Server
• Rabattierter Gesamtpreis
Preis auf Anfrage

⭐ **Extras**
• Zusatzfunktionen
• Erweiterungen möglich
Preis individuell

━━━━━━━━━━━━━━━━━━━━
• Hochwertige Entwicklung
• Schneller Support
• Sicher & zuverlässig
`)

        .setColor("Gold");

      return interaction.reply({ embeds: [embed] });

    }

  }



  /* ========= BUTTONS ========= */

  if (interaction.isButton()) {

    if (interaction.customId === "bot")
      return createTicket(interaction, `bot-${interaction.user.username}`, "Bot Einrichtung", KAUF_KATEGORIE_ID, true);

    if (interaction.customId === "server")
      return createTicket(interaction, `server-${interaction.user.username}`, "Server Einrichtung", KAUF_KATEGORIE_ID, true);

    if (interaction.customId === "bundle")
      return createTicket(interaction, `bundle-${interaction.user.username}`, "Bundle", KAUF_KATEGORIE_ID, true);

    if (interaction.customId === "vip")
      return createTicket(interaction, `vip-${interaction.user.username}`, "VIP", KAUF_KATEGORIE_ID);

    if (interaction.customId === "support_ticket")
      return createTicket(interaction, `support-${interaction.user.username}`, "Support", SUPPORT_KATEGORIE_ID);

  }

});



client.login(TOKEN);
