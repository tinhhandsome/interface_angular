import { ListComponentBase } from "@app/ultilities/list-component-base";
import { Injector, Component, OnInit, ViewChild, ViewEncapsulation, OnDestroy, AfterViewInit } from "@angular/core";
import { AssMasterServiceProxy, ASS_MASTER_ENTITY, BranchServiceProxy, AssGroupServiceProxy, CM_BRANCH_ENTITY, ASS_GROUP_ENTITY, ReportInfo, AsposeServiceProxy, } from "@shared/service-proxies/service-proxies";
import { LazyLoadEvent } from "primeng/api";
import { IUiAction } from "@app/ultilities/ui-action";
import { appModuleAnimation } from "@shared/animations/routerTransition";
import { finalize } from "rxjs/operators";
import { ReportTypeConsts } from "@app/admin/core/ultils/consts/ReportTypeConsts";
import { FileDownloadService } from "@shared/utils/file-download.service";

@Component({
    templateUrl: './ass-master-list.component.html',
    encapsulation: ViewEncapsulation.None,
    animations: [appModuleAnimation()]
})

export class AssMasterListComponent extends ListComponentBase<ASS_MASTER_ENTITY> implements IUiAction<ASS_MASTER_ENTITY>, OnInit, AfterViewInit {

    filterInput: ASS_MASTER_ENTITY = new ASS_MASTER_ENTITY();
    filterInputSearch: ASS_MASTER_ENTITY = undefined;
    branchs: CM_BRANCH_ENTITY[];
    assGroups: ASS_GROUP_ENTITY[];

    constructor(injector: Injector,
        private asposeService: AsposeServiceProxy,
        private fileDownloadService: FileDownloadService,
        private assMasterService: AssMasterServiceProxy,
        private branchService: BranchServiceProxy,
        private assGroupService: AssGroupServiceProxy) {
        super(injector);
        this.initCombobox();
        this.initFilter();
        this.pagingClient = true;
    }

    initCombobox() {

        var filterCombobox = this.getFillterForCombobox();
        this.branchService.cM_BRANCH_Search(filterCombobox).subscribe(response => {
            this.branchs = response.items;
            this.updateView();
        });

        this.assGroupService.aSS_GROUP_Search(filterCombobox).subscribe(response => {
            this.assGroups = response.items;
            this.updateView();
        });
    }

    ngAfterViewInit(): void {
        // COMMENT: this.stopAutoUpdateView();
    }

    initDefaultFilter() {
        this.filterInput.brancH_LOGIN = this.appSession.user.subbrId;
        this.filterInput.level = 'ALL';
        this.filterInput.top = 300;
    }

    ngOnInit(): void {
        // set ui action
        this.appToolbar.setUiAction(this);
        // set role toolbar
        this.appToolbar.setRole('AssMaster', false, false, false, false, true, true, false, true);
        this.appToolbar.setEnableForListPage();
    }

    search(): void {
        this.showTableLoading();

        if (!this.filterInputSearch.brancH_ID) {
            this.filterInputSearch.brancH_ID = this.appSession.user.subbrId;
        }

        this.setSortingForFilterModel(this.filterInputSearch);
        this.assMasterService.aSS_MASTER_Search(this.filterInputSearch)
            .pipe(finalize(() => this.hideTableLoading()))
            .subscribe(result => {
                this.setRecords(result);
                this.appToolbar.setEnableForListPage();
                this.updateView();
            });
    }

    exportToExcel() {
        let reportInfo = new ReportInfo();
        reportInfo.typeExport = ReportTypeConsts.Excel;

        let reportFilter = { ...this.filterInputSearch };

        reportFilter.maxResultCount = -1;

        if (!reportFilter.brancH_ID) {
            reportFilter.brancH_ID = this.appSession.user.subbrId;
        }

        reportInfo.parameters = this.GetParamsFromFilter(reportFilter)

        reportInfo.values = this.GetParamsFromFilter({
            A1: this.l('CompanyReportHeader')
        });

        reportInfo.pathName = "/ASS_MASTER/rpt_ass_master.xlsx";
        reportInfo.storeName = "ASS_MASTER_SEARCH";

        this.asposeService.getReport(reportInfo).subscribe(x => {
            this.fileDownloadService.downloadTempFile(x);
        });
    }

    onAdd(): void {
        this.navigatePassParam('/app/admin/ass-master-add', null, { filterInput: JSON.stringify(this.filterInputSearch) });
    }



    onDelete(item: ASS_MASTER_ENTITY): void {
        this.message.confirm(
            this.l('DeleteWarningMessage', item.asseT_NAME),
            this.l('AreYouSure'),
            (isConfirmed) => {
                if (isConfirmed) {
                    this.saving = true;
                    this.assMasterService.aSS_MASTER_Del(item.asseT_ID)
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

    onChangeAssType() {
        var filterCombobox = this.getFillterForCombobox();

        filterCombobox['TYPE_ID'] = this.filterInput.typE_ID;
        this.filterInput.grouP_ID = undefined;

        this.assGroupService.aSS_GROUP_Search(filterCombobox).subscribe(response => {
            this.assGroups = response.items;
        });
    }

    onApprove(item: ASS_MASTER_ENTITY): void {

    }

    onUpdate(item: ASS_MASTER_ENTITY): void {
        this.navigatePassParam('/app/admin/ass-master-edit', { id: item.asseT_ID }, { filterInput: JSON.stringify(this.filterInputSearch) });
    }

    onViewDetail(item: ASS_MASTER_ENTITY): void {
        this.navigatePassParam('/app/admin/ass-master-view', { id: item.asseT_ID }, { filterInput: JSON.stringify(this.filterInputSearch) });
    }

    onSave(): void {

    }

    onResetSearch(): void {
        this.filterInput = new ASS_MASTER_ENTITY();
        this.initDefaultFilter();
        this.changePage(0);
    }
}
