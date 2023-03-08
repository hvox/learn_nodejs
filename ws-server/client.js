window.onload = () => {
	let input = document.getElementById("client-input");
	let output = document.getElementById("server-text");
	let scheme = document.location.protocol == "https:" ? "wss" : "ws";
	let url = scheme + "://" + document.location.hostname + ":" + document.location.port;
	connection = new WebSocket(url, ["aboba"]);
	connection.onopen = _ => console.log("connection established");
	connection.onmessage = evt => {
		console.log("Message received: " + evt.data.toString());
		output.textContent = evt.data.toString();
	}
	input.addEventListener("keypress", function(event) {
		if (event.key === "Enter")
			connection.send(input.value);
	});
}
