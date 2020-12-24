import { ListComponentBase } from "@app/ultilities/list-component-base";
import { Injector, Component, OnInit, ViewChild, ViewEncapsulation, AfterViewInit } from "@angular/core";
import { AdjustPriceServiceProxy, T_ADJUST_ASS_ENTITY, ASS_MASTER_ENTITY, ReportInfo, AsposeServiceProxy } from "@shared/service-proxies/service-proxies";
import { IUiAction } from "@app/ultilities/ui-action";
import { appModuleAnimation } from "@shared/animations/routerTransition";
import { FileDownloadService } from "@shared/utils/file-download.service";
import { finalize } from "rxjs/operators";
import { AssetModalComponent } from "@app/admin/core/controls/asset-modal/asset-modal.component";
import { AuthStatusConsts } from "@app/admin/core/ultils/consts/AuthStatusConsts";
import { ReportTypeConsts } from "@app/admin/core/ultils/consts/ReportTypeConsts";

@Component({
    templateUrl: './adjust-price-list.component.html',
    encapsulation: ViewEncapsulation.None,
    animations: [appModuleAnimation()]
})

export class AdjustPriceListComponent extends ListComponentBase<T_ADJUST_ASS_ENTITY> implements IUiAction<T_ADJUST_ASS_ENTITY>, OnInit, AfterViewInit {

    filterInput: T_ADJUST_ASS_ENTITY = new T_ADJUST_ASS_ENTITY();
    @ViewChild('assetModal') assetModal: AssetModalComponent;

    constructor(
        injector: Injector,
        private fileDownloadService: FileDownloadService,
        private adjustPriceListService: AdjustPriceServiceProxy,
        private asposeService: AsposeServiceProxy) {
        super(injector);
        this.initFilter();
    }

    exportToExcel(): void {
        let reportInfo = new ReportInfo();
        reportInfo.typeExport = ReportTypeConsts.Excel;
        this.initFilterInputSearch();
        let filterReport = { ...this.filterInputSearch }
        filterReport.maxResultCount = -1;
        filterReport.top = 0;

        reportInfo.parameters = this.GetParamsFromFilter(filterReport)

        reportInfo.values = this.GetParamsFromFilter({
            A1: this.l('CompanyReportHeader')
        });

        reportInfo.pathName = "/TOOL/rpt_adjust_price_list.xlsx";
        reportInfo.storeName = "T_ADJUST_ASS_Search";

        this.asposeService.getReport(reportInfo).subscribe(x => {
            this.fileDownloadService.downloadTempFile(x);
        });
    }

    ngAfterViewInit(): void {
        // COMMENT: this.stopAutoUpdateView();
    }
    getSingleAsset(asset: ASS_MASTER_ENTITY) {
        this.filterInput.asS_CODE = asset.asseT_CODE;
    }
    showAssetModal() {
        this.assetModal.filterInput.level = 'ALL';
        this.assetModal.show();
    }
    ngOnInit(): void {
        // set ui action
        this.appToolbar.setUiAction(this);
        // set role toolbar
        this.appToolbar.setRole('AdjustPriceList', true, true, false, true, true, true, false, true);
        this.appToolbar.setEnableForListPage();
    }

    initFilterInputSearch(): void {
        this.filterInput.level = "UNIT";
    }

    search(): void {
        this.showTableLoading();
        this.initFilterInputSearch();
        this.setSortingForFilterModel(this.filterInputSearch);
        this.adjustPriceListService.t_ADJUST_ASS_Search(this.filterInputSearch)
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
        this.navigatePassParam('/app/admin/adjust-price-list-add', null, { filterInput: JSON.stringify(this.filterInputSearch) });
    }

    onUpdate(item: T_ADJUST_ASS_ENTITY): void {
        this.navigatePassParam('/app/admin/adjust-price-list-edit', { id: item.adjusT_ID, assCode: item.asS_CODE, assId: item.asS_ID }, { filterInput: JSON.stringify(this.filterInputSearch) });
    }

    onDelete(item: T_ADJUST_ASS_ENTITY): void {
        if (item.autH_STATUS == AuthStatusConsts.Approve) {
            this.showErrorMessage(this.l('YouCannotDeleteThisObject'));
            this.updateView();
            return;
        }
        this.message.confirm(
            this.l('DeleteWarningMessage', item.adjusT_ID),
            this.l('AreYouSure'),
            (isConfirmed) => {
                if (isConfirmed) {
                    this.saving = true;
                    this.adjustPriceListService.t_ADJUST_ASS_Del(item.adjusT_ID)
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
            }
        );
    }

    onApprove(item: T_ADJUST_ASS_ENTITY): void {

    }

    onViewDetail(item: T_ADJUST_ASS_ENTITY): void {
        this.navigatePassParam('/app/admin/adjust-price-list-view', { id: item.adjusT_ID, assCode: item.asS_CODE, assId: item.asS_ID }, { filterInput: JSON.stringify(this.filterInputSearch) });
    }

    onSave(): void {

    }



    onResetSearch(): void {
        this.filterInput = new T_ADJUST_ASS_ENTITY();
        this.changePage(0);
    }
}
