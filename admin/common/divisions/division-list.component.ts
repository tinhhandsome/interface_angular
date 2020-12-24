import { ListComponentBase } from "@app/ultilities/list-component-base";
import { Injector, Component, OnInit, ViewChild, ViewEncapsulation } from "@angular/core";
import { DivisionServiceProxy, CM_DIVISION_ENTITY, } from "@shared/service-proxies/service-proxies";
import { LazyLoadEvent } from "primeng/api";
import { IUiAction } from "@app/ultilities/ui-action";
import { appModuleAnimation } from "@shared/animations/routerTransition";
import { FileDownloadService } from "@shared/utils/file-download.service";
import { finalize } from "rxjs/operators";

@Component({
    templateUrl: './division-list.component.html',
    encapsulation: ViewEncapsulation.None,
    animations: [appModuleAnimation()]
})

export class DivisionListComponent extends ListComponentBase<CM_DIVISION_ENTITY> implements IUiAction<CM_DIVISION_ENTITY>, OnInit {
    filterInput: CM_DIVISION_ENTITY = new CM_DIVISION_ENTITY();

    constructor(injector: Injector,
        private _fileDownloadService: FileDownloadService,
        private _divisionService: DivisionServiceProxy) {
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
        this.appToolbar.setRole('Division', true, true, false, true, true, true, false, true);
        this.appToolbar.setEnableForListPage();
    }

    exportToExcel() {
        this._divisionService.cM_DIVISION_ToExcel(this.filterInput).subscribe(response => {
            this._fileDownloadService.downloadTempFile(response);
        })
    }

    getDivisions(event?: LazyLoadEvent): void {
        if (this.dataTable.shouldResetPaging) {
            this.dataTable.shouldResetPaging = false;
            this.changePage(0);
            return;
        }

        this.showTableLoading();

        this.setSortingForFilterModel(this.filterInput);

        this._divisionService.cM_DIVISION_Search(this.filterInput)
            .pipe(finalize(() => this.hideTableLoading()))
            .subscribe(result => {
                this.dataTable.records = result.items;
                this.dataTable.totalRecordsCount = result.totalCount;
                this.appToolbar.setEnableForListPage();
            });
    }

    onSelectRow(item: CM_DIVISION_ENTITY): void {
        this.appToolbar.onSelectRow(item);
    }

    onAdd(): void {
        this.navigatePassParam('/app/admin/division-add', null, { filterInput: JSON.stringify(this.filterInput) });
    }

    onUpdate(item: CM_DIVISION_ENTITY): void {
        this.navigatePassParam('/app/admin/division-edit', { id: item.diV_ID }, { filterInput: JSON.stringify(this.filterInput) });
    }

    onDelete(item: CM_DIVISION_ENTITY): void {
        this.message.confirm(
            this.l('DeleteWarningMessage', item.diV_NAME),
            this.l('AreYouSure'),
            (isConfirmed) => {
                if (isConfirmed) {
                    this.saving = true;
                    this._divisionService.cM_DIVISION_Del(item.diV_ID)
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

    onApprove(item: CM_DIVISION_ENTITY): void {

    }

    onViewDetail(item: CM_DIVISION_ENTITY): void {
        this.navigatePassParam('/app/admin/division-view', { id: item.diV_ID }, { filterInput: JSON.stringify(this.filterInput) });
    }

    onSave(): void {

    }

    onSearch(): void {
        this.changePage(0);
    }

    onResetSearch(): void {
        this.filterInput = new CM_DIVISION_ENTITY();
        this.changePage(0);
    }
}
