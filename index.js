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
  Routes
} = require("discord.js");

const TOKEN = process.env.TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;
const GUILD_ID = process.env.GUILD_ID;
const CATEGORY_ID = process.env.CATEGORY_ID;
const TEAM_ROLE_ID = process.env.TEAM_ROLE_ID;
const MEMBER_ROLE_ID = process.env.MEMBER_ROLE_ID;
const LOG_CHANNEL_ID = process.env.LOG_CHANNEL_ID;

const client = new Client({
  intents: [GatewayIntentBits.Guilds],
});

client.once("clientReady", () => {
  console.log(`✅ Bot ist online als ${client.user.tag}`);
});


// ========================
// SLASH COMMANDS (NUR ADMIN)
// ========================

const commands = [

  new SlashCommandBuilder()
    .setName("panel")
    .setDescription("Sendet das Kaufanfrage Panel")
    .setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator)
    .toJSON(),

  new SlashCommandBuilder()
    .setName("vip-panel")
    .setDescription("Sendet das VIP Panel")
    .setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator)
    .toJSON(),

  new SlashCommandBuilder()
    .setName("preise")
    .setDescription("Sendet die Preisliste")
    .setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator)
    .toJSON(),

];

const rest = new REST({ version: "10" }).setToken(TOKEN);

(async () => {
  console.log("🔄 Registriere Slash Commands...");
  await rest.put(
    Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
    { body: commands }
  );
  console.log("✅ Slash Commands registriert");
})();


// ========================
// TICKET CREATE FUNCTION
// ========================

async function createTicket(interaction, type, service) {

  if (!interaction.member.roles.cache.has(MEMBER_ROLE_ID)) {
    return interaction.reply({
      content: "❌ Du benötigst die Rolle 'Server Mitglied' um ein Ticket zu öffnen.",
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

  const closeButton = new ButtonBuilder()
    .setCustomId(`close_${interaction.user.id}_${service}`)
    .setLabel("🔒 Ticket schließen")
    .setStyle(ButtonStyle.Danger);

  const row = new ActionRowBuilder().addComponents(closeButton);

  const embed = new EmbedBuilder()
    .setTitle("🎫 Ticket erstellt")
    .setColor("Green")
    .setDescription(`Service: ${service}`);

  await channel.send({
    content: `<@${interaction.user.id}> <@&${TEAM_ROLE_ID}>`,
    embeds: [embed],
    components: [row]
  });

  await interaction.reply({
    content: `✅ Dein Ticket wurde erstellt: ${channel}`,
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

    // KAUFANFRAGE PANEL
    if (interaction.commandName === "panel") {

      const embed = new EmbedBuilder()
        .setTitle("🛍️ Kaufanfrage Ticket")
        .setDescription("Wähle deinen gewünschten Service aus:")
        .setColor("Blue");

      const menu = new StringSelectMenuBuilder()
        .setCustomId("buy_select")
        .setPlaceholder("Service auswählen")
        .addOptions([
          { label: "🤖 Bot Einrichtung", value: "Bot Einrichtung" },
          { label: "⚙️ Server Einrichtung", value: "Server Einrichtung" },
          { label: "🔥 Server + Bot Einrichtung", value: "Bundle" }
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
        .setTitle("👑 VIP Bundle")
        .setColor("Gold")
        .setDescription(`
**Preis: 25€**

**Vorteile:**
• 👑 Exklusive VIP Rolle  
• ⚡ Schnellere Bearbeitung  
• 🔒 Prioritäts Support  
• 🌟 Exklusive Server Vorteile  

Klicke unten um dein VIP Ticket zu erstellen.
`);

      const button = new ButtonBuilder()
        .setCustomId("vip_button")
        .setLabel("👑 VIP Ticket erstellen")
        .setStyle(ButtonStyle.Primary);

      const row = new ActionRowBuilder().addComponents(button);

      await interaction.reply({
        embeds: [embed],
        components: [row]
      });
    }

    // PREISE (MIT VOLLER INFO)
    if (interaction.commandName === "preise") {

      const embed = new EmbedBuilder()
        .setTitle("💰 Preise")
        .setColor("Blue")
        .setDescription(`
🤖 **Bot Einrichtung**  
Preis: 3€ – 8€  
• Ticket System  
• Moderations Commands  
• Custom Commands  
• Rollen & Permissions  
• Fertiger Bot  

⚙️ **Server Einrichtung**  
Preis: 3€ – 8€  
• Kategorien & Channels  
• Rollen System  
• Permissions Setup  
• Sauberes Design  

🔥 **Server + Bot Einrichtung (Bundle)**  
Preis: 18€ – 22€  
• Komplettes Setup  
• Perfekt abgestimmt  
• Sofort einsatzbereit  

⭐ **Extras**  
Preis: 2€ – 5€  
• Extra Commands  
• Zusätzliche Features  
• Prioritäts Bearbeitung  

📩 Bestellung über das Kaufanfrage Panel
`);

      await interaction.reply({ embeds: [embed] });
    }

  }


  // ========================
  // SERVICE AUSWAHL
  // ========================

  if (interaction.isStringSelectMenu()) {
    if (interaction.customId === "buy_select") {
      createTicket(interaction, "ticket", interaction.values[0]);
    }
  }

  // ========================
  // VIP BUTTON
  // ========================

  if (interaction.isButton()) {

    if (interaction.customId === "vip_button") {
      createTicket(interaction, "vip", "VIP Bundle");
    }

    if (interaction.customId.startsWith("close_")) {

      const args = interaction.customId.split("_");
      const creatorId = args[1];
      const service = args.slice(2).join("_");

      const logChannel = interaction.guild.channels.cache.get(LOG_CHANNEL_ID);

      const logEmbed = new EmbedBuilder()
        .setTitle("📁 Ticket geschlossen")
        .setColor("Red")
        .addFields(
          { name: "Ticket", value: interaction.channel.name },
          { name: "Ersteller", value: `<@${creatorId}>` },
          { name: "Geschlossen von", value: `<@${interaction.user.id}>` },
          { name: "Service", value: service }
        )
        .setTimestamp();

      if (logChannel) {
        logChannel.send({ embeds: [logEmbed] });
      }

      await interaction.reply({
        content: "🔒 Ticket wird geschlossen...",
        ephemeral: true
      });

      setTimeout(() => {
        interaction.channel.delete().catch(() => {});
      }, 3000);
    }

  }

});

client.login(TOKEN);
