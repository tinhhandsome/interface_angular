import { ListComponentBase } from "@app/ultilities/list-component-base";
import { Injector, Component, OnInit, ViewEncapsulation } from "@angular/core";
import { DeptGroupServiceProxy, CM_DEPT_GROUP_ENTITY, } from "@shared/service-proxies/service-proxies";
import { LazyLoadEvent } from "primeng/api";
import { IUiAction } from "@app/ultilities/ui-action";
import { appModuleAnimation } from "@shared/animations/routerTransition";
import { FileDownloadService } from "@shared/utils/file-download.service";
import { finalize } from "rxjs/operators";

@Component({
    templateUrl: './dept-group-list.component.html',
    encapsulation: ViewEncapsulation.None,
    animations: [appModuleAnimation()]
})

export class DeptGroupListComponent extends ListComponentBase<CM_DEPT_GROUP_ENTITY> implements IUiAction<CM_DEPT_GROUP_ENTITY>, OnInit {
    filterInput: CM_DEPT_GROUP_ENTITY = new CM_DEPT_GROUP_ENTITY();

    constructor(injector: Injector,
        private _fileDownloadService: FileDownloadService,
        private _debtGroupService: DeptGroupServiceProxy
    ) {
        super(injector);
        this.initFilter();
    }

    ngOnInit(): void {
        // set ui action
        this.appToolbar.setUiAction(this);
        // set role toolbar
        this.appToolbar.setRole('DeptGroup', true, true, false, true, true, true, false, true);
        this.appToolbar.setEnableForListPage();
    }

    exportToExcel() {
        this._debtGroupService.cM_DEPT_GROUP_ToExcel(this.filterInput).subscribe(response => {
            this._fileDownloadService.downloadTempFile(response);
        })
    }

    getDeptGroups(event?: LazyLoadEvent): void {
        if (this.dataTable.shouldResetPaging) {
            this.dataTable.shouldResetPaging = false;
            this.changePage(0);
            return;
        }

        this.showTableLoading();

        this.setSortingForFilterModel(this.filterInput);

        this._debtGroupService.cM_DEPT_GROUP_Search(this.filterInput)
            .pipe(finalize(() => this.hideTableLoading()))
            .subscribe(result => {
                this.dataTable.records = result.items;
                this.dataTable.totalRecordsCount = result.totalCount;
                this.appToolbar.setEnableForListPage();
            });
    }

    onSelectRow(item: CM_DEPT_GROUP_ENTITY): void {
        this.appToolbar.onSelectRow(item);
    }

    onAdd(): void {
        this.navigatePassParam('/app/admin/dept-group-add', null, { filterInput: JSON.stringify(this.filterInput) });
    }

    onUpdate(item: CM_DEPT_GROUP_ENTITY): void {
        this.navigatePassParam('/app/admin/dept-group-edit', { id: item.grouP_ID }, { filterInput: JSON.stringify(this.filterInput) });
    }

    onDelete(item: CM_DEPT_GROUP_ENTITY): void {
        this.message.confirm(
            this.l('DeleteWarningMessage', item.grouP_NAME),
            this.l('AreYouSure'),
            (isConfirmed) => {
                if (isConfirmed) {
                    this.saving = true;
                    this._debtGroupService.cM_DEPT_GROUP_Del(item.grouP_ID)
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

    onApprove(item: CM_DEPT_GROUP_ENTITY): void {

    }

    onViewDetail(item: CM_DEPT_GROUP_ENTITY): void {
        this.navigatePassParam('/app/admin/dept-group-view', { id: item.grouP_ID }, { filterInput: JSON.stringify(this.filterInput) });
    }

    onSave(): void {

    }

    onSearch(): void {
        this.changePage(0);
    }

    onResetSearch(): void {
        this.filterInput = new CM_DEPT_GROUP_ENTITY();
        this.changePage(0);
    }
}
