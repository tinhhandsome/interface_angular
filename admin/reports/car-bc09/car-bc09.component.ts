import { Injector, Component, OnInit, ViewEncapsulation, AfterViewInit, ViewChild } from "@angular/core";
import { ReportInfo, AsposeServiceProxy, CM_BRANCH_ENTITY, CAR_MASTER_ENTITY } from "@shared/service-proxies/service-proxies";
import { appModuleAnimation } from "@shared/animations/routerTransition";
import { FileDownloadService } from "@shared/utils/file-download.service";
import { ReportTypeConsts } from "@app/admin/core/ultils/consts/ReportTypeConsts";
import { DefaultComponentBase } from "@app/ultilities/default-component-base";
import { PreviewTemplateService } from "@app/admin/common/preview-template/preview-template.service";
import * as moment from 'moment';
import { BranchModalComponent } from "@app/admin/core/controls/branch-modal/branch-modal.component";
import { CarMasterModalComponent } from "@app/admin/core/controls/car-modal/car-master-modal.component";
import { AuthStatusConsts } from "@app/admin/core/ultils/consts/AuthStatusConsts";
import { DateFormatPipe } from "@app/admin/core/pipes/date-format.pipe";
import { ReportTemplateModalComponent } from "@app/admin/core/controls/report-template-modal/report-template-modal.component";

@Component({
    templateUrl: './car-bc09.component.html',
    encapsulation: ViewEncapsulation.None,
    animations: [appModuleAnimation()]
})

export class CARBC09Component extends DefaultComponentBase implements OnInit, AfterViewInit {
    @ViewChild('branchModal') branchModal: BranchModalComponent;
    @ViewChild('carModal') carModal: CarMasterModalComponent;
    @ViewChild('reportTemplate') reportTemplate: ReportTemplateModalComponent;
    hidden: boolean = false;

    filterInput: any = {};

    levels: any[];
    months: any[];
    years: any[];
    cars: any[];
    ngAfterViewInit(): void {
        this.updateView();
        // this.stopAutoUpdateView();
    }

    constructor(injector: Injector,
        private fileDownloadService: FileDownloadService,
        private asposeService: AsposeServiceProxy,
        private previewTemplateService: PreviewTemplateService) {
        super(injector);
    }


    ngOnInit(): void {
        this.initCombobox();
        this.initFilter();
    }
    initCombobox() {
        this.levels = this.getLevelsCombobox();
        this.months = this.getMonthsCombobox();
        this.years = this.getYearsCombobox();
        this.cars = [];
        // this.updateView();
    }
    initFilter() {
        this.filterInput.brancH_ID = this.appSession.user.subbrId;
        this.filterInput.brancH_NAME = this.appSession.user.branchName;
        this.filterInput.level = 'ALL';
        this.filterInput.toMonth = moment().month()+1;
        this.filterInput.toYear = moment().year();
        this.filterInput.caR_ID = '';
        // this.updateView();
    }
    showBranchModal() {
        this.branchModal.filterInput.brancH_LOGIN = this.appSession.user.subbrId;
        this.branchModal.show();
    }
    showCarModal() {
        this.carModal.filterInput.brancH_ID = this.appSession.user.subbrId;
        this.carModal.filterInput.autH_STATUS = AuthStatusConsts.Approve;
        this.carModal.filterInput.level = 'UNIT';
        this.carModal.show();
    }

    exportToExcel() {
        let reportInfo = new ReportInfo();
        reportInfo.typeExport = ReportTypeConsts.Excel;
        reportInfo.parameters = this.GetParamsFromFilter({
            CAR_ID: this.filterInput.caR_ID,
            BRANCH_LOGIN: this.appSession.user.subbrId,
            BRANCH_ID: this.filterInput.brancH_ID,
            LEVEL: this.filterInput.level,
            TO_DT: moment('1/' + this.filterInput.toMonth + '/' + this.filterInput.toYear, (new DateFormatPipe()).getDateFormatString()),
        });
        reportInfo.values = this.GetParamsFromFilter({
            fullName: (this.l('PrintName') + ': ' + this.appSession.user.name),
            datePrint: (this.l('PrintDT') + ': ' + (new DateFormatPipe()).transform(moment())),
            A4: (this.l('Branch').toUpperCase() + ': ' + this.appSession.user.branchCode + ' ' + this.appSession.user.branchName),
            A5: (this.l('CARBC09Title').toUpperCase() + ' ' + this.filterInput.toMonth+'/'+this.filterInput.toYear),
            level: this.filterInput.level == 'ALL' ? this.l('AllGoods') : this.l('Branch'),
        });

        reportInfo.pathName = "/REPORT/XE_BC09.xlsx";
        reportInfo.storeName = "rpt_XE_BC09_Excel";

        this.asposeService.getReport(reportInfo).subscribe(x => {
            this.fileDownloadService.downloadTempFile(x);
        });
    }

    printCarBC09_p(){
        let parameters = this.GetParamsFromFilter({
            CAR_ID: this.filterInput.caR_ID,
            BRANCH_LOGIN: this.appSession.user.subbrId,
            BRANCH_ID: this.filterInput.brancH_ID,
            LEVEL: this.filterInput.level,
            TO_DT: moment('1/' + this.filterInput.toMonth + '/' + this.filterInput.toYear, (new DateFormatPipe()).getDateFormatString()),
        });

        let values = this.GetParamsFromFilter({
            branchCode: this.appSession.user.branchCode,
            branchName: this.appSession.user.branchName,
            datePrint: moment().format(this.s('gAMSProCore.DateReportDisplayFormat')),
            fullName: this.appSession.user.name,
            month: this.filterInput.toMonth + '/' + this.filterInput.toYear,
            level: this.filterInput.level == 'ALL' ? this.l('AllGoods') : this.l('Branch'),
        });
        this.reportTemplate.show('CarBC09_Report', parameters, values);
        // this.previewTemplateService.printReportTemplate('CarBC09_Report', parameters, values);
    }

    onSelectBranch(branch: CM_BRANCH_ENTITY) {
        if (!branch) return;
        this.filterInput.brancH_ID = branch.brancH_ID;
        this.filterInput.brancH_NAME = branch.brancH_NAME;
        this.updateView();
    }
    onSelectCar(car: CAR_MASTER_ENTITY) {
        if (!car) return;
        this.cars = [{
            'value': car.caR_ID,
            'display': car.n_PLATE
        }];
        // this.updateView();
        this.filterInput.caR_ID = car.caR_ID;
        this.filterInput.n_PLATE = car.n_PLATE;
        this.updateView();
    }
    // printPreview() {



    //     this.previewTemplateService.printReportTemplate("TSCD_BC16A", parameters, values);
    // }

}
