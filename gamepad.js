/* global Peer 
 * 
 * This file contains all functions for the gamepad control
 * Available Functions:
 *  gamepadInit(DOMElement button)
 *  disableGamepad()
 *  enableGamepad()
 * Requires:
 *  g_connection
 */
"use strict";
var _gamepadButton = null;
var _gamepadEnabled = false;

function gamepadInit(button) {
	if (!button)
		throw new Error("Invalid parameters");
	_gamepadButton = button;
	// Setup mouse listener
	document.addEventListener("mousemove", _drive, false);
}

function disableGamepad() {
	if (!_gamepadButton)
		throw new Error("Gamepad subsystem not yet initialized");
	_gamepadButton.disabled = true;
	// Cleanup
}

function enableGamepad() {
	if (!_gamepadButton)
		throw new Error("Gamepad subsystem not yet initialized");
	_gamepadButton.disabled = false;
}

function _drive(event) {
	if (!_gamepadButton.disabled)
		return;
	var buttonCenter;
	if (window.innerWidth < 660)
		buttonCenter = {x: window.innerWidth - 80, y: window.innerHeight - 80};
	else
		buttonCenter = {x: window.innerWidth - 110, y: window.innerHeight - 80};
	//console.warn("movement, X: " + event.pageX + ", Y: " + event.pageY);
	//console.warn(String(buttonCenter.x - event.pageX) + ", " + String(buttonCenter.y - event.pageY));
	var diff = {x:buttonCenter.x - event.pageX, y: buttonCenter.y - event.pageY};
	var mag = Math.sqrt(diff.x * diff.x + diff.y * diff.y);
	var angle = Math.atan2(diff.y, diff.x) * 180 / Math.PI;
	console.warn(mag + ":" + angle);
}