import { Injector, Component, OnInit, ViewEncapsulation, AfterViewInit, ViewChild, ElementRef } from "@angular/core";
import { ReportInfo, AsposeServiceProxy, CM_BRANCH_ENTITY, CM_DEPARTMENT_ENTITY } from "@shared/service-proxies/service-proxies";
import { appModuleAnimation } from "@shared/animations/routerTransition";
import { FileDownloadService } from "@shared/utils/file-download.service";
import { ReportTypeConsts } from "@app/admin/core/ultils/consts/ReportTypeConsts";
import { DefaultComponentBase } from "@app/ultilities/default-component-base";
import * as moment from 'moment';
import { Select2CustomComponent } from "@app/admin/core/controls/custom-select2/select2-custom.component";
import { PreviewTemplateService } from "@app/admin/common/preview-template/preview-template.service";
import { DateFormatPipe } from "@app/admin/core/pipes/date-format.pipe";
import { ReportTemplateModalComponent } from "@app/admin/core/controls/report-template-modal/report-template-modal.component";

@Component({
    templateUrl: './ass-list-all-asset.component.html',
    encapsulation: ViewEncapsulation.None,
    animations: [appModuleAnimation()]
})

export class AssListAllAssetComponent extends DefaultComponentBase implements OnInit, AfterViewInit {

    didsableInput: boolean = true;
    filterInput: any = {};

    levels: any[];
    isShowError: boolean = false;
    branchType: string;
    assTypes: any = [{ TYPE_ID: 'TSCD', TYPE_NAME: 'TSCD' }, { TYPE_ID: 'CCLD', TYPE_NAME: 'CCLD' }];
    remainValue: any = [{ priceID: '0', priceName: this.l('EqualToZero') }, { priceID: '1', priceName: this.l('GreaterThanZero') }];

    @ViewChild('exportForm') exportForm: ElementRef;
    @ViewChild('branchUseSelect')branchUseSelect: Select2CustomComponent;
    @ViewChild('reportTemplate') reportTemplate: ReportTemplateModalComponent;

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

    ngOnInit(): void {
        this.levels = this.getLevelsCombobox();
        this.branchType = this.appSession.user.branch.brancH_TYPE;
        this.filterInput.BRANCH_LOGIN = this.appSession.user.subbrId;
        this.filterInput.LEVEL = 'ALL';
        this.filterInput.BRANCH_ID = this.appSession.user.subbrId;
        this.filterInput.BRANCH_NAME = this.appSession.user.branchName;
        this.filterInput.FROMDATE = '';
        this.filterInput.TODATE = moment().endOf('month');
        this.filterInput.PRICEFROM = 0;
        this.filterInput.PRICETO = 0;
        this.filterInput.ASSET_TYPE = 'TSCD';
    }

    exportToExcel() {
        if ((this.exportForm as any).form.invalid) {
            this.isShowError = true;
            this.showErrorMessage(this.l('FormInvalid'));
            this.updateView();
            return;
        }

        if(this.filterInput.PRICEFROM > this.filterInput.PRICETO){
            this.showErrorMessage(this.l('PriceToMustSmallerThanPriceFrom'));
            this.updateView();
            return;
        }

        if (!this.filterInput.TODATE) {
            this.showErrorMessage(this.l('ChooseDateRequired'));
            this.updateView();
            return;
        }
        this.didsableInput = true;
        if (!this.filterInput.ASSET_TYPE)
            this.filterInput.ASSET_TYPE = '';
        if (!this.filterInput.SUPPLIERID)
            this.filterInput.SUPPLIERID = '';
        if (!this.filterInput.ASSETGROUPID)
            this.filterInput.ASSETGROUPID = '';
        if (!this.filterInput.EMPID)
            this.filterInput.EMPID = '';

        if (!this.filterInput.PRICEFROM)
            this.filterInput.PRICEFROM = 0;
        if (!this.filterInput.PRICETO)
            this.filterInput.PRICETO = 0;

        if (!this.filterInput.DEPT_ID)
            this.filterInput.DEPT_ID = '';

        if (!this.filterInput.PRICEEXISTS)
            this.filterInput.PRICEEXISTS = '';

        let reportInfo = new ReportInfo();
        reportInfo.typeExport = ReportTypeConsts.Excel;

        reportInfo.values = this.GetParamsFromFilter({
            toDateInput: (this.l('ToDate') + ' ' + this.filterInput.TODATE.format('DD/MM/YYYY')).toUpperCase(),
            branchIdInput: this.appSession.user.subbrId,
            fullName: this.appSession.user.name,
            userEmailInput: this.appSession.user.emailAddress,
            levelInput: this.levels.filter(x => x.value == this.filterInput.LEVEL)[0].display,
            datePrintInput: moment().format('DD/MM/YYYY')
        });


        reportInfo.parameters = this.GetParamsFromFilter(this.filterInput);

        reportInfo.pathName = "/REPORT/TSCD_BC01_1.xlsx";
        reportInfo.storeName = "rpt_TSCD_BC01_1_Excel";

        this.asposeService.getReport(reportInfo).subscribe(x => {
            this.fileDownloadService.downloadTempFile(x);
            this.showSuccessMessage(this.l('ExportFileSuccess'));
            this.updateView();
        });
    }

    showReportTemplate(){
        if ((this.exportForm as any).form.invalid) {
            this.isShowError = true;
            this.showErrorMessage(this.l('FormInvalid'));
            this.updateView();
            return;
        }
        
        let parameters = this.GetParamsFromFilter(this.filterInput);
        let values = this.GetParamsFromFilter({
            branchCode: this.appSession.user.branchCode,
            branchName: this.appSession.user.branchName,
            datePrint: (new DateFormatPipe()).transform(moment()),
            toDate: this.filterInput.TODATE.format("DD/MM/YYYY"),
            level: this.filterInput.LEVEL == 'ALL' ? this.l('AllGoods') : this.l('Branch'),
            fullName: this.appSession.user.name
        });

        this.reportTemplate.show('AssListAllAsset_report', parameters, values)
    }

    onSelectDep(dep: CM_DEPARTMENT_ENTITY): void {
        this.filterInput.DEP_CODE = dep.deP_CODE;
        this.filterInput.DEPT_ID = dep.deP_ID;
        this.filterInput.DEP_NAME = dep.deP_NAME;
    }

    onSelectBranch(branch: CM_BRANCH_ENTITY) {
        if(!branch.brancH_ID)
            return;
        this.branchType = branch.brancH_TYPE;
        if(this.branchType != 'HS')
            this.filterInput.DEPT_ID = this.filterInput.DEP_NAME = '';
        this.filterInput.BRANCH_ID = branch.brancH_ID;
        this.filterInput.BRANCH_NAME = branch.brancH_NAME;
    }

}
