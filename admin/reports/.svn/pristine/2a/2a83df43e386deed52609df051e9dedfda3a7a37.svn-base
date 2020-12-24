import { Injector, Component, OnInit, ViewEncapsulation, AfterViewInit, ElementRef, ViewChild } from "@angular/core";
import { ReportInfo, AsposeServiceProxy, CM_DEPARTMENT_ENTITY, BranchServiceProxy, CM_BRANCH_ENTITY, CM_DIVISION_ENTITY, DepartmentServiceProxy } from "@shared/service-proxies/service-proxies";
import { appModuleAnimation } from "@shared/animations/routerTransition";
import { FileDownloadService } from "@shared/utils/file-download.service";
import { ReportTypeConsts } from "@app/admin/core/ultils/consts/ReportTypeConsts";
import { DefaultComponentBase } from "@app/ultilities/default-component-base";
import { PreviewTemplateService } from "@app/admin/common/preview-template/preview-template.service";
import * as moment from 'moment';
import { DateFormatPipe } from "@app/admin/core/pipes/date-format.pipe";
import { ReportTemplateModalComponent } from "@app/admin/core/controls/report-template-modal/report-template-modal.component";

@Component({
    templateUrl: './pl-po-contract.component.html',
    encapsulation: ViewEncapsulation.None,
    animations: [appModuleAnimation()]
})

export class PlPoContractComponent extends DefaultComponentBase implements OnInit, AfterViewInit {

    hidden: boolean = false;

    filterInput: any = {};

    levels: any[];
    currentBranchIdField: string;
    currentBranchNameField: string;

    @ViewChild('reportTemplate') reportTemplate : ReportTemplateModalComponent;

    ngAfterViewInit(): void {
        this.setupValidationMessage();
        this.updateView();
    }

    constructor(injector: Injector,
        private fileDownloadService: FileDownloadService,
        private asposeService: AsposeServiceProxy,
        private previewTemplateService: PreviewTemplateService) {
        super(injector);
        // COMMENT: this.stopAutoUpdateView();
    }

    @ViewChild('editForm') editForm: ElementRef;
    isShowError = false;

    ngOnInit(): void {
        this.levels = this.getLevelsCombobox();
        this.filterInput.brancH_ID = this.appSession.user.subbrId;
        this.filterInput.brancH_NAME = this.appSession.user.branchName;
        this.filterInput.brancH_LOGIN = this.appSession.user.subbrId;
        this.filterInput.level = 'ALL';
        this.filterInput.fromDate = moment().startOf('year');
        this.filterInput.toDate = moment().endOf('year');
    }


    exportToExcel() {

        if ((this.editForm as any).form.invalid) {
            this.isShowError = true;
            this.showErrorMessage(this.l('FormInvalid'));
            this.updateView();
            return;
        }
        if (this.filterInput.fromDate > this.filterInput.toDate) {
            this.showErrorMessage(this.l('FromDateMustSmallerThanToDate'));
            this.updateView();
            return;
        }
        var Level = "";
        if(this.filterInput.level == "ALL"){
            Level = this.l("All") + " " + this.l("Branch").toLowerCase();
        }
        else{
            Level = this.l("IndependentUnit");
        }
        let reportInfo = new ReportInfo();
        reportInfo.typeExport = ReportTypeConsts.Excel;

        reportInfo.parameters = this.GetParamsFromFilter(this.filterInput);

        reportInfo.values = this.GetParamsFromFilter({
            branchCode: this.appSession.user.branch.brancH_CODE,
            branchName: this.appSession.user.branch.brancH_NAME,
            level: Level,
            fullName : this.appSession.user.name,
            fromDate : this.filterInput.fromDate,
            toDate : this.filterInput.toDate,
            datePrint: moment(),
        });

        reportInfo.pathName = "/REPORT/KH_BC09.xlsx";
        reportInfo.storeName = "rpt_KH_BC09_Excel";

        this.asposeService.getReport(reportInfo).subscribe(x => {
            this.fileDownloadService.downloadTempFile(x);
            this.showSuccessMessage(this.l('ExportFileSuccess'));
            this.updateView();
        });
    }

    onSelectBranch(branch: CM_BRANCH_ENTITY) {
        this.filterInput.brancH_ID = branch.brancH_ID;
        this.filterInput.brancH_NAME = branch.brancH_NAME;
    }  

    printPreview() {

        if ((this.editForm as any).form.invalid) {
            this.isShowError = true;
            this.showErrorMessage(this.l('FormInvalid'));
            this.updateView();
            return;
        }
        if (this.filterInput.fromDate > this.filterInput.toDate) {
            this.showErrorMessage(this.l('FromDateMustSmallerThanToDate'));
            this.updateView();
            return;
        }
        let parameters = this.GetParamsFromFilter(this.filterInput);

        let values = this.GetParamsFromFilter({
            branchCode: this.appSession.user.branch.brancH_CODE,
            branchName: this.appSession.user.branch.brancH_NAME,
            level: this.filterInput.level == 'ALL'? this.l('AllGoods') : this.l('Branch'),
            fullName : this.appSession.user.name,
            duration: (this.l('FromDate') + ' ' + (this.filterInput.fromDate ? this.filterInput.fromDate.format('DD/MM/YYYY') : '') + ' ' + this.l('ToDate').toLowerCase() + ' ' + this.filterInput.toDate.format('DD/MM/YYYY')),
            datePrint: (new DateFormatPipe()).transform(moment()),
        });


        this.reportTemplate.show("PlPoContract_Report", parameters, values);
    }

}
