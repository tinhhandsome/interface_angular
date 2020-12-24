import { Component, Injector } from "@angular/core";
import { AppMenu } from "../app-menu";
import { AppNavigationService } from "../app-navigation.service";
import { AppComponentBase } from "@shared/common/app-component-base";

@Component({
    templateUrl: './menu-list.component.html',
    selector: 'menu-list'
})
export class MenuListComponent extends AppComponentBase {
    menu: AppMenu = new AppMenu(null, null, null);
    constructor(injector: Injector,
        private _appNavigationService: AppNavigationService) {
        super(injector);
    }
    loadMenu() {
        this._appNavigationService.getMenus().subscribe(menu => {
            this.menu = menu;
        });
    }
}