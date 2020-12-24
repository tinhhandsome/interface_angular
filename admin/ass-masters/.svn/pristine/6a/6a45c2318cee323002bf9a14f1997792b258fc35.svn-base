import { ListComponentBase } from "@app/ultilities/list-component-base";
import { Injector, Component, OnInit, ViewEncapsulation, ViewChild, AfterViewInit } from "@angular/core";
import { AssUseMultiMasterServiceProxy, ASS_USE_MULTI_MASTER_ENTITY, CM_BRANCH_ENTITY, BranchServiceProxy, AsposeServiceProxy, ReportInfo } from "@shared/service-proxies/service-proxies";
import { LazyLoadEvent } from "primeng/api";
import { IUiAction } from "@app/ultilities/ui-action";
import { appModuleAnimation } from "@shared/animations/routerTransition";
import { FileDownloadService } from "@shared/utils/file-download.service";
import { finalize } from "rxjs/operators";
import { ReportTypeConsts } from "@app/admin/core/ultils/consts/ReportTypeConsts";

@Component({
    templateUrl: './ass-use-multi-kt-list.component.html',
    encapsulation: ViewEncapsulation.None,
    animations: [appModuleAnimation()]
})

export class AssUseMultiKtListComponent extends ListComponentBase<ASS_USE_MULTI_MASTER_ENTITY> implements IUiAction<ASS_USE_MULTI_MASTER_ENTITY>, OnInit, AfterViewInit {


    filterInput: ASS_USE_MULTI_MASTER_ENTITY = new ASS_USE_MULTI_MASTER_ENTITY();;
    branchName: string


    constructor(injector: Injector,
        private fileDownloadService: FileDownloadService,
        private asposeService: AsposeServiceProxy,
        private assUseMultiMasterService: AssUseMultiMasterServiceProxy) {
        super(injector);

        this.filterInput['brancH_ID'] = this.appSession.user.subbrId
        this.filterInput.autH_STATUS = "A"

        this.initFilter();
        this.initCombobox()
    }

    initDefaultFilter() {
        this.filterInput.top = 300
        this.branchName = this.appSession.user.branchName;
        const { subbrId, branchName } = this.appSession.user
        this.branchName = branchName;
        this.filterInput.level = 'UNIT'
        this.filterInput.typE_ID = 'CCLD'
        this.filterInput.brancH_ID = subbrId;
    }
    ngOnInit(): void {
        // set ui action
        this.appToolbar.setUiAction(this);
        // set role toolbar
        this.appToolbar.setRole('AssUseMultiKt', false, true, false, false, true, true, false, true);
        this.appToolbar.setEnableForListPage();
    }
    ngAfterViewInit(): void {
        // COMMENT: this.stopAutoUpdateView();
    }
    initCombobox(): void {

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

        reportInfo.pathName = "/ASS_MASTER/rpt-ass-use-multi-kt.xlsx";
        reportInfo.storeName = "ASS_USE_MULTI_MASTER_Search";

        this.asposeService.getReport(reportInfo).subscribe(x => {
            this.fileDownloadService.downloadTempFile(x);
        });
    }


    search(): void {
        this.showTableLoading();

        this.setSortingForFilterModel(this.filterInputSearch);


        this.assUseMultiMasterService.aSS_USE_MULTI_MASTER_Search(this.filterInputSearch)
            .pipe(finalize(() => this.hideTableLoading()))
            .subscribe(result => {
                this.dataTable.records = result.items;
                this.dataTable.totalRecordsCount = result.totalCount;
                this.filterInputSearch.totalCount = result.totalCount;
                this.appToolbar.setEnableForListPage()
                this.updateView()
            });
    }

    onAdd(): void {

    }

    onUpdate(item: ASS_USE_MULTI_MASTER_ENTITY): void {
        this.navigatePassParam('/app/admin/ass-use-multi-kt-edit', { id: item.useR_MASTER_ID }, { filterInput: JSON.stringify(this.filterInputSearch) });
    }

    onDelete(item: ASS_USE_MULTI_MASTER_ENTITY): void {
        this.message.confirm(
            this.l('DeleteWarningMessage', item.useR_MASTER_ID),
            this.l('AreYouSure'),
            (isConfirmed) => {
                if (isConfirmed) {
                    this.saving = true;
                    this.assUseMultiMasterService.aSS_USE_MULTI_MASTER_Del(item.useR_MASTER_ID)
                        .pipe(finalize(() => { this.saving = false; }))
                        .subscribe((response) => {
                            if (response["Result"] != '0') {
                                this.showErrorMessage(response['ErrorDesc']);
                            }
                            else {
                                this.showSuccessMessage(this.l('SuccessfullyDeleted'));
                                this.filterInputSearch.totalCount = 0
                                this.reloadPage();
                            }
                        });
                }
            }
        );
    }

    onApprove(item: ASS_USE_MULTI_MASTER_ENTITY): void {

    }

    onViewDetail(item: ASS_USE_MULTI_MASTER_ENTITY): void {
        this.navigatePassParam('/app/admin/ass-use-multi-kt-view', { id: item.useR_MASTER_ID }, { filterInput: JSON.stringify(this.filterInputSearch) });
    }

    onSave(): void {

    }

    onResetSearch(): void {
        this.filterInput = new ASS_USE_MULTI_MASTER_ENTITY();
        this.initDefaultFilter()
        this.changePage(0);
    }
}

