import { ListComponentBase } from "@app/ultilities/list-component-base";
import { Injector, Component, OnInit, ViewChild, ViewEncapsulation } from "@angular/core";
import { ModelServiceProxy, CM_MODEL_ENTITY, CM_CAR_TYPE_ENTITY, CarTypeServiceProxy } from "@shared/service-proxies/service-proxies";
import { LazyLoadEvent } from "primeng/api";
import { IUiAction } from "@app/ultilities/ui-action";
import { appModuleAnimation } from "@shared/animations/routerTransition";
import { FileDownloadService } from "@shared/utils/file-download.service";
import { finalize } from "rxjs/operators";

@Component({
    templateUrl: './model-list.component.html',
    encapsulation: ViewEncapsulation.None,
    animations: [appModuleAnimation()]
})

export class ModelListComponent extends ListComponentBase<CM_MODEL_ENTITY> implements IUiAction<CM_MODEL_ENTITY>, OnInit {
    filterInput: CM_MODEL_ENTITY = new CM_MODEL_ENTITY();
    carTypes: CM_CAR_TYPE_ENTITY[];

    constructor(injector: Injector,
        private _fileDownloadService: FileDownloadService,
        private _carTypeService: CarTypeServiceProxy,
        private _modelService: ModelServiceProxy) {
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
        this.appToolbar.setRole('Model', true, true, false, true, true, true, false, true);
        this.appToolbar.setEnableForListPage();

        this._carTypeService.cM_CAR_TYPE_Search(this.getFillterForCombobox()).subscribe(response => {
            this.carTypes = response.items;
        });
    }

    exportToExcel() {
        // this._modelService.cM_MODEL_ToExcel(this.filterInput).subscribe(response => {
        //     this._fileDownloadService.downloadTempFile(response);
        // })
    }

    getModels(event?: LazyLoadEvent): void {
        if (this.dataTable.shouldResetPaging) {
            this.dataTable.shouldResetPaging = false;
            this.changePage(0);
            return;
        }

        this.showTableLoading();

        this.setSortingForFilterModel(this.filterInput);

        this._modelService.cM_MODEL_Search(this.filterInput)
            .pipe(finalize(() => this.hideTableLoading()))
            .subscribe(result => {
                this.dataTable.records = result.items;
                this.dataTable.totalRecordsCount = result.totalCount;
                this.appToolbar.setEnableForListPage();
            });
    }

    onSelectRow(item: CM_MODEL_ENTITY): void {
        this.appToolbar.onSelectRow(item);
    }

    onAdd(): void {
        this.navigatePassParam('/app/admin/model-add', null, { filterInput: JSON.stringify(this.filterInput) });
    }

    onUpdate(item: CM_MODEL_ENTITY): void {
        this.navigatePassParam('/app/admin/model-edit', { id: item.mO_ID }, { filterInput: JSON.stringify(this.filterInput) });
    }

    onDelete(item: CM_MODEL_ENTITY): void {
        this.message.confirm(
            this.l('DeleteWarningMessage', item.mO_NAME),
            this.l('AreYouSure'),
            (isConfirmed) => {
                if (isConfirmed) {
                    this.saving = true;
                    this._modelService.cM_MODEL_Del(item.mO_ID)
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

    onApprove(item: CM_MODEL_ENTITY): void {

    }

    onViewDetail(item: CM_MODEL_ENTITY): void {
        this.navigatePassParam('/app/admin/model-view', { id: item.mO_ID }, { filterInput: JSON.stringify(this.filterInput) });
    }

    onSave(): void {

    }

    onSearch(): void {
        this.changePage(0);
    }

    onResetSearch(): void {
        this.filterInput = new CM_MODEL_ENTITY();
        this.changePage(0);
    }
}
