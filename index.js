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
    .setDescription("Sendet Kauf Panel"),

  new SlashCommandBuilder()
    .setName("vip-panel")
    .setDescription("Sendet VIP Panel"),

  new SlashCommandBuilder()
    .setName("preise-panel")
    .setDescription("Sendet Preise Panel"),

  new SlashCommandBuilder()
    .setName("support-ticket")
    .setDescription("Support Ticket erstellen")

];

client.once("ready", async () => {

  console.log(`${client.user.tag} online`);

  const rest = new REST({ version: "10" }).setToken(TOKEN);

  await rest.put(
    Routes.applicationCommands(client.user.id),
    { body: commands }
  );

});


// ================= CREATE TICKET FUNCTION =================

async function createTicket(interaction, name, reason, categoryId, isSupport = false) {

  const guild = interaction.guild;

  const channel = await guild.channels.create({
    name: name,
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


  const closeButton = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId("close_ticket")
      .setLabel("Ticket schließen")
      .setStyle(ButtonStyle.Danger)
  );


  const embed = new EmbedBuilder()
    .setTitle("🎫 Ticket erstellt")
    .setDescription(`Grund: **${reason}**`)
    .setColor("Green");


  await channel.send({
    content: `<@${interaction.user.id}>`,
    embeds: [embed],
    components: [closeButton]
  });


  // ================= KAUF FRAGEN =================

  if (!isSupport) {

    let questions = "";

    if (reason === "Bot Einrichtung") {

      questions = `
📋 **Bot Einrichtung Fragen**

1️⃣ Bot Name  
2️⃣ Bot Funktionen  
3️⃣ Slash Commands gewünscht?  
4️⃣ Besondere Wünsche  
`;

    }

    if (reason === "Server Einrichtung") {

      questions = `
📋 **Server Einrichtung Fragen**

1️⃣ Server Art  
2️⃣ Rollen Anzahl  
3️⃣ Moderation benötigt?  
4️⃣ Design Wünsche  
`;

    }

    if (reason === "Bundle") {

      questions = `
📋 **Bundle Fragen**

1️⃣ Bot Funktionen  
2️⃣ Server Setup Wünsche  
3️⃣ Extras gewünscht  
`;

    }

    if (questions !== "") {

      await channel.send({ content: questions });

    }

  }


  interaction.reply({
    content: `Ticket erstellt: ${channel}`,
    ephemeral: true
  });


  const log = interaction.guild.channels.cache.get(LOG_CHANNEL_ID);

  if (log) {

    log.send({

      embeds: [

        new EmbedBuilder()
          .setTitle("Ticket erstellt")
          .addFields(
            { name: "User", value: interaction.user.tag },
            { name: "Ticket", value: channel.name },
            { name: "Grund", value: reason }
          )
          .setColor("Green")

      ]

    });

  }

}


// ================= INTERACTION =================

client.on(Events.InteractionCreate, async interaction => {


  // ================= SLASH COMMANDS =================

  if (interaction.isChatInputCommand()) {

    if (!interaction.member.roles.cache.has(LEITUNG_ROLE_ID)) {

      return interaction.reply({
        content: "Keine Berechtigung",
        ephemeral: true
      });

    }


    // ===== KAUF PANEL =====

    if (interaction.commandName === "panel") {

      const embed = new EmbedBuilder()
        .setTitle("🛒 Kaufanfrage")
        .setDescription("Wähle eine Option")
        .setColor("Blue");


      const row = new ActionRowBuilder().addComponents(

        new ButtonBuilder()
          .setCustomId("bot_kauf")
          .setLabel("Bot Einrichtung")
          .setStyle(ButtonStyle.Primary),

        new ButtonBuilder()
          .setCustomId("server_kauf")
          .setLabel("Server Einrichtung")
          .setStyle(ButtonStyle.Primary),

        new ButtonBuilder()
          .setCustomId("bundle_kauf")
          .setLabel("Bundle")
          .setStyle(ButtonStyle.Success)

      );

      return interaction.reply({
        embeds: [embed],
        components: [row]
      });

    }


    // ===== VIP PANEL =====

    if (interaction.commandName === "vip-panel") {

      const embed = new EmbedBuilder()
        .setTitle("⭐ VIP Panel")
        .setDescription("VIP Support öffnen")
        .setColor("Gold");

      const row = new ActionRowBuilder().addComponents(

        new ButtonBuilder()
          .setCustomId("vip_ticket")
          .setLabel("VIP Ticket")
          .setStyle(ButtonStyle.Success)

      );

      return interaction.reply({
        embeds: [embed],
        components: [row]
      });

    }


    // ===== PREISE PANEL =====

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


    // ===== SUPPORT TICKET =====

    if (interaction.commandName === "support-ticket") {

      createTicket(

        interaction,
        `support-${interaction.user.username}`,
        "Support Anfrage",
        SUPPORT_KATEGORIE_ID,
        true

      );

    }

  }



  // ================= BUTTONS =================

  if (interaction.isButton()) {

    if (interaction.customId === "bot_kauf") {

      createTicket(
        interaction,
        `bot-${interaction.user.username}`,
        "Bot Einrichtung",
        KAUF_KATEGORIE_ID
      );

    }


    if (interaction.customId === "server_kauf") {

      createTicket(
        interaction,
        `server-${interaction.user.username}`,
        "Server Einrichtung",
        KAUF_KATEGORIE_ID
      );

    }


    if (interaction.customId === "bundle_kauf") {

      createTicket(
        interaction,
        `bundle-${interaction.user.username}`,
        "Bundle",
        KAUF_KATEGORIE_ID
      );

    }


    if (interaction.customId === "vip_ticket") {

      createTicket(
        interaction,
        `vip-${interaction.user.username}`,
        "VIP Support",
        KAUF_KATEGORIE_ID
      );

    }



    // ===== CLOSE TICKET =====

    if (interaction.customId === "close_ticket") {

      const isOwner = interaction.channel.permissionsFor(interaction.user)
        .has(PermissionsBitField.Flags.ViewChannel);

      const isStaff = interaction.member.roles.cache.has(LEITUNG_ROLE_ID);

      if (!isOwner && !isStaff)
        return interaction.reply({
          content: "Keine Berechtigung",
          ephemeral: true
        });

      interaction.channel.delete();

    }

  }



  // ================= MODAL =================

  if (interaction.isModalSubmit()) {

    if (interaction.customId === "preise_modal") {

      const bot = interaction.fields.getTextInputValue("bot");
      const server = interaction.fields.getTextInputValue("server");
      const bundle = interaction.fields.getTextInputValue("bundle");
      const extra = interaction.fields.getTextInputValue("extra");


      const embed = new EmbedBuilder()

        .setTitle("💰 Preise")

        .setDescription(`

🤖 Bot Einrichtung: ${bot}

⚙️ Server Einrichtung: ${server}

🔥 Bundle: ${bundle}

⭐ Extras: ${extra}


━━━━━━━━━━━━━━━━━━━━

📋 **Informationen**

• Hochwertige Entwicklung  
• Schneller Support  
• Individuelle Wünsche möglich  
• Updates möglich  
• Sicher & zuverlässig  

`)

        .setColor("Gold");


      interaction.reply({

        embeds: [embed]

      });

    }

  }

});


client.login(TOKEN);






