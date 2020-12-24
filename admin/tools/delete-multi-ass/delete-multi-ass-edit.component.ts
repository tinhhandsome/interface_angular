import { Component, Injector, ViewChild, Output, EventEmitter, OnInit, ViewEncapsulation, ElementRef, AfterViewInit } from '@angular/core';
import { appModuleAnimation } from '@shared/animations/routerTransition';
import * as _ from 'lodash';
import { DeleteMultiAssServiceProxy, T_DEL_ASS_MUL_ENTITY, UltilityServiceProxy, ASS_MASTER_ENTITY, AssMasterServiceProxy, T_DEL_ASS_MUL_DT_ENTITY } from '@shared/service-proxies/service-proxies';
import { EditPageState } from '@app/ultilities/enum/edit-page-state';
import { finalize, subscribeOn } from 'rxjs/operators';
import { DefaultComponentBase } from '@app/ultilities/default-component-base';
import { IUiAction } from '@app/ultilities/ui-action';
import { AuthStatusConsts } from '@app/admin/core/ultils/consts/AuthStatusConsts';
import { RecordStatusConsts } from '@app/admin/core/ultils/consts/RecordStatusConsts';
import { AssetModalComponent } from '@app/admin/core/controls/asset-modal/asset-modal.component';
import * as moment from 'moment';
import { EditableTableComponent } from '@app/admin/core/controls/editable-table/editable-table.component';
@Component({
    templateUrl: './delete-multi-ass-edit.component.html',
    encapsulation: ViewEncapsulation.None,
    animations: [appModuleAnimation()]
})

export class DeleteMultiAssEditComponent extends DefaultComponentBase implements OnInit, IUiAction<T_DEL_ASS_MUL_ENTITY>, AfterViewInit {
    constructor(
        injector: Injector,
        private ultilityService: UltilityServiceProxy,
        private delMultiAssService: DeleteMultiAssServiceProxy) {
        super(injector);
        this.editPageState = this.getRouteData('editPageState');
        this.inputModel.deL_ASS_MUL_ID = this.getRouteParam('id');
        this.initFilter();
        this.initIsApproveFunct();
        this.stopAutoUpdateView();
    }

    @ViewChild('editForm') editForm: ElementRef;
    @ViewChild('editTable') editTable: EditableTableComponent<T_DEL_ASS_MUL_DT_ENTITY>;
    @ViewChild('assetModal') assetModal: AssetModalComponent;
    EditPageState = EditPageState;
    editPageState: EditPageState;

    subbrId: string;
    userName: string;
    inputModel: T_DEL_ASS_MUL_ENTITY = new T_DEL_ASS_MUL_ENTITY();
    filterInput: T_DEL_ASS_MUL_ENTITY;
    isApproveFunct: boolean;

    get disableInput(): boolean {
        return (this.editPageState == EditPageState.viewDetail || this.inputModel.autH_STATUS == AuthStatusConsts.Approve);
    }

    isShowError = false;
    ngAfterViewInit() {
        this.updateView();
        this.setupValidationMessage();
    }
    ngOnInit(): void {
        switch (this.editPageState) {
            case EditPageState.add:
                this.inputModel.recorD_STATUS = RecordStatusConsts.Active;
                this.appToolbar.setRole('DeleteMultiAss', false, false, true, false, false, false, false, false);
                this.appToolbar.setEnableForEditPage();
                break;
            case EditPageState.edit:
                this.appToolbar.setRole('DeleteMultiAss', false, false, true, false, false, false, false, false);
                this.appToolbar.setEnableForEditPage();
                this.getDeleteMultiAss();
                break;
            case EditPageState.viewDetail:
                this.appToolbar.setRole('DeleteMultiAss', false, false, false, false, false, false, true, false);
                this.appToolbar.setEnableForViewDetailPage();
                this.getDeleteMultiAss();
                break;
        }
        this.getUserInfo();
        this.initModal();
        this.initInput();
        this.initCombobox();
        this.appToolbar.setUiAction(this);
    }
    initInput() {
        this.inputModel.requesT_DT = moment();
        this.inputModel.deL_ASS_MUL_DTs = [];
    }
    initIsApproveFunct() {
        this.ultilityService.isApproveFunct(this.getCurrentFunctionId()).subscribe(isApproveFunct => {
            this.isApproveFunct = isApproveFunct;
        })
    }

    getUserInfo(): void {
        this.subbrId = this.appSession.user.subbrId;
        this.userName = this.appSession.user.userName;
    }

    initCombobox() {

    }
    initModal() {
        this.initAssetModal();
    }
    initAssetModal() {
        this.assetModal.filterInput.brancH_ID = this.assetModal.filterInput.brancH_LOGIN = this.subbrId;
    }
    getAssets(assets: ASS_MASTER_ENTITY[]) {
        if (assets.length == 0)
            return;
        // assets.forEach(asset => {
        //     if(this.inputModel.deL_ASS_MUL_DTs.firstOrDefault(x => x.asS_ID == asset.asseT_ID))
        //         return;
        //     var item = new T_DEL_ASS_MUL_DT_ENTITY();
        //     item.asS_ID = asset.asseT_ID;
        //     item.asseT_NAME = asset.asseT_NAME;
        //     item.asseT_CODE = asset.asseT_CODE;
        //     item.loaI_TAI_SAN = asset.typE_NAME;
        //     item.nhoM_TAI_SAN = asset.grouP_NAME;
        //     item.ngaybD_KHAUHAO = asset.amorT_START_DATE;
        //     item.sothanG_KHAUHAO = asset.amorT_MONTH;
        //     item.nguyeN_GIA = asset.buY_PRICE;
        //     item.sotieN_KHAUHAO = asset.amorT_AMT;
        //     this.inputModel.deL_ASS_MUL_DTs.push(item);
        //     this.editTable.setList(this.inputModel.deL_ASS_MUL_DTs);
        // });
        this.testfunct(assets);
        this.updateView();
    }

    async testfunct(assets: ASS_MASTER_ENTITY[]){
        var item = new T_DEL_ASS_MUL_DT_ENTITY();
        await assets.forEach(asset => {
            if(this.inputModel.deL_ASS_MUL_DTs.firstOrDefault(x => x.asS_ID == asset.asseT_ID))
                return;
            item = new T_DEL_ASS_MUL_DT_ENTITY();
            item.asS_ID = asset.asseT_ID;
            item.asseT_NAME = asset.asseT_NAME;
            item.asseT_CODE = asset.asseT_CODE;
            item.loaI_TAI_SAN = asset.typE_NAME;
            item.nhoM_TAI_SAN = asset.grouP_NAME;
            item.ngaybD_KHAUHAO = asset.amorT_START_DATE;
            item.sothanG_KHAUHAO = asset.amorT_MONTH;
            item.nguyeN_GIA = asset.buY_PRICE;
            item.sotieN_KHAUHAO = asset.amorT_AMT;
            this.inputModel.deL_ASS_MUL_DTs.push(item);
        });
        this.editTable.setList(this.inputModel.deL_ASS_MUL_DTs);
    }

    getDeleteMultiAss() {
        this.inputModel.top = 1;
        this.delMultiAssService.t_DEL_ASS_MUL_Search(this.inputModel).subscribe(response => {
            this.inputModel = response.items[0];
            if (this.inputModel.autH_STATUS == AuthStatusConsts.Approve) {
                this.appToolbar.setButtonApproveEnable(false);
                this.appToolbar.setButtonSaveEnable(false);
            }
            this.delMultiAssService.t_DEL_ASS_MUL_DT_ById(this.inputModel.deL_ASS_MUL_ID).subscribe(response => {
                this.inputModel.deL_ASS_MUL_DTs = response;
                this.editTable.setList(response);
                this.updateView();
            });
        });
    }
    //#region editable-table 
    // isCheckAll: boolean = false;
    onCheckAll(isCheckAll: boolean): void {
        this.inputModel.deL_ASS_MUL_DTs.forEach(x => {
            x.isChecked = isCheckAll;
        });
        this.updateView();
    }
    onAddNewDelAssDT() {
        this.assetModal.show();
    }
    onRemoveDelAssDT() {
        this.inputModel.deL_ASS_MUL_DTs = this.inputModel.deL_ASS_MUL_DTs.filter(x => !x.isChecked);
        this.editTable.setList(this.inputModel.deL_ASS_MUL_DTs);
    }
    //#endregion
    addNew() {
        this.delMultiAssService.t_DEL_ASS_MUL_Ins(this.inputModel).pipe(finalize(() => { this.saving = false; }))
            .subscribe((response) => {
                if (response['Result'] != '0') {
                    this.showErrorMessage(response['ErrorDesc']);
                }
                else {
                    this.addNewSuccess();
                    if (!this.isApproveFunct) {
                        this.delMultiAssService.t_DEL_ASS_MUL_App(response['DEL_ASS_MUL_ID'], this.userName)
                            .pipe(finalize(() => { this.saving = false; }))
                            .subscribe((response) => {
                                if (response['Result'] != '0') {
                                    this.showErrorMessage(response['ErrorDesc']);
                                }
                                this.updateView();
                            });
                    }
                }
                this.updateView();
            });
    }

    update() {
        this.delMultiAssService.t_DEL_ASS_MUL_Upd(this.inputModel).pipe(finalize(() => { this.saving = false; }))
            .subscribe((response) => {
                if (response['Result'] != '0') {
                    this.showErrorMessage(response['ErrorDesc']);
                }
                else {
                    this.updateSuccess();
                    if (!this.isApproveFunct) {
                        this.delMultiAssService.t_DEL_ASS_MUL_App(this.inputModel.deL_ASS_MUL_ID, this.userName)
                            .pipe(finalize(() => { this.saving = false; }))
                            .subscribe((response) => {
                                if (response['Result'] != '0') {
                                    this.showErrorMessage(response['ErrorDesc']);
                                }
                                else {
                                    this.inputModel.autH_STATUS = AuthStatusConsts.Approve;
                                }
                                this.updateView();
                            });
                    }
                    else {
                        this.inputModel.autH_STATUS = AuthStatusConsts.NotApprove;
                    }
                }
                this.updateView();
            });
    }

    saveInput() {
        if (this.isApproveFunct == undefined) {
            this.showErrorMessage(this.l('PageLoadUndone'));
            this.updateView();
            return;
        }

        if ((this.editForm as any).form.invalid) {
            this.isShowError = true;
            this.showErrorMessage(this.l('FormInvalid'));
            this.updateView();
            return;
        }

        if(this.inputModel.deL_ASS_MUL_DTs.length == 0)
        {
            this.showErrorMessage(this.l('DeleteAssTableMustHasValue'));
            this.updateView();
            return;
        }

        if (this.editPageState != EditPageState.viewDetail) {
            this.saving = true;
            this.inputModel.makeR_ID = this.userName;
            this.inputModel.brancH_ID = this.appSession.user.subbrId;
            if (!this.inputModel.deL_ASS_MUL_ID) {
                this.addNew();
            }
            else {
                this.update();
            }
        }
    }

    goBack() {
        this.navigatePassParam('/app/admin/delete-multi-ass', null, { filterInput: JSON.stringify(this.filterInput) });
    }

    onAdd(): void {
    }

    onUpdate(item: T_DEL_ASS_MUL_ENTITY): void {
    }

    onDelete(item: T_DEL_ASS_MUL_ENTITY): void {
    }

    onApprove(item: T_DEL_ASS_MUL_ENTITY): void {
        if (!this.inputModel.deL_ASS_MUL_ID) {
            return;
        }
        if (this.userName == this.inputModel.makeR_ID) {
            this.showErrorMessage(this.l('ApproveFailed'));
            this.updateView();
            return;
        }
        this.message.confirm(
            this.l('ApproveWarningMessage', this.l(this.inputModel.deL_ASS_MUL_ID)),
            this.l('AreYouSure'),
            (isConfirmed) => {
                if (isConfirmed) {
                    this.saving = true;
                    this.delMultiAssService.t_DEL_ASS_MUL_App(this.inputModel.deL_ASS_MUL_ID, this.userName)
                        .pipe(finalize(() => { this.saving = false; }))
                        .subscribe((response) => {
                            if (response['Result'] != '0') {
                                this.showErrorMessage(response['ErrorDesc']);
                            }
                            else {
                                this.approveSuccess();
                            }
                            this.updateView();
                        });
                }
            }
        );
    }

    onViewDetail(item: T_DEL_ASS_MUL_ENTITY): void {
    }

    onSave(): void {
        this.saveInput();
    }

    onSearch(): void {
    }

    onResetSearch(): void {
    }
}
