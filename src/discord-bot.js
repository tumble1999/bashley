const Discord = require("discord.js"),
	commands = require("./commands"),
	token = Bashley.config.token.discord,
	client = new Discord.Client();
Bashley.bot = client;
Bashley.get = {
	guild: async guild =>
		(await Bashley.bot.guilds.fetch(guild)) || Bashley.bot.guilds.cache.get(guild),
	channel: async channel =>
		(await Bashley.bot.channels.fetch(channel)) ||
		Bashley.bot.channels.cache.get(channel),
	role: async (guild, role) =>
		(await (await Bashley.get.guild(guild)).roles.fetch(role)) ||
		(await Bashley.get.guild(guild)).roles.cache.get(role),
	message: async (channel, message) =>
		(await (await Bashley.get.channel(channel)).messages.fetch(message)) ||
		(await Bashley.get.channel(channel)).messages.cache.get(message),
	user: async user =>
		(await Bashley.bot.users.fetch(user)) || Bashley.bot.users.cache.get(user),
	member: async (guild, member) =>
		(await (await Bashley.get.guild(guild)).members.fetch(member)) ||
		(await Bashley.get.guild(guild)).members.cache.get(member),
}

client.on("ready", () => {
	if (!client.user) return;
	console.log(`[discord] Logged in as ${client.user.tag}`);
	client.user.setPresence({
		activity: { name: "Debian", type: "PLAYING" },
	});
});

client.on("message", async message => {
	if (message.author.bot) return;
	if (commands.parse(message)) return;
});

(async () => {
	await client.login(token);
})();

module.exports = client;