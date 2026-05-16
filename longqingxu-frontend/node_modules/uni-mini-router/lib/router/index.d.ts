/// <reference types="@dcloudio/types" />
/// <reference types="@dcloudio/types" />
import { AfterEachGuard, BeforeEachGuard, HookType, NAVTYPE, NextRouteLocationRaw, Route, RouteLocationRaw, Router } from '../interfaces';
/**
 * 跳转至指定路由
 * @param to 目标路径
 * @param router router实例
 * @param navType 跳转类型
 * @returns
 */
export declare function navjump(to: RouteLocationRaw, router: Router, navType: NAVTYPE): void;
/**
 * 获取目标路径
 * @param to 目标页面
 * @param router
 * @returns
 */
export declare function getRoutePath(to: RouteLocationRaw, router: Router): string;
/**
 * 获取当前页面
 * @returns 当前页面
 */
export declare function getCurrentPage(): Page.PageInstance<AnyObject, {}>;
/**
 * 保存路由信息到路由实例
 * @param router 路由实例
 * @param query 路由参数
 * @returns
 */
export declare function saveCurrRouteByCurrPage(router: Router): void;
/**
 * 获取当前页面的路由信息
 * @param router router实例
 * @returns
 */
export declare function getCurrentPageRoute(router: Router): Route;
/**
 * 通过页面路路径寻找路由信息
 * @param path 页面路径
 * @param router 路由实例
 * @returns 路由信息
 */
export declare function getRouteByPath(path: string, router: Router): Route;
/**
 * 注册守卫钩子
 * @param router 路由实例
 * @param hookType 钩子类型
 * @param userGuard 守卫
 */
export declare function registerEachHooks(router: Router, hookType: HookType, userGuard: BeforeEachGuard | AfterEachGuard): void;
/**
 * 重写uni路由相关事件
 */
export declare function rewriteNavMethod(router: Router): void;
/**
 * 用Promise处理守卫方法
 * @param guard 守卫
 * @param to 目标路由
 * @param from 来源路由
 * @returns
 */
export declare function guardToPromiseFn(guard: BeforeEachGuard, to: Route, from: Route): Promise<true | NextRouteLocationRaw>;
