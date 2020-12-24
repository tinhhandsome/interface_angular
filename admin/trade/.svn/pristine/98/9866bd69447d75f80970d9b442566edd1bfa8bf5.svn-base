import { Component, Injector, ViewChild, OnInit, ViewEncapsulation, ElementRef, ChangeDetectionStrategy, AfterViewChecked, AfterViewInit } from '@angular/core';
import { appModuleAnimation } from '@shared/animations/routerTransition';
import * as _ from 'lodash';
import { BID_MASTER_ENTITY, BidMasterServiceProxy, CM_DEPARTMENT_ENTITY, CM_DIVISION_ENTITY, DivisionServiceProxy, UltilityServiceProxy, BID_CONTRACTOR_DT_ENTITY, CM_SUPPLIER_ENTITY, TR_PROJECT_ENTITY } from '@shared/service-proxies/service-proxies';
import { EditPageState } from '@app/ultilities/enum/edit-page-state';
import { AllCodes } from '@app/ultilities/enum/all-codes';
import { finalize } from 'rxjs/operators';
import { DefaultComponentBase } from '@app/ultilities/default-component-base';
import { AuthStatusConsts } from '@app/admin/core/ultils/consts/AuthStatusConsts';
import { RecordStatusConsts } from '@app/admin/core/ultils/consts/RecordStatusConsts';
import { GoodsModalComponent } from '@app/admin/core/controls/goods-modal/goods-modal.component';
import { EditableTableComponent } from '@app/admin/core/controls/editable-table/editable-table.component';
import { RejectModalComponent } from '@app/admin/core/controls/reject-modals/reject-modal.component';
import { CustomFlatpickrComponent } from '@app/admin/core/controls/custom-flatpickr/custom-flatpickr.component';
import { IUiAction } from '@app/ultilities/ui-action';
import * as moment from 'moment';
import { NgForm } from '@angular/forms';

@Component({
    templateUrl: './bid-master-edit.component.html',
    encapsulation: ViewEncapsulation.None,
    animations: [appModuleAnimation()]
})
export class BidMasterEditComponent extends DefaultComponentBase implements OnInit, AfterViewInit, IUiAction<BID_CONTRACTOR_DT_ENTITY> {


    constructor(
        injector: Injector,
        private ultilityService: UltilityServiceProxy,
        private divisionService: DivisionServiceProxy,
        private bidMasterService: BidMasterServiceProxy
    ) {
        super(injector);
        this.editPageState = this.getRouteData('editPageState');
        this.inputModel.biD_ID = this.getRouteParam('id');
        this.inputModel.biD_CONTRACTOR_DTs = [];
        this.inputModel.budget = 0;
        this.inputModel.totaL_AMT = 0;
        this.inputModel.guaranteE_PER = 0;
        this.inputModel.guaranteE_AMT = 0;
        this.initFilter();
        this.initCombobox();
        this.initIsApproveFunct();
        console.log(this)
    }

    @ViewChild('editForm') editForm: NgForm;
    @ViewChild('goodsModal') goodsModal: GoodsModalComponent;
    @ViewChild('editTable') editTable: EditableTableComponent<BID_CONTRACTOR_DT_ENTITY>;
    @ViewChild('rejectModal') rejectModal: RejectModalComponent;

    @ViewChild('effecT_DT') effecT_DT: CustomFlatpickrComponent;

    EditPageState = EditPageState;
    AllCodes = AllCodes;
    editPageState: EditPageState;

    inputModel: BID_MASTER_ENTITY = new BID_MASTER_ENTITY();
    filterInput: BID_MASTER_ENTITY;
    divisions: CM_DIVISION_ENTITY[];
    isApproveFunct: boolean;

    setupEditableValidation() {
        this.editTable.validations.push({
            message: this.l(`${this.l('NotLessThan')} ${this.l('BidInputDt').toLowerCase()}`),
            field: "senD_DT",
            checkValid: (context) => {
                if (!this.validationSendDt_inpuT_DT(context)) {
                    return false;
                }
                return true;
            }
        });
        this.editTable.validations.push({
            message: this.l(` ${this.l('NotGreaterThan')} ${this.l('BidExpDt').toLowerCase()}`),
            field: "senD_DT",
            checkValid: (context) => {
                if (!this.validationSendDt_exP_DT(context)) {
                    return false;
                }
                return true;
            }
        });

        this.editTable.validations.push({
            message: this.l(`${this.l('NotLessThan')} ${this.l('BidOpenDt').toLowerCase()}`),
            field: "exP_DT",
            checkValid: (context) => {
                if (!this.validationExPDt_opeN_DT(context)) {
                    return false;
                }
                return true;
            }
        });
    }

    ngAfterViewInit(): void {

        this.setupEditableValidation();

        this.setupValidationMessage();
        // COMMENT: this.stopAutoUpdateView();
        //  this.updateView();
    }

    get disableInput(): boolean {
        return this.editPageState == EditPageState.viewDetail || this.inputModel.autH_STATUS == AuthStatusConsts.Approve;
    }
    departments: CM_DEPARTMENT_ENTITY[];

    isShowError = false;

    totalAmt: number = 0;
    processValue: number = 0;

    dataInTables: BID_MASTER_ENTITY[] = [];

    ngOnInit(): void {
        switch (this.editPageState) {
            case EditPageState.add:
                this.inputModel.recorD_STATUS = RecordStatusConsts.Active;
                this.appToolbar.setRole('BidMaster', false, false, true, false, false, false, false, false);
                this.appToolbar.setEnableForEditPage();
                this.inputModel.biD_CONTRACTOR_DTs = [];
                break;
            case EditPageState.edit:
                this.appToolbar.setRole('BidMaster', false, false, true, false, false, false, false, false);
                this.appToolbar.setEnableForEditPage();
                this.getBidMaster();
                break;
            case EditPageState.viewDetail:
                this.appToolbar.setRole('BidMaster', false, false, false, false, false, false, true, false);
                this.appToolbar.setEnableForViewDetailPage();
                this.getBidMaster();
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
        this.divisionService.cM_DIVISION_Search(this.getFillterForCombobox()).subscribe(response => {
            this.divisions = response.items;
        });

    }

    onProjectCodeChange(evt) {
        if (!evt.target.value) {
            this.inputModel.projecT_ID = undefined;
            this.inputModel.projecT_CODE = undefined;
            this.inputModel.projecT_NAME = undefined;
            this.updateView();
        }
    }

    getBidMaster() {


        this.bidMasterService.bID_CONTRACTOR_DT_ById(this.inputModel.biD_ID).subscribe(response => {
            this.editTable.setList(response);
            this.inputModel.biD_CONTRACTOR_DTs = response;

            // CM_ATTACH_FILE
            if (this.inputModel.biD_CODE) {
                this.getFile(this.inputModel.biD_ID, this.inputModel, this.inputModel.biD_CONTRACTOR_DTs, 'id');
            }
            this.updateView();
        });

        this.bidMasterService.bID_MASTER_ById(this.inputModel.biD_ID).subscribe(response => {

            if (this.inputModel.biD_CONTRACTOR_DTs) {
                response.biD_CONTRACTOR_DTs = this.inputModel.biD_CONTRACTOR_DTs;
                // CM_ATTACH_FILE
                this.getFile(this.inputModel.biD_ID, response, this.inputModel.biD_CONTRACTOR_DTs, 'id');
            }

            this.inputModel = response;

            if (this.editPageState == EditPageState.viewDetail) {
                this.appToolbar.setEnableForViewDetailPage();
            }
            if (this.inputModel.autH_STATUS == AuthStatusConsts.Approve) {
                this.appToolbar.setButtonApproveEnable(false);
                this.appToolbar.setButtonSaveEnable(false);
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
            this.bidMasterValidation();
            this.showErrorMessage(this.l('FormInvalid'));
            this.updateView();
            return;
        }


        if (this.editPageState != EditPageState.viewDetail) {
            this.inputModel.biD_CONTRACTOR_DTs = this.editTable.allData;
            this.inputModel.biD_TYPE = '1';

            if (!this.bidMasterValidation()) {
                this.isShowError = true;
                this.updateView();
                return;
            }
            let editTableError = this.editTable.getValidationMessage();
            if (editTableError) {
                this.showErrorMessage(this.l('BidMaster') + ': ' + editTableError);
                return;
            }
            this.saving = true;
            this.isShowError = false;
            this.inputModel.makeR_ID = this.appSession.user.userName;
            if (!this.inputModel.biD_ID) {

                this.insertBidMaster();
            }
            else {
                this.updateBidMaster();
            }
        }
    }

    private insertBidMaster() {
        this.bidMasterService.bID_MASTER_Ins(this.inputModel).pipe(finalize(() => { this.saving = false; }))
            .subscribe((response) => {
                if (response.result != '0') {
                    this.showErrorMessage(response.errorDesc);
                }
                else {
                    // CM_ATTACH_FILE
                    this.addFile(this.inputModel, 'BID_MASTER', this.inputModel.biD_CONTRACTOR_DTs, response.ids, 'BID_CONTRACTOR_DT');
                    this.addNewSuccess();
                    this.updateView();
                    if (!this.isApproveFunct) {
                        this.bidMasterService.bID_MASTER_App(response.id, this.appSession.user.userName)
                            .pipe(finalize(() => { this.saving = false; }))
                            .subscribe((response) => {
                                if (response.result != '0') {
                                    this.showErrorMessage(response.errorDesc);
                                }
                                this.updateView();
                            });
                    }
                }
            });
    }

    private updateBidMaster() {
        this.bidMasterService.bID_MASTER_Upd(this.inputModel).pipe(finalize(() => { this.saving = false; }))
            .subscribe((response) => {
                if (response.result != '0') {
                    this.showErrorMessage(response.errorDesc);
                }
                else {
                    // CM_ATTACH_FILE
                    this.updateFile(this.inputModel, 'BID_MASTER', this.inputModel.biD_CONTRACTOR_DTs, response.ids, 'BID_CONTRACTOR_DT');

                    this.updateSuccess();
                    if (!this.isApproveFunct) {
                        this.bidMasterService.bID_MASTER_App(this.inputModel.biD_ID, this.appSession.user.userName)
                            .pipe(finalize(() => { this.saving = false; }))
                            .subscribe((response) => {
                                if (response.result != '0') {
                                    this.showErrorMessage(response.errorDesc);
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

    goBack() {
        this.navigatePassParam('/app/admin/bid-master', null, null);
    }

    onAdd(): void {
    }

    onUpdate(item: BID_CONTRACTOR_DT_ENTITY): void {
    }

    onDelete(item: BID_CONTRACTOR_DT_ENTITY): void {
    }

    onApprove(item: BID_CONTRACTOR_DT_ENTITY): void {
        if (!this.inputModel.biD_ID) {
            return;
        }
        var currentUserName = this.appSession.user.userName;
        if (currentUserName == this.inputModel.makeR_ID || this.inputModel.autH_STATUS == AuthStatusConsts.Reject) {
            this.showErrorMessage(this.l('ApproveFailed'));
            return;
        }
        this.message.confirm(
            this.l('ApproveWarningMessage', this.l(this.inputModel.biD_CODE)),
            this.l('AreYouSure'),
            (isConfirmed) => {
                if (isConfirmed) {
                    this.saving = true;
                    this.bidMasterService.bID_MASTER_App(this.inputModel.biD_ID, currentUserName)
                        .pipe(finalize(() => { this.saving = false; }))
                        .subscribe((response) => {
                            if (response.result != '0') {
                                this.showErrorMessage(response.errorDesc);
                            }
                            else {
                                this.appToolbar.setButtonApproveEnable(false);
                                this.approveSuccess();
                            }
                            this.updateView();
                        });
                }
            }
        );
    }

    onSelectSupplier(suppliers: CM_SUPPLIER_ENTITY[]) {
        suppliers.forEach(x => {
            if (this.editTable.allData.filter(t => t.suP_ID == x.suP_ID).length == 0) {
                var item = new BID_CONTRACTOR_DT_ENTITY();
                item.suP_ID = x.suP_ID;
                item.suP_NAME = x.suP_NAME;
                item.senD_DT = moment();
                item.offerinG_VALUE = 0;
                this.editTable.allData.push(item);
            }
        });

        this.editTable.resetNoAndPage();
        this.editTable.changePage(0);
        this.updateView();
    }

    onSelectProject(project: TR_PROJECT_ENTITY) {
        this.inputModel.projecT_ID = project.projecT_ID;
        this.inputModel.projecT_CODE = project.projecT_CODE;
        this.updateView();
    }

    onViewDetail(item: BID_CONTRACTOR_DT_ENTITY): void {
    }

    onSave(): void {
        this.saveInput();
    }

    onSearch(): void {
    }

    onResetSearch(): void {
    }

    // validation area - BEGIN

    validationSendDt_inpuT_DT(item: BID_CONTRACTOR_DT_ENTITY) {
        if (!item.senD_DT || !this.inputModel.inpuT_DT) {
            return true;
        }
        if (item.senD_DT.diff(this.inputModel.inpuT_DT) < 0) {
            return false;
        }

        return true;
    }



    validationSendDt_exP_DT(item: BID_CONTRACTOR_DT_ENTITY) {
        if (!item.senD_DT || !this.inputModel.exP_DT) {
            return true;
        }
        if (this.inputModel.exP_DT.diff(item.senD_DT) < 0) {
            return false;
        }



        return true;
    }

    validationExPDt_opeN_DT(item: BID_CONTRACTOR_DT_ENTITY) {
        if (!item.exP_DT || !this.inputModel.opeN_DT) {
            return true;
        }
        if (item.exP_DT.diff(this.inputModel.opeN_DT) < 0) {
            return false;
        }
        return true;
    }



    bidMasterValidation() {
        let result = true;
        if (!this.inputModel.biD_CONTRACTOR_DTs || !this.inputModel.biD_CONTRACTOR_DTs.length) {
            this.showErrorMessage(`${this.l('BidConstractorSubtitle')} ${this.l('ValidationRequired')}`);
            result = false;
        }

        // ngay mo thau khong duoc nho hon ngay het han nop
        if (this.inputModel.opeN_DT && this.inputModel.opeN_DT.diff(this.inputModel.exP_DT) < 0) {
            this.showErrorMessage(`${this.l('BidOpenDt')} ${this.l('NotLessThan')} ${this.l('BidExpDt').toLocaleLowerCase()}`);
            result = false;
        }

        if (this.inputModel.exP_DT && this.inputModel.exP_DT.diff(this.inputModel.inpuT_DT) < 0) {
            this.editForm.controls['exP_DT']['invalid2'] = this.l('BidExpDt') + ' ' + this.l('NotLessThan') + ' ' + this.l('BidInputDt').toLocaleLowerCase();
            result = false;
        }
        else{
            this.editForm.controls['exP_DT']['invalid2'] = "";
        }

        // ngay gui ho so k nho hon ngay nhan ho so, 
        // ngay gui ho so thau k nho hon ngay het han nop,
        // ngay het han bao lanh khong duoc nho hon ngay mo thau
        // if (this.inputModel.biD_CONTRACTOR_DTs.filter(x => {
        //     // ngay gui ho so k nho hon ngay nhan ho so
        //     if (!this.validationSendDt_inpuT_DT(x)) {
        //         return x;
        //     }

        //     // ngay gui ho so thau k nho hon ngay het han nop
        //     if (!this.validationSendDt_exP_DT(x)) {
        //         return x;
        //     }

        //     // ngay het han bao lanh khong duoc nho hon ngay mo thau
        //     if (!this.validationExPDt_opeN_DT(x)) {
        //         return x;
        //     }
        // }).length) {
        //     this.showErrorMessage(this.l('FormInvalid'));
        //     return false;
        // }

        // ngay het han bao lanh khong duoc nho hon ngay mo thau

        //exP_DT


        // phai co it nhat 1 don vi trung thau
        if (this.inputModel.biD_CONTRACTOR_DTs.filter(x => {
            if (x.iS_BID_WIN == '1') {
                return x;
            }
        }).length != 1) {
            this.showErrorMessage(this.l("BidConstractorSubtitle") + ": " + this.l('PleaseChooseOne', this.l("IsBidWin")));
            result = false;
        }

        return result;
    }

    updateValidate() {


        if (this.inputModel.exP_DT && this.inputModel.exP_DT.diff(this.inputModel.inpuT_DT) < 0) {
            this.editForm.controls['exP_DT']['invalid2'] = this.l('BidExpDt') + ' ' + this.l('NotLessThan') + ' ' + this.l('BidInputDt').toLocaleLowerCase();
        }
        else{
            this.editForm.controls['exP_DT']['invalid2'] = "";
        }
        this.updateView();
    }

    // validation area END

}
