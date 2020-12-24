import { ListComponentBase } from "@app/ultilities/list-component-base";
import { Injector, Component, OnInit, ViewEncapsulation, ViewChild, AfterViewInit, ChangeDetectionStrategy } from "@angular/core";
import { TradePoRepairServiceProxy, TR_PO_REPAIR_ENTITY, CM_BRANCH_ENTITY, BranchServiceProxy, CM_CAR_TYPE_ENTITY, AsposeServiceProxy, ReportInfo, CM_SUPPLIER_ENTITY } from "@shared/service-proxies/service-proxies";
import { LazyLoadEvent } from "primeng/api";
import { IUiAction } from "@app/ultilities/ui-action";
import { appModuleAnimation } from "@shared/animations/routerTransition";
import { FileDownloadService } from "@shared/utils/file-download.service";
import { finalize } from "rxjs/operators";
import { ReportTypeConsts } from "@app/admin/core/ultils/consts/ReportTypeConsts";
import { SupplierModalComponent } from "@app/admin/core/controls/supplider-modal/supplier-modal.component";

@Component({
    templateUrl: './trade-po-repair-list.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    animations: [appModuleAnimation()]
})

export class TradePoRepairListComponent extends ListComponentBase<TR_PO_REPAIR_ENTITY> implements IUiAction<TR_PO_REPAIR_ENTITY>, OnInit, AfterViewInit {


    @ViewChild('supplierModal') supplierModal: SupplierModalComponent;

    filterInput: TR_PO_REPAIR_ENTITY = new TR_PO_REPAIR_ENTITY();;
    branchName: string
    TradePoRepairParents: TR_PO_REPAIR_ENTITY[];
    branches: CM_BRANCH_ENTITY[];
    carTypes: CM_CAR_TYPE_ENTITY[];

    constructor(injector: Injector,
        private fileDownloadService: FileDownloadService,
        private asposeService: AsposeServiceProxy,
        private branchService: BranchServiceProxy,
        private TradePoRepairService: TradePoRepairServiceProxy) {
        super(injector);

        this.initFilter();
        this.initCombobox();
        // console.log(this);
        //
    }

    initDefaultFilter() {
        this.filterInput.top = 1000;
    }

    ngOnInit(): void {
        // set ui action
        this.appToolbar.setUiAction(this);
        // set role toolbar
        this.appToolbar.setRole('TradePoRepair', true, true, false, true, true, true, false, true);
        this.appToolbar.setEnableForListPage();

        this.branchName = this.appSession.user.branchName;
    }

    ngAfterViewInit(): void {
        this.filterInput.brancH_LOGIN = this.appSession.user.subbrId;
        // COMMENT: this.stopAutoUpdateView();
    }

    initCombobox(): void {
        let filterCombobox = this.getFillterForCombobox();
        this.branchService.cM_BRANCH_Search(filterCombobox).subscribe(response => {
            this.branches = response.items;
            this.updateView();
        });
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

        reportInfo.pathName = "/TRADE/rpt_tr_po_repair.xlsx";
        reportInfo.storeName = "TR_PO_REPAIR_Search";

        this.asposeService.getReport(reportInfo).subscribe(x => {
            this.fileDownloadService.downloadTempFile(x);
        });
    }

    onSelectSupplier(item: CM_SUPPLIER_ENTITY) {
        this.filterInput.suP_ID = item.suP_ID;
        this.filterInput.suP_CODE = item.suP_CODE;
        this.updateView();
    }

    initFilterInputSearch() {
        if (!this.filterInputSearch['brancH_ID_View']) {
            this.filterInputSearch.brancH_ID = this.appSession.user.subbrId;
        }
        else {
            this.filterInputSearch.brancH_ID = this.filterInputSearch['brancH_ID_View'];
        }
    }

    onSupIdChange(evt) {
        if (!evt.target.value) {
            this.filterInput.suP_ID = undefined;
        }
    }

    search(): void {

        this.showTableLoading();

        this.initFilterInputSearch();

        this.setSortingForFilterModel(this.filterInputSearch);
        this.appToolbar.setEnableForListPage();

        this.TradePoRepairService.tR_PO_REPAIR_Search(this.filterInputSearch)
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
        this.navigatePassParam('/app/admin/trade-po-repair-add', null, { filterInput: JSON.stringify(this.filterInputSearch) });
    }

    onUpdate(item: TR_PO_REPAIR_ENTITY): void {
        this.navigatePassParam('/app/admin/trade-po-repair-edit', { id: item.pO_REPAIR_ID }, { filterInput: JSON.stringify(this.filterInputSearch) });
    }

    onDelete(item: TR_PO_REPAIR_ENTITY): void {
        this.message.confirm(
            this.l('DeleteWarningMessage', item.pO_REPAIR_ID),
            this.l('AreYouSure'),
            (isConfirmed) => {
                if (isConfirmed) {
                    this.saving = true;
                    this.TradePoRepairService.tR_PO_REPAIR_Del(item.pO_REPAIR_ID)
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

    onApprove(item: TR_PO_REPAIR_ENTITY): void {

    }

    onViewDetail(item: TR_PO_REPAIR_ENTITY): void {
        this.navigatePassParam('/app/admin/trade-po-repair-view', { id: item.pO_REPAIR_ID }, { filterInput: JSON.stringify(this.filterInputSearch) });
    }

    onSave(): void {

    }

    onResetSearch(): void {
        this.filterInput = new TR_PO_REPAIR_ENTITY();
        this.filterInput.level = 'ALL';
        this.filterInput.brancH_LOGIN = this.appSession.user.subbrId;
        this.changePage(0);

    }
}
