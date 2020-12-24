import { ListComponentBase } from "@app/ultilities/list-component-base";
import { Injector, Component, OnInit, ViewEncapsulation, AfterViewInit, ViewChild } from "@angular/core";
import { UPDATE_DATE_LIST_ENTITY, UpdateDateListServiceProxy, ASS_MASTER_ENTITY, ReportInfo, AsposeServiceProxy } from "@shared/service-proxies/service-proxies";
import { IUiAction } from "@app/ultilities/ui-action";
import { appModuleAnimation } from "@shared/animations/routerTransition";
import { FileDownloadService } from "@shared/utils/file-download.service";
import { finalize } from "rxjs/operators";
import { AuthStatusConsts } from "@app/admin/core/ultils/consts/AuthStatusConsts";
import { AssetModalComponent } from "@app/admin/core/controls/asset-modal/asset-modal.component";
import { ReportTypeConsts } from "@app/admin/core/ultils/consts/ReportTypeConsts";

@Component({
    templateUrl: './update-date-list.component.html',
    encapsulation: ViewEncapsulation.None,
    animations: [appModuleAnimation()]
})

export class UpdateDateListComponent extends ListComponentBase<UPDATE_DATE_LIST_ENTITY> implements IUiAction<UPDATE_DATE_LIST_ENTITY>, AfterViewInit, OnInit {
    @ViewChild('assetModal') assetModal: AssetModalComponent;
    filterInput: UPDATE_DATE_LIST_ENTITY = new UPDATE_DATE_LIST_ENTITY();
    totalcount: number;
    isShowError = false;

    constructor(
        injector: Injector,
        private asposeService: AsposeServiceProxy,
        private fileDownloadService: FileDownloadService,
        private updateDateListService: UpdateDateListServiceProxy
    ) {
        super(injector);
        this.initFilter();
    }

    ngOnInit(): void {
        // set ui action
        this.appToolbar.setUiAction(this);
        // set role toolbar
        this.appToolbar.setRole('ToolUpdateDayList', true, true, false, true, true, true, false, true);
        this.appToolbar.setEnableForListPage();
    }

    ngAfterViewInit(): void {
        // COMMENT: this.stopAutoUpdateView();
    }

    initFilterInputSearch(): void {
        this.filterInput.level = "UNIT";
    }

    search(): void {
        this.showTableLoading();

        // if (!this.isGranted('Pages.Administration.AssCommonAssGroupList.Search')) {
        //     this.filterInputSearch = new ASS_AMORT_PEND_ENTITY();
        //     this.filterInputSearch.totalCount=this.totalcount;
        // }
        this.setSortingForFilterModel(this.filterInputSearch);
        this.appToolbar.setEnableForListPage();
        this.initFilterInputSearch();
        this.updateDateListService.uPDATE_DATE_LIST_Search(this.filterInputSearch)
            .pipe(finalize(() => this.hideTableLoading()))
            .subscribe(result => {
                this.dataTable.records = result.items;
                this.dataTable.totalRecordsCount = result.totalCount;
                this.filterInputSearch.totalCount = result.totalCount;
                this.totalcount = result.totalCount;
                this.appToolbar.setEnableForListPage();
                this.updateView();
            });
    }

    onAdd(): void {
        this.navigatePassParam('/app/admin/update-date-list-add', null, { filterInput: JSON.stringify(this.filterInputSearch) });
    }

    onUpdate(item: UPDATE_DATE_LIST_ENTITY): void {
        this.navigatePassParam('/app/admin/update-date-list-edit', { id: item.upD_DAY_ID }, { filterInput: JSON.stringify(this.filterInputSearch) });
    }

    onDelete(item: UPDATE_DATE_LIST_ENTITY): void {
        if (item.autH_STATUS == AuthStatusConsts.Approve) {
            this.showErrorMessage(this.l('YouCannotDeleteThisObject'));
            this.updateView();
            return;
        }
        this.message.confirm(
            this.l('DeleteWarningMessage', item.upD_DAY_ID),
            this.l('AreYouSure'),
            (isConfirmed) => {
                if (isConfirmed) {
                    this.saving = true;
                    this.updateDateListService.uPDATE_DATE_LIST_Del(item.upD_DAY_ID)
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
                            this.updateView();
                        });
                }
                this.updateView();
            }
        );
    }

    onApprove(item: UPDATE_DATE_LIST_ENTITY): void {

    }

    onViewDetail(item: UPDATE_DATE_LIST_ENTITY): void {
        this.navigatePassParam('/app/admin/update-date-list-view', { id: item.upD_DAY_ID }, { filterInput: JSON.stringify(this.filterInputSearch) });
    }

    onSave(): void {

    }

    exportToExcel(): void {
        this.initFilterInputSearch();
        let reportInfo = new ReportInfo();
        reportInfo.typeExport = ReportTypeConsts.Excel;

        let filterReport = { ...this.filterInputSearch }
        filterReport.maxResultCount = -1;
        filterReport.top = 0;

        reportInfo.parameters = this.GetParamsFromFilter(filterReport)

        reportInfo.values = this.GetParamsFromFilter({
            A1: this.l('CompanyReportHeader')
        });

        reportInfo.pathName = "/TOOL/rpt_update_date_list.xlsx";
        reportInfo.storeName = "T_UPD_DAY_ASS_Search";
        this.asposeService.getReport(reportInfo).subscribe(x => {
            this.fileDownloadService.downloadTempFile(x);
        });
    }

    onResetSearch(): void {
        // this.filterInput = new ASS_AMORT_PEND_ENTITY();
        // this.changePage(0);
    }

    showAssetModal() {
        this.assetModal.filterInput.level = "ALL";
        this.assetModal.show();
    }

    onSingleSelectAsset(asset: ASS_MASTER_ENTITY) {
        this.filterInput.asS_CODE = asset.asseT_CODE;
        this.filterInput.asS_ID = asset.asseT_ID;
    }
}
