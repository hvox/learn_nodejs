#!/bin/env node

function parseBigInt(string) {
	try {
		return BigInt(string);
	} catch (_) {
		throw SyntaxError("Can't parse \"" + string + "\" as a number");
	}
}

var args = process.argv.slice(2);
try {
	var result = 0n;
	args.forEach(arg => result += parseBigInt(arg));
	console.log(result.toString());
} catch (error) {
	console.error(error.message);
}
