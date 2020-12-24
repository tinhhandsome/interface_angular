import { ListComponentBase } from "@app/ultilities/list-component-base";
import { Injector, Component, OnInit, ViewEncapsulation, AfterViewInit, ViewChild } from "@angular/core";
import { PL_MASTER_ENTITY, CM_BRANCH_ENTITY, BranchServiceProxy, ConstDetailServiceProxy, PlMasterServiceProxy, ReportInfo, AsposeServiceProxy } from "@shared/service-proxies/service-proxies";
import { LazyLoadEvent } from "primeng/api";
import { IUiAction } from "@app/ultilities/ui-action";
import { appModuleAnimation } from "@shared/animations/routerTransition";
import { FileDownloadService } from "@shared/utils/file-download.service";
import { finalize } from "rxjs/operators";
import { PlanTypeConsts } from "../utils/consts/plan-type-consts";
import * as moment from 'moment';
import { RecordStatusConsts } from "@app/admin/core/ultils/consts/RecordStatusConsts";
import { ReportTypeConsts } from "@app/admin/core/ultils/consts/ReportTypeConsts";
import { CoreTableComponent } from "@app/admin/core/controls/core-table/core-table.component";

@Component({
    templateUrl: './const-detail-list.component.html',
    encapsulation: ViewEncapsulation.None,
    animations: [appModuleAnimation()]
})

export class ConstDetailListComponent extends ListComponentBase<PL_MASTER_ENTITY> implements IUiAction<PL_MASTER_ENTITY>, OnInit, AfterViewInit {

    filterInput: PL_MASTER_ENTITY = new PL_MASTER_ENTITY();
    branchs: CM_BRANCH_ENTITY[];

    @ViewChild('coreTable') coreTable: CoreTableComponent<PL_MASTER_ENTITY>;

    constructor(injector: Injector,
        private branchService: BranchServiceProxy,
        private tradeDetailService: ConstDetailServiceProxy,
        private asposeService: AsposeServiceProxy,
        private fileDownloadService: FileDownloadService,
        private plMasterService: PlMasterServiceProxy
    ) {
        super(injector);
        this.initFilter();
    }

    ngOnInit(): void {
        // set ui action
        this.appToolbar.setUiAction(this);
        // set role toolbar
        this.appToolbar.setRole('ConstDetail', true, true, false, true, true, true, false, true);
        this.appToolbar.setEnableForListPage();

        this.branchService.cM_BRANCH_Search(this.getFillterForCombobox()).subscribe(response => {
            this.branchs = response.items;
            this.updateView();
        })
    }

    initDefaultFilter() {
        this.filterInput.branchlogin = this.appSession.user.subbrId;
        this.filterInput.recorD_STATUS = RecordStatusConsts.Active;
        this.filterInput.plantype = PlanTypeConsts.ConstDetail;
        this.filterInput.functioN_ID = this.getCurrentFunctionId();
        this.filterInput.status = '';
        this.filterInput.top = 200;
    }

    ngAfterViewInit(): void {
        // COMMENT: this.stopAutoUpdateView();
    }

    exportToExcel() {
        let reportInfo = new ReportInfo();
        reportInfo.typeExport = ReportTypeConsts.Excel;
        this.initFilterInputSearch();

        let reportFilter = { ...this.filterInputSearch };

        reportFilter.maxResultCount = -1;

        reportInfo.parameters = this.GetParamsFromFilter(reportFilter)

        reportInfo.values = this.GetParamsFromFilter({
            A1: this.l('CompanyReportHeader')
        });

        reportInfo.pathName = "/PL_MASTER/rpt_const_detail.xlsx";
        reportInfo.storeName = "PL_MASTER_Search";

        this.asposeService.getReport(reportInfo).subscribe(x => {
            this.fileDownloadService.downloadTempFile(x);
        });
    }

    initFilterInputSearch(){
        if (!this.filterInputSearch.brancH_ID) {
            this.filterInputSearch.branchid = this.appSession.user.subbrId;
            this.filterInputSearch.all = 'Y';
        }
        else {
            this.filterInputSearch.branchid = this.filterInputSearch.brancH_ID;
            this.filterInputSearch.all = 'N';
        }
    }

    search(): void {
        this.showTableLoading();

        this.setSortingForFilterModel(this.filterInputSearch);

        this.initFilterInputSearch();

        this.plMasterService.pL_MASTER_Search(this.filterInputSearch)
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
        this.navigatePassParam('/app/admin/const-detail-add', null, { filterInput: JSON.stringify(this.filterInputSearch) });
    }

    onUpdate(item: PL_MASTER_ENTITY): void {
        this.navigatePassParam('/app/admin/const-detail-edit', { id: item.plaN_ID }, { filterInput: JSON.stringify(this.filterInputSearch) });
    }

    onDelete(item: PL_MASTER_ENTITY): void {
        this.message.confirm(
            this.l('DeleteWarningMessage', item.plaN_NAME),
            this.l('AreYouSure'),
            (isConfirmed) => {
                if (isConfirmed) {
                    this.saving = true;
                    this.tradeDetailService.pL_CONSTDETAIL_Del(item.plaN_ID)
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
                        });
                }
            }
        );
    }

    onApprove(item: PL_MASTER_ENTITY): void {

    }

    onViewDetail(item: PL_MASTER_ENTITY): void {
        this.navigatePassParam('/app/admin/const-detail-view', { id: item.plaN_ID }, undefined);
    }

    onSave(): void {

    }

    onResetSearch(): void {
        this.filterInput = new PL_MASTER_ENTITY();
        this.changePage(0);
    }

    onRouteBack() {
        super.onRouteBack();
        if(this['inputModelSaved']) {
            let record = this.coreTable.records.firstOrDefault(record => record.plaN_ID == this['inputModelSaved'][0].plaN_ID);
            if(!record)
                return;
            let index = this.coreTable.records.indexOf(record);
            record.statuS_NAME = this['inputModelSaved'][1];
            this.coreTable.records[index] = { ...record } as PL_MASTER_ENTITY;
            this.updateView();
            this.selectRowInIndex(index);
            this['inputModelSaved'] = undefined;
        }
        
        
    }
}
