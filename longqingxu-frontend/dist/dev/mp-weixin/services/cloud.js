"use strict";
const common_vendor = require("../common/vendor.js");
var define_import_meta_env_default = {};
const USE_CLOUD = define_import_meta_env_default.VITE_USE_CLOUD === "true";
const CLOUD_ENV = define_import_meta_env_default.VITE_CLOUD_ENV || "cloud1-d6g7211of923bfddc";
let cloudInitialized = false;
function initCloud() {
  if (!USE_CLOUD || cloudInitialized)
    return;
  if (typeof common_vendor.wx$1 !== "undefined" && common_vendor.wx$1.cloud) {
    common_vendor.wx$1.cloud.init({
      env: CLOUD_ENV,
      traceUser: true
    });
    cloudInitialized = true;
  }
}
exports.initCloud = initCloud;
