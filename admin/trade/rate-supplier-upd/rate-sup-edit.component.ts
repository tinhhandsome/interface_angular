import { Component, ViewEncapsulation, OnInit, Injector, ViewChild, ElementRef, AfterViewInit } from "@angular/core";

import { appModuleAnimation } from "@shared/animations/routerTransition";

import { DefaultComponentBase } from "@app/ultilities/default-component-base";

import { IUiAction } from "@app/ultilities/ui-action";

import { RAT_SUP_RATING_ENTITY, UltilityServiceProxy, RateSupplierServiceProxy, RAT_SUP_RATING_DT_ENTITY, CM_RATING_ENTITY, AsposeServiceProxy, ReportInfo } from "@shared/service-proxies/service-proxies";

import { EditableTableComponent } from "@app/admin/core/controls/editable-table/editable-table.component";

import { EditPageState } from "@app/ultilities/enum/edit-page-state";

import { ToolbarRejectExtComponent } from "@app/admin/core/controls/toolbar-reject-ext/toolbar-reject-ext.component";

import { finalize } from "rxjs/operators";

import { AuthStatusConsts } from "@app/admin/core/ultils/consts/AuthStatusConsts";
import { ReportTypeConsts } from "@app/admin/core/ultils/consts/ReportTypeConsts";
import { FileDownloadService } from "@shared/utils/file-download.service";
import { NgForm } from "@angular/forms";


@Component({
    templateUrl: './rate-sup-edit.component.html',
    encapsulation: ViewEncapsulation.None,
    animations: [appModuleAnimation()]
})
export class RateSupEditComponent extends DefaultComponentBase implements OnInit, AfterViewInit, IUiAction<RAT_SUP_RATING_DT_ENTITY> {


    constructor(
        injector: Injector,
        private ultilityService: UltilityServiceProxy,
        private rateSupService: RateSupplierServiceProxy,
        private asposeService: AsposeServiceProxy,
        private fileDownloadService: FileDownloadService,

    ) {
        super(injector);
        // console.log(this)
        this.initFilter();
        this.initCombobox();
        this.initIsApproveFunct();
        // COMMENT: this.stopAutoUpdateView();

    }

    @ViewChild('editForm') editForm: NgForm;

    @ViewChild('ngFormSupDetail') ngFormSupDetail: NgForm;
    @ViewChild('ngFormSupDetail2') ngFormSupDetail2: NgForm;

    @ViewChild('editTableRateSupDetail') editTableRateSupDetail: EditableTableComponent<RAT_SUP_RATING_DT_ENTITY>;
    @ViewChild('editTableRateSupDetail2') editTableRateSupDetail2: EditableTableComponent<RAT_SUP_RATING_DT_ENTITY>;

    EditPageState = EditPageState;
    editPageState: EditPageState;

    ratSups: RAT_SUP_RATING_ENTITY[];
    cm_Rating: CM_RATING_ENTITY[];
    inputModel: RAT_SUP_RATING_ENTITY = new RAT_SUP_RATING_ENTITY();

    isApproveFunct: boolean;

    isShowError = false;


    get apptoolbar(): ToolbarRejectExtComponent {
        return this.appToolbar as ToolbarRejectExtComponent;
    }



    ngOnInit(): void {
        // set ui action
        this.appToolbar.setUiAction(this);
        // set role toolbar
        // this.appToolbar.setEnableForListPage();
        this.appToolbar.setRole('RateSupplierUpdateSupplierEdit', false, false, true, false, false, false, true, true);
        this.appToolbar.setEnableForEditPage()
        this.getRateSup();

    }

    ngAfterViewInit(): void {
        this.editTableRateSupDetail.ngForm = this.ngFormSupDetail;
        this.editTableRateSupDetail2.ngForm = this.ngFormSupDetail2
        this.editTableRateSupDetail2.tableState = this.editTableRateSupDetail.tableState
        //COMMENT: this.stopAutoUpdateView()
        this.setupValidationMessage()
    }

    initIsApproveFunct() {
        this.ultilityService.isApproveFunct(this.getCurrentFunctionId()).subscribe(isApproveFunct => {
            this.isApproveFunct = isApproveFunct;
        })
    }

    initCombobox() {

    }

    getRateSup() {
        try {
            let filter = this.getFillterForCombobox();
            filter.LEVEL = 'ALL';
            this.rateSupService.rATE_SUP_RATING_Search(filter).subscribe(response => {
                if (!response) this.goBack()
                this.ratSups = response.items;
                this.updateView();

            });

            let ratingEntity = new CM_RATING_ENTITY();

            ratingEntity.level = 'ALL';
            ratingEntity.brancH_LOGIN = this.appSession.user.subbrId;
            ratingEntity.top = 100;

            this.rateSupService.cM_RATING_Search(ratingEntity).subscribe(response => {
                this.cm_Rating = response;
                this.updateView();

            });
        } catch{
            this.goBack()
        }
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

        let validMessage = this.editTableRateSupDetail.getValidationMessage()
        if (validMessage) {
            this.isShowError = true;
            this.showErrorMessage(this.l("RateList") + ' ' + validMessage);
            this.updateView()
            return;
        }

        validMessage = this.editTableRateSupDetail2.getValidationMessage()
        if (validMessage) {
            this.isShowError = true;
            this.showErrorMessage(validMessage);
            return;
        }
        // validMessage = this.validationEditable();
        // if (validMessage) {
        //     this.isShowError = true;
        //     this.showErrorMessage(validMessage);
        //     return;
        // }
        this.inputModel.creatE_DT = this.inputModel.inpuT_DT;
        this.inputModel.brancH_LOGIN = this.appSession.user.subbrId;

        if (this.inputModel.raT_ID) {

            this.saving = true;
            this.inputModel.makeR_ID = this.appSession.user.userName;
            this.inputModel.raT_SUP_DTs = this.editTableRateSupDetail.allData;
            this.inputModel.brancH_ID = this.appSession.user.subbrId;
            this.inputModel.brancH_LOGIN = this.appSession.user.subbrId;

            this.updateRateSup();
            this.updateView();
        }
    }

    private updateRateSup() {
        this.rateSupService.rATE_SUP_RATING_Upd(this.inputModel).pipe(finalize(() => { this.saving = false; }))
            .subscribe((response) => {
                if (response['Result'] != '0') {
                    this.showErrorMessage(response.errorDesc);
                }
                else {
                    this.showSuccessMessage(this.l('UpdateSuccessful'));
                    if (!this.isApproveFunct) {
                        this.rateSupService.rATE_SUP_RATING_App(this.inputModel.raT_ID, this.appSession.user.userName, this.editTableRateSupDetail.allData[0].brancH_ID)
                            .pipe(finalize(() => { this.saving = false; }))
                            .subscribe((response) => {
                                if (response['Result'] != '0') {
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
            });
    }


    goBack() {
    }

    onAdd(): void {
    }

    onUpdate(item: RAT_SUP_RATING_DT_ENTITY): void {
    }

    onDelete(item: RAT_SUP_RATING_DT_ENTITY): void {
    }

    onApprove(item: RAT_SUP_RATING_DT_ENTITY): void {

        if (!this.inputModel.autH_STATUS) {
            this.showErrorMessage(this.l('ApproveFailed'));
            return;
        }

        var currentUserName = this.appSession.user.userName;
        if (currentUserName == this.inputModel.makeR_ID) {
            this.showErrorMessage(this.l('ApproveFailed'));
            return;
        }

        this.message.confirm(
            this.l('ApproveWarningMessage', this.l(this.inputModel.ratE_TERM)),
            this.l('AreYouSure'),
            (isConfirmed) => {
                if (isConfirmed) {
                    this.saving = true;
                    this.rateSupService.rATE_SUP_RATING_App(this.inputModel.raT_ID, currentUserName, this.editTableRateSupDetail.allData[0].brancH_ID)
                        .pipe(finalize(() => { this.saving = false; }))
                        .subscribe((response) => {
                            if (response['Result'] != '0') {
                                this.showErrorMessage(response.errorDesc);
                            }
                            else {
                                this.showSuccessMessage(this.l('SuccessfullyApprove'));
                                this.inputModel.autH_STATUS = AuthStatusConsts.Approve;
                            }
                            this.updateView();
                        });
                    this.updateView();
                }
            }
        );
    }

    onViewDetail(item: RAT_SUP_RATING_DT_ENTITY): void {
    }

    onSave(): void {
        this.saveInput();
    }

    onSearch(): void {
    }

    onResetSearch(): void {
        this.getRateSup();
    }

    onReturn() {
    }

    private updateQualityRateName() {
        var cmRating = this.cm_Rating;
        this.editTableRateSupDetail.allData.forEach(function (x) {
            cmRating.forEach(y => {
                if (x.m_QUALITY >= y.froM_POINT && x.m_QUALITY < y.tO_POINT) {
                    x.m_QUALITYRATE_NAME = y.ratinG_NAME;
                    x.m_QUALITY_RATE = y.ratinG_ID;
                }
            });
        })
    }
    private updateOnTimeRateName() {
        var cmRating = this.cm_Rating;
        this.editTableRateSupDetail.allData.forEach(function (x) {
            cmRating.forEach(y => {
                if (x.m_ONTIME >= y.froM_POINT && x.m_ONTIME < y.tO_POINT) {
                    x.m_ONTIMERATE_NAME = y.ratinG_NAME;
                    x.m_ONTIME_RATE = y.ratinG_ID;
                }
            });
        })
    }
    private updateWarrantyRateName() {
        var cmRating = this.cm_Rating;
        this.editTableRateSupDetail.allData.forEach(function (x) {
            cmRating.forEach(y => {
                if (x.m_WARRANTY >= y.froM_POINT && x.m_WARRANTY < y.tO_POINT) {
                    x.m_WARRANTYRATE_NAME = y.ratinG_NAME;
                    x.m_WARRANTY_RATE = y.ratinG_ID;
                }
            });
        })
    }
    private updateCompliantRateName() {
        var cmRating = this.cm_Rating;
        this.editTableRateSupDetail.allData.forEach(function (x) {
            cmRating.forEach(y => {
                if (x.m_COMPLIANT >= y.froM_POINT && x.m_COMPLIANT < y.tO_POINT) {
                    x.m_COMPLIANTRATE_NAME = y.ratinG_NAME;
                    x.m_COMPLIANT_RATE = y.ratinG_ID;
                }
            });
        })
    }

    reloadQualityRateName(item: RAT_SUP_RATING_DT_ENTITY, event) {
        this.valueInRange2(item, 'm_QUALITY', event.target);
        this.updateQualityRateName();
        this.updateView();
    }
    reloadOntimeRateName(item: RAT_SUP_RATING_DT_ENTITY, event) {
        this.valueInRange2(item, 'm_ONTIME', event.target);
        this.updateOnTimeRateName();
        this.updateView();
    }
    reloadWarrantyRateName(item: RAT_SUP_RATING_DT_ENTITY, event) {
        this.valueInRange2(item, 'm_WARRANTY', event.target);
        this.updateWarrantyRateName();
        this.updateView();
    }
    reloadCompliantRateName(item: RAT_SUP_RATING_DT_ENTITY, event) {
        this.valueInRange2(item, 'm_COMPLIANT', event.target);
        this.updateCompliantRateName();
        this.updateView();
    }
    rateSupSelectChange(event: RAT_SUP_RATING_ENTITY) {
        this.inputModel = Object.assign({}, event);
        this.rateSupService.rAT_SUP_RATING_DT_ById(this.inputModel.raT_ID, this.appSession.user.subbrId).subscribe(response => {
            if (response.length > 0) {
                // this.inputModel.raT_SUP_DTs = response;
                this.inputModel.autH_STATUS = response[0].autH_STATUS;
                this.inputModel.autH_STATUS_NAME = response[0].autH_STATUS_NAME;
                this.inputModel.makeR_ID = response[0].makeR_ID;

            }
            this.editTableRateSupDetail.setList(response);
            this.editTableRateSupDetail2.setList(this.editTableRateSupDetail.allData);

            if (!this.inputModel.autH_STATUS || this.inputModel.autH_STATUS == AuthStatusConsts.Approve) {
                this.appToolbar.setButtonApproveEnable(false);
            }
            else {
                this.appToolbar.setButtonApproveEnable(true);

            }
            this.updateView();
        });
    }
    exportToExcel() {
        let reportInfo = new ReportInfo();
        reportInfo.typeExport = ReportTypeConsts.Excel;
        reportInfo.parameters = [];
        reportInfo.parameters.push(this.GetParamNameAndValue("RAT_ID", this.inputModel.raT_ID));
        reportInfo.parameters.push(this.GetParamNameAndValue("BRANCH_ID", this.inputModel.brancH_ID));
        reportInfo.parameters.push(this.GetParamNameAndValue("RATE_TERM", this.inputModel.ratE_TERM));
        reportInfo.parameters.push(this.GetParamNameAndValue("FROM_DT", this.inputModel.froM_DT));
        reportInfo.parameters.push(this.GetParamNameAndValue("TO_DT", this.inputModel.tO_DT));
        reportInfo.parameters.push(this.GetParamNameAndValue("BRANCH_LOGIN", this.appSession.user.subbrId));

        reportInfo.values = [];
        reportInfo.values.push(this.GetParamNameAndValue("BranchName", this.appSession.user.branchName));
        reportInfo.values.push(this.GetParamNameAndValue("RateTerm", this.inputModel.ratE_TERM));

        // reportInfo.parameters = this.GetParamsFromFilter(filterReport)

        reportInfo.pathName = "/TRADE/DANHGIA_NCC_DV.xlsx";
        reportInfo.storeName = "rpt_RAT_SUP_RATING";

        this.asposeService.getReport(reportInfo).subscribe(x => {
            this.fileDownloadService.downloadTempFile(x);
        });
    }
    validationEditable(): string {
        for (var i = 0; i < this.editTableRateSupDetail.allData.length; i++) {
            if ((this.editTableRateSupDetail.allData[i].m_ONTIME < 5 || this.editTableRateSupDetail.allData[i].m_QUALITY < 5 || this.editTableRateSupDetail.allData[i].m_WARRANTY < 5 || this.editTableRateSupDetail.allData[i].m_COMPLIANT < 5) && !this.editTableRateSupDetail.allData[i].notes) {
                return this.l("Line") + ' ' + (i + 1) + ': ' + this.l('Note') + ' ' + this.l('ValidationRequired');
            }
        }
        return null;
    }
}
