const {
    Client,
    GatewayIntentBits,
    REST,
    Routes,
    SlashCommandBuilder,
    PermissionFlagsBits,
    EmbedBuilder,
    ButtonBuilder,
    ButtonStyle,
    ActionRowBuilder
} = require("discord.js");

require("dotenv").config();

const {
    getUser,
    getBalance,
    addContraband,
    removeContraband,

    addXP,
    getRequiredXP,

    addWarning,
    getWarnings,
    clearWarnings,

    addPunishment,
    removePunishment,
    clearPunishments,
    clearAllPunishments,
    getPunishments,

    getCooldown,
    setCooldown,

    getContrabandLeaderboard,
    getLevelLeaderboard,

    setModLogChannel,
    getModLogChannel
} = require("./database");

// ==========================================
// CLIENT
// ==========================================

const client = new Client({
    

    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildVoiceStates
    ]
});
console.log(
    "INTENTS:",
    client.options.intents.toArray()
);

client.on("messageCreate", message => {
    console.log("🔥 RAW MESSAGE EVENT:", message.author?.username);
});

// ==========================================
// CONSTANTS
// ==========================================

const DAILY_AMOUNT = 5000;
const WEEKLY_AMOUNT = 10000;

const LOOT_COOLDOWN = 5 * 60 * 1000;

const XP_PER_MESSAGE = 10;

// ==========================================
// SAFE DARES
// ==========================================

const dares = [

    "Send a message using only emojis.",
    "Change your nickname to something silly for 10 minutes.",
    "Type your next message without using the letter E.",
    "Say three nice things about another member.",
    "Write a sentence where every word starts with the same letter.",
    "Send the funniest GIF you can find.",
    "Describe your favourite food without naming it.",
    "Write a sentence backwards.",
    "Use only lowercase letters for your next 3 messages.",
    "Use only uppercase letters for your next message.",
    "Make a sentence containing five words that rhyme.",
    "Describe an animal as if it were a superhero.",
    "Write a two-line poem about Discord.",
    "Invent a completely ridiculous superhero.",
    "Make up a new word and define it.",
    "Describe your day using exactly five words.",
    "Write a fake news headline about your server.",
    "Make up a ridiculous law for this server.",
    "Describe a potato as dramatically as possible.",
    "Create a three-word horror story without graphic content.",
    "Write a sentence where every word has exactly four letters.",
    "Describe a movie badly without saying its title.",
    "Make a terrible pun.",
    "Write a motivational quote that makes absolutely no sense.",
    "Pretend you're a medieval knight ordering pizza.",
    "Invent a new holiday.",
    "Describe a normal object like it is extremely mysterious.",
    "Write a sentence containing five different animals.",
    "Make up a fictional sport.",
    "Give yourself a ridiculous title.",
    "Write a sentence using exactly three commas.",
    "Describe rain without using the words rain or water.",
    "Create a fake advertisement for a useless product.",
    "Write a sentence where every word begins with S.",
    "Invent a new slang word.",
    "Describe a computer as if it were a pet.",
    "Write a tiny story in exactly three sentences.",
    "Make a compliment using only five words.",
    "Invent a ridiculous conspiracy about potatoes.",
    "Write a sentence containing three types of fruit.",
    "Describe your favourite game without naming it.",
    "Create a fictional restaurant name.",
    "Write a dramatic sentence about losing a sock.",
    "Invent a fictional character in one sentence.",
    "Describe a chair like it is a luxury product.",
    "Create a ridiculous warning sign.",
    "Write a sentence with every word starting with A.",
    "Invent a fake Discord command.",
    "Make up a ridiculous school subject.",
    "Describe Monday as if it were a villain."
];

// ==========================================
// TRUTHS
// ==========================================

const truths = [

    "What is your favourite game?",
    "What is your favourite movie?",
    "What is the funniest thing you've seen recently?",
    "What is your favourite food?",
    "What is a hobby you enjoy?",
    "What is your favourite school subject?",
    "What is a skill you'd like to learn?",
    "What is your favourite animal?",
    "What is your favourite colour?",
    "What is a game you could play for hours?",
    "What is your favourite fictional character?",
    "What is the funniest username you've seen?",
    "What is your favourite season?",
    "What is your favourite dessert?",
    "What is your favourite sport?",
    "What is one place you'd like to visit?",
    "What is your favourite type of music?",
    "What is your favourite book?",
    "What is one thing you're good at?",
    "What is one thing you want to improve?",
    "What is your favourite app?",
    "What is your favourite snack?",
    "What is your favourite holiday?",
    "What is your favourite meme?",
    "What is your favourite video game character?",
    "What is your favourite subject to learn about?",
    "What is your favourite type of weather?",
    "What is your favourite drink?",
    "What is your favourite fictional world?",
    "What is something that always makes you laugh?",
    "What is your favourite board game?",
    "What is your favourite YouTube genre?",
    "What is your favourite thing about your server?",
    "What is a talent you wish you had?",
    "What is your favourite animal sound?",
    "What is your favourite breakfast?",
    "What is your favourite type of pizza?",
    "What is your favourite type of technology?",
    "What is your favourite game genre?",
    "What is your favourite cartoon?",
    "What is your favourite place to relax?",
    "What is your favourite thing to do with friends?",
    "What is your favourite fictional villain?",
    "What is your favourite school memory?",
    "What is your favourite fruit?",
    "What is your favourite thing about weekends?",
    "What is a random fact you know?",
    "What is your favourite emoji?",
    "What is your favourite type of puzzle?",
    "What is something you find interesting?"
];

// ==========================================
// PHRASES
// ==========================================

const phrases = [
    ["The early bird catches the ___", "worm"],
    ["Better late than ___", "never"],
    ["Actions speak louder than ___", "words"],
    ["Practice makes ___", "perfect"],
    ["Time flies when you're having ___", "fun"],
    ["Every cloud has a silver ___", "lining"],
    ["Don't count your chickens before they ___", "hatch"],
    ["A picture is worth a thousand ___", "words"],
    ["When in Rome, do as the Romans ___", "do"],
    ["Two heads are better than ___", "one"],
    ["The pen is mightier than the ___", "sword"],
    ["Where there is a will, there is a ___", "way"],
    ["Honesty is the best ___", "policy"],
    ["The grass is always greener on the other ___", "side"],
    ["Don't put all your eggs in one ___", "basket"],
    ["Look before you ___", "leap"],
    ["Rome wasn't built in a ___", "day"],
    ["Knowledge is ___", "power"],
    ["Fortune favours the ___", "bold"],
    ["United we stand, divided we ___", "fall"]
];

// ==========================================
// UNSCRAMBLE
// ==========================================

const words = [
    ["tac", "cat"],
    ["god", "dog"],
    ["esuoh", "house"],
    ["retupmoc", "computer"],
    ["elppa", "apple"],
    ["ananab", "banana"],
    ["noom", "moon"],
    ["nus", "sun"],
    ["retaw", "water"],
    ["retupmoc", "computer"],
    ["elohcs", "school"],
    ["dneirf", "friend"],
    ["yalp", "play"],
    ["koob", "book"],
    ["neercs", "screen"],
    ["reyalp", "player"],
    ["edoc", "code"],
    ["tob", "bot"],
    ["draob", "board"],
    ["trops", "sport"]
];

// ==========================================
// COMMANDS
// ==========================================

const commands = [

    // --------------------------
    // GENERAL
    // --------------------------

    new SlashCommandBuilder()
        .setName("ping")
        .setDescription("Shows Anarchian's latency."),

    new SlashCommandBuilder()
        .setName("8ball")
        .setDescription("Ask Anarchian a question.")
        .addStringOption(option =>
            option
                .setName("question")
                .setDescription("Your question.")
                .setRequired(true)
        ),

    // --------------------------
    // FUN
    // --------------------------

    new SlashCommandBuilder()
        .setName("truth")
        .setDescription("Get a truth question."),

    new SlashCommandBuilder()
        .setName("dare")
        .setDescription("Get a safe dare."),

    new SlashCommandBuilder()
        .setName("ship")
        .setDescription("Ship two users.")
        .addUserOption(option =>
            option
                .setName("user1")
                .setDescription("First user.")
                .setRequired(true)
        )
        .addUserOption(option =>
            option
                .setName("user2")
                .setDescription("Second user.")
                .setRequired(true)
        ),

    new SlashCommandBuilder()
    .setName("backwards")
    .setDescription("Reverse a user's most recent message.")
    .addUserOption(option =>
        option
            .setName("user")
            .setDescription("The user whose recent message to reverse.")
            .setRequired(true)
    ),

    new SlashCommandBuilder()
        .setName("echo")
        .setDescription("Echo a message through Anarchian.")
        .addStringOption(option =>
            option
                .setName("message")
                .setDescription("Message to echo.")
                .setRequired(true)
        ),

    new SlashCommandBuilder()
        .setName("confess")
        .setDescription("Send an anonymous-style confession through Anarchian.")
        .addStringOption(option =>
            option
                .setName("message")
                .setDescription("Your confession.")
                .setRequired(true)
        ),

    // --------------------------
    // ECONOMY
    // --------------------------

    new SlashCommandBuilder()
        .setName("balance")
        .setDescription("Shows your Contraband balance.")
        .addUserOption(option =>
            option
                .setName("user")
                .setDescription("Optional user.")
        ),

    new SlashCommandBuilder()
        .setName("loot")
        .setDescription("Collect free Contraband."),
    new SlashCommandBuilder()
        .setName("heist")
        .setDescription("Attempt a risky heist for a random Contraband reward."),
        // --------------------------
// GAMBLING
// --------------------------

new SlashCommandBuilder()
    .setName("slots")
    .setDescription("Play the Contraband slot machine.")
    .addIntegerOption(option =>
        option
            .setName("bet")
            .setDescription("Amount of Contraband to bet.")
            .setMinValue(1)
            .setRequired(true)
    ),

new SlashCommandBuilder()
    .setName("coinflip")
    .setDescription("Bet Contraband on heads or tails.")
    .addStringOption(option =>
        option
            .setName("choice")
            .setDescription("Choose heads or tails.")
            .setRequired(true)
            .addChoices(
                {
                    name: "Heads",
                    value: "heads"
                },
                {
                    name: "Tails",
                    value: "tails"
                }
            )
    )
    .addIntegerOption(option =>
        option
            .setName("bet")
            .setDescription("Amount of Contraband to bet.")
            .setMinValue(1)
            .setRequired(true)
    ),

new SlashCommandBuilder()
    .setName("crash")
    .setDescription("Play Crash with Contraband.")
    .addIntegerOption(option =>
        option
            .setName("bet")
            .setDescription("Amount of Contraband to bet.")
            .setMinValue(1)
            .setRequired(true)
    ),

new SlashCommandBuilder()
    .setName("blackjack")
    .setDescription("Play Blackjack with Contraband.")
    .addIntegerOption(option =>
        option
            .setName("bet")
            .setDescription("Amount of Contraband to bet.")
            .setMinValue(1)
            .setRequired(true)
    ),

new SlashCommandBuilder()
    .setName("mines")
    .setDescription("Play Mines with Contraband.")
    .addIntegerOption(option =>
        option
            .setName("bet")
            .setDescription("Amount of Contraband to bet.")
            .setMinValue(1)
            .setRequired(true)
    ),

    new SlashCommandBuilder()
        .setName("daily")
        .setDescription("Claim your daily Contraband."),

    new SlashCommandBuilder()
        .setName("weekly")
        .setDescription("Claim your weekly Contraband."),

    new SlashCommandBuilder()
        .setName("contraband-leaderboard")
        .setDescription("Shows the Contraband leaderboard."),

    // --------------------------
    // LEVELS
    // --------------------------

    new SlashCommandBuilder()
        .setName("level")
        .setDescription("Shows a user's level.")
        .addUserOption(option =>
            option
                .setName("user")
                .setDescription("Optional user.")
        ),

    new SlashCommandBuilder()
        .setName("level-leaderboard")
        .setDescription("Shows the level leaderboard."),

    // --------------------------
    // MINIGAMES
    // --------------------------



    // --------------------------
    // MODERATION
    // --------------------------

    new SlashCommandBuilder()
        .setName("kick")
        .setDescription("Kick a member.")
        .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers)
        .addUserOption(option =>
            option
                .setName("user")
                .setDescription("User to kick.")
                .setRequired(true)
        ),

    new SlashCommandBuilder()
        .setName("mute")
        .setDescription("Timeout a member.")
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
        .addUserOption(option =>
            option
                .setName("user")
                .setDescription("User to mute.")
                .setRequired(true)
        )
        .addIntegerOption(option =>
            option
                .setName("minutes")
                .setDescription("Timeout length in minutes.")
                .setMinValue(1)
                .setMaxValue(40320)
                .setRequired(true)
        ),

    new SlashCommandBuilder()
        .setName("warn")
        .setDescription("Warn a member.")
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
        .addUserOption(option =>
            option
                .setName("user")
                .setDescription("User to warn.")
                .setRequired(true)
        ),

    new SlashCommandBuilder()
        .setName("warnings")
        .setDescription("Shows a user's warnings.")
        .addUserOption(option =>
            option
                .setName("user")
                .setDescription("User.")
                .setRequired(true)
        ),

    new SlashCommandBuilder()
        .setName("punish")
        .setDescription("Apply an Anarchian punishment.")
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
        .addUserOption(option =>
            option
                .setName("user")
                .setDescription("User.")
                .setRequired(true)
        ),

    new SlashCommandBuilder()
        .setName("unpunish")
        .setDescription("Remove punishments.")
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
        .addUserOption(option =>
            option
                .setName("user")
                .setDescription("Optional user. Leave blank to clear everyone.")
        ),

    new SlashCommandBuilder()
        .setName("purge")
        .setDescription("Delete messages.")
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
        .addIntegerOption(option =>
            option
                .setName("amount")
                .setDescription("Number of messages.")
                .setMinValue(1)
                .setMaxValue(100)
                .setRequired(true)
        ),

    new SlashCommandBuilder()
        .setName("setmodlogs")
        .setDescription("Set the current channel as the moderation log.")
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)

].map(command => command.toJSON());

// ==========================================
// REGISTER COMMANDS
// ==========================================

client.once("clientReady", async () => {
    console.log(`🤖 Anarchian is online as ${client.user.tag}`);

    const rest = new REST({ version: "10" })
        .setToken(process.env.DISCORD_TOKEN);

    try {

        console.log("🔄 Registering slash commands...");

        await rest.put(
            Routes.applicationGuildCommands(client.user.id, '1501448758309818508'),
            {
                body: commands
            }
        );

        console.log("✅ Slash commands registered!");

    } catch (error) {

        console.error("❌ Command registration failed:");
        console.error(error);
    }
});

// ==========================================
// MOD LOG HELPER
// ==========================================

async function sendModLog(guild, embed) {

    const channelId = getModLogChannel(guild.id);

    if (!channelId) return;

    const channel = guild.channels.cache.get(channelId);

    if (!channel) return;

    try {

        await channel.send({
            embeds: [embed]
        });

    } catch (error) {

        console.error("Could not send mod log:", error);
    }
}

// ==========================================
// UWUFY PUNISHMENT
// ==========================================

function uwufy(text) {
    let result = text;

    // Make the first word cute/stuttery
    result = result.replace(
        /^([a-zA-Z])([a-zA-Z])([a-zA-Z]*)/,
        (match, a, b, rest) => {
            return `${a}-${a}${b}~${rest}`;
        }
    );

    // Occasionally change r/l to w
    if (Math.random() < 0.5) {
        result = result
            .replace(/r/g, "w")
            .replace(/R/g, "W")
            .replace(/l/g, "w")
            .replace(/L/g, "W");
    }

    // Usually add !
    if (Math.random() < 0.8 && !/[!?]$/.test(result.trim())) {
        result = result.trimEnd() + "!";
    }

    // Very rarely add ONE emoji
    if (Math.random() < 0.15) {
        result += " 🥺";
    }

    return result;
}

// ==========================================
// XP SYSTEM
// ==========================================

const xpCooldown = new Map();

client.on("messageCreate", async message => {

    console.log("MESSAGE EVENT FIRED");

    console.log(
        "Author:",
        message.author?.username
    );

    console.log(
        "Guild:",
        message.guild?.id
    );

    if (message.author.bot) return;

    if (!message.guild) return;
const punishments = getPunishments(
    message.author.id,
    message.guild.id
);

const hasUwU = punishments.some(
    punishment => punishment.punishment === "uwu"
);

if (hasUwU && message.content.trim()) {
    try {
        const transformed = uwufy(message.content);

        await message.delete();

        const webhooks = await message.channel.fetchWebhooks();

        let webhook = webhooks.find(
            hook =>
                hook.owner?.id === client.user.id &&
                hook.name === "Anarchian Punishments"
        );

        if (!webhook) {
            webhook = await message.channel.createWebhook({
                name: "Anarchian Punishments"
            });
        }

        await webhook.send({
            content: transformed,
            username:
                message.member?.displayName ||
                message.author.username,
            avatarURL: message.author.displayAvatarURL({
                extension: "png",
                size: 256
            }),
            allowedMentions: {
                parse: []
            }
        });

    } catch (error) {
        console.error("UWUFY punishment error:", error);
    }
}
    const key =
        `${message.guild.id}:${message.author.id}`;

    const now = Date.now();

    const last =
        xpCooldown.get(key) || 0;

    if (now - last < 60000) return;

    xpCooldown.set(key, now);

    const result = addXP(
        message.author.id,
        message.guild.id,
        XP_PER_MESSAGE
    );

    console.log(
        "XP ADDED:",
        result
    );

    if (result.levelUps > 0) {
        await message.channel.send(
            `🎉 ${message.author} reached **Level ${result.level}**!`
        );
    }

});
// ==========================================
// COUNTING SYSTEM
// ==========================================

const COUNTING_CHANNEL_ID = "1551924475896012810";

let countingNumber = 1;
let lastCounterUser = null;

client.on("messageCreate", async message => {

    // Ignore bots
    if (message.author.bot) return;

    // Ignore DMs
    if (!message.guild) return;

    // Only work in the counting channel
    if (message.channel.id !== COUNTING_CHANNEL_ID) return;

    // Get the number the user typed
    const number = Number(message.content.trim());

    // Ignore messages that aren't numbers
    if (!Number.isInteger(number)) return;

    // ==========================================
    // SAME USER TWICE
    // ==========================================

    if (lastCounterUser === message.author.id) {

        await message.channel.send(
            `❌ ${message.author}, someone else needs to count next!`
        );

        return;
    }

    // ==========================================
    // CORRECT NUMBER
    // ==========================================

    if (number === countingNumber) {

        // Remember who counted
        lastCounterUser = message.author.id;

        // Increase the count
        countingNumber++;

        // React to the message
        await message.react("✅").catch(() => {});

        // Tell everyone the current count
        await message.channel.send(
            `🔢 Count: **${number}**`
        );

        return;
    }

    // ==========================================
    // WRONG NUMBER
    // ==========================================

    await message.channel.send(
        `❌ ${message.author}, that's incorrect!\n` +
        `The next number was **${countingNumber}**.`
    );

    // Reset the game
    countingNumber = 1;
    lastCounterUser = null;

    await message.channel.send(
        `🔄 The count has been reset to **1**.`
    );
});


// ==========================================
// INTERACTION HANDLER
// ==========================================

client.on("interactionCreate", async interaction => {

    if (!interaction.isChatInputCommand()) return;
console.log(
    "COMMAND:",
    interaction.commandName,
    "GUILD:",
    interaction.guild?.name,
    "GUILD ID:",
    interaction.guildId
);
if (!interaction.guildId) {        
    await interaction.reply({
            content: "❌ Anarchian commands must be used inside a server.",
            ephemeral: true
        });

        return;
    }

    const command = interaction.commandName;

    try {

        // ==================================
        // PING
        // ==================================

        if (command === "ping") {

            const latency = Math.round(client.ws.ping);

            await interaction.reply(
                `🏓 Pong!\nLatency: **${latency}ms**`
            );

            return;
        }

        // ==================================
        // 8BALL
        // ==================================

        if (command === "8ball") {

            const answers = [

                "🎱 It is certain.",
                "🎱 Without a doubt.",
                "🎱 Most likely.",
                "🎱 Yes.",
                "🎱 Signs point to yes.",
                "🎱 Ask again later.",
                "🎱 Cannot predict that.",
                "🎱 Probably not.",
                "🎱 Signs point to no.",
                "🎱 No.",
                "🎱 Absolutely not."
            ];

            const question =
                interaction.options.getString("question");

            const answer =
                answers[
                    Math.floor(
                        Math.random() * answers.length
                    )
                ];

            await interaction.reply(
                `❓ **${question}**\n\n${answer}`
            );

            return;
        }

        // ==================================
        // TRUTH
        // ==================================

        if (command === "truth") {

            const truth =
                truths[
                    Math.floor(
                        Math.random() * truths.length
                    )
                ];

            await interaction.reply(
                `🟣 **Truth**\n\n${truth}`
            );

            return;
        }

        // ==================================
        // DARE
        // ==================================

        if (command === "dare") {

            const dare =
                dares[
                    Math.floor(
                        Math.random() * dares.length
                    )
                ];

            await interaction.reply(
                `🔴 **Dare**\n\n${dare}`
            );

            return;
        }

        // ==================================
        // SHIP
        // ==================================

        if (command === "ship") {

            const user1 =
                interaction.options.getUser("user1");

            const user2 =
                interaction.options.getUser("user2");

            const score =
                Math.floor(
                    Math.random() * 101
                );

            let message;

            if (score >= 90) {

                message = "💖 Absolutely adorable!";

            } else if (score >= 70) {

                message = "💕 Pretty good match!";

            } else if (score >= 50) {

                message = "💗 There might be something there!";

            } else if (score >= 25) {

                message = "💔 Maybe just friends.";

            } else {

                message = "💀 The ship has sunk.";
            }

            await interaction.reply(
                `💘 **${user1.username} + ${user2.username}**\n\n` +
                `Love meter: **${score}%**\n` +
                `${message}`
            );

            return;
        }

        // ==================================
// BACKWARDS
        // ==================================

        if (command === "backwards") {
            const user = interaction.options.getUser("user");

            if (!global.backwardsUsers) {
                global.backwardsUsers = new Set();
            }

            if (global.backwardsUsers.has(user.id)) {
                global.backwardsUsers.delete(user.id);

                await interaction.reply(
                    `Backwards mode disabled for **${user.username}**.`
                );
            } else {
                global.backwardsUsers.add(user.id);

                await interaction.reply(
                    `Backwards mode enabled for **${user.username}**.`
                );
            }

            return;
        }

        // ==================================
        // ECHO
        // ==================================

        // ==================================

        if (command === "echo") {

    const message =
        interaction.options.getString("message");

    await interaction.deferReply({ ephemeral: true });

    const webhooks =
        await interaction.channel.fetchWebhooks();

    let webhook =
        webhooks.find(
            hook =>
                hook.owner?.id === client.user.id &&
                hook.name === "Anarchian"
        );

    if (!webhook) {
        webhook =
            await interaction.channel.createWebhook({
                name: "Anarchian"
            });
    }

    await webhook.send({
        content: message,
        allowedMentions: {
            parse: []
        }
    });

    await interaction.deleteReply();

    return;
}

        // ==================================
        // CONFESS
        // ==================================

        if (command === "confess") {

            const message =
                interaction.options.getString("message");

            await interaction.deferReply({ ephemeral: true });

            const webhooks =
                await interaction.channel.fetchWebhooks();

            let webhook =
                webhooks.find(
                    hook =>
                        hook.owner?.id === client.user.id &&
                        hook.name === "Anarchian"
                );

            if (!webhook) {
                webhook =
                    await interaction.channel.createWebhook({
                        name: "Anarchian"
                    });
            }

            await webhook.send({
                content: ` **Anonymous confession**\n\n${message}`,
                allowedMentions: {
                    parse: []
                }
            });

            await interaction.deleteReply();

            return;
        }

        // ==================================
        // BALANCE
        // ==================================

        if (command === "balance") {

            const target =
                interaction.options.getUser("user")
                || interaction.user;

            const balance =
                getBalance(
                    target.id,
interaction.guildId                );

            await interaction.reply(
                `💰 **${target.username}** has **${balance.toLocaleString()} Contraband**.`
            );

            return;
        }

        // ==================================
        // LOOT
        // ==================================

        if (command === "loot") {

            const now = Date.now();

            const last =
                getCooldown(
                    interaction.user.id,
interaction.guildId,                    
"last_loot"
                );

            const remaining =
                LOOT_COOLDOWN - (now - last);

            if (remaining > 0) {

                const seconds =
                    Math.ceil(remaining / 1000);

                await interaction.reply(
                    `⏳ You must wait **${seconds} seconds** before looting again.`
                );

                return;
            }

            const amount =
                Math.floor(
                    Math.random() * 1001
                );

            addContraband(
    interaction.user.id,
    interaction.guildId,
    amount
);

            setCooldown(
                interaction.user.id,
interaction.guildId,                
"last_loot",
                now
            );

            await interaction.reply(
                `📦 You found **${amount.toLocaleString()} Contraband**!`
            );

            return;
        }
        // ==================================
        // HEIST
        // ==================================

        if (command === "heist") {

            const now = Date.now();

            const last =
                getCooldown(
                    interaction.user.id,
                    interaction.guildId,
                    "last_heist"
                );

            const HEIST_COOLDOWN = 5 * 60 * 1000;

            const remaining =
                HEIST_COOLDOWN - (now - last);

            if (remaining > 0) {

                const seconds =
                    Math.ceil(remaining / 1000);

                await interaction.reply(
                    `⏳ You must wait **${seconds} seconds** before attempting another heist.`
                );

                return;
            }

            const success =
                Math.random() < 0.45;

            setCooldown(
                interaction.user.id,
                interaction.guildId,
                "last_heist",
                now
            );

            if (success) {

                const amount =
                    Math.floor(
                        Math.random() * 4501
                    ) + 500;

                addContraband(
                    interaction.user.id,
                    interaction.guildId,
                    amount
                );

                await interaction.reply(
                    `💰 **HEIST SUCCESSFUL!**\n\nYou escaped with **${amount.toLocaleString()} Contraband**!`
                );

            } else {

                await interaction.reply(
                    `🚨 **HEIST FAILED!**\n\nYou got caught and escaped with nothing.`
                );
            }

            return;
        }
        // ==================================
        // SLOTS
        // ==================================

        if (command === "slots") {

            const bet =
                interaction.options.getInteger("bet");

            const balance =
                getBalance(
                    interaction.user.id,
                    interaction.guildId
                );

            if (bet > balance) {

                await interaction.reply(
                    `❌ You only have **${balance.toLocaleString()} Contraband**.`
                );

                return;
            }

            const symbols = [
                "🍒",
                "🍋",
                "🍊",
                "🍉",
                "⭐",
                "💎",
                "7️⃣"
            ];

            const reels = [
                symbols[Math.floor(Math.random() * symbols.length)],
                symbols[Math.floor(Math.random() * symbols.length)],
                symbols[Math.floor(Math.random() * symbols.length)]
            ];

            let multiplier = 0;

            // Three matching symbols
            if (
                reels[0] === reels[1] &&
                reels[1] === reels[2]
            ) {

                if (reels[0] === "7️⃣") {

                    multiplier = 10;

                } else if (reels[0] === "💎") {

                    multiplier = 7;

                } else if (reels[0] === "⭐") {

                    multiplier = 5;

                } else {

                    multiplier = 3;
                }

            // Two matching symbols
            } else if (
                reels[0] === reels[1] ||
                reels[1] === reels[2] ||
                reels[0] === reels[2]
            ) {

                multiplier = 1.5;
            }

            // Remove bet
            removeContraband(
                interaction.user.id,
                interaction.guildId,
                bet
            );

            const winnings =
                Math.floor(bet * multiplier);

            // Give winnings
            if (winnings > 0) {

                addContraband(
                    interaction.user.id,
                    interaction.guildId,
                    winnings
                );
            }

            const profit =
                winnings - bet;

            let result;

            if (multiplier >= 10) {

                result = "🎰 **JACKPOT!**";

            } else if (multiplier >= 5) {

                result = "💎 **MASSIVE WIN!**";

            } else if (multiplier > 1) {

                result = "🎉 **YOU WON!**";

            } else {

                result = "💀 **No match.**";
            }

            await interaction.reply(
                `🎰 **ANARCHIAN SLOTS**\n\n` +
                `┏━━━━━━━━━━━━━━┓\n` +
                `┃ ${reels.join(" │ ")} ┃\n` +
                `┗━━━━━━━━━━━━━━┛\n\n` +
                `${result}\n\n` +
                `💰 Bet: **${bet.toLocaleString()} Contraband**\n` +
                `📈 Multiplier: **${multiplier}x**\n` +
                `💵 Profit: **${profit >= 0 ? "+" : ""}${profit.toLocaleString()} Contraband**`
            );

            return;
        }


        // ==================================
        // COINFLIP
        // ==================================

        if (command === "coinflip") {

            const bet =
                interaction.options.getInteger("bet");

            const choice =
                interaction.options.getString("choice");

            const balance =
                getBalance(
                    interaction.user.id,
                    interaction.guildId
                );

            if (bet > balance) {

                await interaction.reply(
                    `❌ You only have **${balance.toLocaleString()} Contraband**.`
                );

                return;
            }

            const result =
                Math.random() < 0.5
                    ? "heads"
                    : "tails";

            // Remove bet
            removeContraband(
                interaction.user.id,
                interaction.guildId,
                bet
            );

            if (choice === result) {

                // Return original bet + equal winnings
                addContraband(
                    interaction.user.id,
                    interaction.guildId,
                    bet * 2
                );

                await interaction.reply(
                    `🪙 **ANARCHIAN COINFLIP**\n\n` +
                    `You chose: **${choice}**\n` +
                    `Coin landed on: **${result}**\n\n` +
                    `🎉 **YOU WON!**\n` +
                    `Profit: **+${bet.toLocaleString()} Contraband**`
                );

            } else {

                await interaction.reply(
                    `🪙 **ANARCHIAN COINFLIP**\n\n` +
                    `You chose: **${choice}**\n` +
                    `Coin landed on: **${result}**\n\n` +
                    `💀 **YOU LOST!**\n` +
                    `Lost: **${bet.toLocaleString()} Contraband**`
                );
            }

            return;
        }


        // ==================================
// CRASH
// ==================================

if (command === "crash") {

    const bet =
        interaction.options.getInteger("bet");

    const balance =
        getBalance(
            interaction.user.id,
            interaction.guildId
        );

    if (bet > balance) {

        await interaction.reply(
            `❌ You only have **${balance.toLocaleString()} Contraband**.`
        );

        return;
    }

    if (bet <= 0) {

        await interaction.reply(
            "❌ Your bet must be greater than 0."
        );

        return;
    }

    removeContraband(
        interaction.user.id,
        interaction.guildId,
        bet
    );

    // Generate crash point
    const crashPoint =
        Math.max(
            1.01,
            Number(
                (
                    1 +
                    (-Math.log(Math.random()) * 2)
                ).toFixed(2)
            )
        );

    let multiplier = 1.00;
    let finished = false;

    const cashOutButton =
        new ButtonBuilder()
            .setCustomId("crash_cashout")
            .setLabel("Cash Out")
            .setEmoji("💰")
            .setStyle(ButtonStyle.Success);

    const row =
        new ActionRowBuilder()
            .addComponents(cashOutButton);

    await interaction.reply({
        content:
            `📈 **ANARCHIAN CRASH**\n\n` +
            `💰 Bet: **${bet.toLocaleString()} Contraband**\n` +
            `🚀 Multiplier: **1.00x**\n\n` +
            `💰 **Cash out before the multiplier crashes!**`,
        components: [row]
    });

    const gameMessage =
        await interaction.fetchReply();

    const collector =
        gameMessage.createMessageComponentCollector({
            time: 30000
        });

    collector.on("collect", async buttonInteraction => {

        if (
            buttonInteraction.user.id !==
            interaction.user.id
        ) {

            await buttonInteraction.reply({
                content:
                    "❌ This isn't your Crash game.",
                ephemeral: true
            });

            return;
        }

        if (
            buttonInteraction.customId ===
            "crash_cashout"
        ) {

            if (finished) return;

            finished = true;

            clearInterval(crashInterval);
            collector.stop("cashed_out");

            const winnings =
                Math.floor(
                    bet * multiplier
                );

            addContraband(
                interaction.user.id,
                interaction.guildId,
                winnings
            );

            const profit =
                winnings - bet;

            await buttonInteraction.update({
                content:
                    `📈 **ANARCHIAN CRASH**\n\n` +
                    `💰 Bet: **${bet.toLocaleString()} Contraband**\n` +
                    `🚀 Cashed out at **${multiplier.toFixed(2)}x**!\n\n` +
                    `🎉 **YOU WON!**\n` +
                    `💵 Payout: **${winnings.toLocaleString()} Contraband**\n` +
                    `📈 Profit: **+${profit.toLocaleString()} Contraband**`,
                components: []
            });
        }
    });

    const crashInterval =
        setInterval(async () => {

            if (finished) return;

            multiplier +=
                Math.random() * 0.20 + 0.05;

            multiplier =
                Number(
                    multiplier.toFixed(2)
                );

            if (multiplier >= crashPoint) {

                finished = true;

                clearInterval(crashInterval);
                collector.stop("crashed");

                await gameMessage.edit({
                    content:
                        `📈 **ANARCHIAN CRASH**\n\n` +
                        `💥 **CRASHED AT ${crashPoint.toFixed(2)}x!**\n\n` +
                        `💰 Bet: **${bet.toLocaleString()} Contraband**\n` +
                        `💀 You lost your bet.`,
                    components: []
                });

                return;
            }

            try {

                await gameMessage.edit({
                    content:
                        `📈 **ANARCHIAN CRASH**\n\n` +
                        `💰 Bet: **${bet.toLocaleString()} Contraband**\n` +
                        `🚀 Multiplier: **${multiplier.toFixed(2)}x**\n\n` +
                        `💰 **Cash out before it crashes!**`,
                    components: [row]
                });

            } catch (error) {

                console.error(
                    "Crash update error:",
                    error
                );
            }

        }, 1000);

    collector.on("end", async (_, reason) => {

        if (finished) return;

        finished = true;

        clearInterval(crashInterval);

        if (reason === "time") {

            await gameMessage.edit({
                content:
                    `📈 **ANARCHIAN CRASH**\n\n` +
                    `⏰ **Time expired!**\n\n` +
                    `💰 Bet: **${bet.toLocaleString()} Contraband**\n` +
                    `💀 You lost your bet.`,
                components: []
            }).catch(() => {});
        }
    });

    return;
}



        // ==================================
// BLACKJACK
// ==================================

if (command === "blackjack") {

    const bet =
        interaction.options.getInteger("bet");

    const balance =
        getBalance(
            interaction.user.id,
            interaction.guildId
        );

    if (bet > balance) {

        await interaction.reply(
            `❌ You only have **${balance.toLocaleString()} Contraband**.`
        );

        return;
    }

    if (bet <= 0) {

        await interaction.reply(
            "❌ Your bet must be greater than 0."
        );

        return;
    }

    removeContraband(
        interaction.user.id,
        interaction.guildId,
        bet
    );

    const suits = [
        "♠️",
        "♥️",
        "♦️",
        "♣️"
    ];

    const ranks = [
        "A",
        "2",
        "3",
        "4",
        "5",
        "6",
        "7",
        "8",
        "9",
        "10",
        "J",
        "Q",
        "K"
    ];

    function drawCard() {

        const rank =
            ranks[
                Math.floor(
                    Math.random() * ranks.length
                )
            ];

        const suit =
            suits[
                Math.floor(
                    Math.random() * suits.length
                )
            ];

        return {
            rank,
            suit
        };
    }

    function cardValue(hand) {

        let value = 0;
        let aces = 0;

        for (const card of hand) {

            if (card.rank === "A") {

                value += 11;
                aces++;

            } else if (
                ["J", "Q", "K"].includes(card.rank)
            ) {

                value += 10;

            } else {

                value += Number(card.rank);
            }
        }

        while (
            value > 21 &&
            aces > 0
        ) {

            value -= 10;
            aces--;
        }

        return value;
    }

    function formatHand(hand) {

        return hand
            .map(card =>
                `${card.rank}${card.suit}`
            )
            .join(" │ ");
    }

    let player = [
        drawCard(),
        drawCard()
    ];

    let dealer = [
        drawCard(),
        drawCard()
    ];

    let finished = false;

    function createButtons() {

        const hit =
            new ButtonBuilder()
                .setCustomId("blackjack_hit")
                .setLabel("Hit")
                .setEmoji("🃏")
                .setStyle(ButtonStyle.Primary);

        const stand =
            new ButtonBuilder()
                .setCustomId("blackjack_stand")
                .setLabel("Stand")
                .setEmoji("✋")
                .setStyle(ButtonStyle.Success);

        return new ActionRowBuilder()
            .addComponents(
                hit,
                stand
            );
    }

    function createMessage(
        showDealer = false
    ) {

        const playerValue =
            cardValue(player);

        const dealerDisplay =
            showDealer
                ? formatHand(dealer)
                : `${dealer[0].rank}${dealer[0].suit} │ ❓`;

        const dealerValue =
            showDealer
                ? cardValue(dealer)
                : "?";

        return (
            `🃏 **ANARCHIAN BLACKJACK**\n\n` +

            `👤 **Your Hand**\n` +
            `${formatHand(player)}\n` +
            `Value: **${playerValue}**\n\n` +

            `🤖 **Dealer Hand**\n` +
            `${dealerDisplay}\n` +
            `Value: **${dealerValue}**\n\n` +

            `💰 Bet: **${bet.toLocaleString()} Contraband**`
        );
    }

    await interaction.reply({
        content: createMessage(false),
        components: [createButtons()]
    });

    const gameMessage =
        await interaction.fetchReply();

    const collector =
        gameMessage.createMessageComponentCollector({
            time: 60000
        });

    async function finishGame(reason) {

        if (finished) return;

        finished = true;

        collector.stop("finished");

        let playerValue =
            cardValue(player);

        let dealerValue =
            cardValue(dealer);

        // Dealer automatically draws to 17
        while (
            dealerValue < 17
        ) {

            dealer.push(drawCard());

            dealerValue =
                cardValue(dealer);
        }

        let payout = 0;
        let result = "";

        if (playerValue > 21) {

            result =
                `💀 **You busted!** You lost **${bet.toLocaleString()} Contraband**.`;

        } else if (dealerValue > 21) {

            payout = bet * 2;

            result =
                `🎉 **Dealer busted! You win!**`;

        } else if (
            playerValue > dealerValue
        ) {

            payout = bet * 2;

            result =
                `🎉 **You beat the dealer!**`;

        } else if (
            playerValue === dealerValue
        ) {

            payout = bet;

            result =
                `🤝 **Push! Your bet is returned.**`;

        } else {

            result =
                `💀 **Dealer wins!** You lost your bet.`;
        }

        if (payout > 0) {

            addContraband(
                interaction.user.id,
                interaction.guildId,
                payout
            );
        }

        const profit =
            payout - bet;

        await gameMessage.edit({
            content:
                `🃏 **ANARCHIAN BLACKJACK**\n\n` +

                `👤 **Your Hand**\n` +
                `${formatHand(player)}\n` +
                `Value: **${playerValue}**\n\n` +

                `🤖 **Dealer Hand**\n` +
                `${formatHand(dealer)}\n` +
                `Value: **${dealerValue}**\n\n` +

                `${result}\n\n` +

                `💰 Bet: **${bet.toLocaleString()} Contraband**\n` +
                `💵 Profit: **${profit >= 0 ? "+" : ""}${profit.toLocaleString()} Contraband**`,

            components: []
        });
    }

    // Natural blackjack
    if (
        cardValue(player) === 21
    ) {

        await finishGame(
            "blackjack"
        );

        return;
    }

    collector.on(
        "collect",
        async buttonInteraction => {

            if (
                buttonInteraction.user.id !==
                interaction.user.id
            ) {

                await buttonInteraction.reply({
                    content:
                        "❌ This isn't your Blackjack game.",
                    ephemeral: true
                });

                return;
            }

            if (
                buttonInteraction.customId ===
                "blackjack_hit"
            ) {

                player.push(drawCard());

                const value =
                    cardValue(player);

                if (value > 21) {

                    await finishGame(
                        "bust"
                    );

                    return;
                }

                if (value === 21) {

                    await finishGame(
                        "21"
                    );

                    return;
                }

                await buttonInteraction.update({
                    content:
                        createMessage(false),
                    components: [
                        createButtons()
                    ]
                });

            } else if (
                buttonInteraction.customId ===
                "blackjack_stand"
            ) {

                await buttonInteraction.deferUpdate();

                await finishGame(
                    "stand"
                );
            }
        }
    );

    collector.on("end", async () => {

        if (finished) return;

        finished = true;

        await gameMessage.edit({
            content:
                `🃏 **ANARCHIAN BLACKJACK**\n\n` +
                `⏰ **Game timed out.**\n\n` +
                `Your **${bet.toLocaleString()} Contraband** bet was lost.`,
            components: []
        }).catch(() => {});
    });

    return;
}



       // ==================================
// MINES
// ==================================

if (command === "mines") {

    const bet =
        interaction.options.getInteger("bet");

    const balance =
        getBalance(
            interaction.user.id,
            interaction.guildId
        );

    if (bet > balance) {

        await interaction.reply(
            `❌ You only have **${balance.toLocaleString()} Contraband**.`
        );

        return;
    }

    if (bet <= 0) {

        await interaction.reply(
            "❌ Your bet must be greater than 0."
        );

        return;
    }

    removeContraband(
        interaction.user.id,
        interaction.guildId,
        bet
    );

    const BOARD_SIZE = 25;

    const MINE_COUNT = 5;

    const mines = new Set();

    while (
        mines.size < MINE_COUNT
    ) {

        mines.add(
            Math.floor(
                Math.random() * BOARD_SIZE
            )
        );
    }

    const revealed = new Set();

    let multiplier = 1.00;

    let finished = false;

    function calculateMultiplier() {

        const safeTiles =
            revealed.size;

        return Number(
            (
                1 +
                safeTiles * 0.18
            ).toFixed(2)
        );
    }

    function createBoard() {

        const rows = [];

        for (
            let row = 0;
            row < 5;
            row++
        ) {

            const actionRow =
                new ActionRowBuilder();

            for (
                let column = 0;
                column < 5;
                column++
            ) {

                const index =
                    row * 5 + column;

                let button;

                if (
                    revealed.has(index)
                ) {

                    button =
                        new ButtonBuilder()
                            .setCustomId(
                                `mine_revealed_${index}`
                            )
                            .setLabel("💎")
                            .setStyle(
                                ButtonStyle.Success
                            )
                            .setDisabled(true);

                } else {

                    button =
                        new ButtonBuilder()
                            .setCustomId(
                                `mine_${index}`
                            )
                            .setLabel("❔")
                            .setStyle(
                                ButtonStyle.Secondary
                            );
                }

                actionRow.addComponents(
                    button
                );
            }

            rows.push(actionRow);
        }

        // Discord only allows 5 action rows.
        // Add Cash Out by replacing the last row
        // when necessary is not possible, so the
        // cash-out button is placed in the message
        // components as part of the final row.

        return rows;
    }

    function createCashoutRow() {

        const cashout =
            new ButtonBuilder()
                .setCustomId("mines_cashout")
                .setLabel("Cash Out")
                .setEmoji("💰")
                .setStyle(ButtonStyle.Success)
                .setDisabled(
                    revealed.size === 0
                );

        return new ActionRowBuilder()
            .addComponents(cashout);
    }

    function createContent() {

        return (
            `💣 **ANARCHIAN MINES**\n\n` +
            `💰 Bet: **${bet.toLocaleString()} Contraband**\n` +
            `💣 Mines: **${MINE_COUNT}**\n` +
            `💎 Safe tiles: **${revealed.size}**\n` +
            `📈 Current multiplier: **${multiplier.toFixed(2)}x**\n` +
            `💵 Cash out: **${Math.floor(
                bet * multiplier
            ).toLocaleString()} Contraband**\n\n` +
            `Choose a tile. Avoid the mines!`
        );
    }

    const board =
        createBoard();

    // We need 6 rows for board + cashout,
    // but Discord allows only 5 rows.
    // Therefore put Cash Out in the message
    // using the first row after a tile is revealed.
    //
    // To keep the board at 5x5, Cash Out is
    // represented by the center tile after
    // the first selection.
    //
    // Instead, use a collector with the board
    // and a separate "cash out" command-style
    // button is not possible with 5 board rows.
    //
    // So we use the center tile as the Cash Out
    // button once the player has revealed a tile.

    function createInteractiveBoard() {

        const rows = [];

        for (
            let row = 0;
            row < 5;
            row++
        ) {

            const actionRow =
                new ActionRowBuilder();

            for (
                let column = 0;
                column < 5;
                column++
            ) {

                const index =
                    row * 5 + column;

                let button;

                if (
                    index === 12 &&
                    revealed.size > 0 &&
                    !revealed.has(index)
                ) {

                    button =
                        new ButtonBuilder()
                            .setCustomId(
                                "mines_cashout"
                            )
                            .setLabel("CASH OUT")
                            .setEmoji("💰")
                            .setStyle(
                                ButtonStyle.Success
                            );

                } else if (
                    revealed.has(index)
                ) {

                    button =
                        new ButtonBuilder()
                            .setCustomId(
                                `mine_revealed_${index}`
                            )
                            .setLabel("💎")
                            .setStyle(
                                ButtonStyle.Success
                            )
                            .setDisabled(true);

                } else {

                    button =
                        new ButtonBuilder()
                            .setCustomId(
                                `mine_${index}`
                            )
                            .setLabel("❔")
                            .setStyle(
                                ButtonStyle.Secondary
                            );
                }

                actionRow.addComponents(
                    button
                );
            }

            rows.push(actionRow);
        }

        return rows;
    }

    await interaction.reply({
        content: createContent(),
        components: createInteractiveBoard()
    });

    const gameMessage =
        await interaction.fetchReply();

    const collector =
        gameMessage.createMessageComponentCollector({
            time: 120000
        });

    collector.on(
        "collect",
        async buttonInteraction => {

            if (
                buttonInteraction.user.id !==
                interaction.user.id
            ) {

                await buttonInteraction.reply({
                    content:
                        "❌ This isn't your Mines game.",
                    ephemeral: true
                });

                return;
            }

            if (finished) return;

            // ==========================
            // CASH OUT
            // ==========================

            if (
                buttonInteraction.customId ===
                "mines_cashout"
            ) {

                if (
                    revealed.size === 0
                ) {

                    await buttonInteraction.reply({
                        content:
                            "❌ Reveal at least one safe tile first.",
                        ephemeral: true
                    });

                    return;
                }

                finished = true;

                collector.stop(
                    "cashed_out"
                );

                const winnings =
                    Math.floor(
                        bet * multiplier
                    );

                addContraband(
                    interaction.user.id,
                    interaction.guildId,
                    winnings
                );

                const profit =
                    winnings - bet;

                await buttonInteraction.update({
                    content:
                        `💣 **ANARCHIAN MINES**\n\n` +
                        `🎉 **CASHED OUT!**\n\n` +
                        `💎 Safe tiles: **${revealed.size}**\n` +
                        `📈 Multiplier: **${multiplier.toFixed(2)}x**\n` +
                        `💰 Payout: **${winnings.toLocaleString()} Contraband**\n` +
                        `📈 Profit: **+${profit.toLocaleString()} Contraband**`,
                    components: []
                });

                return;
            }

            // ==========================
            // TILE
            // ==========================

            const match =
                buttonInteraction.customId.match(
                    /^mine_(\d+)$/
                );

            if (!match) return;

            const index =
                Number(match[1]);

            if (
                revealed.has(index)
            ) {

                return;
            }

            // ==========================
            // MINE
            // ==========================

            if (
                mines.has(index)
            ) {

                finished = true;

                collector.stop(
                    "mine"
                );

                const allRows = [];

                for (
                    let row = 0;
                    row < 5;
                    row++
                ) {

                    const actionRow =
                        new ActionRowBuilder();

                    for (
                        let column = 0;
                        column < 5;
                        column++
                    ) {

                        const tile =
                            row * 5 + column;

                        if (
                            mines.has(tile)
                        ) {

                            actionRow.addComponents(
                                new ButtonBuilder()
                                    .setCustomId(
                                        `mine_end_${tile}`
                                    )
                                    .setLabel("💣")
                                    .setStyle(
                                        ButtonStyle.Danger
                                    )
                                    .setDisabled(true)
                            );

                        } else {

                            actionRow.addComponents(
                                new ButtonBuilder()
                                    .setCustomId(
                                        `mine_end_${tile}`
                                    )
                                    .setLabel(
                                        revealed.has(tile)
                                            ? "💎"
                                            : "▫️"
                                    )
                                    .setStyle(
                                        revealed.has(tile)
                                            ? ButtonStyle.Success
                                            : ButtonStyle.Secondary
                                    )
                                    .setDisabled(true)
                            );
                        }
                    }

                    allRows.push(
                        actionRow
                    );
                }

                await buttonInteraction.update({
                    content:
                        `💣 **ANARCHIAN MINES**\n\n` +
                        `💥 **BOOM! You hit a mine!**\n\n` +
                        `💰 Bet: **${bet.toLocaleString()} Contraband**\n` +
                        `💎 Safe tiles: **${revealed.size}**\n` +
                        `💀 You lost your bet.`,
                    components: allRows
                });

                return;
            }

            // ==========================
            // SAFE TILE
            // ==========================

            revealed.add(index);

            multiplier =
                calculateMultiplier();

            // Win automatically if every
            // non-mine tile is revealed.
            if (
                revealed.size >=
                BOARD_SIZE - MINE_COUNT
            ) {

                finished = true;

                collector.stop(
                    "cleared"
                );

                const winnings =
                    Math.floor(
                        bet * multiplier
                    );

                addContraband(
                    interaction.user.id,
                    interaction.guildId,
                    winnings
                );

                await buttonInteraction.update({
                    content:
                        `💣 **ANARCHIAN MINES**\n\n` +
                        `🏆 **BOARD CLEARED!**\n\n` +
                        `💎 You found every safe tile!\n` +
                        `📈 Multiplier: **${multiplier.toFixed(2)}x**\n` +
                        `💰 Payout: **${winnings.toLocaleString()} Contraband**`,
                    components: []
                });

                return;
            }

            await buttonInteraction.update({
                content:
                    createContent(),
                components:
                    createInteractiveBoard()
            });
        }
    );

    collector.on(
        "end",
        async () => {

            if (finished) return;

            finished = true;

            await gameMessage.edit({
                content:
                    `💣 **ANARCHIAN MINES**\n\n` +
                    `⏰ **Game timed out.**\n\n` +
                    `Your **${bet.toLocaleString()} Contraband** bet was lost.`,
                components: []
            }).catch(() => {});
        }
    );

    return;
}


        
        // ==================================
        // DAILY
        // ==================================

        if (command === "daily") {

            const now = Date.now();

            const last =
                getCooldown(
                    interaction.user.id,
interaction.guildId,                    
"last_daily"
                );

            const cooldown =
                24 * 60 * 60 * 1000;

            if (now - last < cooldown) {

                const remaining =
                    cooldown - (now - last);

                const hours =
                    Math.ceil(
                        remaining / 3600000
                    );

                await interaction.reply(
                    `⏳ Your daily reward is ready in about **${hours} hour(s)**.`
                );

                return;
            }

            addContraband(
                interaction.user.id,
                interaction.guildId,
                DAILY_AMOUNT
            );

            setCooldown(
                interaction.user.id,
                interaction.guildId,
                "last_daily",
                now
            );

            await interaction.reply(
                `🎁 You received **5,000 Contraband**!`
            );

            return;
        }

        // ==================================
        // WEEKLY
        // ==================================

        if (command === "weekly") {

            const now = Date.now();

            const last =
                getCooldown(
                    interaction.user.id,
                    interaction.guildId,
                    "last_weekly"
                );

            const cooldown =
                7 * 24 * 60 * 60 * 1000;

            if (now - last < cooldown) {

                const remaining =
                    cooldown - (now - last);

                const days =
                    Math.ceil(
                        remaining / 86400000
                    );

                await interaction.reply(
                    `⏳ Your weekly reward is ready in about **${days} day(s)**.`
                );

                return;
            }

            addContraband(
                interaction.user.id,
                interaction.guildId,
                WEEKLY_AMOUNT
            );

            setCooldown(
                interaction.user.id,
                interaction.guildId,
                "last_weekly",
                now
            );

            await interaction.reply(
                `🎁 You received **10,000 Contraband**!`
            );

            return;
        }

        // ==================================
        // CONTRABAND LEADERBOARD
        // ==================================

        if (command === "contraband-leaderboard") {

            const leaderboard =
                getContrabandLeaderboard(
                    interaction.guildId,
                    10
                );

            if (leaderboard.length === 0) {

                await interaction.reply(
                    "There is nobody on the leaderboard yet."
                );

                return;
            }

            let text = "";

            for (
                let i = 0;
                i < leaderboard.length;
                i++
            ) {

                const entry =
                    leaderboard[i];

                const member =
                    await interaction.guild.members
                        .fetch(entry.user_id)
                        .catch(() => null);

                const name =
                    member?.user.username
                    || `User ${entry.user_id}`;

                text +=
                    `**${i + 1}.** ${name} — ` +
                    `💰 ${entry.contraband.toLocaleString()}\n`;
            }

            await interaction.reply(
                `💰 **Contraband Leaderboard**\n\n${text}`
            );

            return;
        }

        // ==================================
        // LEVEL
        // ==================================

        if (command === "level") {

            const target =
                interaction.options.getUser("user")
                || interaction.user;

            const user =
                getUser(
                    target.id,
                    interaction.guildId
                );

            const needed =
                getRequiredXP(user.level);

            await interaction.reply(
                `⭐ **${target.username}**\n\n` +
                `Level: **${user.level}**\n` +
                `XP: **${user.xp}/${needed}**`
            );

            return;
        }

        // ==================================
// LEVEL LEADERBOARD
// ==================================

if (command === "level-leaderboard") {

    const leaderboard = getLevelLeaderboard(
        interaction.guildId,
        10
    );

    if (leaderboard.length === 0) {
        await interaction.reply(
            "There is nobody on the leaderboard yet."
        );
        return;
    }

       const medals = ["🥇", "🥈", "🥉"];

    const embed = new EmbedBuilder()
        .setTitle("🏆 ANARCHIAN LEVELS")
        .setDescription(
            "The most experienced members in this server."
        )
        .setColor(0x5865F2)
        .setTimestamp();

    for (let i = 0; i < leaderboard.length; i++) {

        const entry = leaderboard[i];

        const user =
            await interaction.client.users
                .fetch(entry.user_id)
                .catch(() => null);

        const username =
            user?.username ||
            `User ${entry.user_id}`;

        const avatar =
            user?.displayAvatarURL({
                extension: "png",
                size: 128
            });

        const needed =
            getRequiredXP(entry.level);

        const progress =
            needed > 0
                ? Math.min(
                    100,
                    Math.floor(
                        (entry.xp / needed) * 100
                    )
                )
                : 100;

        const bars = 12;

        const filled =
            Math.round(
                (progress / 100) * bars
            );

        const progressBar =
            "▰".repeat(filled) +
            "▱".repeat(bars - filled);

        const rank =
            medals[i] ||
            `**#${i + 1}**`;

        embed.addFields({
            name: `${rank} ${username}`,
            value:
                `**Level ${entry.level}** • ` +
                `**${entry.xp.toLocaleString()} XP**\n` +
                `${progressBar} **${progress}%**`,
            inline: false
        });

        if (i === 0 && avatar) {
            embed.setThumbnail(avatar);
        }
    }

    embed.setFooter({
        text:
            `Top ${leaderboard.length} members • Anarchian`
    });

    await interaction.reply({
        embeds: [embed]
    });

    return;
}

        // ==================================
        // KICK
        // ==================================

        if (command === "kick") {

            const user =
                interaction.options.getUser("user");

            const member =
                await interaction.guild.members
                    .fetch(user.id)
                    .catch(() => null);

            if (!member) {

                await interaction.reply(
                    "❌ I couldn't find that member."
                );

                return;
            }

            if (!member.kickable) {

                await interaction.reply(
                    "❌ I cannot kick that member. Check my role hierarchy and permissions."
                );

                return;
            }

            await member.kick(
                `Kicked by ${interaction.user.tag}`
            );

            await interaction.reply(
                `👢 ${user.tag} has been kicked.`
            );

            await sendModLog(
                interaction.guild,
                new EmbedBuilder()
                    .setTitle("Member Kicked")
                    .setDescription(
                        `${user} was kicked by ${interaction.user}.`
                    )
                    .setTimestamp()
            );

            return;
        }

        // ==================================
        // MUTE
        // ==================================

        if (command === "mute") {

            const user =
                interaction.options.getUser("user");

            const minutes =
                interaction.options.getInteger("minutes");

            const member =
                await interaction.guild.members
                    .fetch(user.id)
                    .catch(() => null);

            if (!member) {

                await interaction.reply(
                    "❌ Member not found."
                );

                return;
            }

            if (!member.moderatable) {

                await interaction.reply(
                    "❌ I cannot mute that member. Check my role hierarchy and permissions."
                );

                return;
            }

            await member.timeout(
                minutes * 60 * 1000,
                `Muted by ${interaction.user.tag}`
            );

            addPunishment(
                user.id,
                interaction.guildId,
                "timeout"
            );

            await interaction.reply(
                `🔇 ${user.tag} has been muted for **${minutes} minute(s)**.`
            );

            await sendModLog(
                interaction.guild,
                new EmbedBuilder()
                    .setTitle("Member Muted")
                    .setDescription(
                        `${user} was muted by ${interaction.user} for ${minutes} minute(s).`
                    )
                    .setTimestamp()
            );

            return;
        }

        // ==================================
        // WARN
        // ==================================

        if (command === "warn") {

            const user =
                interaction.options.getUser("user");

            if (user.bot) {

                await interaction.reply(
                    "❌ Bots cannot receive warnings."
                );

                return;
            }

            addWarning(
                user.id,
                interaction.guildId
            );

            const warnings =
                getWarnings(
                    user.id,
                    interaction.guildId
                );

            await interaction.reply(
                `⚠️ ${user} has been warned.\n` +
                `Warnings: **${warnings}**`
            );

            await sendModLog(
                interaction.guild,
                new EmbedBuilder()
                    .setTitle("Warning Issued")
                    .setDescription(
                        `${user} was warned by ${interaction.user}.\nWarnings: ${warnings}`
                    )
                    .setTimestamp()
            );

            return;
        }

        // ==================================
        // WARNINGS
        // ==================================

        if (command === "warnings") {

            const user =
                interaction.options.getUser("user");

            const warnings =
                getWarnings(
                    user.id,
                    interaction.guildId
                );

            await interaction.reply(
                `⚠️ **${user.username}** has **${warnings} warning(s)**.`
            );

            return;
        }

        // ==================================
        // PUNISH
        // ==================================

        if (command === "punish") {

            const user =
                interaction.options.getUser("user");

            addPunishment(
                user.id,
                interaction.guildId,
                "uwu"
            );

            await interaction.reply(
                `😈 ${user} has been given an Anarchian punishment.`
            );

            return;
        }

        // ==================================
        // UNPUNISH
        // ==================================

        if (command === "unpunish") {

    const user = interaction.options.getUser("user");

    if (user) {

        // Remove database punishments
        clearPunishments(
            user.id,
            interaction.guildId
        );

        // Disable backwards mode
        if (global.backwardsUsers) {
            global.backwardsUsers.delete(user.id);
        }

        await interaction.reply(
            `✅ All punishments have been removed from ${user}.`
        );

    } else {

        // Remove all database punishments
        clearAllPunishments(
            interaction.guildId
        );

        // Disable every active backwards punishment
        if (global.backwardsUsers) {
            global.backwardsUsers.clear();
        }

        await interaction.reply(
            `✅ All punishments have been removed from the server.`
        );
    }

    return;
}

        // ==================================
        // PURGE
        // ==================================

        if (command === "purge") {

            const amount =
                interaction.options.getInteger("amount");

            const deleted =
                await interaction.channel.bulkDelete(
                    amount,
                    true
                );

            await interaction.reply({
                content:
                    `🧹 Deleted **${deleted.size} messages**.`,
                ephemeral: true
            });

            await sendModLog(
                interaction.guild,
                new EmbedBuilder()
                    .setTitle("Messages Purged")
                    .setDescription(
                        `${interaction.user} deleted ${deleted.size} messages in ${interaction.channel}.`
                    )
                    .setTimestamp()
            );

            return;
        }

        // ==================================
        // SET MOD LOGS
        // ==================================

        if (command === "setmodlogs") {

            setModLogChannel(
                interaction.guildId,
                interaction.channel.id
            );

            await interaction.reply(
                `✅ Moderation logs are now being sent to ${interaction.channel}.`
            );

            return;
        }

    } catch (error) {

        console.error(
            `Error running /${command}:`,
            error
        );

        if (interaction.replied || interaction.deferred) {

            await interaction.followUp({
                content:
                    "❌ Something went wrong while running that command.",
                ephemeral: true
            });

        } else {

            await interaction.reply({
                content:
                    "❌ Something went wrong while running that command.",
                ephemeral: true
            });
        }
    }
});

// ==========================================
// MESSAGE DELETE LOG
// ==========================================

client.on("messageDelete", async message => {

    if (!message.guild) return;

    if (message.author?.bot) return;

    await sendModLog(
        message.guild,

        new EmbedBuilder()
            .setTitle("🗑️ Message Deleted")
            .setDescription(
                `A message by ${message.author || "Unknown User"} was deleted in ${message.channel}.`
            )
            .addFields({
                name: "Content",
                value:
                    message.content?.slice(0, 1000)
                    || "Content unavailable."
            })
            .setTimestamp()
    );
});

// ==========================================
// MESSAGE EDIT LOG
// ==========================================

client.on("messageUpdate", async (oldMessage, newMessage) => {

    if (!oldMessage.guild) return;

    if (oldMessage.author?.bot) return;

    if (oldMessage.content === newMessage.content) return;

    await sendModLog(
        oldMessage.guild,

        new EmbedBuilder()
            .setTitle("✏️ Message Edited")
            .setDescription(
                `A message by ${oldMessage.author || "Unknown User"} was edited in ${oldMessage.channel}.`
            )
            .addFields(
                {
                    name: "Before",
                    value:
                        oldMessage.content?.slice(0, 1000)
                        || "Unavailable."
                },
                {
                    name: "After",
                    value:
                        newMessage.content?.slice(0, 1000)
                        || "Unavailable."
                }
            )
            .setTimestamp()
    );
});

// ==========================================
// ROLE ADD / REMOVE LOG
// ==========================================

client.on("guildMemberUpdate", async (oldMember, newMember) => {

    const oldRoles =
        new Set(oldMember.roles.cache.keys());

    const newRoles =
        new Set(newMember.roles.cache.keys());

    for (const roleId of newRoles) {

        if (!oldRoles.has(roleId)) {

            const role =
                newMember.guild.roles.cache.get(roleId);

            if (!role) continue;

            await sendModLog(
                newMember.guild,

                new EmbedBuilder()
                    .setTitle("➕ Role Added")
                    .setDescription(
                        `${newMember.user} received the role **${role.name}**.`
                    )
                    .setTimestamp()
            );
        }
    }

    for (const roleId of oldRoles) {

        if (!newRoles.has(roleId)) {

            const role =
                oldMember.guild.roles.cache.get(roleId);

            if (!role) continue;

            await sendModLog(
                newMember.guild,

                new EmbedBuilder()
                    .setTitle("➖ Role Removed")
                    .setDescription(
                        `${newMember.user} lost the role **${role.name}**.`
                    )
                    .setTimestamp()
            );
        }
    }
});

// ==========================================
// VOICE CHANNEL LOG
// ==========================================

client.on("voiceStateUpdate", async (oldState, newState) => {

    if (
        oldState.channelId === newState.channelId
    ) return;

    let description;

    if (!oldState.channelId && newState.channelId) {

        description =
            `${newState.member.user} joined ${newState.channel}.`;

    } else if (
        oldState.channelId &&
        !newState.channelId
    ) {

        description =
            `${oldState.member.user} left ${oldState.channel}.`;

    } else {

        description =
            `${newState.member.user} moved from ${oldState.channel} to ${newState.channel}.`;
    }

    await sendModLog(
        newState.guild,

        new EmbedBuilder()
            .setTitle("🔊 Voice Channel Update")
            .setDescription(description)
            .setTimestamp()
    );
});

// ==========================================
// SERVER NAME LOG
// ==========================================

client.on("guildUpdate", async (oldGuild, newGuild) => {

    if (oldGuild.name === newGuild.name) return;

    await sendModLog(
        newGuild,

        new EmbedBuilder()
            .setTitle("🏷️ Server Name Changed")
            .setDescription(
                `Server name changed from **${oldGuild.name}** to **${newGuild.name}**.`
            )
            .setTimestamp()
    );
});

// ==========================================
// ERROR HANDLING
// ==========================================

client.on("error", error => {

    console.error(
        "Discord error:",
        error
    );
});

process.on("unhandledRejection", error => {

    console.error(
        "Unhandled promise rejection:",
        error
    );
});

process.on("uncaughtException", error => {

    console.error(
        "Uncaught exception:",
        error
    );
});

// ==========================================
// TOKEN CHECK
// ==========================================

if (!process.env.DISCORD_TOKEN) {

    console.error(
        "❌ DISCORD_TOKEN is missing from .env"
    );

    process.exit(1);
}
let minigameChannelId = "1551915213861822554";
let nextMinigame = "fillinthephrase";
const MINIGAME_COOLDOWN = 2 * 60 * 60 * 1000;
// ==========================================
// LOGIN
// ==========================================
client.once("ready", async () => {
    console.log("🎮 Automatic minigame system started.");

    setInterval(async () => {

        if (!minigameChannelId) {
            console.log("⏳ No minigame channel has been selected yet.");
            return;
        }

        try {
            const channel = await client.channels.fetch(
                minigameChannelId
            );

            if (!channel || !channel.isTextBased()) {
                return;
            }

            if (nextMinigame === "fillinthephrase") {

                const phrase =
                    phrases[
                        Math.floor(
                            Math.random() * phrases.length
                        )
                    ];

                const reward = 10000;
                const blank = "□".repeat(phrase[1].length);

                await channel.send(
                    `🧩 **Fill in the phrase!**\n\n` +
                    `**${phrase[0].replace(/_+/g, blank)}**\n\n` +
                    `First correct answer wins **${reward.toLocaleString()} Contraband**!`
                );

                const collector =
                    channel.createMessageCollector({
                        time: 30000,
                        filter: message =>
                            !message.author.bot
                    });

                collector.on("collect", message => {

                    if (
                        message.content
                            .toLowerCase()
                            .trim() ===
                        phrase[1].toLowerCase()
                    ) {

                        addContraband(
                            message.author.id,
                            channel.guildId,
                            reward
                        );

                        collector.stop("winner");

                        channel.send(
                            `🎉 ${message.author} got it! ` +
                            `They won **${reward.toLocaleString()} Contraband**!`
                        );
                    }
                });

                collector.on("end", (_, reason) => {

                    if (reason !== "winner") {
                        channel.send(
                            `⏰ Time's up! The answer was **${phrase[1]}**.`
                        );
                    }
                });

                nextMinigame = "unscramble";

            } else {

                const word =
                    words[
                        Math.floor(
                            Math.random() * words.length
                        )
                    ];

                const reward = 5000;
                const blanks = "□".repeat(word[1].length);

                await channel.send(
                    `🔤 **Unscramble this word!**\n\n` +
                    `**${word[0]}**\n` +
                    `**${blanks}** (${word[1].length} letters)\n\n` +
                    `First correct answer wins **${reward.toLocaleString()} Contraband**!`
                );

                const collector =
                    channel.createMessageCollector({
                        time: 30000,
                        filter: message =>
                            !message.author.bot
                    });

                collector.on("collect", message => {

                    if (
                        message.content
                            .toLowerCase()
                            .trim() ===
                        word[1].toLowerCase()
                    ) {

                        addContraband(
                            message.author.id,
                            channel.guildId,
                            reward
                        );

                        collector.stop("winner");

                        channel.send(
                            `🎉 ${message.author} solved it! ` +
                            `They won **${reward.toLocaleString()} Contraband**!`
                        );
                    }
                });

                collector.on("end", (_, reason) => {

                    if (reason !== "winner") {
                        channel.send(
                            `⏰ Time's up! The answer was **${word[1]}**.`
                        );
                    }
                });

                nextMinigame = "fillinthephrase";
            }

        } catch (error) {
            console.error("Automatic minigame error:", error);
        }

    }, MINIGAME_COOLDOWN);
});
client.login(
    process.env.DISCORD_TOKEN
);
client.on("messageCreate", async message => {
    if (message.author.bot) return;
    if (!message.guild) return;

    if (!global.backwardsUsers) {
        global.backwardsUsers = new Set();
    }

    if (!global.backwardsUsers.has(message.author.id)) return;
    if (!message.content.trim()) return;

    try {
        const backwards = [...message.content].reverse().join("");

        // Delete the original message
        await message.delete();

        // Find or create a webhook for this channel
        const webhooks = await message.channel.fetchWebhooks();

        let webhook = webhooks.find(
            hook =>
                hook.owner?.id === client.user.id &&
                hook.name === "Anarchian Backwards"
        );

        if (!webhook) {
            webhook = await message.channel.createWebhook({
                name: "Anarchian Backwards"
            });
        }

        // Send the reversed message using the user's name and avatar
        await webhook.send({
            content: backwards,
            username: message.member?.displayName || message.author.username,
            avatarURL: message.author.displayAvatarURL({
                extension: "png",
                size: 256
            }),
            allowedMentions: {
                parse: []
            }
        });

    } catch (error) {
        console.error("Backwards mode error:", error);
    }
});
