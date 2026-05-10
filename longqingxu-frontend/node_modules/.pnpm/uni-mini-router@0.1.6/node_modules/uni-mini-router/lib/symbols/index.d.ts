import type { InjectionKey, Ref } from 'vue';
import type { Route, Router } from '../interfaces';
/**
 * useRouter 用到的key
 *
 * @internal
 */
export declare const routerKey: InjectionKey<Router>;
/**
 * useRoute 用到的key
 *
 * @internal
 */
export declare const routeKey: InjectionKey<Ref<Route>>;
