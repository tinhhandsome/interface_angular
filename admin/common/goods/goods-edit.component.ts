import { Component, Injector, ViewChild, Output, EventEmitter, OnInit, ViewEncapsulation, ElementRef } from '@angular/core';
import { appModuleAnimation } from '@shared/animations/routerTransition';
import * as _ from 'lodash';
import { GoodsServiceProxy, CM_GOODS_ENTITY, CM_UNIT_ENTITY, CM_GOODSTYPE_ENTITY, UnitServiceProxy, GoodsTypeServiceProxy, SupplierServiceProxy, CM_SUPPLIER_ENTITY, UltilityServiceProxy } from '@shared/service-proxies/service-proxies';
import { EditPageState } from '@app/ultilities/enum/edit-page-state';
import { AllCodes } from '@app/ultilities/enum/all-codes';
import { finalize } from 'rxjs/operators';
import { DefaultComponentBase } from '@app/ultilities/default-component-base';
import { IUiAction } from '@app/ultilities/ui-action';
import { AuthStatusConsts } from '@app/admin/core/ultils/consts/AuthStatusConsts';
import { RecordStatusConsts } from '@app/admin/core/ultils/consts/RecordStatusConsts';

@Component({
    templateUrl: './goods-edit.component.html',
    encapsulation: ViewEncapsulation.None,
    animations: [appModuleAnimation()]
})
export class GoodsEditComponent extends DefaultComponentBase implements OnInit, IUiAction<CM_GOODS_ENTITY> {
    constructor(
        injector: Injector,
        private ultilityService: UltilityServiceProxy,
        private unitService: UnitServiceProxy,
        private goodsTypeService: GoodsTypeServiceProxy,
        private supplierService: SupplierServiceProxy,
        private goodsService: GoodsServiceProxy
    ) {
        super(injector);
        this.editPageState = this.getRouteData('editPageState');
        this.inputModel.gD_ID = this.getRouteParam('id');
        this.initFilter();
        this.initCombobox();
        this.initIsApproveFunct();
    }

    @ViewChild('editForm') editForm: ElementRef;

    EditPageState = EditPageState;
    AllCodes = AllCodes;
    editPageState: EditPageState;

    inputModel: CM_GOODS_ENTITY = new CM_GOODS_ENTITY();
    filterInput: CM_GOODS_ENTITY;
    isApproveFunct: boolean;


    get disableInput(): boolean {
        return this.editPageState == EditPageState.viewDetail;
    }

    units: CM_UNIT_ENTITY[];
    goodsTypes: CM_GOODSTYPE_ENTITY[];
    suppliers: CM_SUPPLIER_ENTITY[];

    isShowError = false;

    ngOnInit(): void {
        switch (this.editPageState) {
            case EditPageState.add:
                this.inputModel.recorD_STATUS = RecordStatusConsts.Active;
                this.appToolbar.setRole('Goods', false, false, true, false, false, false, false, false);
                this.appToolbar.setEnableForEditPage();
                break;
            case EditPageState.edit:
                this.appToolbar.setRole('Goods', false, false, true, false, false, false, false, false);
                this.appToolbar.setEnableForEditPage();
                this.getGoods();
                break;
            case EditPageState.viewDetail:
                this.appToolbar.setRole('Goods', false, false, false, false, false, false, true, false);
                this.appToolbar.setEnableForViewDetailPage();
                this.getGoods();
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
        this.unitService.cM_UNIT_Search(this.getFillterForCombobox()).subscribe(response => {
            this.units = response.items;
        });
        this.goodsTypeService.cM_GOODSTYPE_Search(this.getFillterForCombobox()).subscribe(response => {
            this.goodsTypes = response.items;
        })
        this.supplierService.cM_SUPPLIER_Search(this.getFillterForCombobox()).subscribe(response => {
            this.suppliers = response.items;
        })
    }

    getGoods() {
        this.goodsService.cM_GOODS_ById(this.inputModel.gD_ID).subscribe(response => {
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
            if (!this.inputModel.gD_ID) {

                this.goodsService.cM_GOODS_Ins(this.inputModel).pipe(finalize(() => { this.saving = false; }))
                    .subscribe((response) => {
                        if (response.result != '0') {
                            this.showErrorMessage(response.errorDesc);
                        }
                        else {
                            this.addNewSuccess();
                            if (!this.isApproveFunct) {
                                this.goodsService.cM_GOODS_App(response.id, this.appSession.user.userName)
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
                this.goodsService.cM_GOODS_Upd(this.inputModel).pipe(finalize(() => { this.saving = false; }))
                    .subscribe((response) => {
                        if (response.result != '0') {
                            this.showErrorMessage(response.errorDesc);
                        }
                        else {
                            this.updateSuccess();
                            if (!this.isApproveFunct) {
                                this.goodsService.cM_GOODS_App(this.inputModel.gD_ID, this.appSession.user.userName)
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
        this.navigatePassParam('/app/admin/goods', null, { filterInput: JSON.stringify(this.filterInput) });
    }

    onAdd(): void {
    }

    onUpdate(item: CM_GOODS_ENTITY): void {
    }

    onDelete(item: CM_GOODS_ENTITY): void {
    }

    onApprove(item: CM_GOODS_ENTITY): void {
        var currentUserName = this.appSession.user.userName;
        if (currentUserName == this.inputModel.makeR_ID) {
            this.showErrorMessage(this.l('ApproveFailed'));
            return;
        }
        this.message.confirm(
            this.l('ApproveWarningMessage', this.l(this.inputModel.gD_NAME)),
            this.l('AreYouSure'),
            (isConfirmed) => {
                if (isConfirmed) {
                    this.saving = true;
                    this.goodsService.cM_GOODS_App(this.inputModel.gD_ID, currentUserName)
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
    onViewDetail(item: CM_GOODS_ENTITY): void {
    }

    onSave(): void {
        this.saveInput();
    }

    onSearch(): void {
    }

    onResetSearch(): void {
    }
}
