import { ListComponentBase } from "@app/ultilities/list-component-base";
import { Injector, Component, OnInit, ViewChild, ViewEncapsulation } from "@angular/core";
import { UnitServiceProxy, CM_UNIT_ENTITY, } from "@shared/service-proxies/service-proxies";
import { LazyLoadEvent } from "primeng/api";
import { IUiAction } from "@app/ultilities/ui-action";
import { appModuleAnimation } from "@shared/animations/routerTransition";
import { FileDownloadService } from "@shared/utils/file-download.service";
import { finalize } from "rxjs/operators";

@Component({
    templateUrl: './unit-list.component.html',
    encapsulation: ViewEncapsulation.None,
    animations: [appModuleAnimation()]
})

export class UnitListComponent extends ListComponentBase<CM_UNIT_ENTITY> implements IUiAction<CM_UNIT_ENTITY>, OnInit {
    filterInput: CM_UNIT_ENTITY = new CM_UNIT_ENTITY();

    constructor(injector: Injector,
        private _fileDownloadService: FileDownloadService,
        private _unitService: UnitServiceProxy) {
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
        this.appToolbar.setRole('Unit', true, true, false, true, true, true, false, true);
        this.appToolbar.setEnableForListPage();
    }

    exportToExcel() {
        // this._unitService.cM_UNIT_ToExcel(this.filterInput).subscribe(response => {
        //     this._fileDownloadService.downloadTempFile(response);
        // })
    }

    getUnits(event?: LazyLoadEvent): void {
        if (this.dataTable.shouldResetPaging) {
            this.dataTable.shouldResetPaging = false;
            this.changePage(0);
            return;
        }

        this.showTableLoading();

        this.setSortingForFilterModel(this.filterInput);

        this._unitService.cM_UNIT_Search(this.filterInput)
            .pipe(finalize(() => this.hideTableLoading()))
            .subscribe(result => {
                this.dataTable.records = result.items;
                this.dataTable.totalRecordsCount = result.totalCount;
                this.appToolbar.setEnableForListPage();
            });
    }

    onSelectRow(item: CM_UNIT_ENTITY): void {
        this.appToolbar.onSelectRow(item);
    }

    onAdd(): void {
        this.navigatePassParam('/app/admin/unit-add', null, { filterInput: JSON.stringify(this.filterInput) });
    }

    onUpdate(item: CM_UNIT_ENTITY): void {
        this.navigatePassParam('/app/admin/unit-edit', { id: item.uniT_ID }, { filterInput: JSON.stringify(this.filterInput) });
    }

    onDelete(item: CM_UNIT_ENTITY): void {
        this.message.confirm(
            this.l('DeleteWarningMessage', item.uniT_NAME),
            this.l('AreYouSure'),
            (isConfirmed) => {
                if (isConfirmed) {
                    this.saving = true;
                    this._unitService.cM_UNIT_Del(item.uniT_ID)
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

    onApprove(item: CM_UNIT_ENTITY): void {

    }

    onViewDetail(item: CM_UNIT_ENTITY): void {
        this.navigatePassParam('/app/admin/unit-view', { id: item.uniT_ID }, { filterInput: JSON.stringify(this.filterInput) });
    }

    onSave(): void {

    }

    onSearch(): void {
        this.changePage(0);
    }

    onResetSearch(): void {
        this.filterInput = new CM_UNIT_ENTITY();
        this.changePage(0);
    }
}
