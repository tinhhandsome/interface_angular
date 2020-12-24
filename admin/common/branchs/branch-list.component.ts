import { ListComponentBase } from "@app/ultilities/list-component-base";
import { Injector, Component, OnInit, ViewEncapsulation } from "@angular/core";
import { BranchServiceProxy, CM_BRANCH_ENTITY, } from "@shared/service-proxies/service-proxies";
import { LazyLoadEvent } from "primeng/api";
import * as $ from 'jquery';
import { IUiAction } from "@app/ultilities/ui-action";
import { appModuleAnimation } from "@shared/animations/routerTransition";
import { FileDownloadService } from "@shared/utils/file-download.service";
import { finalize } from "rxjs/operators";

@Component({
    templateUrl: './branch-list.component.html',
    encapsulation: ViewEncapsulation.None,
    animations: [appModuleAnimation()]
})

export class BranchListComponent extends ListComponentBase<CM_BRANCH_ENTITY> implements IUiAction<CM_BRANCH_ENTITY>, OnInit {
    filterInput: CM_BRANCH_ENTITY = new CM_BRANCH_ENTITY();
    
    constructor(injector: Injector,
        private _branchService: BranchServiceProxy,
        private _fileDownloadService: FileDownloadService) {
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
        this.appToolbar.setRole('Branch', true, true, false, true, true, true, false, true);
        this.appToolbar.setEnableForListPage();
    }

    getBranchs(event?: LazyLoadEvent): void {
        if (this.dataTable.shouldResetPaging) {
            this.dataTable.shouldResetPaging = false;
            this.changePage(0);
            return;
        }

        this.showTableLoading();

        this.setSortingForFilterModel(this.filterInput);

        this._branchService.cM_BRANCH_Search(this.filterInput)
            .pipe(finalize(() => this.hideTableLoading()))
            .subscribe(result => {
                this.dataTable.records = result.items;
                this.dataTable.totalRecordsCount = result.totalCount;
                this.appToolbar.setEnableForListPage();
            });


        if (this.dataTable.shouldResetPaging) {
            this.dataTable.shouldResetPaging = false;
            this.changePage(0);
            return;
        }
    }

    exportToExcel(): void {
        this._branchService.cM_BRANCH_ToExcel(this.filterInput).subscribe(response => {
            this._fileDownloadService.downloadTempFile(response);
        })
    }

    onUploadExcelError(): void {
        this.showErrorMessage(this.l('ExportExcelFailed'));
    }

    selectRow(event: { currentTarget: any; }, item: CM_BRANCH_ENTITY): void {
        // set ui
        $(event.currentTarget).closest('table').find('tr.selectable').removeClass('selected');
        $(event.currentTarget).addClass('selected');

        // on apptoolbar select row
        this.appToolbar.onSelectRow(item);
    }

    onAdd(): void {
        this.navigatePassParam('/app/admin/branch-add', null, { filterInput: JSON.stringify(this.filterInput) });
    }

    onUpdate(item: CM_BRANCH_ENTITY): void {
        this.navigatePassParam('/app/admin/branch-edit', { id: item.brancH_ID }, { filterInput: JSON.stringify(this.filterInput) });
    }

    onDelete(item: CM_BRANCH_ENTITY): void {
        this.message.confirm(
            this.l('DeleteWarningMessage', item.brancH_NAME),
            this.l('AreYouSure'),
            (isConfirmed) => {
                if (isConfirmed) {
                    this.saving = true;
                    this._branchService.cM_BRANCH_Del(item.brancH_ID)
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

    onApprove(item: CM_BRANCH_ENTITY): void {
    }

    onViewDetail(item: CM_BRANCH_ENTITY): void {
        this.navigatePassParam('/app/admin/branch-view', { id: item.brancH_ID }, { filterInput: JSON.stringify(this.filterInput) });
    }

    onSave(): void {
    }

    onSearch(): void {
        this.changePage(0);
    }

    onResetSearch(): void {
        this.filterInput = new CM_BRANCH_ENTITY();
        this.changePage(0);
    }
}
