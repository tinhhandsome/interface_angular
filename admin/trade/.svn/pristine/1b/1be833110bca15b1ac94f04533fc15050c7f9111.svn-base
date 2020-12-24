import { ListComponentBase } from "@app/ultilities/list-component-base";
import { Injector, Component, OnInit, ViewEncapsulation, ViewChild, AfterViewInit } from "@angular/core";
import { RatTermMasterServiceProxy, RAT_TERM_MASTER_ENTITY, CM_BRANCH_ENTITY, BranchServiceProxy, AsposeServiceProxy, ReportInfo } from "@shared/service-proxies/service-proxies";
import { LazyLoadEvent } from "primeng/api";
import { IUiAction } from "@app/ultilities/ui-action";
import { appModuleAnimation } from "@shared/animations/routerTransition";
import { FileDownloadService } from "@shared/utils/file-download.service";
import { finalize } from "rxjs/operators";
import { ReportTypeConsts } from "@app/admin/core/ultils/consts/ReportTypeConsts";
import * as moment from 'moment'
@Component({
    templateUrl: './rat-term-master-list.component.html',
    encapsulation: ViewEncapsulation.None,
    animations: [appModuleAnimation()]
})

export class RatTermMasterListComponent extends ListComponentBase<RAT_TERM_MASTER_ENTITY> implements IUiAction<RAT_TERM_MASTER_ENTITY>, OnInit, AfterViewInit {


    filterInput: RAT_TERM_MASTER_ENTITY = new RAT_TERM_MASTER_ENTITY();;
    branchName: string
    branches: CM_BRANCH_ENTITY[];

    constructor(injector: Injector,
        private fileDownloadService: FileDownloadService,
        private asposeService: AsposeServiceProxy,
        private branchService: BranchServiceProxy,
        private ratTermMasterService: RatTermMasterServiceProxy) {
        super(injector);

        // console.log(this)
        this.initFilter();
        this.initCombobox()
    }

    initDefaultFilter() {
        this.filterInput.top = 300
        this.filterInput.brancH_CREATE = this.appSession.user.subbrId
        this.filterInput.level = 'UNIT'
        this.filterInput.froM_DATE = moment().startOf('M')
        this.filterInput.tO_DATE = moment()
    }

    ngOnInit(): void {
        // set ui action
        this.appToolbar.setUiAction(this);
        // set role toolbar
        this.appToolbar.setRole('RatTermMaster', true, true, false, true, true, true, false, true);
        this.appToolbar.setEnableForListPage();

    }
    ngAfterViewInit(): void {
        // COMMENT: this.stopAutoUpdateView();
        this.setupValidationMessage()
    }
    initCombobox(): void {
        let filterCombobox = this.getFillterForCombobox();
        this.branchService.cM_BRANCH_Search(filterCombobox).subscribe(response => {
            this.branches = response.items;
        });
    }

    exportToExcel() {
        let reportInfo = new ReportInfo();
        reportInfo.typeExport = ReportTypeConsts.Excel;

        let filterReport = { ...this.filterInputSearch }
        filterReport.maxResultCount = -1;

        reportInfo.parameters = this.GetParamsFromFilter(filterReport)

        reportInfo.values = this.GetParamsFromFilter({
            A1: this.l('CompanyReportHeader')
        });

        reportInfo.pathName = "/RAT_TERM_MASTER/rpt-rat-term-master.xlsx";
        reportInfo.storeName = "RAT_TERM_MASTER_Search";

        this.asposeService.getReport(reportInfo).subscribe(x => {
            this.fileDownloadService.downloadTempFile(x);
        });
    }

    search(): void {

        this.showTableLoading();

        this.setSortingForFilterModel(this.filterInputSearch);

        this.ratTermMasterService.rAT_TERM_MASTER_Search(this.filterInputSearch)
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
        this.navigatePassParam('/app/admin/rat-term-master-add', null, { filterInput: JSON.stringify(this.filterInputSearch) });
    }

    onUpdate(item: RAT_TERM_MASTER_ENTITY): void {
        this.navigatePassParam('/app/admin/rat-term-master-edit', { id: item.raT_ID }, { filterInput: JSON.stringify(this.filterInputSearch) });
    }

    onDelete(item: RAT_TERM_MASTER_ENTITY): void {
        this.message.confirm(
            this.l('DeleteWarningMessage', item.raT_ID),
            this.l('AreYouSure'),
            (isConfirmed) => {
                if (isConfirmed) {
                    this.saving = true;
                    this.ratTermMasterService.rAT_TERM_MASTER_Del(item.raT_ID)
                        .pipe(finalize(() => { this.saving = false; }))
                        .subscribe((response) => {
                            if (response["Result"] != '0') {
                                this.showErrorMessage(response["ErrorDesc"]);
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

    onApprove(item: RAT_TERM_MASTER_ENTITY): void {

    }

    onViewDetail(item: RAT_TERM_MASTER_ENTITY): void {
        this.navigatePassParam('/app/admin/rat-term-master-view', { id: item.raT_ID }, { filterInput: JSON.stringify(this.filterInputSearch) });
    }

    onSave(): void {

    }

    onResetSearch(): void {
        this.filterInput = new RAT_TERM_MASTER_ENTITY();
        this.initDefaultFilter()
        this.changePage(0);
    }
}
