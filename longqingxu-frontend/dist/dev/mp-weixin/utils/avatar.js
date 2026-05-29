"use strict";
require("../common/vendor.js");
require("../services/api.js");
const common_assets = require("../common/assets.js");
const DEMO_AVATARS = [common_assets.demo0, common_assets.demo1, common_assets.demo2, common_assets.demo3, common_assets.demo4];
const FALLBACK_AVATAR = DEMO_AVATARS[0];
const SEED_AVATAR_INDEX = {
  "demo-0.jpg": 0,
  "demo-1.jpg": 1,
  "demo-2.jpg": 2,
  "demo-3.jpg": 3,
  "demo-4.jpg": 4
};
function demoIndexFromSeedPath(remote) {
  for (const [name, idx] of Object.entries(SEED_AVATAR_INDEX)) {
    if (remote.includes(name))
      return idx;
  }
  return null;
}
function demoAvatarByUserId(userId) {
  var _a;
  if (!userId)
    return FALLBACK_AVATAR;
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = (hash + userId.charCodeAt(i)) % DEMO_AVATARS.length;
  }
  return (_a = DEMO_AVATARS[hash]) != null ? _a : FALLBACK_AVATAR;
}
function resolveAvatar(remote, userId) {
  const trimmed = (remote != null ? remote : "").trim();
  if (!trimmed)
    return demoAvatarByUserId(userId);
  if (trimmed.startsWith("/assets/") || trimmed.includes("/assets/")) {
    return trimmed;
  }
  if (trimmed.includes("/static/avatars/demo-")) {
    const idx = demoIndexFromSeedPath(trimmed);
    if (idx != null && DEMO_AVATARS[idx]) {
      return DEMO_AVATARS[idx];
    }
  }
  if (trimmed.startsWith("cloud://")) {
    return trimmed;
  }
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }
  return demoAvatarByUserId(userId);
}
exports.DEMO_AVATARS = DEMO_AVATARS;
exports.resolveAvatar = resolveAvatar;
