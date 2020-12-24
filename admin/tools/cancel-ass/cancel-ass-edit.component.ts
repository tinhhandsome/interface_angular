import { Component, Injector, ViewChild, Output, EventEmitter, OnInit, ViewEncapsulation, ElementRef, AfterViewInit } from '@angular/core';
import { appModuleAnimation } from '@shared/animations/routerTransition';
import * as _ from 'lodash';
import { LiquidCancelServiceProxy, T_LIQUID_CANCEL_ENTITY, UltilityServiceProxy,ASS_MASTER_ENTITY,AssMasterServiceProxy } from '@shared/service-proxies/service-proxies';
import { EditPageState } from '@app/ultilities/enum/edit-page-state';
import { finalize } from 'rxjs/operators';
import { DefaultComponentBase } from '@app/ultilities/default-component-base';
import { IUiAction } from '@app/ultilities/ui-action';
import { AuthStatusConsts } from '@app/admin/core/ultils/consts/AuthStatusConsts';
import { RecordStatusConsts } from '@app/admin/core/ultils/consts/RecordStatusConsts';
import { AssetModalComponent } from '@app/admin/core/controls/asset-modal/asset-modal.component';
import * as moment from 'moment';
@Component({
    templateUrl: './cancel-ass-edit.component.html',
    encapsulation: ViewEncapsulation.None,
    animations: [appModuleAnimation()]
})

export class CancelAssEditComponent extends DefaultComponentBase implements OnInit, IUiAction<T_LIQUID_CANCEL_ENTITY>,AfterViewInit {
    constructor(
        injector: Injector,
        private ultilityService: UltilityServiceProxy,
        private liquidCancelListService: LiquidCancelServiceProxy,
        private assMasterService: AssMasterServiceProxy
    ) {
        super(injector);
        this.editPageState = this.getRouteData('editPageState');
        this.inputModel.liquiD_CANCEL_ID  = this.getRouteParam('id');
        this.assetModel.asseT_CODE = this.getRouteParam('assCode');
        this.assetModel.asseT_ID = this.getRouteParam('assId');
        this.initFilter();
        this.initInput();
        this.initCombobox();
        this.initIsApproveFunct();
        // COMMENT: this.stopAutoUpdateView();
    }

    @ViewChild('editForm') editForm: ElementRef;
    @ViewChild('assetModal') assetModal: AssetModalComponent;
    EditPageState = EditPageState;
    editPageState: EditPageState;
    

    inputModel: T_LIQUID_CANCEL_ENTITY = new T_LIQUID_CANCEL_ENTITY();
    assetModel: ASS_MASTER_ENTITY = new ASS_MASTER_ENTITY();
    filterInput: T_LIQUID_CANCEL_ENTITY;
    isApproveFunct: boolean;

    get disableInput(): boolean {
        return (this.editPageState == EditPageState.viewDetail || this.inputModel.autH_STATUS == AuthStatusConsts.Approve);
    }

    isShowError = false;
    ngAfterViewInit(){
        this.setupValidationMessage();
        this.updateView();
    }
    ngOnInit(): void {
        switch (this.editPageState) {
            case EditPageState.add:
                this.inputModel.recorD_STATUS = RecordStatusConsts.Active;
                this.appToolbar.setRole('CancelAss', false, false, true, false, false, false, false, false);
                this.appToolbar.setEnableForEditPage();
                break;
            case EditPageState.edit:
                this.appToolbar.setRole('CancelAss', false, false, true, false, false, false, false, false);
                this.appToolbar.setEnableForEditPage();
                this.getCancelLiquid();
                break;
            case EditPageState.viewDetail:
                this.appToolbar.setRole('CancelAss', false, false, false, false, false, false, true, false);
                this.appToolbar.setEnableForViewDetailPage();
                this.getCancelLiquid();
                break;
        }
        this.appToolbar.setUiAction(this);
    }
    initInput()
    {
        this.inputModel.requesT_DT = moment();
    }
    initIsApproveFunct() {
        this.ultilityService.isApproveFunct(this.getCurrentFunctionId()).subscribe(isApproveFunct => {
            this.isApproveFunct = isApproveFunct;
        })
    }

    initCombobox() {

    }
    showAssetModal()
    {
        this.assetModal.filterInput.level = 'ALL';
        this.assetModal.show();
    }
    getSingleAsset(asset: ASS_MASTER_ENTITY){
        if(!asset)return
        this.assetModel = asset;
        this.inputModel.asS_ID = asset.asseT_ID;
        this.inputModel.asS_CODE = asset.asseT_CODE;
        this.onChangeProperty('asS_ID');

        // this.updateView();
    }
    getCancelLiquid() {
        this.liquidCancelListService.t_LIQUID_CANCEL_ById(this.inputModel.liquiD_CANCEL_ID ).subscribe(response => {
            this.inputModel = response;
            if (this.inputModel.autH_STATUS == AuthStatusConsts.Approve) {
                this.appToolbar.setButtonApproveEnable(false);
                this.appToolbar.setButtonSaveEnable(false);
            }
            this.assetModel.brancH_ID = this.appSession.user.subbrId;
            this.assetModel.brancH_LOGIN = this.appSession.user.subbrId;
            this.assetModel.level = 'ALL';
            this.assMasterService.aSS_MASTER_Search(this.assetModel).subscribe(response=>{
                this.getSingleAsset(response.items[0]);
            })
        });
    }

    addNew(){
        this.liquidCancelListService.t_LIQUID_CANCEL_Ins(this.inputModel).pipe(finalize(() => { this.saving = false; }))
        .subscribe((response) => {
            if (response['Result'] != '0') {
                this.showErrorMessage(response['ErrorDesc']);
            }
            else {
                this.addNewSuccess();
                if (!this.isApproveFunct) {
                    this.liquidCancelListService.t_LIQUID_CANCEL_App(response['LIQUID_CANCEL_ID'], this.appSession.user.userName)
                        .pipe(finalize(() => { this.saving = false; }))
                        .subscribe((response) => {
                            if (response['Result'] != '0') {
                                this.showErrorMessage(response['ErrorDesc']);
                            }
                        });
                }
            }
        });
    }

    update(){
        this.liquidCancelListService.t_LIQUID_CANCEL_Upd(this.inputModel).pipe(finalize(() => { this.saving = false; }))
            .subscribe((response) => {
                if (response['Result'] != '0') {
                    this.showErrorMessage(response['ErrorDesc']);
                }
                else {
                    this.updateSuccess();
                    if (!this.isApproveFunct) {
                        this.liquidCancelListService.t_LIQUID_CANCEL_App(this.inputModel.liquiD_CANCEL_ID , this.appSession.user.userName)
                            .pipe(finalize(() => { this.saving = false; }))
                            .subscribe((response) => {
                                if (response['Result'] != '0') {
                                    this.showErrorMessage(response['ErrorDesc']);
                                }
                                else {
                                    this.inputModel.autH_STATUS = AuthStatusConsts.Approve;
                                    this.updateView();
                                }
                            });
                    }
                    else {
                        this.inputModel.autH_STATUS = AuthStatusConsts.NotApprove;
                    }
                }
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
        if (this.editPageState != EditPageState.viewDetail) {
            this.saving = true;
            this.inputModel.makeR_ID = this.appSession.user.userName;
            this.inputModel.brancH_ID = this.appSession.user.subbrId;
            if (!this.inputModel.liquiD_CANCEL_ID ) {
                this.addNew();
            }
            else {
                this.update();
            }
        }
    }

    goBack() {
        this.navigatePassParam('/app/admin/cancel-ass', null, { filterInput: JSON.stringify(this.filterInput) });
    }

    onAdd(): void {
    }

    onUpdate(item: T_LIQUID_CANCEL_ENTITY): void {
    }

    onDelete(item: T_LIQUID_CANCEL_ENTITY): void {
    }

    onApprove(item: T_LIQUID_CANCEL_ENTITY): void {
        if (!this.inputModel.liquiD_CANCEL_ID ) {
            return;
        }
        var currentUserName = this.appSession.user.userName;
        if (currentUserName == this.inputModel.makeR_ID) {
            this.showErrorMessage(this.l('ApproveFailed'));
            return;
        }
        this.message.confirm(
            this.l('ApproveWarningMessage', this.l(this.inputModel.liquiD_CANCEL_ID)),
            this.l('AreYouSure'),
            (isConfirmed) => {
                if (isConfirmed) {
                    this.saving = true;
                    this.liquidCancelListService.t_LIQUID_CANCEL_App(this.inputModel.liquiD_CANCEL_ID , currentUserName)
                        .pipe(finalize(() => { this.saving = false; }))
                        .subscribe((response) => {
                            if (response['Result'] != '0') {
                                this.showErrorMessage(response['ErrorDesc']);
                            }
                            else {
                                this.approveSuccess();
                            }
                        });
                }
            }
        );
    }

    onViewDetail(item: T_LIQUID_CANCEL_ENTITY): void {
    }

    onSave(): void {
        this.saveInput();
    }

    onSearch(): void {
    }

    onResetSearch(): void {
    }
}
