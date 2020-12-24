import { ListComponentBase } from "@app/ultilities/list-component-base";
import { Injector, Component, OnInit, ViewEncapsulation } from "@angular/core";
import { DepartmentServiceProxy, CM_DEPARTMENT_ENTITY, DeptGroupServiceProxy, CM_DEPT_GROUP_ENTITY, } from "@shared/service-proxies/service-proxies";
import { LazyLoadEvent } from "primeng/api";
import { IUiAction } from "@app/ultilities/ui-action";
import { appModuleAnimation } from "@shared/animations/routerTransition";
import { FileDownloadService } from "@shared/utils/file-download.service";
import { finalize } from "rxjs/operators";

@Component({
    templateUrl: './department-list.component.html',
    encapsulation: ViewEncapsulation.None,
    animations: [appModuleAnimation()]
})

export class DepartmentListComponent extends ListComponentBase<CM_DEPARTMENT_ENTITY> implements IUiAction<CM_DEPARTMENT_ENTITY>, OnInit {
    filterInput: CM_DEPARTMENT_ENTITY = new CM_DEPARTMENT_ENTITY();
    deptGroups: CM_DEPT_GROUP_ENTITY[];

    constructor(injector: Injector,
        private _fileDownloadService: FileDownloadService,
        private _deptGroupService: DeptGroupServiceProxy,
        private _departmentService: DepartmentServiceProxy
    ) {
        super(injector);
        this.initFilter();
    }

    ngOnInit(): void {
        // set ui action
        this.appToolbar.setUiAction(this);
        // set role toolbar
        this.appToolbar.setRole('Department', true, true, false, true, true, true, false, true);
        this.appToolbar.setEnableForListPage();

        this._deptGroupService.cM_DEPT_GROUP_Search(this.getFillterForCombobox()).subscribe(response => {
            this.deptGroups = response.items;
        });
    }

    exportToExcel() {
        this._departmentService.cM_DEPARTMENT_ToExcel(this.filterInput).subscribe(response => {
            this._fileDownloadService.downloadTempFile(response);
        })
    }

    getDepartments(event?: LazyLoadEvent): void {
        if (this.dataTable.shouldResetPaging) {
            this.dataTable.shouldResetPaging = false;
            this.changePage(0);
            return;
        }

        this.showTableLoading();

        this.setSortingForFilterModel(this.filterInput);

        this._departmentService.cM_DEPARTMENT_Search(this.filterInput)
            .pipe(finalize(() => this.hideTableLoading()))
            .subscribe(result => {
                this.dataTable.records = result.items;
                this.dataTable.totalRecordsCount = result.totalCount;
                this.appToolbar.setEnableForListPage();
            });
    }

    onSelectRow(item: CM_DEPARTMENT_ENTITY): void {
        this.appToolbar.onSelectRow(item);
    }

    onAdd(): void {
        this.navigatePassParam('/app/admin/department-add', null, { filterInput: JSON.stringify(this.filterInput) });
    }

    onUpdate(item: CM_DEPARTMENT_ENTITY): void {
        this.navigatePassParam('/app/admin/department-edit', { id: item.deP_ID }, { filterInput: JSON.stringify(this.filterInput) });
    }

    onDelete(item: CM_DEPARTMENT_ENTITY): void {
        this.message.confirm(
            this.l('DeleteWarningMessage', item.deP_NAME),
            this.l('AreYouSure'),
            (isConfirmed) => {
                if (isConfirmed) {
                    this.saving = true;
                    this._departmentService.cM_DEPARTMENT_Del(item.deP_ID)
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

    onApprove(item: CM_DEPARTMENT_ENTITY): void {

    }

    onViewDetail(item: CM_DEPARTMENT_ENTITY): void {
        this.navigatePassParam('/app/admin/department-view', { id: item.deP_ID }, { filterInput: JSON.stringify(this.filterInput) });
    }

    onSave(): void {

    }

    onSearch(): void {
        this.changePage(0);
    }

    onResetSearch(): void {
        this.filterInput = new CM_DEPARTMENT_ENTITY();
        this.changePage(0);
    }
}
