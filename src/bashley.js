require("dotenv").config();
const path = require("path");

const Bashley = {
	root: __dirname,
	require: id => require(path.join(Bashley.root, id)),
	config: require("../config.js")
}

global.Bashley = Bashley;