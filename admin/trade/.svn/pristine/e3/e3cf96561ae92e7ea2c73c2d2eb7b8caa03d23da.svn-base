import { Injector, Component, OnInit, ViewEncapsulation, AfterViewInit, ViewChild, ElementRef } from "@angular/core";
import { ReportInfo, AsposeServiceProxy, RatTermMasterServiceProxy, RAT_TERM_MASTER_ENTITY, } from "@shared/service-proxies/service-proxies";
import { appModuleAnimation } from "@shared/animations/routerTransition";
import { FileDownloadService } from "@shared/utils/file-download.service";
import { ReportTypeConsts } from "@app/admin/core/ultils/consts/ReportTypeConsts";
import { DefaultComponentBase } from "@app/ultilities/default-component-base";
import { IUiAction } from "@app/ultilities/ui-action";

@Component({
    templateUrl: './rate-supplier-report-status.component.html',
    encapsulation: ViewEncapsulation.None,
    animations: [appModuleAnimation()]
})

export class RatSupReportStatus extends DefaultComponentBase implements OnInit, AfterViewInit, IUiAction<RAT_TERM_MASTER_ENTITY>  {
    isShowError: boolean = false;
    @ViewChild('reportForm') reportForm: ElementRef;

    onAdd(): void {
    }
    onUpdate(item: RAT_TERM_MASTER_ENTITY): void {
    }
    onDelete(item: RAT_TERM_MASTER_ENTITY): void {
    }
    onApprove(item: RAT_TERM_MASTER_ENTITY): void {
    }
    onViewDetail(item: RAT_TERM_MASTER_ENTITY): void {
    }
    onSave(): void {
    }
    onSearch(): void {
    }
    onResetSearch(): void {
    }
    ngAfterViewInit(): void {
        this.updateView();
    }

    ratTermMaster: RAT_TERM_MASTER_ENTITY[];
    inputModel: RAT_TERM_MASTER_ENTITY = new RAT_TERM_MASTER_ENTITY();
    constructor(injector: Injector,
        private fileDownloadService: FileDownloadService,
        private asposeService: AsposeServiceProxy,
        private ratTermMasterService: RatTermMasterServiceProxy) {
        super(injector);
        this.initFilter();
        // COMMENT: this.stopAutoUpdateView();
    }

    initFilter() {

    }

    ngOnInit(): void {
        // this.appToolbar.setRole('RatReport', false, false, false, false, false, false, false, false);
        // this.appToolbar.setEnableForEditPage();
        this.getRateTermMaster();
        // this.appToolbar.setUiAction(this);

    }

    getRateTermMaster() {
        this.ratTermMasterService.rAT_TERM_MASTER_Search(this.getFillterForCombobox()).subscribe(response => {
            if (response) {
                this.ratTermMaster = response.items;
                this.updateView();

            }
        });


    }

    exportToExcel() {
        if ((this.reportForm as any).form.invalid) {
            this.isShowError = true;
            this.showErrorMessage(this.l('FormInvalid'));
            this.updateView();
            return;
        }
        let reportInfo = new ReportInfo();
        reportInfo.typeExport = ReportTypeConsts.Excel;

        let filterReport = { ...this.inputModel }
        filterReport.maxResultCount = -1;

        reportInfo.parameters = [];

        reportInfo.parameters.push(this.GetParamNameAndValue("p_RAT_ID", filterReport.raT_ID));
        reportInfo.parameters.push(this.GetParamNameAndValue("p_RATE_TERM", filterReport.ratE_TERM));
        reportInfo.parameters.push(this.GetParamNameAndValue("p_FROM_DT", filterReport.froM_DT));
        reportInfo.parameters.push(this.GetParamNameAndValue("p_TO_DT", filterReport.tO_DT));
        reportInfo.parameters.push(this.GetParamNameAndValue("p_BRANCH_LOGIN", this.appSession.user.subbrId));

        reportInfo.values = [];
        reportInfo.values.push(this.GetParamNameAndValue("RateTerm", filterReport.ratE_TERM));

        reportInfo.pathName = "/TRADE/RAT_SUP_ALL_BRANCH.xlsx";
        reportInfo.storeName = "rpt_RAT_TERM_MASTER_STATUS";

        this.asposeService.getReport(reportInfo).subscribe(x => {
            this.fileDownloadService.downloadTempFile(x);
            this.showSuccessMessage(this.l('ExportFileSuccess'));
        });
        this.isShowError = false;

        this.removeMessage();
    }

    onChangeSelect(event) {

        this.ratTermMasterService.rAT_TERM_MASTER_ById(this.inputModel.raT_ID).subscribe(response => {
           this.inputModel = response;
           this.updateView();

        });        
    }

}
