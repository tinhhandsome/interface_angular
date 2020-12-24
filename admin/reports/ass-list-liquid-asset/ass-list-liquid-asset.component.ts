import { Injector, Component, OnInit, ViewEncapsulation, AfterViewInit, ViewChild, ElementRef } from "@angular/core";
import { ReportInfo, AsposeServiceProxy, CM_BRANCH_ENTITY, CM_TERM_ENTITY, TermServiceProxy, CM_DEPARTMENT_ENTITY } from "@shared/service-proxies/service-proxies";
import { appModuleAnimation } from "@shared/animations/routerTransition";
import { FileDownloadService } from "@shared/utils/file-download.service";
import { ReportTypeConsts } from "@app/admin/core/ultils/consts/ReportTypeConsts";
import { DefaultComponentBase } from "@app/ultilities/default-component-base";
import * as moment from 'moment';
import { Select2CustomComponent } from "@app/admin/core/controls/custom-select2/select2-custom.component";
import { PreviewTemplateService } from "@app/admin/common/preview-template/preview-template.service";
import { ReportTemplateModalComponent } from "@app/admin/core/controls/report-template-modal/report-template-modal.component";
import { DateFormatPipe } from "@app/admin/core/pipes/date-format.pipe";

@Component({
    templateUrl: './ass-list-liquid-asset.component.html',
    encapsulation: ViewEncapsulation.None,
    animations: [appModuleAnimation()]
})

export class AssListLiquidAssetComponent extends DefaultComponentBase implements OnInit, AfterViewInit {

    didsableInput: boolean = true;
    terms: CM_TERM_ENTITY[] = [];
    filterInput: any = {};
    branchType: string;
    termName: string = '';
    levels: any[];
    assTypes: any;
    isBranchUseSelected: boolean = false;
    isShowError: boolean = false;
    @ViewChild('exportForm') exportForm: ElementRef;
    @ViewChild('branchUseSelect') branchUseSelect: Select2CustomComponent;
    @ViewChild('reportTemplate') reportTemplate: ReportTemplateModalComponent;
    @ViewChild('depSelect') depSelect: Select2CustomComponent;

    ngAfterViewInit(): void {
        // COMMENT: this.stopAutoUpdateView();
        this.setupValidationMessage();
    }

    constructor(injector: Injector,
        private fileDownloadService: FileDownloadService,
        private asposeService: AsposeServiceProxy,
        private termService: TermServiceProxy,
        private previewTemplateService: PreviewTemplateService) {
        super(injector);
    }

    ngOnInit(): void {
        this.levels = this.getLevelsCombobox();
        this.assTypes = [{ TYPE_ID: 'TSCD', TYPE_NAME: 'TSCD' }, { TYPE_ID: 'CCLD', TYPE_NAME: 'CCLD' }];
        this.branchType = this.appSession.user.branch.brancH_TYPE;

        this.filterInput.BRANCH_LOGIN = this.appSession.user.subbrId;
        this.filterInput.LEVEL = 'ALL';
        this.filterInput.BRANCH_ID = this.appSession.user.subbrId;
        this.filterInput.BRANCH_NAME = this.appSession.user.branchName;
        this.filterInput.FROMDATE = moment().startOf('month');
        this.filterInput.TODATE = moment().endOf('month');
        this.filterInput.PRICEFROM = 0;
        this.filterInput.PRICETO = 0;
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
        if(this.filterInput.PRICEFROM > this.filterInput.PRICETO){
            this.showErrorMessage(this.l('PriceToMustSmallerThanPriceFrom'));
            this.updateView();
            return;
        }

        this.didsableInput = true;

        if (!this.filterInput.SUPPLIERID)
            this.filterInput.SUPPLIERID = '';
        if (!this.filterInput.ASSET_GROUP_ID)
            this.filterInput.ASSET_GROUP_ID = '';
        if (!this.filterInput.ASSET_TYPE)
            this.filterInput.ASSET_TYPE = '';
        if (!this.filterInput.USER_ID)
            this.filterInput.USER_ID = '';
        if (!this.filterInput.PRICEFROM)
            this.filterInput.PRICEFROM = 0;
        if (!this.filterInput.FROMDATE)
            this.filterInput.FROMDATE = '';
        if (!this.filterInput.PRICETO)
            this.filterInput.PRICETO = 0;
        if (!this.filterInput.BRANCH_ID_USE)
            this.filterInput.BRANCH_ID_USE = 0;
        // if (!this.filterInput.DEP_NAME)
        //     this.filterInput.DEP_ID = '';

        this.setDefaultValueIfSmaller()
        let reportInfo = new ReportInfo();
        reportInfo.typeExport = ReportTypeConsts.Excel;

        reportInfo.values = this.GetParamsFromFilter({
            branchCode: this.appSession.user.branchCode,
            branchName: this.appSession.user.branchName,
            fromDateToDateInput:
                (this.l('FromDate') + ' ' + ((this.filterInput.FROMDATE != '') ? this.filterInput.FROMDATE.format('DD/MM/YYYY') : '')
                    + ' ' + this.l('ToDate') + ' ' + this.filterInput.TODATE.format('DD/MM/YYYY')).toUpperCase(),
            username: this.appSession.user.name,
            datePrintInput: moment().format('DD/MM/YYYY'),
            levelInput: this.levels.filter(x => x.value == this.filterInput.LEVEL)[0].display
        });


        reportInfo.parameters = this.GetParamsFromFilter(this.filterInput);

        reportInfo.pathName = "/REPORT/TSCD_BC17.xlsx";
        reportInfo.storeName = "rpt_TSCD_BC017_Excel";

        this.asposeService.getReport(reportInfo).subscribe(x => {
            this.fileDownloadService.downloadTempFile(x);
            this.showSuccessMessage(this.l('ExportFileSuccess'));
            this.updateView();
        });
    }

    showReportTemplate() {
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
        if(this.filterInput.PRICEFROM > this.filterInput.PRICETO){
            this.showErrorMessage(this.l('PriceToMustSmallerThanPriceFrom'));
            this.updateView();
            return;
        }
        // if (!this.filterInput.DEP_NAME)
        //     this.filterInput.DEP_ID = '';
        this.setDefaultValueIfSmaller()
        let parameters = this.GetParamsFromFilter(this.filterInput);
        let values = this.GetParamsFromFilter({
            branchId: this.appSession.user.subbrId,
            branchName: this.appSession.user.branchName,
            branch: this.filterInput.BRANCH_NAME,
            fromDateToDate: this.l('FromDate') + ' ' + (new DateFormatPipe()).transform(this.filterInput.FROMDATE) + ' ' +
                this.l('ToDate').toLowerCase() + ' ' + (new DateFormatPipe()).transform(this.filterInput.TODATE),
            datePrint: (new DateFormatPipe()).transform(moment()),
            level: this.filterInput.LEVEL == 'ALL' ? this.l('AllGoods') : this.l('Branch'),
            fullName: this.appSession.user.name
        });
        this.reportTemplate.show('AssListLiquidAsset_report', parameters, values);
        // this.previewTemplateService.printReportTemplate('AssListLiquidAsset', parameters, values);
    }

    initTerms(): void {
        this.termService.cM_TERM_Search(this.getFillterForCombobox()).subscribe(Result => {
            this.didsableInput = false;
            this.terms = Result.items;
            this.updateView();
        });

    }

    getItemName(event: CM_TERM_ENTITY) {
        this.termName = event.terM_NAME;
        this.filterInput.terM_ID = event.terM_ID;
    }

    setDefaultValueIfSmaller() {
        if (this.filterInput.PRICEFROM > this.filterInput.PRICETO) {
            this.filterInput.PRICEFROM = 0;
        }
    }

    onSelectBranch(branch: CM_BRANCH_ENTITY) {
        if(!branch.brancH_ID)
            return;
        if (this.isBranchUseSelected)
            this.branchUseSelect.setSingleValue(branch.brancH_ID, branch.brancH_NAME);
        else {
            this.filterInput.BRANCH_ID = branch.brancH_ID;
            this.branchType = branch.brancH_TYPE;
            if (this.branchType != 'HS') {
                this.filterInput.DEP_ID = '';
                this.depSelect.setSingleValue('', '');
            }
            this.filterInput.BRANCH_NAME = branch.brancH_NAME;
            this.updateView();
        }
    }

    // onSelectDep(dep: CM_DEPARTMENT_ENTITY): void {
    //     this.filterInput.DEP_CODE = dep.deP_CODE;
    //     this.filterInput.DEP_ID = dep.deP_ID;
    //     this.filterInput.DEP_NAME = dep.deP_NAME;
    // }

}
