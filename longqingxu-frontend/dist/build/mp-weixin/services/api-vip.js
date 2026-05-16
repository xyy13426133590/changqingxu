"use strict";const r=require("./api.js");exports.apiCreateOrder=function(e){return r.post("/vip/orders",e)},exports.apiGetVipPlans=function(){return r.get("/vip/plans")};
