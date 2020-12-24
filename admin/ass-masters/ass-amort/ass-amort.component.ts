import { DateTimeService } from '@app/shared/common/timing/date-time.service';
import { Component, Injector, ViewChild, Output, EventEmitter, OnInit, ViewEncapsulation, ElementRef, AfterViewInit } from '@angular/core';
import { appModuleAnimation } from '@shared/animations/routerTransition';
import * as _ from 'lodash';
import * as moment from 'moment'
import { AssAmortServiceProxy, ASS_AMORT_ENTITY, ASS_PENDING_ITEM_ENTITY, ReportInfo, ASS_AMORT_DT_ENTITY, UltilityServiceProxy, AsposeServiceProxy } from '@shared/service-proxies/service-proxies';
import { EditPageState } from '@app/ultilities/enum/edit-page-state';
import { finalize } from 'rxjs/operators';
import { DefaultComponentBase } from '@app/ultilities/default-component-base';
import { IUiAction } from '@app/ultilities/ui-action';
import { AuthStatusConsts } from '@app/admin/core/ultils/consts/AuthStatusConsts';
import { RecordStatusConsts } from '@app/admin/core/ultils/consts/RecordStatusConsts';
import { EditableTableComponent } from '@app/admin/core/controls/editable-table/editable-table.component';
import { FileDownloadService } from '@shared/utils/file-download.service';
import { ReportTypeConsts } from '@app/admin/core/ultils/consts/ReportTypeConsts';
import { NgForm } from '@angular/forms';
import { TermFormatPipe } from '@app/admin/core/pipes/term-format.pipe';

@Component({
    templateUrl: './ass-amort.component.html',
    encapsulation: ViewEncapsulation.None,
    animations: [appModuleAnimation()]
})

export class AssAmortComponent extends DefaultComponentBase implements OnInit, AfterViewInit, IUiAction<ASS_AMORT_ENTITY> {

    constructor(
        injector: Injector,
        private dateTimeService: DateTimeService,
        private fileDownloadService: FileDownloadService,
        private asposeService: AsposeServiceProxy,
        private ultilityService: UltilityServiceProxy,
        private assAmortService: AssAmortServiceProxy
    ) {
        super(injector);

        this.initFilter();
        console.log(this)

    }


    @ViewChild('editTable') editTable: EditableTableComponent<ASS_PENDING_ITEM_ENTITY>;
    @ViewChild('editTable2') editTable2: EditableTableComponent<ASS_AMORT_DT_ENTITY>;
    @ViewChild('editForm') editForm: NgForm

    EditPageState = EditPageState;
    editPageState: EditPageState;

    filterInput: ASS_AMORT_ENTITY = new ASS_AMORT_ENTITY()
    isApproveFunct: boolean;

    isShowUnApproveAssets: boolean = false
    isShowApproveAssets: boolean = false



    get disableInput(): boolean {
        return this.editPageState == EditPageState.viewDetail;
    }

    isShowError = false;

    initDefaultFilter() {

    }

    ngOnInit(): void {
        this.appToolbar.setUiAction(this);
        // set role toolbar
        this.appToolbar.setRole('AssAmort', false, false, false, false, false, false, false, false);
        this.appToolbar.isList = true
        this.appToolbar.setEnable(false)
        this.filterInput.executE_DATE = moment()
        this.filterInput.amorT_TERM = moment().format("M") + "/" + moment().format("Y")
        this.getAssAmortPendingByMonth()
    }

    ngAfterViewInit(): void {
        this.setupValidationMessage()
    }

    initIsApproveFunct() {
        this.ultilityService.isApproveFunct(this.getCurrentFunctionId()).subscribe(isApproveFunct => {
            this.isApproveFunct = isApproveFunct;
        })
    }

    initCombobox() {

    }

    downloadAssAmortExcel() {
        let reportInfo = new ReportInfo();
        reportInfo.typeExport = ReportTypeConsts.Excel;

        let filterReport = { ...this.filterInput }
        filterReport.maxResultCount = -1;

        reportInfo.parameters = this.GetParamsFromFilter(filterReport)

        reportInfo.pathName = "/ASS_MASTER/rpt-ass-amort.xlsx";
        reportInfo.storeName = "ASS_AMORT_Lst";

        this.asposeService.getReport(reportInfo).subscribe(x => {
            this.fileDownloadService.downloadTempFile(x);
        });
    }

    getAssAmortPendingByMonth() {
        let input = this.filterInput
        this.setDefaultInputParam(input)
        this.assAmortService.aSS_AMORT_Pending(input).pipe(finalize(() => { this.saving = false; }))
            .subscribe((response) => {
                let term = this.filterInput.amorT_TERM
                this.filterInput = response
                if (response.result != '0') {

                } else if (this.filterInput.result == '0') {
                    if (!this.isNull(this.filterInput.assetAmortDetails)
                        && this.filterInput.assetAmortDetails.length > 0) {

                        this.isShowApproveAssets = true
                        this.editTable2.setList(this.filterInput.assetAmortDetails)
                    }
                }
                this.filterInput.executE_DATE = moment()
                this.filterInput.amorT_TERM = term
                this.updateView()
            });
    }

    executeAssAmort() {
        this.message.confirm(
            this.l('Execute') + ' ' + this.l('AmortTerm'),
            this.l('AreYouSure'),
            (isConfirmed) => {
                if (isConfirmed) {
                    this.assAmortService.aSS_AMORT_Start(this.filterInput).pipe(finalize(() => { this.saving = false; }))
                        .subscribe((response) => {
                            if (response["Result"] != '0') {
                                this.showErrorMessage(response["ErrorDesc"]);
                            } else {
                                this.showSuccessMessage(this.l('Execute') + ' ' + this.l('Success').toLowerCase());
                            }
                            this.updateView()
                        });
                }
            }
        );
    }

    createAssAmortDo() {
        this.message.confirm(
            this.l('Create') + ' ' + this.l('AmortTerm'),
            this.l('AreYouSure'),
            (isConfirmed) => {
                if (isConfirmed) {
                    let input = this.filterInput
                    this.setDefaultInputParam(input)
                    this.assAmortService.aSS_AMORT_Do(input).pipe(finalize(() => { this.saving = false; }))
                        .subscribe((response) => {
                            let term =this.filterInput.amorT_TERM
                            this.filterInput = response
                            if (response.result != '0') {
                                if (!this.isNull(this.filterInput.assetPendingItems) && this.filterInput.assetPendingItems.length > 0) {
                                    this.isShowUnApproveAssets = true
                                    this.filterInput.executE_DATE = moment()
                                    this.filterInput.amorT_TERM = term
                                    this.editTable.setList(this.filterInput.assetPendingItems)
                                }
                                this.showErrorMessage(response.errorDesc);

                            } else if (this.filterInput.result == '0') {
                                if (!this.isNull(this.filterInput.assetAmortDetails)) {
                                    this.isShowApproveAssets = true
                                    this.editTable2.setList(this.filterInput.assetAmortDetails)
                                }
                                this.showSuccessMessage(this.l('InsertSuccessful'));
                            }
                            this.filterInput.executE_DATE = moment()
                            this.updateView()
                        });

                }
            }
        );

    }

    getTermValue(value: string) {
        this.editForm.controls["amorT_TERM"].setValue(this.dateTimeService.getTermValue(value))
    }

    goBack() {
        this.navigatePassParam('/app/admin/ass-amort', null, { filterInput: JSON.stringify(this.filterInput) });
    }

    onAdd(): void {
    }

    onUpdate(item: ASS_AMORT_ENTITY): void {
    }

    onDelete(item: ASS_AMORT_ENTITY): void {
    }

    onApprove(item: ASS_AMORT_ENTITY): void {
    }

    onViewDetail(item: ASS_AMORT_ENTITY): void {
    }

    onSave(): void {

    }

    onSearch(): void {
    }

    onResetSearch(): void {
    }

    setDefaultInputParam(filter) {
        this.isShowUnApproveAssets = false
        this.isShowApproveAssets = false

        let date = moment()
        let month = date.format('M')
        let year = date.format('Y')

        filter.executE_DATE = moment()
        filter.makeR_ID = this.appSession.user.userName;
        filter.checkeR_ID = this.appSession.user.userName;
        filter.brancH_ID = this.appSession.user.subbrId;
        filter.asseT_TYPE = 'TSCD'
        filter.amorT_TERM = `${month}/${year}`
    }

    deleteAssAmortDo() {
        if ((this.editForm as any).form.invalid) {
            this.isShowError = true;
            this.showErrorMessage(this.l('FormInvalid'));
            this.updateView()
            return;
        }

        this.message.confirm(
            this.l('Delete') + ' ' + this.l('AmortTerm'),
            this.l('AreYouSure'),
            (isConfirmed) => {
                if (isConfirmed) {
                    this.assAmortService.aSS_AMORT_Delete(this.filterInput.amorT_TERM).pipe(finalize(() => { this.saving = false; }))
                        .subscribe((response) => {
                            if (response["Result"] != '0') {
                                this.showErrorMessage(response["ErrorDesc"]);
                            } else {
                                this.showSuccessMessage(this.l('Delete') + ' ' + this.l('Success'));
                                this.getAssAmortPendingByMonth();
                            }
                            this.updateView()
                        });
                }
            }
        );
    }
}
