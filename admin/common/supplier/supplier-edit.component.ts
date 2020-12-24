import { Component, Injector, ViewChild, Output, EventEmitter, OnInit, ViewEncapsulation, ElementRef } from '@angular/core';
import { appModuleAnimation } from '@shared/animations/routerTransition';
import * as _ from 'lodash';
import { SupplierServiceProxy, CM_SUPPLIER_ENTITY, CM_SUPPLIERTYPE_ENTITY, SupplierTypeServiceProxy, CM_REGION_ENTITY, RegionServiceProxy, UltilityServiceProxy } from '@shared/service-proxies/service-proxies';
import { EditPageState } from '@app/ultilities/enum/edit-page-state';
import { AllCodes } from '@app/ultilities/enum/all-codes';
import { finalize } from 'rxjs/operators';
import { DefaultComponentBase } from '@app/ultilities/default-component-base';
import { IUiAction } from '@app/ultilities/ui-action';
import { AuthStatusConsts } from '@app/admin/core/ultils/consts/AuthStatusConsts';
import { RecordStatusConsts } from '@app/admin/core/ultils/consts/RecordStatusConsts';

@Component({
    templateUrl: './supplier-edit.component.html',
    encapsulation: ViewEncapsulation.None,
    animations: [appModuleAnimation()]
})

export class SupplierEditComponent extends DefaultComponentBase implements OnInit, IUiAction<CM_SUPPLIER_ENTITY> {
    constructor(
        injector: Injector,
        private ultilityService: UltilityServiceProxy,
        private supplierService: SupplierServiceProxy,
        private regionService: RegionServiceProxy,
        private supplierTypeService: SupplierTypeServiceProxy
    ) {
        super(injector);
        this.editPageState = this.getRouteData('editPageState');
        this.inputModel.suP_ID = this.getRouteParam('id');
        this.initFilter();
        this.initCombobox();
        this.initIsApproveFunct();
    }

    @ViewChild('editForm') editForm: ElementRef;

    EditPageState = EditPageState;
    AllCodes = AllCodes;
    editPageState: EditPageState;

    supplierTypes: CM_SUPPLIERTYPE_ENTITY[];
    regions: CM_REGION_ENTITY[];

    inputModel: CM_SUPPLIER_ENTITY = new CM_SUPPLIER_ENTITY();
    filterInput: CM_SUPPLIER_ENTITY;
    isApproveFunct: boolean;

    get disableInput(): boolean {
        return this.editPageState == EditPageState.viewDetail;
    }

    isShowError = false;

    ngOnInit(): void {
        switch (this.editPageState) {
            case EditPageState.add:
                this.inputModel.recorD_STATUS = RecordStatusConsts.Active;
                this.appToolbar.setRole('Supplier', false, false, true, false, false, false, false, false);
                this.appToolbar.setEnableForEditPage();
                break;
            case EditPageState.edit:
                this.appToolbar.setRole('Supplier', false, false, true, false, false, false, false, false);
                this.appToolbar.setEnableForEditPage();
                this.getSupplier();
                break;
            case EditPageState.viewDetail:
                this.appToolbar.setRole('Supplier', false, false, false, false, false, false, true, false);
                this.appToolbar.setEnableForViewDetailPage();
                this.getSupplier();
                break;
        }
        this.appToolbar.setUiAction(this);
    }

    initIsApproveFunct() {
        this.ultilityService.isApproveFunct(this.getCurrentFunctionId()).subscribe(isApproveFunct => {
            this.isApproveFunct = isApproveFunct;
        })
    }

    initCombobox() {
        this.supplierTypeService.cM_SUPPLIERTYPE_Search(this.getFillterForCombobox()).subscribe((response) => {
            this.supplierTypes = response.items;
        })

        this.regionService.cM_REGION_Search(this.getFillterForCombobox()).subscribe(response => {
            this.regions = response.items;
        })
    }

    getSupplier() {
        this.supplierService.cM_SUPPLIER_ById(this.inputModel.suP_ID).subscribe(response => {
            this.inputModel = response;
            if (this.inputModel.autH_STATUS == AuthStatusConsts.Approve) {
                this.appToolbar.setButtonApproveEnable(false);
            }
        });
    }

    saveInput() {
        if (this.isApproveFunct == undefined) {
            this.showErrorMessage(this.l('PageLoadUndone'));
            return;
        }

        if ((this.editForm as any).form.invalid) {
            this.isShowError = true;
            this.showErrorMessage(this.l('FormInvalid'));
            return;
        }
        if (this.editPageState != EditPageState.viewDetail) {
            this.saving = true;
            this.inputModel.makeR_ID = this.appSession.user.userName;
            if (!this.inputModel.suP_ID) {
                this.supplierService.cM_SUPPLIER_Ins(this.inputModel).pipe(finalize(() => { this.saving = false; }))
                    .subscribe((response) => {
                        if (response.result != '0') {
                            this.showErrorMessage(response.errorDesc);
                        }
                        else {
                            this.addNewSuccess();
                            if (!this.isApproveFunct) {
                                this.supplierService.cM_SUPPLIER_App(response.id, this.appSession.user.userName)
                                    .pipe(finalize(() => { this.saving = false; }))
                                    .subscribe((response) => {
                                        if (response.result != '0') {
                                            this.showErrorMessage(response.errorDesc);
                                        }
                                    });
                            }
                        }
                    });
            }
            else {
                this.supplierService.cM_SUPPLIER_Upd(this.inputModel).pipe(finalize(() => { this.saving = false; }))
                    .subscribe((response) => {
                        if (response.result != '0') {
                            this.showErrorMessage(response.errorDesc);
                        }
                        else {
                            this.updateSuccess();
                            if (!this.isApproveFunct) {
                                this.supplierService.cM_SUPPLIER_App(this.inputModel.suP_ID, this.appSession.user.userName)
                                    .pipe(finalize(() => { this.saving = false; }))
                                    .subscribe((response) => {
                                        if (response.result != '0') {
                                            this.showErrorMessage(response.errorDesc);
                                        }
                                        else {
                                            this.inputModel.autH_STATUS = AuthStatusConsts.Approve;
                                        }
                                    });
                            }
                            else {
                                this.inputModel.autH_STATUS = AuthStatusConsts.NotApprove;
                            }
                        }
                    });
            }
        }
    }

    goBack() {
        this.navigatePassParam('/app/admin/supplier', null, { filterInput: JSON.stringify(this.filterInput) });
    }

    onAdd(): void {
    }

    onUpdate(item: CM_SUPPLIER_ENTITY): void {
    }

    onDelete(item: CM_SUPPLIER_ENTITY): void {
    }

    onApprove(item: CM_SUPPLIER_ENTITY): void {
        var currentUserName = this.appSession.user.userName;
        if (currentUserName == this.inputModel.makeR_ID) {
            this.showErrorMessage(this.l('ApproveFailed'));
            return;
        }
        this.message.confirm(
            this.l('ApproveWarningMessage', this.l(this.inputModel.suP_NAME)),
            this.l('AreYouSure'),
            (isConfirmed) => {
                if (isConfirmed) {
                    this.saving = true;
                    this.supplierService.cM_SUPPLIER_App(this.inputModel.suP_ID, currentUserName)
                        .pipe(finalize(() => { this.saving = false; }))
                        .subscribe((response) => {
                            if (response.result != '0') {
                                this.showErrorMessage(response.errorDesc);
                            }
                            else {
                                this.approveSuccess();
                            }
                        });
                }
            }
        );
    }

    onViewDetail(item: CM_SUPPLIER_ENTITY): void {
    }

    onSave(): void {
        this.saveInput();
    }

    onSearch(): void {
    }

    onResetSearch(): void {
    }
}
