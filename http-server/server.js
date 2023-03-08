#!/bin/env node
"use strict";
var http = require("http");
var fs = require("fs");
var path = require("path");

const PORT = 8000;
const ROOT_DIRECTORY = __dirname;

http.createServer({}, async (request, response) => {
	const ip = request.socket.remoteAddress;
	console.log((new Date().toISOString().replace("T", " ").substring(0, 19)) + " " +
		ip + " " + request.method + " " + request.url);
	let file = await loadFile(request.url);
	let status = file ? 200 : 404;
	file = file ?? await loadFile("/404.html") ??
		{type: MIME_TYPES.html, content: "<h1>ERROR: 404</h1>"};
	response.writeHead(status, {"Content-Type": file.type});
	response.write(file.content);
	response.end();
}).listen(PORT, () => 
	console.log(`Directory ${ROOT_DIRECTORY} is bound to http://localhost:${PORT}/`)
);

let loaded_files = {};
async function loadFile(url) {
	if (url.endsWith("/")) url += "index.html";
	if (url in loaded_files) return loaded_files[url];
	let filePath = path.join(ROOT_DIRECTORY, url);
	if (!filePath.startsWith(ROOT_DIRECTORY)) return null;
	try {
		let content = await fs.promises.readFile(filePath);
		let extension = path.extname(filePath).substring(1).toLowerCase();
		let type = MIME_TYPES[extension] ?? MIME_TYPES.bin;
		return loaded_files[url] = {type, content};
	} catch (error) {
		return null;
	}
}

const MIME_TYPES = {
	html: "text/html; charset=UTF-8",
	js: "application/javascript",
	css: "text/css",
	svg: "image/svg+xml",
	bin: "application/octet-stream",
};
