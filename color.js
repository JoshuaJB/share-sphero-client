/* global Peer 
 * 
 * This file contains all functions for modifying
 * the color palette
 * Available Functions:
 *  colorInit(DOMElement button, DOMElement palette)
 *  addColorMessage(HexColor color)
 *  disablePalette()
 *  enablePalette()
 * Requires:
 *  g_connection
 */
"use strict";
var _lastColors = ["#669900", "#3366cc", "#ff9900", "#cc0000"];
var _palette = null;
var _paletteButton = null;

// The palette DOM object is assumed to have 4 children for
//  color display, and a 5th child to open the HTML5 color
//  picker.
function colorInit(button, palette) {
	if  (!button || !palette)
		throw new Error("Invalid parameters");
	// Save for later
	_palette = palette;
	_paletteButton = button;
	// Setup the palette buttons
	var paletteButtons = palette.getElementsByTagName("paper-fab");
	var onPressFunc = function() {
		_changeColor(this.customStyle['--paper-fab-background']);
		// Display hack
		this._elevation = 4;
	};
	for (var i = 0; i < paletteButtons.length - 1 && i < _lastColors.length; i++) {
		paletteButtons[i].addEventListener("click", onPressFunc, false)
		// Display Hack
		paletteButtons[i]._elevation = 4;
	}
	// Setup main button and HTML5 color picker callbacks
	button.addEventListener("click", _togglePalette, false);
	paletteButtons[paletteButtons.length - 1].addEventListener("click", _openColorPicker, false);
	// Load the color history
	_updatePalette();
}

function addColorMessage(color) {
	if (!_palette)
		throw new Error("Color subsystem not yet initialized");
	// If the color is already in the palette, don't move it
	if (_lastColors.indexOf(color) == -1) {
		// Save color and update display
		_lastColors.unshift(color);
		_updatePalette();
		_updatePaletteButton(_lastColors[0]);
	}
	else {
		// Update display
		_updatePaletteButton(color);
	}
}

function disablePalette() {
	if (!_palette)
		throw new Error("Color subsystem not yet initialized");
	_paletteButton.disabled = true;
	var paletteButtons = _palette.getElementsByTagName("paper-fab");
	for (var i = 0; i < paletteButtons.length; i++) {
		paletteButtons[i].disabled = true;
	}
}

function enablePalette() {
	if (!_palette)
		throw new Error("Color subsystem not yet initialized");
	_paletteButton.disabled = false;
	var paletteButtons = _palette.getElementsByTagName("paper-fab");
	for (var i = 0; i < paletteButtons.length; i++) {
		paletteButtons[i].disabled = false;
		paletteButtons[i]._elevation = 4;
	}
}

// Hide/show color palette
function _togglePalette() {
	if (!_palette)
		throw new Error("Color subsystem not yet initialized");
	if (_palette.style.display != "none" && _palette.style.display != "") {
		_palette.style.display = "none";
		enableCalibrate();
	}
	else {
		_palette.style.display = "block";
		disableCalibrate();
	}
}

function _changeColor(color) {
	// Encode the color
	var message = {};
	message.type = "color";
	message.color = _colorToHex(color);
	// Send the color
	g_connection.send(message);
}

function _updatePalette() {
	var paletteButtons = _palette.getElementsByTagName("paper-fab");
	for (var i = 0; i < paletteButtons.length - 1 && i < _lastColors.length; i++) {
		paletteButtons[i].customStyle['--paper-fab-background'] = _lastColors[i];
		paletteButtons[i].updateStyles();
	}
}
function _updatePaletteButton(color) {
	_paletteButton.customStyle['--paper-fab-background'] = color;
	_paletteButton.updateStyles();
}

function _openColorPicker() {
	// Display Hack
	this._elevation = 4;
	// Create a hidden HTML5 color picker and click it
	var picker = document.createElement("input");
	picker.className = "hidden";
	picker.type = "color";
	picker.addEventListener("change", function(){_changeColor(this.value);}, false);
	document.getElementById("color-palette").appendChild(picker);
	picker.focus();
	picker.click();
}

function _colorToHex(color) {
	if (color.substr(0, 1) === '#')
		return color;
	var digits = /(.*?)rgb\((\d+), (\d+), (\d+)\)/.exec(color);
	var red = parseInt(digits[2]);
	var green = parseInt(digits[3]);
	var blue = parseInt(digits[4]);
	var rgb = blue | (green << 8) | (red << 16);
	return digits[1] + "#" + "000000".substr(0,6 - rgb.toString(16).length) + rgb.toString(16);
}