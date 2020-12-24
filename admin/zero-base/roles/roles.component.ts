import { Component, Injector, ViewChild, OnInit, inject, ChangeDetectorRef, AfterViewInit } from '@angular/core';
import { appModuleAnimation } from '@shared/animations/routerTransition';
import { AppComponentBase } from '@shared/common/app-component-base';
import { RoleListDto, RoleServiceProxy } from '@shared/service-proxies/service-proxies';
import { Table } from 'primeng/components/table/table';
import { CreateOrEditRoleModalComponent } from './create-or-edit-role-modal.component';
import { EntityTypeHistoryModalComponent } from '@app/shared/common/entityHistory/entity-type-history-modal.component';
import * as _ from 'lodash';
import { finalize } from 'rxjs/operators';

@Component({
    templateUrl: './roles.component.html',
    animations: [appModuleAnimation()]
})
export class RolesComponent extends AppComponentBase implements OnInit, AfterViewInit {


    @ViewChild('createOrEditRoleModal') createOrEditRoleModal: CreateOrEditRoleModalComponent;
    @ViewChild('entityTypeHistoryModal') entityTypeHistoryModal: EntityTypeHistoryModalComponent;
    @ViewChild('dataTable') dataTable: Table;

    _entityTypeFullName = 'GSOFTcore.gAMSPro.Authorization.Roles.Role';
    entityHistoryEnabled = false;

    //Filters
    selectedPermission = '';
    roleName = '';

    constructor(
        injector: Injector,
        private _roleService: RoleServiceProxy
    ) {
        super(injector);
        this.cdr = injector.get(ChangeDetectorRef);
        // console.log(this);
    }
    autoUpdateView() {
        this.cdr.reattach();

    }
    ngOnInit(): void {
        this.setIsEntityHistoryEnabled();
    }

    ngAfterViewInit(): void {
        console.log('ngAfterViewInit')
        // this.cdr.detectChanges();
    }

    private setIsEntityHistoryEnabled(): void {
        let customSettings = (abp as any).custom;
        this.entityHistoryEnabled = customSettings.EntityHistory && customSettings.EntityHistory.isEnabled && _.filter(customSettings.EntityHistory.enabledEntities, entityType => entityType === this._entityTypeFullName).length === 1;
    }

    getRoles(): void {
        abp.ui.setBusy();
        let permission = this.permission ? this.selectedPermission : undefined;

        this._roleService.getRoles(permission, this.roleName)
            .pipe(finalize(() => abp.ui.clearBusy()))
            .subscribe(result => {
                this.primengTableHelper.records = result.items;
                this.primengTableHelper.totalRecordsCount = result.items.length;
                this.cdr.detectChanges();
            });
    }

    createRole(): void {
        this.createOrEditRoleModal.show();
    }

    showHistory(role: RoleListDto): void {
        this.entityTypeHistoryModal.show({
            entityId: role.id.toString(),
            entityTypeFullName: this._entityTypeFullName,
            entityTypeDescription: role.displayName
        });
    }

    deleteRole(role: RoleListDto): void {
        let self = this;
        self.message.confirm(
            self.l('DeleteWarningMessage', role.displayName),
            this.l('AreYouSure'),
            isConfirmed => {
                if (isConfirmed) {
                    this._roleService.deleteRole(role.id).subscribe((response) => {
                        if (!response) {
                            this.getRoles();
                            this.showSuccessMessage(this.l('SuccessfullyDeleted'));
                        }
                        else {
                            this.showErrorMessage(this.l(response));
                        }

                    });
                }
            }
        );
    }
}
