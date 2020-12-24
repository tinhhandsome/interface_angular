import { Component, Injector, ViewChild, OnInit, ViewEncapsulation, ElementRef, AfterViewInit } from '@angular/core';
import { appModuleAnimation } from '@shared/animations/routerTransition';
import * as _ from 'lodash';
import { TR_PO_UP_MASTER_ENTITY, CM_DEPARTMENT_ENTITY, UltilityServiceProxy, TradePoUpServiceProxy, TR_PO_UP_DETAIL_ENTITY, TR_PO_PAYMENT_ENTITY, TR_PO_DETAIL_ENTITY } from '@shared/service-proxies/service-proxies';
import { EditPageState } from '@app/ultilities/enum/edit-page-state';
import { finalize } from 'rxjs/operators';
import { DefaultComponentBase } from '@app/ultilities/default-component-base';
import { AuthStatusConsts } from '@app/admin/core/ultils/consts/AuthStatusConsts';
import { EditableTableComponent } from '@app/admin/core/controls/editable-table/editable-table.component';
import { ToolbarRejectExtComponent } from '@app/admin/core/controls/toolbar-reject-ext/toolbar-reject-ext.component';
import { IUiAction } from '@app/ultilities/ui-action';

@Component({
    templateUrl: './po-update-edit.component.html',
    encapsulation: ViewEncapsulation.None,
    animations: [appModuleAnimation()]
})
export class TradePoUpdateEditComponent extends DefaultComponentBase implements AfterViewInit, OnInit, IUiAction<TR_PO_UP_MASTER_ENTITY> {

    ngAfterViewInit(): void {
        // COMMENT: this.stopAutoUpdateView();
    }

    constructor(
        injector: Injector,
        private ultilityService: UltilityServiceProxy,
        private tradePoUpMasterService: TradePoUpServiceProxy,
    ) {
        super(injector);

        this.editPageState = this.getRouteData('editPageState');
        this.inputModel.pO_ID = this.getRouteParam('id');

        this.initFilter();
        this.initCombobox();
        this.initIsApproveFunct();
    }

    @ViewChild('editForm') editForm: ElementRef;

    @ViewChild('editTablePoDetail') editTablePoDetail: EditableTableComponent<TR_PO_UP_DETAIL_ENTITY>;
    @ViewChild('editTablePaymentTrackingView') editTablePaymentTrackingView: EditableTableComponent<TR_PO_DETAIL_ENTITY>;
    @ViewChild('editTableUpdateDate') editTableUpdateDate: EditableTableComponent<TR_PO_UP_DETAIL_ENTITY>;

    get editTablePaymentTracking(){
        return this.editTablePaymentTrackingView || {} as  EditableTableComponent<TR_PO_DETAIL_ENTITY>;
    }

    EditPageState = EditPageState;
    editPageState: EditPageState;

    inputModel: TR_PO_UP_MASTER_ENTITY = new TR_PO_UP_MASTER_ENTITY();
    filterInput: TR_PO_UP_MASTER_ENTITY;
    isApproveFunct: boolean;

    totalAmt: number;

    get disableInput(): boolean {
        return this.editPageState == EditPageState.viewDetail;
    }


    isShowError = false;


    dataInTables: TR_PO_UP_MASTER_ENTITY[] = [];

    // lưu PO_DETAIL hiện tại để gán giá trị sau khi chọn đơn vị nhận từ popup
    currentPoDetail: TR_PO_UP_DETAIL_ENTITY;

    get apptoolbar(): ToolbarRejectExtComponent {
        return this.appToolbar as ToolbarRejectExtComponent;
    }

    ngOnInit(): void {
        switch (this.editPageState) {
            case EditPageState.edit:
                this.inputModel.brancH_ID = this.appSession.user.subbrId;
                this.appToolbar.setRole('TradePoUpdateList', false, false, true, false, false, false, false, false);
                this.appToolbar.setEnableForEditPage();
                this.getTradePoUpMaster();
                break;
            case EditPageState.viewDetail:
                this.inputModel.brancH_ID = this.appSession.user.subbrId;
                this.appToolbar.setRole('TradePoUpdateList', false, false, false, false, false, false, true, false);
                this.appToolbar.setEnableForViewDetailPage();
                this.getTradePoUpMaster();
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

    }


    getTradePoUpMaster() {
        try {
            let input = new TR_PO_UP_MASTER_ENTITY();
            input.pO_ID = this.inputModel.pO_ID;
            input.brancH_LOGIN = this.appSession.user.subbrId;
            input.pokind = 'PO';

            this.tradePoUpMasterService.tR_PO_UP_MASTER_ById(input).subscribe(response => {
                if (!response) this.goBack()
                this.inputModel = response;
                this.inputModel.tR_PO_UP_DETAILs.forEach(item => {
                    item.notes = item.ghI_CHU;
                });
                //TODO add editable
                this.inputModel.tR_PO_DETAILs.forEach(x=>{
                    if(!x.paymenT_STATUS){
                        x.paymenT_STATUS = 'CTT';
                    }
                })

                this.inputModel.tR_PO_UP_DETAILs.forEach(x=>{
                    if(!x.paymenT_STATUS){
                        x.paymenT_STATUS = 'CTT';
                    }
                })
                this.editTablePoDetail.setList(this.inputModel.tR_PO_UP_DETAILs);
                this.editTablePaymentTracking.setList(this.inputModel.tR_PO_DETAILs);
                this.editTableUpdateDate.tableState = this.editTablePoDetail.tableState;
                // this.editTableUpdateDate.setList(this.inputModel.tR_PO_DETAILs);

                if (this.editPageState == EditPageState.viewDetail) {
                    this.apptoolbar.setEnableForViewDetailPage();
                }
                if (this.inputModel.autH_STATUS == AuthStatusConsts.Approve || !this.inputModel.autH_STATUS) {
                    this.appToolbar.setButtonApproveEnable(false);
                }

                // CM_ATTACH_FILE
                this.getFile(this.inputModel.pO_ID, this.inputModel, this.inputModel.tR_PO_UP_DETAILs, 'pD_ID');

                this.updateView();
            });
        } catch{
            this.goBack()
        }
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

        if (this.editTablePaymentTracking) {
            let editTableError = this.editTablePaymentTracking.getValidationMessage();
            if (editTableError) {
                this.showErrorMessage(this.l('PaymentTracking') + ': ' + editTableError);
                return;
            }
        }

        this.inputModel.creatE_DT = this.inputModel.inpuT_DT;

        if (this.editPageState != EditPageState.viewDetail) {
            //TODO Gan list
            // this.inputModel.caR_ACCESSORIes = this.editTable.allData;
            // this.inputModel.caR_CURE_SCHes = this.editTable1.allData;

            this.saving = true;
            this.inputModel.makeR_ID = this.appSession.user.userName;
            this.inputModel.tR_PO_UP_DETAILs = this.editTablePoDetail.allData;
            this.inputModel.tR_PO_DETAILs = this.editTablePaymentTracking.allData;
            // this.inputModel.tR_PO_DETAILs = this.editTablePaymentTracking.allData;

            this.editTablePoDetail.allData.forEach(x => {
                x.deliverY_DT = x.ngaY_GIAOHANG;
                x.exP_DELIVERY_DT = x.ngaydudinH_GIAOHANG;
            });
            this.updatePoMaster();
            this.updateView();
        }
    }

    private updatePoMaster() {
        this.tradePoUpMasterService.tR_PO_UP_MASTER_Upd(this.inputModel).pipe(finalize(() => { this.saving = false; }))
            .subscribe((response) => {
                if (response.result != '0') {
                    this.showErrorMessage(response.errorDesc);
                }
                else {
                    this.updateSuccess();

                    // CM_ATTACH_FILE
                    this.updateFile(this.inputModel, 'RE_MUL_MASTER', this.inputModel.tR_PO_UP_DETAILs, response.ids, 'TR_PO_UP_MASTER_DT');

                    if (!this.isApproveFunct) {
                        this.tradePoUpMasterService.tR_PO_UP_MASTER_App(this.inputModel.pO_ID, this.appSession.user.userName)
                            .pipe(finalize(() => { this.saving = false; }))
                            .subscribe((response) => {
                                if (response.result != '0') {
                                    this.showErrorMessage(response.errorDesc);
                                }
                                else {
                                    this.inputModel.autH_STATUS = AuthStatusConsts.Approve;
                                    this.updateView();
                                }
                            });
                    }
                    else {
                        this.inputModel.autH_STATUS = AuthStatusConsts.NotApprove;
                        this.updateView();
                    }
                }
            });
    }


    goBack() {
        this.navigatePassParam('/app/admin/trade-po-update', null, { filterInput: JSON.stringify(this.filterInput) });
    }

    onAdd(): void {
    }

    onUpdate(item: TR_PO_UP_MASTER_ENTITY): void {
    }

    onDelete(item: TR_PO_UP_MASTER_ENTITY): void {
    }

    onApprove(item: TR_PO_UP_MASTER_ENTITY): void {
        if (!this.inputModel.pO_UP_ID) {
            return;
        }
        var currentUserName = this.appSession.user.userName;
        if (currentUserName == this.inputModel.makeR_ID || this.inputModel.autH_STATUS == AuthStatusConsts.Reject) {
            this.showErrorMessage(this.l('ApproveFailed'));
            return;
        }

        this.message.confirm(
            this.l('ApproveWarningMessage', this.l(this.inputModel.pO_NAME)),
            this.l('AreYouSure'),
            (isConfirmed) => {
                if (isConfirmed) {
                    this.saving = true;
                    this.tradePoUpMasterService.tR_PO_UP_MASTER_App(this.inputModel.pO_UP_ID, currentUserName)
                        .pipe(finalize(() => { this.saving = false; }))
                        .subscribe((response) => {
                            if (response.result != '0') {
                                this.showErrorMessage(response.errorDesc);
                            }
                            else {
                                this.approveSuccess();
                                this.updateView();
                            }
                        });
                }
            }
        );
    }

    onViewDetail(item: TR_PO_UP_MASTER_ENTITY): void {
    }

    onSave(): void {
        this.saveInput();
    }

    onSearch(): void {
    }

    onResetSearch(): void {
    }

    onReturn() {
    }
    selectRow(event, item: any): void {
        // set ui selected
        $(event.currentTarget).closest('table').find('tr.selectable').removeClass('selected');
        $(event.currentTarget).addClass('selected');
        // this.currentItem = item;
        // this.onSelectRow(item);
    }


    /* #region  Bảng con: lịch theo dõi thanh toán */

    /** reload remaiN_AMT */
    reloadPoDetailRemainAmt(item: TR_PO_DETAIL_ENTITY) {
        item.remaiN_AMT = item.totaL_AMT - item.amounT_PAID;
    }

    onAmountPaidFocusOut(item: TR_PO_DETAIL_ENTITY) {
        this.reloadPoDetailRemainAmt(item);
        this.updateView();
    }


    /* #endregion */
}
