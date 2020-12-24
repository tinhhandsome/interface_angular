import { Injector, Component, OnInit, ViewEncapsulation, AfterViewInit, ElementRef, ViewChild } from "@angular/core";
import { ReportInfo, AsposeServiceProxy, CM_DEPARTMENT_ENTITY, BranchServiceProxy, CM_BRANCH_ENTITY, CM_DIVISION_ENTITY, DepartmentServiceProxy, CM_EMPLOYEE_ENTITY } from "@shared/service-proxies/service-proxies";
import { appModuleAnimation } from "@shared/animations/routerTransition";
import { FileDownloadService } from "@shared/utils/file-download.service";
import { ReportTypeConsts } from "@app/admin/core/ultils/consts/ReportTypeConsts";
import { DefaultComponentBase } from "@app/ultilities/default-component-base";
import { PreviewTemplateService } from "@app/admin/common/preview-template/preview-template.service";
import * as moment from 'moment';
import { Select2CustomComponent } from "@app/admin/core/controls/custom-select2/select2-custom.component";
import { BranchModalComponent } from "@app/admin/core/controls/branch-modal/branch-modal.component";
import { DateFormatPipe } from "@app/admin/core/pipes/date-format.pipe";
import { ReportTemplateModalComponent } from "@app/admin/core/controls/report-template-modal/report-template-modal.component";

@Component({
    templateUrl: './ccld-bc08-1.component.html',
    encapsulation: ViewEncapsulation.None,
    animations: [appModuleAnimation()]
})

export class CCLDBc08_1Component extends DefaultComponentBase implements OnInit, AfterViewInit {

    filterInput: any = {};

    levels: any[];

    @ViewChild('editForm') editForm: ElementRef;
    isShowError = false;

    branchType: string;

    currentSelect2: Select2CustomComponent;

    @ViewChild('branchUseSelect') branchUseSelect: Select2CustomComponent;
    @ViewChild('branchSelect') branchSelect: Select2CustomComponent;
    @ViewChild('reportTemplate') reportTemplate: ReportTemplateModalComponent;
    @ViewChild('branchModal') branchModal: BranchModalComponent;

    constructor(injector: Injector,
        private branchService: BranchServiceProxy,
        private fileDownloadService: FileDownloadService,
        private asposeService: AsposeServiceProxy,
        private previewTemplateService: PreviewTemplateService) {
        super(injector);
        // COMMENT: this.stopAutoUpdateView();
    }

    ngAfterViewInit(): void {

        // this.branchSelect.setValueDisplay([{ brancH_ID: this.appSession.user.subbrId, brancH_NAME: this.appSession.user.branchName, brancH_TYPE: this.appSession.user.branch.brancH_TYPE }], 'brancH_ID', 'brancH_NAME', false);
        // this.branchSelect.setSingleValue(this.appSession.user.subbrId, this.appSession.user.branchName);

        // this.filterInput.SP_BRANCH_ID = this.appSession.user.subbrId;
        this.currentSelect2 = this.branchSelect;
        this.branchService.cM_BRANCH_Search(this.getFillterForCombobox()).subscribe(x => {
            this.onSelectBranch(x.items.firstOrDefault(y => y.brancH_ID == this.appSession.user.subbrId));
        })
        this.filterInput.SP_BRANCH_ID = this.appSession.user.subbrId;

        this.updateView();
    }


    showBranchModal() {
        this.branchModal.filterInput.brancH_LOGIN = this.appSession.user.subbrId;
        this.branchModal.show();

    }
    ngOnInit(): void {
        // const $ = this;
        this.levels = this.getLevelsCombobox();
        this.filterInput.SP_BRANCH_LOGIN = this.appSession.user.subbrId;
        this.filterInput.SP_BRANCH_NAME = this.appSession.user.branchName;

        this.filterInput.SP_LEVEL = 'ALL';
        this.filterInput.SP_TODATE = moment();
        this.filterInput.SP_PRICEFROM = 0;
        this.filterInput.SP_PRICETO = 0;
        this.branchType = this.appSession.user.branch.brancH_TYPE;
        // this.branchSelect.setSingleValue(this.appSession.user.subbrId, this.appSession.user.branchName);

    }


    exportToExcel() {

        if ((this.editForm as any).form.invalid) {
            this.isShowError = true;
            this.showErrorMessage(this.l('FormInvalid'));
            this.updateView();
            return;
        }
      
        var ReportBranch = "";

        switch (this.filterInput.SP_LEVEL) {
            case "ALL":
                ReportBranch = "";
                break;
            case "UNIT":
                ReportBranch = "Tại đơn vị: " + this.filterInput.SP_BRANCH_NAME;
                break;

        }
        if (!this.filterInput.SP_DEP_ID) {
            this.filterInput.SP_DEP_ID = '';
        }

        let reportInfo = new ReportInfo();
        reportInfo.typeExport = ReportTypeConsts.Excel;

        reportInfo.parameters = this.GetParamsFromFilter(this.filterInput);

        reportInfo.values = this.GetParamsFromFilter({
            branchName: this.appSession.user.branch.brancH_NAME,
            A4: (this.l('ToDate') + ' ' + this.filterInput.SP_TODATE.format('DD/MM/YYYY')).toUpperCase(),
            A5: ReportBranch

        });

        reportInfo.pathName = "/REPORT/CCLD_BC08_1.xlsx";
        reportInfo.storeName = "rpt_CCLD_BC8_1";

        this.asposeService.getReport(reportInfo).subscribe(x => {
            this.fileDownloadService.downloadTempFile(x);
            this.showSuccessMessage(this.l('ExportFileSuccess'));
            this.updateView();
        });
        this.isShowError = false;
        this.updateView();
    }

    onComboboxBranchChange(branch: CM_BRANCH_ENTITY) {
        if (!branch) {
            return;
        }
        this.filterInput.SP_BRANCH_ID = branch.brancH_ID;
        this.filterInput.SP_BRANCH_NAME = branch.brancH_NAME;

        this.branchType = branch.brancH_TYPE;

        if (this.branchType != 'HS') {
            this.filterInput.SP_DEP_ID = '';
        }
    }

    showReportTemplate() {
        if ((this.editForm as any).form.invalid) {
            this.isShowError = true;
            this.showErrorMessage(this.l('FormInvalid'));
            this.updateView();
            return;
        }
        var ReportBranch = "";

        switch (this.filterInput.SP_LEVEL) {
            case "ALL":
                ReportBranch = "";
                break;
            case "UNIT":
                ReportBranch = "Tại đơn vị: " + this.filterInput.SP_BRANCH_NAME;
                break;

        }

        
        if (!this.filterInput.SP_DEP_ID) {
            this.filterInput.SP_DEP_ID = '';
        }

        let parameters = this.GetParamsFromFilter(this.filterInput);
        let values = this.GetParamsFromFilter({
            branchCode: this.appSession.user.branchCode,
            branchName: this.appSession.user.branchName,
            ReportBranch: ReportBranch,
            toDate: (new DateFormatPipe()).transform(this.filterInput.SP_TODATE),
            datePrint: (new DateFormatPipe()).transform(moment()),
            fullName: this.appSession.user.name
        });
        this.showSuccessMessage(this.l('ExportFileSuccess'));
        this.reportTemplate.show('CCLDBc08_1_report', parameters, values);
        this.isShowError = false;
        this.updateView();
    }



    onSelectBranch(branch: CM_BRANCH_ENTITY) {
        if (this.currentSelect2 == this.branchSelect) {
            if (branch.brancH_ID == this.appSession.user.subbrId) {
                this.branchSelect.setValueDisplay([branch], 'brancH_ID', 'brancH_NAME', false);
                // this.branchSelect.setSingleValue(branch.brancH_ID, branch.brancH_NAME);
            }
            else {
                this.branchSelect.setValueDisplay([branch, { brancH_ID: this.appSession.user.subbrId, brancH_NAME: this.appSession.user.branchName, brancH_TYPE: this.appSession.user.branch.brancH_TYPE }], 'brancH_ID', 'brancH_NAME', false);
                // this.branchSelect.setSingleValue(this.appSession.user.subbrId, this.appSession.user.branchName);

            }
            this.onComboboxBranchChange(branch);
            this.updateView();

        }
        else if (this.currentSelect2 == this.branchUseSelect) {
            this.currentSelect2.setSingleValue(branch.brancH_ID, branch.brancH_NAME);
            this.updateView();

        }
    }
    reloadMoney(){
        if(!this.filterInput.SP_PRICEFROM){
            this.filterInput.SP_PRICEFROM = 0;
        }
        if(!this.filterInput.SP_PRICETO){
            this.filterInput.SP_PRICETO = 0;
        }
        this.updateView();
    }

}
