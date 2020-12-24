import { ListComponentBase } from "@app/ultilities/list-component-base";
import { Injector, Component, OnInit, ViewChild, ViewEncapsulation, AfterViewInit } from "@angular/core";
import { AppMenuServiceProxy, TL_MENU_ENTITY, AppMenuDto, AsposeServiceProxy, ReportInfo, } from "@shared/service-proxies/service-proxies";
import { IUiAction } from "@app/ultilities/ui-action";
import { appModuleAnimation } from "@shared/animations/routerTransition";
import { FileDownloadService } from "@shared/utils/file-download.service";
import { finalize } from "rxjs/operators";
import { ReportTypeConsts } from "@app/admin/core/ultils/consts/ReportTypeConsts";

@Component({
    templateUrl: './app-menu-list.component.html',
    encapsulation: ViewEncapsulation.None,
    animations: [appModuleAnimation()]
})

export class AppMenuListComponent extends ListComponentBase<TL_MENU_ENTITY> implements IUiAction<TL_MENU_ENTITY>, OnInit, AfterViewInit {

    filterInput: TL_MENU_ENTITY = new TL_MENU_ENTITY();
    menuItems: TL_MENU_ENTITY[];

    constructor(injector: Injector,
        private asposeService : AsposeServiceProxy,
        private fileDownloadService: FileDownloadService,
        private menuService: AppMenuServiceProxy
    ) {
        super(injector);
        this.initFilter();
    }

    ngOnInit(): void {
        // set ui action
        this.appToolbar.setUiAction(this);
        // set role toolbar
        this.appToolbar.setRole('Menu', true, true, false, true, true, true, false, true);
        this.appToolbar.setEnableForListPage();

        this.menuService.tL_MENU_Search(this.getFillterForCombobox()).subscribe((response) => {
            var items = response.items;
            var nullValue: any = {
                menU_ID: ' ',
                menU_NAME: this.l('NullSelect')
            };
            items.unshift(nullValue);
            this.menuItems = items;
            this.updateView();
        })
    }

    ngAfterViewInit(): void {
        // COMMENT: this.stopAutoUpdateView();
    }

    search(): void {

        this.showTableLoading();

        this.setSortingForFilterModel(this.filterInputSearch);

        this.menuService.tL_MENU_Search(this.filterInputSearch)
            .pipe(finalize(() => this.hideTableLoading()))
            .subscribe(result => {
                this.dataTable.records = result.items;
                this.dataTable.totalRecordsCount = result.totalCount;
                this.filterInputSearch.totalCount = result.totalCount;
                this.appToolbar.setEnableForListPage();
                this.updateView();
            });
    }

    exportToExcel() {
        let reportInfo = new ReportInfo();
        reportInfo.typeExport = ReportTypeConsts.Excel;

        let reportFilter = { ...this.filterInputSearch };

        reportFilter.maxResultCount = -1;

        reportInfo.parameters = this.GetParamsFromFilter(reportFilter)

        reportInfo.values = this.GetParamsFromFilter({
            A1 : this.l('CompanyReportHeader')
        });

        reportInfo.pathName = "/COMMON/BC_THONGTINTRANG.xlsx";
        reportInfo.storeName = "TL_MENU_Search";

        this.asposeService.getReport(reportInfo).subscribe(x => {
            this.fileDownloadService.downloadTempFile(x);
        });
    }

    // exportToExcel() {
    //     this.menuService.tL_MENU_ToExcel(this.filterInputSearch).subscribe(response => {
    //         this._fileDownloadService.downloadTempFile(response);
    //     })
    // }

    onAdd(): void {
        this.navigatePassParam('/app/admin/app-menu-add', null, { filterInput: JSON.stringify(this.filterInputSearch) });
    }

    onUpdate(item: TL_MENU_ENTITY): void {
        this.navigatePassParam('/app/admin/app-menu-edit', { id: item.menU_ID }, { filterInput: JSON.stringify(this.filterInputSearch) });
    }

    onDelete(item: TL_MENU_ENTITY): void {
        this.message.confirm(
            this.l('DeleteWarningMessage', item.menU_NAME),
            this.l('AreYouSure'),
            (isConfirmed) => {
                if (isConfirmed) {
                    this.saving = true;
                    this.menuService.tL_MENU_Del(item.menU_ID)
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

    onApprove(item: TL_MENU_ENTITY): void {

    }

    onViewDetail(item: TL_MENU_ENTITY): void {
        this.navigatePassParam('/app/admin/app-menu-view', { id: item.menU_ID }, { filterInput: JSON.stringify(this.filterInputSearch) });
    }

    onSave(): void {

    }

    onResetSearch(): void {
        this.filterInput = new TL_MENU_ENTITY();
        this.changePage(0);
    }
}
