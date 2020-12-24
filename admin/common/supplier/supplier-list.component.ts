import { ListComponentBase } from "@app/ultilities/list-component-base";
import { Injector, Component, OnInit, ViewChild, ViewEncapsulation, OnDestroy } from "@angular/core";
import { SupplierServiceProxy, CM_SUPPLIER_ENTITY, } from "@shared/service-proxies/service-proxies";
import { LazyLoadEvent } from "primeng/api";
import { IUiAction } from "@app/ultilities/ui-action";
import { appModuleAnimation } from "@shared/animations/routerTransition";
import { FileDownloadService } from "@shared/utils/file-download.service";
import { finalize } from "rxjs/operators";

@Component({
    templateUrl: './supplier-list.component.html',
    encapsulation: ViewEncapsulation.None,
    animations: [appModuleAnimation()]
})

export class SupplierListComponent extends ListComponentBase<CM_SUPPLIER_ENTITY> implements IUiAction<CM_SUPPLIER_ENTITY>, OnInit {
    filterInput: CM_SUPPLIER_ENTITY = new CM_SUPPLIER_ENTITY();

    constructor(injector: Injector,
        private fileDownloadService: FileDownloadService,
        private supplierService: SupplierServiceProxy) {
        super(injector);
        this.initFilter();
    }

    initFilter(){
        this.getFilterInputInRoute((filterJson)=>{
            if(filterJson){
                this.filterInput = JSON.parse(filterJson);
            }
        });
    }

    ngOnInit(): void {
        // set ui action
        this.appToolbar.setUiAction(this);
        // set role toolbar
        this.appToolbar.setRole('Supplier', true, true, false, true, true, true, false, true);
        this.appToolbar.setEnableForListPage();
    }

    exportToExcel() {
        this.supplierService.cM_SUPPLIER_ToExcel(this.filterInput).subscribe(response => {
            this.fileDownloadService.downloadTempFile(response);
        })
    }

    getSuppliers(event?: LazyLoadEvent): void {
        if (this.dataTable.shouldResetPaging) {
            this.dataTable.shouldResetPaging = false;
            this.changePage(0);
            return;
        }

        this.showTableLoading();

        this.setSortingForFilterModel(this.filterInput);

        this.supplierService.cM_SUPPLIER_Search(this.filterInput)
            .pipe(finalize(() => this.hideTableLoading()))
            .subscribe(result => {
                this.dataTable.records = result.items;
                this.dataTable.totalRecordsCount = result.totalCount;
                this.appToolbar.setEnableForListPage();
            });
    }

    onSelectRow(item: CM_SUPPLIER_ENTITY): void {
        this.appToolbar.onSelectRow(item);
    }

    onAdd(): void {
        this.navigatePassParam('/app/admin/supplier-add', null, { filterInput: JSON.stringify(this.filterInput) });
    }

    onUpdate(item: CM_SUPPLIER_ENTITY): void {
        this.navigatePassParam('/app/admin/supplier-edit', { id: item.suP_ID }, { filterInput: JSON.stringify(this.filterInput) });
    }

    onDelete(item: CM_SUPPLIER_ENTITY): void {
        this.message.confirm(
            this.l('DeleteWarningMessage', item.suP_NAME),
            this.l('AreYouSure'),
            (isConfirmed) => {
                if (isConfirmed) {
                    this.saving = true;
                    this.supplierService.cM_SUPPLIER_Del(item.suP_ID)
                        .pipe(finalize(() => { this.saving = false; }))
                        .subscribe((response) => {
                            if (response.result != '0') {
                                this.showErrorMessage(response.errorDesc);
                            }
                            else {
                                this.showSuccessMessage(this.l('SuccessfullyDeleted'));
                                this.reloadPage();
                            }
                        });
                }
            }
        );
    }

    onApprove(item: CM_SUPPLIER_ENTITY): void {

    }

    onViewDetail(item: CM_SUPPLIER_ENTITY): void {
        this.navigatePassParam('/app/admin/supplier-view', { id: item.suP_ID }, { filterInput: JSON.stringify(this.filterInput) });
    }

    onSave(): void {

    }

    onSearch(): void {
        this.changePage(0);
    }

    onResetSearch(): void {
        this.filterInput = new CM_SUPPLIER_ENTITY();
        this.changePage(0);
    }
}
