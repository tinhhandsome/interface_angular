import { Injector, Component, OnInit, ViewEncapsulation, AfterViewInit, ViewChild, ElementRef } from "@angular/core";
import { ReportInfo, AsposeServiceProxy, CM_BRANCH_ENTITY, CM_TERM_ENTITY, TermServiceProxy } from "@shared/service-proxies/service-proxies";
import { appModuleAnimation } from "@shared/animations/routerTransition";
import { FileDownloadService } from "@shared/utils/file-download.service";
import { ReportTypeConsts } from "@app/admin/core/ultils/consts/ReportTypeConsts";
import { DefaultComponentBase } from "@app/ultilities/default-component-base";
import * as moment from 'moment';
import { Select2CustomComponent } from "@app/admin/core/controls/custom-select2/select2-custom.component";

@Component({
    templateUrl: './ass-list-asset-thua-thieu-saoke.component.html',
    encapsulation: ViewEncapsulation.None,
    animations: [appModuleAnimation()]
})

export class AssListAssetThuaThieuSaoKe extends DefaultComponentBase implements OnInit, AfterViewInit {

    didsableInput: boolean = true;
    terms: CM_TERM_ENTITY[] = [];
    filterInput: any = {};

    termName: string = '';
    levels: any[];
    isShowError: boolean = false;
    branchType: string;
    assTypes: any = [{ TYPE_ID: 'TSCD', TYPE_NAME: 'TSCD' }, { TYPE_ID: 'CCLD', TYPE_NAME: 'CCLD' }]

    @ViewChild('exportForm') exportForm: ElementRef;
    @ViewChild('depSelect') depSelect: Select2CustomComponent;

    ngAfterViewInit(): void {
        // COMMENT: this.stopAutoUpdateView();
        this.setupValidationMessage();
    }

    constructor(injector: Injector,
        private fileDownloadService: FileDownloadService,
        private asposeService: AsposeServiceProxy,
        private termService: TermServiceProxy) {
        super(injector);
    }


    ngOnInit(): void {
        this.levels = this.getLevelsCombobox();
        this.branchType = this.appSession.user.branch.brancH_TYPE;
        this.initTerms();
        this.filterInput.BRANCH_LOGIN = this.appSession.user.subbrId;
        this.filterInput.LEVEL = 'ALL';
        this.filterInput.BRANCH_ID = this.appSession.user.subbrId;
        this.filterInput.BRANCH_NAME = this.appSession.user.branchName;
        this.filterInput.FROMDATE = moment().startOf('year');
        this.filterInput.TODATE = moment().endOf('year');
        this.filterInput.TYPE_ID = this.assTypes[0].TYPE_ID;
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
        this.didsableInput = true;
        if (!this.filterInput.TERM_ID)
            this.filterInput.TERM_ID = '';
        if (!this.filterInput.TYPE_ID)
            this.filterInput.TYPE_ID = '';
        if (!this.filterInput.FROMDATE)
            this.filterInput.FROMDATE = '';

        let reportInfo = new ReportInfo();
        reportInfo.typeExport = ReportTypeConsts.Excel;
        reportInfo.values = this.GetParamsFromFilter({
            headerInput: 'DANH SÁCH ' + (this.filterInput.TYPE_ID ? this.filterInput.TYPE_ID : 'TÀI SẢN') + ' THỪA, THIẾU SO VỚI SAO KÊ ' + this.filterInput.l_NGAYSAOKE.format('DD/MM/YYYY'),
            branchInput: 'ĐƠN VỊ: ' + this.filterInput.BRANCH_NAME.toUpperCase(),
            FULL_NAME: this.appSession.user.name,
            DATE : moment().format("DD/MM/YYYY"),
        });

        this.filterInput.DEP_ID = (this.filterInput.DEP_ID) ? this.filterInput.DEP_ID : '';
        reportInfo.parameters = this.GetParamsFromFilter(this.filterInput);

        reportInfo.pathName = "/REPORT/TSCD_BC05" + (this.filterInput.TYPE_ID? '_' + this.filterInput.TYPE_ID : '')  + ".xlsx";
        reportInfo.storeName = "rpt_TSCD_BC05_Excel";

        this.asposeService.getReport(reportInfo).subscribe(x => {
            this.fileDownloadService.downloadTempFile(x);
            this.didsableInput = false;
            this.showSuccessMessage(this.l('ExportFileSuccess'));
            this.updateView();
        });
    }

    initTerms(): void {

        this.termService.cM_TERM_Search(this.getFillterForCombobox()).subscribe(Result => {
            this.didsableInput = false;
            this.terms = Result.items;
            this.updateView();
        });

    }

    // getItemName(event: CM_TERM_ENTITY) {
    //     if(!event)
    //         return;
    //     this.termName = event.terM_NAME;
    //     this.filterInput.TERM_ID = event.terM_ID;
    // }

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
}
