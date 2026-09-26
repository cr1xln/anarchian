const { Client, GatewayIntentBits } = require("discord.js");
require("dotenv").config();

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

client.once("clientReady", () => {
    console.log("CONNECTED:", client.user.tag);
    console.log("GUILDS:", client.guilds.cache.size);
});

client.on("messageCreate", message => {
    console.log("MESSAGE RECEIVED:", {
        author: message.author?.username,
        content: message.content,
        guild: message.guild?.name,
        channel: message.channel?.name
    });
});

client.on("error", error => {
    console.error("CLIENT ERROR:", error);
});

client.login(process.env.DISCORD_TOKEN);
