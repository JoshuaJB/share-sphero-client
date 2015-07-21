/* global Peer 
 * 
 * This file contains all functions for the calibration controls
 * Available Functions:
 *  calibrateInit(DOMElement button, DOMElement left, DOMElement right)
 *  stopCalibrateMessage()
 *  startCalibrateMessage()
 *  disableCalibrate()
 *  enableCalibrate()
 * Requires:
 *  g_connection
 */
"use strict";
var _isSelfCalibrating = false;
var _isOtherCalibrating = false;
var _heading = 0;
var _HEADING_DIFF = 15;
var _left = null;
var _right = null;
var _calibrateButton = null;

function calibrateInit(button, left, right) {
	if (!button || !left || !right)
		throw new Error("Invalid parameters");
	// Event listeners
	button.addEventListener("click", _startStopSelfCalibrate, false);
	left.addEventListener("click", _calibrateLeft, false);
	right.addEventListener("click", _calibrateRight, false);
	// Display hacks
	left._elevation = 4;
	right._elevation = 4;
	// Save for later
	_left = left;
	_right = right;
	_calibrateButton = button;
}

function startCalibrateMessage() {
	_isOtherCalibrating = true;
	disableCalibrate();
	disablePalette();
	disableGamepad();
}

function stopCalibrateMessage() {
	_isOtherCalibrating = false;
	enableGamepad();
	enablePalette();
	enableCalibrate();
}

function disableCalibrate() {
	if (!_calibrateButton)
		throw new Error("Calibration subsystem not initialized");
	_calibrateButton.disabled = true;
	_left.disabled = true;
	_right.disabled = true;
}

function enableCalibrate() {
	if (!_calibrateButton)
		throw new Error("Calibration subsystem not initialized");
	_calibrateButton.disabled = false;
	_left.disabled = false;
	_left._elevation = 4;
	_right.disabled = false;
	_right._elevation = 4;
}

function _startStopSelfCalibrate() {
	if (_isOtherCalibrating)
		throw new Error("Cannot toggle self calibration state while another user is calibrating");
	if (_isSelfCalibrating) {
		// Reenable other UI elements
		enableGamepad();
		enablePalette();
		// Enable calibration controls
		_left.style.display = "none";
		_right.style.display = "none";
		_isSelfCalibrating = false;
		// Inform server
		g_connection.send({type:"setmode",mode:"drive"});
	}
	else {
		// Disable other UI elements
		disableGamepad();
		disablePalette();
		// Enable calibration controls
		_left.style.display = "block";
		_right.style.display = "block";
		_isSelfCalibrating = true;
		// Inform server
		g_connection.send({type:"setmode",mode:"calibrate"});

	}
}

function _calibrateLeft() {
	// Display hack
	_left._elevation = 4;
	// Check if we can proceed
	if (!_isSelfCalibrating)
		throw new Error("_calibrateLeft cannot be called if calibration is not in progress");
	// Send message
	var message = {};
	message.type = "heading";
	message.heading = _heading -= _HEADING_DIFF;
	g_connection.send(message);
}

function _calibrateRight() {
	// Display hack
	_right.getElementsByTagName("paper-material")[0].elevation = 4;
	// Check if we can proceed
	if (!_isSelfCalibrating)
		throw new Error("_calibrateLeft cannot be called if calibration is not in progress");
	// Send message
	var message = {};
	message.type = "heading";
	message.heading = _heading += _HEADING_DIFF;
	g_connection.send(message);
}