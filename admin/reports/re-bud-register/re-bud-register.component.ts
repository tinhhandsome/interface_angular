import { Injector, Component, OnInit, ViewEncapsulation, AfterViewInit, ElementRef, ViewChild } from "@angular/core";
import { ReportInfo, AsposeServiceProxy, CM_DEPARTMENT_ENTITY, BranchServiceProxy, CM_BRANCH_ENTITY, CM_DIVISION_ENTITY, DepartmentServiceProxy } from "@shared/service-proxies/service-proxies";
import { appModuleAnimation } from "@shared/animations/routerTransition";
import { FileDownloadService } from "@shared/utils/file-download.service";
import { ReportTypeConsts } from "@app/admin/core/ultils/consts/ReportTypeConsts";
import { DefaultComponentBase } from "@app/ultilities/default-component-base";
import { PreviewTemplateService } from "@app/admin/common/preview-template/preview-template.service";
import * as moment from 'moment';
import { DateFormatPipe } from "@app/admin/core/pipes/date-format.pipe";
import { NgForm } from "@angular/forms";

@Component({
    templateUrl: './re-bud-register.component.html',
    encapsulation: ViewEncapsulation.None,
    animations: [appModuleAnimation()]
})

export class ReBudRegisterComponent extends DefaultComponentBase implements OnInit, AfterViewInit {

    hidden: boolean = false;

    filterInput: any = {};

    levels: any[];
    currentBranchIdField: string;
    currentBranchNameField: string;

    datePipeFormatter: DateFormatPipe
    monthAndyear: any[] = []

    ngAfterViewInit(): void {
        this.stopAutoUpdateView()
        this.setupValidationMessage()
    }

    constructor(injector: Injector,
        private fileDownloadService: FileDownloadService,
        private asposeService: AsposeServiceProxy,
        private previewTemplateService: PreviewTemplateService) {
        super(injector);
        this.datePipeFormatter = new DateFormatPipe()
        // console.log(this)
        this.initFilter()
    }

    @ViewChild('editForm') editForm: NgForm;
    isShowError = false;

    ngOnInit(): void {
        this.initCombobox()
    }
    initFilter() {
        const month = moment().format('M')
        const year = moment().format('Y')
        const itemMonthYear = 5 + '/' + 2000
        this.levels = this.getLevelsCombobox();
        this.monthAndyear = this.getMonthAndYearCombobox();
        this.filterInput.tmp = itemMonthYear

        const { subbrId, branchName } = this.appSession.user
        this.filterInput.brancH_ID = subbrId;
        this.filterInput.brancH_NAME = branchName;
        this.filterInput.brancH_LOGIN = subbrId;
        this.filterInput.level = 'ALL';
        this.filterInput.iS_LEAF = 'Y';
    }

    initCombobox(): void {

    }

    setFilterInputSearch() {
        if (this.filterInput.tmp) {
            this.filterInput.temp = moment('01/' + this.filterInput['tmp'], 'DD/MM/YYYY')
        }

        if (!this.filterInput.brancH_ID) {
            this.filterInput.brancH_ID = this.appSession.user.subbrId;
        }
    }

    exportToExcel() {
        if ((this.editForm as any).form.invalid) {
            this.isShowError = true;
            this.showErrorMessage(this.l('FormInvalid'));
            this.updateView();
            return;
        }

        this.setFilterInputSearch()


        const curTemp = moment(this.filterInput.temp).format('MM/YYYY')
        const prevQuarterTemp = moment(this.filterInput.temp).subtract(3, 'months').format('MM/YYYY')

        let reportInfo = new ReportInfo();
        reportInfo.typeExport = ReportTypeConsts.Excel;

        reportInfo.parameters = this.GetParamsFromFilter(this.filterInput);

        reportInfo.values = this.GetParamsFromFilter({
            ReBudRegReportDesc: this.l('ReBudRegReportDesc', curTemp),
            ReBudRegReportATitle: this.l('ReBudRegReportATitle', curTemp).toUpperCase(),
            TotalOfTempBracket: this.l('TotalOfTempBracket', curTemp, 1),
            AmtOfTempBracket: this.l('AmtOfTempBracket', curTemp, 2),
            DataOfQuarterTempBracket: this.l('DataOfQuarterTempBracket', prevQuarterTemp, 3),
            AmtOfQuarterTempBracket: this.l('AmtOfQuarterTempBracket', prevQuarterTemp, 4),
            DifDataOfTwoTempBracket: this.l('DifDataOfTwoTempBracket', curTemp, prevQuarterTemp, 1, 3),
            DifAmtOfTwoTempBracket: this.l('DifAmtOfTwoTempBracket', curTemp, prevQuarterTemp, 2, 4),
            ReBudRegReportBTitle: this.l('ReBudRegReportBTitle', curTemp),
            RentAllRateUntilTempReach: this.l('ReBudRegReportBTitle', curTemp),
            EndOfTemp: this.l('EndOfTemp', curTemp, 1),
            EndOfTempBracket: this.l('EndOfTempBracket', curTemp, 1),
            EndOfQuarterTempBracket: this.l('EndOfTempBracket', prevQuarterTemp, 2),
        });

        reportInfo.processMerge = true;

        reportInfo.pathName = "/REPORT/BUD_REG_BC01.xlsx";
        reportInfo.storeName = "rpt_BUD_REGISTER";

        this.asposeService.getReport(reportInfo).subscribe(x => {
            this.fileDownloadService.downloadTempFile(x);
            this.showSuccessMessage(this.l('ExportFileSuccess'));
            this.updateView();
        });
    }

    exportToWord() {
    }

    onSelectBranch(branch: CM_BRANCH_ENTITY) {
        this.filterInput.brancH_ID = branch.brancH_ID;
        this.filterInput.brancH_NAME = branch.brancH_NAME;
    }
}
