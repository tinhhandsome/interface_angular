import { Component, Injector, ViewChild, OnInit, ViewEncapsulation, ElementRef, ChangeDetectionStrategy, ChangeDetectorRef, AfterViewInit, AfterViewChecked, AfterContentChecked, AfterContentInit } from '@angular/core';
import { appModuleAnimation } from '@shared/animations/routerTransition';
import * as _ from 'lodash';
import { TR_PO_REPAIR_ENTITY, TradePoRepairServiceProxy, CM_DEPARTMENT_ENTITY, UltilityServiceProxy, CM_CAR_TYPE_ENTITY, CarTypeServiceProxy, CM_MODEL_ENTITY, ModelServiceProxy, CAR_ACCESSORY_ENTITY, CAR_CURE_SCH_ENTITY, ASS_MASTER_ENTITY, TR_PO_GOODS_ENTITY, TR_PO_REPAIR_DT_ENTITY, TR_PO_PAYMENT_ENTITY, TL_ROLE_NOTIFICATION_ENTITY, CM_BRANCH_ENTITY, CM_SUPPLIERTYPE_ENTITY, CM_SUPPLIER_ENTITY, TR_CONTRACT_ENTITY, UserListDto, CM_GOODSTYPE_ENTITY, CM_GOODSTYPE_REAL_ENTITY, GoodsTypeRealServiceProxy, ReportInfo, AsposeServiceProxy, WfDefinitionServiceProxy, WfDefinitionParam, TradePoMasterServiceProxy } from '@shared/service-proxies/service-proxies';
import { EditPageState } from '@app/ultilities/enum/edit-page-state';
import { finalize } from 'rxjs/operators';
import { DefaultComponentBase } from '@app/ultilities/default-component-base';
import { AuthStatusConsts } from '@app/admin/core/ultils/consts/AuthStatusConsts';
import { RecordStatusConsts } from '@app/admin/core/ultils/consts/RecordStatusConsts';
import { IUiAction } from '@app/ultilities/ui-action';
import { ToolbarComponent } from '@app/admin/core/controls/toolbar/toolbar.component';
import { PoRepairGoodsDetailEditableComponent } from './po-repair-goods-detail-editable.component';
import { PoRepairPaymentEditableComponent } from './po-repair-payment-editable.component';
import { PoRepairRoleNotificationEditableComponent } from './po-repair-role-notification-editable.component';
import { AuthStatusInputPageComponent } from '@app/admin/core/controls/auth-status-input-page/auth-status-input-page.component';
import { ReportTypeConsts } from '@app/admin/core/ultils/consts/ReportTypeConsts';
import { FileDownloadService } from '@shared/utils/file-download.service';
import * as moment from 'moment';
import { PreviewTemplateService } from '@app/admin/common/preview-template/preview-template.service';
import { NgForm } from '@angular/forms';
import { DateFormatPipe } from '@app/admin/core/pipes/date-format.pipe';

@Component({
    templateUrl: './trade-po-repair-edit.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    animations: [appModuleAnimation()]
})
export class TradePoRepairEditComponent extends DefaultComponentBase implements OnInit, AfterViewInit, IUiAction<TR_PO_REPAIR_ENTITY> {

    constructor(
        injector: Injector,
        private ultilityService: UltilityServiceProxy,
        private asposeService: AsposeServiceProxy,
        private workflowService: WfDefinitionServiceProxy,
        private fileDownloadService: FileDownloadService,
        private tradePoRepairService: TradePoRepairServiceProxy,
        private previewTemplateService: PreviewTemplateService,
        private tradePoMasterService: TradePoMasterServiceProxy
    ) {
        super(injector);
        this.editPageState = this.getRouteData('editPageState');
        this.inputModel.pO_REPAIR_ID = this.getRouteParam('id');
        this.initFilter();
        this.initCombobox();
        this.initIsApproveFunct();
        this.initDefaultInputModel();
        // console.log(this);
    }

    @ViewChild('editForm') editForm: NgForm;

    @ViewChild('editPageGoodDetail') editPageGoodDetail: PoRepairGoodsDetailEditableComponent;
    @ViewChild('editPagePoRepairPayment') editPagePoRepairPayment: PoRepairPaymentEditableComponent;
    @ViewChild('editPagePoRepairRoleNotification') editPagePoRepairRoleNotification: PoRepairRoleNotificationEditableComponent;
    @ViewChild('authStatusMessage') authStatusMessage: AuthStatusInputPageComponent;

    EditPageState = EditPageState;
    editPageState: EditPageState;

    inputModel: TR_PO_REPAIR_ENTITY = new TR_PO_REPAIR_ENTITY();
    filterInput: TR_PO_REPAIR_ENTITY;
    isApproveFunct: boolean;

    currentContract: TR_CONTRACT_ENTITY;

    totalAmtReport: number;
    branchPaymentReport: string;
    addressReport: string[];

    get disableInput(): boolean {
        return this.editPageState == EditPageState.viewDetail;
    }

    isShowError = false;

    processValue: number = 0;

    dataInTables: TR_PO_REPAIR_ENTITY[] = [];

    get apptoolbar(): ToolbarComponent {
        return this.appToolbar;
    }

    getCurrentFunctionId(): string {
        return '/app/admin/trade-po-repair';
    }

    ngAfterViewInit(): void {
        this.setupValidationMessage();
        // COMMENT: this.stopAutoUpdateView();
    }

    ngOnInit(): void {
        switch (this.editPageState) {
            case EditPageState.add:
                this.inputModel.recorD_STATUS = RecordStatusConsts.Active;
                this.appToolbar.setRole('TradePoRepair', false, false, true, false, false, false, false, false);
                this.appToolbar.setEnableForEditPage();
                this.inputModel.brancH_ID = this.appSession.user.subbrId;
                break;
            case EditPageState.edit:
                this.inputModel.brancH_ID = this.appSession.user.subbrId;
                this.appToolbar.setRole('TradePoRepair', false, false, true, false, false, false, false, false);
                this.appToolbar.setEnableForEditPage();
                this.gettradePoRepair();
                break;
            case EditPageState.viewDetail:
                this.inputModel.brancH_ID = this.appSession.user.subbrId;
                this.appToolbar.setRole('TradePoRepair', false, false, false, false, false, false, true, false);
                this.appToolbar.setEnableForViewDetailPage();
                this.gettradePoRepair();
                break;
        }

        this.appToolbar.setUiAction(this);
    }

    initDefaultInputModel() {
        this.inputModel.inpuT_DT = moment().startOf('day');
    }

    initIsApproveFunct() {
        this.ultilityService.isApproveFunct(this.getCurrentFunctionId()).subscribe(isApproveFunct => {
            this.isApproveFunct = isApproveFunct;
        })
    }

    initCombobox() {
        let filterCombobox = this.getFillterForCombobox();
    }

    gettradePoRepair() {
        this.tradePoRepairService.tR_PO_REPAIR_ById(this.inputModel.pO_REPAIR_ID).subscribe(response => {
            if (!response) this.goBack()
            this.inputModel = response;

            if (this.editPageState == EditPageState.viewDetail) {
                this.apptoolbar.setEnableForViewDetailPage();
            }

            if (this.inputModel.autH_STATUS == AuthStatusConsts.Approve) {
                this.appToolbar.setButtonApproveEnable(false);
            }

            // CM_ATTACH_FILE
            this.getFile(this.inputModel.pO_REPAIR_ID, this.inputModel);

            this.updateView();
        });

        this.tradePoRepairService.tR_PO_DETAIL_ById(this.inputModel.pO_REPAIR_ID, undefined, undefined).subscribe(response => {
            response.forEach(x => {
                x.goodstypE_REAL = undefined;
                x.pD_ID = x.prD_ID;
                x.goodstypE_REAL_NAME = x.gdreaL_TYPE_NAME;
                x.remaiN_AMT = x.totaL_AMT - x.amounT_PAID;
                x.amt = x.amt || 0;
            })

            this.inputModel.tR_PO_DETAILs = response;
            this.editPageGoodDetail.editTableGoodsDetail.setList(response);
            this.editPageGoodDetail.reloadTotalAmt();
            this.initPoDetailForReport();
            this.updateView();
        });

        this.tradePoRepairService.tR_PO_PAYMENT_ById(this.inputModel.pO_REPAIR_ID).subscribe(response => {
            response.forEach(x => {
                x['IsReadOnly'] = true;
            })
            this.inputModel.tR_PO_PAYMENTs = response;
            this.editPagePoRepairPayment.editTablePoRepairPayment.setList(response);
        });

        this.tradePoRepairService.tR_ROLE_NOTIFI_ID(this.inputModel.pO_REPAIR_ID, 'PO').subscribe(response => {
            this.inputModel.tL_ROLE_NOTIFICATIONs = response;
            this.editPagePoRepairRoleNotification.editTablePoRepairRoleNotification.setList(response);
        });


        this.editPagePoRepairRoleNotification.inputModel = this.inputModel;
        this.editPagePoRepairPayment.inputModel = this.inputModel;
        this.editPageGoodDetail.inputModel = this.inputModel;

        this.editPagePoRepairRoleNotification.reloadList();
        this.editPagePoRepairPayment.reloadList();
        this.editPageGoodDetail.reloadList();
    }

    // Ngày duyệt tờ trình không lớn hơn ngày gọi hàng
    checkPayappDtValid() {
        if (this.inputModel.payapP_DT && this.inputModel.inpuT_DT) {
            this.editForm.form.controls['payapP_DT']['errorMessage'] = this.inputModel.payapP_DT.diff(this.inputModel.inpuT_DT) > 0 ? this.l('PoMasterPayAppDtMustBeLessThanInputDt') : '';
        }
        else {
            this.editForm.form.controls['payapP_DT']['errorMessage'] = '';
        }
        if (this.isShowError) {
            this.updateView();
        }
    }

    private isValid() {
        this.checkPayappDtValid();
        let errorMessage = ''
        try {
            errorMessage = this.editForm.form.controls['payapP_DT']['errorMessage'] ? 'FormInvalid' : '';

        } catch{
            errorMessage = 'FormInvalid'
        }

        return errorMessage
    }

    saveInput() {
        if (this.isApproveFunct == undefined ||
            (this.editPageState == EditPageState.edit &&
                (!this.inputModel.tL_ROLE_NOTIFICATIONs || !this.inputModel.tR_PO_DETAILs || !this.inputModel.tR_PO_PAYMENTs))) {
            this.showErrorMessage(this.l('PageLoadUndone'));
            return;
        }

        let errorMessage = this.isValid()
        if (errorMessage != '') {
            this.isShowError = true;
            this.showErrorMessage(this.l(errorMessage));
            this.updateView();
            return;
        }

        if ((this.editForm as any).form.invalid) {
            this.isShowError = true;
            this.showErrorMessage(this.l('FormInvalid'));
            this.updateView();
            return;
        }

        if (this.editPageGoodDetail.editTableGoodsDetail.allData.length <= 0) {
            this.showErrorMessage(this.l('GoodsDetail') + ' ' + this.l('ValidationRequired'));
            this.updateView();
            return;
        }

        let editTableError = this.editPageGoodDetail.editTableGoodsDetail.getValidationMessage();
        if (editTableError) {
            this.showErrorMessage(this.l('GoodsDetail') + ': ' + editTableError);
            return;
        }


        this.inputModel.creatE_DT = this.inputModel.inpuT_DT;

        this.inputModel.totaL_AMT = this.editPageGoodDetail.totalAmtElement.value;
        if (this.editPageState != EditPageState.viewDetail) {
            this.inputModel.tL_ROLE_NOTIFICATIONs = this.editPagePoRepairRoleNotification.editTablePoRepairRoleNotification.allData;
            this.inputModel.tR_PO_DETAILs = this.editPageGoodDetail.editTableGoodsDetail.allData;
            this.inputModel.tR_PO_PAYMENTs = this.editPagePoRepairPayment.editTablePoRepairPayment.allData;

            this.saving = true;
            this.inputModel.makeR_ID = this.appSession.user.userName;
            if (!this.inputModel.pO_REPAIR_ID) {
                this.addPoRepair();
            }
            else {
                this.updatePoRepair();
            }
        }
    }

    private updatePoRepair() {
        this.tradePoRepairService.tR_PO_REPAIR_Upd(this.inputModel).pipe(finalize(() => { this.saving = false; }))
            .subscribe((response) => {
                if (response['Result'] != '0') {
                    this.showErrorMessage(response['ErrorDesc']);
                }
                else {
                    this.updateSuccess();
                    this.initPoDetailForReport();

                    // CM_ATTACH_FILE
                    this.updateFile(this.inputModel, 'TR_PO_REPAIR', undefined, this.inputModel.pO_REPAIR_ID);

                    if (!this.isApproveFunct) {
                        this.tradePoRepairService.tR_PO_REPAIR_App(this.inputModel.pO_REPAIR_ID, this.appSession.user.userName)
                            .pipe(finalize(() => { this.saving = false; }))
                            .subscribe((response) => {
                                if (response['Result'] != '0') {
                                    this.showErrorMessage(response['ErrorDesc']);
                                }
                                else {
                                    this.authStatusMessage.authStatus = this.inputModel.autH_STATUS = AuthStatusConsts.Approve;
                                }
                            });
                    }
                    else {
                        this.authStatusMessage.authStatus = this.inputModel.autH_STATUS = AuthStatusConsts.NotApprove;
                    }
                }
            });
    }

    private addPoRepair() {
        this.tradePoRepairService.tR_PO_REPAIR_Ins(this.inputModel).pipe(finalize(() => { this.saving = false; }))
            .subscribe((response) => {
                if (response['Result'] != '0') {
                    this.showErrorMessage(response['ErrorDesc']);
                }
                else {
                    this.addNewSuccess();
                    // CM_ATTACH_FILE
                    this.addFile(this.inputModel, 'TR_PO_REPAIR', undefined, response['PO_ID']);
                    this.inputModel.pO_CODE = response['PO_CODE'];
                    this.updateView();
                    if (!this.isApproveFunct) {
                        this.tradePoRepairService.tR_PO_REPAIR_App(response['PO_ID'], this.appSession.user.userName)
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

    approvePoRepair() {
        var currentUserName = this.appSession.user.userName;
        this.tradePoRepairService.tR_PO_REPAIR_App(this.inputModel.pO_REPAIR_ID, currentUserName)
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

    goBack() {
        this.navigatePassParam('/app/admin/trade-po-repair', null, { filterInput: JSON.stringify(this.filterInput) });
    }

    onAdd(): void {
    }

    onUpdate(item: TR_PO_REPAIR_ENTITY): void {
    }

    onDelete(item: TR_PO_REPAIR_ENTITY): void {
    }

    onApprove(item: TR_PO_REPAIR_ENTITY): void {
        if (!this.inputModel.pO_REPAIR_ID) {
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
                    this.approvePoRepair();

                    // this.workflowService.wF_EXECUTE({
                    //     functioN_ID: this.getCurrentFunctionId(),
                    //     reF_ID: this.inputModel.pO_REPAIR_ID,
                    //     amt: this.inputModel.c_TOTAL_AMT,
                    //     useR_ID: this.appSession.user.userName,
                    //     wF_VALUE: undefined
                    // } as WfDefinitionParam).subscribe(wfResult => {
                    //     if (wfResult['HAS_WORKFLOW'] == '0' || wfResult['IS_WF_END'] == '1') {
                    //         this.approvePoRepair();
                    //         return;
                    //     }

                    //     if (wfResult['EXECUTE_SUCCESS']) {
                    //         this.showSuccessMessage(this.l('SuccessfullyConfirmed'));
                    //     }
                    // });

                }
            }
        );
    }



    onViewDetail(item: TR_PO_REPAIR_ENTITY): void {
    }

    onSave(): void {
        this.saveInput();
    }

    onSearch(): void {
    }

    onResetSearch(): void {
    }

    onReturn(notes: string) {
    }


    onChangeContractCode(evt) {
        if (!evt.target.value) {
            this.inputModel.contracT_ID = undefined;
            this.inputModel.contracT_CODE = undefined;
            this.inputModel.contracT_NAME = undefined;
            this.inputModel.contracT_TOTAL_AMT = undefined;
            this.inputModel.contracT_TOTAL_EXE_AMT = undefined;
            this.updateView();
        }
    }

    onChangeSupplierCode(evt) {
        if (!evt.target.value) {
            this.inputModel.suP_ID = undefined;
            this.inputModel.suP_NAME = undefined;
            this.updateView();
        }
    }

    onSelectSupplier(supplier: CM_SUPPLIER_ENTITY) {
        this.inputModel.suP_ID = supplier.suP_ID;
        this.inputModel.suP_CODE = supplier.suP_CODE;
        this.inputModel.suP_NAME = supplier.suP_NAME;
        this.inputModel.suP_ADDR = supplier.addr;
        this.onChangeProperty('suP_ID');
        this.onChangeProperty('suP_CODE');
        this.onChangeProperty('suP_NAME');
        this.onChangeProperty('suP_ADDR');
    }

    onSelectContract(contract: TR_CONTRACT_ENTITY) {
        this.inputModel.contracT_ID = contract.contracT_ID;
        this.inputModel.contracT_CODE = contract.contracT_CODE;
        this.inputModel.contracT_NAME = contract.contracT_NAME;
        this.inputModel.contracT_TOTAL_AMT = contract.totaL_AMT;
        this.inputModel.contracT_TOTAL_EXE_AMT = contract.donE_AMT;
        this.inputModel.suP_ID = contract.suP_ID;
        this.inputModel.suP_NAME = contract.suP_NAME;
        this.inputModel.suP_ADDR = contract.addr;
        this.inputModel.suP_CODE = contract.suP_CODE;

        this.currentContract = contract;

        this.tradePoMasterService.tR_CONTRACT_PAYMENT_ById(contract.contracT_ID).subscribe(response => {
            this.editPagePoRepairPayment.editTablePoRepairPayment.setList(response);
            this.updateView();
        })
        this.updateView();
    }

    onChangeTotalAmt(totalAmt: number) {
        this.editPagePoRepairPayment.totalAmt = totalAmt;
        this.editPagePoRepairPayment.reloadAllPaymentAmount();
        this.editPagePoRepairPayment.updateView()
    }

    printOfferDeliveryDoc_p() {
        if (!this.inputModel.pO_REPAIR_ID) {
            this.showErrorMessage(this.l('CannotExport'));
            return;
        }

        let parameters = [this.GetParamNameAndValue('PO_ID', this.inputModel.pO_REPAIR_ID)];

        let values = this.GetParamsFromFilter({
            PrintDate: (new DateFormatPipe()).transform(moment()),
            PoCode: this.inputModel.pO_CODE,
            SupName: this.inputModel.suP_NAME,
            FullName: this.appSession.user.name,
            CreatedUser: this.inputModel.makeR_FULLNAME,
            TotalAmt: this.formatMoney(this.totalAmtReport),
            CreatedDt: (new DateFormatPipe()).transform(this.inputModel.creatE_DT),
            BranchPayment: this.branchPaymentReport,
            NOI_NHAN_HANG: '<ul>' + this.addressReport.map(x => '<li>' + x + '</li>').join('') + '</ul>',
            ContractDescription: (this.inputModel.contracT_ID ? this.l('KH_BC_07_ContractDescription', this.inputModel.contracT_NAME, this.inputModel.contracT_CODE, (new DateFormatPipe()).transform(this.inputModel.contracT_DT)) : '') + `<br>Đề nghị quý Công ty giao hàng cho ABBank với thông tin như sau:`
        });

        this.previewTemplateService.printReportTemplate('rpt_KH_BC10', parameters, values);
    }

    printOfferDeliveryDoc_w() {
        if (!this.inputModel.pO_REPAIR_ID) {
            this.showErrorMessage(this.l('CannotExport'));
            return;
        }
        let reportInfo = new ReportInfo();
        reportInfo.typeExport = ReportTypeConsts.Word;

        reportInfo.parameters = [this.GetParamNameAndValue('PO_ID', this.inputModel.pO_REPAIR_ID)];

        reportInfo.values = this.GetParamsFromFilter({
            PrintDate: (new DateFormatPipe()).transform(moment()),
            PoCode: this.inputModel.pO_CODE,
            SupName: this.inputModel.suP_NAME,
            FullName: this.appSession.user.name,
            CreatedUser: this.inputModel.makeR_FULLNAME,
            TotalAmt: this.formatMoney(this.totalAmtReport),
            CreatedDt: (new DateFormatPipe()).transform(this.inputModel.creatE_DT),
            BranchPayment: this.branchPaymentReport,
            NOI_NHAN_HANG: this.addressReport.join(`
`),
            ContractDescription: (this.inputModel.contracT_ID ? this.l('KH_BC_07_ContractDescription', this.inputModel.contracT_NAME, this.inputModel.contracT_CODE, (new DateFormatPipe()).transform(this.inputModel.contracT_DT)) : '') + `
${this.l('ReportPoDescription')}`
        });


        reportInfo.pathName = "/TRADE/KH_BC10.docx";
        reportInfo.storeName = "rpt_KH_BC10_w";

        this.asposeService.getReport(reportInfo).subscribe(x => {
            this.fileDownloadService.downloadTempFile(x);
        });
    }

    initPoDetailForReport() {
        this.totalAmtReport = this.inputModel.tR_PO_DETAILs.sum(x => x.totaL_AMT);
        let hsPayCount = this.inputModel.tR_PO_DETAILs.filter(x => x.iS_HQ_PAY == '1').length;
        let poDetailCount = this.inputModel.tR_PO_DETAILs.length;
        this.branchPaymentReport = hsPayCount == poDetailCount ? 'Hội sở' : (hsPayCount == 0 ? 'CN/PGD' : 'CN/PGD/Hội sở');
        this.addressReport = this.inputModel.tR_PO_DETAILs.filter(x => x.receivE_ADDR || x.receivE_TEL || x.receivE_PERSON).map(x => [x.receivE_ADDR.trim(), x.receivE_PERSON.trim(), x.receivE_TEL.trim()].filter(a => a).join(', ')).distinct();
    }
}
