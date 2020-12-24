import { ListComponentBase } from "@app/ultilities/list-component-base";
import { Injector, Component, OnInit, ViewChild, ViewEncapsulation, OnDestroy, AfterViewInit } from "@angular/core";
import { AssLiqRequestServiceProxy, ASS_LIQ_REQUEST_ENTITY, ASS_TYPE_ENTITY, AssTypeServiceProxy, ReportInfo, AsposeServiceProxy, TermServiceProxy, CM_TERM_ENTITY, } from "@shared/service-proxies/service-proxies";
import { LazyLoadEvent } from "primeng/api";
import { IUiAction } from "@app/ultilities/ui-action";
import { appModuleAnimation } from "@shared/animations/routerTransition";
import { FileDownloadService } from "@shared/utils/file-download.service";
import { finalize } from "rxjs/operators";
import { ReportTypeConsts } from "@app/admin/core/ultils/consts/ReportTypeConsts";
import { AuthStatusConsts } from "@app/admin/core/ultils/consts/AuthStatusConsts";

@Component({
    templateUrl: './ass-liq-request-list.component.html',
    encapsulation: ViewEncapsulation.None,
    animations: [appModuleAnimation()]
})

export class AssLiqRequestListComponent extends ListComponentBase<ASS_LIQ_REQUEST_ENTITY> implements IUiAction<ASS_LIQ_REQUEST_ENTITY>, OnInit, AfterViewInit {

    filterInput: ASS_LIQ_REQUEST_ENTITY = new ASS_LIQ_REQUEST_ENTITY();
    assTypes: ASS_TYPE_ENTITY[];
    terms: CM_TERM_ENTITY[];

    constructor(injector: Injector,
        private termService: TermServiceProxy,
        private asposeService: AsposeServiceProxy,
        private fileDownloadService: FileDownloadService,
        private assTypeService: AssTypeServiceProxy,
        private assLiqRequestService: AssLiqRequestServiceProxy) {
        super(injector);
        this.initFilter();
        this.initCombobox();
    }

    initDefaultFilter() {
        this.filterInput.top = 300
        this.filterInput.level = 'UNIT'
        this.filterInput.brancH_CREATE = this.appSession.user.subbrId
    }

    initCombobox() {
        let filterCombobox = this.getFillterForCombobox();
        this.assTypeService.aSS_TYPE_Lis().subscribe(response => {
            this.assTypes = response;
        })

        filterCombobox["brancH_LOGIN"] = this.appSession.user.subbrId
        this.termService.cM_TERM_Search(filterCombobox).subscribe(response => {
            this.terms = response.items;
        })

    }

    ngOnInit(): void {
        // set ui action
        this.appToolbar.setUiAction(this);
        // set role toolbar
        this.appToolbar.setRole('AssLiqRequest', true, true, false, true, true, true, false, true);
        this.appToolbar.setEnableForListPage();
    }

    ngAfterViewInit(): void {
        // COMMENT: this.stopAutoUpdateView();
    }

    exportToExcel() {
        let reportInfo = new ReportInfo();
        reportInfo.typeExport = ReportTypeConsts.Excel;

        let filterReport = { ...this.filterInput }
        filterReport.maxResultCount = -1;

        reportInfo.parameters = this.GetParamsFromFilter(filterReport)

        reportInfo.values = this.GetParamsFromFilter({
            A1: this.l('CompanyReportHeader')
        });

        reportInfo.pathName = "/ASS_MASTER/rpt-ass-liq-request.xlsx";
        reportInfo.storeName = "ASS_LIQ_REQUEST_Search";

        this.asposeService.getReport(reportInfo).subscribe(x => {
            this.fileDownloadService.downloadTempFile(x);
        });
    }

    search(): void {
        this.showTableLoading();

        this.setSortingForFilterModel(this.filterInputSearch);

        this.assLiqRequestService.aSS_LIQ_REQUEST_Search(this.filterInputSearch)
            .pipe(finalize(() => this.hideTableLoading()))
            .subscribe(result => {
                this.dataTable.records = result.items;
                this.dataTable.totalRecordsCount = result.totalCount;
                this.filterInputSearch.totalCount = result.totalCount;
                this.appToolbar.setEnableForListPage();
                this.updateView()
            });
    }

    onAdd(): void {
        this.navigatePassParam('/app/admin/ass-liq-request-add', null, { filterInput: JSON.stringify(this.filterInputSearch) });
    }

    onUpdate(item: ASS_LIQ_REQUEST_ENTITY): void {
        this.navigatePassParam('/app/admin/ass-liq-request-edit', { id: item.liQ_REQ_ID }, { filterInput: JSON.stringify(this.filterInputSearch) });
    }

    onDelete(item: ASS_LIQ_REQUEST_ENTITY): void {
        this.message.confirm(
            this.l('DeleteWarningMessage', item.liQ_REQ_ID),
            this.l('AreYouSure'),
            (isConfirmed) => {
                if (isConfirmed) {
                    this.saving = true;
                    this.assLiqRequestService.aSS_LIQ_REQUEST_Del(item.liQ_REQ_ID)
                        .pipe(finalize(() => { this.saving = false; }))
                        .subscribe((response) => {
                            if (response["Result"] != '0') {
                                this.showErrorMessage(response["ErrorDesc"]);
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

    onApprove(item: ASS_LIQ_REQUEST_ENTITY): void {

    }

    onViewDetail(item: ASS_LIQ_REQUEST_ENTITY): void {
        this.navigatePassParam('/app/admin/ass-liq-request-view', { id: item.liQ_REQ_ID }, { filterInput: JSON.stringify(this.filterInputSearch) });
    }

    onSave(): void {

    }



    onResetSearch(): void {
        this.filterInput = new ASS_LIQ_REQUEST_ENTITY();
        this.initDefaultFilter()
        this.changePage(0);
    }
}
