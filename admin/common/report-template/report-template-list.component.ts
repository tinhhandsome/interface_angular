import { ListComponentBase } from "@app/ultilities/list-component-base";
import { Injector, Component, OnInit, ViewChild, ViewEncapsulation, AfterViewInit } from "@angular/core";
import { ReportTemplateServiceProxy, CM_REPORT_TEMPLATE_ENTITY, TL_MENU_ENTITY, AppMenuServiceProxy, AppMenuDto, } from "@shared/service-proxies/service-proxies";
import { LazyLoadEvent } from "primeng/api";
import { IUiAction } from "@app/ultilities/ui-action";
import { appModuleAnimation } from "@shared/animations/routerTransition";
import { FileDownloadService } from "@shared/utils/file-download.service";
import { finalize } from "rxjs/operators";

@Component({
    templateUrl: './report-template-list.component.html',
    encapsulation: ViewEncapsulation.None,
    animations: [appModuleAnimation()]
})

export class ReportTemplateListComponent extends ListComponentBase<CM_REPORT_TEMPLATE_ENTITY> implements IUiAction<CM_REPORT_TEMPLATE_ENTITY>, OnInit, AfterViewInit {
    filterInput: CM_REPORT_TEMPLATE_ENTITY = new CM_REPORT_TEMPLATE_ENTITY();
    menus: AppMenuDto[];
    constructor(injector: Injector,
        private fileDownloadService: FileDownloadService,
        private menuService: AppMenuServiceProxy,
        private reportTemplateService: ReportTemplateServiceProxy) {
        super(injector);
        this.initFilter();

    }



    ngOnInit(): void {
        // set ui action
        this.appToolbar.setUiAction(this);
        // set role toolbar 
        this.appToolbar.setRole('ReportTemplate', true, true, false, true, true, true, false, true);
        this.appToolbar.setEnableForListPage();
        this.initCombobox();
    }

    ngAfterViewInit(): void {
        // COMMENT: this.stopAutoUpdateView();
    }

    exportToExcel() {
        this.reportTemplateService.cM_REPORT_TEMPLATE_ToExcel(this.filterInputSearch).subscribe(response => {
            this.fileDownloadService.downloadTempFile(response);
        })
    }

    initCombobox() {
        this.menuService.getAllMenus().subscribe(response => {
            this.menus = response.filter(x=>x.route);
            this.updateView();
        });
    }

    search(): void {

        this.showTableLoading();

        this.setSortingForFilterModel(this.filterInputSearch);

        this.reportTemplateService.cM_REPORT_TEMPLATE_Search(this.filterInputSearch)
            .pipe(finalize(() => this.hideTableLoading()))
            .subscribe(result => {
                this.dataTable.records = result.items;
                this.dataTable.totalRecordsCount = result.totalCount;
                this.filterInputSearch.totalCount = result.totalCount;
                this.appToolbar.setEnableForListPage();
                this.updateView();
            });
    }

    onAdd(): void {
        this.navigatePassParam('/app/admin/reporttemplate-add', null, { filterInput: JSON.stringify(this.filterInputSearch) });
    }

    onUpdate(item: CM_REPORT_TEMPLATE_ENTITY): void {
        this.navigatePassParam('/app/admin/reporttemplate-edit', { id: item.reporT_TEMPLATE_ID }, { filterInput: JSON.stringify(this.filterInputSearch) });
    }

    onDelete(item: CM_REPORT_TEMPLATE_ENTITY): void {
        this.message.confirm(
            this.l('DeleteWarningMessage', item.reporT_TEMPLATE_ID),
            this.l('AreYouSure'),
            (isConfirmed) => {
                if (isConfirmed) {
                    this.saving = true;
                    this.reportTemplateService.cM_REPORT_TEMPLATE_Del(item.reporT_TEMPLATE_ID)
                        .pipe(finalize(() => { this.saving = false; }))
                        .subscribe((response) => {
                            if (response.result != '0') {
                                this.showErrorMessage(response.errorDesc);
                            }
                            else {
                                this.showSuccessMessage(this.l('SuccessfullyDeleted'));
                                this.filterInputSearch.totalCount = 0;
                                this.reloadPage();
                            }
                        });
                }
            }
        );
    }

    onApprove(item: CM_REPORT_TEMPLATE_ENTITY): void {

    }

    onViewDetail(item: CM_REPORT_TEMPLATE_ENTITY): void {
        this.navigatePassParam('/app/admin/reporttemplate-view', { id: item.reporT_TEMPLATE_ID }, { filterInput: JSON.stringify(this.filterInputSearch) });
    }

    onSave(): void {

    }



    onResetSearch(): void {
        this.filterInput = new CM_REPORT_TEMPLATE_ENTITY();
        this.changePage(0);
    }
}
