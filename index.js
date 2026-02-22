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
  TextInputStyle
} = require("discord.js");

const fs = require("fs");

const TOKEN = process.env.TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;
const GUILD_ID = process.env.GUILD_ID;

const SERVER_MITGLIED_ROLE_ID = "1474739183128940676";
const LEITUNG_ROLE_ID = "1474814614406430771";

const CATEGORY_ID = "1475187295450566828";
const SUPPORT_CATEGORY_ID = "1475207417800167466";

const LOG_CHANNEL_ID = "1475085569456607272";


const client = new Client({
  intents: [GatewayIntentBits.Guilds],
});

client.once("ready", () => {
  console.log(`✅ Bot ist online als ${client.user.tag}`);
});


// ========================
// PREISE SYSTEM
// ========================

function loadPrices() {

  if (!fs.existsSync("preise.json")) {

    const defaultPrices = {
      bot: "3€ – 8€",
      server: "3€ – 8€",
      bundle: "18€ – 22€",
      extras: "2€ – 5€"
    };

    fs.writeFileSync("preise.json", JSON.stringify(defaultPrices, null, 2));
    return defaultPrices;

  }

  return JSON.parse(fs.readFileSync("preise.json"));
}

function savePrices(data) {
  fs.writeFileSync("preise.json", JSON.stringify(data, null, 2));
}

function isLeitung(member) {
  return member.roles.cache.has(LEITUNG_ROLE_ID);
}


// ========================
// COMMANDS
// ========================

const commands = [

  new SlashCommandBuilder()
    .setName("panel")
    .setDescription("Kaufanfrage Panel"),

  new SlashCommandBuilder()
    .setName("vip")
    .setDescription("VIP Panel"),

  new SlashCommandBuilder()
    .setName("preise")
    .setDescription("Preise bearbeiten"),

  new SlashCommandBuilder()
    .setName("support-ticket")
    .setDescription("Support Panel senden"),

].map(cmd => cmd.toJSON());


const rest = new REST({ version: "10" }).setToken(TOKEN);

(async () => {

  await rest.put(
    Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
    { body: commands }
  );

  console.log("✅ Slash Commands registriert");

})();


// ========================
// TICKET ERSTELLEN
// ========================

async function createTicket(interaction, serviceName, categoryID, isSupport = false) {

  if (!interaction.member.roles.cache.has(SERVER_MITGLIED_ROLE_ID)) {
    return interaction.reply({
      content: "❌ Du hast keine Berechtigung.",
      ephemeral: true
    });
  }

  const channel = await interaction.guild.channels.create({

    name: `${isSupport ? "support" : "ticket"}-${interaction.user.username}`,

    type: ChannelType.GuildText,

    parent: categoryID,

    permissionOverwrites: [

      {
        id: interaction.guild.id,
        deny: [PermissionsBitField.Flags.ViewChannel],
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

  const closeButton = new ActionRowBuilder()
    .addComponents(
      new ButtonBuilder()
        .setCustomId("close_ticket")
        .setLabel("🔒 Ticket schließen")
        .setStyle(ButtonStyle.Danger)
    );

  const embed = new EmbedBuilder()
    .setTitle("🎫 Ticket erstellt")
    .setDescription(`Grund: ${serviceName}`)
    .setColor("Green");

  await channel.send({

    content: isSupport
      ? `<@&${LEITUNG_ROLE_ID}> <@${interaction.user.id}>`
      : `<@${interaction.user.id}>`,

    embeds: [embed],
    components: [closeButton]

  });


  const logChannel = interaction.guild.channels.cache.get(LOG_CHANNEL_ID);

  logChannel.send({

    embeds: [

      new EmbedBuilder()
        .setTitle("📁 Ticket erstellt")
        .addFields(
          { name: "User", value: interaction.user.tag },
          { name: "Grund", value: serviceName },
          { name: "Channel", value: channel.name }
        )
        .setColor("Blue")

    ]

  });


  interaction.reply({
    content: `✅ Ticket erstellt: ${channel}`,
    ephemeral: true
  });

}


// ========================
// INTERACTIONS
// ========================

client.on("interactionCreate", async interaction => {

  if (interaction.isChatInputCommand()) {

    if (!isLeitung(interaction.member)) {
      return interaction.reply({
        content: "❌ Nur Leitungsebene darf diesen Command benutzen",
        ephemeral: true
      });
    }


    // ========================
    // KAUF PANEL
    // ========================

    if (interaction.commandName === "panel") {

      const embed = new EmbedBuilder()
        .setTitle("🛍️ Kaufanfrage")
        .setDescription("Service auswählen")
        .setColor("Blue");

      const menu = new StringSelectMenuBuilder()
        .setCustomId("select_service")
        .setPlaceholder("Service wählen")
        .addOptions([
          { label: "Bot Einrichtung", value: "Bot Einrichtung" },
          { label: "Server Einrichtung", value: "Server Einrichtung" },
          { label: "Bundle", value: "Bundle" }
        ]);

      interaction.reply({
        embeds: [embed],
        components: [new ActionRowBuilder().addComponents(menu)]
      });

    }


    // ========================
    // VIP PANEL
    // ========================

    if (interaction.commandName === "vip") {

      const embed = new EmbedBuilder()
        .setTitle("👑 VIP Bundle")
        .setDescription(`
✨ Priorisierte Bearbeitung  
⚡ Schnellere Umsetzung  
🎁 Exklusive Features  
🛡️ Premium Support  

Button drücken zum öffnen.
`)
        .setColor("Gold");

      const button = new ActionRowBuilder().addComponents(

        new ButtonBuilder()
          .setCustomId("vip_ticket")
          .setLabel("VIP Ticket öffnen")
          .setStyle(ButtonStyle.Primary)

      );

      interaction.reply({

        embeds: [embed],
        components: [button]

      });

    }


    // ========================
    // SUPPORT PANEL
    // ========================

    if (interaction.commandName === "support-ticket") {

      const embed = new EmbedBuilder()
        .setTitle("🛠️ Support Ticket")
        .setDescription("Wähle den Grund aus")
        .setColor("Blue");

      const row = new ActionRowBuilder().addComponents(

        new ButtonBuilder()
          .setCustomId("support_payment")
          .setLabel("💳 Frage zur Zahlung")
          .setStyle(ButtonStyle.Primary),

        new ButtonBuilder()
          .setCustomId("support_other")
          .setLabel("❓ Anderes")
          .setStyle(ButtonStyle.Secondary)

      );

      interaction.reply({
        embeds: [embed],
        components: [row]
      });

    }


    // ========================
    // PREISE
    // ========================

    if (interaction.commandName === "preise") {

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
            .setCustomId("extras")
            .setLabel("Extras Preis")
            .setStyle(TextInputStyle.Short)
        )

      );

      interaction.showModal(modal);

    }

  }


  // ========================
  // SUPPORT BUTTONS
  // ========================

  if (interaction.isButton()) {

    if (interaction.customId === "support_payment")
      createTicket(interaction, "Frage zur Zahlung", SUPPORT_CATEGORY_ID, true);

    if (interaction.customId === "support_other")
      createTicket(interaction, "Anderes", SUPPORT_CATEGORY_ID, true);

    if (interaction.customId === "vip_ticket")
      createTicket(interaction, "VIP Bundle", CATEGORY_ID);


    if (interaction.customId === "close_ticket") {

      const logChannel = interaction.guild.channels.cache.get(LOG_CHANNEL_ID);

      logChannel.send({

        embeds: [

          new EmbedBuilder()
            .setTitle("❌ Ticket geschlossen")
            .addFields(
              { name: "Geschlossen von", value: interaction.user.tag },
              { name: "Channel", value: interaction.channel.name }
            )
            .setColor("Red")

        ]

      });

      interaction.channel.delete();

    }

  }


  if (interaction.isStringSelectMenu()) {

    if (interaction.customId === "select_service")
      createTicket(interaction, interaction.values[0], CATEGORY_ID);

  }


  if (interaction.isModalSubmit()) {

    if (interaction.customId === "preise_modal") {

      const data = {

        bot: interaction.fields.getTextInputValue("bot"),
        server: interaction.fields.getTextInputValue("server"),
        bundle: interaction.fields.getTextInputValue("bundle"),
        extras: interaction.fields.getTextInputValue("extras")

      };

      savePrices(data);

      const embed = new EmbedBuilder()
  .setTitle("💰 Unsere Preise")
  .setColor("Blue")
  .setDescription(`
━━━━━━━━━━━━━━━━━━━━━━

🤖 **Bot Einrichtung**
Erstellung & Konfiguration eines individuellen Discord Bots  
• Commands  
• Moderation  
• Systeme  
• Wunschfunktionen  

💵 **Preis:** ${data.bot}

━━━━━━━━━━━━━━━━━━━━━━

⚙️ **Server Einrichtung**
Komplettes Server Setup  
• Rollenstruktur  
• Kategorien  
• Sicherheit  
• Permissions  

💵 **Preis:** ${data.server}

━━━━━━━━━━━━━━━━━━━━━━

🔥 **Bundle (Bot + Server)**
Komplettpaket mit Rabatt  
Ideal für neue Communities  

💵 **Preis:** ${data.bundle}

━━━━━━━━━━━━━━━━━━━━━━

⭐ **Extras**
Individuelle Zusatzfunktionen  
• Spezialfeatures  
• Erweiterungen  
• Custom Wünsche  

💵 **Preis:** ${data.extras}

━━━━━━━━━━━━━━━━━━━━━━
`);

interaction.reply({
  content: "✅ Preise gespeichert und Panel aktualisiert",
  embeds: [embed]
});

    }

  }

});

client.login(TOKEN);
