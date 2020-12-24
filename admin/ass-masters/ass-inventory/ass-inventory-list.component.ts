import { ListComponentBase } from "@app/ultilities/list-component-base";
import { Injector, Component, OnInit, ViewEncapsulation, ViewChild, AfterViewInit } from "@angular/core";
import { AssInventoryServiceProxy, ASS_INVENTORY_MASTER_ENTITY, AsposeServiceProxy, ReportInfo, CM_BRANCH_ENTITY, TermServiceProxy, CM_TERM_ENTITY } from "@shared/service-proxies/service-proxies";
import { LazyLoadEvent } from "primeng/api";
import { IUiAction } from "@app/ultilities/ui-action";
import { appModuleAnimation } from "@shared/animations/routerTransition";
import { FileDownloadService } from "@shared/utils/file-download.service";
import { finalize } from "rxjs/operators";
import { ReportTypeConsts } from "@app/admin/core/ultils/consts/ReportTypeConsts";
import { BranchModalComponent } from "@app/admin/core/controls/branch-modal/branch-modal.component";

@Component({
    templateUrl: './ass-inventory-list.component.html',
    encapsulation: ViewEncapsulation.None,
    animations: [appModuleAnimation()]
})

export class AssInventoryListComponent extends ListComponentBase<ASS_INVENTORY_MASTER_ENTITY> implements IUiAction<ASS_INVENTORY_MASTER_ENTITY>, OnInit, AfterViewInit {
    ngAfterViewInit(): void {
        this.stopAutoUpdateView();
    }

    constructor(
        injector: Injector,
        private assInventoryService: AssInventoryServiceProxy,
        private CMTermService: TermServiceProxy,
        private fileDownloadService: FileDownloadService,
        private asposeService: AsposeServiceProxy
        ) {
        super(injector);
        this.initFilter(); this.filterInput.brancH_ID
    }


    filterInput: ASS_INVENTORY_MASTER_ENTITY = new ASS_INVENTORY_MASTER_ENTITY();
    terms: CM_TERM_ENTITY[];
    branchId: string;
    @ViewChild('branchModal') branchModal : BranchModalComponent;

    initTerms(): void {
        this.CMTermService.cM_TERM_Search(this.getFillterForCombobox()).subscribe(result => {
            this.terms = result.items;
            this.updateView();
        });
    }

    ngOnInit(): void {
        // set ui action
        this.appToolbar.setUiAction(this);
        // set role toolbar
        this.appToolbar.setRole('AssInventory', true, true, false, true, true, true, false, true);
        this.appToolbar.setEnableForListPage();
        this.initTerms();
    }

    getBranch(event: CM_BRANCH_ENTITY): void{
        this.filterInput.brancH_CODE = event.brancH_CODE;
        this.filterInput.brancH_ID = event.brancH_ID;
        this.filterInput.brancH_CREATE = event.brancH_ID;
        this.branchId = event.brancH_ID;
    }

    initFilterInputSearch(): void {
        this.filterInput.level = 'UNIT';
        this.filterInput.brancH_CREATE = this.appSession.user.subbrId;
    }

    search(event?: LazyLoadEvent): void {
        this.showTableLoading();

        this.setSortingForFilterModel(this.filterInputSearch);
        this.initFilterInputSearch();
        if(!this.filterInput.brancH_CODE)
            this.filterInput.brancH_ID = '';
        this.assInventoryService.aSS_Inventory_Search(this.filterInputSearch)
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
        this.navigatePassParam('/app/admin/ass-inventory-add', null, { filterInput: JSON.stringify(this.filterInputSearch) });
    }

    onUpdate(item: ASS_INVENTORY_MASTER_ENTITY): void {
        this.filterInput.brancH_ID = this.branchId;
        this.navigatePassParam('/app/admin/ass-inventory-edit', { id: item.invenT_ID }, { filterInput: JSON.stringify(this.filterInputSearch) });
    }

    onDelete(item: ASS_INVENTORY_MASTER_ENTITY): void {
        this.message.confirm(
            this.l('DeleteWarningMessage', item.brancH_CREATE),
            this.l('AreYouSure'),
            (isConfirmed) => {
                if (isConfirmed) {
                    this.saving = true;
                    this.assInventoryService.aSS_Inventory_Del(item.invenT_ID)
                        .pipe(finalize(() => { this.saving = false; }))
                        .subscribe((response) => {
                            if (response['Result'] != '0') {
                                this.showErrorMessage(response['errorDesc']);
                            }
                            else {
                                this.showSuccessMessage(this.l('SuccessfullyDeleted'));
                                this.reloadPage();
                            }
                        });
                }
                this.updateView();
            }
        );
    }

    onApprove(item: ASS_INVENTORY_MASTER_ENTITY): void {

    }

    onViewDetail(item: ASS_INVENTORY_MASTER_ENTITY): void {
        this.navigatePassParam('/app/admin/ass-inventory-view', { id: item.invenT_ID }, { filterInput: JSON.stringify(this.filterInputSearch) });
    }

    onSave(): void {

    }

    onResetSearch(): void {
        this.filterInput = new ASS_INVENTORY_MASTER_ENTITY();
        this.changePage(0);
    }

    exportToExcel() {
        let reportInfo = new ReportInfo();
        reportInfo.typeExport = ReportTypeConsts.Excel;
        this.initFilterInputSearch();
        let filterReport = { ...this.filterInputSearch }
        filterReport.maxResultCount = -1;
        filterReport.top = 0;
        
        reportInfo.parameters = this.GetParamsFromFilter(filterReport)

        reportInfo.pathName = "/ASS_MASTER/rpt-ass-inventory-master.xlsx";
        reportInfo.storeName = "ASS_INVENTORY_MASTER_Search";
        this.asposeService.getReport(reportInfo).subscribe(x => {
            this.fileDownloadService.downloadTempFile(x);
        });
    }
}
