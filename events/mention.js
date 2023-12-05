const gptStream = require('../api/gpt-discord.js');

module.exports = {
    name: 'messageCreate',
    async execute(message) {
        const reactions = [
            '✅',
            '🆗',
            '🖤',
            '🥰',
            '🫡',
            '🤔',
            '🧠',
            '🐸'
        ]
        if (message.author.bot || !message.mentions.has(message.client.user.id)) return;

        message.react(reactions[Math.floor(Math.random()*reactions.length)]);
        const userQuery = message.content.replace(/<@!?(\d+)>/, '').trim();
        const dateInUTC7 = new Date(Date.now()).toLocaleString("en-US", { timeZone: "Asia/Bangkok" });
        console.log(`${message.author.username} asked Lain on ${dateInUTC7}: ${userQuery}`);

        // Send typing indicator before editing the message
        await message.channel.sendTyping();

        let ongoingMessage = '';
        let wordBuffer = '';

        let replyMessage = await message.reply('...');

        const handleData = async (data) => {
            wordBuffer += data;

            let spaceIndex = wordBuffer.indexOf(' ');
            while (spaceIndex !== -1) {
                ongoingMessage += wordBuffer.substring(0, spaceIndex + 1);
                wordBuffer = wordBuffer.substring(spaceIndex + 1);

                // Send typing indicator before editing the message
                await message.channel.sendTyping();

                await replyMessage.edit(ongoingMessage);
                spaceIndex = wordBuffer.indexOf(' ');
            }
        };

        try {
            await gptStream(userQuery, handleData);
            if (wordBuffer) {
                // Send typing indicator before sending the final message
                await message.channel.sendTyping();
                ongoingMessage += wordBuffer;
                await replyMessage.edit(ongoingMessage);
            }
        } catch (error) {
            console.error(error);
            await replyMessage.edit(`❌ An error occurred: ${error.message}`);
        }
    },
};
