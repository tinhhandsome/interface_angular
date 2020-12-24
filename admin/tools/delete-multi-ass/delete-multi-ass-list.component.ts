import { ListComponentBase } from "@app/ultilities/list-component-base";
import { Injector, Component, OnInit, ViewEncapsulation, AfterViewInit } from "@angular/core";
import { DeleteMultiAssServiceProxy, T_DEL_ASS_MUL_ENTITY, ReportInfo, AsposeServiceProxy } from "@shared/service-proxies/service-proxies";
import { IUiAction } from "@app/ultilities/ui-action";
import { appModuleAnimation } from "@shared/animations/routerTransition";
import { FileDownloadService } from "@shared/utils/file-download.service";
import { finalize } from "rxjs/operators";
import { AuthStatusConsts } from "@app/admin/core/ultils/consts/AuthStatusConsts";
import { ReportTypeConsts } from "@app/admin/core/ultils/consts/ReportTypeConsts";

@Component({
    templateUrl: './delete-multi-ass-list.component.html',
    encapsulation: ViewEncapsulation.None,
    animations: [appModuleAnimation()]
})

export class DeleteMultiAssListComponent extends ListComponentBase<T_DEL_ASS_MUL_ENTITY> implements IUiAction<T_DEL_ASS_MUL_ENTITY>, OnInit, AfterViewInit {

    filterInput: T_DEL_ASS_MUL_ENTITY = new T_DEL_ASS_MUL_ENTITY();
    constructor(
        injector: Injector,
        private fileDownloadService: FileDownloadService,
        private deleteMultiAssService: DeleteMultiAssServiceProxy,
        private asposeService: AsposeServiceProxy) {
        super(injector);
        this.initFilter();

    }

    initFilter() {
        this.getFilterInputInRoute((filterJson) => {
            if (filterJson) {
                this.filterInput = JSON.parse(filterJson);
            }
        });
        
    }

    ngAfterViewInit(): void {
        // COMMENT: this.stopAutoUpdateView();
    }

    ngOnInit(): void {
        // set ui action
        this.appToolbar.setUiAction(this);
        // set role toolbar
        this.appToolbar.setRole('DeleteMultiAss', true, true, false, true, true, true, false, true);
        this.appToolbar.setEnableForListPage();
    }

    exportToExcel(): void {
        this.initFilterInputSearch();
        let reportInfo = new ReportInfo();
        reportInfo.typeExport = ReportTypeConsts.Excel;

        let filterReport = { ...this.filterInputSearch }
        filterReport.maxResultCount = -1;
        filterReport.top = 0;

        reportInfo.parameters = this.GetParamsFromFilter(filterReport)

        reportInfo.values = this.GetParamsFromFilter({
            A1: this.l('CompanyReportHeader')
        });

        reportInfo.pathName = "/TOOL/rpt_delete_multi_ass_list.xlsx";
        reportInfo.storeName = "T_DEL_ASS_MULTI_Search";
        this.asposeService.getReport(reportInfo).subscribe(x => {
            this.fileDownloadService.downloadTempFile(x);
        });
    }

    initFilterInputSearch(): void {
        this.filterInput.brancH_ID = this.appSession.user.subbrId;
        this.filterInput.level = 'ALL';
    }

    search(): void {
        this.showTableLoading();
        this.initFilterInputSearch();
        this.setSortingForFilterModel(this.filterInputSearch);
        this.deleteMultiAssService.t_DEL_ASS_MUL_Search(this.filterInputSearch)
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
        this.navigatePassParam('/app/admin/delete-multi-ass-add', null, { filterInput: JSON.stringify(this.filterInputSearch) });
    }

    onUpdate(item: T_DEL_ASS_MUL_ENTITY): void {
        this.navigatePassParam('/app/admin/delete-multi-ass-edit', { id: item.deL_ASS_MUL_ID }, { filterInput: JSON.stringify(this.filterInputSearch) });
    }

    onDelete(item: T_DEL_ASS_MUL_ENTITY): void {
        if (item.autH_STATUS == AuthStatusConsts.Approve) {
            this.showErrorMessage(this.l('YouCannotDeleteThisObject'));
            this.updateView();
            return;
        }
        this.message.confirm(
            this.l('DeleteWarningMessage', item.deL_ASS_MUL_CODE),
            this.l('AreYouSure'),
            (isConfirmed) => {
                if (isConfirmed) {
                    this.saving = true;
                    this.deleteMultiAssService.t_DEL_ASS_MUL_Del(item.deL_ASS_MUL_ID)
                        .pipe(finalize(() => { this.saving = false; }))
                        .subscribe((response) => {
                            if (response['Result'] != '0') {
                                this.showErrorMessage(response['ErrorDesc']);
                            }
                            else {
                                this.showSuccessMessage(this.l('SuccessfullyDeleted'));
                                this.filterInputSearch.totalCount = 0;
                                this.reloadPage();
                            }
                        });
                    this.updateView();
                }
            }
        );
    }

    onApprove(item: T_DEL_ASS_MUL_ENTITY): void {

    }

    onViewDetail(item: T_DEL_ASS_MUL_ENTITY): void {
        this.navigatePassParam('/app/admin/delete-multi-ass-view', { id: item.deL_ASS_MUL_ID }, { filterInput: JSON.stringify(this.filterInputSearch) });
    }

    onSave(): void {

    }



    onResetSearch(): void {
        this.filterInput = new T_DEL_ASS_MUL_ENTITY();
        this.changePage(0);
    }
}
