"use strict";
const services_api = require("./api.js");
function apiUploadVoice(filePath) {
  return services_api.uploadFile("/upload/voice", filePath, "file");
}
exports.apiUploadVoice = apiUploadVoice;
