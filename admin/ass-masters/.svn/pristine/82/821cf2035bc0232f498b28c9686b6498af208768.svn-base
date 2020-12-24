import { ListComponentBase } from "@app/ultilities/list-component-base";
import { Injector, Component, OnInit, ViewChild, ViewEncapsulation, OnDestroy, AfterViewChecked, AfterViewInit } from "@angular/core";
import { AssCollectMultiServiceProxy, ASS_COLLECT_MULTI_MASTER_ENTITY, ReportInfo, AsposeServiceProxy, } from "@shared/service-proxies/service-proxies";
import { LazyLoadEvent } from "primeng/api";
import { IUiAction } from "@app/ultilities/ui-action";
import { appModuleAnimation } from "@shared/animations/routerTransition";
import { FileDownloadService } from "@shared/utils/file-download.service";
import { finalize } from "rxjs/operators";
import { ReportTypeConsts } from "@app/admin/core/ultils/consts/ReportTypeConsts";

@Component({
    templateUrl: './ass-collect-multi-list.component.html',
    encapsulation: ViewEncapsulation.None,
    animations: [appModuleAnimation()]
})

export class AssCollectMultiListComponent extends ListComponentBase<ASS_COLLECT_MULTI_MASTER_ENTITY> implements AfterViewInit, IUiAction<ASS_COLLECT_MULTI_MASTER_ENTITY>, OnInit {
    ngAfterViewInit(): void {
        // COMMENT: this.stopAutoUpdateView();
    }
    filterInput: ASS_COLLECT_MULTI_MASTER_ENTITY = new ASS_COLLECT_MULTI_MASTER_ENTITY();

    constructor(injector: Injector,
        private fileDownloadService: FileDownloadService,
        private assCollectMultiService: AssCollectMultiServiceProxy,
        private asposeService: AsposeServiceProxy) {
        super(injector);
        this.initFilter();
    }

    initDefaultFilter() {
        this.filterInput.brancH_ID = this.appSession.user.subbrId;
        this.filterInput.level = "UNIT";

    }

    ngOnInit(): void {
        // set ui action
        this.appToolbar.setUiAction(this);
        // set role toolba
        this.appToolbar.setRole('AssCollectMulti', true, true, false, true, true, true, false, true);
        this.appToolbar.setEnableForListPage();
    }

    exportToExcel() {
        let reportInfo = new ReportInfo();
        reportInfo.typeExport = ReportTypeConsts.Excel;
        
        let filterReport = {...this.filterInputSearch}

        reportInfo.parameters = this.GetParamsFromFilter(filterReport)

        reportInfo.values = this.GetParamsFromFilter({
            A1: this.l('CompanyReportHeader')
        });
        
        reportInfo.pathName = "/ASS_MASTER/rpt_ass_collect_multi.xlsx";
        reportInfo.storeName = "ASS_COLLECT_MULTI_MASTER_SEARCH";

        this.asposeService.getReport(reportInfo).subscribe(x => {
            this.fileDownloadService.downloadTempFile(x);
        });
    }


    search(): void {
        this.showTableLoading();

        this.setSortingForFilterModel(this.filterInputSearch);

        this.assCollectMultiService.aSS_COLLECT_MULTI_MASTER_Search(this.filterInputSearch)
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
        this.navigatePassParam('/app/admin/ass-collect-multi-add', null, { filterInput: JSON.stringify(this.filterInputSearch) });
    }

    onUpdate(item: ASS_COLLECT_MULTI_MASTER_ENTITY): void {
        this.navigatePassParam('/app/admin/ass-collect-multi-edit', { id: item.coL_MULTI_MASTER_ID }, { filterInput: JSON.stringify(this.filterInputSearch) });
    }

    onDelete(item: ASS_COLLECT_MULTI_MASTER_ENTITY): void {
        this.message.confirm(
            this.l('DeleteWarningMessage', item.coL_MULTI_MASTER_ID),
            this.l('AreYouSure'),
            (isConfirmed) => {
                if (isConfirmed) {
                    this.saving = true;
                    this.assCollectMultiService.aSS_COLLECT_MULTI_MASTER_Del(item.coL_MULTI_MASTER_ID)
                        .pipe(finalize(() => { this.saving = false; }))
                        .subscribe((response) => {
                            if (response['Result'] != '0') {
                                this.showErrorMessage(response['ErrorDesc']);
                            }
                            else {
                                this.showSuccessMessage(this.l('SuccessfullyDeleted'));
                                this.reloadPage();
                                this.changePage(0);
                            }
                        });
                }
            }
        );
    }

    onApprove(item: ASS_COLLECT_MULTI_MASTER_ENTITY): void {

    }

    onViewDetail(item: ASS_COLLECT_MULTI_MASTER_ENTITY): void {
        this.navigatePassParam('/app/admin/ass-collect-multi-view', { id: item.coL_MULTI_MASTER_ID }, { filterInput: JSON.stringify(this.filterInputSearch) });
    }

    onSave(): void {

    }



    onResetSearch(): void {
        this.filterInput = new ASS_COLLECT_MULTI_MASTER_ENTITY();
        this.initDefaultFilter();
        this.changePage(0);
    }
}
