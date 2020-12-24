import { Injector, Component, OnInit, ViewEncapsulation, AfterViewInit, ViewChild, ElementRef } from "@angular/core";
import { ReportInfo, AsposeServiceProxy, CM_BRANCH_ENTITY} from "@shared/service-proxies/service-proxies";
import { appModuleAnimation } from "@shared/animations/routerTransition";
import { FileDownloadService } from "@shared/utils/file-download.service";
import { ReportTypeConsts } from "@app/admin/core/ultils/consts/ReportTypeConsts";
import { DefaultComponentBase } from "@app/ultilities/default-component-base";
import { PreviewTemplateService } from "@app/admin/common/preview-template/preview-template.service";
import * as moment from 'moment';
import { DateFormatPipe } from "@app/admin/core/pipes/date-format.pipe";
import { BranchModalComponent } from "@app/admin/core/controls/branch-modal/branch-modal.component";
import { ReportTemplateModalComponent } from "@app/admin/core/controls/report-template-modal/report-template-modal.component";

@Component({
    templateUrl: './car-list-sys-rate.component.html',
    encapsulation: ViewEncapsulation.None,
    animations: [appModuleAnimation()]
})

export class CarListSysRateComponent extends DefaultComponentBase implements OnInit, AfterViewInit {
    @ViewChild('branchModal') branchModal: BranchModalComponent;
    @ViewChild('editForm')editForm: ElementRef;
    @ViewChild('previewTemplateModal') previewTemplateModal: ReportTemplateModalComponent;

    hidden: boolean = false;

    filterInput: any = {};

    levels : any[];

    ngAfterViewInit(): void {
        // COMMENT: this.stopAutoUpdateView();
    }

    constructor(injector: Injector,
        private fileDownloadService: FileDownloadService,
        private asposeService: AsposeServiceProxy,
        private previewTemplateService: PreviewTemplateService) {
        super(injector);
    }


    ngOnInit(): void {
        this.levels = this.getLevelsCombobox();
        this.filterInput.BRANCH_NAME = this.appSession.user.branchName;
        this.filterInput.BRANCH_ID = this.appSession.user.subbrId;
        this.filterInput.level = 'ALL';
        this.filterInput.fromDate = moment().startOf('month');
        this.filterInput.toDate = moment().endOf('month');
    }


    isShowError: boolean = false;
    inputIsValid()
    {
        if ((this.editForm as any).form.invalid) {
            this.isShowError = true;
            this.showErrorMessage(this.l('FormInvalid'));
            this.updateView();
            return false;
        }
        if(this.filterInput.fromDate && this.filterInput.toDate.diff(this.filterInput.fromDate,'days') < 0){
            this.showErrorMessage(this.l('FromDateMustSmallerThanToDate'));
            this.updateView();
            return false;
        }
        return true;
    }
    exportToExcel() {
        if(!this.inputIsValid())return;
        let reportInfo = new ReportInfo();
        reportInfo.typeExport = ReportTypeConsts.Excel;

        reportInfo.parameters = this.GetParamsFromFilter(this.filterInput);
        var datePipe = new DateFormatPipe();
       
        var str = this.l('Calculate');
        if(this.filterInput.fromDate) str += ' ' + this.l('FromDate') + ' ' + datePipe.transform(this.filterInput.fromDate);
        str +=  ' ' + this.l('ToDate') + ' ' + datePipe.transform(this.filterInput.toDate);

        reportInfo.values = this.GetParamsFromFilter({
            BRANCH_ID: this.filterInput.BRANCH_ID,
            Level : this.filterInput.level,
            Fromdate: this.filterInput.fromDate,
            Todate: this.filterInput.toDate,
            
            fullName : this.appSession.user.userName,
            datePrint : datePipe.transform(moment()),
            A4 : (this.l('Branch').toUpperCase() + ': ' + this.appSession.user.branchCode + ' ' + this.appSession.user.branchName),
            A5 : str.toUpperCase(),
            A6: (this.l('OfficeManagermentToBoardofDirector') + " " + this.l('CarListSys').toLowerCase() + " " + this.l('ToDate').toLowerCase() + ' ' + datePipe.transform(this.filterInput.toDate).toLowerCase())
        });

        reportInfo.pathName = "/REPORT/XE_BC02.xlsx";
        reportInfo.storeName = "rpt_XE_BC02_Excel";

        this.asposeService.getReport(reportInfo).subscribe(x => {
            this.fileDownloadService.downloadTempFile(x);
            this.showSuccessMessage(this.l('ExportFileSuccess'));
        });
    }

    printCarListSysRate_p(){
        if(!this.inputIsValid())return;
        var datePipe = new DateFormatPipe();
        var str = this.l('Calculate');
        if(this.filterInput.fromDate) str += ' ' + this.l('FromDate') + ' ' + datePipe.transform(this.filterInput.fromDate);
        str +=  ' ' + this.l('ToDate') + ' ' + datePipe.transform(this.filterInput.toDate);
        let parameters = [this.GetParamNameAndValue('BRANCH_ID', this.filterInput.BRANCH_ID),
        this.GetParamNameAndValue('LEVEL',this.filterInput.level),
        this.GetParamNameAndValue('FROMDATE',this.filterInput.fromDate),
        this.GetParamNameAndValue('TODATE',this.filterInput.toDate),
        // this.GetParamNameAndValue('BRANCH_LOGIN',this.appSession.user.subbrId)
        ];
        let values = this.GetParamsFromFilter({
            branchName: this.appSession.user.branchName,
            datePrint: moment().format(this.s('gAMSProCore.DateReportDisplayFormat')),
            fullName: this.appSession.user.name,
            A4 : (this.appSession.user.branchCode + '. ' + this.appSession.user.branchName),
            A5 : str.toUpperCase(),
            A6: (this.l('OfficeManagermentToBoardofDirector') + " " + this.l('CarListSysRate').toLowerCase() + " " + str.toLowerCase() + " : "),
            level: this.filterInput.level == 'ALL' ? this.l('AllGoods') : this.l('Branch'),
        });
        this.showSuccessMessage(this.l('ExportFileSuccess'));
        this.previewTemplateModal.show('CarListSysRate_Report', parameters, values);

        // this.previewTemplateService.printReportTemplate('CarListSysRate_Report', parameters, values);
    }

    onSelectBranch(branch: CM_BRANCH_ENTITY) {
        this.filterInput.BRANCH_ID = branch.brancH_ID;
        this.filterInput.BRANCH_NAME = branch.brancH_NAME;
        this.updateView();
    }
    showBranchModal()
    {
        this.branchModal.filterInput.brancH_LOGIN = this.appSession.user.subbrId;
        this.branchModal.show();
    }

    // printPreview() {



    //     this.previewTemplateService.printReportTemplate("TSCD_BC16A", parameters, values);
    // }

}
