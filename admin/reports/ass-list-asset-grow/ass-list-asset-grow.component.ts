import { Injector, Component, OnInit, ViewEncapsulation, AfterViewInit, ElementRef, ViewChild } from "@angular/core";
import { ReportInfo, AsposeServiceProxy, CM_DEPARTMENT_ENTITY, BranchServiceProxy, CM_BRANCH_ENTITY, CM_DIVISION_ENTITY, DepartmentServiceProxy, CM_SUPPLIER_ENTITY } from "@shared/service-proxies/service-proxies";
import { appModuleAnimation } from "@shared/animations/routerTransition";
import { FileDownloadService } from "@shared/utils/file-download.service";
import { ReportTypeConsts } from "@app/admin/core/ultils/consts/ReportTypeConsts";
import { DefaultComponentBase } from "@app/ultilities/default-component-base";
import { PreviewTemplateService } from "@app/admin/common/preview-template/preview-template.service";
import * as moment from 'moment';
import { BranchModalComponent } from "@app/admin/core/controls/branch-modal/branch-modal.component";
import { SupplierModalComponent } from "@app/admin/core/controls/supplider-modal/supplier-modal.component";
import { AuthStatusConsts } from "@app/admin/core/ultils/consts/AuthStatusConsts";
import { DateFormatPipe } from "@app/admin/core/pipes/date-format.pipe";
import { ReportTemplateModalComponent } from "@app/admin/core/controls/report-template-modal/report-template-modal.component";
import { Select2CustomComponent } from "@app/admin/core/controls/custom-select2/select2-custom.component";

@Component({
    templateUrl: './ass-list-asset-grow.component.html',
    encapsulation: ViewEncapsulation.None,
    animations: [appModuleAnimation()]
})

export class AssListAssetGrowComponent extends DefaultComponentBase implements OnInit, AfterViewInit {

    hidden: boolean = false;

    filterInput: any = {};

    levels: any[];
    suppliers: any[];
    branchType: string;
    currentBranchIdField: string;
    currentBranchNameField: string;
    // assTypes: any = [{ TYPE_ID: 'TSCD', TYPE_NAME: 'TSCD' }, { TYPE_ID: 'CCLD', TYPE_NAME: 'CCLD' }];

    ngAfterViewInit(): void {
        // COMMENT: this.stopAutoUpdateView();
        this.setupValidationMessage();
    }

    constructor(injector: Injector,
        private fileDownloadService: FileDownloadService,
        private asposeService: AsposeServiceProxy,
        private previewTemplateService: PreviewTemplateService) {
        super(injector);

    }

    @ViewChild('editForm') editForm: ElementRef;
    @ViewChild('branchModal') branchModal: BranchModalComponent;
    @ViewChild('supplierModal') supplierModal: SupplierModalComponent;
    @ViewChild('reportTemplate') reportTemplate: ReportTemplateModalComponent;
    @ViewChild('depSelect') depSelect: Select2CustomComponent;

    isShowError = false;

    ngOnInit(): void {
        this.levels = this.getLevelsCombobox();
        this.filterInput.BRANCH_ID = this.appSession.user.subbrId;
        this.filterInput.BRANCH_NAME = this.appSession.user.branchName;
        this.filterInput.BRANCH_LOGIN = this.appSession.user.subbrId;
        this.branchType = this.appSession.user.branch.brancH_TYPE;
        this.filterInput.LEVEL = 'ALL';
        this.filterInput.ASSET_TYPE = 'TSCD';
        this.filterInput.dateFrom = moment().startOf('month');
        this.filterInput.dateTo = moment().endOf('month');
        this.filterInput.PriceFrom = 0;
        this.filterInput.PriceTo = 0;
        this.suppliers = [];
    }


    exportToExcel() {

        if ((this.editForm as any).form.invalid) {
            this.isShowError = true;
            this.showErrorMessage(this.l('FormInvalid'));
            this.updateView();
            return;
        }
        if (this.filterInput.dateFrom > this.filterInput.dateTo) {
            this.isShowError = true;
            this.showErrorMessage(this.l('ToDTmustbiggerthanFromDT'));
            this.updateView();
            return;
        }
        if(this.filterInput.PriceFrom > this.filterInput.PriceTo){
            this.showErrorMessage(this.l('PriceToMustSmallerThanPriceFrom'));
            this.updateView();
            return;
        }
        this.resetPriceFromWhenGreater()

        let reportInfo = new ReportInfo();
        reportInfo.typeExport = ReportTypeConsts.Excel;

        var datePipe = new DateFormatPipe();
        this.filterInput.Todate = datePipe.transform(this.filterInput.dateTo);
        this.filterInput.Fromdate = datePipe.transform(this.filterInput.dateFrom);
        reportInfo.parameters = this.GetParamsFromFilter(this.filterInput);

        reportInfo.values = this.GetParamsFromFilter({
            branchCode: this.appSession.user.branchCode,
            branchName: this.appSession.user.branchName,
            level: this.levels.filter(x => x.value == this.filterInput.LEVEL)[0].display,
            fullName: this.appSession.user.name,
            datePrint: (new DateFormatPipe()).transform(moment()),
            A4: (this.l('FromDate').toUpperCase() + ' ' + this.filterInput.Fromdate + ' ' + this.l('ToDate').toUpperCase() + ' ' + this.filterInput.Todate)
        });

        reportInfo.pathName = "/REPORT/TSCD_BC01.xlsx";
        reportInfo.storeName = "rpt_TSCD_BC01_Excel";

        this.asposeService.getReport(reportInfo).subscribe(x => {
            this.fileDownloadService.downloadTempFile(x);
            this.showSuccessMessage(this.l('ExportFileSuccess'));

            this.updateView();
        });
    }

    resetPriceFromWhenGreater(): void {
        if (this.filterInput.PriceFrom > this.filterInput.PriceTo)
            this.filterInput.PriceFrom = 0;
    }

    showBranchModal() {
        this.branchModal.filterInput.brancH_LOGIN = this.appSession.user.subbrId;
        this.branchModal.show();
    }

    showSupplierModal() {
        this.supplierModal.filterInput.recorD_STATUS = '1';
        this.supplierModal.filterInput.autH_STATUS = AuthStatusConsts.Approve;
        this.supplierModal.show();
    }

    onSelectBranch(branch: CM_BRANCH_ENTITY) {
        if(!branch.brancH_ID)
            return;
        this.filterInput.BRANCH_ID = branch.brancH_ID;
        this.branchType = branch.brancH_TYPE;
        if (this.branchType != 'HS') {
            this.filterInput.DEP_ID = '';
            this.depSelect.setSingleValue('', '');
        }
        this.filterInput.BRANCH_NAME = branch.brancH_NAME;
        this.updateView();
    }

    printPreview() {
        if ((this.editForm as any).form.invalid) {
            this.isShowError = true;
            this.showErrorMessage(this.l('FormInvalid'));
            this.updateView();
            return;
        }
        if (this.filterInput.dateFrom > this.filterInput.dateTo) {
            this.isShowError = true;
            this.showErrorMessage(this.l('ToDTmustbiggerthanFromDT'));
            this.updateView();
            return;
        }
        if(this.filterInput.PriceFrom > this.filterInput.PriceTo){
            this.showErrorMessage(this.l('PriceToMustSmallerThanPriceFrom'));
            this.updateView();
            return;
        }

        this.resetPriceFromWhenGreater()
        var str = '';
        var datePipe = new DateFormatPipe();
        if (this.filterInput.dateFrom)
            str += ' ' + this.l('FromDate') + ' ' + datePipe.transform(this.filterInput.dateFrom)
                + ' ' + this.l('ToDate').toLowerCase() + ' ' + datePipe.transform(this.filterInput.dateTo);
        else
            str += ' ' + this.l('ToDate') + ' ' + datePipe.transform(this.filterInput.dateTo);

        this.filterInput.Todate = datePipe.transform(this.filterInput.dateTo);
        this.filterInput.Fromdate = datePipe.transform(this.filterInput.dateFrom);
        let parameters = this.GetParamsFromFilter(this.filterInput);
        let values = this.GetParamsFromFilter({
            level: this.filterInput.LEVEL == 'UNIT' ? this.l('Branch') : this.l('AllGoods'),
            fullName: this.appSession.user.name,
            datePrint: datePipe.transform(moment()),
            branchId: this.appSession.user.subbrId,
            branchName: this.appSession.user.branchName,
            A5: str,
        });

        this.reportTemplate.show('AssListAssetGrow_Report', parameters, values);
    }

}
