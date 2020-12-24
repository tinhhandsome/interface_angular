import { ListComponentBase } from "@app/ultilities/list-component-base";
import { Injector, Component, OnInit, ViewChild, ViewEncapsulation, OnDestroy, AfterViewChecked, AfterViewInit } from "@angular/core";
import { AssTransferMultiServiceProxy, ASS_TRANSFER_MULTI_MASTER_ENTITY, ReportInfo, AsposeServiceProxy, } from "@shared/service-proxies/service-proxies";
import { LazyLoadEvent } from "primeng/api";
import { IUiAction } from "@app/ultilities/ui-action";
import { appModuleAnimation } from "@shared/animations/routerTransition";
import { FileDownloadService } from "@shared/utils/file-download.service";
import { finalize } from "rxjs/operators";
import { ReportTypeConsts } from "@app/admin/core/ultils/consts/ReportTypeConsts";

@Component({
    templateUrl: './ass-transfer-multi-list.component.html',
    encapsulation: ViewEncapsulation.None,
    animations: [appModuleAnimation()]
})

export class AssTransferMultiListComponent extends ListComponentBase<ASS_TRANSFER_MULTI_MASTER_ENTITY> implements AfterViewInit, IUiAction<ASS_TRANSFER_MULTI_MASTER_ENTITY>, OnInit {
    ngAfterViewInit(): void {
        // COMMENT: this.stopAutoUpdateView();
    }
    filterInput: ASS_TRANSFER_MULTI_MASTER_ENTITY = new ASS_TRANSFER_MULTI_MASTER_ENTITY();

    constructor(injector: Injector,
        private fileDownloadService: FileDownloadService,
        private assTransferMultiService: AssTransferMultiServiceProxy,
        private asposeService: AsposeServiceProxy) {
        super(injector);
        this.initFilter();
    }

    ngOnInit(): void {
        // set ui action
        this.appToolbar.setUiAction(this);
        // set role toolbar
        this.appToolbar.setRole('AssTransferMulti', true, true, false, true, true, true, false, true);
        this.appToolbar.setEnableForListPage();
    }

    exportToExcel() {
        let reportInfo = new ReportInfo();
        reportInfo.typeExport = ReportTypeConsts.Excel;

        let filterReport = {...this.filterInputSearch}

        filterReport.maxResultCount = -1;
        // filterReport.totalCount = this.isNull(filterReport.totalCount) ? 0 : filterReport.totalCount;
        filterReport.skipCount = 0;

        reportInfo.parameters = this.GetParamsFromFilter(filterReport)

        reportInfo.values = this.GetParamsFromFilter({
            A1: this.l('CompanyReportHeader')
        });
        
        reportInfo.pathName = "/ASS_MASTER/rpt_ass_transfer_multi.xlsx";
        reportInfo.storeName = "ASS_TRANSFER_MULTI_MASTER_SEARCH";

        this.asposeService.getReport(reportInfo).subscribe(x => {
            this.fileDownloadService.downloadTempFile(x);
        });
    }

    search(): void {
        this.showTableLoading();

        this.setSortingForFilterModel(this.filterInputSearch);

        this.assTransferMultiService.aSS_TRANSFER_MULTI_MASTER_Search(this.filterInputSearch)
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
        this.navigatePassParam('/app/admin/ass-transfer-multi-add', null, { filterInput: JSON.stringify(this.filterInputSearch) });
    }

    onUpdate(item: ASS_TRANSFER_MULTI_MASTER_ENTITY): void {
        this.navigatePassParam('/app/admin/ass-transfer-multi-edit', { id: item.tranS_MULTI_MASTER_ID }, { filterInput: JSON.stringify(this.filterInputSearch) });
    }

    onDelete(item: ASS_TRANSFER_MULTI_MASTER_ENTITY): void {
        this.message.confirm(
            this.l('DeleteWarningMessage', item.tranS_MULTI_MASTER_ID),
            this.l('AreYouSure'),
            (isConfirmed) => {
                if (isConfirmed) {
                    this.saving = true;
                    this.assTransferMultiService.aSS_TRANSFER_MULTI_MASTER_Del(item.tranS_MULTI_MASTER_ID)
                        .pipe(finalize(() => { this.saving = false; }))
                        .subscribe((response) => {
                            if (response['Result'] != '0') {
                                this.showErrorMessage(response['ErrorDesc']);
                            }
                            else {
                                this.showSuccessMessage(this.l('SuccessfullyDeleted'));
                                this.changePage(0);
                                this.reloadPage();
                            }
                        });
                }
            }
        );
    }

    onApprove(item: ASS_TRANSFER_MULTI_MASTER_ENTITY): void {

    }

    onViewDetail(item: ASS_TRANSFER_MULTI_MASTER_ENTITY): void {
        this.navigatePassParam('/app/admin/ass-transfer-multi-view', { id: item.tranS_MULTI_MASTER_ID }, { filterInput: JSON.stringify(this.filterInputSearch) });
    }

    onSave(): void {

    }


    initDefaultFilter() {
        this.filterInput.brancH_ID = this.appSession.user.subbrId;
        this.filterInput.level = "UNIT";

    }
    onResetSearch(): void {
        this.filterInput = new ASS_TRANSFER_MULTI_MASTER_ENTITY();
        this.initDefaultFilter();
        this.changePage(0);
        this.updateView();
    }
}
