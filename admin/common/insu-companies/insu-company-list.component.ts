import { ListComponentBase } from "@app/ultilities/list-component-base";
import { Injector, Component, OnInit, ViewChild, ViewEncapsulation } from "@angular/core";
import { InsuCompanyServiceProxy, CM_INSU_COMPANY_ENTITY, } from "@shared/service-proxies/service-proxies";
import { LazyLoadEvent } from "primeng/api";
import { IUiAction } from "@app/ultilities/ui-action";
import { appModuleAnimation } from "@shared/animations/routerTransition";
import { FileDownloadService } from "@shared/utils/file-download.service";
import { finalize } from "rxjs/operators";

@Component({
    templateUrl: './insu-company-list.component.html',
    encapsulation: ViewEncapsulation.None,
    animations: [appModuleAnimation()]
})

export class InsuCompanyListComponent extends ListComponentBase<CM_INSU_COMPANY_ENTITY> implements IUiAction<CM_INSU_COMPANY_ENTITY>, OnInit {
    filterInput: CM_INSU_COMPANY_ENTITY = new CM_INSU_COMPANY_ENTITY();

    constructor(injector: Injector,
        private _fileDownloadService: FileDownloadService,
        private _insuCompanyService: InsuCompanyServiceProxy) {
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
        this.appToolbar.setRole('InsuCompany', true, true, false, true, true, true, false, true);
        this.appToolbar.setEnableForListPage();
    }

    exportToExcel() {
        // this._insuCompanyService.cM_INSU_COMPANY_ToExcel(this.filterInput).subscribe(response => {
        //     this._fileDownloadService.downloadTempFile(response);
        // })
    }

    getInsuCompanies(event?: LazyLoadEvent): void {
        if (this.dataTable.shouldResetPaging) {
            this.dataTable.shouldResetPaging = false;
            this.changePage(0);
            return;
        }

        this.showTableLoading();

        this.setSortingForFilterModel(this.filterInput);

        this._insuCompanyService.cM_INSU_COMPANY_Search(this.filterInput)
            .pipe(finalize(() => this.hideTableLoading()))
            .subscribe(result => {
                this.dataTable.records = result.items;
                this.dataTable.totalRecordsCount = result.totalCount;
                this.appToolbar.setEnableForListPage();
            });
    }

    onSelectRow(item: CM_INSU_COMPANY_ENTITY): void {
        this.appToolbar.onSelectRow(item);
    }

    onAdd(): void {
        this.navigatePassParam('/app/admin/insu-company-add', null, { filterInput: JSON.stringify(this.filterInput) });
    }

    onUpdate(item: CM_INSU_COMPANY_ENTITY): void {
        this.navigatePassParam('/app/admin/insu-company-edit', { id: item.insU_COMPANY_ID }, { filterInput: JSON.stringify(this.filterInput) });
    }

    onDelete(item: CM_INSU_COMPANY_ENTITY): void {
        this.message.confirm(
            this.l('DeleteWarningMessage', item.name),
            this.l('AreYouSure'),
            (isConfirmed) => {
                if (isConfirmed) {
                    this.saving = true;
                    this._insuCompanyService.cM_INSU_COMPANY_Del(item.insU_COMPANY_ID)
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

    onApprove(item: CM_INSU_COMPANY_ENTITY): void {

    }

    onViewDetail(item: CM_INSU_COMPANY_ENTITY): void {
        this.navigatePassParam('/app/admin/insu-company-view', { id: item.insU_COMPANY_ID }, { filterInput: JSON.stringify(this.filterInput) });
    }

    onSave(): void {

    }

    onSearch(): void {
        this.changePage(0);
    }

    onResetSearch(): void {
        this.filterInput = new CM_INSU_COMPANY_ENTITY();
        this.changePage(0);
    }
}
