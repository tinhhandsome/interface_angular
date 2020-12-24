import { ListComponentBase } from "@app/ultilities/list-component-base";
import { Injector, Component, OnInit, ViewEncapsulation, AfterViewInit } from "@angular/core";
import { ASS_AMORT_PEND_ENTITY, AssAmortPendServiceProxy, ReportInfo, AsposeServiceProxy } from "@shared/service-proxies/service-proxies";
import { LazyLoadEvent } from "primeng/api";
import { IUiAction } from "@app/ultilities/ui-action";
import { appModuleAnimation } from "@shared/animations/routerTransition";
import { FileDownloadService } from "@shared/utils/file-download.service";
import { finalize } from "rxjs/operators";
import { AuthStatusConsts } from "@app/admin/core/ultils/consts/AuthStatusConsts";
import { ReportTypeConsts } from "@app/admin/core/ultils/consts/ReportTypeConsts";
import * as moment from 'moment';

@Component({
    templateUrl: './ass-amort-pend-list.component.html',
    encapsulation: ViewEncapsulation.None,
    animations: [appModuleAnimation()]
})

export class AssAmortPendListComponent extends ListComponentBase<ASS_AMORT_PEND_ENTITY> implements IUiAction<ASS_AMORT_PEND_ENTITY>, OnInit, AfterViewInit {

    ngAfterViewInit(): void {
        // COMMENT: this.stopAutoUpdateView();
        this.setupValidationMessage();
    }

    filterInput: ASS_AMORT_PEND_ENTITY = new ASS_AMORT_PEND_ENTITY();
    totalcount: number;

    constructor(injector: Injector,
        private fileDownloadService: FileDownloadService,
        private assAmortPendService: AssAmortPendServiceProxy,
        private asposeService: AsposeServiceProxy) {
        super(injector);
        this.initFilter();
    }

    ngOnInit(): void {
        // set ui action
        this.appToolbar.setUiAction(this);
        // set role toolbar
        this.appToolbar.setRole('AssetManagerASSAmortPendList', true, true, false, true, true, true, false, true);
        this.appToolbar.setEnableForListPage();
        this.filterInput.froM_DATE = moment().startOf('month');;
        this.filterInput.tO_DATE = moment();
    }

    search(): void {
        if(this.filterInput.froM_DATE > this.filterInput.tO_DATE) {
            this.showErrorMessage(this.l("FromDateMustSmallerThanToDate"));
            this.updateView();
            return;
        }
        else {
            this.removeMessage();
            this.updateView();
        }
        

        this.showTableLoading();

        if (!this.isGranted('Pages.Administration.AssetManagerASSAmortPendList.Search')) {
            this.filterInputSearch = new ASS_AMORT_PEND_ENTITY();
            this.filterInputSearch.totalCount = this.totalcount;
        }
        this.setSortingForFilterModel(this.filterInputSearch);
        this.initFilterInputSearch();
        this.appToolbar.setEnableForListPage();
        // this.filterInputSearch.recorD_STATUS = "1";
        this.assAmortPendService.aSS_AMORT_PEND_Search(this.filterInputSearch)
            .pipe(finalize(() => this.hideTableLoading()))
            .subscribe(result => {
                this.dataTable.records = result.items;
                this.dataTable.totalRecordsCount = result.totalCount;
                this.filterInputSearch.totalCount = result.totalCount;
                this.totalcount = result.totalCount;
                this.appToolbar.setEnableForListPage();
                this.updateView();
            });
        this.updateView();
    }

    onAdd(): void {
        this.navigatePassParam('/app/admin/ass-amort-pend-add', null, { filterInput: JSON.stringify(this.filterInputSearch) });
    }

    onUpdate(item: ASS_AMORT_PEND_ENTITY): void {
        this.navigatePassParam('/app/admin/ass-amort-pend-edit', { id: item.pA_ID }, { filterInput: JSON.stringify(this.filterInputSearch) });
    }

    onDelete(item: ASS_AMORT_PEND_ENTITY): void {
        this.message.confirm(
            this.l('DeleteWarningMessage', item.asseT_CODE),
            this.l('AreYouSure'),
            (isConfirmed) => {
                if (isConfirmed) {
                    if (item.autH_STATUS == AuthStatusConsts.Approve) {
                        this.showErrorMessage(this.l('YouCannotDeleteThisObject'));
                    }
                    else {
                        this.saving = true;
                        this.assAmortPendService.aSS_AMORT_PEND_Del(item.pA_ID)
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
                                this.updateView();
                            });
                    }
                }
            }
        );
    }

    onApprove(item: ASS_AMORT_PEND_ENTITY): void {

    }

    onViewDetail(item: ASS_AMORT_PEND_ENTITY): void {
        this.navigatePassParam('/app/admin/ass-amort-pend-view', { id: item.pA_ID }, { filterInput: JSON.stringify(this.filterInputSearch) });
    }

    onSave(): void {

    }

    initFilterInputSearch(): void {
        if (!this.filterInputSearch)
            return;
        this.filterInputSearch.brancH_CREATE = this.appSession.user.subbrId;
        this.filterInputSearch.level = 'UNIT';
        this.filterInputSearch.top = 300;
    }

    exportToExcel(): void {
        if(!this.filterInputSearch)
            return;
        let reportInfo = new ReportInfo();
        reportInfo.typeExport = ReportTypeConsts.Excel;
        this.initFilterInputSearch();
        this.filterInputSearch.froM_DATE = this.filterInputSearch.tO_DATE = null;
        let filterReport = { ...this.filterInputSearch }
        filterReport.maxResultCount = -1;
        filterReport.top = 0;

        reportInfo.parameters = this.GetParamsFromFilter(filterReport)

        reportInfo.values = this.GetParamsFromFilter({
            A1: this.l('CompanyReportHeader')
        });

        reportInfo.pathName = "/ASS_MASTER/rpt-ass-amort-pend-list.xlsx";
        reportInfo.storeName = "ASS_AMORT_PEND_Search";
        this.asposeService.getReport(reportInfo).subscribe(x => {
            this.fileDownloadService.downloadTempFile(x);
        });
    }

    onResetSearch(): void {
        this.filterInput = new ASS_AMORT_PEND_ENTITY();
        this.changePage(0);
    }
}
