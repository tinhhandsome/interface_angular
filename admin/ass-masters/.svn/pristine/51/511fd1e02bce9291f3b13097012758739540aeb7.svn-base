import { PreviewTemplateService } from './../../common/preview-template/preview-template.service';
import { Component, Injector, ViewChild, Output, EventEmitter, OnInit, ViewEncapsulation, ElementRef, AfterViewInit } from '@angular/core';
import { appModuleAnimation } from '@shared/animations/routerTransition';
import * as _ from 'lodash';
import { AssLiqRequestServiceProxy, ASS_LIQ_REQUEST_ENTITY, UltilityServiceProxy, CM_TERM_ENTITY, ASS_TYPE_ENTITY, AssTypeServiceProxy, TermServiceProxy, ASS_MASTER_ENTITY, ASS_LIQ_REQUEST_DT_ENTITY, CM_BRANCH_ENTITY, ReportInfo, AsposeServiceProxy } from '@shared/service-proxies/service-proxies';
import { EditPageState } from '@app/ultilities/enum/edit-page-state';
import { finalize } from 'rxjs/operators';
import { DefaultComponentBase } from '@app/ultilities/default-component-base';
import { IUiAction } from '@app/ultilities/ui-action';
import { AuthStatusConsts } from '@app/admin/core/ultils/consts/AuthStatusConsts';
import { RecordStatusConsts } from '@app/admin/core/ultils/consts/RecordStatusConsts';
import { EditableTableComponent } from '@app/admin/core/controls/editable-table/editable-table.component';
import { DateFormatPipe } from '@app/admin/core/pipes/date-format.pipe';
import * as moment from 'moment'
import { BranchModalComponent } from '@app/admin/core/controls/branch-modal/branch-modal.component';
import { ReportTypeConsts } from '@app/admin/core/ultils/consts/ReportTypeConsts';
import { FileDownloadService } from '@shared/utils/file-download.service';
import { AssetSkModalComponent } from '@app/admin/core/controls/asset-modal/asset-modal-sk.component';
import { NgForm } from '@angular/forms';

@Component({
    templateUrl: './ass-liq-request-edit.component.html',
    encapsulation: ViewEncapsulation.None,
    animations: [appModuleAnimation()]
})

export class AssLiqRequestEditComponent extends DefaultComponentBase implements OnInit, AfterViewInit
    , IUiAction<ASS_LIQ_REQUEST_ENTITY> {
    constructor(
        injector: Injector,
        private termService: TermServiceProxy,
        private asposeService: AsposeServiceProxy,
        private fileDownloadService: FileDownloadService,
        private assTypeService: AssTypeServiceProxy,
        private ultilityService: UltilityServiceProxy,
        private assLiqRequestService: AssLiqRequestServiceProxy
    ) {
        super(injector);
        this.editPageState = this.getRouteData('editPageState');
        this.inputModel.liQ_REQ_ID = this.getRouteParam('id');

        console.log(this)
        this.initFilter();
        this.initCombobox();
        this.initIsApproveFunct();

    }

    @ViewChild('editForm') editForm: NgForm;
    @ViewChild('assetModal') assetModal: AssetSkModalComponent;
    @ViewChild('branchModal') branchModal: BranchModalComponent;
    @ViewChild('ngFormAssLiq') ngFormAssLiq: NgForm;
    @ViewChild('editTableView') editTable: EditableTableComponent<ASS_LIQ_REQUEST_DT_ENTITY>;

    EditPageState = EditPageState;
    editPageState: EditPageState;

    inputModel: ASS_LIQ_REQUEST_ENTITY = new ASS_LIQ_REQUEST_ENTITY();
    filterInput: ASS_LIQ_REQUEST_ENTITY;
    isApproveFunct: boolean;

    userBranchName: String

    importStartPosition: String = "A9"

    assTypes: ASS_TYPE_ENTITY[];
    terms: CM_TERM_ENTITY[];

    branchId: String
    branchName: String

    excelRowProperties: any = {
        '0': 'no',
        '1': 'grouP_CODE',
        '2': 'asseT_CODE',
        '3': 'asseT_NAME',
        '4': 'brancH_USE_NAME',
        '5': 'depT_USE_NAME',
        '6': 'tlkh',
        '7': 'buY_PRICE',
        '8': 'remaiN_VALUE',
        '9': 'usE_DATE',
        '10': 'asseT_SERIAL_NO',
        '11': 'xxx1', // chi tiet tai san
        '12': 'asS_STATUS_NAME',
        '13': 'liQ_REASON',
        '14': 'reQ_AMT',
        '15': 'xxx2', //nguoi quan lý/ vtri tai san
        '16': 'notes'
    }

    xlsStructure = ['no', 'grouP_CODE', 'asseT_CODE', 'asseT_NAME', 'brancH_USE_NAME', 'depT_USE_NAME', 'tlkh', 'buY_PRICE', 'remaiN_VALUE',
        'usE_DATE', 'asseT_SERIAL_NO', 'xxx1', 'asS_STATUS_NAME', 'liQ_REASON', 'reQ_AMT', 'xxx2', 'notes'
    ]

    get disableInput(): boolean {
        return this.editPageState == EditPageState.viewDetail;
    }

    get isShowPrintAssLiqRequestList(): boolean {
        return this.editPageState != EditPageState.add
    }


    isShowError = false;

    ngOnInit(): void {
        switch (this.editPageState) {
            case EditPageState.add:
                let { subbrId, branchName } = this.appSession.user
                this.inputModel.recorD_STATUS = RecordStatusConsts.Active;
                this.inputModel.brancH_ID = subbrId
                this.inputModel.brancH_CREATE = subbrId
                this.inputModel.brancH_NAME_CREATE = branchName
                this.appToolbar.setRole('AssLiqRequest', false, false, true, false, false, false, false, false);
                this.appToolbar.setEnableForEditPage();
                break;
            case EditPageState.edit:
                this.appToolbar.setRole('AssLiqRequest', false, false, true, false, false, false, false, false);
                this.appToolbar.setEnableForEditPage();
                this.getAssLiqRequest();
                break;
            case EditPageState.viewDetail:
                this.appToolbar.setRole('AssLiqRequest', false, false, false, false, false, false, true, false);
                this.appToolbar.setEnableForViewDetailPage();
                this.getAssLiqRequest();
                break;
        }
        this.appToolbar.setUiAction(this);
    }

    ngAfterViewInit(): void {
        this.initAssFilterInput();
        // COMMENT: this.stopAutoUpdateView();
        this.setupValidationMessage()
        this.editTable.ngForm = this.ngFormAssLiq
    }


    initIsApproveFunct() {
        this.ultilityService.isApproveFunct(this.getCurrentFunctionId()).subscribe(isApproveFunct => {
            this.isApproveFunct = isApproveFunct;
        })
    }

    initCombobox() {
        let filterCombobox = this.getFillterForCombobox();
        this.assTypeService.aSS_TYPE_Lis().subscribe(response => {
            this.assTypes = response;
            if (this.editPageState == EditPageState.add) {
                this.inputModel.asS_TYPE_ID = 'CCLD'
            }
            this.updateView()
        })

        filterCombobox.brancH_LOGIN = this.appSession.user.subbrId
        filterCombobox.top = 0
        this.termService.cM_TERM_Search(filterCombobox).subscribe(response => {
            this.terms = response.items;
            this.updateView()
        })
    }

    initAssFilterInput() {
        this.assetModal.filterInput = this.getFillterForCombobox()
    }

    downloadAssLiqRequestListExcel() {
        let reportInfo = new ReportInfo();
        reportInfo.typeExport = ReportTypeConsts.Excel;

        let curDate = moment()
        let dateFormatter = new DateFormatPipe()

        let { subbrId, branchName, name } = this.appSession.user

        let filterReport = {
            sp_BRANCH_ID: this.inputModel.brancH_ID,
            sp_BRANCH_LOGIN: subbrId,
            sp_LIQ_REQ_ID: this.inputModel.liQ_REQ_ID
        }


        reportInfo.parameters = this.GetParamsFromFilter(filterReport)
        reportInfo.values = this.GetParamsFromFilter({
            A1: this.l('CompanyReportHeader'),
            //   A4: (this.l('RequestedLiquidationSubTitle') + ' ' + this.l('To') + ' ' + dateFormatter.transform(curDate)).toUpperCase(),
            A2: (this.l('Branch') + ': ' + branchName).toUpperCase(),
            RptUserCreate: this.l("RptUserCreate", name),
            RptDateCreate: this.l("RptDateCreate", dateFormatter.transform(curDate)),
            UserName: name,
            CurrentDate: curDate
        })

        // reportInfo.pathName = "/ASS_MASTER/rpt_LIQREQ_BYID.xlsx";
        reportInfo.pathName = "/ASS_MASTER/rpt_LIQREQ_BYID_CCLD.xlsx";
        reportInfo.storeName = "rpt_LIQREQ_BYID";



        //Khach hang gui bieu mau moi
        //khangth 4/3/2020
        if (this.inputModel.asS_TYPE_ID === 'TSCD') {
            reportInfo.pathName = "/ASS_MASTER/rpt_LIQREQ_BYID_TSCD.xlsx";
            reportInfo.values.push(this.GetParamNameAndValue("A4", (this.l("ListAssLiqRequestTSCDTo", dateFormatter.transform(this.inputModel.reQ_DT)).toUpperCase())))
        } else if (this.inputModel.asS_TYPE_ID === 'CCLD') {
            reportInfo.pathName = "/ASS_MASTER/rpt_LIQREQ_BYID_CCLD.xlsx";
            reportInfo.values.push(this.GetParamNameAndValue("A4", (this.l("ListAssLiqRequestCCLDTo", dateFormatter.transform(this.inputModel.reQ_DT)).toUpperCase())))
        } else {
            reportInfo.values.push(this.GetParamNameAndValue("A4", (this.l('RequestedLiquidationSubTitle') + ' ' + this.l('To') + ' ' + dateFormatter.transform(this.inputModel.reQ_DT)).toUpperCase()))
        }


        this.asposeService.getReport(reportInfo).subscribe(x => {
            this.fileDownloadService.downloadTempFile(x);
        });
    }
    onOpenAssetModal() {
        let { subbrId } = this.appSession.user
        let { reQ_DT, brancH_ID, terM_ID, asS_TYPE_ID } = this.inputModel
        this.assetModal.filterInput.brancH_LOGIN = subbrId;
        this.assetModal.filterInput.usE_DATE = reQ_DT
        this.assetModal.filterInput.brancH_ID = brancH_ID
        this.assetModal.filterInput.typE_ID = asS_TYPE_ID

        let termId = this.isNull(terM_ID) ? '' : terM_ID
        this.assetModal.filterInput.location = 'DXTL' + termId
        this.assetModal.show()
    }

    onOpenBranchModal() {
        this.branchModal.filterInput.top = 300
        this.branchModal.filterInput.brancH_LOGIN = this.appSession.user.subbrId
        this.branchModal.show()
    }

    onSelectBranch(branch: CM_BRANCH_ENTITY) {
        this.inputModel.brancH_ID = branch.brancH_ID
        this.inputModel.brancH_CODE = branch.brancH_CODE
        this.inputModel.brancH_NAME = branch.brancH_NAME
    }

    onBranchFocusOut() {
        if (!this.inputModel.brancH_CODE) {
            this.onSelectBranch({} as CM_BRANCH_ENTITY)
        }
    }
    onSelectAssets(items: ASS_MASTER_ENTITY[]) {
        if (items) {
            if (!this.editTable.allData) {
                this.editTable.setList(items)
            } else {
                items.forEach(item => {
                    if (!this.editTable.allData.some(liq => liq.asseT_ID == item.asseT_ID))
                        this.editTable.pushItem(this.getItemLiqReqDt(item))
                })
            }

            this.updateView();
        }

    }

    private getItemLiqReqDt(ass: ASS_MASTER_ENTITY) {
        if (!ass) return null
        let detailItem = new ASS_LIQ_REQUEST_DT_ENTITY();
        detailItem.asseT_ID = ass.asseT_ID
        detailItem.asseT_CODE = ass.asseT_CODE

        detailItem.brancH_USE = ass.brancH_ID
        detailItem.depT_USE = ass.depT_ID
        detailItem.remaiN_VALUE = ass.remaiN_AMORTIZED_AMT
        detailItem.iS_IMP = 'N'

        detailItem.reQ_AMT = 0
        detailItem.asseT_NAME = ass.asseT_NAME
        detailItem.asseT_SERIAL_NO = ass.asseT_SERIAL_NO
        detailItem.asS_STATUS_NAME = ass.asS_STATUS_NAME
        detailItem.usE_DATE = ass.usE_DATE
        detailItem.brancH_USE_NAME = ass.brancH_NAME
        detailItem.depT_USE_NAME = ass.deP_NAME
        detailItem.buY_PRICE = ass.buY_PRICE

        return detailItem;
    }

    onImportAssLiquidation(rows: any) {
        let curItems = !this.inputModel.assLiqRequestDetails ? [] : this.inputModel.assLiqRequestDetails;
        let arr = this.xlsRowsToArr(rows, this.xlsStructure, function (obj: ASS_LIQ_REQUEST_DT_ENTITY) {
            if (!obj.asseT_NAME || !obj.no || obj.buY_PRICE && obj.buY_PRICE < 0 || !obj.usE_DATE
                || obj.remaiN_VALUE && obj.remaiN_VALUE < 0 || obj.reQ_AMT
                && obj.reQ_AMT < 0) {
                return null;
            }
            curItems.forEach(item => {
                if (item.asseT_CODE == obj.asseT_CODE) {
                    return null;
                }
            })
            return obj;
        })

        this.inputModel.assLiqRequestDetails = arr
        this.editTable.setList(this.inputModel.assLiqRequestDetails);
        this.updateView()
    }

    getAssLiqRequest() {
        this.assLiqRequestService.aSS_LIQ_REQUEST_ById(this.inputModel.liQ_REQ_ID).subscribe(response => {
            this.inputModel = response;
            this.editTable.setList(this.inputModel.assLiqRequestDetails);
            if (this.inputModel.autH_STATUS == AuthStatusConsts.Approve) {
                this.setPageStateToApprove()
            }
            this.updateView()
        });
    }

    addNew() {
        this.assLiqRequestService.aSS_LIQ_REQUEST_Ins(this.inputModel).pipe(finalize(() => { this.saving = false; }))
            .subscribe((response) => {
                if (response["Result"] != '0') {
                    this.showErrorMessage(response['ErrorDesc']);
                }
                else {
                    this.showSuccessMessage(this.l('InsertSuccessful'));
                    if (!this.isApproveFunct) {
                        this.assLiqRequestService.aSS_LIQ_REQUEST_App(response.id, this.appSession.user.userName)
                            .pipe(finalize(() => { this.saving = false; }))
                            .subscribe((response) => {
                                if (response["Result"] != '0') {
                                    this.showErrorMessage(response['ErrorDesc']);
                                } else {
                                    this.inputModel.autH_STATUS = AuthStatusConsts.Approve;
                                    this.appToolbar.setButtonApproveEnable(false);
                                    this.appToolbar.setButtonSaveEnable(false);
                                }
                                this.updateView()
                            });
                    }
                    this.updateView()
                }
            });
    }

    update() {
        this.assLiqRequestService.aSS_LIQ_REQUEST_Upd(this.inputModel).pipe(finalize(() => { this.saving = false; }))
            .subscribe((response) => {
                if (response["Result"] != '0') {
                    this.showErrorMessage(response['ErrorDesc']);
                }
                else {
                    this.showSuccessMessage(this.l('UpdateSuccessful'));
                    if (!this.isApproveFunct) {
                        this.assLiqRequestService.aSS_LIQ_REQUEST_App(this.inputModel.liQ_REQ_ID, this.appSession.user.userName)
                            .pipe(finalize(() => { this.saving = false; }))
                            .subscribe((response) => {
                                if (response["Result"] != '0') {
                                    this.showErrorMessage(response['ErrorDesc']);
                                }
                                else {
                                    this.inputModel.autH_STATUS = AuthStatusConsts.Approve;
                                    this.appToolbar.setButtonApproveEnable(false);
                                    this.appToolbar.setButtonSaveEnable(false);
                                }
                                this.updateView()
                            });
                    }
                    else {
                        this.inputModel.autH_STATUS = AuthStatusConsts.NotApprove;
                    }
                    this.updateView()
                }
            });
    }

    saveInput() {
        if (this.isApproveFunct == undefined) {
            this.showErrorMessage(this.l('PageLoadUndone'));
            return;
        }

        if ((this.editForm as any).form.invalid) {
            this.isShowError = true;
            this.showErrorMessage(this.l('FormInvalid'));
            this.updateView()
            return;
        }

        const validMessage = this.editTable.getValidationMessage()
        if (validMessage) {
            this.isShowError = true;
            this.showErrorMessage(validMessage);
            this.updateView()
            return;
        }

        let errorMessage = this.isValid()
        if (errorMessage != '') {
            this.isShowError = true;
            this.showErrorMessage(this.l(errorMessage));
            this.updateView();
            return;
        }

        if (this.editPageState != EditPageState.viewDetail) {
            this.saving = true;
            this.inputModel.makeR_ID = this.appSession.user.userName;
            this.inputModel.assLiqRequestDetails = this.editTable.allData

            if (!this.inputModel.liQ_REQ_ID) {
                this.addNew();
            }
            else {
                this.update();
            }
        }
    }

    goBack() {
        this.navigatePassParam('/app/admin/ass-liq-request', null, { filterInput: JSON.stringify(this.filterInput) });
    }

    onAdd(): void {
    }

    onUpdate(item: ASS_LIQ_REQUEST_ENTITY): void {
    }

    onDelete(item: ASS_LIQ_REQUEST_ENTITY): void {
    }

    onApprove(item: ASS_LIQ_REQUEST_ENTITY): void {
        if (!this.inputModel.liQ_REQ_ID) {
            return;
        }
        var currentUserName = this.appSession.user.userName;
        if (currentUserName == this.inputModel.makeR_ID) {
            this.showErrorMessage(this.l('ApproveFailed'));
            return;
        }

        let errorMessage = this.isValid()
        if (errorMessage != '') {
            this.isShowError = true;
            this.showErrorMessage(this.l(errorMessage));
            this.updateView();
            return;
        }

        this.message.confirm(
            this.l('ApproveWarningMessage', this.l(this.inputModel.liQ_REQ_ID)),
            this.l('AreYouSure'),
            (isConfirmed) => {
                if (isConfirmed) {
                    this.saving = true;
                    this.assLiqRequestService.aSS_LIQ_REQUEST_App(this.inputModel.liQ_REQ_ID, currentUserName)
                        .pipe(finalize(() => { this.saving = false; }))
                        .subscribe((response) => {
                            if (response["Result"] != '0') {
                                this.showErrorMessage(response['ErrorDesc']);
                            }
                            else {
                                this.showSuccessMessage(this.l('SuccessfullyApprove'));
                                this.inputModel.autH_STATUS = AuthStatusConsts.Approve;
                                this.appToolbar.setButtonApproveEnable(false);
                                this.appToolbar.setButtonSaveEnable(false);
                            }
                            this.updateView()
                        });
                }
            }
        );
    }

    onViewDetail(item: ASS_LIQ_REQUEST_ENTITY): void {
    }

    onSave(): void {
        this.saveInput();
    }

    onSearch(): void {
    }

    onResetSearch(): void {
    }

    private isValid() {
        let errorMessage = ''
        try {
            //valid here
            if (!this.editTable.allData || this.editTable.allData && this.editTable.allData.length == 0) {
                errorMessage = 'AssLiquidationRequireInvalid'
            }
        } catch{
            errorMessage = 'ValidException'
        }

        return errorMessage
    }
}
