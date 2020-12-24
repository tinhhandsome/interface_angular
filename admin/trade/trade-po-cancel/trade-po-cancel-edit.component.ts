import { Component, Injector, ViewChild, OnInit, ViewEncapsulation, ElementRef, ChangeDetectionStrategy } from '@angular/core';
import { appModuleAnimation } from '@shared/animations/routerTransition';
import * as _ from 'lodash';
import { TR_PO_CANCEL_ENTITY, TradePoCancelServiceProxy, CM_DEPARTMENT_ENTITY, UltilityServiceProxy, CM_CAR_TYPE_ENTITY, CarTypeServiceProxy, CM_MODEL_ENTITY, ModelServiceProxy, CAR_ACCESSORY_ENTITY, CAR_CURE_SCH_ENTITY, ASS_MASTER_ENTITY, TR_PO_MASTER_ENTITY } from '@shared/service-proxies/service-proxies';
import { EditPageState } from '@app/ultilities/enum/edit-page-state';
import { AllCodes } from '@app/ultilities/enum/all-codes';
import { finalize } from 'rxjs/operators';
import { DefaultComponentBase } from '@app/ultilities/default-component-base';
import { AuthStatusConsts } from '@app/admin/core/ultils/consts/AuthStatusConsts';
import { RecordStatusConsts } from '@app/admin/core/ultils/consts/RecordStatusConsts';
import { IUiActionRejectExt } from '@app/ultilities/ui-action-re';
import { ToolbarRejectExtComponent } from '@app/admin/core/controls/toolbar-reject-ext/toolbar-reject-ext.component';
import { RejectModalComponent } from '@app/admin/core/controls/reject-modals/reject-modal.component';
import { TradePoMasterModalComponent } from '@app/admin/core/controls/trade-po-master-modal/trade-po-master-modal.component';
import * as moment from 'moment';


@Component({
    templateUrl: './trade-po-cancel-edit.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    animations: [appModuleAnimation()]
})
export class TradePoCancelEditComponent extends DefaultComponentBase implements OnInit, IUiActionRejectExt<TR_PO_CANCEL_ENTITY> {

    constructor(
        injector: Injector,
        private ultilityService: UltilityServiceProxy,
        private tradePoCancelService: TradePoCancelServiceProxy,
    ) {
        super(injector);

        this.editPageState = this.getRouteData('editPageState');
        this.inputModel.pO_CANCEL_ID = this.getRouteParam('id');

        this.initFilter();
        this.initCombobox();
        this.initIsApproveFunct();
    }

    @ViewChild('editForm') editForm: ElementRef;
    @ViewChild('tradePoMasterModal') tradePoMasterModal: TradePoMasterModalComponent;
    @ViewChild('rejectModal') rejectModal: RejectModalComponent;

    EditPageState = EditPageState;
    AllCodes = AllCodes;
    editPageState: EditPageState;


    inputModel: TR_PO_CANCEL_ENTITY = new TR_PO_CANCEL_ENTITY();
    filterInput: TR_PO_CANCEL_ENTITY;
    isApproveFunct: boolean;



    get disableInput(): boolean {
        return this.editPageState == EditPageState.viewDetail;
    }

    departments: CM_DEPARTMENT_ENTITY[];

    isShowError = false;

    totalAmt: number = 0;
    processValue: number = 0;

    dataInTables: TR_PO_CANCEL_ENTITY[] = [];

    get apptoolbar(): ToolbarRejectExtComponent {
        return this.appToolbar as ToolbarRejectExtComponent;
    }

    ngOnInit(): void {
        let { subbrId, name } = this.appSession.user

        switch (this.editPageState) {
            case EditPageState.add:
                this.inputModel.recorD_STATUS = RecordStatusConsts.Active;
                this.appToolbar.setRole('TradePoCancel', false, false, true, false, false, false, false, false);
                this.appToolbar.setEnableForEditPage();

                this.inputModel.brancH_ID = subbrId;
                this.inputModel.requesT_CANCEL = name;
                this.inputModel.requesT_DT = moment();

                break;
            case EditPageState.edit:
                this.inputModel.brancH_ID = subbrId;
                this.appToolbar.setRole('TradePoCancel', false, false, true, false, false, false, false, false);
                this.appToolbar.setEnableForEditPage();
                this.getTradePoCancel();
                break;
            case EditPageState.viewDetail:
                this.inputModel.brancH_ID = subbrId;
                this.appToolbar.setRole('TradePoCancel', false, false, false, false, false, false, true, false);
                this.appToolbar.setEnableForViewDetailPage();
                this.getTradePoCancel();
                break;
        }

        this.appToolbar.setUiAction(this);

    }

    ngAfterViewInit(): void {
        // COMMENT: this.stopAutoUpdateView();
        this.setupValidationMessage()
    }

    initIsApproveFunct() {
        this.ultilityService.isApproveFunct(this.getCurrentFunctionId()).subscribe(isApproveFunct => {
            this.isApproveFunct = isApproveFunct;
        })
    }

    initCombobox() {
        // let filterCombobox = this.getFillterForCombobox();
    }
    onSelectTradePoMaster(item: TR_PO_CANCEL_ENTITY) {
        let { pO_ID, pO_CODE, contracT_CODE, totaL_AMT, s_SUP_NAME } = item
        this.inputModel.pO_ID = pO_ID
        this.inputModel.pO_CODE = pO_CODE
        this.inputModel.contracT_CODE = contracT_CODE
        this.inputModel.totaL_AMT = totaL_AMT
        this.inputModel.s_SUP_NAME = s_SUP_NAME

        this.updateView()
    }

    getTradePoCancel() {
        try {
            this.tradePoCancelService.tR_PO_CANCEL_ById(this.inputModel.pO_CANCEL_ID).subscribe(response => {
                if (!response) this.goBack()
                this.inputModel = response;

                if (this.inputModel.autH_STATUS == AuthStatusConsts.Approve) {
                    this.appToolbar.setButtonApproveEnable(false);
                }
                this.updateView()
            });
        } catch{
            this.goBack()
        }
    }

    saveInput() {
        if (this.isApproveFunct == undefined) {
            this.showErrorMessage(this.l('PageLoadUndone'));
            this.updateView()
            return;
        }

        if ((this.editForm as any).form.invalid) {
            this.isShowError = true;
            this.showErrorMessage(this.l('FormInvalid'));
            this.updateView()
            return;
        }

        if (this.editPageState != EditPageState.viewDetail) {
            this.saving = true;
            this.inputModel.makeR_ID = this.appSession.user.userName;
            if (!this.inputModel.pO_CANCEL_ID) {
                this.tradePoCancelService.tR_PO_CANCEL_Ins(this.inputModel).pipe(finalize(() => { this.saving = false; }))
                    .subscribe((response) => {
                        if (response.result != '0') {
                            this.showErrorMessage(response.errorDesc);
                        }
                        else {
                            this.showSuccessMessage(this.l('InsertSuccessful'));
                            if (!this.isApproveFunct) {
                                this.tradePoCancelService.tR_PO_CANCEL_App(this.inputModel.pO_CANCEL_ID, this.inputModel.pO_ID, this.appSession.user.userName)
                                    .pipe(finalize(() => { this.saving = false; }))
                                    .subscribe((response) => {
                                        if (response.result != '0') {
                                            this.showErrorMessage(response.errorDesc);
                                        } else {
                                            this.inputModel.autH_STATUS == AuthStatusConsts.Approve
                                            this.apptoolbar.setButtonApproveEnable(false)
                                            this.apptoolbar.setButtonSaveEnable(false)
                                        }
                                        this.updateView();
                                    });
                            }
                        }
                        this.updateView();
                    });
            }
            else {
                if (this.appSession.user.subbrId != this.inputModel.brancH_ID && this.inputModel.autH_STATUS == AuthStatusConsts.Reject) {
                    this.showErrorMessage(this.l('UpdateFailed'));
                    this.updateView();
                    return;
                }
                this.tradePoCancelService.tR_PO_CANCEL_Upd(this.inputModel).pipe(finalize(() => { this.saving = false; }))
                    .subscribe((response) => {
                        if (response.result != '0') {
                            this.showErrorMessage(response.errorDesc);
                        }
                        else {
                            this.showSuccessMessage(this.l('UpdateSuccessful'));
                            if (!this.isApproveFunct) {
                                this.tradePoCancelService.tR_PO_CANCEL_App(this.inputModel.pO_CANCEL_ID, this.inputModel.pO_ID, this.appSession.user.userName)
                                    .pipe(finalize(() => { this.saving = false; }))
                                    .subscribe((response) => {
                                        if (response.result != '0') {
                                            this.showErrorMessage(response.errorDesc);
                                        }
                                        else {
                                            this.inputModel.autH_STATUS = AuthStatusConsts.Approve;
                                            this.apptoolbar.setButtonApproveEnable(false)
                                            this.apptoolbar.setButtonSaveEnable(false)
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
        this.navigatePassParam('/app/admin/trade-po-cancel', null, { filterInput: JSON.stringify(this.filterInput) });
    }

    onAdd(): void {
    }

    onUpdate(item: TR_PO_CANCEL_ENTITY): void {
    }

    onDelete(item: TR_PO_CANCEL_ENTITY): void {
    }

    onApprove(item: TR_PO_CANCEL_ENTITY): void {
        var currentUserName = this.appSession.user.userName;
        if (currentUserName == this.inputModel.makeR_ID || this.inputModel.autH_STATUS == AuthStatusConsts.Reject) {
            this.showErrorMessage(this.l('ApproveFailed'));
            return;
        }
        this.message.confirm(
            this.l('ApproveWarningMessage', this.l(this.inputModel.pO_CANCEL_ID)),
            this.l('AreYouSure'),
            (isConfirmed) => {
                if (isConfirmed) {
                    this.saving = true;
                    this.tradePoCancelService.tR_PO_CANCEL_App(this.inputModel.pO_CANCEL_ID, this.inputModel.pO_ID, currentUserName)
                        .pipe(finalize(() => { this.saving = false; }))
                        .subscribe((response) => {
                            if (response.result != '0') {
                                this.showErrorMessage(response.errorDesc);
                            }
                            else {
                                this.showSuccessMessage(this.l('SuccessfullyApprove'));
                                this.inputModel.autH_STATUS = AuthStatusConsts.Approve;
                                this.apptoolbar.setButtonApproveEnable(false)
                                this.apptoolbar.setButtonSaveEnable(false)
                            }
                            this.updateView();
                        });
                }
            }
        );
    }
    onViewDetail(item: TR_PO_CANCEL_ENTITY): void {
    }

    onSave(): void {
        this.saveInput();
    }

    onSearch(): void {
    }

    onResetSearch(): void {
    }

    onReject(item: TR_PO_CANCEL_ENTITY): void {
        this.rejectModal.show();
    }

    onReturn(notes: string) {
    }
}
