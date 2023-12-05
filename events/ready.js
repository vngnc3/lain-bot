const { Events } = require('discord.js');

module.exports = {
	name: Events.ClientReady,
	once: true,
	execute(client) {
		console.log(`Lain is logged in as ${client.user.tag}. Let's all love Lain.`);
	},
};
