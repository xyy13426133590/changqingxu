import { Ref } from 'vue';
/**
 * Router instance.
 */
export interface Router {
    route: Ref<Route>;
    routes: any;
    readonly guardHooks: GuardHooksConfig;
    back(to?: RouteBackLocation): void;
    push(to: RouteLocationRaw): void;
    replace(to: RouteLocationRaw): void;
    replaceAll(to: RouteLocationRaw): void;
    pushTab(to: RouteLocationRaw): void;
    beforeEach(userGuard: BeforeEachGuard): void;
    afterEach(userGuard: AfterEachGuard): void;
    install(App: any): void;
}
export type BeforeEachGuard = (to: Route, from: Route, next: (rule?: NextRouteLocationRaw | boolean) => void) => void | Promise<void>;
export type AfterEachGuard = (to: Route, from: Route) => void;
export interface GuardHooksConfig {
    beforeHooks: BeforeEachGuard[];
    afterHooks: AfterEachGuard[];
}
export interface RouteLocationBase {
    animationType?: StartAnimationType | EndAnimationType;
    animationDuration?: number;
}
export type StartAnimationType = 'slide-in-right' | 'slide-in-left' | 'slide-in-top' | 'slide-in-bottom' | 'pop-in' | 'fade-in' | 'zoom-out' | 'zoom-fade-out' | 'none';
export type EndAnimationType = 'slide-out-right' | 'slide-out-left' | 'slide-out-top' | 'slide-out-bottom' | 'pop-out' | 'fade-out' | 'zoom-in' | 'zoom-fade-in' | 'none';
export interface RouteNameLocation extends RouteLocationBase {
    name: string;
    params?: Record<string, string>;
}
export interface RoutePathLocation extends RouteLocationBase {
    path: string;
    query?: Record<string, string>;
}
export interface RouteBackLocation extends RouteLocationBase {
    animationType: EndAnimationType;
    delta?: number;
}
export type RouteUrlLocation = string;
export type RouteLocationRaw = RouteUrlLocation | RouteNameLocation | RoutePathLocation;
export interface RouterOptions {
    routes: any;
}
export interface Route {
    fullPath?: string;
    aliasPath?: string;
    name?: string;
    path?: string;
    query?: Record<string, any>;
    params?: Record<string, any>;
}
export type NAVTYPE = 'push' | 'replace' | 'replaceAll' | 'pushTab' | 'back';
export type NavMethodType = 'navigateTo' | 'redirectTo' | 'reLaunch' | 'switchTab' | 'navigateBack';
export declare enum NavTypeEnum {
    push = "navigateTo",
    replace = "redirectTo",
    replaceAll = "reLaunch",
    pushTab = "switchTab",
    back = "navigateBack"
}
export type HookType = 'beforeHooks' | 'afterHooks';
export declare const NavMethod: NavMethodType[];
export interface NextRouteNameLocation extends RouteNameLocation {
    navType?: NAVTYPE;
}
export interface NextRoutePathLocation extends RoutePathLocation {
    navType?: NAVTYPE;
}
export interface NextRouteBackLocation extends RouteBackLocation {
    navType?: NAVTYPE;
}
export type NextRouteLocationRaw = RouteUrlLocation | NextRouteNameLocation | NextRoutePathLocation | NextRouteBackLocation;
