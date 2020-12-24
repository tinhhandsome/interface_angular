import { Injector, Component, OnInit, ViewEncapsulation, AfterViewInit, ViewChild, ElementRef } from "@angular/core";
import { ReportInfo, AsposeServiceProxy, CM_DEPARTMENT_ENTITY, BranchServiceProxy, CM_BRANCH_ENTITY, CM_DIVISION_ENTITY, DepartmentServiceProxy, CM_SUPPLIER_ENTITY, CM_GOODS_ENTITY, TLUSER_GETBY_BRANCHID_ENTITY, CM_GOODSTYPE_REAL_ENTITY, ASS_MASTER_ENTITY } from "@shared/service-proxies/service-proxies";
import { appModuleAnimation } from "@shared/animations/routerTransition";
import { FileDownloadService } from "@shared/utils/file-download.service";
import { ReportTypeConsts } from "@app/admin/core/ultils/consts/ReportTypeConsts";
import { DefaultComponentBase } from "@app/ultilities/default-component-base";
import * as moment from 'moment';
import { Select2CustomComponent } from "@app/admin/core/controls/custom-select2/select2-custom.component";
import { BranchModalComponent } from "@app/admin/core/controls/branch-modal/branch-modal.component";
import { AssGroupModalComponent } from "@app/admin/core/controls/ass-group-modal/ass-group-modal.component";
import { AssetModalComponent } from "@app/admin/core/controls/asset-modal/asset-modal.component";

@Component({
    templateUrl: './hcqt-bc01.component.html',
    encapsulation: ViewEncapsulation.None,
    animations: [appModuleAnimation()]
})

export class HCQTStorageAsset extends DefaultComponentBase implements OnInit, AfterViewInit {
    filterInput: any = {};
    isShowError: boolean = false;
    @ViewChild('reportForm') reportForm: ElementRef;

    currentAssetCode: string;

    levels: any[];

    @ViewChild('branchModal') branchModal: BranchModalComponent;
    @ViewChild('assetModal') assetModal: AssetModalComponent;


    ngAfterViewInit(): void {
        this.setupValidationMessage();

        this.updateView();
    }

    constructor(injector: Injector,
        private fileDownloadService: FileDownloadService,
        private asposeService: AsposeServiceProxy) {
        super(injector);
        this.levels = this.getLevelsCombobox();

        this.filterInput.BranchLogin = this.appSession.user.subbrId;
        this.filterInput.Level = 'ALL';
        this.filterInput.Fromdate = "";
        this.filterInput.Todate = moment();
        this.filterInput.Asset_Type = undefined;
        this.filterInput.UserLogin = this.appSession.user.name;
    }


    ngOnInit(): void {




        // this.updateView();
    }

    assetModalShow() {
        this.assetModal.filterInput.brancH_LOGIN = this.appSession.user.subbrId;
        this.assetModal.filterInput.brancH_ID = this.appSession.user.subbrId;
        this.assetModal.filterInput.brancH_NAME = this.appSession.user.branchName;
        this.assetModal.filterInput.level = "ALL";

        this.assetModal.show();

    }
    branchModalShow() {
        this.branchModal.filterInput.brancH_LOGIN = this.appSession.user.subbrId;
        this.branchModal.show();

    }
    exportToExcel() {
        if ((this.reportForm as any).form.invalid) {
            this.isShowError = true;
            this.showErrorMessage(this.l('FormInvalid'));
            this.updateView();
            return;
        }
        let reportInfo = new ReportInfo();
        reportInfo.typeExport = ReportTypeConsts.Excel;

        if (!this.filterInput.Asset_Id) {
            this.filterInput.Asset_Id = '';
        }

        if (!this.filterInput.Branch_Receive) {
            this.filterInput.Branch_Receive = this.appSession.user.subbrId;
        }

        if (!this.filterInput.Asset_Type) {
            this.filterInput.Asset_Type = '';
        }

        if (!this.filterInput.Asset_Group) {
            this.filterInput.Asset_Group = '';
        }

        if (!this.filterInput.Level) {
            this.filterInput.Level = '';
        }
        reportInfo.parameters = this.GetParamsFromFilter(this.filterInput);

        reportInfo.values = this.GetParamsFromFilter({
            B3: this.l('Branch').toUpperCase() + ': ' + this.appSession.user.branchName,
            A5: this.l('To') + ': ' + this.filterInput.Todate.format('DD/MM/YYYY'),
            A6: "Tại đơn vị: " + this.appSession.user.branchName,
            A7: this.l('RemainValue') + ' ' + this.l('ToDate').toLowerCase() + ' ' + this.filterInput.Todate.format('DD/MM/YYYY'),
        });

  

        reportInfo.pathName = "/REPORT/HCQT_StorageAsset.xlsx";
        reportInfo.storeName = "rpt_HCQT_1_TAISANLUUKHO";

        this.asposeService.getReport(reportInfo).subscribe(x => {
            this.fileDownloadService.downloadTempFile(x);
            this.showSuccessMessage(this.l('ExportFileSuccess'));

        });
    }

    onSelectAsset(asset: ASS_MASTER_ENTITY) {
        this.filterInput[this.currentAssetCode] = asset.asseT_CODE;
    }

    // printPreview() {



    //     this.previewTemplateService.printReportTemplate("TSCD_BC16A", parameters, values);
    // }

}
