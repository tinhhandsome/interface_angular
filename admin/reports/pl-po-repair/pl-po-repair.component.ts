import { Injector, Component, OnInit, ViewEncapsulation, AfterViewInit, ViewChild, ElementRef } from "@angular/core";
import { ReportInfo, AsposeServiceProxy, CM_DEPARTMENT_ENTITY, BranchServiceProxy, CM_BRANCH_ENTITY, CM_DIVISION_ENTITY, DepartmentServiceProxy, CM_SUPPLIER_ENTITY, CM_GOODS_ENTITY, TLUSER_GETBY_BRANCHID_ENTITY, CM_GOODSTYPE_REAL_ENTITY } from "@shared/service-proxies/service-proxies";
import { appModuleAnimation } from "@shared/animations/routerTransition";
import { FileDownloadService } from "@shared/utils/file-download.service";
import { ReportTypeConsts } from "@app/admin/core/ultils/consts/ReportTypeConsts";
import { DefaultComponentBase } from "@app/ultilities/default-component-base";
import * as moment from 'moment';
import { Select2CustomComponent } from "@app/admin/core/controls/custom-select2/select2-custom.component";
import { NgForm } from "@angular/forms";

@Component({
    templateUrl: './pl-po-repair.component.html',
    encapsulation: ViewEncapsulation.None,
    animations: [appModuleAnimation()]
})

export class PlPoRepairComponent extends DefaultComponentBase implements OnInit, AfterViewInit {

    filterInput: any = {};

    currentBranchIdField: string;
    currentBranchNameField: string;

    levels: any[];

    plansCombobox: any[] = [
        {
            value: 0,
            display: this.l('SelectAll')
        },
        {
            value: 1,
            display: this.l('outPlan')
        },
        {
            value: -1,
            display: this.l('inPlan')
        }
    ]

    @ViewChild('userSelect') userSelect: Select2CustomComponent;
    @ViewChild('goodsTypeRealSelect') goodsTypeRealSelect: Select2CustomComponent;

    @ViewChild('editForm') editForm: NgForm;
    isShowError = false;

    users: any[] = [];
    goodsTypeReals: any[] = [];

    ngAfterViewInit(): void {

        this.updateView();
        this.setupValidationMessage();
    }

    constructor(injector: Injector,
        private fileDownloadService: FileDownloadService,
        private asposeService: AsposeServiceProxy) {
        super(injector);
    }

    ngOnInit(): void {
        this.levels = this.getLevelsCombobox();
        this.filterInput.BRANCH_LOGIN = this.appSession.user.subbrId;
        this.filterInput.BRANCH_ID = this.appSession.user.subbrId;
        this.filterInput.BRANCH_NAME = this.appSession.user.branch.brancH_NAME;
        this.filterInput.LEVEL = 'ALL';
        this.filterInput.FROM_DATE = moment().startOf('year');
        this.filterInput.TO_DATE = moment().endOf('year');
        this.filterInput.ASSET_TYPE_ID = 'ALL';
        this.filterInput.PLAN = '0';
        this.updateView();
    }

    FROM_DATE_inValid() {
        if (this.filterInput.FROM_DATE && this.filterInput.TO_DATE) {
            return this.compareDate(this.filterInput.TO_DATE, this.filterInput.FROM_DATE)
        }
        return false;
    }

    isValid() {
        if (this.FROM_DATE_inValid()) {
            return this.l('FormInvalid');
        }
        return '';
    }


    exportToExcel() {

        if ((this.editForm as any).form.invalid) {
            this.isShowError = true;
            this.showErrorMessage(this.l('FormInvalid'));
            this.updateView();
            return;
        }

        let errorMessage = this.isValid();
        if (errorMessage) {
            this.isShowError = true;
            this.showErrorMessage(errorMessage);
            this.updateView();
            return;
        }

        if (this.filterInput.FROM_DATE > this.filterInput.TODATE) {
            this.showErrorMessage(this.l('FromDateMustSmallerThanToDate'));
            this.updateView();
            return;
        }
        let reportInfo = new ReportInfo();
        reportInfo.typeExport = ReportTypeConsts.Excel;

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

        reportInfo.parameters = this.GetParamsFromFilter(this.filterInput);

        reportInfo.values = this.GetParamsFromFilter({
            A4: this.l('FromDate') + ' ' + this.filterInput.FROM_DATE.format('DD/MM/YYYY') + ' ' + this.l('ToDate').toLowerCase() + ' ' + this.filterInput.TO_DATE.format('DD/MM/YYYY')
        });

        reportInfo.pathName = "/REPORT/PO_REPAIR.xlsx";
        reportInfo.storeName = "rpt_KH_REPAIR_Excel";

        this.asposeService.getReport(reportInfo).subscribe(x => {
            this.fileDownloadService.downloadTempFile(x);
            this.showSuccessMessage(this.l('ExportFileSuccess'));
            this.updateView();
        });
    }

    onSelectBranch(branch: CM_BRANCH_ENTITY) {
        this.filterInput[this.currentBranchIdField] = branch.brancH_ID;
        this.filterInput[this.currentBranchNameField] = branch.brancH_NAME;
    }

    onBranchFocusOut() {
        this.filterInput.BRANCH_CREATE = undefined;
        this.filterInput.BRANCH_CREATE_NAME = undefined;
    }

    // printPreview() {



    //     this.previewTemplateService.printReportTemplate("TSCD_BC16A", parameters, values);
    // }

}
