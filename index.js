const { 
  Client, 
  GatewayIntentBits, 
  REST, 
  Routes, 
  SlashCommandBuilder, 
  EmbedBuilder 
} = require("discord.js");

const TOKEN = process.env.TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;
const GUILD_ID = process.env.GUILD_ID;

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});


// SLASH COMMANDS DEFINIEREN
const commands = [

  new SlashCommandBuilder()
    .setName("preise")
    .setDescription("Zeigt alle Preise an"),

  new SlashCommandBuilder()
    .setName("kaufanfrage")
    .setDescription("Sendet das Kaufanfrage Panel"),

  new SlashCommandBuilder()
    .setName("vip-panel")
    .setDescription("Sendet das VIP Panel")

].map(cmd => cmd.toJSON());


// COMMANDS REGISTRIEREN
const rest = new REST({ version: "10" }).setToken(TOKEN);

(async () => {
  try {
    console.log("Registriere Slash Commands...");

    await rest.put(
      Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
      { body: commands }
    );

    console.log("Slash Commands erfolgreich registriert");

  } catch (error) {
    console.error(error);
  }
})();


// BOT READY
client.once("ready", () => {
  console.log(`Bot ist online als ${client.user.tag}`);
});


// COMMAND HANDLER
client.on("interactionCreate", async interaction => {

  if (!interaction.isChatInputCommand()) return;


  // PREISE COMMAND
  if (interaction.commandName === "preise") {

    const embed = new EmbedBuilder()
      .setTitle("💸 Preise")
      .setDescription(`
Hier sind alle aktuellen Preise:

🔹 Produkt 1 — 5€
🔹 Produkt 2 — 10€
🔹 Produkt 3 — 20€

Bei Interesse nutze /kaufanfrage
`)
      .setColor(0x00AEFF)
      .setFooter({ text: "Preisübersicht" })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }


  // KAUFANFRAGE COMMAND
  if (interaction.commandName === "kaufanfrage") {

    const embed = new EmbedBuilder()
      .setTitle("🛒 Kaufanfrage")
      .setDescription("Erstelle hier deine Kaufanfrage.")
      .setColor(0x00FF00);

    await interaction.reply({ embeds: [embed] });
  }


  // VIP PANEL COMMAND
  if (interaction.commandName === "vip-panel") {

    const embed = new EmbedBuilder()
      .setTitle("👑 VIP Panel")
      .setDescription("Hier kannst du VIP kaufen.")
      .setColor(0xFFD700);

    await interaction.reply({ embeds: [embed] });
  }

});


client.login(TOKEN);
