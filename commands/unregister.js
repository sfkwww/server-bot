const Discord = require('discord.js');
const db = require("../database");
const REGISTER_CHANNEL_ID = '684459145893904497';

module.exports = {
	name: '!unregister',
	description: 'Unregister!',
	execute(msg, args) {
		if (msg.channel.id !== REGISTER_CHANNEL_ID) {
			return;
		}
		msg.channel.send("Are you sure you want to unregister? (y/n)");
		const collector = new Discord.MessageCollector(msg.channel, m => m.author.id === msg.author.id, { time: 10000 });
		collector.on('collect', message => {
			if (message.content === "y") {
				db.removeUser(msg.author.id, msg);
				return collector.stop();
			} else {
				message.channel.send("Cancelled unregistration.");
				return collector.stop();
			}
		});
	},
};
