import { PermissionCheckerService } from '@abp/auth/permission-checker.service';
import { Injector, ElementRef, Component, OnInit, AfterViewInit, ViewEncapsulation, Inject, HostBinding, ChangeDetectionStrategy, ViewChild, AfterViewChecked, ChangeDetectorRef, ApplicationRef, NgZone } from '@angular/core';
import { AppComponentBase } from '@shared/common/app-component-base';
import { AppMenu } from './app-menu';
import { AppNavigationService } from './app-navigation.service';
import { DOCUMENT } from '@angular/common';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';
import { LayoutRefService } from '@metronic/app/core/services/layout/layout-ref.service';
import { AppMenuItem } from './app-menu-item';

@Component({
    templateUrl: './side-bar-menu.component.html',
    selector: 'side-bar-menu',
    encapsulation: ViewEncapsulation.None
})
export class SideBarMenuComponent extends AppComponentBase implements OnInit, AfterViewInit, AfterViewChecked {
    ngAfterViewChecked() {

    }

    allMenuItems: AppMenuItem[];
    menu: AppMenu;
    currentRouteUrl = '';
    insideTm: any;
    outsideTm: any;

    done: boolean = false;
    @ViewChild('menuAside') menuListing: ElementRef;

    menuKeyword: string;

    constructor(
        injector: Injector,
        private el: ElementRef,
        private layoutRefService: LayoutRefService,
        public permission: PermissionCheckerService,
        private _appNavigationService: AppNavigationService,
        private appRef: ApplicationRef,
        private ngZone: NgZone,
        @Inject(DOCUMENT) private document: Document) {
        super(injector);
        this.cdr = injector.get(ChangeDetectorRef);
        // this.cdr.detach();
    }

    ngOnInit() {
        this._appNavigationService.getMenuList().subscribe(appMenus => {
            this.allMenuItems = appMenus;
            this._appNavigationService.buildTreeMenu(this.allMenuItems);
            this.menu = new AppMenu('MainMenu', 'MainMenu', this.allMenuItems.filter(x => x.parent == null));
            this.cdr.detectChanges();
            // this.appRef.tick();
        });

        this.currentRouteUrl = this.router.url.split(/[?#]/)[0];
        this.router.events
            .pipe(filter(event => event instanceof NavigationEnd))
            .subscribe(event => this.currentRouteUrl = this.router.url.split(/[?#]/)[0]);
    }

    ngAfterViewInit(): void {
        setTimeout(() => {
            this.layoutRefService.addElement('asideLeft', this.el.nativeElement);
            this.cdr.detectChanges();
        });
        // this.appRef.tick();
    }

    searchMenu() {
        if (!this.menuKeyword.trim()) {
            this.menu = new AppMenu('MainMenu', 'MainMenu', this.allMenuItems.filter(x => x.parent == null));
        }
        else {
            var menuItems = this.allMenuItems.filter(x => x.name.toLocaleLowerCase().indexOf(this.menuKeyword.toLocaleLowerCase()) >= 0);
            this.menu = new AppMenu('MainMenu', 'MainMenu', menuItems);
        }
        this.cdr.detectChanges();
    }

    // onClickLi(event){
    //     event.stopPropagation();
    //     $('side-bar-menu li.m-menu__item--active')
    //     .removeClass('m-menu__item--expanded')
    //     .removeClass('m-menu__item--active')
    //     .removeClass('m-menu__item--open');
    //     $(event.target)
    //     .addClass('m-menu__item--open')
    //     .addClass('m-menu__item--expanded')
    //     .addClass('m-menu__item--active');
    //     // console.log(event);
    // }

    showMenuItem(menuItem): boolean {
        return this._appNavigationService.showMenuItem(menuItem);
    }

    isMenuItemIsActive(item): boolean {
        if (item.items.length) {
            return this.isMenuRootItemIsActive(item);
        }

        if (!item.route) {
            return false;
        }

        // dashboard
        let currentRoute = location.href.substr(location.href.indexOf('/app/admin/'));
        if (item.route !== '/' && (currentRoute == item.route || currentRoute == item.route + '-add' || currentRoute.startsWith(item.route + '-edit') || currentRoute.startsWith(item.route + '-view'))) {
            return true;
        }

        return currentRoute.replace(/\/$/, '') === item.route.replace(/\/$/, '');
    }

    isMenuRootItemIsActive(item): boolean {
        let result = false;

        for (const subItem of item.items) {
            result = this.isMenuItemIsActive(subItem);
            if (result) {
                return true;
            }
        }

        return false;
    }

    /**
     * Use for fixed left aside menu, to show menu on mouseenter event.
     * @param e Event
     */
    mouseEnter(e: Event) {
        if (!this.currentTheme.baseSettings.menu.allowAsideMinimizing) {
            return;
        }
        // check if the left aside menu is fixed
        if (this.document.body.classList.contains('m-aside-left--fixed')) {
            if (this.outsideTm) {
                clearTimeout(this.outsideTm);
                this.outsideTm = null;
                // this.cdr.detectChanges();
                // this.appRef.tick();
            }

            this.insideTm = setTimeout(() => {
                // if the left aside menu is minimized
                if (this.document.body.classList.contains('m-aside-left--minimize') && mUtil.isInResponsiveRange('desktop')) {
                    // show the left aside menu
                    this.document.body.classList.remove('m-aside-left--minimize');
                    this.document.body.classList.add('m-aside-left--minimize-hover');
                }
                // this.cdr.detectChanges();
                // this.appRef.tick();
            }, 0);
        }
    }

    /**
     * Use for fixed left aside menu, to show menu on mouseenter event.
     * @param e Event
     */
    mouseLeave(e: Event) {
        if (!this.currentTheme.baseSettings.menu.allowAsideMinimizing) {
            return;
        }

        if (this.document.body.classList.contains('m-aside-left--fixed')) {
            if (this.insideTm) {
                clearTimeout(this.insideTm);
                this.insideTm = null;
                // this.cdr.detectChanges();
            }

            this.outsideTm = setTimeout(() => {
                // if the left aside menu is expand
                if (this.document.body.classList.contains('m-aside-left--minimize-hover') && mUtil.isInResponsiveRange('desktop')) {
                    // hide back the left aside menu
                    this.document.body.classList.remove('m-aside-left--minimize-hover');
                    this.document.body.classList.add('m-aside-left--minimize');
                    // this.cdr.detectChanges();
                    // this.appRef.tick();
                }
            }, 0);
        }
    }
}
