import type { Route, Router } from '../interfaces';
/**
 * 返回router实例，在template的仍然可以使用$Router方法
 */
export declare function useRouter(): Router;
/**
 * 返回当前页面路由信息route，在template的仍然可以使用$Route方法
 */
export declare function useRoute(): Route;
