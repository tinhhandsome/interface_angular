import { Component, Injector, ViewChild, OnInit, ViewEncapsulation, ElementRef, AfterViewInit } from '@angular/core';
import { appModuleAnimation } from '@shared/animations/routerTransition';
import * as _ from 'lodash';
import { UltilityServiceProxy, AssAmortPendServiceProxy, ASS_AMORT_PEND_ENTITY, AssMasterServiceProxy, ASS_MASTER_ENTITY } from '@shared/service-proxies/service-proxies';
import { EditPageState } from '@app/ultilities/enum/edit-page-state';
import { AllCodes } from '@app/ultilities/enum/all-codes';
import { finalize } from 'rxjs/operators';
import { DefaultComponentBase } from '@app/ultilities/default-component-base';
import { IUiAction } from '@app/ultilities/ui-action';
import { AuthStatusConsts } from '@app/admin/core/ultils/consts/AuthStatusConsts';
import { RecordStatusConsts } from '@app/admin/core/ultils/consts/RecordStatusConsts';
import { AssetModalComponent } from '@app/admin/core/controls/asset-modal/asset-modal.component';
import * as moment from 'moment';

@Component({
    templateUrl: './ass-amort-pend-edit.component.html',
    encapsulation: ViewEncapsulation.None,
    animations: [appModuleAnimation()]
})
export class AssAmortPendEditComponent extends DefaultComponentBase implements OnInit, IUiAction<ASS_AMORT_PEND_ENTITY>, AfterViewInit {
    
    ngAfterViewInit(): void {
        // COMMENT: this.stopAutoUpdateView();
        this.setupValidationMessage();
    }

    constructor(
        injector: Injector,
        private assAmortPendService: AssAmortPendServiceProxy,
        private assMasterService: AssMasterServiceProxy,
        private ultilityService: UltilityServiceProxy,
    ) {
        super(injector);
        this.editPageState = this.getRouteData('editPageState');
        this.inputModel.pA_ID = this.getRouteParam('id');
        this.initFilter();
        this.initIsApproveFunct();
    }

    @ViewChild('editForm') editForm: ElementRef;
    @ViewChild('assetModal') assetModal: AssetModalComponent;

    EditPageState = EditPageState;
    AllCodes = AllCodes;
    editPageState: EditPageState;

    inputModel: ASS_AMORT_PEND_ENTITY = new ASS_AMORT_PEND_ENTITY();
    filterInput: ASS_AMORT_PEND_ENTITY;
    isApproveFunct: boolean;
    checkactive: boolean;


    get showactivereason(): boolean {
        return (this.checkactive || this.inputModel.type == "A" || (this.inputModel.type == "P" && this.inputModel.autH_STATUS == "U"))
    }

    get disableInput(): boolean {
        return this.editPageState == EditPageState.viewDetail;
    }

    get isAssetNKH(): boolean {
        return this.inputModel.asset.amorT_STATUS == 'NKH';
    }

    get isAssAmortApproved(): boolean {
        return this.inputModel.autH_STATUS == AuthStatusConsts.Approve;
    }

    get disableAmortReason(): boolean {
        return (this.inputModel.type != "N" || this.editPageState == EditPageState.viewDetail);
    }

    get enablecountinue(): boolean {
        return (this.inputModel.type == "P" && this.editPageState == EditPageState.edit && this.inputModel.autH_STATUS == "A");
    }

    checkdactive(): void {
        if (this.checkactive == true) {
            this.checkactive = false;
            this.appToolbar.setButtonSaveEnable(false);
        }
        else {
            this.checkactive = true;
            this.appToolbar.setButtonSaveEnable(true);
        }
        this.updateView();
    }

    isShowError = false;

    ngOnInit(): void {
        switch (this.editPageState) {
            case EditPageState.add:
                this.inputModel.recorD_STATUS = RecordStatusConsts.Active;
                this.appToolbar.setRole('AssetManagerASSAmortPendList', false, false, true, false, false, false, false, false);

                this.appToolbar.setEnableForEditPage();
                this.inputModel.creatE_DT = moment();
                this.inputModel.makeR_ID = this.appSession.user.userName;
                this.inputModel.type = "N";
                break;
            case EditPageState.edit:
                this.checkactive = false;
                this.appToolbar.setRole('AssetManagerASSAmortPendList', false, false, true, false, false, false, false, false);
                
                this.getAssAmortPendforedit();
                break;
            case EditPageState.viewDetail:
                this.appToolbar.setRole('AssetManagerASSAmortPendList', false, false, false, false, false, false, true, false);
                
                this.inputModel.totalCount = 1;
                this.getAssAmortPend();
                break;
        }

        this.appToolbar.setUiAction(this);

        this.inputModel.asset = this.inputModel.asset ? this.inputModel.asset : new ASS_MASTER_ENTITY();
        this.inputModel.buY_PRICE = this.inputModel.amorT_AMT = 0;
    }

    initIsApproveFunct() {
        this.ultilityService.isApproveFunct(this.getCurrentFunctionId()).subscribe(isApproveFunct => {
            this.isApproveFunct = isApproveFunct;
            this.updateView();
        })
    }


    getAssAmortPend() {
        this.inputModel.totalCount = 1;
        this.assAmortPendService.aSS_AMORT_PEND_ById(this.inputModel).subscribe(response => {
            this.inputModel = response;
            this.appToolbar.setEnableForViewDetailPage();
            if (this.inputModel.autH_STATUS == AuthStatusConsts.Approve) {
                this.appToolbar.setButtonApproveEnable(false);
            }
            this.updateView();
        });
    }

    getAssAmortPendforedit() {
        this.inputModel.totalCount = 1;
        this.assAmortPendService.aSS_AMORT_PEND_ById(this.inputModel).subscribe(response => {
            this.appToolbar.setEnableForEditPage();
            this.inputModel = response;
            this.inputModel.creatE_DT = moment();
            this.inputModel.makeR_ID = this.appSession.user.userName;

            // sản phẩm tiếp tục  khấu hao
            if (this.inputModel.type == "P") {
                this.inputModel.amorT_START_DATE_N = moment();
                this.inputModel.amorT_END_DATE_N = moment();
            }
            this.appToolbar.setButtonSaveEnable(this.inputModel.type == "N" || (this.inputModel.type == "P" && this.inputModel.autH_STATUS == "U"));
            if (this.inputModel.autH_STATUS == AuthStatusConsts.Approve) {
                this.appToolbar.setButtonApproveEnable(false);
            }
            this.updateView();
        });
    }

    saveInput() {
        if ((this.editForm as any).form.invalid) {
            this.isShowError = true;
            this.showErrorMessage(this.l('FormInvalid'));
            this.updateView();
            return;
        }

        if(!this.inputModel.asseT_ID){
            this.showErrorMessage(this.l("InvalidAssetCode"));
            this.updateView();
            return;
        }

        if(this.inputModel.autH_STATUS == AuthStatusConsts.Approve && !this.showactivereason){
            this.showErrorMessage(this.l('NotAllowToModifyApprovedAsset'));
            this.updateView();
            return;
        }

        if (this.editPageState != EditPageState.viewDetail) {
            this.saving = true;
            if (!this.inputModel.pA_ID) {
                this.assAmortPendService.aSS_AMORT_PEND_Ins(this.inputModel).pipe(finalize(() => { this.saving = false; }))
                    .subscribe((response) => {
                        if (response['Result'] != '0') {
                            this.showErrorMessage(response['ErrorDesc']);
                        }
                        else {
                            this.addNewSuccess();
                            if (!this.isApproveFunct) {
                                this.assAmortPendService.aSS_AMORT_PEND_App(response['PA_ID'], this.appSession.user.userName)
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
            else {
                this.assAmortPendService.aSS_AMORT_PEND_Upd(this.inputModel).pipe(finalize(() => { this.saving = false; }))
                    .subscribe((response) => {
                        if (response['Result'] != '0') {
                            this.showErrorMessage(response['ErrorDesc']);
                        }
                        else {
                            this.updateSuccess();
                            if (!this.isApproveFunct) {
                                this.assAmortPendService.aSS_AMORT_PEND_App(response['PA_ID'], this.appSession.user.userName)
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
        }
    }

    goBack() {
        this.navigatePassParam('/app/admin/ass-amort-pend', null, { filterInputSearch: JSON.stringify(this.filterInput) });
    }

    onAdd(): void {
    }

    onUpdate(item: ASS_AMORT_PEND_ENTITY): void {
    }

    onDelete(item: ASS_AMORT_PEND_ENTITY): void {
    }

    onApprove(item: ASS_AMORT_PEND_ENTITY): void {
        var currentUserName = this.appSession.user.userName;
        if (currentUserName == this.inputModel.makeR_ID || this.inputModel.autH_STATUS == AuthStatusConsts.Approve) {
            this.showErrorMessage(this.l('ApproveFailed'));
            this.updateView();
            return;
        }

        
        this.message.confirm(
            this.l('ApproveWarningMessage', this.l(this.inputModel.asseT_CODE)),
            this.l('AreYouSure'),
            (isConfirmed) => {
                if (isConfirmed) {
                    this.saving = true;
                    this.assAmortPendService.aSS_AMORT_PEND_App(this.inputModel.pA_ID, currentUserName)
                        .pipe(finalize(() => { this.saving = false; }))
                        .subscribe((response) => {
                            if (response['Result'] != '0') {
                                this.showErrorMessage(response['ErrorDesc']);
                            }
                            else {
                                this.approveSuccess();
                                this.appToolbar.setButtonApproveEnable(false);
                            }
                            this.updateView();
                        });
                }
            }
        );
    }

    showAssetModal() {
        this.assetModal.filterInput.brancH_LOGIN = this.appSession.user.subbrId;
        this.assetModal.filterInput.brancH_ID = this.appSession.user.subbrId;
        this.assetModal.filterInput.level = "ALL";
        this.assetModal.filterInput.amorT_STATUS = "DKH";
        this.assetModal.filterInput.usE_STATUS = "BT";
        this.assetModal.filterInput.typE_ID = "TSCD";
        this.assetModal.show();
    }

    onSingleSelectAsset(asset: ASS_MASTER_ENTITY) {
        //Object.assign(this.inputModel,asset)   
        this.inputModel.asseT_ID = asset.asseT_ID;
        this.inputModel.asseT_NAME = asset.asseT_NAME;
        this.inputModel.asseT_CODE = asset.asseT_CODE;
        this.inputModel.amorT_START_DATE = asset.amorT_START_DATE;
        this.inputModel.amorT_END_DATE = asset.amorT_END_DATE;
        this.inputModel.buY_PRICE = asset.buY_PRICE;
        this.inputModel.amorT_AMT = asset.amorT_AMT;
        this.inputModel.monthlY_AMORT_AMT = asset.monthlY_AMORT_AMT;
        this.inputModel.amortizeD_MONTH = asset.amortizeD_MONTH;
        this.inputModel.amortizeD_AMT = asset.amortizeD_AMT;
        this.inputModel.amortmonth = asset.amorT_MONTH;
        this.inputModel.remaiN_VALUE = asset.remaiN_AMORTIZED_AMT;
        this.inputModel.deP_NAME = asset.deP_NAME;
        this.inputModel.brancH_NAME = asset.brancH_NAME;
        //this.inputModel.amorT_START_DATE_N 
        //this.inputModel.amorT_END_DATE_N 
        this.inputModel.brancH_CREATE = asset.brancH_CREATE_ID;
        this.inputModel.asset = asset;
    }


    onViewDetail(item: ASS_AMORT_PEND_ENTITY): void {
    }

    onSave(): void {
        this.saveInput();
    }

    onSearch(): void {
    }

    onResetSearch(): void {
    }
}
