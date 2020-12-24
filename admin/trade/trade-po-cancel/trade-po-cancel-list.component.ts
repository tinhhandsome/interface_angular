import { ListComponentBase } from "@app/ultilities/list-component-base";
import { Injector, Component, OnInit, ViewEncapsulation, ViewChild, AfterViewInit } from "@angular/core";
import { TradePoCancelServiceProxy, TR_PO_CANCEL_ENTITY, ASS_TYPE_ENTITY, AssTypeServiceProxy, CM_BRANCH_ENTITY, BranchServiceProxy, CM_CAR_TYPE_ENTITY, AsposeServiceProxy, ReportInfo, CM_SUPPLIER_ENTITY, TR_PO_MASTER_ENTITY, } from "@shared/service-proxies/service-proxies";
import { LazyLoadEvent } from "primeng/api";
import { IUiAction } from "@app/ultilities/ui-action";
import { appModuleAnimation } from "@shared/animations/routerTransition";
import { FileDownloadService } from "@shared/utils/file-download.service";
import { finalize } from "rxjs/operators";
import { ReportTypeConsts } from "@app/admin/core/ultils/consts/ReportTypeConsts";
import * as moment from 'moment';
import { SupplierModalComponent } from "@app/admin/core/controls/supplider-modal/supplier-modal.component";
import { TradePoMasterModalComponent } from "@app/admin/core/controls/trade-po-master-modal/trade-po-master-modal.component";
import { AuthStatusConsts } from "@app/admin/core/ultils/consts/AuthStatusConsts";

@Component({
    templateUrl: './trade-po-cancel-list.component.html',
    encapsulation: ViewEncapsulation.None,
    animations: [appModuleAnimation()]
})

export class TradePoCancelListComponent extends ListComponentBase<TR_PO_CANCEL_ENTITY> implements IUiAction<TR_PO_CANCEL_ENTITY>, OnInit, AfterViewInit {


    @ViewChild('tradePoMasterModal') tradePoMasterModal: TradePoMasterModalComponent;

    filterInput: TR_PO_CANCEL_ENTITY = new TR_PO_CANCEL_ENTITY();

    branchName: string
    TradePoCancelParents: TR_PO_CANCEL_ENTITY[];
    branches: CM_BRANCH_ENTITY[];

    constructor(injector: Injector,
        private fileDownloadService: FileDownloadService,
        private asposeService: AsposeServiceProxy,
        private branchService: BranchServiceProxy,
        private TradePoCancelService: TradePoCancelServiceProxy) {
        super(injector);

        this.initFilter();
        this.initCombobox()
    }

    initDefaultFilter() {
        this.filterInput.top = 200
        this.filterInput.brancH_ID = this.appSession.user.subbrId
    }

    initCombobox(): void {
        let filterCombobox = this.getFillterForCombobox();
        this.branchService.cM_BRANCH_Search(filterCombobox).subscribe(response => {
            this.branches = response.items;
        });
    }
    ngOnInit(): void {
        // set ui action
        this.appToolbar.setUiAction(this);
        // set role toolbar
        this.appToolbar.setRole('TradePoCancel', true, true, false, true, true, true, false, true);
        this.appToolbar.setEnableForListPage();

        this.branchName = this.appSession.user.branchName;

    }

    ngAfterViewInit() {
        // COMMENT: this.stopAutoUpdateView();
    }

    exportToExcel() {
    }
    downloadTradePoCancelExcel() {
        let reportInfo = new ReportInfo();
        reportInfo.typeExport = ReportTypeConsts.Excel;

        let filterReport = { ...this.filterInputSearch }
        filterReport.maxResultCount = -1;

        reportInfo.parameters = this.GetParamsFromFilter(filterReport)

        reportInfo.values = this.GetParamsFromFilter({
            A1: this.l('CompanyReportHeader')
        });

        reportInfo.pathName = "/TRADE/rpt_trade-po-cancel.xlsx";
        reportInfo.storeName = "TR_PO_CANCEL_Search";

        this.asposeService.getReport(reportInfo).subscribe(x => {
            this.fileDownloadService.downloadTempFile(x);
        });
    }
    onSelectSupplier(item: CM_SUPPLIER_ENTITY) {
        this.filterInput.suP_ID = item.suP_ID
    }
    onSelectTradePoMaster(item: TR_PO_MASTER_ENTITY) {
        this.filterInput.pO_CODE = item.pO_CODE
    }

    search(): void {

        this.showTableLoading();

        if (!this.filterInputSearch.brancH_ID) {
            this.filterInputSearch.brancH_ID = this.appSession.user.subbrId;
        }


        this.setSortingForFilterModel(this.filterInputSearch);

        this.TradePoCancelService.tR_PO_CANCEL_Search(this.filterInputSearch)
            .pipe(finalize(() => this.hideTableLoading()))
            .subscribe(result => {
                this.dataTable.records = result.items;
                this.dataTable.totalRecordsCount = result.totalCount;
                this.filterInputSearch.totalCount = result.totalCount;
                this.appToolbar.setEnableForListPage();
                this.updateView()
            });
    }

    onAdd(): void {
        this.navigatePassParam('/app/admin/trade-po-cancel-add', null, { filterInput: JSON.stringify(this.filterInputSearch) });
    }

    onUpdate(item: TR_PO_CANCEL_ENTITY): void {
        this.navigatePassParam('/app/admin/trade-po-cancel-edit', { id: item.pO_ID }, { filterInput: JSON.stringify(this.filterInputSearch) });
    }

    onDelete(item: TR_PO_CANCEL_ENTITY): void {
        this.message.confirm(
            this.l('DeleteWarningMessage', item.pO_CANCEL_ID),
            this.l('AreYouSure'),
            (isConfirmed) => {
                if (isConfirmed) {
                    if (item.autH_STATUS == AuthStatusConsts.Approve) {
                        this.showErrorMessage(this.l('ErrorDeleteApprovedData'))
                        this.updateView()
                        return
                    }

                    this.saving = true;
                    this.TradePoCancelService.tR_PO_CANCEL_Del(item.pO_CANCEL_ID)
                        .pipe(finalize(() => { this.saving = false; }))
                        .subscribe((response) => {
                            if (response.result != '0') {
                                this.showErrorMessage(response.errorDesc);
                            }
                            else {
                                this.showSuccessMessage(this.l('SuccessfullyDeleted'));
                                this.filterInputSearch.totalCount = 0
                                this.reloadPage();
                            }
                        });
                }
            }
        );
    }

    onApprove(item: TR_PO_CANCEL_ENTITY): void {

    }

    onViewDetail(item: TR_PO_CANCEL_ENTITY): void {
        this.navigatePassParam('/app/admin/trade-po-cancel-view', { id: item.pO_ID }, { filterInput: JSON.stringify(this.filterInputSearch) });
    }

    onSave(): void {

    }

    onResetSearch(): void {
        this.filterInput = new TR_PO_CANCEL_ENTITY();
        this.initDefaultFilter();
        this.changePage(0);
    }
}
