/* global Peer */
"use strict";

var conn = null;
var name = "";
document.getElementById("entered-connection-id").addEventListener("click", validateAndConnect);

function validateAndConnect() {
	// Get ID
	var id = parseInt(document.getElementById("connection-id").value, 16);
	// Validate ID
	if (id != NaN)
		connect(id);
	else
		updateStatus("Invalid ID, please try again");
}

function connect(id) {
	var localID = Math.floor(Math.random()*65536);
	if (name == "") {
		name = prompt("Please enter your name:", "Anon-" + localID.toString(16).toUpperCase());
		if (name == null)
			return;
	}
	updateStatus("Connecting... If this takes too long, make sure you entered the right ID.");
	// This ID is internal only
	var peer = new Peer(localID, {host: 'sharesphero.azurewebsites.net', port: 80, path: "/share-sphero-broker"});
	// Connect to the Sphero control server	
	conn = peer.connect(String(id), {label: name});
	conn.on("data", updateDisplay);
	conn.on("open", onConnected);
    conn.on("close", onDisconnected);
    conn.on("error", onDisconnected);
}

function updateStatus(str) {
	document.getElementById("status").innerHTML = str;
}

function onConnected() {
	updateStatus("Connected.");
	switchDisplayMode("control");
}

function onDisconnected() {
	updateStatus("Disconnected.");
	switchDisplayMode("setup");
}

function onColorChange() {
    // Encode the color
    var message = {};
    message.type = "color";
    message.color = document.getElementById("color").value;
	// Send the color
	conn.send(message);
	updateStatus("Sent color command.");
}

function onDrive(heading) {
    // Encode heading and speed
    var message = {};
    message.type = "drive";
    message.speed = document.getElementById("speed").value;
    message.heading = heading;
    // Send message
    conn.send(message);
    updateStatus("Sent drive command");
}

function onMessage() {
	// Encode message
	var message = {};
	message.type = "text";
	message.body = document.getElementById("message").value;
	// Send message
	conn.send(message);
	updateStatus("Sent text message");
}

function onCalibrate() {
	// Encode message
	var message = {};
	message.type = "setmode";
	message.mode = "calibrate";
	// Send message
	conn.send(message);
	updateStatus("Prepping to calibrate...");
}

function onStopCalibrate() {
	// Encode message
	var message = {};
	message.type = "setmode";
	message.mode = "drive";
	// Send message
	conn.send(message);
	updateStatus("Returning to drive mode...");
}

function onHeadingChange() {
	// Encode message
	var message = {};
	message.type = "heading";
	message.heading = document.getElementById("heading").value;
	// Send message
	conn.send(message);
	updateStatus("Send calibration command");
}

function updateDisplay(message) {
	switch(message.type) {
		case "setmode":
			if (message.mode != "calibrate") {
				switchDisplayMode("control");
				updateStatus("Controls restored.");
			}
			else if (message.label == name) {
				switchDisplayMode("calibrate");
				updateStatus("Calibrating...");
			}
			else {
				switchDisplayMode("locked");
				updateStatus("Another user is calibrating the Sphero, please wait...");
			}
			break;
		case "text":
			document.getElementById("messages").innerHTML += message.label + ": " + message.body + "<br>";
			break;
		case "drive":
			// Do something?
			break;
		case "heading":
			// Ignore, clients do nothing here
			break;
		case "color":
			document.getElementById("color").value = message.color;
			break;
		default:
			console.warn("Message type '" + message.type + "' not implemented.");
	}
}

function switchDisplayMode(displayMode) {
	switch(displayMode) {
	case "control":
		// Only display chat and controls
		document.getElementById("controls").style.display = "inline";
		document.getElementById("calibrate").style.display = "none";
		document.getElementById("setup").style.display = "none";
		document.getElementById("chat").style.display = "inline";
		break;
	case "locked":
		// Only display chat
		document.getElementById("controls").style.display = "none";
		document.getElementById("calibrate").style.display = "none";
		document.getElementById("setup").style.display = "none";
		document.getElementById("chat").style.display = "inline";
		break;
	case "calibrate":
		// Only display chat and calibration controls
		document.getElementById("controls").style.display = "none";
		document.getElementById("calibrate").style.display = "inline";
		document.getElementById("setup").style.display = "none";
		document.getElementById("chat").style.display = "inline";
		break;
	default:
		// Fallback to setup
		document.getElementById("controls").style.display = "none";
		document.getElementById("calibrate").style.display = "none";
		document.getElementById("setup").style.display = "inline";
		document.getElementById("chat").style.display = "none";
	}
}
