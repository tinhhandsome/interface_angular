import { ListComponentBase } from "@app/ultilities/list-component-base";
import { Injector, Component, OnInit, ViewEncapsulation, ViewChild, AfterViewChecked, AfterViewInit } from "@angular/core";
import { TR_CONTRACT_ENTITY, TradeContractServiceProxy, BidMasterServiceProxy, BID_CONTRACTOR_DT_ENTITY, CM_SUPPLIER_ENTITY, AsposeServiceProxy, ReportInfo, } from "@shared/service-proxies/service-proxies";
import { IUiAction } from "@app/ultilities/ui-action";
import { appModuleAnimation } from "@shared/animations/routerTransition";
import { FileDownloadService } from "@shared/utils/file-download.service";
import { SupplierModalComponent } from "@app/admin/core/controls/supplider-modal/supplier-modal.component";
import { LazyLoadEvent } from "primeng/api";
import { finalize } from "rxjs/operators";
import { ReportTypeConsts } from "@app/admin/core/ultils/consts/ReportTypeConsts";
import { AuthStatusConsts } from "@app/admin/core/ultils/consts/AuthStatusConsts";

@Component({
    templateUrl: './trade-contract-list.component.html',
    encapsulation: ViewEncapsulation.None,
    animations: [appModuleAnimation()]
})

export class TradeContractListComponent extends ListComponentBase<TR_CONTRACT_ENTITY> implements IUiAction<TR_CONTRACT_ENTITY>, OnInit, AfterViewInit {
    ngAfterViewInit(): void {
        // // COMMENT: this.stopAutoUpdateView();
    }

    filterInput: TR_CONTRACT_ENTITY = new TR_CONTRACT_ENTITY();

    // @ViewChild('bidMasterModal') bidMasterModal: BidMasterSingleModalComponent;
    @ViewChild('supplierModalComponent') supplierModalComponent: SupplierModalComponent;

    constructor(injector: Injector,
        private fileDownloadService: FileDownloadService,
        private tradeContractService: TradeContractServiceProxy,
        private bidMasterService: BidMasterServiceProxy,
        private asposeService: AsposeServiceProxy) {
        super(injector);
        this.initFilter();
        this.autoUpdateView();
    }


    ngOnInit(): void {

        // set ui action
        this.appToolbar.setUiAction(this);
        // set role toolbar
        this.appToolbar.setRole('TradeTRContractList', true, true, false, true, true, true, false, true);
        this.appToolbar.setEnableForListPage();
    }
    initDefaultFilter() {
        this.filterInput.constracT_TYPE = '1';
        this.filterInput.top = 200;
    }
    exportToExcel() {
        // this.tradeContractService.tR_CONTRACT_ToExcel(this.filterInput).subscribe(response => {
        //     this.fileDownloadService.downloadTempFile(response);
        // })
        let reportInfo = new ReportInfo();
        reportInfo.typeExport = ReportTypeConsts.Excel;

        let filterReport = { ...this.filterInputSearch }
        filterReport.maxResultCount = -1;
        filterReport.totalCount = this.isNull(filterReport.totalCount) ? 0 : filterReport.totalCount;
        filterReport.skipCount = 0;
        reportInfo.parameters = this.GetParamsFromFilter(filterReport)

        reportInfo.values = this.GetParamsFromFilter({
            A1: this.l('CompanyReportHeader')
        });

        reportInfo.pathName = "/TRADE/rpt_trade_contract.xlsx";
        reportInfo.storeName = "TR_CONTRACT_Search";

        this.asposeService.getReport(reportInfo).subscribe(x => {
            this.fileDownloadService.downloadTempFile(x);
        });
    }

    search(event?: LazyLoadEvent): void {

        this.showTableLoading();

        this.setSortingForFilterModel(this.filterInputSearch);

        this.tradeContractService.tR_CONTRACT_Search(this.filterInputSearch)
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
        this.navigatePassParam('/app/admin/trade-contract-add', null, { filterInput: JSON.stringify(this.filterInputSearch) });
    }

    onUpdate(item: TR_CONTRACT_ENTITY): void {
        this.navigatePassParam('/app/admin/trade-contract-edit', { id: item.contracT_ID }, { filterInput: JSON.stringify(this.filterInputSearch) });
    }

    onDelete(item: TR_CONTRACT_ENTITY): void {
        
        this.message.confirm(
            this.l('DeleteWarningMessage', item.contracT_CODE),
            this.l('AreYouSure'),
            (isConfirmed) => {
                if (isConfirmed) {
                    this.saving = true;
                    this.tradeContractService.tR_CONTRACT_Del(item.contracT_ID)
                        .pipe(finalize(() => { this.saving = false; }))
                        .subscribe((response) => {
                            if (response.result != '0') {
                                this.showErrorMessage(response.errorDesc);
                            }
                            else {
                                this.showSuccessMessage(this.l('SuccessfullyDeleted'));
                                this.filterInputSearch.totalCount = 0;
                                // this.changePage(0);
                                this.reloadPage();
                            }
                        });
                }
            }
        );
    }

    onApprove(item: TR_CONTRACT_ENTITY): void {

    }

    onViewDetail(item: TR_CONTRACT_ENTITY): void {
        this.navigatePassParam('/app/admin/trade-contract-view', { id: item.contracT_ID }, { filterInput: JSON.stringify(this.filterInputSearch) });
    }

    onSave(): void {

    }



    onResetSearch(): void {
        this.filterInput = new TR_CONTRACT_ENTITY();

        this.initDefaultFilter();
        this.changePage(0);

    }
    onSelectBidMaster(bid: BID_CONTRACTOR_DT_ENTITY) {
        // this.filterInput.biD_ID = bid.biD_ID;
        this.filterInput.biD_CODE = bid.biD_CODE;
        // this.onSearch();
    }

    onSelectSupplier(sup: CM_SUPPLIER_ENTITY) {
        // this.filterInput.suP_ID = sup.suP_ID;
        this.filterInput.suP_CODE = sup.suP_CODE;
        // this.onSearch();
    }
}
