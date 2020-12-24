import { ListComponentBase } from "@app/ultilities/list-component-base";
import { Injector, Component, OnInit, ViewChild, ViewEncapsulation, ElementRef } from "@angular/core";
import { EmployeeServiceProxy, CM_EMPLOYEE_ENTITY, CM_BRANCH_ENTITY, DepartmentServiceProxy, CM_DEPARTMENT_ENTITY, BranchServiceProxy, } from "@shared/service-proxies/service-proxies";
import { LazyLoadEvent } from "primeng/api";
import { IUiAction } from "@app/ultilities/ui-action";
import { appModuleAnimation } from "@shared/animations/routerTransition";

import { FileDownloadService } from "@shared/utils/file-download.service";
import { finalize } from "rxjs/operators";

@Component({
    templateUrl: './employee-list.component.html',
    encapsulation: ViewEncapsulation.None,
    animations: [appModuleAnimation()]
})

export class EmployeeListComponent extends ListComponentBase<CM_EMPLOYEE_ENTITY> implements IUiAction<CM_EMPLOYEE_ENTITY>, OnInit {
    filterInput: CM_EMPLOYEE_ENTITY = new CM_EMPLOYEE_ENTITY();
    departments: CM_DEPARTMENT_ENTITY[];
    branchs: CM_BRANCH_ENTITY[];

    constructor(injector: Injector,
        private _fileDownloadService: FileDownloadService,
        private _departmentService: DepartmentServiceProxy,
        private _branchService: BranchServiceProxy,
        private _employeeService: EmployeeServiceProxy) {
        super(injector);

        this.initFilter();
    }

    initFilter() {
        this.getFilterInputInRoute((filterJson) => {
            if (filterJson) {
                this.filterInput = JSON.parse(filterJson);
            }
            else {
                // this.filterInput.independenT_UNIT = true;
            }
        });
    }


    ngOnInit(): void {
        // set ui action
        this.appToolbar.setUiAction(this);
        // set role toolbar
        this.appToolbar.setRole('Employee', true, true, false, true, true, true, false, true);
        this.appToolbar.setEnableForListPage();

        var filterCombobox = this.getFillterForCombobox();

        this._branchService.cM_BRANCH_Search(filterCombobox).subscribe(response => {
            this.branchs = response.items;
        });
    }

    exportToExcel() {
        // this._employeeService.cM_EMPLOYEE_ToExcel(this.filterInput).subscribe(response => {
        //     this._fileDownloadService.downloadTempFile(response);
        // })
    }

    getEmployees(event?: LazyLoadEvent): void {
        if (this.dataTable.shouldResetPaging) {
            this.dataTable.shouldResetPaging = false;
            this.changePage(0);
            return;
        }

        this.showTableLoading();

        this.setSortingForFilterModel(this.filterInput);

        this._employeeService.cM_EMPLOYEE_Search(this.filterInput)
            .pipe(finalize(() => this.hideTableLoading()))
            .subscribe(result => {
                this.dataTable.records = result.items;
                this.dataTable.totalRecordsCount = result.totalCount;
                this.appToolbar.setEnableForListPage();
            });
    }

    onChangeBranch(branch) {
        var filterCombobox = this.getFillterForCombobox();
        filterCombobox.brancH_ID = branch ? branch.brancH_ID : '-';

        this._departmentService.cM_DEPARTMENT_Search(filterCombobox).subscribe(response => {
            this.departments = response.items;
        });
    }

    onSelectRow(item: CM_EMPLOYEE_ENTITY): void {
        this.appToolbar.onSelectRow(item);
    }

    onAdd(): void {
        this.navigatePassParam('/app/admin/employee-add', null, { filterInput: JSON.stringify(this.filterInput) });
    }

    onUpdate(item: CM_EMPLOYEE_ENTITY): void {
        this.navigatePassParam('/app/admin/employee-edit', { id: item.emP_ID }, { filterInput: JSON.stringify(this.filterInput) });
    }

    onDelete(item: CM_EMPLOYEE_ENTITY): void {
        this.message.confirm(
            this.l('DeleteWarningMessage', item.emP_NAME),
            this.l('AreYouSure'),
            (isConfirmed) => {
                if (isConfirmed) {
                    this.saving = true;
                    this._employeeService.cM_EMPLOYEE_Del(item.emP_ID)
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

    onApprove(item: CM_EMPLOYEE_ENTITY): void {

    }

    onViewDetail(item: CM_EMPLOYEE_ENTITY): void {
        this.navigatePassParam('/app/admin/employee-view', { id: item.emP_ID }, { filterInput: JSON.stringify(this.filterInput) });
    }

    onSave(): void {

    }

    onSearch(): void {
        this.changePage(0);
    }

    onResetSearch(): void {
        this.filterInput = new CM_EMPLOYEE_ENTITY();
        this.changePage(0);
    }
}
