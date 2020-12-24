import { ListComponentBase } from "@app/ultilities/list-component-base";
import { Injector, Component, OnInit, ViewEncapsulation, AfterViewInit } from "@angular/core";
import { BID_MASTER_ENTITY, CM_BRANCH_ENTITY, BranchServiceProxy, BidMasterServiceProxy, CM_SUPPLIERTYPE_ENTITY, CM_SUPPLIER_ENTITY, ReportInfo, AsposeServiceProxy } from "@shared/service-proxies/service-proxies";
import { LazyLoadEvent } from "primeng/api";
import { IUiAction } from "@app/ultilities/ui-action";
import { appModuleAnimation } from "@shared/animations/routerTransition";
import { FileDownloadService } from "@shared/utils/file-download.service";
import { finalize } from "rxjs/operators";
import * as moment from 'moment';
import { RecordStatusConsts } from "@app/admin/core/ultils/consts/RecordStatusConsts";
import { ReportTypeConsts } from "@app/admin/core/ultils/consts/ReportTypeConsts";

@Component({
    templateUrl: './bid-master-list.component.html',
    encapsulation: ViewEncapsulation.None,
    animations: [appModuleAnimation()]
})

export class BidMasterListComponent extends ListComponentBase<BID_MASTER_ENTITY> implements IUiAction<BID_MASTER_ENTITY>, OnInit, AfterViewInit {

    filterInput: BID_MASTER_ENTITY = new BID_MASTER_ENTITY();

    constructor(injector: Injector,
        private fileDownloadService: FileDownloadService,
        private asposeService: AsposeServiceProxy,
        private tradeDetailService: BidMasterServiceProxy,
        private bidMasterService: BidMasterServiceProxy
    ) {
        super(injector);
        this.filterInput = new BID_MASTER_ENTITY();
        // console.log(this);
        this.initFilter();
    }

    ngOnInit(): void {
        // set ui action
        this.appToolbar.setUiAction(this);
        // set role toolbar
        this.appToolbar.setRole('BidMaster', true, true, false, true, true, true, false, true);
        this.appToolbar.setEnableForListPage();
    }

    ngAfterViewInit(): void {
        // COMMENT: this.stopAutoUpdateView();
    }

    exportToExcel() {
        let reportInfo = new ReportInfo();
        reportInfo.typeExport = ReportTypeConsts.Excel;
        this.initFilterInputSearch();

        let reportFilter = { ...this.filterInputSearch };

        reportFilter.maxResultCount = -1;

        reportInfo.parameters = this.GetParamsFromFilter(reportFilter)

        reportInfo.values = this.GetParamsFromFilter({
            A1: this.l('CompanyReportHeader')
        });

        reportInfo.pathName = "/TRADE/rpt_bid_master.xlsx";
        reportInfo.storeName = "BID_MASTER_SEARCH";

        this.asposeService.getReport(reportInfo).subscribe(x => {
            this.fileDownloadService.downloadTempFile(x);
        });
    }

    initFilterInputSearch(){
        this.filterInputSearch.recorD_STATUS = RecordStatusConsts.Active;
        this.filterInputSearch.biD_TYPE = '1';
    }

    search(): void {
        this.showTableLoading();

        this.setSortingForFilterModel(this.filterInputSearch);

        this.initFilterInputSearch();
        this.filterInputSearch.top = 200;

        this.bidMasterService.bID_MASTER_Search(this.filterInputSearch)
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
        this.navigatePassParam('/app/admin/bid-master-add', null, { filterInput: JSON.stringify(this.filterInputSearch) });
    }

    onUpdate(item: BID_MASTER_ENTITY): void {
        this.navigatePassParam('/app/admin/bid-master-edit', { id: item.biD_ID }, { filterInput: JSON.stringify(this.filterInputSearch) });
    }

    onDelete(item: BID_MASTER_ENTITY): void {
        this.message.confirm(
            this.l('DeleteWarningMessage', item.biD_CODE),
            this.l('AreYouSure'),
            (isConfirmed) => {
                if (isConfirmed) {
                    this.saving = true;
                    this.tradeDetailService.bID_MASTER_Del(item.biD_ID)
                        .pipe(finalize(() => { this.saving = false; }))
                        .subscribe((response) => {
                            if (response.result != '0') {
                                this.showErrorMessage(response.errorDesc);
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

    onApprove(item: BID_MASTER_ENTITY): void {

    }

    onViewDetail(item: BID_MASTER_ENTITY): void {
        this.navigatePassParam('/app/admin/bid-master-view', { id: item.biD_ID }, { filterInput: JSON.stringify(this.filterInputSearch) });
    }

    onSave(): void {

    }




    onResetSearch(): void {
        this.filterInput = new BID_MASTER_ENTITY();
        this.changePage(0);
    }

    onSelectSupplier(supplier: CM_SUPPLIER_ENTITY) {
        this.filterInput.suP_ID = supplier.suP_ID;
    }
}
