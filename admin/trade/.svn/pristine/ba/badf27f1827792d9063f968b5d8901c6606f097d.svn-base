import { ListComponentBase } from "@app/ultilities/list-component-base";
import { Injector, Component, OnInit, ViewEncapsulation, ViewChild, AfterViewInit } from "@angular/core";
import { TR_PO_UP_MASTER_ENTITY, CM_BRANCH_ENTITY, BranchServiceProxy, BidMasterServiceProxy, TradePoUpServiceProxy, CM_SUPPLIER_ENTITY } from "@shared/service-proxies/service-proxies";
import { LazyLoadEvent } from "primeng/api";
import { IUiAction } from "@app/ultilities/ui-action";
import { appModuleAnimation } from "@shared/animations/routerTransition";
import { FileDownloadService } from "@shared/utils/file-download.service";
import { finalize } from "rxjs/operators";
import * as moment from 'moment';
import { RecordStatusConsts } from "@app/admin/core/ultils/consts/RecordStatusConsts";
import { SupplierModalComponent } from "@app/admin/core/controls/supplider-modal/supplier-modal.component";

@Component({
    templateUrl: './po-update-list.component.html',
    encapsulation: ViewEncapsulation.None, 
    animations: [appModuleAnimation()] 
})

export class TradePoUpdateListComponent extends ListComponentBase<TR_PO_UP_MASTER_ENTITY> implements IUiAction<TR_PO_UP_MASTER_ENTITY>, OnInit, AfterViewInit {
    ngAfterViewInit(): void {
        // COMMENT: this.stopAutoUpdateView();
    }
    initDefaultFilter(){
        this.filterInput.level = 'ALL'
        this.filterInput.brancH_LOGIN = this.appSession.user.subbrId;
        this.filterInput.receivE_BRANCH = this.appSession.user.subbrId;

    }
    filterInput: TR_PO_UP_MASTER_ENTITY = new TR_PO_UP_MASTER_ENTITY();

    constructor(injector: Injector, 
        private branchService: BranchServiceProxy,
        private poUpMasterService: TradePoUpServiceProxy 
    ) {
        super(injector);
        this.initFilter();
    } 
    @ViewChild('supplierModalComponent') supplierModalComponent: SupplierModalComponent;

    ngOnInit(): void {
        // set ui action
        this.appToolbar.setUiAction(this);
        // set role toolbar
        this.appToolbar.setRole('TradePoUpdateList', false, true, false, false, true, true, false, true);
        this.appToolbar.setEnableForListPage();
    }

    exportToExcel() {
    }

    search(): void {
        this.showTableLoading();


        this.setSortingForFilterModel(this.filterInputSearch);
        this.appToolbar.setEnableForListPage();

        this.poUpMasterService.tR_PO_UP_MASTER_Search(this.filterInputSearch)
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
        // this.navigatePassParam('/app/admin/po-update-add', null, { filterInput: JSON.stringify(this.filterInputSearch) });
    }

    onUpdate(item: TR_PO_UP_MASTER_ENTITY): void {
        this.navigatePassParam('/app/admin/trade-po-update-edit', { id: item.pO_ID }, { filterInput: JSON.stringify(this.filterInputSearch) });
    }

    onDelete(item: TR_PO_UP_MASTER_ENTITY): void {

    }

    onApprove(item: TR_PO_UP_MASTER_ENTITY): void {

    }

    onViewDetail(item: TR_PO_UP_MASTER_ENTITY): void {
        this.navigatePassParam('/app/admin/trade-po-update-view', { id: item.pO_ID }, { filterInput: JSON.stringify(this.filterInputSearch) });
    }

    onSave(): void {

    }

    onResetSearch(): void {
        this.filterInput = new TR_PO_UP_MASTER_ENTITY();
        this.initDefaultFilter();
        this.changePage(0);
    }
    onSelectSupplier(sup: CM_SUPPLIER_ENTITY) {
        this.filterInput.suP_ID = sup.suP_ID;
        this.filterInput.suP_ADDR = sup.addr;
        this.updateView();
    }
}
