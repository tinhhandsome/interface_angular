import { Component, Injector, ViewChild, Output, EventEmitter, OnInit, ViewEncapsulation, ElementRef, AfterViewInit } from '@angular/core';
import { appModuleAnimation } from '@shared/animations/routerTransition';
import * as _ from 'lodash';
import { PL_MASTER_ENTITY, LIQ_DETAIL_PLAN, LiquidDetailServiceProxy, LIQ_DETAIL_ENTITY, CM_BRANCH_ENTITY, BranchServiceProxy, ASS_MASTER_ENTITY, UltilityServiceProxy, PlMasterServiceProxy } from '@shared/service-proxies/service-proxies';
import { EditPageState } from '@app/ultilities/enum/edit-page-state';
import { AllCodes } from '@app/ultilities/enum/all-codes';
import { finalize } from 'rxjs/operators';
import { DefaultComponentBase } from '@app/ultilities/default-component-base';
import { IUiAction } from '@app/ultilities/ui-action';
import { AuthStatusConsts } from '@app/admin/core/ultils/consts/AuthStatusConsts';
import { RecordStatusConsts } from '@app/admin/core/ultils/consts/RecordStatusConsts';
import * as moment from 'moment';
import { EditableTableComponent } from '@app/admin/core/controls/editable-table/editable-table.component';
import { AssetModalComponent } from '@app/admin/core/controls/asset-modal/asset-modal.component';
import { NgForm } from '@angular/forms';

export enum PLAN_STATUS {
    APPROVE = "A", // da duyet
    NOT_APPROVE = "U", // chua duyet
    POST = "P", // da gui
    NEW = "N" // nhap moi
}

@Component({
    templateUrl: './liquid-detail-edit.component.html',
    encapsulation: ViewEncapsulation.None,
    animations: [appModuleAnimation()]
})

export class LiquidDetailEditComponent extends DefaultComponentBase implements OnInit, IUiAction<PL_MASTER_ENTITY>, AfterViewInit {

    constructor(
        injector: Injector,
        private ultilityService: UltilityServiceProxy,
        private branchService: BranchServiceProxy,
        private plMasterService: PlMasterServiceProxy,
        private liquidDetailService: LiquidDetailServiceProxy
    ) {
        super(injector);
        this.editPageState = this.getRouteData('editPageState');
        this.inputModel.plaN_ID = this.getRouteParam('id');
        this.inputModel.liquiD_DETAILs = [];
        this.initFilter();
        this.initIsApproveFunct();
        console.log(this);
    }

    // @ViewChild('editForm') editForm: ElementRef;
    @ViewChild('editForm') editForm: NgForm;
    @ViewChild('assetModal') assetModal: AssetModalComponent;
    @ViewChild('editTable') editTable: EditableTableComponent<LIQ_DETAIL_ENTITY>;

    EditPageState = EditPageState;
    AllCodes = AllCodes;
    editPageState: EditPageState;

    inputModel: LIQ_DETAIL_PLAN = new LIQ_DETAIL_PLAN();
    filterInput: LIQ_DETAIL_ENTITY;
    isApproveFunct: boolean;
    // showSubmitPlanBtn: boolean = false;
    PLAN_STATUS = PLAN_STATUS;

    get disableInput(): boolean {
        return this.editPageState == EditPageState.viewDetail;
    }

    get showDontApproveBtn():boolean {
        return this.disableInput && this.inputModel.autH_STATUS == AuthStatusConsts.NotApprove && this.inputModel.status == PLAN_STATUS.POST && this.inputModel && this.inputModel.makeR_ID != this.userInfo.userName;
    }

    get showSubmitPlanBtn(): boolean {
        // return this.inputModel.status && (this.inputModel.status == PLAN_STATUS.NEW) && !!this.temp_plaN_ID && this.editPageState != EditPageState.viewDetail && this.userInfo.branch.brancH_TYPE != 'HS';
        return this.temp_plaN_ID && (this.editPageState == EditPageState.add && this.inputModel.status == PLAN_STATUS.NOT_APPROVE || this.editPageState == this.EditPageState.edit && (this.inputModel.status == PLAN_STATUS.NEW || this.inputModel.status == PLAN_STATUS.NOT_APPROVE));
    }

    branchs: CM_BRANCH_ENTITY[];

    isShowError = false;
    isCheckAll = false;

    totalAmt: number = 0;
    processValue: number = 0;
    userInfo = this.appSession.user;
    currentUserName = this.appSession.user.userName;
    dataInTables: LIQ_DETAIL_ENTITY[] = [];
    temp_plaN_ID: string = '';


    ngOnInit(): void {
        switch (this.editPageState) {
            case EditPageState.add:
                this.inputModel.recorD_STATUS = RecordStatusConsts.Active;
                this.appToolbar.setRole('PlanLiquid', false, false, true, false, false, false, false, false);
                this.appToolbar.setEnableForEditPage();
                this.initDefaultPlan();
                break;
            case EditPageState.edit:
                this.appToolbar.setRole('PlanLiquid', false, false, true, false, false, false, false, false);
                this.appToolbar.setEnableForEditPage();
                this.getLiquidDetail();
                break;
            case EditPageState.viewDetail:
                this.appToolbar.setRole('PlanLiquid', false, false, false, false, false, false, true, false);
                this.appToolbar.setEnableForViewDetailPage();
                this.getLiquidDetail();
                break;
        }

        this.appToolbar.setUiAction(this);
        this.initCombobox();
        console.log(this)
    }

    ngAfterViewInit(): void {
        // COMMENT: this.stopAutoUpdateView();
        this.setupValidationMessage();
    }

    private initDefaultPlan() {
        this.inputModel.liquiD_DETAILs = [];
        this.inputModel.year = moment().add(1, 'years').format('YYYY');
        this.inputModel.plaN_NAME = 'KH THANH LY';
        this.inputModel.effecT_DT = moment().add(1, 'years').startOf('year');
        this.inputModel.brancH_ID = this.userInfo.subbrId;
        this.inputModel.brancH_NAME = this.userInfo.branchName;
        this.inputModel.status = PLAN_STATUS.NEW;
    }

    initIsApproveFunct() {
        this.ultilityService.isApproveFunct(this.getCurrentFunctionId()).subscribe(isApproveFunct => {
            this.isApproveFunct = isApproveFunct;
        })
    }

    initCombobox() {
        this.branchService.cM_BRANCH_Search(this.getFillterForCombobox()).subscribe(response => {
            this.branchs = response.items;
            this.updateView();
        });
    }

    getLiquidDetail() {
        this.liquidDetailService.pL_LIQ_DETAIL_ById(this.inputModel.plaN_ID).subscribe(response => {
            this.inputModel = response;
            this.temp_plaN_ID = response.plaN_ID;
            
            this.editTable.setList(this.inputModel.liquiD_DETAILs);
            // if (response.status == PLAN_STATUS.APPROVE) {
            //     this.appToolbar.setButtonSaveEnable(false);
            //     this.appToolbar.setButtonSaveEnable(false); type khac hs & da duyet  hoac post hoac
            //  }
            
            if(this.editPageState == EditPageState.edit && (this.inputModel.autH_STATUS == AuthStatusConsts.Approve || this.inputModel.status == PLAN_STATUS.POST))
                this.appToolbar.setButtonSaveEnable(false);
            else if(this.editPageState == EditPageState.viewDetail && this.inputModel.autH_STATUS == AuthStatusConsts.Approve)
                this.appToolbar.setButtonApproveEnable(false);

            // if (this.inputModel.autH_STATUS == AuthStatusConsts.Approve || (this.userInfo.branch.brancH_TYPE != 'HS' && this.inputModel.status == PLAN_STATUS.POST) || this.userInfo.branch.brancH_TYPE == 'HS' && this.inputModel.status == PLAN_STATUS.POST) {
            //     // this.editPageState = EditPageState.viewDetail;
            //     this.appToolbar.setButtonApproveEnable(false);
            //     this.appToolbar.setButtonSaveEnable(false);
            // }
            this.reloadTotalAmt();
            this.updateView();
        });
    }

    onChangeBranch(branch: CM_BRANCH_ENTITY) {
        this.inputModel.brancH_NAME = branch ? branch.brancH_NAME : '';
    }

    compareDate(less: moment.Moment, greater: moment.Moment): boolean { // custom compareDate funct
        if (!less || !greater) {
            return true;
        }
        return less.diff(greater, 'day') < 0;
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

        //validate nam thuc hien < nam hien tai
        if (Number(this.inputModel.year) < moment().year()) {
            this.showErrorMessage(this.l('PlanMasterYear') + ' ' + this.l('LessThanCurrentYearValidation'));
            this.updateView();
            return;
        }

        //validate ngay hieu luc < ngay hien tai
        if (this.compareDate(this.inputModel.effecT_DT, moment())) {
            this.showErrorMessage(this.l('EffectDt') + ' ' + this.l('LessThanCurrentDateValidation'));
            this.updateView();
            return;
        }

        if (this.editTable.allData.length == 0) {
            this.showErrorMessage(this.l('InventAssetMustHaveValue'));
            this.updateView();
            return;
        }
        if (this.editPageState != EditPageState.viewDetail) {
            this.saving = true;
            this.inputModel.makeR_ID = this.userInfo.userName;
            this.inputModel.totaL_AMT = 0;
            if (!this.inputModel.plaN_ID) {
                this.addNewLiqPlan();
            }
            else {
                this.updateLiqPlan();
            }
        }
    }

    private updateLiqPlan() {
        this.inputModel.status = PLAN_STATUS.NOT_APPROVE;
        this.liquidDetailService.pL_LIQ_DETAIL_Upd(this.inputModel).pipe(finalize(() => { this.saving = false; }))
            .subscribe((response) => {
                if (response['Result'] != '0') {
                    this.showErrorMessage(response['ErrorDesc']);
                }
                else {
                    this.updateSuccess();
                    if (!this.isApproveFunct) {
                        this.liquidDetailService.pL_LIQ_DETAIL_App(this.inputModel.plaN_ID, this.userInfo.userName, this.userInfo.subbrId)
                            .pipe(finalize(() => { this.saving = false; }))
                            .subscribe((response) => {
                                if (response['Result'] != '0') {
                                    this.showErrorMessage(response['ErrorDesc']);
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

    private addNewLiqPlan() {
        this.inputModel.verson = 1;
        this.inputModel.status = PLAN_STATUS.NOT_APPROVE;
        this.liquidDetailService.pL_LIQ_DETAIL_Ins(this.inputModel).pipe(finalize(() => { this.saving = false; }))
            .subscribe((response) => {
                if (response['Result'] != '0') {
                    this.showErrorMessage(response['ErrorDesc']);
                }
                else {
                    this.addNewSuccess();
                    this.inputModel.status = PLAN_STATUS.NOT_APPROVE;
                    // sau khi add thi disable btn add va enable btn gui ke hoach
                    this.temp_plaN_ID = response['PLAN_ID'];
                    // this.appToolbar.setButtonSaveEnable(false);
                    // this.showSubmitPlanBtn = true;
                    if (!this.isApproveFunct) {
                        this.liquidDetailService.pL_LIQ_DETAIL_App(response['PLAN_ID'], this.userInfo.userName, this.userInfo.subbrId)
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

    goBack() {
        this.navigatePassParam('/app/admin/liquid-detail', null, undefined);
    }

    onAdd(): void {
    }

    onUpdate(item: PL_MASTER_ENTITY): void {
    }

    onDelete(item: PL_MASTER_ENTITY): void {
    }

    onApprove(item: PL_MASTER_ENTITY): void {
        if (!this.inputModel.plaN_ID) {
            return;
        }

        if (this.currentUserName == this.inputModel.makeR_ID) {
            this.showErrorMessage(this.l('ApproveFailed'));
            return;
        }
        this.message.confirm(
            this.l('ApproveWarningMessage', this.l(this.inputModel.plaN_NAME) + ' ' + this.l('At').toLowerCase() + ' ' + this.inputModel.brancH_NAME),
            this.l('AreYouSure'),
            (isConfirmed) => {
                if (isConfirmed) {
                    this.saving = true;
                    this.plMasterService.pL_MASTER_UpdStatus(this.temp_plaN_ID, this.currentUserName, this.userInfo.subbrId, AuthStatusConsts.Approve, PLAN_STATUS.APPROVE)
                        .pipe(finalize(() => { this.saving = false; }))
                        .subscribe((response) => {
                            if (response['Result'] != '0') {
                                this.showErrorMessage(response['ErrorDesc']);
                            }
                            else {
                                this.inputModel.status = PLAN_STATUS.APPROVE;
                                this.approveSuccess();
                            }
                        });
                }
            }
        );
    }

    onViewDetail(item: PL_MASTER_ENTITY): void {

    }

    onSave(): void {
        this.saveInput();
    }

    onSearch(): void {

    }

    onResetSearch(): void {

    }

    onCheckAll(isCheckAll): void {
        this.inputModel.liquiD_DETAILs.forEach(x => {
            x.isChecked = isCheckAll;
        });
    }

    onAddNewAssetsItem(): void {
        this.assetModal.planLiq = moment().get('M') + 2;
        this.assetModal.filterInput.level = 'ALL';
        this.assetModal.filterInput.top = 1000;
        this.assetModal.show();
        this.assetModal.updateView();
    }

    onRemoveAssetsItem(): void {
        this.inputModel.liquiD_DETAILs = this.inputModel.liquiD_DETAILs.filter(x => !x.isChecked);
        this.editTable.setList(this.inputModel.liquiD_DETAILs);
        this.reloadTotalAmt();
    }

    onSelectAsset(selectedAsset: ASS_MASTER_ENTITY[]) {
        selectedAsset.forEach(x => {
            if (this.inputModel.liquiD_DETAILs.filter(t => t.asseT_ID == x.asseT_ID).length == 0) {
                var item = new LIQ_DETAIL_ENTITY();
                item.asseT_ID = x.asseT_ID;
                item.asseT_NAME = x.asseT_NAME;
                item.asseT_CODE = x.asseT_CODE;
                item.no = this.inputModel.liquiD_DETAILs.length + 1;
                item.montH_EXPECTED = this.assetModal.planLiq;
                item.buY_PRICE = x.buY_PRICE;
                item.remaiN_AMORTIZED_AMT = x.remaiN_AMORTIZED_AMT;
                item.asS_STATUS_NAME = x.asS_STATUS_NAME;
                item.isChecked = false;
                item.expecteD_VALUE = x.amorT_AMT;
                item.amorT_AMT = x.amorT_AMT;
                item.liquiD_FORM = '1';
                this.inputModel.liquiD_DETAILs.push(item);
            }
        });
        this.editTable.setList(this.inputModel.liquiD_DETAILs);
        this.reloadTotalAmt();
    }

    reloadTotalAmt() {
        // this.totalAmt = (this.editTable.allData.map(x => x.expecteD_VALUE).filter(x => x).reduce(this.sumFunct, 0)) | 0;
        this.totalAmt = 0;
        this.editTable.allData.forEach(x => this.totalAmt += x.expecteD_VALUE ? x.expecteD_VALUE : 0);
        this.updateView();
    }

    expecteD_VALUE_change(item) {
        let index = this.editTable.dataInPage.indexOf(item);
        if (item.expecteD_VALUE < 0 || !item.expecteD_VALUE)
            item.expecteD_VALUE = 0;
        this.editForm.controls['expecteD_VALUE-' + index].setValue(item.expecteD_VALUE);
        this.reloadTotalAmt();
    }

    onMonthExpectedChange(item): void {
        let index = this.editTable.dataInPage.indexOf(item);
        if (item.montH_EXPECTED > 12)
            item.montH_EXPECTED = 12;
        else if (item.montH_EXPECTED < 1)
            item.montH_EXPECTED = 12;
        this.editForm.controls['montH_EXPECTED-' + index].setValue(item.montH_EXPECTED);
    }

    onSubmitPlan(): void {
        // GUI KE HOACH THI USERNAME = ''
        this.plMasterService.pL_MASTER_UpdStatus(this.temp_plaN_ID, '', this.userInfo.subbrId, AuthStatusConsts.NotApprove, PLAN_STATUS.POST)
            .pipe(finalize(() => { this.saving = false; }))
            .subscribe((response) => {
                if (response['Result'] != '0') {
                    this.showErrorMessage(response['ErrorDesc']);
                }
                else {
                    this.showSuccessMessage(this.l('SubmitPlanSuccess'));
                    this.appToolbar.setButtonSaveEnable(false); // sau khi gui ke hoach thanh cong -> disable apptoolbar
                    this.temp_plaN_ID = '';
                }
                // this.showSubmitPlanBtn = false;
                this.updateView();
            });
    }

    dontApprovePlan(): void {
        this.message.confirm(
            this.l('ReturnWarningMessage', this.l(this.inputModel.plaN_NAME) + ' ' + this.l('At').toLowerCase() + ' ' + this.inputModel.brancH_NAME),
            this.l('AreYouSure'),
            (isConfirmed) => {
                if (isConfirmed) {
                    this.saving = true;
                    this.plMasterService.pL_MASTER_UpdStatus(this.temp_plaN_ID, '', this.userInfo.subbrId, AuthStatusConsts.NotApprove, PLAN_STATUS.NEW)
                        .pipe(finalize(() => { this.saving = false; }))
                        .subscribe((response) => {
                            if (response['Result'] != '0') {
                                this.showErrorMessage(response['ErrorDesc']);
                            }
                            else {
                                this.showSuccessMessage(this.l('ReturnPlanSuccessfully'));
                                this.inputModel.status = PLAN_STATUS.NEW;
                                this.appToolbar.setButtonApproveEnable(false);
                                this.temp_plaN_ID = '';
                            }
                            // this.showSubmitPlanBtn = false;
                            this.updateView();
                        });
                }
            }
        );



        
    }
}
