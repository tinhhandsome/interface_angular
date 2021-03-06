import { Injector, Component, OnInit, ViewEncapsulation, AfterViewInit, ElementRef, ViewChild } from "@angular/core";
import { ReportInfo, AsposeServiceProxy, CM_DEPARTMENT_ENTITY, BranchServiceProxy, CM_BRANCH_ENTITY, CM_DIVISION_ENTITY, DepartmentServiceProxy, CAR_MASTER_ENTITY } from "@shared/service-proxies/service-proxies";
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

@Component({
    templateUrl: './car-list-drive.component.html',
    encapsulation: ViewEncapsulation.None,
    animations: [appModuleAnimation()]
})

export class CarListDriveComponent extends DefaultComponentBase implements OnInit, AfterViewInit {

    hidden: boolean = false;

    filterInput: any = {};
    ReportType: string = null;
    levels: any[];
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
    @ViewChild('branchModal') branchModal: BranchModalComponent;
    @ViewChild('carModal') carModal: CarMasterModalComponent;
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
        if(this.filterInput.fromDate>this.filterInput.toDate){
            this.isShowError = true;
            this.showErrorMessage(this.l('ToDTmustbiggerthanFromDT'));
            this.updateView();
            return;
        }
        if(this.ReportType==null)
            return;

        let reportInfo = new ReportInfo();
        reportInfo.typeExport = ReportTypeConsts.Excel;
        var datePipe = new DateFormatPipe();
        this.filterInput.dateTo=datePipe.transform(this.filterInput.toDate);
        this.filterInput.dateFrom=datePipe.transform(this.filterInput.fromDate);

        reportInfo.parameters = this.GetParamsFromFilter(this.filterInput);

        reportInfo.values = this.GetParamsFromFilter({
            branchinfo: (this.l('Branch').toUpperCase()+ ': ' + this.appSession.user.branchCode + ' ' + this.appSession.user.branchName),
            level: this.levels.filter(x => x.value == this.filterInput.level)[0].display,
            fullName: (this.l('PrintName') + ': ' + this.appSession.user.name),
            datePrint: (this.l('PrintDT') + ': ' + (new DateFormatPipe()).transform(moment())),
            A4: (this.l('FromDate').toUpperCase() + ' ' + this.filterInput.dateFrom + ' ' + this.l('ToDate').toUpperCase() + ' ' + this.filterInput.dateTo)
        });
        
        
        reportInfo.pathName = "/REPORT/"+ this.ReportType + ".xlsx";
        reportInfo.storeName = "rpt_"+ this.ReportType + "_Excel";

        this.asposeService.getReport(reportInfo).subscribe(x => {
            this.fileDownloadService.downloadTempFile(x);
            this.showSuccessMessage(this.l('ExportFileSuccess'));
            this.updateView();
        });
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

    onSelectReportType(rp :any){
        this.ReportType=rp;
    }
    onSelectBranch(branch: CM_BRANCH_ENTITY) {
        this.filterInput.brancH_ID = branch.brancH_ID;
        this.filterInput.brancH_NAME = branch.brancH_NAME;
        this.updateView();
    }  

    onSelectCar(car: CAR_MASTER_ENTITY) {
        this.filterInput.BIENSOXE = car.n_PLATE;
        this.updateView();
    }
}
