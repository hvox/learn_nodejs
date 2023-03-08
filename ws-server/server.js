#!/bin/env node
"use strict";
var fs = require("fs");
var path = require("path");
var http = require("http");
var WebSocketServer = require('websocket').server;

const PORT = 8000;
const ROOT_DIRECTORY = __dirname;
var currentValue = "HELLO WORLD";
var users = {};
var usersCount = 0;

function websocketHandler(request) {
	log("WS: " + request.remoteAddress + " " + request.origin);
	// TODO: request.reject() if request.origin is bad
    let connection;
	try {
		log("\tRequested protocols: " + request.requestedProtocols);
    	connection = request.accept('aboba', request.origin);
	} catch (error) {
		log('\tConnection rejected because of error: ' + error.message);
		return;
	}
	let id = ++usersCount;
	users[id] = connection;
    log('\tConnection accepted with id=' + id);
    connection.on('message', function(message) {
		if (message.type != "utf8") {
			log(connection.remoteAddress + " Received non-text message");
			return;
		}
		log(connection.remoteAddress + " Received " + message.utf8Data);
		currentValue = message.utf8Data;
		for (const id in users)
			users[id].sendUTF(currentValue);
    });
	connection.sendUTF(currentValue);
    connection.on('close', function(reasonCode, description) {
		log(connection.remoteAddress + " DISCONNECTED \"" + description + "\" : " + reasonCode);
		delete users[id];
    });
}

let httpServer = http.createServer({}, async (request, response) => {
	const ip = request.socket.remoteAddress;
	log("HTTP: " + ip + " " + request.method + " " + request.url);
	let file = await loadFile(request.url);
	let status = file ? 200 : 404;
	file = file ?? await loadFile("/404.html") ??
		{type: MIME_TYPES.html, content: "<h1>ERROR: 404</h1>"};
	response.writeHead(status, {"Content-Type": file.type});
	response.write(file.content);
	response.end();
})

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
	css: "text/css",
	js: "application/javascript",
	svg: "image/svg+xml",
	bin: "application/octet-stream",
};

function log(message) {
	let date = new Date().toISOString().replace("T", " ").substring(0, 19);
	console.log(date + (message ? " " + message + ";" : ""));
}

httpServer.listen(PORT, () => console.log(`http://localhost:${PORT}/`));
new WebSocketServer({httpServer: httpServer}).on('request', websocketHandler);
