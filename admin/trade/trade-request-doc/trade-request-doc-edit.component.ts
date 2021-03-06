import { Component, Injector, ViewChild, Output, EventEmitter, OnInit, ViewEncapsulation, ElementRef, AfterViewInit } from '@angular/core';
import { appModuleAnimation } from '@shared/animations/routerTransition';
import * as _ from 'lodash';
import {
    TR_REQUEST_DOC_ENTITY, TR_REQUEST_DOC_DT_ENTITY, CM_BRANCH_ENTITY, TradeRequestDocServiceProxy, BranchServiceProxy,
    UltilityServiceProxy, AsposeServiceProxy, ReportInfo, TR_PO_GOODS_ENTITY
} from '@shared/service-proxies/service-proxies';
import { ComponentBase } from "@app/ultilities/component-base";
import { EditPageState } from '@app/ultilities/enum/edit-page-state';
import { AllCodes } from '@app/ultilities/enum/all-codes';
import { finalize } from 'rxjs/operators';
import { DefaultComponentBase } from '@app/ultilities/default-component-base';
import { IUiAction } from '@app/ultilities/ui-action';
import { AuthStatusConsts } from '@app/admin/core/ultils/consts/AuthStatusConsts';
import { RecordStatusConsts } from '@app/admin/core/ultils/consts/RecordStatusConsts';
import * as moment from 'moment';
import { EditableTableComponent } from '@app/admin/core/controls/editable-table/editable-table.component';
import { TrRequestGoodsModalCloneComponent } from '@app/admin/core/controls/goods-modal-clone/tr-request-goods-modal.component';
import { FileDownloadService } from '@shared/utils/file-download.service';
import { ReportTypeConsts } from '@app/admin/core/ultils/consts/ReportTypeConsts';
import { PreviewTemplateService } from '@app/admin/common/preview-template/preview-template.service';
import { Paginator, Dropdown } from 'primeng/primeng';

@Component({
    templateUrl: './trade-request-doc-edit.component.html',
    encapsulation: ViewEncapsulation.None,
    animations: [appModuleAnimation()]
})
export class TradeRequestDocEditComponent extends DefaultComponentBase implements OnInit, IUiAction<TR_REQUEST_DOC_ENTITY>, AfterViewInit {

    constructor(
        injector: Injector,
        private trRequestDocService: TradeRequestDocServiceProxy,
        private branchService: BranchServiceProxy,
        private previewTemplateService: PreviewTemplateService,
        private ultilityService: UltilityServiceProxy,
        private asposeService: AsposeServiceProxy,
        private fileDownloadService: FileDownloadService
    ) {
        super(injector);

        this.editPageState = this.getRouteData('editPageState');
        this.inputModel.reQ_ID = this.getRouteParam('id');
        this.inputModel.tR_REQUEST_DOC_DT = [];
        this.initFilter();
        this.initIsApproveFunct();
        // console.log(this);
    }

    @ViewChild('editForm') editForm: ElementRef;
    @ViewChild('trRequestGoodsModal') trRequestGoodsModal: TrRequestGoodsModalCloneComponent;
    @ViewChild('editTable') editTable: EditableTableComponent<TR_REQUEST_DOC_DT_ENTITY>;
    @ViewChild('paginator') paginator: Paginator;

    EditPageState = EditPageState;
    AllCodes = AllCodes;
    editPageState: EditPageState;
    inputModel: TR_REQUEST_DOC_ENTITY = new TR_REQUEST_DOC_ENTITY();
    filterInput: TR_REQUEST_DOC_ENTITY;
    isApproveFunct: boolean;
    isPrintRequest = false;

    currentBranchFunct: (branch: CM_BRANCH_ENTITY) => void;

    get disableInput(): boolean {
        return this.editPageState == EditPageState.viewDetail;
    }
    Action : string;
    isApproveDVKD = false;
    isApproveAccept = false;
    isApproveAcceptBy = false;
    isApproveClose = false;
    isSendCNTT = false;
    branchs: CM_BRANCH_ENTITY[];
    branchSelect: CM_BRANCH_ENTITY;
    isShowError = false;
    isCheckAll = false;
    currentItem: TR_REQUEST_DOC_DT_ENTITY;
    totalAmt: number = 0;
    processValue: number = 0;
    rolename: string;
    dataInTables: TR_REQUEST_DOC_DT_ENTITY[] = [];
    ngOnInit(): void {
        switch (this.editPageState) {
            case EditPageState.add:
                this.inputModel.recorD_STATUS = RecordStatusConsts.Active;
                this.inputModel.tR_REQUEST_DOC_DT = [];
                this.appToolbar.setRole('TradeRequestDoc', false, false, true, false, false, false, false, false);
                this.appToolbar.setEnableForEditPage();
                this.isPrintRequest = false;
                break;
            case EditPageState.edit:
                this.appToolbar.setRole('TradeRequestDoc', false, false, true, false, false, false, false, false);
                this.appToolbar.setEnableForEditPage();
                this.getTrRequestDocDetail();
                this.isPrintRequest = true;
                break;
            case EditPageState.viewDetail:
                this.appToolbar.setRole('TradeRequestDoc', false, false, false, false, false, false, true, false);
                this.appToolbar.setEnableForViewDetailPage();
                this.getTrRequestDocDetail();
                this.isPrintRequest = false;
                break;
        }
        this.appToolbar.setUiAction(this);
    }

    ngAfterViewInit(): void {
        // COMMENT: this.stopAutoUpdateView();
        this.setupValidationMessage();

    }
    initIsApproveFunct() {
        this.ultilityService.isApproveFunct(this.getCurrentFunctionId()).subscribe(isApproveFunct => {
            this.isApproveFunct = isApproveFunct;
        })
    }

    getTrRequestDocDetail() {
        this.trRequestDocService.tR_REQUEST_DOC_ById(this.inputModel.reQ_ID).subscribe(response => {
            this.inputModel = response;
            if (this.inputModel.autH_STATUS == AuthStatusConsts.Approve) {
                this.appToolbar.setButtonApproveEnable(false);
            }
            if (this.permission.isGranted('Pages.Administration.TradeRequestDoc.Approve') && this.inputModel.status == "DVKD") {
                this.isApproveDVKD = true;
                this.isApproveAccept = false;
                this.isApproveAcceptBy = false;
                this.isApproveClose = false;
                this.isSendCNTT=false;
            }
            else if (this.permission.isGranted('Pages.Administration.TradeRequestDoc.Approve') && this.inputModel.status == "CNTT_N") {
                this.isApproveDVKD =false ;
                this.isApproveAccept = true;
                this.isApproveAcceptBy = false;
                this.isApproveClose = false;
                this.isSendCNTT=false;
            }
            else if (this.permission.isGranted('Pages.Administration.TradeRequestDoc.Approve') && this.inputModel.status == "HCQT_N") {
                this.isApproveDVKD =false ;
                this.isApproveAccept = false;
                this.isApproveAcceptBy = true;
                this.isApproveClose = true;
                if(this.inputModel.reQ_TYPE='CNTT'){
                    this.isSendCNTT=true;
                }
                this.Action='S_TDV_XN';
            }
            else if (this.permission.isGranted('Pages.Administration.TradeRequestDoc.Approve') && this.inputModel.status == "HCQT_XL") {
                this.isApproveDVKD =false ;
                this.isApproveAccept = false;
                this.isApproveAcceptBy = true;
                this.isApproveClose = true;
                if(this.inputModel.reQ_TYPE='CNTT'){
                    this.isSendCNTT=true;
                }
                this.Action='S_TDV_XN';
            }
            // CM_ATTACH_FILE
            this.getFile(this.inputModel.reQ_ID, this.inputModel);

            this.updateView();
        });

        this.trRequestDocService.tR_REQUEST_DOC_DT_ById(this.inputModel.reQ_ID).subscribe(response => {
            this.editTable.setList(response);
        })

    }

    onChangeBranchItem(branch: CM_BRANCH_ENTITY, item: TR_REQUEST_DOC_DT_ENTITY) {
        if (item) {
            item.receivE_ADDR = branch.addr;
        }
    }

    onSelectRow(item: any) {
        this.currentItem = item;
    }
    saveInput() {
        if (this.isApproveFunct == undefined) {
            this.showErrorMessage(this.l('PageLoadUndone'));
            return;
        }

        if ((this.editForm as any).form.invalid) {
            this.isShowError = true;
            this.showErrorMessage(this.l('FormInvalid'));
            this.updateView();
            return;
        }

        let editTableError = this.editTable.getValidationMessage();
        if (editTableError) {
            this.showErrorMessage(this.l('TradeRequestDocDetail') + ': ' + editTableError);
            return;
        }

        this.inputModel.tR_REQUEST_DOC_DT = this.editTable.allData;

        if (this.inputModel.tR_REQUEST_DOC_DT.length < 1) {
            this.showErrorMessage(this.l('FormInvalid'));
            this.updateView();
            return;
        }
        if (this.editPageState != EditPageState.viewDetail) {
            this.saving = true;
            this.inputModel.makeR_ID = this.appSession.user.userName;
            if (!this.inputModel.reQ_ID) {
                this.addNewTradeRequestDoc();
            }
            else {
                this.updateTradeRequestDoc();
            }
        }
    }

    private updateTradeRequestDoc() {
        this.trRequestDocService.tR_REQUEST_DOC_Upd(this.inputModel).pipe(finalize(() => { this.saving = false; }))
            .subscribe((response) => {
                if (response['Result'] != '0') {
                    this.showErrorMessage(response['ErrorDesc']);
                }
                else {
                    // CM_ATTACH_FILE
                    this.updateFile(this.inputModel, 'TR_REQUEST_DOC', undefined, response['REQ_ID']);
                    this.updateSuccess();
                    if (!this.isApproveFunct) {
                        this.trRequestDocService.tR_REQUEST_DOC_App(this.inputModel.reQ_ID, this.appSession.user.userName)
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
                        this.updateView();
                    }
                }
            });
    }

    private addNewTradeRequestDoc() {
        this.trRequestDocService.tR_REQUEST_DOC_Ins(this.inputModel).pipe(finalize(() => { this.saving = false; }))
            .subscribe((response) => {
                if (response['Result'] != '0') {
                    this.showErrorMessage(response['ErrorDesc']);
                }
                else {
                    // CM_ATTACH_FILE
                    this.inputModel.reQ_ID = response['REQ_ID'];
                    this.addFile(this.inputModel, 'TR_REQUEST_DOC', undefined, response['REQ_ID']);
                    this.addNewSuccess();
                    if (!this.isApproveFunct) {
                        this.trRequestDocService.tR_REQUEST_DOC_App(response['REQ_ID'], this.appSession.user.userName)
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
        this.navigatePassParam('/app/admin/trade-request-doc', null, { filterInput: JSON.stringify(this.filterInput) });
    }

    onAdd(): void {
    }

    onUpdate(item: TR_REQUEST_DOC_ENTITY): void {
    }

    onDelete(item: TR_REQUEST_DOC_ENTITY): void {
    }

    onApprove(item: TR_REQUEST_DOC_ENTITY): void {
        if (!this.inputModel.reQ_ID) {
            return;
        }
        var currentUserName = this.appSession.user.userName;
        if (currentUserName == this.inputModel.makeR_ID) {
            this.showErrorMessage(this.l('ApproveFailed'));
            return;
        }
        this.message.confirm(
            this.l('ApproveWarningMessage', this.l(this.inputModel.reQ_NAME)),
            this.l('AreYouSure'),
            (isConfirmed) => {
                if (isConfirmed) {
                    this.saving = true;
                    this.trRequestDocService.tR_REQUEST_DOC_App(this.inputModel.reQ_ID, currentUserName)
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

    onViewDetail(item: TR_REQUEST_DOC_ENTITY): void {

    }

    onSave(): void {
        this.saveInput();
    }

    onSearch(): void {

    }

    onResetSearch(): void {

    }

    onCheckAll(isCheckAll): void {
        this.editTable.allData.forEach(x => {
            x['isChecked'] = isCheckAll;
        });
    }

    onAddNewAssetsItem(): void {
        this.trRequestGoodsModal.show();
    }

    onRemoveAssetsItem(): void {
        this.editTable.allData = this.editTable.allData.filter(x => !x['isChecked']);
        this.editTable.setList(this.editTable.allData);
        this.refreshTotalPrice();
    }

    onSelectBranchInputModel(branch: CM_BRANCH_ENTITY) {
        this.inputModel.brancH_ID = branch.brancH_ID;
        this.inputModel.brancH_NAME = branch.brancH_NAME;
        this.updateView();
    }

    onSelectBranchRow(branch: CM_BRANCH_ENTITY) {
        this.editTable.currentItem.receivE_BRANCH = branch.brancH_ID;
        this.editTable.currentItem.brancH_NAME = branch.brancH_NAME;
    }

    onSelectTrRequestGoods(selectedGoods: TR_PO_GOODS_ENTITY[]) {
        selectedGoods.forEach(x => {
            if (this.editTable.allData.filter(t => t.gD_ID == x.gD_ID).length == 0) {
                var item = new TR_REQUEST_DOC_DT_ENTITY();
                // item.gD_ID = x.gD_ID;
                // item.gD_NAME = x.gD_NAME;
                // item.gD_CODE = x.gD_CODE;
                // item.no = this.inputModel.tR_REQUEST_DOC_DT.length + 1;
                // item.quantity = x.quantity;
                // item.price = x.price;
                // item.totaL_AMT = x.quantity * x.price;
                // item.brancH_CODE = x.brancH_CODE;
                // item.brancH_NAME = x.brancH_NAME;
                // item.brancH_ID = x.brancH_ID
                // item.receivE_PERSON = "";
                //  item.receivE_BRANCH = x.brancH_NAME;
                //  item.receivE_ADDR = x.r_ADDR;
                //  item.receivE_TEL = "";
                //  item.description = "";
                // item.plaN_ID = x.plaN_ID;

                Object.assign(item, x);
                item.reqdT_ID = "";
                item.goodS_ID = x.gD_ID;
                item.receivE_BRANCH = x.brancH_ID;
                item.receivE_ADDR = x.r_ADDR;
                item.receivE_TEL = "";
                item.description = "";
                item.receivE_PERSON = "";
                item.totaL_AMT = x.quantity * x.price;
                this.editTable.pushItem(item);
            }
        });
        this.refreshTotalPrice();
    }
    refreshTotalPrice() {
        this.inputModel.totaL_AMT = 0;
        this.editTable.allData.forEach(x => {
            this.inputModel.totaL_AMT += x.totaL_AMT;
        });
    }
    refreshPriceItem(item) {
        item.totaL_AMT = item.quantity * item.price;
        this.refreshTotalPrice();
    }

    refreshPrice(item: TR_PO_GOODS_ENTITY) {
        if (item) {
            this.refreshPriceItem(item);
        }
    }

    requestDocPrint() {

        let parameters = [this.GetParamNameAndValue('REQ_DOC_ID', this.inputModel.reQ_ID)];
        let values = this.GetParamsFromFilter({
            branchName: this.appSession.user.branchName,
            branchCode: this.appSession.user.branch.brancH_CODE,
            datePrint: moment().format(this.s('gAMSProCore.DateReportDisplayFormat')),
            fullName: this.appSession.user.name
        });

        this.previewTemplateService.printReportTemplate('TradeRequestDoc_Report', parameters, values);
    }

    downloadTrRequestDocWord() {
        var reportInfo = new ReportInfo();
        reportInfo.typeExport = ReportTypeConsts.Word;

        reportInfo.parameters = [
            this.GetParamNameAndValue("REQ_DOC_ID", this.inputModel.reQ_ID)
        ];

        reportInfo.values = [
            this.GetParamNameAndValue("Maker", this.appSession.user.userName),
            this.GetParamNameAndValue("PrintDate", moment()),
            this.GetParamNameAndValue("REQ_CONTENT", this.inputModel.reQ_CONTENT)
        ];

        reportInfo.pathName = "/TR_REQUEST_DOC/rpt_tr_request_doc.docx";
        reportInfo.storeName = "rpt_REQUEST_DOC";

        this.asposeService.getReport(reportInfo).subscribe(x => {
            this.fileDownloadService.downloadTempFile(x);
        });
    }
    downloadTrRequestDocPdf() {
        var reportInfo = new ReportInfo();
        reportInfo.typeExport = ReportTypeConsts.Pdf;

        reportInfo.parameters = [
            this.GetParamNameAndValue("REQ_DOC_ID", this.inputModel.reQ_ID)
        ];

        reportInfo.values = [
            this.GetParamNameAndValue("Maker", this.appSession.user.userName),
            this.GetParamNameAndValue("PrintDate", moment()),
            this.GetParamNameAndValue("REQ_CONTENT", this.inputModel.reQ_CONTENT)
        ];

        reportInfo.pathName = "/TR_REQUEST_DOC/rpt_tr_request_doc.docx";
        reportInfo.storeName = "rpt_REQUEST_DOC";

        this.asposeService.getReport(reportInfo).subscribe(x => {
            this.fileDownloadService.downloadTempFile(x);
        });
    }
    TradeRequestUpdStatus() {
        this.appSession.user.branch.brancH_TYPE // Tên đăng nhập
    }
    UpdateRequestProcess(protype: string) {
        this.trRequestDocService.pL_REQUEST_PROCESS_update(this.inputModel.reQ_ID, protype, this.inputModel.makeR_ID, this.appSession.user.userName, this.appSession.user.userName)
            .pipe(finalize(() => { this.saving = false; }))
            .subscribe((response) => {
                if (response['Result'] != '0') {
                    this.showErrorMessage(response['ErrorDesc']);
                }
                else {
                    this.showSuccessMessage(response['NOTIFATION']);
                    this.updateView();
                }
            });
    }
}
