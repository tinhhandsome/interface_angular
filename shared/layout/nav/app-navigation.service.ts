import { PermissionCheckerService } from '@abp/auth/permission-checker.service';
import { AppSessionService } from '@shared/common/session/app-session.service';

import { Injectable, Optional, Inject } from '@angular/core';
import { AppMenu } from './app-menu';
import { AppMenuItem } from './app-menu-item';
import { AppMenuServiceProxy, AppMenuDto, API_BASE_URL } from '@shared/service-proxies/service-proxies';
import { Observable, Subject, BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';
import * as $ from 'jquery';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class AppNavigationService {

    _permissionCheckerService: PermissionCheckerService;
    _appMenuService: AppMenuServiceProxy;
    baseUrl: string;
    _appSessionService: AppSessionService;
    _http;

    constructor(
        permissionCheckerService: PermissionCheckerService,
        appMenuService: AppMenuServiceProxy,
        @Inject(HttpClient) http: HttpClient,
        @Optional() @Inject(API_BASE_URL) baseUrl: string,
        appSessionService: AppSessionService
    ) {
        this._permissionCheckerService = permissionCheckerService;
        this._appMenuService = appMenuService;
        this.baseUrl = baseUrl;
        this._appSessionService = appSessionService;
        this._http = http;
    }

    checkChildMenuItemPermission(menuItem): boolean {

        for (let i = 0; i < menuItem.items.length; i++) {
            let subMenuItem = menuItem.items[i];

            if (subMenuItem.permissionName && this._permissionCheckerService.isGranted(subMenuItem.permissionName)) {
                return true;
            } else if (subMenuItem.items && subMenuItem.items.length) {
                return this.checkChildMenuItemPermission(subMenuItem);
            }
        }

        return false;
    }

    getCookie(name) {
        var value = "; " + document.cookie;
        var parts = value.split("; " + name + "=");
        if (parts.length == 2) return parts.pop().split(";").shift();
    }

    getMenuList(): Observable<AppMenuItem[]> {
        var subject = new Subject<AppMenuItem[]>();
        this._appMenuService.getAllMenus().subscribe(response => {
            var appMenus: AppMenuItem[] = [];
            response.forEach(x => {
                var appMenu: AppMenuItem = new AppMenuItem(x.name, x.permissionName, x.icon, x.route);
                appMenu.id = x.menuId;
                appMenu.parentId = x.parentId;
                appMenus.push(appMenu);
                appMenu.items = [];
            });


            subject.next(appMenus);
        });
        return subject.asObservable();
    }

    buildTreeMenu(appMenus: AppMenuItem[]) {
        var dist = {};

        appMenus.forEach((x) => {
            dist[x.id] = x;
        });

        appMenus.forEach((x) => {
            var parent = dist[x.parentId];
            if (parent) {
                parent.items.push(x);
                x.parent = parent;
            }
        })
    }

    getMenus(): Observable<AppMenu> {
        var menu: AppMenu;
        var subject = new Subject<AppMenu>();

        this.getMenuList().subscribe(appMenus =>{
            this.buildTreeMenu(appMenus);
            menu = new AppMenu('MainMenu', 'MainMenu', appMenus.filter(x => x.parent == null));
            subject.next(menu);
        });
        return subject.asObservable();


    }

    showMenuItem(menuItem: AppMenuItem): boolean {
        if (menuItem.permissionName === 'Pages.Administration.Tenant.SubscriptionManagement' && this._appSessionService.tenant && !this._appSessionService.tenant.edition) {
            return false;
        }

        let hideMenuItem = false;

        if (menuItem.requiresAuthentication && !this._appSessionService.user) {
            hideMenuItem = true;
        }

        if (menuItem.permissionName && !this._permissionCheckerService.isGranted(menuItem.permissionName)) {
            hideMenuItem = true;
        }

        if (menuItem.hasFeatureDependency() && !menuItem.featureDependencySatisfied()) {
            hideMenuItem = true;
        }

        if (!hideMenuItem && menuItem.items && menuItem.items.length) {
            return this.checkChildMenuItemPermission(menuItem);
        }

        return !hideMenuItem;
    }
}
