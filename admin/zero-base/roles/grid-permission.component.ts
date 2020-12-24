import { PermissionCheckerService } from '@abp/auth/permission-checker.service';
import { Injector, ElementRef, Component, OnInit, AfterViewInit, ViewEncapsulation, Inject, ViewChild, AfterViewChecked, Input, ChangeDetectorRef } from '@angular/core';
import { AppComponentBase } from '@shared/common/app-component-base';

import { DOCUMENT } from '@angular/common';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';
import { LayoutRefService } from '@metronic/app/core/services/layout/layout-ref.service';
import { RoleEditDto, RoleServiceProxy, FlatPermissionDto, GetRoleForEditOutput } from '@shared/service-proxies/service-proxies';
import { AppRoleService } from './app-role.service';
import { AppMenuItem } from '@app/shared/layout/nav/app-menu-item';
import { AppRoleItem } from './app-role';
import * as _ from 'lodash';
import { AccordionComponent, AccordionPanelComponent } from 'ngx-bootstrap';

@Component({
    templateUrl: './grid-permission.component.html',
    selector: 'grid-permission',
    encapsulation: ViewEncapsulation.None
})
export class GridPermissionComponent extends AppComponentBase implements OnInit, AfterViewInit, AfterViewChecked {


    // @Input() RoleId;
    ngAfterViewInit(): void {
        // this.cdr.detectChanges();
    }
    ngAfterViewChecked(): void {
    }


    @ViewChild('menuAside') menuListing: AccordionPanelComponent;

    outsideTm: any;
    insideTm: any;
    // grantedPermissionBackup: AppRoleItem[];

    roleForEdit: GetRoleForEditOutput;
    filter = '';
    treeView: AppRoleItem;
    treeModel: AppRoleItem[];

    constructor(
        injector: Injector,

        private el: ElementRef,
        private _roleService: RoleServiceProxy,
        private _appRoleService: AppRoleService,
        private layoutRefService: LayoutRefService,
        @Inject(DOCUMENT) private document: Document) {
        super(injector);
        this.cdr = injector.get(ChangeDetectorRef);
        // this.cdr.reattach();
        // this._appRoleService.cdr = this.cdr;
    }

    updateView() {
        this.cdr.detectChanges();
    }
    updateParentView() {
        var par = this.cdr['_view'].parent;
        if (par && par.component && par.component.updateView) {
            par.component.updateView();
        }
    }
    // initPermissionPage(permissions : string[]){
    //     let result: GetRoleForEditOutput = new GetRoleForEditOutput();
    //     result.permissions = abp.auth.;
    //     this.treeModel = this._appRoleService.initChildsMenu(result);
    // }

    initPermission(result: GetRoleForEditOutput) {
        this.roleForEdit = result;
        this.treeModel = this._appRoleService.initChildsMenu(result);

        this.treeView = new AppRoleItem(result.role.displayName, result.role.displayName, this.treeModel.filter(x => x.parentId == null));
        // console.log('initPermission')

        this.updateParentView();
    }

    initRolePermission(grantedPermission: string[]) {
        this.treeModel.forEach(x => {
            if (grantedPermission.firstOrDefault(y => y == x.name)) {
                x.checked = true;
            }
            else{
                x.checked = false;
            }
        })
        this.updateParentView();

    }

    ngOnInit(): void {
    }

    getGrantedPermissionNames(): string[] {
        return this.treeModel.filter(x => x.checked
        ).map(function (v) {
            return v.name;
        });
    }

    onCheckedParent(item: AppRoleItem) {
        this._appRoleService.checkByParent(item);
        if (item.isRootAction) {
            this._appRoleService.setOnCheckParentToAction(item, this.roleForEdit);
        }
        while (item.parent) {

            item = item.parent;
            if (this.treeModel.filter(x => x.parentId == item.name && x.checked == true).length > 0) {
                item.checked = true;
            } else {
                item.checked = false;
            }

        }
        this.updateParentView();
    }

    onCheckedParentActions(event, parentNode: AppRoleItem, action: AppRoleItem) {
        parentNode.checked = this._appRoleService.OnCheckActionHorizontal(event.target.checked, parentNode, this.roleForEdit.actions);

        this._appRoleService.checkByParentAction(parentNode, action, event.target.checked);


        while (parentNode.parent) {

            parentNode = parentNode.parent;
            if (this.treeModel.filter(x => x.parentId == parentNode.name && x.checked == true).length > 0) {
                parentNode.checked = true;
            } else {
                parentNode.checked = false;
            }

        }

        this.updateParentView();

    }

    filterPermissions(event): void {
        // console.log('filterPermissions')

        if (this.filter) {
            this.treeView.items = this.treeModel.filter(x => x.displayName.toLowerCase().indexOf(this.filter.toLowerCase()) >= 0);
            this.updateParentView();
        }
        else {
            this.treeView.items = this.treeModel.filter(x => x.parentId == null);
            this.updateParentView();
        }
    }

    /**
    * Use for fixed left aside menu, to show menu on mouseenter event.
    * @param e Event
    */
    mouseEnter(event) {
        if (!this.currentTheme.baseSettings.menu.allowAsideMinimizing) {
            return;
        }
        // check if the left aside menu is fixed
        if (this.document.body.classList.contains('m-aside-left--fixed')) {
            if (this.outsideTm) {
                clearTimeout(this.outsideTm);
                this.outsideTm = null;
            }

            this.insideTm = setTimeout(() => {
                // if the left aside menu is minimized
                if (this.document.body.classList.contains('m-aside-left--minimize') && mUtil.isInResponsiveRange('desktop')) {
                    // show the left aside menu
                    this.document.body.classList.remove('m-aside-left--minimize');
                    this.document.body.classList.add('m-aside-left--minimize-hover');
                }
            }, 300);
        }
    }

    /**
     * Use for fixed left aside menu, to show menu on mouseenter event.
     * @param e Event
     */
    mouseLeave(event) {
        if (!this.currentTheme.baseSettings.menu.allowAsideMinimizing) {
            return;
        }

        if (this.document.body.classList.contains('m-aside-left--fixed')) {
            if (this.insideTm) {
                clearTimeout(this.insideTm);
                this.insideTm = null;
            }

            this.outsideTm = setTimeout(() => {
                // if the left aside menu is expand
                if (this.document.body.classList.contains('m-aside-left--minimize-hover') && mUtil.isInResponsiveRange('desktop')) {
                    // hide back the left aside menu
                    this.document.body.classList.remove('m-aside-left--minimize-hover');
                    this.document.body.classList.add('m-aside-left--minimize');
                }
            }, 500);
        }
    }
}
