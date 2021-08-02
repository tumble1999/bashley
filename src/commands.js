let man = require("./man"),
	Discord = require("discord.js"),

	commands = {
		ping: {
			call: async function (message, args, stdin, stdout) {
				stdout(`Pong: ${Date.now() - message.createdTimestamp}ms`);
			},
		},
		help: {
			call: async function (message, args, stdin, stdout) {
				let list = Object.keys(commands)
					.filter(cmd => hasPerms(message.member, commands[cmd].perms))
					.map(c => {
						let cmd = commands[c];
						let args = cmd.args ? cmd.args.map(arg => `(${arg})`).join(" ") : "";
						let description = cmd.description || "";

						return `${Bashley.config.prefix}${c} ${args} - ${description}`;
					});
				let header = "**Bashley created by Tumble#9485**";
				stdout(
					header +
					"\n```" +
					(list.length == 0
						? "There are no commands available to you."
						: list.join("\n")) +
					"```"
				);
			},
		},
		echo: {
			args: ["text..."],
			call: async function (message, args, stdin, stdout) {
				stdout(stdin.join("\n") + args.join(" "));
				return true;
			}
		},
		man: {
			args: ["entry", "section"],
			call: async function (message, args, stdin, stdout) {
				let m = await man.getMan(args[0], args[1]);
				stdout(niceEmbed(m));
				return true;
			}
		}
	};

function niceEmbed(obj) {
	let embed = new Discord.MessageEmbed();
	embed.foo

	for (let key in obj) {
		let value = obj[key];
		if (value.length > 1024) continue;
		switch (key) {
			case "title":
			case "header":
				embed.setTitle(value);
				break;
			case "footer":
				embed.setFooter(value);
				break;
			case "url":
				embed.setURL(value);
				break;
			default:
				embed.addField(key, value);
		}
	}
	return embed;
}

function hasPerms(member, perms) {
	console.log(perms);
	if (void 0 === perms) return true;
	if (perms === "") perms = "ADMINISTRATOR";
	return member.hasPermission(perms, { checkAdmin: true, checkOwner: true });
}

function interlace(arr, w) {
	return arr.map((v, i) => i == arr.length - 1 ? v : [v, w]).flat();
}

function splitButIncludeDelim(text, delim) {
	return interlace(text.split(delim), delim);
}

function splitMultAndKeepDelims(text, delims) {
	if (!Array.isArray(delims)) delims = [delims];
	text = [text];

	for (let i = 0; i < delims.length; i++) {
		let d = delims[i];
		text = text.map(t => splitButIncludeDelim(t, d)).flat();
	}
	return text;
}

//console.log(splitMultAndKeepDelims("hello&&world||pizza", ["&&", "||"]));

async function callCommand(message, content, stdin, stdout, stderr) {
	let args = content.split(" "),
		name = args.shift();
	if (!name) return false;
	let cmd = commands[name];
	if (
		!cmd ||
		!cmd.call ||
		(cmd.perms && !hasPerms(message.member, cmd.perms))
	)
		return false;
	console.log(`[commands] Calling command: ${name} - [${args.join(",")}]`);
	await cmd.call(message, args, stdin, stdout, stderr);
}

async function runCommandStream(message, content, last) {

	let sum_stdout = [];

	let stdout = [],
		stderr = [],
		operators = ["|"],
		lastOp = "",
		todo = splitMultAndKeepDelims(content, operators);

	//command params:  message args stdin stdout stderr
	for (let i = 0; i < todo.length; i++) {
		let c = todo[i],
			peek = todo[i + 1];
		if (operators.includes(c)) {
			lastOp = c;
			continue;
		}
		let stdin = stdout;
		stdout = [];
		stderr = [];
		let success = await callCommand(message, c,
			stdin,
			(text) => {
				stdout.push(text);
				if (peek != "|") {
					sum_stdout.push(text)
					if (last) {
						message.channel.send(text)
					}
				}
			}
		);
	}

	return sum_stdout;
}

module.exports = {
	parse: async message => {
		let content = message.content;
		if (content.substr(0, Bashley.config.prefix.length) != Bashley.config.prefix) return false;
		content = content.substr(Bashley.config.prefix.length, content.length)
		if (!content) return false;

		await runCommandStream(message, content, true);

		return true;
	}
}