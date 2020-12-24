import { Component, Injector, ViewChild, OnInit, ViewEncapsulation, ElementRef, AfterViewInit } from '@angular/core';
import { appModuleAnimation } from '@shared/animations/routerTransition';
import * as _ from 'lodash';
import { PL_MASTER_ENTITY, CONSTDETAIL_PLAN, ConstDetailServiceProxy, CONSTDETAIL_ENTITY, CM_DEPARTMENT_ENTITY, CM_DIVISION_ENTITY, DivisionServiceProxy, UltilityServiceProxy, PlMasterServiceProxy } from '@shared/service-proxies/service-proxies';
import { EditPageState } from '@app/ultilities/enum/edit-page-state';
import { AllCodes } from '@app/ultilities/enum/all-codes';
import { finalize } from 'rxjs/operators';
import { DefaultComponentBase } from '@app/ultilities/default-component-base';
import { AuthStatusConsts } from '@app/admin/core/ultils/consts/AuthStatusConsts';
import { RecordStatusConsts } from '@app/admin/core/ultils/consts/RecordStatusConsts';
import * as moment from 'moment';
import { GoodsModalComponent } from '@app/admin/core/controls/goods-modal/goods-modal.component';
import { EditableTableComponent } from '@app/admin/core/controls/editable-table/editable-table.component';
import { IUiActionRejectExt } from '@app/ultilities/ui-action-re';
import { ToolbarRejectExtComponent } from '@app/admin/core/controls/toolbar-reject-ext/toolbar-reject-ext.component';
import { RejectModalComponent } from '@app/admin/core/controls/reject-modals/reject-modal.component';
import { CustomFlatpickrComponent } from '@app/admin/core/controls/custom-flatpickr/custom-flatpickr.component';
import { IUiAction } from '@app/ultilities/ui-action';
import { NgForm } from '@angular/forms';

enum PLAN_ACTION {
    SUBMIT_PLAN, DONT_APPROVE_PLAN
}

export enum PLAN_STATUS {
    POST = "P",
    APPROVE = "A",
    NOT_APPROVE = "N"
}


@Component({
    templateUrl: './const-detail-edit.component.html',
    encapsulation: ViewEncapsulation.None,
    animations: [appModuleAnimation()]
})

export class ConstDetailEditComponent extends DefaultComponentBase implements OnInit, IUiAction<PL_MASTER_ENTITY>, AfterViewInit {


    constructor(
        injector: Injector,
        private ultilityService: UltilityServiceProxy,
        private divisionService: DivisionServiceProxy,
        private constDetailService: ConstDetailServiceProxy,
        private plMasterService: PlMasterServiceProxy,
    ) {
        super(injector);
        this.editPageState = this.getRouteData('editPageState');
        this.inputModel.plaN_ID = this.getRouteParam('id');
        this.inputModel.constdetaiLs = [];
        this.initFilter();
        this.initCombobox();
        this.initIsApproveFunct();
        // console.log(this);

    }

    @ViewChild('editForm') editForm: NgForm;
    @ViewChild('goodsModal') goodsModal: GoodsModalComponent;
    @ViewChild('editTable') editTable: EditableTableComponent<CONSTDETAIL_ENTITY>;
    @ViewChild('rejectModal') rejectModal: RejectModalComponent;

    @ViewChild('effecT_DT') effecT_DT: CustomFlatpickrComponent;

    EditPageState = EditPageState;
    AllCodes = AllCodes;
    editPageState: EditPageState;

    inputModel: CONSTDETAIL_PLAN = new CONSTDETAIL_PLAN();
    filterInput: CONSTDETAIL_ENTITY;
    divisions: CM_DIVISION_ENTITY[];
    isApproveFunct: boolean;
    branchCreate: string = '';
    tempPlanId : string = '';
    PLAN_STATUS = PLAN_STATUS;

    get disableInput(): boolean {
        return this.editPageState == EditPageState.viewDetail || (this.editPageState == EditPageState.edit && this.branchCreate && this.branchCreate != this.userInfo.subbrId) || (this.editPageState == EditPageState.edit && this.inputModel.status != PLAN_STATUS.NOT_APPROVE && this.userInfo.branch.brancH_TYPE != 'HS');
    }
    departments: CM_DEPARTMENT_ENTITY[];

    isShowError = false;
    totalAmt: number = 0;
    processValue: number = 0;
    userInfo = this.appSession.user;

    dataInTables: CONSTDETAIL_ENTITY[] = [];

    ngOnInit(): void {
        switch (this.editPageState) {
            case EditPageState.add:
                this.inputModel.recorD_STATUS = RecordStatusConsts.Active;
                this.appToolbar.setRole('ConstDetail', false, false, true, false, false, false, false, false);
                this.appToolbar.setEnableForEditPage();
                this.inputModel.constdetaiLs = [];
                this.inputModel.year = moment().add(1, 'years').format('YYYY');
                this.inputModel.effecT_DT = moment().add(1, 'years').startOf('year');
                this.inputModel.status = PLAN_STATUS.NOT_APPROVE;

                this.initPlanName();
                this.inputModel.brancH_ID = this.userInfo.subbrId;
                this.inputModel.brancH_NAME = this.userInfo.branchName;
                break;
            case EditPageState.edit:
                this.appToolbar.setRole('ConstDetail', false, false, true, false, false, false, false, false);
                this.appToolbar.setEnableForEditPage();
                this.getConstDetail();
                break;
            case EditPageState.viewDetail:
                this.appToolbar.setRole('ConstDetail', false, false, false, false, false, false, this.userInfo.branch.brancH_TYPE == 'HS', false); // true neu branch_type = hoi so
                this.appToolbar.setEnableForViewDetailPage();
                this.getConstDetail();
                break;
        }
        console.log(this);
        this.appToolbar.setUiAction(this);
    }

    get disableAmortCols(): boolean {
        return this.editPageState == EditPageState.add && (this.userInfo.branch.brancH_TYPE != 'HS' || this.editPageState == EditPageState.add);
    }

    get showAmortColumns(): boolean {
        return this.editPageState == EditPageState.add || (this.editPageState == EditPageState.edit && this.userInfo.branch.brancH_TYPE != 'HS'); //hien thi cac cot khau hao khi o trang them cua tat ca user & trang edit cua user != hs
    }

    get showExpenseColumns(): boolean {
        return this.editPageState == EditPageState.viewDetail || (this.editPageState == EditPageState.edit && this.userInfo.branch.brancH_TYPE == 'HS'); //hien thi cac cot kinh phi khi o trang duyet cua tat ca user & trang edit cua user hs
    }

    ngAfterViewInit(): void {
        this.setupValidationMessage();
    }

    initIsApproveFunct() {
        this.ultilityService.isApproveFunct(this.getCurrentFunctionId()).subscribe(isApproveFunct => {
            this.isApproveFunct = isApproveFunct;
        })
    }

    initCombobox() {
        // this.divisionService.cM_DIVISION_GETALLCHILD(this.userInfo.subbrId).subscribe(response => {
        //     this.divisions = response;
        //     this.updateView();
        // });
    }

    initPlanName() {
        this.inputModel.plaN_NAME = 'XDCB_' + this.inputModel.year;
    }

    year_focusout(evt) {
        this.inputModel.year = evt.target.value;
        this.initPlanName();
        this.onChangeProperty('plaN_NAME');
    }

    getConstDetail() {
        this.constDetailService.pL_CONSTDETAIL_ById(this.inputModel.plaN_ID).subscribe(response => {
            this.inputModel = response;
            this.tempPlanId = response.plaN_ID;
            if(response)
                this.branchCreate = response.branchid;
            this.editTable.setList(this.inputModel.constdetaiLs);
            if (this.editPageState == EditPageState.viewDetail) {
                this.appToolbar.setEnableForViewDetailPage();
            }
            // CM_ATTACH_FILE
            this.getFile(this.inputModel.plaN_ID, this.inputModel);

            if (this.inputModel.autH_STATUS == AuthStatusConsts.Approve) {
                this.setPageStateToApprove();
            }
            if (this.inputModel.status == PLAN_STATUS.NOT_APPROVE) {
                this.appToolbar.setButtonApproveEnable(false);
            }
        });
    }


    addNewPlan() {
        var itemDetail = new CONSTDETAIL_ENTITY();
        itemDetail.starT_DT = moment().add(1, 'years').startOf('year');
        itemDetail.amorT_FIRT_DT = moment().add(1, 'years').startOf('year');
        itemDetail.exE_DT = 12;
        itemDetail.montH_OF_AMORT = 12;
        itemDetail.expecteD_VALUE = 0;
        itemDetail.verifY_VALUE = 0;
        itemDetail.approvE_VALUE = 0;
        itemDetail.consT_TYPE = 'XM';
        this.refreshItem(itemDetail);
        this.editTable.pushItem(itemDetail);
        this.updateView();
    }

    validateAmortMonth(): number {
        for(var i = 0; i < this.inputModel.constdetaiLs.length; i++) 
            if(this.inputModel.constdetaiLs[i].montH_OF_AMORT && this.inputModel.constdetaiLs[i].montH_OF_AMORT <= 0)
                return i; // position has invalid value
        return -1;
    }

    validateZero(fields: string[]): any[] {
        for(var ifield = 0; ifield < fields.length; ifield++)
            for(var i = 0; i < this.inputModel.constdetaiLs.length; i++) 
                if(this.inputModel.constdetaiLs[i][fields[ifield]] <= 0)
                    return [fields[ifield], i]; // position has invalid value
        return [];
    }

    saveInput() {
        if (this.editPageState != EditPageState.viewDetail) {

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

            this.inputModel.constdetaiLs = this.editTable.allData;

            if (!this.inputModel.constdetaiLs || this.inputModel.constdetaiLs.length == 0) {
                this.showErrorMessage(this.l('ConstDetailsRequired'));
                return;
            }

            if (!this.inputModel.year) {
                this.showErrorMessage(this.l('YearRequired'));
                return;
            }

            let editTableError = this.editTable.getValidationMessage();
            if (editTableError) {
                this.showErrorMessage(this.l('ConstructionSubTitle') + ': ' + editTableError);
                return;
            }

            // let invalidPos = this.validateAmortMonth();
            // if(invalidPos >= 0) {
            //     this.showErrorMessage(this.l('ConstructionSubTitle') + ': ' + this.l('AmortMonthValidateEqualZero') + ' ' + this.l('AtLine') + ' ' + (invalidPos + 1));
            //     return;
            // }

            let invalidPos = this.validateZero(['montH_OF_AMORT']);
            if(invalidPos.length > 0) {
                this.showErrorMessage(this.l('ConstructionSubTitle') + ': ' + this.l('AmortMonthValidateEqualZero') + ' ' + this.l('AtLine') + ' ' + (invalidPos[1] + 1));
                return;
            }

            let invalidExpensePos = this.validateZero(['verifY_VALUE', 'approvE_VALUE']);
            if(invalidExpensePos.length > 0 && this.showExpenseColumns) {
                this.showErrorMessage(this.l('ConstructionSubTitle') + ': ' + (invalidExpensePos[0] == 'verifY_VALUE' ? this.l('VerifyExpense') : this.l('ApproveExpense')) + ' ' + this.l('Must').toLowerCase() + ' ' + this.l('GreaterThanZero').toLowerCase() + ' ' + this.l('AtLine').toLowerCase() + ' ' + (invalidExpensePos[1] + 1));
                return;
            }

            this.saving = true;
            this.inputModel.makeR_ID = this.userInfo.userName;
            if (!this.inputModel.plaN_ID) {
                this.inputModel.approvE_VALUE = 0;
                this.inputModel.verson = 1;
                this.inputModel.status = this.userInfo.branch.brancH_TYPE == 'HS'? PLAN_STATUS.POST : PLAN_STATUS.NOT_APPROVE;
                this.addNewConstDetail();
            }
            else {
                if (this.userInfo.subbrId != this.inputModel.brancH_ID && this.inputModel.autH_STATUS == AuthStatusConsts.Reject) {
                    this.showErrorMessage(this.l('UpdateFailed'));
                    return;
                }
                this.updateConstDetail();
            }
        }
    }

    private updateConstDetail() {
        this.constDetailService.pL_CONSTDETAIL_Upd(this.inputModel).pipe(finalize(() => { this.saving = false; }))
            .subscribe((response) => {
                if (response['Result'] != '0') {
                    this.showErrorMessage(response['ErrorDesc']);
                }
                else {
                    // CM_ATTACH_FILE
                    this.updateFile(this.inputModel, 'PL_CONST_DETAIL', undefined, response['PLAN_ID']);
                    this.updateSuccess();
                    if (!this.isApproveFunct) {
                        this.constDetailService.pL_CONSTDETAIL_App(this.inputModel.plaN_ID, this.userInfo.userName, this.userInfo.subbrId)
                            .pipe(finalize(() => { this.saving = false; }))
                            .subscribe((response) => {
                                if (response['Result'] != '0') {
                                    this.showErrorMessage(response['ErrorDesc']);
                                }
                                else {
                                    this.setPageStateToApprove();
                                }
                            });
                    }
                    else {
                        this.inputModel.autH_STATUS = AuthStatusConsts.NotApprove;
                    }
                }
            });
    }

    private addNewConstDetail() {
        this.constDetailService.pL_CONSTDETAIL_Ins(this.inputModel).pipe(finalize(() => { this.saving = false; }))
            .subscribe((response) => {
                if (response['Result'] != '0') {
                    this.showErrorMessage(response['ErrorDesc']);
                }
                else {
                    // CM_ATTACH_FILE
                    this.addFile(this.inputModel, 'PL_CONST_DETAIL', undefined, response['PLAN_ID']);
                    this.addNewSuccess();
                    this.tempPlanId = response['PLAN_ID'];
                    if (!this.isApproveFunct) {
                        this.constDetailService.pL_CONSTDETAIL_App(response['PLAN_ID'], this.userInfo.userName, this.userInfo.subbrId)
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

    goBack() {
        this.navigatePassParam('/app/admin/const-detail', null, true);
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
        var currentUserName = this.userInfo.userName;
        if (currentUserName == this.inputModel.makeR_ID) {
            this.showErrorMessage(this.l('ApproveFailed'));
            return;
        }
        this.message.confirm(
            this.l('ApproveWarningMessage', this.l(this.inputModel.plaN_NAME)),
            this.l('AreYouSure'),
            (isConfirmed) => {
                if (isConfirmed) {
                    this.saving = true;
                    this.plMasterService.pL_MASTER_UpdStatus(this.inputModel.plaN_ID, currentUserName, this.userInfo.subbrId, AuthStatusConsts.Approve, PLAN_STATUS.APPROVE)
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

    dontApprovePlan(plAction: PLAN_ACTION = PLAN_ACTION.DONT_APPROVE_PLAN) {
        switch (plAction) {
            case PLAN_ACTION.DONT_APPROVE_PLAN:
                if (!this.tempPlanId) {
                    return;
                }
                var currentUserName = this.userInfo.userName;
                if (currentUserName == this.inputModel.makeR_ID || this.inputModel.autH_STATUS == AuthStatusConsts.Reject) {
                    this.showErrorMessage(this.l('ApproveFailed'));
                    return;
                }
                this.message.confirm(
                    // Khi click btn submit plan: Bạn có thực sự muốn gửi kế hoạch
                    this.l('ReturnWarningMessage', this.l(this.inputModel.plaN_NAME)),
                    this.l('AreYouSure'),
                    (isConfirmed) => {
                        if (isConfirmed) {
                            this.saving = true;
                            this.plMasterService.pL_MASTER_UpdStatus(this.tempPlanId, "", this.userInfo.subbrId, AuthStatusConsts.NotApprove, '')
                                .pipe(finalize(() => { this.saving = false; }))
                                .subscribe((response) => {
                                    if (response['Result'] != '0') {
                                        this.showErrorMessage(response['ErrorDesc']);
                                    }
                                    else {
                                        this.inputModel.status = PLAN_STATUS.NOT_APPROVE;

                                        this.appToolbar.setButtonApproveEnable(false);
                                        this.showSuccessMessage(this.l('ReturnSuccess'));

                                        let routerKey = this.activeRoute['_routerState'].snapshot.url;
                                        routerKey = routerKey.substr(0, routerKey.indexOf('-view;'));
                                        // this.inputModel.statuS_NAME = this.l('AddNew');
                                        if (this['cacheRouteReuseStrategy'].storedRouteHandles.get(routerKey)['componentRef'])
                                            this['cacheRouteReuseStrategy'].storedRouteHandles.get(routerKey)['componentRef'].instance['inputModelSaved'] = [this.inputModel, this.l('AddNew')];
                                    }
                                });
                        }
                    }
                ); break;

            case PLAN_ACTION.SUBMIT_PLAN:
                if (!this.tempPlanId) {
                    this.showWarningMessage(this.l('SaveBeforeSendPlanWarningMessage'));
                    return;
                }
                
                this.message.confirm(
                    // Khi click btn submit plan: Bạn có thực sự muốn gửi kế hoạch
                    this.l('SubmitPlanWarningMessage', this.l(this.inputModel.plaN_NAME)),
                    this.l('AreYouSure'),
                    (isConfirmed) => {
                        if (isConfirmed) {
                            this.saving = true;
                            this.plMasterService.pL_MASTER_UpdStatus(this.tempPlanId, "", this.userInfo.subbrId, AuthStatusConsts.NotApprove, PLAN_STATUS.POST)
                                .pipe(finalize(() => { this.saving = false; }))
                                .subscribe((response) => {
                                    if (response['Result'] != '0') {
                                        this.showErrorMessage(response['ErrorDesc']);
                                    }
                                    else {
                                        this.inputModel.status = PLAN_STATUS.POST;

                                        this.appToolbar.setButtonApproveEnable(false);
                                        this.showSuccessMessage(this.l('SubmitPlanSuccess'));

                                        let routerKey = this.activeRoute['_routerState'].snapshot.url;
                                        routerKey = routerKey.substr(0, routerKey.indexOf('-' + (this.editPageState == EditPageState.add ? this.editPageState : (this.editPageState + ';' )).toLowerCase()));
                                        if (this['cacheRouteReuseStrategy'].storedRouteHandles.get(routerKey)['componentRef'])
                                            this['cacheRouteReuseStrategy'].storedRouteHandles.get(routerKey)['componentRef'].instance['inputModelSaved'] = [this.inputModel, this.l('Sent')];
                                    }
                                });
                        }
                    }
                );

        }
    }

    submitPlan(): void {
        this.dontApprovePlan(PLAN_ACTION.SUBMIT_PLAN);
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

    onReject(item: PL_MASTER_ENTITY): void {
        this.rejectModal.show();
    }

    onReturn(notes: string) {
        this.constDetailService.pL_CONSTDETAIL_Reject(this.inputModel.plaN_ID, notes).subscribe(response => {
            if (response['Result'] != '0') {
                this.showErrorMessage(response['ErrorDesc']);
            }
            else {
                this.showSuccessMessage(this.l('RejectSuccess'));
                this.getConstDetail();
            }
        })
    }

    refreshItem(item: CONSTDETAIL_ENTITY){
        this.refresh_enD_DT(item);
        this.refresh_amorT_END_DT(item);
    }

    // Ngày dự kiến hoàn thành
    refresh_enD_DT(item: CONSTDETAIL_ENTITY) {
        if(item && item.starT_DT)
            item.enD_DT = item.starT_DT.clone().add(item.exE_DT, 'M');
    }

    // Tháng kết thúc khấu hao
    refresh_amorT_END_DT(item: CONSTDETAIL_ENTITY) {
        if(item && item.starT_DT)
            item.amorT_END_DT = item.amorT_FIRT_DT.clone().add(item.montH_OF_AMORT, 'M');
    }

    // Ngày dự kiến xây dựng
    starT_DT_change(item: CONSTDETAIL_ENTITY) {
        // if(item.starT_DT === )
        this.refresh_enD_DT(item);
        let index = this.editTable.dataInPage.indexOf(item);
        this.editForm.controls['enD_DT-' + index].setValue(item.enD_DT);
    }

    // Thời gian thực hiện
    exE_DT_change(item: CONSTDETAIL_ENTITY) {
        let index = this.editTable.dataInPage.indexOf(item);
        if(item.exE_DT > 10000) { // validate thoi gian thuc hien <= 10000 thang
            item.exE_DT = 12;
            this.editForm.controls['exE_DT-' + index].setValue(item.exE_DT);
        }
        this.refresh_enD_DT(item);
        // let index = this.editTable.dataInPage.indexOf(item);
        this.editForm.controls['enD_DT-' + index].setValue(item.enD_DT);
    }

    // Tháng khấu hao đầu tiên
    amorT_FIRT_DT_change(item: CONSTDETAIL_ENTITY) {
        this.refresh_amorT_END_DT(item);
        let index = this.editTable.dataInPage.indexOf(item);
        this.editForm.controls['amorT_END_DT-' + index].setValue(item.amorT_END_DT);
    }

    // Số tháng khấu hao (tháng)
    montH_OF_AMORT_change(item) {
        let index = this.editTable.dataInPage.indexOf(item);
        if(item.montH_OF_AMORT > 10000) { // validate so thang khau hao <= 10000 thang
            item.montH_OF_AMORT = 12;
            this.editForm.controls['montH_OF_AMORT-' + index].setValue(item.montH_OF_AMORT);
        }
        this.refresh_amorT_END_DT(item);
        // let index = 
        
        this.editTable.dataInPage.indexOf(item);
        this.editForm.controls['amorT_END_DT-' + index].setValue(item.amorT_END_DT);
    }

    
}
