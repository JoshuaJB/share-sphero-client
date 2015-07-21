/* global Peer */
"use strict";

var g_connection = null;
var g_name = "";
var g_serverid = "";

// Everything has to load before we use polymer
window.addEventListener("WebComponentsReady", init, false);

function init() {
	chatInit(
		document.getElementById("chat-status"),
		document.getElementById("chat-recent"),
		document.getElementById("chat-dialog"),
		document.getElementById("chat-dialog-content"),
		document.getElementById("chat-dialog-input"),
		document.getElementById("chat-dialog-send")
	);
	calibrateInit(
		document.getElementById("calibrate"),
		document.getElementById("calibrate-controls").getElementsByTagName("paper-fab")[0],
		document.getElementById("calibrate-controls").getElementsByTagName("paper-fab")[1]
	);
	colorInit(
		document.getElementById("palette"),
		document.getElementById("color-palette")
	);
	gamepadInit(document.getElementById("gamepad"));
	disableCalibrate();
	disablePalette();
	disableGamepad();
	document.getElementById("conn").addEventListener("click", function(){setupConnection(null);}, false);
	document.getElementById("chat").addEventListener("click", openChat, false);
	updateStatus("Ready to Connect", "Tap here to begin");
}

function setupConnection(id) {
	if (g_connection)
		return;
	if (id) {
		// Validate ID
		if (parseInt(id, 16) != NaN && parseInt(id, 16) < 4096)
			connect(id);
		else
			updateStatus("Invalid ID", "Tap here to try again");
	}
	else
		prompt("Enter Server ID", "Eg. f5a", setupConnection);
}

function connect(id) {
	if (g_name == "") {
		prompt("Enter Username", "Eg. John Smith", function(name){g_name = name;connect(id);});
		return;
	}
	g_serverid = id;
	var localID = Math.floor(Math.random() * 65536);
	updateStatus("Connecting...", "If this takes too long, make sure you entered the right ID.");
	// This ID is internal only
	var peer = new Peer(localID, {host: 'sharesphero.azurewebsites.net', port: 80, path: "/share-sphero-broker", debug: 3});
	// Connect to the Sphero control server	
	g_connection = peer.connect(String(parseInt(g_serverid, 16)), {label: g_name});
	g_connection.on("data", updateDisplay);
	g_connection.on("open", onConnected);
	g_connection.on("close", onDisconnected);
	g_connection.on("error", onDisconnected);
}

// Update the global status, if new status is null no changes are made
function updateStatus(major, minor) {
	if (major)
		document.getElementById("conn-status").innerHTML = major;
	if (minor)
		document.getElementById("conn-info").innerHTML = minor;
}

function onConnected() {
	updateStatus("Connected.", "Connected to server " + String(g_serverid));
	switchDisplayMode("control");
}

function onDisconnected() {
	g_connection = null;
	updateStatus("Disconnected.", "Tap here to connect");
	switchDisplayMode("setup");
}

// +++++ DEPRECATED +++++
function onDrive(heading) {
    // Encode heading and speed
    var message = {};
    message.type = "drive";
    message.speed = document.getElementById("speed").value;
    message.heading = heading;
    // Send message
    g_connection.send(message);
    updateStatus("Sent drive command");
}
// +++++ END DEPRECATED +++++

function updateDisplay(message) {
	switch(message.type) {
		case "setmode":
			if (message.mode != "calibrate") {
				stopCalibrateMessage();
				updateStatus("Controls restored.", null);
			}
			else if (message.label == g_name) {
				// Ignore
				updateStatus("Calibrating...", null);
			}
			else {
				startCalibrateMessage();
				updateStatus("Another user is calibrating the Sphero, please wait...", null);
			}
			break;
		case "text":
			addChatMessage(message.label, message.body);
			break;
		case "drive":
		case "heading":
			// Ignore
			break;
		case "color":
			addColorMessage(message.color);
			break;
		default:
			console.warn("Message type '" + message.type + "' not implemented.");
	}
}

function switchDisplayMode(displayMode) {
	switch(displayMode) {
		case "control":
			// Enable everything
			enableCalibrate();
			enablePalette();
			enableGamepad();
			break;
		case "setup":
			// Disable everything
			disableCalibrate();
			disablePalette();
			disableGamepad();
			break;
	}
	refreshChat();
}

function prompt(title, placeholder, callback) {
	document.getElementById("prompt-title").innerHTML = title;
	document.getElementById("prompt-input").label = placeholder;
	var prompt = document.getElementById("prompt");
	var callbackWReset = function() {
		// Clear value
		var val = document.getElementById("prompt-input").value;
		document.getElementById("prompt-input").value = "";
		// Clear callbacks
		prompt.parentNode.replaceChild(prompt.cloneNode(true), prompt);
		callback(val);
	};
	prompt.addEventListener("iron-overlay-closed", callbackWReset, false);
	prompt.open();
	document.getElementById("prompt-input").focus();
}
