const {
  Client,
  GatewayIntentBits,
  SlashCommandBuilder,
  REST,
  Routes,
  EmbedBuilder,
  PermissionFlagsBits,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  InteractionType
} = require('discord.js');

const fs = require('fs');

const TOKEN = process.env.TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;
const GUILD_ID = process.env.GUILD_ID;

const client = new Client({
  intents: [GatewayIntentBits.Guilds],
});


// Preise laden
function loadPrices() {
  if (!fs.existsSync('./preise.json')) {
    return {
      bot: "3€ – 8€",
      server: "3€ – 8€",
      bundle: "18€ – 22€",
      extras: "2€ – 5€"
    };
  }
  return JSON.parse(fs.readFileSync('./preise.json', 'utf8'));
}

// Preise speichern
function savePrices(prices) {
  fs.writeFileSync('./preise.json', JSON.stringify(prices, null, 2));
}


// SLASH COMMANDS
const commands = [

  new SlashCommandBuilder()
    .setName('preise')
    .setDescription('Preise eingeben und Embed senden')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  new SlashCommandBuilder()
    .setName('vip-panel')
    .setDescription('Sendet das VIP Panel')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  new SlashCommandBuilder()
    .setName('kaufanfrage')
    .setDescription('Sendet das Kaufanfrage Panel')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

].map(command => command.toJSON());


// Commands registrieren
const rest = new REST({ version: '10' }).setToken(TOKEN);

(async () => {
  try {
    console.log('🔄 Registriere Slash Commands...');
    await rest.put(
      Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
      { body: commands },
    );
    console.log('✅ Slash Commands registriert');
  } catch (error) {
    console.error(error);
  }
})();


// Bot ready
client.once('ready', () => {
  console.log(`✅ Bot ist online als ${client.user.tag}`);
});


// Interaction Handler
client.on('interactionCreate', async interaction => {

  // Nur Admins dürfen ALLES benutzen
  if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
    return interaction.reply({
      content: "❌ Nur Administratoren dürfen diesen Befehl benutzen.",
      ephemeral: true
    });
  }


  // /preise → Modal öffnen
  if (interaction.isChatInputCommand() && interaction.commandName === 'preise') {

    const prices = loadPrices();

    const modal = new ModalBuilder()
      .setCustomId('preise_modal')
      .setTitle('Preise eingeben');

    const botInput = new TextInputBuilder()
      .setCustomId('bot_price')
      .setLabel('🤖 Bot Einrichtung Preis')
      .setStyle(TextInputStyle.Short)
      .setValue(prices.bot)
      .setRequired(true);

    const serverInput = new TextInputBuilder()
      .setCustomId('server_price')
      .setLabel('⚙️ Server Einrichtung Preis')
      .setStyle(TextInputStyle.Short)
      .setValue(prices.server)
      .setRequired(true);

    const bundleInput = new TextInputBuilder()
      .setCustomId('bundle_price')
      .setLabel('🔥 Bundle Preis')
      .setStyle(TextInputStyle.Short)
      .setValue(prices.bundle)
      .setRequired(true);

    const extrasInput = new TextInputBuilder()
      .setCustomId('extras_price')
      .setLabel('⭐ Extras Preis')
      .setStyle(TextInputStyle.Short)
      .setValue(prices.extras)
      .setRequired(true);

    modal.addComponents(
      new ActionRowBuilder().addComponents(botInput),
      new ActionRowBuilder().addComponents(serverInput),
      new ActionRowBuilder().addComponents(bundleInput),
      new ActionRowBuilder().addComponents(extrasInput),
    );

    await interaction.showModal(modal);
  }


  // Modal wurde abgeschickt
  if (interaction.type === InteractionType.ModalSubmit &&
      interaction.customId === 'preise_modal') {

    const newPrices = {
      bot: interaction.fields.getTextInputValue('bot_price'),
      server: interaction.fields.getTextInputValue('server_price'),
      bundle: interaction.fields.getTextInputValue('bundle_price'),
      extras: interaction.fields.getTextInputValue('extras_price'),
    };

    savePrices(newPrices);

    const embed = new EmbedBuilder()
      .setTitle('💸 Preise')
      .setColor(0x2b2d31)
      .setDescription(
`🤖 **Bot Einrichtung:** ${newPrices.bot}

Beinhaltet:
• Ticket System
• Moderations Commands
• Custom Commands
• Rollen & Permissions
• Fertiger Bot


⚙️ **Server Einrichtung:** ${newPrices.server}

Beinhaltet:
• Kategorien & Channels
• Rollen System
• Permissions Setup
• Sauberes Design


🔥 **Bundle:** ${newPrices.bundle}

Beinhaltet:
• Server + Bot Setup
• Komplett fertig
• Sofort einsatzbereit


⭐ **Extras:** ${newPrices.extras}

• Extra Commands
• Zusätzliche Features
• Priorität


📩 Bestellung über Kaufanfrage Panel
⚡ Schneller Service
🔒 Zuverlässig`
      )
      .setFooter({ text: 'Hugo Develop Hub' });

    await interaction.reply({
      embeds: [embed]
    });
  }


  // VIP PANEL
  if (interaction.isChatInputCommand() &&
      interaction.commandName === 'vip-panel') {

    const embed = new EmbedBuilder()
      .setTitle('👑 VIP Kaufanfrage')
      .setDescription('Klicke auf den Button um VIP zu kaufen')
      .setColor(0xf1c40f);

    const button = new ButtonBuilder()
      .setCustomId('vip_kaufen')
      .setLabel('VIP kaufen')
      .setStyle(ButtonStyle.Success);

    const row = new ActionRowBuilder().addComponents(button);

    await interaction.reply({
      embeds: [embed],
      components: [row]
    });
  }


  // Kaufanfrage Panel
  if (interaction.isChatInputCommand() &&
      interaction.commandName === 'kaufanfrage') {

    const embed = new EmbedBuilder()
      .setTitle('🛒 Kaufanfrage')
      .setDescription('Erstelle eine Kaufanfrage über den Button')
      .setColor(0x00ff99);

    const button = new ButtonBuilder()
      .setCustomId('kaufen')
      .setLabel('Kaufen')
      .setStyle(ButtonStyle.Primary);

    const row = new ActionRowBuilder().addComponents(button);

    await interaction.reply({
      embeds: [embed],
      components: [row]
    });
  }

});


client.login(TOKEN);
