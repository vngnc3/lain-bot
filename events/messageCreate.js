// messageCreate.js
const { Events } = require('discord.js');

module.exports = {
    name: Events.MessageCreate,
    async execute(message) {
        if (message) return;
        /*
        if (message.author.bot) return;
        if (message.content.includes("@here") || message.content.includes("@everyone") || message.type == "REPLY") return false;
        if (message.mentions.has(message.client.user.id)) {
            const content = message.content.split(/\s+/).slice(1).join(' ');
            console.log(`Bot mentioned. Content after mention: ${content}`); // Log processed content

            // Rest of your logic...
        }*/
    },
};