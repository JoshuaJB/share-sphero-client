/* global Peer 
 * 
 * This file contains all functions for the sending
 * and display of chat messages.
 * Available Functions:
 *  chatInit(DOMElement chatStatus, DOMElement chatRecent)
 *  openChat()
 *  refreshChat()
 *  sendMessage(String messageBody)
 *  addChatMessage(String from, String message)
 */
"use strict";
var _messages = [];
var _chatStatus = null;
var _chatRecent = null;
var _chatDialog = null
var _chatContent = null;
var _chatInput = null;

function chatInit(chatStatus, chatRecent, chatDialog, chatContent, chatInput, chatSend) {
	if (!chatStatus || !chatRecent || !chatDialog || !chatContent || !chatInput || !chatSend)
		throw new Error("Invalid parameters");
	// Load status card
	_chatStatus = chatStatus;
	_chatRecent = chatRecent;
	// Load main chat
	_chatDialog = chatDialog;
	_chatContent = chatContent;
	_chatInput = chatInput;
	chatSend.addEventListener("click", function(){sendMessage(_chatInput.value);_chatInput.value = "";}, false);
	refreshChat();
}

function openChat() {
	_chatDialog.open();
}

function refreshChat() {
	_updateChatCard();
	_updateChatStatusCard();
}

function sendMessage(messageBody) {
	// Encode message
	var message = {};
	message.type = "text";
	message.body = messageBody;
	// Send message
	g_connection.send(message);
}

function addChatMessage(from, message) {
	if (!_chatStatus)
		throw new Error("Chat subsystem not yet initialized");
	_messages.push({"from":from, "message":message});
	refreshChat();
}

function _updateChatCard() {
	var messages = "";
	// Handle edge cases
	if (!_messages.length)
		messages = "No Recent Messages";
	if (g_connection) {
		_chatInput.disabled = false;
		_chatInput.label = "Enter text message";
	}
	else {
		_chatInput.disabled = true;
		_chatInput.label = "No connection";
	}
	// Squash messages and display
	for (var idx in _messages)
		messages += _messages[idx].from + ": " + _messages[idx].message + "<br>";
	_chatContent.innerHTML = messages;
}

function _updateChatStatusCard() {
	var status = "Chat Active";
	var recent = "Recent Messages:<br>";
	// Edge cases
	if (!_messages.length)
		recent = "No Recent Messages";
	if (!g_connection)
		status = "Chat History Only";
	// Squash the last 5 recent messages
	var i = _messages.length > 5 ? _messages.length - 5 : 0;
	for (; i < _messages.length; i++)
		recent += _messages[i].from + ": " + _messages[i].message + "<br>";
	// Display
	_chatStatus.innerHTML = status;
	_chatRecent.innerHTML = recent;
}