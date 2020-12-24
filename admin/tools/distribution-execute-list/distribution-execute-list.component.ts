import { ListComponentBase } from "@app/ultilities/list-component-base";
import { Injector, Component, OnInit, ViewEncapsulation, AfterViewInit, ViewChild } from "@angular/core";
import { DISTRIBUTION_EXECUTE_LIST_ENTITY, DistributionExecuteListServiceProxy, CM_BRANCH_ENTITY, ReportInfo, AsposeServiceProxy } from "@shared/service-proxies/service-proxies";
import { IUiAction } from "@app/ultilities/ui-action";
import { appModuleAnimation } from "@shared/animations/routerTransition";
import { FileDownloadService } from "@shared/utils/file-download.service";
import { finalize } from "rxjs/operators";
import { AuthStatusConsts } from "@app/admin/core/ultils/consts/AuthStatusConsts";
import { BranchModalComponent } from "@app/admin/core/controls/branch-modal/branch-modal.component";
import { ReportTypeConsts } from "@app/admin/core/ultils/consts/ReportTypeConsts";

@Component({
    templateUrl: './distribution-execute-list.component.html',
    encapsulation: ViewEncapsulation.None,
    animations: [appModuleAnimation()]
})

export class DistributionExecuteListComponent extends ListComponentBase<DISTRIBUTION_EXECUTE_LIST_ENTITY> implements IUiAction<DISTRIBUTION_EXECUTE_LIST_ENTITY>, AfterViewInit, OnInit {
    @ViewChild('branchModal') branchModal: BranchModalComponent;
    filterInput: DISTRIBUTION_EXECUTE_LIST_ENTITY = new DISTRIBUTION_EXECUTE_LIST_ENTITY();
    totalcount: number;
    isShowError = false;

    constructor(
        injector: Injector,
        private distributionExecuteListService: DistributionExecuteListServiceProxy,
        private asposeService: AsposeServiceProxy,
        private fileDownloadService: FileDownloadService
    ) {
        super(injector);
        this.initFilter();
    }

    ngOnInit(): void {
        // set ui action
        this.appToolbar.setUiAction(this);
        // set role toolbar
        this.appToolbar.setRole('ToolDistributionExecuteList', true, true, false, true, true, true, false, true);
        this.appToolbar.setEnableForListPage();
    }

    ngAfterViewInit(): void {
        // COMMENT: this.stopAutoUpdateView();
    }

    initFilterInputSearch(): void {
        this.filterInput.level = "UNIT";
    }

    search(): void {
        this.showTableLoading();

        // if (!this.isGranted('Pages.Administration.AssCommonAssGroupList.Search')) {
        //     this.filterInputSearch = new ASS_AMORT_PEND_ENTITY();
        //     this.filterInputSearch.totalCount=this.totalcount;
        // }
        this.setSortingForFilterModel(this.filterInputSearch);
        this.appToolbar.setEnableForListPage();
        this.initFilterInputSearch();
        this.distributionExecuteListService.dISTRIBUTION_EXECUTE_LIST_Search(this.filterInputSearch)
            .pipe(finalize(() => this.hideTableLoading()))
            .subscribe(result => {
                this.dataTable.records = result.items;
                this.dataTable.totalRecordsCount = result.totalCount;
                this.filterInputSearch.totalCount = result.totalCount;
                this.totalcount = result.totalCount;
                this.appToolbar.setEnableForListPage();
                this.updateView();
            });
    }

    onAdd(): void {
        this.navigatePassParam('/app/admin/distribution-execute-list-add', null, { filterInput: JSON.stringify(this.filterInputSearch) });
    }

    onUpdate(item: DISTRIBUTION_EXECUTE_LIST_ENTITY): void {
        this.navigatePassParam('/app/admin/distribution-execute-list-edit', { id: item.exeC_DISTR_ID }, { filterInput: JSON.stringify(this.filterInputSearch) });
    }

    onDelete(item: DISTRIBUTION_EXECUTE_LIST_ENTITY): void {
        this.message.confirm(
            this.l('DeleteWarningMessage', item.exeC_DISTR_CODE),
            this.l('AreYouSure'),
            (isConfirmed) => {
                if (isConfirmed) {
                    if (item.autH_STATUS == AuthStatusConsts.Approve) {
                        this.showErrorMessage(this.l('YouCannotDeleteThisObject'));
                    }
                    else {
                        this.saving = true;
                        this.distributionExecuteListService.dISTRIBUTION_EXECUTE_LIST_Del(item.exeC_DISTR_ID)
                            .pipe(finalize(() => { this.saving = false; }))
                            .subscribe((response) => {
                                if (response['result'] != '0') {
                                    this.showErrorMessage(response['errorDesc']);
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
                this.updateView();
            }
        );
    }

    onApprove(item: DISTRIBUTION_EXECUTE_LIST_ENTITY): void {

    }

    onViewDetail(item: DISTRIBUTION_EXECUTE_LIST_ENTITY): void {
        this.navigatePassParam('/app/admin/distribution-execute-list-view', { id: item.exeC_DISTR_ID }, { filterInput: JSON.stringify(this.filterInputSearch) });
    }

    onSave(): void {

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

        reportInfo.pathName = "/TOOL/rpt_distribution_execute_list.xlsx";
        reportInfo.storeName = "T_DISTRIBUTION_EXEC_Search";
        this.asposeService.getReport(reportInfo).subscribe(x => {
            this.fileDownloadService.downloadTempFile(x);
        });
    }

    onResetSearch(): void {
        // this.filterInput = new ASS_AMORT_PEND_ENTITY();
        // this.changePage(0);
    }

    showBranchModal() {
        this.branchModal.filterInput.brancH_LOGIN = this.appSession.user.subbrId;
        this.branchModal.show();
    }


    onSingleSelectBranch(branch: CM_BRANCH_ENTITY) {
        this.filterInput.brancH_NAME = branch.brancH_NAME;
        this.filterInput.brancH_ID = branch.brancH_ID;
    }
}
