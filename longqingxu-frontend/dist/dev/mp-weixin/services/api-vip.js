"use strict";
require("./api.js");
const services_cloud = require("./cloud.js");
const services_cloudApiMap = require("./cloud-api-map.js");
function apiGetVipPlans() {
  return services_cloud.callCloud(services_cloudApiMap.CLOUD_API_MAP.vip.plans);
}
function apiCreateOrder(params) {
  return services_cloud.callCloud(services_cloudApiMap.CLOUD_API_MAP.vip.createOrder, params);
}
function apiGetOrder(orderId) {
  return services_cloud.callCloud(services_cloudApiMap.CLOUD_API_MAP.vip.getOrder, { orderId });
}
function apiMockPayOrder(orderId) {
  return services_cloud.callCloud(services_cloudApiMap.CLOUD_API_MAP.vip.mockPay, { orderId });
}
exports.apiCreateOrder = apiCreateOrder;
exports.apiGetOrder = apiGetOrder;
exports.apiGetVipPlans = apiGetVipPlans;
exports.apiMockPayOrder = apiMockPayOrder;
