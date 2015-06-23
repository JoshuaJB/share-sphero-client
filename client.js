var server = null;

document.getElementById("entered-connection-id").addEventListener("click", validateAndConnect);

function validateAndConnect() {
	// Get ID
	var id = document.getElementById("connection-id").value;
	// Validate ID
	if (id != "")
		connect(id);
	else
		updateStatus("Invalid ID, please try again");
}

function connect(id) {
	updateStatus("Connecting... If this takes too long, make sure you entered the right ID.");
	// This ID is internal only
	var peer = new Peer(Math.floor(Math.random()*100000), {host: 'sharesphero.azurewebsites.net', port: 80, path: "/share-sphero-broker"});
	// Connect to the Sphero control server	
	server = peer.connect(String(id));
	server.on("open", onConnected);
    server.on("disconnected", onDisconnected);
    server.on("close", onDisconnected);
    server.on("error", onDisconnected);
}

function updateStatus(str) {
	document.getElementById("status").innerHTML = str;
}

function onConnected() {
	updateStatus("Connected.");
	// Unhide and enable controls
	document.getElementById("color-input").style.display = "inline";
	document.getElementById("color-input").addEventListener("change", onColorChange);
}

function onDisconnected() {
	updateStatus("Disconnected.");
	// Hide controls
	document.getElementById("color-input").style.display = "none";
}

function onColorChange() {
	var color = document.getElementById("color-input").value;
	// For now, just send the raw color
	server.send(color);
	updateStatus("Sent command.");
}
