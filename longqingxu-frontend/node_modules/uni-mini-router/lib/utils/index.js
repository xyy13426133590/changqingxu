/*!
 * uni-mini-router v0.1.6
 * 2023/12/21 13:42:18 weisheng
 */
function t(t){var n={},r=t.split("?"),e="",c=[];r.length>1&&(e=r[1]),c=e.split("&");for(var i=0;c.length>i;i++)2===c[i].split("=").length&&(n[c[i].split("=")[0]]=c[i].split("=")[1]);return n}function n(t,n){for(var r in n)t.indexOf("?")>-1?t+="&".concat(r,"=").concat(n[r]):t+="?".concat(r,"=").concat(n[r]);return t}function r(t,n,r){return t.replace(RegExp(n,"g"),r)}function e(t){return t=r(t,"//","/"),t=r(t,"https:/","https://"),t=r(t,"http:/","http://")}function c(t){var n={};if(t)for(var r in t){var e=t[r];void 0===e&&(e=""),n[r]=e}return n}function i(t){return null==t||0===Object.keys(t).length}export{e as beautifyUrl,t as getUrlParams,i as isEmptyObject,c as queryStringify,n as setUrlParams};
