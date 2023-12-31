const { SlashCommandBuilder } = require('discord.js');
const gptStream = require('../../api/gpt-discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ask')
        .setDescription('Ask Lain.')
        .addStringOption(option => 
            option.setName('query')
                  .setDescription('Your question for Lain')
                  .setRequired(true)),
    async execute(interaction) {
        // Define the required role name
        const requiredRoleName = 'WIRED';  // Replace with your specific role name

        // Check if the command user has the required role
        const hasRequiredRole = interaction.member.roles.cache.some(role => role.name === requiredRoleName);
        if (!hasRequiredRole) {
            const rejections = [
                "We'll speak later.",
                "I'll talk to you later.",
                "Not feeling it.",
                "Who are you?",
                "I don't recognize you.",
                "?",
                "..."
            ]
            await interaction.reply(rejections[Math.floor(Math.random()*rejections.length)]);
            return;
        }

        const dateInUTC7 = new Date(Date.now()).toLocaleString("en-US", { timeZone: "Asia/Bangkok" });
        await interaction.deferReply();
        const userQuery = interaction.options.getString('query');
        console.log(`${interaction.user.username} asked Lain on ${dateInUTC7}: ${userQuery}`);

        let ongoingMessage = '';
        let wordBuffer = '';

        // Set up the callback function to handle streamed data
        const handleData = async (data) => {
            wordBuffer += data;

            // Split the buffer on space and update when a full word is received
            let spaceIndex = wordBuffer.indexOf(' ');
            while (spaceIndex !== -1) {
                // Add the word to the ongoing message
                ongoingMessage += wordBuffer.substring(0, spaceIndex + 1);
                wordBuffer = wordBuffer.substring(spaceIndex + 1);

                // Update the reply
                await interaction.editReply(ongoingMessage);
                
                spaceIndex = wordBuffer.indexOf(' ');
            }
        };

        // Await the completion of the GPT stream
        try {
            await gptStream(userQuery, handleData);
            // After the stream is finished, check for any remaining buffer
            if (wordBuffer) {
                ongoingMessage += wordBuffer;
                await interaction.editReply(ongoingMessage);
            }
        } catch (error) {
            await interaction.followUp(`An error occurred: ${error.message}`);
        }
    },
};
