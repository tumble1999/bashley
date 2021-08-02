const jsdom = require("jsdom");
const { JSDOM } = jsdom;

function getUrl(entry, section) {
	return `https://man7.org/linux/man-pages/man${section}/${entry}.${section}.html`
}


async function getDocument(url) {
	let dom = await JSDOM.fromURL(url)
	return dom.window.document;
}



function parseMan(document) {
	//console.log(Array.from(document.querySelectorAll("h2,pre")).map(e => e.textContent))
	return Array.from(document.querySelectorAll("h2,pre,.footline")).map(e => e.nodeName == "H2" ? e.textContent.replace("top", "").trim() : e.textContent)
}
/*(async () => {
	let url = getUrl("echo", 1);
	console.log(url);
	let doc = await getDocument(url);
	console.log(doc.title);
	console.log(parseMan(doc));
})();*/

async function getMan(entry, section = 1) {
	let url = getUrl(entry, section),
		doc = await getDocument(url),
		man = parseMan(doc);
	out = { header: man[0] };
	for (let i = 1; i < man.length - 1; i++) {
		if (["name", "synopsis", "description"].includes(man[i].toLowerCase()))
			out[man[i].toLowerCase()] = "```" + man[i + 1] + "```";
	}
	out.url = url;
	out.footer = man[man.length - 1]
	//console.log(out);
	return out;
}

module.exports = { getMan }
