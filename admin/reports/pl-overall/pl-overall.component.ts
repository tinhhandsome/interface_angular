import { DefaultComponentBase } from "@app/ultilities/default-component-base";
import { OnInit, AfterViewInit, ViewEncapsulation, Component, Injector, ViewChild, ElementRef } from "@angular/core";
import { appModuleAnimation } from "@shared/animations/routerTransition";
import { CM_BRANCH_ENTITY, AsposeServiceProxy, ReportInfo, CM_DEPARTMENT_ENTITY } from "@shared/service-proxies/service-proxies";
import { FileDownloadService } from "@shared/utils/file-download.service";
import * as moment from "moment";
import { Select2CustomComponent } from "@app/admin/core/controls/custom-select2/select2-custom.component";
import { ReportTemplateModalComponent } from "@app/admin/core/controls/report-template-modal/report-template-modal.component";
import { ReportTypeConsts } from "@app/admin/core/ultils/consts/ReportTypeConsts";

@Component({
    templateUrl: './pl-overall.component.html',
    encapsulation: ViewEncapsulation.None,
    animations: [appModuleAnimation()]
})
export class PlOverallComponent extends DefaultComponentBase implements OnInit, AfterViewInit {
    
    filterInput: any = {};

    currentBranchIdField: string;
    currentBranchNameField: string;

    levels: any[];
    years: any[];
    branchType: string;
    depid: string;
    todate:string;
    @ViewChild('userSelect') userSelect: Select2CustomComponent;
    @ViewChild('goodsTypeRealSelect') goodsTypeRealSelect: Select2CustomComponent;
    @ViewChild('reportTemplate') reportTemplate : ReportTemplateModalComponent;
    @ViewChild('depSelect') depSelect: Select2CustomComponent;
    @ViewChild('editForm') editForm: ElementRef;
    isShowError = false;

    ngAfterViewInit(): void {
    }

    constructor(injector: Injector,
        private fileDownloadService: FileDownloadService,
        private asposeService: AsposeServiceProxy) {
        super(injector);
    }
    level : string;
    now: any;
    ngOnInit(): void {
        this.now = moment();
        this.years = this.getYearsCombobox();
        this.levels = this.getLevelsCombobox();
        this.filterInput.BRANCH_LOGIN = this.appSession.user.subbrId;
        this.filterInput.BRANCH_ID = this.appSession.user.subbrId;
        this.filterInput.BRANCH_NAME = this.appSession.user.branch.brancH_NAME;
        this.branchType = this.appSession.user.branch.brancH_TYPE;
        this.filterInput.BRANCH_ID = this.appSession.user.subbrId;
        this.filterInput.BRANCH_NAME = this.appSession.user.branchName;
        this.filterInput.BRANCH_LOGIN = this.appSession.user.subbrId;
        this.filterInput.LEVEL = 'ALL';
        this.filterInput.TO_DATE = this.now;
        this.filterInput.YEAR = moment().year();
        this.updateView();
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
        this.filterInput.DEPID=this.depid;
        reportInfo.parameters = this.GetParamsFromFilter(this.filterInput);
        reportInfo.values = this.GetParamsFromFilter({
            branchCode: this.appSession.user.branch.brancH_CODE,
            branchName: this.appSession.user.branch.brancH_NAME,
            level: this.levels.filter(x => x.value == this.filterInput.LEVEL)[0].display,
            fullName : this.appSession.user.name,
            year: this.filterInput.YEAR,
            now:this.now,
            today: this.filterInput.TO_DATE.format('DD/MM/YYYY'),
            A3 : this.l('ReportPlanInYear') + ' ' + this.filterInput.YEAR,
            datePrint: moment()
        });

        reportInfo.pathName = "/PL_MASTER/rpt_KH_BC02_Excel.xlsx";
        reportInfo.storeName = "rpt_KH_BC02_Excel";

        this.asposeService.getReport(reportInfo).subscribe(x => {
            this.fileDownloadService.downloadTempFile(x);
            this.showSuccessMessage(this.l('ExportFileSuccess'));
        });
    }
    onSelectBranch(branch: CM_BRANCH_ENTITY) {
        this.filterInput.BRANCH_ID = branch.brancH_ID;
        this.branchType = branch.brancH_TYPE;     
        this.filterInput.BRANCH_NAME = branch.brancH_NAME;
        this.updateView();
    }
    onSelectDep(dep: CM_DEPARTMENT_ENTITY) {
        this.depid=dep.deP_ID;
        this.filterInput.DEP_ID = dep.deP_ID;
        this.filterInput.DEP_NAME = dep.deP_NAME;
        this.updateView();
    }
}
