require("dotenv").config();
const path = require("path");

const Bashley = {
	root: __dirname,
	require: id => require(path.join(Bashley.root, id)),
	config: {
			token: {
				discord: process.env.DISCORD_TOKEN
			},
			guilds: process.env.GUILDS.split(","),
			prefix: process.env.CMD_PREFIX
	}
}

global.Bashley = Bashley;