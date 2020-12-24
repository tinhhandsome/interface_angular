import { ListComponentBase } from "@app/ultilities/list-component-base";
import { Injector, Component, OnInit, ViewEncapsulation, ViewChild, AfterViewInit } from "@angular/core";
import { RetRepairServiceProxy, RET_REPAIR_ENTITY, ASS_MASTER_ENTITY, CM_DIVISION_ENTITY, RET_MASTER_ENTITY, BranchServiceProxy, CM_BRANCH_ENTITY, ReportInfo, AsposeServiceProxy } from "@shared/service-proxies/service-proxies";
import { IUiAction } from "@app/ultilities/ui-action";
import { appModuleAnimation } from "@shared/animations/routerTransition";
import { LazyLoadEvent } from "primeng/api";
import { finalize } from "rxjs/operators";
import { AssetModalComponent } from "@app/admin/core/controls/asset-modal/asset-modal.component";
import { DivisionModalComponent } from "@app/admin/core/controls/division-modal/division-modal.component";
import { RecordStatusConsts } from "@app/admin/core/ultils/consts/RecordStatusConsts";
import { ReportTypeConsts } from "@app/admin/core/ultils/consts/ReportTypeConsts";
import { FileDownloadService } from "@shared/utils/file-download.service";

@Component({
    templateUrl: './ret-repair-list.component.html',
    encapsulation: ViewEncapsulation.None,
    animations: [appModuleAnimation()]
})

export class RetRepairListComponent extends ListComponentBase<RET_REPAIR_ENTITY> implements IUiAction<RET_REPAIR_ENTITY>, OnInit, AfterViewInit {
    ngAfterViewInit(): void {
        this.updateView();

    }
    @ViewChild('assetModal') assetModal: AssetModalComponent;
    @ViewChild('divisionModal') divModal: DivisionModalComponent;

    BranchList: CM_BRANCH_ENTITY[];

    filterInput: RET_REPAIR_ENTITY = new RET_REPAIR_ENTITY();

    constructor(injector: Injector,
        private _retMasterService: RetRepairServiceProxy,
        private _branchService: BranchServiceProxy,
        private fileDownloadService: FileDownloadService,
        private asposeService: AsposeServiceProxy) {
        super(injector);
        // COMMENT: this.stopAutoUpdateView();
        // this.filterInput.offeR_BRANCH = this.appSession.user.subbrId;
        this.initFilter();
    }

    initDefaultFilter() {
        this.filterInput.level = "UNIT";
        this.filterInput.repaiR_AMT = 0;
        this.filterInput.top = 0;
        this.filterInput.searcH_TYPE = "A";
        this.filterInput.offeR_BRANCH = this.appSession.user.subbrId;

    }



    ngOnInit(): void {

        // set ui action
        this.appToolbar.setUiAction(this);
        this._branchService.cM_BRANCH_Search(this.getFillterForCombobox()).subscribe(result => {
            this.BranchList = result.items;
            this.updateView();
        });

        //initialize modal input
        this.appToolbar.setRole('RetRepair', true, true, false, true, true, true, false, true);
        this.appToolbar.setEnableForListPage();
    }

    search(event?: LazyLoadEvent) {

        this.showTableLoading();

        this.setSortingForFilterModel(this.filterInputSearch);
        this._retMasterService.rET_REPAIR_Search(this.filterInputSearch)
            .pipe(finalize(() => this.hideTableLoading()))
            .subscribe(result => {
                this.dataTable.records = result.items;
                this.dataTable.totalRecordsCount = result.totalCount;
                this.filterInputSearch.totalCount = result.totalCount;
                this.appToolbar.setEnableForListPage();
                this.updateView();

            });
    }


    onAdd(): void {
        this.navigatePassParam('/app/admin/ret-repair-add', null, { filterInput: JSON.stringify(this.filterInputSearch) });
    }

    onUpdate(item: RET_REPAIR_ENTITY): void {
        this.navigatePassParam('/app/admin/ret-repair-edit', { id: item.rP_ID }, { filterInput: JSON.stringify(this.filterInputSearch) });
    }

    onDelete(item: RET_REPAIR_ENTITY): void {
        this.message.confirm(
            this.l('DeleteWarningMessage', item.reT_ID),
            this.l('AreYouSure'),
            (isConfirmed) => {
                if (isConfirmed) {
                    this.saving = true;
                    this._retMasterService.rET_REPAIR_Del(item.rP_ID)
                        .pipe(finalize(() => { this.saving = false; }))
                        .subscribe((response) => {
                            if (response['Result'] != '0') {
                                this.showErrorMessage(response['ErrorDesc']);
                            }
                            else {
                                this.showSuccessMessage(this.l('SuccessfullyDeleted'));
                                this.filterInputSearch.totalCount = 0;
                                this.reloadPage();
                            }
                        });
                }
            }
        );
    }

    onApprove(): void {

    }

    onViewDetail(item: RET_REPAIR_ENTITY): void {
        this.navigatePassParam('/app/admin/ret-repair-view', { id: item.rP_ID }, { filterInput: JSON.stringify(this.filterInputSearch) });
    }

    onSave(): void {

    }


    onResetSearch(): void {
        this.filterInput = new RET_REPAIR_ENTITY();
        this.initDefaultFilter();
        this.changePage(0);
        this.updateView();
    }

    onRetFocusOut() {
        // this.assetModal.filterInput.brancH_ID = this.appSession.user.subbrId;
        // // this.assetModal.filterInput.asS_TYPE = this.assType;
        // this.assetModal.filterInput.asS_CAT = this.assCat;
        // this.assetModal.filterInput.brancH_LOGIN = this.appSession.user.subbrId;
        // this.assetModal.filterInput.level = this.level;
        // this.assetModal.show();
    }
        
    onSingleSelectRet(event: RET_MASTER_ENTITY) {
        this.filterInput.reT_ID = event.reT_ID;
    }
    onGetUnit(event){
        
    }

    
    exportToExcel(): void{

        let reportInfo = new ReportInfo();
        reportInfo.typeExport = ReportTypeConsts.Excel;

        let filterReport = {...this.filterInputSearch}
        
        // filterReport.maxResultCount = -1;
        // filterReport.totalCount = this.isNull(filterReport.totalCount) ? 0 : filterReport.totalCount;
        // filterReport.skipCount = 0;
        reportInfo.parameters = this.GetParamsFromFilter(filterReport)

        reportInfo.values = this.GetParamsFromFilter({
            A1: this.l('CompanyReportHeader')
        });

        reportInfo.pathName = "/RET_MASTER/rpt_ret_repair.xlsx";
        reportInfo.storeName = "RET_REPAIR_Search";

        this.asposeService.getReport(reportInfo).subscribe(x => {
            this.fileDownloadService.downloadTempFile(x);
        });
    }
}
