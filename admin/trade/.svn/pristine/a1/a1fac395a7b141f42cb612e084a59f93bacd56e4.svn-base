import { ListComponentBase } from "@app/ultilities/list-component-base";
import { Injector, Component, OnInit, ViewEncapsulation, AfterViewInit, AfterViewChecked } from "@angular/core";
import { TR_PROJECT_ENTITY, ProjectServiceProxy, ReportInfo, AsposeServiceProxy, } from "@shared/service-proxies/service-proxies";
import { IUiAction } from "@app/ultilities/ui-action";
import { appModuleAnimation } from "@shared/animations/routerTransition";
import { FileDownloadService } from "@shared/utils/file-download.service";
import { finalize } from "rxjs/operators";
import { ReportTypeConsts } from "@app/admin/core/ultils/consts/ReportTypeConsts";
import { AuthStatusConsts } from "@app/admin/core/ultils/consts/AuthStatusConsts";
import { RecordStatusConsts } from "@app/admin/core/ultils/consts/RecordStatusConsts";

@Component({
    templateUrl: './project-list.component.html',
    encapsulation: ViewEncapsulation.None,
    animations: [appModuleAnimation()]
})

export class ProjectListComponent extends ListComponentBase<TR_PROJECT_ENTITY> implements IUiAction<TR_PROJECT_ENTITY>, OnInit, AfterViewInit {
    ngAfterViewInit(): void {
        this.updateView();
    }

    initDefaultFilter() {
    }

    filterInput: TR_PROJECT_ENTITY = new TR_PROJECT_ENTITY();

    constructor(injector: Injector,
        private fileDownloadService: FileDownloadService,
        private projectService: ProjectServiceProxy,
        private asposeService: AsposeServiceProxy) {
        super(injector);
        this.initFilter();
        // COMMENT: this.stopAutoUpdateView();
        
    }


    ngOnInit(): void {
        // set ui action
        this.appToolbar.setUiAction(this);
        // set role toolbar
        this.appToolbar.setRole('TradeProject', true, true, false, true, true, true, false, true);
        this.appToolbar.setEnableForListPage();
    }

    exportToExcel() {
        // this.projectService.tR_PROJECT_ToExcel(this.filterInput).subscribe(response => {
        //     this.fileDownloadService.downloadTempFile(response);
        // })
        let reportInfo = new ReportInfo();
        reportInfo.typeExport = ReportTypeConsts.Excel;

        let filterReport = { ...this.filterInputSearch }
        filterReport.maxResultCount = -1;
        filterReport.totalCount = this.isNull(filterReport.totalCount) ? 0 : filterReport.totalCount;
        filterReport.skipCount = 0;
        reportInfo.parameters = this.GetParamsFromFilter(filterReport);

        reportInfo.values = this.GetParamsFromFilter({
            A1: this.l('CompanyReportHeader')
        });

        reportInfo.pathName = "/TRADE/rpt_trade_project.xlsx";
        reportInfo.storeName = "TR_PROJECT_Search";
        reportInfo.values = this.GetParamsFromFilter({
            A1: this.l('CompanyReportHeader')
        });
        this.asposeService.getReport(reportInfo).subscribe(x => {
            this.fileDownloadService.downloadTempFile(x);
        });
    }

    search(): void {
        this.showTableLoading();

        this.setSortingForFilterModel(this.filterInputSearch);

        this.projectService.tR_PROJECT_Search(this.filterInputSearch)
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
        this.navigatePassParam('/app/admin/trade-project-add', null, { filterInput: JSON.stringify(this.filterInputSearch) });
    }

    onUpdate(item: TR_PROJECT_ENTITY): void {
        this.navigatePassParam('/app/admin/trade-project-edit', { code: item.projecT_CODE }, { filterInput: JSON.stringify(this.filterInputSearch) });
    }

    onDelete(item: TR_PROJECT_ENTITY): void {
        if ((item.autH_STATUS == AuthStatusConsts.Approve && item.recorD_STATUS == RecordStatusConsts.InActive) || (item.autH_STATUS == AuthStatusConsts.NotApprove && item.checkeR_ID)) {
            this.showErrorMessage(this.l('CantDeleteApprovedItem'));
            return;
        } 
        this.message.confirm(
            this.l('DeleteWarningMessage', item.projecT_ID),
            this.l('AreYouSure'),
            (isConfirmed) => {
                if (isConfirmed) {
                    this.saving = true;
                    this.projectService.tR_PROJECT_Del(item.projecT_ID)
                        .pipe(finalize(() => { this.saving = false; }))
                        .subscribe((response) => {
                            if (response.result != '0') {
                                this.showErrorMessage(response.errorDesc);
                            }
                            else {
                                this.showSuccessMessage(this.l('SuccessfullyDeleted'));
                                this.filterInputSearch.totalCount = 0;
                                this.reloadPage();
                                // this.changePage(0);
                            }
                        });
                }
            }
        );
    }

    onApprove(item: TR_PROJECT_ENTITY): void {

    }

    onViewDetail(item: TR_PROJECT_ENTITY): void {
        this.navigatePassParam('/app/admin/trade-project-view', { code: item.projecT_CODE }, { filterInput: JSON.stringify(this.filterInputSearch) });
    }

    onSave(): void {

    }

    onResetSearch(): void {
        this.filterInput = new TR_PROJECT_ENTITY();
        this.filterInput.creatE_DT = undefined;
        this.changePage(0);
        this.updateView();

    }
}
