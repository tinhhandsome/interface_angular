import { Injector, Component, OnInit, ViewEncapsulation, AfterViewInit, ElementRef, ViewChild } from "@angular/core";
import { ReportInfo, AsposeServiceProxy, CM_DEPARTMENT_ENTITY, BranchServiceProxy, CM_BRANCH_ENTITY, CM_DIVISION_ENTITY, DepartmentServiceProxy, ReportTemplateServiceProxy } from "@shared/service-proxies/service-proxies";
import { appModuleAnimation } from "@shared/animations/routerTransition";
import { FileDownloadService } from "@shared/utils/file-download.service";
import { ReportTypeConsts } from "@app/admin/core/ultils/consts/ReportTypeConsts";
import { DefaultComponentBase } from "@app/ultilities/default-component-base";
import { PreviewTemplateService } from "@app/admin/common/preview-template/preview-template.service";
import * as moment from 'moment';
import { DateFormatPipe } from "@app/admin/core/pipes/date-format.pipe";
import { ReportTemplateModalComponent } from "@app/admin/core/controls/report-template-modal/report-template-modal.component";

@Component({
    templateUrl: './re-list-branch.component.html',
    encapsulation: ViewEncapsulation.None,
    animations: [appModuleAnimation()]
})

export class ReListBranchComponent extends DefaultComponentBase implements OnInit, AfterViewInit {

    hidden: boolean = false;

    filterInput: any = {};

    levels: any[];
    currentBranchIdField: string;
    currentBranchNameField: string;

    datePipeFormatter: DateFormatPipe

    ngAfterViewInit(): void {
        // COMMENT: this.stopAutoUpdateView();
        this.setupValidationMessage()
    }

    constructor(injector: Injector,
        private fileDownloadService: FileDownloadService,
        private asposeService: AsposeServiceProxy) {
        super(injector);
        this.datePipeFormatter = new DateFormatPipe();
    }

    @ViewChild('editForm') editForm: ElementRef;
    @ViewChild('reportTemplate') reportTemplate: ReportTemplateModalComponent;

    isShowError = false;

    ngOnInit(): void {
        this.levels = this.getLevelsCombobox();
        this.filterInput.brancH_ID = this.appSession.user.subbrId;
        this.filterInput.brancH_NAME = this.appSession.user.branchName;
        this.filterInput.brancH_LOGIN = this.appSession.user.subbrId;
        this.filterInput.level = 'ALL';
        this.filterInput.fromDate = moment().startOf('month');
        this.filterInput.toDate = moment().endOf('month');
    }


    exportToExcel() {

        if ((this.editForm as any).form.invalid) {
            this.isShowError = true;
            this.showErrorMessage(this.l('FormInvalid'));
            this.updateView();
            return;
        }

        let reportInfo = new ReportInfo();
        reportInfo.typeExport = ReportTypeConsts.Excel;

        reportInfo.parameters = this.GetParamsFromFilter(this.filterInput);

        reportInfo.values = this.GetParamsFromFilter({
            branchCode: this.appSession.user.branch.brancH_CODE,
            branchName: this.appSession.user.branch.brancH_NAME,
            level: this.levels.filter(x => x.value == this.filterInput.level)[0].display,
            fullName: this.appSession.user.name,
            datePrint: moment()
        });

        reportInfo.pathName = "/REPORT/BDS_BC01.xlsx";
        reportInfo.storeName = "rpt_BDS_BC01_Excel";

        this.asposeService.getReport(reportInfo).subscribe(x => {
            this.fileDownloadService.downloadTempFile(x);
            this.showSuccessMessage(this.l('ExportFileSuccess'));
            this.updateView();
        });
    }

    exportToWord() {
        if ((this.editForm as any).form.invalid) {
            this.isShowError = true;
            this.showErrorMessage(this.l('FormInvalid'));
            this.updateView();
            return;
        }

        let reportInfo = new ReportInfo();
        reportInfo.typeExport = ReportTypeConsts.Word;


        reportInfo.parameters = this.GetParamsFromFilter(this.filterInput);

        reportInfo.values = this.GetParamsFromFilter({
            branchCode: this.appSession.user.branch.brancH_CODE,
            branchName: this.appSession.user.branch.brancH_NAME,
            level: this.filterInput.level == 'ALL' ? this.l('AllGoods') : this.l('Branch'),
            fullName: this.appSession.user.name,
            datePrint: this.datePipeFormatter.transform(moment())
        });

        this.reportTemplate.show('rpt_BDS_BC01', reportInfo.parameters, reportInfo.values)
    }

    onSelectBranch(branch: CM_BRANCH_ENTITY) {
        this.filterInput.brancH_ID = branch.brancH_ID;
        this.filterInput.brancH_NAME = branch.brancH_NAME;
    }

    // printPreview() {



    //     this.previewTemplateService.printReportTemplate("TSCD_BC16A", parameters, values);
    // }

}
