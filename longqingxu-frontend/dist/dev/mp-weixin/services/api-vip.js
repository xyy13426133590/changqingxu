"use strict";
const services_api = require("./api.js");
function apiGetVipPlans() {
  return services_api.get("/vip/plans");
}
function apiCreateOrder(params) {
  return services_api.post("/vip/orders", params);
}
exports.apiCreateOrder = apiCreateOrder;
exports.apiGetVipPlans = apiGetVipPlans;
