"use strict";
require("./api.js");
const services_cloud = require("./cloud.js");
const services_cloudApiMap = require("./cloud-api-map.js");
function apiGetConversations() {
  return services_cloud.callCloud(services_cloudApiMap.CLOUD_API_MAP.conversations.list);
}
function apiCreateConversation(targetUserId) {
  return services_cloud.callCloud(services_cloudApiMap.CLOUD_API_MAP.conversations.create, { targetUserId });
}
function apiGetMessages(conversationId, page = 1, limit = 20) {
  {
    return services_cloud.callCloud(services_cloudApiMap.CLOUD_API_MAP.conversations.messages, { conversationId, page, limit });
  }
}
function apiSendMessage(params) {
  return services_cloud.callCloud(services_cloudApiMap.CLOUD_API_MAP.messages.send, params);
}
function apiMarkMessagesRead(conversationId) {
  return services_cloud.callCloud(services_cloudApiMap.CLOUD_API_MAP.messages.markRead, { conversationId });
}
exports.apiCreateConversation = apiCreateConversation;
exports.apiGetConversations = apiGetConversations;
exports.apiGetMessages = apiGetMessages;
exports.apiMarkMessagesRead = apiMarkMessagesRead;
exports.apiSendMessage = apiSendMessage;
