import { ListComponentBase } from "@app/ultilities/list-component-base";
import { Injector, Component, OnInit, ViewEncapsulation } from "@angular/core";
import { PL_MASTER_ENTITY, CM_BRANCH_ENTITY, BranchServiceProxy, TradeDetailServiceProxy, PlMasterServiceProxy, TRADE_DETAIL_ENTITY, ReportInfo, AsposeServiceProxy, } from "@shared/service-proxies/service-proxies";
import { LazyLoadEvent } from "primeng/api";
import { IUiAction } from "@app/ultilities/ui-action";
import { appModuleAnimation } from "@shared/animations/routerTransition";
import { finalize } from "rxjs/operators";
import { PlanTypeConsts } from "../utils/consts/plan-type-consts";
import * as moment from 'moment';
import { RecordStatusConsts } from "@app/admin/core/ultils/consts/RecordStatusConsts";
import { ReportTypeConsts } from "@app/admin/core/ultils/consts/ReportTypeConsts";
import { FileDownloadService } from "@shared/utils/file-download.service";

@Component({
    templateUrl: './trade-detail-list.component.html',
    encapsulation: ViewEncapsulation.None,
    animations: [appModuleAnimation()]
})

export class TradeDetailListComponent extends ListComponentBase<PL_MASTER_ENTITY> implements IUiAction<PL_MASTER_ENTITY>, OnInit {
    filterInput: PL_MASTER_ENTITY = new PL_MASTER_ENTITY();
    branchs: CM_BRANCH_ENTITY[];

    constructor(injector: Injector,
        private branchService: BranchServiceProxy,
        private tradeDetailService: TradeDetailServiceProxy,
        private asposeService: AsposeServiceProxy,
        private fileDownloadService: FileDownloadService,
        private plMasterService: PlMasterServiceProxy) {
        super(injector);
        this.filterInput.year = moment().year().toString();
        this.filterInput.level = 'UNIT';
        this.initFilter();
        this.pagingClient = true;
    }

    initFilter() {
        this.getFilterInputInRoute((filterJson) => {
            if (filterJson) {
                this.filterInput = JSON.parse(filterJson);
            }
        });
        this.initDefaultFilter();
    }

    initDefaultFilter() {
        this.filterInput.year = moment().format('YYYY');
        this.filterInput.branchlogin = this.appSession.user.subbrId;
        this.filterInput.recorD_STATUS = RecordStatusConsts.Active;
        this.filterInput.plantype = PlanTypeConsts.TradeDetail;
        this.filterInput.status = '';
        this.filterInput.useR_LOGIN = this.appSession.user.userName;
        this.filterInput.all = 'Y';
    }

    ngOnInit(): void {
        // set ui action
        this.appToolbar.setUiAction(this);
        // set role toolbar
        this.appToolbar.setRole('TradeDetail', true, true, false, true, true, true, false, true);
        this.appToolbar.setEnableForListPage();

        this.branchService.cM_BRANCH_Search(this.getFillterForCombobox()).subscribe(response => {
            this.branchs = response.items;
            this.updateView();
        })
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

        reportInfo.pathName = "/PL_MASTER/rpt_trade_detail.xlsx";
        reportInfo.storeName = "PL_MASTER_Search";

        this.asposeService.getReport(reportInfo).subscribe(x => {
            this.fileDownloadService.downloadTempFile(x);
        });
    }

    initFilterInputSearch() {
        if (!this.filterInputSearch.brancH_ID) {
            this.filterInputSearch.branchid = this.appSession.user.subbrId;
        }
        else {
            this.filterInputSearch.branchid = this.filterInputSearch.brancH_ID;
        }

    }

    search(): void {

        this.showTableLoading();

        this.setSortingForFilterModel(this.filterInputSearch);
        this.initFilterInputSearch();

        this.plMasterService.pL_MASTER_Search(this.filterInputSearch)
            .pipe(finalize(() => this.hideTableLoading()))
            .subscribe(result => {
                this.setRecords(result);
                this.appToolbar.setEnableForListPage();
                this.updateView();
            });
    }

    onAdd(): void {
        this.navigatePassParam('/app/admin/trade-detail-add', null, { filterInput: JSON.stringify(this.filterInputSearch) });
    }

    onUpdate(item: PL_MASTER_ENTITY): void {
        this.navigatePassParam('/app/admin/trade-detail-edit', { id: item.plaN_ID }, { filterInput: JSON.stringify(this.filterInputSearch) });
    }

    onDelete(item: PL_MASTER_ENTITY): void {
        this.message.confirm(
            this.l('DeleteWarningMessage', item.plaN_NAME),
            this.l('AreYouSure'),
            (isConfirmed) => {
                if (isConfirmed) {
                    this.saving = true;
                    this.tradeDetailService.pL_TRADE_DETAIL_Del(item.plaN_ID)
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

    onApprove(item: PL_MASTER_ENTITY): void {

    }

    onViewDetail(item: PL_MASTER_ENTITY): void {
        this.navigatePassParam('/app/admin/trade-detail-view', { id: item.plaN_ID }, { filterInput: JSON.stringify(this.filterInputSearch) });
    }

    onSave(): void {

    }



    onResetSearch(): void {
        this.filterInput = new PL_MASTER_ENTITY();
        this.initDefaultFilter();
        this.changePage(0);
    }
}
