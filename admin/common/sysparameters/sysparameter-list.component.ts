import { ListComponentBase } from "@app/ultilities/list-component-base";
import { Injector, Component, OnInit, ViewChild, ViewEncapsulation } from "@angular/core";
import { SysParametersServiceProxy, SYS_PARAMETERS_ENTITY, } from "@shared/service-proxies/service-proxies";
import { LazyLoadEvent } from "primeng/api";
import { IUiAction } from "@app/ultilities/ui-action";
import { appModuleAnimation } from "@shared/animations/routerTransition";
import { FileDownloadService } from "@shared/utils/file-download.service";
import { finalize } from "rxjs/operators";

@Component({
    templateUrl: './sysparameter-list.component.html',
    encapsulation: ViewEncapsulation.None,
    animations: [appModuleAnimation()]
})

export class SysParameterListComponent extends ListComponentBase<SYS_PARAMETERS_ENTITY> implements IUiAction<SYS_PARAMETERS_ENTITY>, OnInit {
    filterInput: SYS_PARAMETERS_ENTITY = new SYS_PARAMETERS_ENTITY();

    constructor(injector: Injector,
        private _fileDownloadService: FileDownloadService,
        private _sysParameterService: SysParametersServiceProxy
    ) {
        super(injector);
        this.initFilter();
    }

    ngOnInit(): void {
        // set ui action
        this.appToolbar.setUiAction(this);
        // set role toolbar
        this.appToolbar.setRole('SysParameter', true, true, false, true, true, true, false, true);
        this.appToolbar.setEnableForListPage();
    }

    exportToExcel() {
        this._sysParameterService.sYS_PARAMETERS_ToExcel(this.filterInput).subscribe(response => {
            this._fileDownloadService.downloadTempFile(response);
        })
    }

    getSysParameters(event?: LazyLoadEvent): void {
        if (this.dataTable.shouldResetPaging) {
            this.dataTable.shouldResetPaging = false;
            this.changePage(0);
            return;
        }

        this.showTableLoading();

        this.setSortingForFilterModel(this.filterInput);

        this._sysParameterService.sYS_PARAMETERS_Search(this.filterInput)
            .pipe(finalize(() => this.hideTableLoading()))
            .subscribe(result => {
                this.dataTable.records = result.items;
                this.dataTable.totalRecordsCount = result.totalCount;
                this.appToolbar.setEnableForListPage();
            });
    }

    onSelectRow(item: SYS_PARAMETERS_ENTITY): void {
        this.appToolbar.onSelectRow(item);
    }

    onAdd(): void {
        this.navigatePassParam('/app/admin/argument-add', null, { filterInput: JSON.stringify(this.filterInput) });
    }

    onUpdate(item: SYS_PARAMETERS_ENTITY): void {
        this.navigatePassParam('/app/admin/argument-edit', { id: item.id }, { filterInput: JSON.stringify(this.filterInput) });
    }

    onDelete(item: SYS_PARAMETERS_ENTITY): void {
        this.message.confirm(
            this.l('DeleteWarningMessage', item.paraKey),
            this.l('AreYouSure'),
            (isConfirmed) => {
                if (isConfirmed) {
                    this.saving = true;
                    this._sysParameterService.sYS_PARAMETERS_Del(item.id)
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

    onApprove(item: SYS_PARAMETERS_ENTITY): void {

    }

    onViewDetail(item: SYS_PARAMETERS_ENTITY): void {
        this.navigatePassParam('/app/admin/argument-view', { id: item.id }, { filterInput: JSON.stringify(this.filterInput) });
    }

    onSave(): void {

    }

    onSearch(): void {
        this.changePage(0);
    }

    onResetSearch(): void {
        this.filterInput = new SYS_PARAMETERS_ENTITY();
        this.changePage(0);
    }
}
