"use strict";
const services_api = require("../services/api.js");
function resolveVoicePlaySrc(raw) {
  const s = (raw != null ? raw : "").trim();
  if (!s)
    return "";
  if (/^https?:\/\//i.test(s))
    return s;
  if (s.startsWith("wxfile://") || s.startsWith("file://") || s.startsWith("http://tmp/") || s.startsWith("https://tmp/") || s.startsWith("blob:")) {
    return s;
  }
  if (s.startsWith("/")) {
    const origin = services_api.API_BASE_URL.replace(/\/api\/?$/, "");
    return `${origin}${s}`;
  }
  return s;
}
exports.resolveVoicePlaySrc = resolveVoicePlaySrc;
