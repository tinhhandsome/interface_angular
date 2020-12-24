import { Component, ElementRef, EventEmitter, Injector, Output, ViewChild, Inject, OnInit, ChangeDetectorRef, NgZone } from '@angular/core';
import { AppComponentBase } from '@shared/common/app-component-base';
import { CreateOrUpdateRoleInput, RoleEditDto, RoleServiceProxy } from '@shared/service-proxies/service-proxies';
import { ModalDirective } from 'ngx-bootstrap';
import { finalize } from 'rxjs/operators';
import { DOCUMENT } from '@angular/common';
import { AppMenu } from '@app/shared/layout/nav/app-menu';
import { AppRoleService } from './app-role.service';
import { PermissionTreeComponent } from '../shared/permission-tree.component';
import { GridPermissionComponent } from './grid-permission.component';

@Component({
    selector: 'createOrEditRoleModal',
    templateUrl: './create-or-edit-role-modal.component.html'
})
export class CreateOrEditRoleModalComponent extends AppComponentBase implements OnInit {
    updateView() {
        this.cdr.detectChanges();
    }
    updateParentView() {
        var par = this.cdr['_view'].parent;
        if (par && par.component && par.component.updateView) {
            par.component.updateView();
        }
    }
    ngOnInit(): void {
        this.zone.runOutsideAngular(() => {


            const self = this;
            self.active = true;

            self._roleService.getAllRole().subscribe(result => {
                // self.role = result.role;
                self.gridTree.initPermission(result);

                // this.cdr.detectChanges();

                // this.Permission = this._appRoleService.getMenus(result);
                // this.permissionTree.editData = result;
            });
        })
    }

    // public RoleId: number;
    @ViewChild('gridTree') gridTree: GridPermissionComponent;


    @ViewChild('menuAside') menuListing: ElementRef;

    @ViewChild('createOrEditModal') modal: ModalDirective;
    //@ViewChild('permissionTree') permissionTree: PermissionTreeComponent;

    @Output() modalSave: EventEmitter<any> = new EventEmitter<any>();

    active = false;
    saving = false;
    outsideTm: any;
    insideTm: any;
    // Permission: AppMenu;

    role: RoleEditDto = new RoleEditDto();
    constructor(
        injector: Injector,
        private zone: NgZone,
        private _roleService: RoleServiceProxy,
        private _appRoleService: AppRoleService,
    ) {
        super(injector);
        this.cdr = injector.get(ChangeDetectorRef);
    }


    showTab1: boolean = true;
    showTab2: boolean = true;

    ChangeTab1() {
        this.showTab1 = true;
        this.showTab2 = false;
        this.updateView();
    }
    ChangeTab2() {
        this.showTab1 = false;
        this.showTab2 = true;
        this.updateView();
    }
    show(roleId?: number): void {
        this.zone.runOutsideAngular(() => {
            // this.gridTree.roleForEdit = undefined;
            // this.gridTree.treeModel = undefined;
            // this.gridTree.treeView = undefined;
            // this.showTab1 = true;
            // this.showTab2 = false;
            const self = this;
            self.active = true;
            // self.RoleId = roleId;

            self.modal.show();
            this.showTab1 = true;
            this.showTab2 = false;
            // abp.ui.setBusy(undefined, '', 1);
            self._roleService.getRoleForEdit(roleId).subscribe(result => {

                self.role = result.role;
                self.gridTree.initRolePermission(result.grantedPermissionNames);
                // this.Permission = this._appRoleService.getMenus(result);
                // console.time("UpdateView");
                // this.cdr.detectChanges();
                // console.timeEnd("UpdateView");
                // abp.ui.clearBusy();

                // this.permissionTree.editData = result;
            });
        })
    }

    onShown(): void {
        document.getElementById('RoleDisplayName').focus();
    }

    save(event): void {
        // if(event.codeKey != 13){

        // }
        const self = this;

        const input = new CreateOrUpdateRoleInput();
        input.role = self.role;

        input.grantedPermissionNames = this.gridTree.getGrantedPermissionNames();

        // input.grantedPermissionNames = self.permissionTree.getGrantedPermissionNames();



        this.saving = true;
        this._roleService.createOrUpdateRole(input)
            .pipe(finalize(() => this.saving = false))
            .subscribe(() => {
                this.showSuccessMessage(this.l('SavedSuccessfully'));
                this.close();
                this.modalSave.emit(null);
            });
    }

    close(): void {
        this.active = false;
        this.saving = false;
        this.modal.hide();
    }

}
