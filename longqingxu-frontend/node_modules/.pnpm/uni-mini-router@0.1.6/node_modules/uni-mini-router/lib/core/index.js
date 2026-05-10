/*!
 * uni-mini-router v0.1.6
 * 2023/12/21 13:42:18 weisheng
 */
import{inject as r,reactive as u,watch as e}from"vue";import{routerKey as o,routeKey as i}from"../symbols/index.js";function t(){var u=r(o);if(u)return u;throw Error('useRouter 只可以在 Vue 上下文中使用，请确保你已经正确地注册了 "uni-mini-router" 并且当前正处于 Vue 上下文中')}function n(){var o=r(i);if(o){var t=u(o.value);return e(o,(function(r){Object.assign(t,r)})),t}throw Error('useRoute 只可以在 Vue 上下文中使用，请确保你已经正确地注册了 "uni-mini-router" 并且当前正处于 Vue 上下文中')}export{n as useRoute,t as useRouter};
