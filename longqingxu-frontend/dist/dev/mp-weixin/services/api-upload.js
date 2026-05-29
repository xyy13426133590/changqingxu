"use strict";
require("./api.js");
const services_cloud = require("./cloud.js");
const services_cloudApiMap = require("./cloud-api-map.js");
var __async = (__this, __arguments, generator) => {
  return new Promise((resolve, reject) => {
    var fulfilled = (value) => {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    };
    var rejected = (value) => {
      try {
        step(generator.throw(value));
      } catch (e) {
        reject(e);
      }
    };
    var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
    step((generator = generator.apply(__this, __arguments)).next());
  });
};
function getExt(filePath, fallback) {
  const match = filePath.match(/\.([a-zA-Z0-9]+)$/);
  return match ? match[1].toLowerCase() : fallback;
}
function cloudUpload(folder, filePath, fnName) {
  return __async(this, null, function* () {
    const ext = getExt(filePath, folder === "voices" ? "aac" : "jpg");
    const cloudPath = `${folder}/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
    const uploadRes = yield services_cloud.cloudUploadFile(cloudPath, filePath);
    return services_cloud.callCloud(fnName, { fileID: uploadRes.fileID, ext });
  });
}
function apiUploadAvatar(filePath) {
  return cloudUpload("avatars", filePath, services_cloudApiMap.CLOUD_API_MAP.upload.avatar);
}
function apiUploadImage(filePath) {
  return cloudUpload("images", filePath, services_cloudApiMap.CLOUD_API_MAP.upload.image);
}
function apiUploadVoice(filePath) {
  return cloudUpload("voices", filePath, services_cloudApiMap.CLOUD_API_MAP.upload.voice);
}
exports.apiUploadAvatar = apiUploadAvatar;
exports.apiUploadImage = apiUploadImage;
exports.apiUploadVoice = apiUploadVoice;
