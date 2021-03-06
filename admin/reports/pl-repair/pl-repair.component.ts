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
    templateUrl: './pl-repair.component.html',
    encapsulation: ViewEncapsulation.None,
    animations: [appModuleAnimation()]
})

export class PlRepairComponent extends DefaultComponentBase implements OnInit, AfterViewInit {

    hidden: boolean = false;

    filterInput: any = {};

    levels: any[];
    years: any[];
    currentBranchIdField: string;
    currentBranchNameField: string;

    ngAfterViewInit(): void {
        // COMMENT: this.stopAutoUpdateView();
    }

    constructor(injector: Injector,
        private fileDownloadService: FileDownloadService,
        private asposeService: AsposeServiceProxy,
        private previewTemplateService: PreviewTemplateService) {
        super(injector);
    }

    @ViewChild('editForm') editForm: ElementRef;
    @ViewChild('reportTemplate') reportTemplate : ReportTemplateModalComponent;
    isShowError = false;

    ngOnInit(): void {
        this.levels = this.getLevelsCombobox();
        this.years = this.getYearsCombobox();
        this.filterInput.BRANCH_ID = this.appSession.user.subbrId;
        this.filterInput.BRANCH_NAME = this.appSession.user.branchName;
        this.filterInput.BRANCH_LOGIN = this.appSession.user.subbrId;
        this.filterInput.LEVEL = 'ALL';
        this.filterInput.YEAR = moment().year();
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
            level: this.levels.filter(x => x.value == this.filterInput.LEVEL)[0].display,
            fullName : this.appSession.user.name,
            year: this.filterInput.YEAR,
            A3 : this.l('ReportPlanInYear') + ' ' + this.filterInput.YEAR,
            datePrint: moment()
        });

        reportInfo.pathName = "/REPORT/KH_BC04.xlsx";
        reportInfo.storeName = "rpt_KH_BC04_Excel";

        this.asposeService.getReport(reportInfo).subscribe(x => {
            this.fileDownloadService.downloadTempFile(x);
            this.showSuccessMessage(this.l('ExportFileSuccess'));
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

        if (!this.filterInput.PLAN) {
            this.filterInput.PLAN = '';
        }

        if (!this.filterInput.GOODS_ID) {
            this.filterInput.GOODS_ID = '';
        }

        if (!this.filterInput.MAKER_ID) {
            this.filterInput.MAKER_ID = '';
        }

        if (!this.filterInput.BRANCH_CREATE) {
            this.filterInput.BRANCH_CREATE = '';
        }

        if (!this.filterInput.ISDELIVERY) {
            this.filterInput.ISDELIVERY = '';
        }

        if (!this.filterInput.ISPAYMENT) {
            this.filterInput.ISPAYMENT = '';
        }

        if (!this.filterInput.PLAN) {
            this.filterInput.PLAN = '';
        }

        let parameters = this.GetParamsFromFilter(this.filterInput);
        let values = this.GetParamsFromFilter({
            branchCode: this.appSession.user.branch.brancH_CODE,
            branchName: this.appSession.user.branch.brancH_NAME,
            level: this.filterInput.LEVEL == 'ALL' ? this.l('AllGoods') : this.l('Branch'),
            fullName: this.appSession.user.name,
            year: this.filterInput.YEAR,
            datePrint: (new DateFormatPipe()).transform(moment()),
        });

        this.reportTemplate.show('PlRepair_Report', parameters, values)
    }

}
