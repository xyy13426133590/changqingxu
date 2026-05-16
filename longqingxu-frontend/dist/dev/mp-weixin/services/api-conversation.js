"use strict";
const services_api = require("./api.js");
function apiGetConversations() {
  return services_api.get("/conversations");
}
function apiCreateConversation(targetUserId) {
  return services_api.post("/conversations", { targetUserId });
}
function apiGetMessages(conversationId, page = 1, limit = 20) {
  return services_api.get(`/conversations/${conversationId}/messages`, { page, limit });
}
function apiSendMessage(params) {
  return services_api.post("/messages", params);
}
function apiMarkMessagesRead(conversationId) {
  return services_api.put("/messages/read", { conversationId });
}
exports.apiCreateConversation = apiCreateConversation;
exports.apiGetConversations = apiGetConversations;
exports.apiGetMessages = apiGetMessages;
exports.apiMarkMessagesRead = apiMarkMessagesRead;
exports.apiSendMessage = apiSendMessage;
