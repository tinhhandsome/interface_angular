import { PermissionCheckerService } from '@abp/auth/permission-checker.service';
import { Component, Injector, OnInit, AfterViewInit, ViewEncapsulation, ElementRef, ViewChild, Input } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { AppComponentBase } from '@shared/common/app-component-base';
import { AppMenu } from './app-menu';
import { AppNavigationService } from './app-navigation.service';
import * as objectPath from 'object-path';
import { filter } from 'rxjs/operators';
import { MenuHorizontalDirective } from '@metronic/app/core/directives/menu-horizontal.directive';
import { MenuHorizontalOffcanvasDirective } from '@metronic/app/core/directives/menu-horizontal-offcanvas.directive';
import { AppMenuServiceProxy } from '@shared/service-proxies/service-proxies';
import { AppMenuItem } from './app-menu-item';

@Component({
    templateUrl: './top-bar-menu.component.html',
    selector: 'top-bar-menu',
    encapsulation: ViewEncapsulation.None
})
export class TopBarMenuComponent extends AppComponentBase implements OnInit, AfterViewInit {

    @Input() isTabMenuUsed?: boolean;

    menu: AppMenu = null;
    currentRouteUrl: any = '';
    menuDepth: 0;

    @ViewChild('m_header_menu') el: ElementRef;

    mMenuHorizontal: MenuHorizontalDirective;
    mMenuHorOffcanvas: MenuHorizontalOffcanvasDirective;

    constructor(
        injector: Injector,
        public permission: PermissionCheckerService,
        private _appMenuService: AppMenuServiceProxy,
        private _appNavigationService: AppNavigationService) {
        super(injector);
    }

    ngOnInit() {
        this._appNavigationService.getMenus().subscribe(menu => {
            this.menu = menu;
        })
        this.currentRouteUrl = this.router.url;

        this.router.events
            .pipe(filter(event => event instanceof NavigationEnd))
            .subscribe(event => {
                this.currentRouteUrl = this.router.url;
            });
    }

    ngAfterViewInit(): void {
        this.mMenuHorOffcanvas = new MenuHorizontalOffcanvasDirective(this.el, this.router);
        this.mMenuHorOffcanvas.ngAfterViewInit();

        this.mMenuHorizontal = new MenuHorizontalDirective(this.el);
        this.mMenuHorizontal.ngAfterViewInit();
    }

    showMenuItem(menuItem): boolean {
        return this._appNavigationService.showMenuItem(menuItem);
    }

    getItemCssClasses(item, parentItem, depth) {
        let isRootLevel = item && !parentItem;

        let cssClasses = 'm-menu__item';

        if (objectPath.get(item, 'items.length') || this.isRootTabMenuItemWithoutChildren(item, isRootLevel)) {
            cssClasses += ' m-menu__item--submenu';
        }

        if (objectPath.get(item, 'icon-only')) {
            cssClasses += ' m-menu__item--icon-only';
        }

        if (this.isMenuItemIsActive(item)) {
            cssClasses += ' m-menu__item--active';

            if (this.isTabMenuUsed && isRootLevel) {
                cssClasses += ' m-menu__item--hover';
            }
        }

        if (this.isTabMenuUsed && isRootLevel) {
            cssClasses += ' m-menu__item--tabs';
        }

        if (this.isTabMenuUsed && !isRootLevel && item.items.length) {
            cssClasses += ' m-menu__item--submenu m-menu__item--rel';
            if (depth && depth === 1) {
                cssClasses += ' m-menu__item--submenu-tabs m-menu__item--open-dropdown m-menu__item--hover';
            }

        } else if (!this.isTabMenuUsed && item.items.length) {
            if (depth && depth >= 1) {
                cssClasses += ' m-menu__item--submenu';
            } else {
                cssClasses += ' m-menu__item--rel';
            }
        }

        return cssClasses;
    }

    getAnchorItemCssClasses(item, parentItem): string {
        let isRootLevel = item && !parentItem;
        let cssClasses = 'm-menu__link';

        if ((this.isTabMenuUsed && isRootLevel) || item.items.length) {
            cssClasses += ' m-menu__toggle';
        }

        return cssClasses;
    }

    getSubmenuCssClasses(item, parentItem, depth): string {
        let cssClasses = 'm-menu__submenu m-menu__submenu--classic';

        if (this.isTabMenuUsed) {
            if (depth === 0) {
                cssClasses += ' m-menu__submenu--tabs';
            }

            cssClasses += ' m-menu__submenu--' + (depth >= 2 ? 'right' : 'left');
        } else {
            cssClasses += ' m-menu__submenu--' + (depth >= 1 ? 'right' : 'left');
        }

        return cssClasses;
    }

    isRootTabMenuItemWithoutChildren(item: any, isRootLevel: boolean): boolean {
        return this.isTabMenuUsed && isRootLevel && !item.items.length;
    }

    isMenuItemIsActive(item): boolean {
        if (item.items.length) {
            return this.isMenuRootItemIsActive(item);
        }

        if (!item.route) {
            return false;
        }

        return item.route === this.currentRouteUrl;
    }

    isMenuRootItemIsActive(item): boolean {
        if (item.items) {
            for (const subItem of item.items) {
                if (this.isMenuItemIsActive(subItem)) {
                    return true;
                }
            }
        }

        return false;
    }

    getItemAttrSubmenuToggle(menuItem, parentItem, depth) {
        let isRootLevel = menuItem && !parentItem;
        if (isRootLevel && this.isTabMenuUsed) {
            return 'tab';
        } else {
            if (depth && depth >= 1) {
                return 'hover';
            } else {
                return 'click';
            }
        }
    }

    getCssClass(): string {
        let menuCssClass = 'm-header-menu m-aside-header-menu-mobile m-aside-header-menu-mobile--offcanvas m-header-menu--skin-' + this.currentTheme.baseSettings.header.headerSkin;
        menuCssClass += ' m-header-menu--submenu-skin-light';
        menuCssClass += ' m-aside-header-menu-mobile--skin-light';
        menuCssClass += ' m-aside-header-menu-mobile--submenu-skin-light';

        if (this.currentTheme.baseSettings.layout.layoutType === 'boxed') {
            return menuCssClass + ' m-container--xxl';
        }

        return menuCssClass;
    }
}
