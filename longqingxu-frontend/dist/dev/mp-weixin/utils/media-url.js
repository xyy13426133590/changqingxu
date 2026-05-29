"use strict";
require("../common/vendor.js");
require("../services/api.js");
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
function resolveCloudFileID(fileID) {
  return __async(this, null, function* () {
    var _a, _b;
    try {
      const wxCloud = (_a = globalThis == null ? void 0 : globalThis.wx) == null ? void 0 : _a.cloud;
      if (wxCloud) {
        const res = yield wxCloud.getTempFileURL({ fileList: [fileID] });
        const info = (_b = res == null ? void 0 : res.fileList) == null ? void 0 : _b[0];
        if ((info == null ? void 0 : info.status) === 0 && info.tempFileURL) {
          return info.tempFileURL;
        }
      }
    } catch (e) {
    }
    return fileID;
  });
}
function resolveVoicePlaySrc(raw) {
  return __async(this, null, function* () {
    const s = (raw != null ? raw : "").trim();
    if (!s)
      return "";
    if (/^https?:\/\//i.test(s))
      return s;
    if (s.startsWith("wxfile://") || s.startsWith("file://") || s.startsWith("http://tmp/") || s.startsWith("https://tmp/") || s.startsWith("blob:")) {
      return s;
    }
    if (s.startsWith("cloud://")) {
      return resolveCloudFileID(s);
    }
    if (s.startsWith("/") && false)
      ;
    return s;
  });
}
exports.resolveVoicePlaySrc = resolveVoicePlaySrc;
