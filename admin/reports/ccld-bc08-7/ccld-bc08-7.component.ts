import { Injector, Component, OnInit, ViewEncapsulation, AfterViewInit, ViewChild, ElementRef } from "@angular/core";
import { ReportInfo, AsposeServiceProxy, CM_BRANCH_ENTITY, CM_EMPLOYEE_ENTITY, ASS_GROUP_ENTITY, CM_SUPPLIER_ENTITY, CM_TERM_ENTITY, TermServiceProxy } from "@shared/service-proxies/service-proxies";
import { appModuleAnimation } from "@shared/animations/routerTransition";
import { FileDownloadService } from "@shared/utils/file-download.service";
import { ReportTypeConsts } from "@app/admin/core/ultils/consts/ReportTypeConsts";
import { DefaultComponentBase } from "@app/ultilities/default-component-base";
import * as moment from 'moment';
import { Select2CustomComponent } from "@app/admin/core/controls/custom-select2/select2-custom.component";

@Component({
    templateUrl: './ccld-bc08-7.component.html',
    encapsulation: ViewEncapsulation.None,
    animations: [appModuleAnimation()]
})

export class CCLDBc08_7Component extends DefaultComponentBase implements OnInit, AfterViewInit {

    didsableInput: boolean = true;
    terms: CM_TERM_ENTITY[] = [];
    filterInput: any = {};
    branchType: string;
    termName: string = '';
    levels: any[];
    isShowError: boolean = false;
    months: any[];
    years: any[];

    @ViewChild('exportForm') exportForm: ElementRef;
    // @ViewChild('depSelect') depSelect: Select2CustomComponent;

    ngAfterViewInit(): void {
        this.updateView();
    }

    constructor(injector: Injector,
        private fileDownloadService: FileDownloadService,
        private asposeService: AsposeServiceProxy,
        private cm_TermService: TermServiceProxy) {
        super(injector);
        // COMMENT: this.stopAutoUpdateView();

    }

    ngOnInit(): void {
        this.levels = this.getLevelsCombobox();
        this.branchType = this.appSession.user.branch.brancH_TYPE;
        this.filterInput.BRANCH_LOGIN = this.filterInput.BRANCH_ID = this.appSession.user.subbrId;
        this.filterInput.LEVEL = 'ALL';
        this.filterInput.BRANCH_NAME = this.appSession.user.branchName;
        this.filterInput.FROMDATE = moment().startOf('month');
        this.filterInput.TODATE = moment().endOf('month');
        this.filterInput.FROMPRICE = 0;
        this.filterInput.TOPRICE = 0;
        this.filterInput.MONTH = 1;
        this.filterInput.MONTH = moment().month() + 1;
        this.filterInput.YEAR = moment().year();

        this.months = this.getMonthsCombobox();
        this.years = this.getYearsCombobox().filter(x => x.value <= this.filterInput.YEAR && x.value >= 1990);
    }

    exportToExcel() {
        if ((this.exportForm as any).form.invalid) {
            this.isShowError = true;
            this.showErrorMessage(this.l('FormInvalid'));
            this.updateView();
            return;
        }
        if (this.filterInput.FROMDATE > this.filterInput.TODATE) {
            this.showErrorMessage(this.l('FromDateMustSmallerThanToDate'));
            this.updateView();
            return;
        }
        if (this.filterInput.FROMPRICE > this.filterInput.TOPRICE) {
            this.showErrorMessage(this.l('FromPriceMustSmallerThanToPrice'));
            this.updateView();
            return;
        }
        this.didsableInput = true;

        if (!this.filterInput.SUPPLIER_ID)
            this.filterInput.SUPPLIER_ID = '';
        if (!this.filterInput.GROUP_ID)
            this.filterInput.GROUP_ID = '';
        if (!this.filterInput.USER_ID)
            this.filterInput.USER_ID = '';
        if (!this.filterInput.FROMPRICE)
            this.filterInput.FROMPRICE = 0;
        if (!this.filterInput.TOPRICE)
            this.filterInput.TOPRICE = 0;

        let reportInfo = new ReportInfo();
        reportInfo.typeExport = ReportTypeConsts.Excel;
        var level = "";
        if (this.filterInput.LEVEL == "ALL") {
            level = this.l("All") + " " + this.l("Branch").toLowerCase();

        } else {
            level = this.l("At") + ' ' + this.l('Branch').toLowerCase() + ': ' + this.filterInput.BRANCH_NAME.toUpperCase();

        }
        reportInfo.values = this.GetParamsFromFilter({
            A4: 'Tháng ' + this.filterInput.MONTH + '/' + this.filterInput.YEAR,
            A2: 'Đơn vị: ' + this.appSession.user.branchName.toUpperCase(),
            A5: level
        });


        reportInfo.parameters = this.GetParamsFromFilter(this.filterInput);

        reportInfo.pathName = "/REPORT/CCLD_BC08_7.xlsx";
        reportInfo.storeName = "rpt_TSCD_BC08_7_Excel";

        this.asposeService.getReport(reportInfo).subscribe(x => {
            this.fileDownloadService.downloadTempFile(x);
            // tra ve kieu date de in lai ko bi loi
            this.showSuccessMessage(this.l('ExportFileSuccess'));
            this.updateView();
        });
    }

    initTerms(): void {
        this.cm_TermService.cM_TERM_Search(this.getFillterForCombobox()).subscribe(Result => {
            this.didsableInput = false;
            this.terms = Result.items;
            this.updateView();
        });

    }

    getItemName(event: CM_TERM_ENTITY) {
        this.termName = event.terM_NAME;
        this.filterInput.terM_ID = event.terM_ID;
    }

    onSelectEmp(emp: CM_EMPLOYEE_ENTITY): void {
        this.filterInput.USER_ID = emp.emP_ID;
        this.filterInput.EMP_NAME = emp.emP_NAME;
    }

    onSelectAssGroup(assGr: ASS_GROUP_ENTITY): void {
        this.filterInput.GROUP_ID = assGr.grouP_ID;
        this.filterInput.BRANCH_NAME = assGr.grouP_NAME;
    }

    onSelectSupplier(sup: CM_SUPPLIER_ENTITY): void {
        this.filterInput.SUPPLIER_ID = sup.suP_ID;
        this.filterInput.BRANCH_NAME = sup.suP_NAME;
    }

    onSelectBranch(branch: CM_BRANCH_ENTITY) {
        if (!branch.brancH_ID)
            return;
        this.filterInput.BRANCH_ID = branch.brancH_ID;
        this.branchType = branch.brancH_TYPE;
        if (this.branchType != 'HS') {
            // this.filterInput.DEP_ID = '';
            // this.depSelect.setSingleValue('', '');
        }
        this.filterInput.BRANCH_NAME = branch.brancH_NAME;
        this.updateView();
    }

    reloadMoney() {
        if (!this.filterInput.FROMPRICE) {
            this.filterInput.FROMPRICE = 0;
        }
        if (!this.filterInput.TOPRICE) {
            this.filterInput.TOPRICE = 0;
        }
        this.updateView();
    }

}