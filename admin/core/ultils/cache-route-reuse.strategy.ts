import { RouteReuseStrategy } from '@angular/router/';
import { ActivatedRouteSnapshot, DetachedRouteHandle } from '@angular/router';
export class CacheRouteReuseStrategy implements RouteReuseStrategy {
    storedRouteHandles = new Map<string, DetachedRouteHandle>();
    allowRetriveCache = {
    };
    shouldReuseRoute(before: ActivatedRouteSnapshot, curr: ActivatedRouteSnapshot): boolean {
        var routeBefore = this.getRoutePath(curr);
        var routeCurrent = this.getRoutePath(before);
        if (routeBefore + '-add' == routeCurrent || routeCurrent.startsWith(routeBefore + '-edit;') || routeCurrent.startsWith(routeBefore + '-view;')) {
            this.allowRetriveCache[routeBefore] = true;
        } else {
            this.allowRetriveCache[routeBefore] = false;
        }
        return before.routeConfig === curr.routeConfig;
    }
    retrieve(route: ActivatedRouteSnapshot): DetachedRouteHandle | null {
        return this.storedRouteHandles.get(this.getRoutePath(route)) as DetachedRouteHandle;
    }
    shouldAttach(route: ActivatedRouteSnapshot): boolean {
        const path = this.getRoutePath(route);
        if (this.allowRetriveCache[path]) {
            return this.storedRouteHandles.has(this.getRoutePath(route));
        }

        return false;
    }
    shouldDetach(route: ActivatedRouteSnapshot): boolean {
        const path = this.getRoutePath(route);
        if (this.allowRetriveCache.hasOwnProperty(path)) {
            return true;
        }
        return false;
    }
    store(route: ActivatedRouteSnapshot, detachedTree: DetachedRouteHandle): void {
        this.storedRouteHandles.set(this.getRoutePath(route), detachedTree);
    }

    getRoutePath(route: ActivatedRouteSnapshot): string {
        var path = route['_routerState'].url;
        var indexOfQ = path.indexOf('?');
        if (indexOfQ >= 0) {
            path = path.substr(0, indexOfQ);
        }
        return path;
    }
}