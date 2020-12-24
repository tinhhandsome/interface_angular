import { ListComponentBase } from "@app/ultilities/list-component-base";
import { Injector, Component, OnInit, ViewChild, ViewEncapsulation } from "@angular/core";
import { AllCodeServiceProxy, CM_ALLCODE_ENTITY, } from "@shared/service-proxies/service-proxies";
import { LazyLoadEvent } from "primeng/api";
import { IUiAction } from "@app/ultilities/ui-action";
import { appModuleAnimation } from "@shared/animations/routerTransition";
import { FileDownloadService } from "@shared/utils/file-download.service";
import { finalize } from "rxjs/operators";

@Component({
    templateUrl: './all-code-list.component.html',
    encapsulation: ViewEncapsulation.None,
    animations: [appModuleAnimation()]
})

export class AllCodeListComponent extends ListComponentBase<CM_ALLCODE_ENTITY> implements IUiAction<CM_ALLCODE_ENTITY>, OnInit {
    filterInput: CM_ALLCODE_ENTITY = new CM_ALLCODE_ENTITY();
    constructor(injector: Injector,
        private _fileDownloadService: FileDownloadService,
        private _allCodeService: AllCodeServiceProxy
    ) {
        super(injector);
        this.initFilter();
    }

    ngOnInit(): void {
        // set ui action
        this.appToolbar.setUiAction(this);
        // set role toolbar
        this.appToolbar.setRole('AllCode', true, true, false, true, true, true, false, true);
        this.appToolbar.setEnableForListPage();
    }

    exportToExcel() {
        // this._allCodeService.cM_ALLCODE_ToExcel(this.filterInput).subscribe(response => {
        //     this._fileDownloadService.downloadTempFile(response);
        // })
    }

    getAllCodes(event?: LazyLoadEvent): void {
        if (this.dataTable.shouldResetPaging) {
            this.dataTable.shouldResetPaging = false;
            this.changePage(0);
            return;
        }

        this.showTableLoading();

        this.setSortingForFilterModel(this.filterInput);

        this._allCodeService.cM_ALLCODE_Search(this.filterInput)
            .pipe(finalize(() => this.hideTableLoading()))
            .subscribe(result => {
                this.dataTable.records = result.items;
                this.dataTable.totalRecordsCount = result.totalCount;
                this.appToolbar.setEnableForListPage();
            });
    }

    onSelectRow(item: CM_ALLCODE_ENTITY): void {
        this.appToolbar.onSelectRow(item);
    }

    onAdd(): void {
        this.navigatePassParam('/app/admin/all-code-add', null, { filterInput: JSON.stringify(this.filterInput) });
    }

    onUpdate(item: CM_ALLCODE_ENTITY): void {
        this.navigatePassParam('/app/admin/all-code-edit', { id: item.id }, { filterInput: JSON.stringify(this.filterInput) });
    }

    onDelete(item: CM_ALLCODE_ENTITY): void {
        this.message.confirm(
            this.l('DeleteWarningMessage', item.content),
            this.l('AreYouSure'),
            (isConfirmed) => {
                if (isConfirmed) {
                    this.saving = true;
                    this._allCodeService.cM_ALLCODE_Del(item.id)
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

    onApprove(item: CM_ALLCODE_ENTITY): void {
    }

    onViewDetail(item: CM_ALLCODE_ENTITY): void {
        this.navigatePassParam('/app/admin/all-code-view', { id: item.id }, { filterInput: JSON.stringify(this.filterInput) });
    }

    onSave(): void {
    }

    onSearch(): void {
        this.changePage(0);
    }

    onResetSearch(): void {
        this.filterInput = new CM_ALLCODE_ENTITY();
        this.changePage(0);
    }
}
