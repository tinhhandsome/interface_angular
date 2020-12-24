import { Injector, Component, OnInit, ViewEncapsulation, AfterViewInit, ViewChild, ElementRef } from "@angular/core";
import { ReportInfo, CM_DEPARTMENT_ENTITY, CM_BRANCH_ENTITY, ASS_MASTER_ENTITY, ASS_GROUP_ENTITY, ReportTemplateServiceProxy, AsposeServiceProxy, ReportColumn, AssTypeServiceProxy, BranchServiceProxy } from "@shared/service-proxies/service-proxies";
import { appModuleAnimation } from "@shared/animations/routerTransition";
import { FileDownloadService } from "@shared/utils/file-download.service";
import { ReportTypeConsts } from "@app/admin/core/ultils/consts/ReportTypeConsts";
import { DefaultComponentBase } from "@app/ultilities/default-component-base";
import { BranchModalComponent } from "@app/admin/core/controls/branch-modal/branch-modal.component";
import { AssGroupModalComponent } from "@app/admin/core/controls/ass-group-modal/ass-group-modal.component";
import { AssetModalComponent } from "@app/admin/core/controls/asset-modal/asset-modal.component";
import { DepartmentModalComponent } from "@app/admin/core/controls/dep-modal/department-modal.component";
import { PreviewTemplateService } from "@app/admin/common/preview-template/preview-template.service";
import { ReportKeyConsts } from "@app/admin/common/preview-template/ReportKeyConsts";
import { ReportTemplateModalComponent } from "@app/admin/core/controls/report-template-modal/report-template-modal.component";
import { ModalDirective } from "ngx-bootstrap";
import { NgForm } from "@angular/forms";

@Component({
    templateUrl: './ass-print-temp.component.html',
    encapsulation: ViewEncapsulation.None,
    animations: [appModuleAnimation()]
})

export class AssPrintTempComponent extends DefaultComponentBase implements OnInit, AfterViewInit {
    assTypes: any[];
    PrintQuantity: number = 1;
    filterInput: any = {};
    isShowError: boolean = false;

    branchs: CM_BRANCH_ENTITY[];

    @ViewChild('reportForm') reportForm: NgForm;

    currentAssetCode: string;

    levels: any[];

    @ViewChild('branchModal') branchModal: BranchModalComponent;
    @ViewChild('assetModal') assetModal: AssetModalComponent;
    @ViewChild('depModal') depModal: DepartmentModalComponent;
    @ViewChild('assetGroup') assetGroup: AssGroupModalComponent;
    @ViewChild('previewTemplateModal') previewTemplateModal: ReportTemplateModalComponent;


    ngAfterViewInit(): void {
        this.setupValidationMessage();
        // COMMENT: this.stopAutoUpdateView();
    }

    constructor(injector: Injector,
        private fileDownloadService: FileDownloadService,
        private asposeService: AsposeServiceProxy,
        private _reportTemplateService: ReportTemplateServiceProxy,
        private _previewTemplateService: PreviewTemplateService,
        private _assetTypeService: AssTypeServiceProxy,
        private _branchService: BranchServiceProxy) {
        super(injector);
        // console.log(this);
    }


    ngOnInit(): void {
        this._assetTypeService.aSS_TYPE_Search(this.getFillterForCombobox()).subscribe(result => {
            this.assTypes = result.items;
            this.updateView();
        })
        this._branchService.cM_BRANCH_Search(this.getFillterForCombobox()).subscribe(result => {
            this.branchs = result.items;
            this.updateView();
        })
        this.filterInput.BRANCH_FATHER = undefined;
        this.filterInput.BRANCH_LOGIN = this.appSession.user.subbrId;

        this.filterInput.NUMQR = 1;
        this.filterInput.ASSET_TYPE = 'TSCD';
        this.updateView();
    }

    assetModalShow() {
        this.assetModal.filterInput.brancH_LOGIN = this.appSession.user.subbrId;
        this.assetModal.filterInput.brancH_ID = this.appSession.user.subbrId;
        this.assetModal.filterInput.level = "ALL";

        this.assetModal.show();

    }
    branchModalShow() {
        this.branchModal.filterInput.brancH_LOGIN = this.appSession.user.subbrId;
        this.branchModal.show();

    }
    deptModalShow() {
        this.depModal.show();

    }
    assetGroupModalShow() {
        this.assetGroup.show();

    }
    exportToExcel() {
        if (this.filterInput.Fromdate > this.filterInput.Todate) {
            this.isShowError = true;
            this.showErrorMessage(this.l('FromDateMustSmallerThanToDate'));
            this.updateView();
            return;
        }
        if ((this.reportForm as any).form.invalid) {
            this.isShowError = true;
            this.showErrorMessage(this.l('FormInvalid'));
            this.updateView();
            return;
        }
        let reportInfo = new ReportInfo();
        reportInfo.typeExport = ReportTypeConsts.Excel;

        if (!this.filterInput.ASSET_ID) {
            this.filterInput.ASSET_ID = '';
        }

        if (!this.filterInput.ASSET_CODE) {
            this.filterInput.ASSET_CODE = '';
        }

        if (!this.filterInput.BRANCH_ID) {
            this.filterInput.BRANCH_ID = '';
        }

        if (!this.filterInput.ASSET_TYPE) {
            this.filterInput.ASSET_TYPE = '';
        }

        if (!this.filterInput.ASSET_GROUP) {
            this.filterInput.ASSET_GROUP = '';
        }
        if (!this.filterInput.TO_NUM) {
            this.filterInput.TO_NUM = '';
        }
        if (!this.filterInput.FROM_NUM) {
            this.filterInput.FROM_NUM = '';
        }
        if (!this.filterInput.DEPT_ID) {
            this.filterInput.DEPT_ID = '';
        }
        reportInfo.parameters = this.GetParamsFromFilter(this.filterInput);

        reportInfo.values = [];

        reportInfo.pathName = "/ASS_MASTER/BC_DS_TAISAN.xlsx";
        reportInfo.storeName = "rpt_ASS_PRINT_TEMP_Excel ";

        this.asposeService.getReport(reportInfo).subscribe(x => {
            this.fileDownloadService.downloadTempFile(x);
        });
    }
    exportToWord() {
        if (this.filterInput.Fromdate > this.filterInput.Todate) {
            this.isShowError = true;
            this.reportForm.form.controls['Fromdate']['errorMessage'] = this.l('FromDateMustSmallerThanToDate');
            this.showErrorMessage(this.l('FormInvalid'));
            // this.showErrorMessage(this.l('FromDateMustSmallerThanToDate'));
            this.updateView();
            return;
        }
        else {
            this.reportForm.form.controls['Fromdate']['errorMessage'] = undefined;
        }
        if ((this.reportForm as any).form.invalid) {
            this.isShowError = true;
            this.showErrorMessage(this.l('FormInvalid'));
            this.updateView();
            return;
        }

        // var defaultTemplate = response.reporT_TEMPLATE_DETAILs.find(x => x.isDefault == true);

        var reportInfo = new ReportInfo();
        if (!this.filterInput.ASSET_ID) {
            this.filterInput.ASSET_ID = '';
        }

        if (!this.filterInput.ASSET_CODE) {
            this.filterInput.ASSET_CODE = '';
        }

        if (!this.filterInput.BRANCH_ID) {
            this.filterInput.BRANCH_ID = '';
        }

        if (!this.filterInput.ASSET_TYPE) {
            this.filterInput.ASSET_TYPE = '';
        }

        if (!this.filterInput.ASSET_GROUP) {
            this.filterInput.ASSET_GROUP = '';
        }
        if (!this.filterInput.TO_NUM) {
            this.filterInput.TO_NUM = '';
        }
        if (!this.filterInput.FROM_NUM) {
            this.filterInput.FROM_NUM = '';
        }
        if (!this.filterInput.DEPT_ID) {
            this.filterInput.DEPT_ID = '';
        }
        this.filterInput.TOP = 1000;
        // this.previewTemplateModal.show("PrintTemp", this.GetParamsFromFilter(this.filterInput), []);
        this._previewTemplateService.printReportTemplate("PrintTemp", this.GetParamsFromFilter(this.filterInput), []);

    }


    // printPreview() {



    //     this.previewTemplateService.printReportTemplate("TSCD_BC16A", parameters, values);
    // }

    onSelectDepartment(event: CM_DEPARTMENT_ENTITY) {
        this.filterInput.DEPT_CODE = event.deP_CODE;
        this.filterInput.DEPT_ID = event.deP_ID;
        this.filterInput.DEPT_NAME = event.deP_NAME;
    }
    onSelectBranch(event: CM_BRANCH_ENTITY) {
        this.filterInput.BRANCH_NAME = event.brancH_NAME;
        this.filterInput.BRANCH_ID = event.brancH_ID;
        this.filterInput.BRANCH_FATHER = event.fatheR_ID;
        if (event.fatheR_ID) {
            this.filterInput.DEPT_CODE = '';
            this.filterInput.DEPT_ID = '';
            this.filterInput.DEPT_NAME = '';
        }
        this.updateView();
    }
    onSelectAsset(event: ASS_MASTER_ENTITY) {
        this.filterInput.ASSET_CODE = event.asseT_CODE;
        this.filterInput.ASSET_ID = event.asseT_ID;
        var branch = this.branchs.firstOrDefault(x => x.brancH_ID == event.brancH_ID);
        this.filterInput.Fromdate = event.usE_DATE;
        this.filterInput.Todate = event.usE_DATE;
        this.filterInput.ASSET_TYPE = event.typE_ID;
        if (branch) {
            this.onSelectBranch(branch);
            if (branch.fatheR_ID) {
                this.filterInput.DEPT_CODE = event.deP_CODE;
                this.filterInput.DEPT_ID = event.depT_ID;
                this.filterInput.DEPT_NAME = event.deP_NAME;
            }

        }
        // this.updateView();

    }
    onSelectAssetGroup(event: ASS_GROUP_ENTITY) {
        this.filterInput.ASSET_GROUP_NAME = event.grouP_NAME;
        this.filterInput.ASSET_GROUP = event.grouP_ID;

    }


}
