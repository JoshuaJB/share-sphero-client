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
	document.getElementById("controls").style.display = "inline";
	document.getElementById("color-input").addEventListener("change", onColorChange);
}

function onDisconnected() {
	updateStatus("Disconnected.");
	// Hide controls
	document.getElementById("controls").style.display = "none";
}

function onColorChange() {
	var color = document.getElementById("color-input").value;
    // Encode the color
    var message = {};
    message.type = "color";
    message.color = color;
	// Send the color
	server.send(message);
	updateStatus("Sent color command.");
}

function onDrive(heading) {
    var speed = document.getElementById("speed").value;
    // Encode heading and speed
    var message = {};
    message.type = "drive";
    message.speed = speed;
    message.heading = heading;
    // Send message
    server.send(message);
    updateStatus("Sent drive command");
}

function onMessage() {
	var body = document.getElementById("message").value;
	var name = document.getElementById("name").value;
	// Encode message
	var message = {};
	message.type = "text";
	message.body = body;
	message.from = name;
	// Send message
	server.send(message);
	updateStatus("Sent text message");
}

