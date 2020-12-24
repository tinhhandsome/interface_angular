import { ListComponentBase } from "@app/ultilities/list-component-base";
import { Injector, Component, OnInit, ViewChild, ViewEncapsulation, OnDestroy, AfterViewInit } from "@angular/core";
import { AssRepairMultiMasterServiceProxy, ASS_REPAIR_MULTI_MASTER_ENTITY, ReportInfo, AsposeServiceProxy, } from "@shared/service-proxies/service-proxies";
import { LazyLoadEvent } from "primeng/api";
import { IUiAction } from "@app/ultilities/ui-action";
import { appModuleAnimation } from "@shared/animations/routerTransition";
import { FileDownloadService } from "@shared/utils/file-download.service";
import { finalize } from "rxjs/operators";
import { ReportTypeConsts } from "@app/admin/core/ultils/consts/ReportTypeConsts";
import { AuthStatusConsts } from "@app/admin/core/ultils/consts/AuthStatusConsts";

@Component({
    templateUrl: './ass-multi-repair-list.component.html',
    encapsulation: ViewEncapsulation.None,
    animations: [appModuleAnimation()]
})

export class AssRepairMultiListComponent extends ListComponentBase<ASS_REPAIR_MULTI_MASTER_ENTITY> implements AfterViewInit, IUiAction<ASS_REPAIR_MULTI_MASTER_ENTITY>, OnInit {
    ngAfterViewInit(): void {
        // COMMENT: this.stopAutoUpdateView();
    }
    filterInput: ASS_REPAIR_MULTI_MASTER_ENTITY = new ASS_REPAIR_MULTI_MASTER_ENTITY();

    constructor(injector: Injector,
        private fileDownloadService: FileDownloadService,
        private assMultiRepairService: AssRepairMultiMasterServiceProxy,
        private asposeService: AsposeServiceProxy) {
        super(injector);
        this.initFilter();
    }

    initDefaultFilter(){
        // this.filterInput.searcH_TYPE = 'A';
        // this.filterInput.level = "UNIT";
        // this.filterInput.brancH_CREATE = this.appSession.user.subbrId;
        this.filterInput.top = 300;
    }

    ngOnInit(): void {
        // set ui action
        this.appToolbar.setUiAction(this);
        // set role toolbar
        this.appToolbar.setRole('AssRepairMulti', true, true, false, true, true, true, false, true);
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

        reportInfo.pathName = "/ASS_MASTER/rpt_ass_repair_multi.xlsx";
        reportInfo.storeName = "ASS_REPAIR_MULTI_MASTER_Search";

        this.asposeService.getReport(reportInfo).subscribe(x => {
            this.fileDownloadService.downloadTempFile(x);
        });
    }

    search(event?: LazyLoadEvent): void {
        this.showTableLoading();

        this.setSortingForFilterModel(this.filterInputSearch);

        this.assMultiRepairService.aSS_REPAIR_MULTI_MASTER_Search(this.filterInputSearch)
            .pipe(finalize(() => this.hideTableLoading()))
            .subscribe(result => {
                this.dataTable.records = result.items;
                this.dataTable.totalRecordsCount = result.totalCount;
                this.appToolbar.setEnableForListPage();
                this.updateView();
            });
    }



    onAdd(): void {
        this.navigatePassParam('/app/admin/ass-repair-multi-add', null, { filterInput: JSON.stringify(this.filterInputSearch) });
    }

    onUpdate(item: ASS_REPAIR_MULTI_MASTER_ENTITY): void {
        this.navigatePassParam('/app/admin/ass-repair-multi-edit', { id: item.repaiR_MUL_ID }, { filterInput: JSON.stringify(this.filterInputSearch) });
    }

    onDelete(item: ASS_REPAIR_MULTI_MASTER_ENTITY): void {
        if (item.autH_STATUS == AuthStatusConsts.Approve) {
            this.showErrorMessage(this.l('CantDeleteApprovedItem'));
            return;
        }
        this.message.confirm(
            this.l('DeleteWarningMessage', item.useR_REPAIR_ID),
            this.l('AreYouSure'),
            (isConfirmed) => {
                if (isConfirmed) {
                    this.saving = true;
                    this.assMultiRepairService.aSS_REPAIR_MULTI_MASTER_Del(item.repaiR_MUL_ID)
                        .pipe(finalize(() => { this.saving = false; }))
                        .subscribe((response) => {
                            if (response['Result'] != '0') {
                                this.showErrorMessage(response.errorDesc);
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

    onApprove(item: ASS_REPAIR_MULTI_MASTER_ENTITY): void {

    }

    onViewDetail(item: ASS_REPAIR_MULTI_MASTER_ENTITY): void {
        this.navigatePassParam('/app/admin/ass-repair-multi-view', { id: item.repaiR_MUL_ID }, { filterInput: JSON.stringify(this.filterInputSearch) });
    }

    onSave(): void {

    }

    onResetSearch(): void {
        this.filterInput = new ASS_REPAIR_MULTI_MASTER_ENTITY();
        this.initDefaultFilter();
        this.changePage(0);
    }
}
