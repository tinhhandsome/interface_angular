import { ListComponentBase } from "@app/ultilities/list-component-base";
import { Injector, Component, OnInit, ViewChild, ViewEncapsulation } from "@angular/core";
import { SupplierTypeServiceProxy, CM_SUPPLIERTYPE_ENTITY, } from "@shared/service-proxies/service-proxies";
import { LazyLoadEvent } from "primeng/api";
import { IUiAction } from "@app/ultilities/ui-action";
import { appModuleAnimation } from "@shared/animations/routerTransition";
import { FileDownloadService } from "@shared/utils/file-download.service";
import { finalize } from "rxjs/operators";

@Component({
    templateUrl: './supplier-type-list.component.html',
    encapsulation: ViewEncapsulation.None,
    animations: [appModuleAnimation()]
})

export class SupplierTypeListComponent extends ListComponentBase<CM_SUPPLIERTYPE_ENTITY> implements IUiAction<CM_SUPPLIERTYPE_ENTITY>, OnInit {
    filterInput: CM_SUPPLIERTYPE_ENTITY = new CM_SUPPLIERTYPE_ENTITY();
    constructor(injector: Injector,
        private _fileDownloadService: FileDownloadService,
        private _supplierTypeService: SupplierTypeServiceProxy) {
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
        this.appToolbar.setRole('SupplierType', true, true, false, true, true, true, false, true);
        this.appToolbar.setEnableForListPage();
    }

    exportToExcel() {
        // this._supplierTypeService.cM_SUPPLIERTYPE_ToExcel(this.filterInput).subscribe(response => {
        //     this._fileDownloadService.downloadTempFile(response);
        // })
    }

    getSupplierTypes(event?: LazyLoadEvent): void {
        if (this.dataTable.shouldResetPaging) {
            this.dataTable.shouldResetPaging = false;
            this.changePage(0);
            return;
        }

        this.showTableLoading();

        this.setSortingForFilterModel(this.filterInput);

        this._supplierTypeService.cM_SUPPLIERTYPE_Search(this.filterInput)
            .pipe(finalize(() => this.hideTableLoading()))
            .subscribe(result => {
                this.dataTable.records = result.items;
                this.dataTable.totalRecordsCount = result.totalCount;
                this.appToolbar.setEnableForListPage();
            });
    }

    onSelectRow(item: CM_SUPPLIERTYPE_ENTITY): void {
        this.appToolbar.onSelectRow(item);
    }

    onAdd(): void {
        this.navigatePassParam('/app/admin/supplier-type-add', null, { filterInput: JSON.stringify(this.filterInput) });
    }

    onUpdate(item: CM_SUPPLIERTYPE_ENTITY): void {
        this.navigatePassParam('/app/admin/supplier-type-edit', { id: item.suP_TYPE_ID }, { filterInput: JSON.stringify(this.filterInput) });
    }

    onDelete(item: CM_SUPPLIERTYPE_ENTITY): void {
        this.message.confirm(
            this.l('DeleteWarningMessage', item.suP_TYPE_NAME),
            this.l('AreYouSure'),
            (isConfirmed) => {
                if (isConfirmed) {
                    this.saving = true;
                    this._supplierTypeService.cM_SUPPLIERTYPE_Del(item.suP_TYPE_ID)
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

    onApprove(item: CM_SUPPLIERTYPE_ENTITY): void {

    }

    onViewDetail(item: CM_SUPPLIERTYPE_ENTITY): void {
        this.navigatePassParam('/app/admin/supplier-type-view', { id: item.suP_TYPE_ID }, { filterInput: JSON.stringify(this.filterInput) });
    }

    onSave(): void {

    }

    onSearch(): void {
        this.changePage(0);
    }

    onResetSearch(): void {
        this.filterInput = new CM_SUPPLIERTYPE_ENTITY();
        this.changePage(0);
    }
}
