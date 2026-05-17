"use strict";
const services_api = require("./api.js");
function apiGetVipPlans() {
  return services_api.get("/vip/plans");
}
function apiCreateOrder(params) {
  return services_api.post("/vip/orders", params);
}
function apiGetOrder(orderId) {
  return services_api.get(`/vip/orders/${encodeURIComponent(orderId)}`);
}
function apiMockPayOrder(orderId) {
  return services_api.post(`/vip/orders/${encodeURIComponent(orderId)}/mock-pay`, {});
}
exports.apiCreateOrder = apiCreateOrder;
exports.apiGetOrder = apiGetOrder;
exports.apiGetVipPlans = apiGetVipPlans;
exports.apiMockPayOrder = apiMockPayOrder;
