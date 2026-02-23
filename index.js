const {
  Client,
  GatewayIntentBits,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelType,
  PermissionsBitField,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
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

const LEITUNG_ROLE_ID = "1474814614406430771";
const SERVER_ROLE_ID = "1474739183128940676";

const KAUF_KATEGORIE_ID = "1475187295450566828";
const SUPPORT_KATEGORIE_ID = "1475207417800167466";

const LOG_CHANNEL_ID = "1475085569456607272";


// ================= SLASH COMMANDS =================

const commands = [

  new SlashCommandBuilder()
    .setName("panel")
    .setDescription("Kaufanfrage Panel senden"),

  new SlashCommandBuilder()
    .setName("vip-panel")
    .setDescription("VIP Panel senden"),

  new SlashCommandBuilder()
    .setName("preise-panel")
    .setDescription("Preise Panel senden"),

  new SlashCommandBuilder()
    .setName("support-panel")
    .setDescription("Support Panel senden")

];

client.once("clientReady", async () => {

  console.log(`${client.user.tag} online`);

  const rest = new REST({ version: "10" }).setToken(TOKEN);

  await rest.put(
    Routes.applicationCommands(client.user.id),
    { body: commands }
  );

});


// ================= CREATE TICKET =================

async function createTicket(interaction, ticketName, reason, categoryId) {

  if (!interaction.member.roles.cache.has(SERVER_ROLE_ID)) {

    return interaction.reply({
      content: "Du hast keine Berechtigung",
      ephemeral: true
    });

  }

  const guild = interaction.guild;

  const channel = await guild.channels.create({

    name: ticketName,

    type: ChannelType.GuildText,

    parent: categoryId,

    permissionOverwrites: [

      {
        id: guild.id,
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


  const embed = new EmbedBuilder()

    .setTitle("🎫 Ticket erstellt")
    .setDescription(`Grund: ${reason}`)
    .setColor("Green");


  await channel.send({

    content: `<@${interaction.user.id}>`,
    embeds: [embed],
    components: [closeRow]

  });


  // Fragen senden

  let questions = "";

  if (reason === "Bot Einrichtung") {

    questions =
`📋 Bot Einrichtung Fragen

1. Bot Name
2. Funktionen
3. Slash Commands?
4. Wünsche`;

  }

  if (reason === "Server Einrichtung") {

    questions =
`📋 Server Einrichtung Fragen

1. Server Art
2. Rollen
3. Moderation
4. Wünsche`;

  }

  if (reason === "Bundle") {

    questions =
`📋 Bundle Fragen

1. Bot Wünsche
2. Server Wünsche
3. Extras`;

  }

  if (reason === "VIP Support") {

    questions =
`⭐ VIP Fragen

1. Wünsche
2. Priorität
3. Extras`;

  }

  if (reason === "Support") {

    questions =
`📋 Support Fragen

Beschreibe dein Problem`;

  }

  if (questions !== "")
    channel.send({ content: questions });


  interaction.reply({

    content: `Ticket erstellt: ${channel}`,
    ephemeral: true

  });


  const log = interaction.guild.channels.cache.get(LOG_CHANNEL_ID);

  if (log) {

    log.send({

      embeds: [

        new EmbedBuilder()
          .setTitle("Ticket Log")
          .addFields(
            { name: "User", value: interaction.user.tag },
            { name: "Grund", value: reason },
            { name: "Ticket", value: channel.name }
          )
          .setColor("Blue")

      ]

    });

  }

}


// ================= INTERACTION =================

client.on(Events.InteractionCreate, async interaction => {


  // ================= COMMANDS =================

  if (interaction.isChatInputCommand()) {

    if (!interaction.member.roles.cache.has(LEITUNG_ROLE_ID)) {

      return interaction.reply({
        content: "Keine Berechtigung",
        ephemeral: true
      });

    }


    // KAUF PANEL

    if (interaction.commandName === "panel") {

      const embed = new EmbedBuilder()
        .setTitle("🛒 Kaufanfrage")
        .setDescription("Erstelle ein Ticket")
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


    // VIP PANEL

    if (interaction.commandName === "vip-panel") {

      const embed = new EmbedBuilder()
        .setTitle("⭐ VIP Panel")
        .setDescription("VIP Ticket erstellen")
        .setColor("Gold");

      const row = new ActionRowBuilder().addComponents(

        new ButtonBuilder()
          .setCustomId("vip")
          .setLabel("VIP Ticket")
          .setStyle(ButtonStyle.Success)

      );

      return interaction.reply({ embeds: [embed], components: [row] });

    }


    // SUPPORT PANEL

    if (interaction.commandName === "support-panel") {

      const embed = new EmbedBuilder()
        .setTitle("🆘 Support Panel")
        .setDescription("Support Ticket erstellen")
        .setColor("Red");

      const row = new ActionRowBuilder().addComponents(

        new ButtonBuilder()
          .setCustomId("support")
          .setLabel("Support Ticket")
          .setStyle(ButtonStyle.Danger)

      );

      return interaction.reply({ embeds: [embed], components: [row] });

    }


    // PREISE PANEL

    if (interaction.commandName === "preise-panel") {

      const modal = new ModalBuilder()
        .setCustomId("preise_modal")
        .setTitle("Preise eingeben");

      modal.addComponents(

        new ActionRowBuilder().addComponents(
          new TextInputBuilder()
            .setCustomId("bot")
            .setLabel("Bot Preis")
            .setStyle(TextInputStyle.Short)
        ),

        new ActionRowBuilder().addComponents(
          new TextInputBuilder()
            .setCustomId("server")
            .setLabel("Server Preis")
            .setStyle(TextInputStyle.Short)
        ),

        new ActionRowBuilder().addComponents(
          new TextInputBuilder()
            .setCustomId("bundle")
            .setLabel("Bundle Preis")
            .setStyle(TextInputStyle.Short)
        ),

        new ActionRowBuilder().addComponents(
          new TextInputBuilder()
            .setCustomId("extra")
            .setLabel("Extras Preis")
            .setStyle(TextInputStyle.Short)
        )

      );

      return interaction.showModal(modal);

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
      return createTicket(interaction, `vip-${interaction.user.username}`, "VIP Support", KAUF_KATEGORIE_ID);

    if (interaction.customId === "support")
      return createTicket(interaction, `support-${interaction.user.username}`, "Support", SUPPORT_KATEGORIE_ID);


    if (interaction.customId === "close_ticket") {

      if (!interaction.member.roles.cache.has(LEITUNG_ROLE_ID))
        return interaction.reply({ content: "Keine Berechtigung", ephemeral: true });

      interaction.channel.delete();

    }

  }


  // ================= PREISE MODAL =================

  if (interaction.isModalSubmit()) {

    if (interaction.customId === "preise_modal") {

      const bot = interaction.fields.getTextInputValue("bot");
      const server = interaction.fields.getTextInputValue("server");
      const bundle = interaction.fields.getTextInputValue("bundle");
      const extra = interaction.fields.getTextInputValue("extra");

      const embed = new EmbedBuilder()

  .setTitle("💰 Preise")

  .setDescription(`

🤖 **Bot Einstellung:** ${bot}
• Individuelle Bot Entwicklung
• Slash Commands möglich
• Datenbank Integration möglich
• Updates & Support inklusive

⚙️ **Server Einrichtung:** ${server}
• Komplettes Server Setup
• Rollen & Permissions
• Channels & Kategorien
• Modernes Design

🔥 **Bundle:** ${bundle}
• Bot + Server Einrichtung
• Perfekt abgestimmt
• Rabattierter Gesamtpreis
• Schnell & professionell

⭐ **Extras:** ${extra}
• Zusätzliche Features
• Spezial Funktionen
• Individuelle Wünsche möglich
• Erweiterungen jederzeit möglich

━━━━━━━━━━━━━━━━━━━━

📋 **Allgemeine Informationen**

• Hochwertige Entwicklung  
• Schneller Support  
• Individuelle Wünsche möglich  
• Sicher & zuverlässig  

`)

  .setColor("Gold");

      interaction.reply({ embeds: [embed] });

    }

  }

});


client.login(TOKEN);
