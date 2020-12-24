import { ListComponentBase } from "@app/ultilities/list-component-base";
import { Injector, Component, OnInit, ViewEncapsulation, ViewChild, AfterViewInit } from "@angular/core";
import { AssLiquidationServiceProxy, ASS_LIQUIDATION_ENTITY, CM_BRANCH_ENTITY, BranchServiceProxy, AsposeServiceProxy, ReportInfo } from "@shared/service-proxies/service-proxies";
import { LazyLoadEvent } from "primeng/api";
import { IUiAction } from "@app/ultilities/ui-action";
import { appModuleAnimation } from "@shared/animations/routerTransition";
import { FileDownloadService } from "@shared/utils/file-download.service";
import { finalize } from "rxjs/operators";
import { ReportTypeConsts } from "@app/admin/core/ultils/consts/ReportTypeConsts";
import * as moment from 'moment'

@Component({
    templateUrl: './ass-liquidation-list.component.html',
    encapsulation: ViewEncapsulation.None,
    animations: [appModuleAnimation()]
})

export class AssLiquidationListComponent extends ListComponentBase<ASS_LIQUIDATION_ENTITY> implements IUiAction<ASS_LIQUIDATION_ENTITY>, OnInit, AfterViewInit {


    filterInput: ASS_LIQUIDATION_ENTITY = new ASS_LIQUIDATION_ENTITY();;
    branchName: string


    constructor(injector: Injector,
        private fileDownloadService: FileDownloadService,
        private asposeService: AsposeServiceProxy,
        private assLiquidationService: AssLiquidationServiceProxy) {
        super(injector);



        console.log(this)
        this.initFilter();
        this.initCombobox()
    }
    setFilterInputSearch(){
        if(!this.filterInput.brancH_ID){
            this.filterInput.brancH_ID = this.appSession.user.subbrId
        }
    }

    initDefaultFilter() {
        this.filterInput.top = 300
        this.filterInput.level = 'UNIT'
        this.filterInput.brancH_ID = this.appSession.user.subbrId
        this.filterInput.fR_BUY_DATE = moment().startOf('M')
        this.filterInput.tO_BUY_DATE = moment()
        this.filterInput.fR_LIQ_AMT = 0
        this.filterInput.tO_LIQ_AMT = 0
    }

    ngOnInit(): void {
        // set ui action
        this.appToolbar.setUiAction(this);
        // set role toolbar
        this.appToolbar.setRole('AssLiquidation', true, true, false, true, true, true, false, true);
        this.appToolbar.setEnableForListPage();
        this.branchName = this.appSession.user.branchName;

    }
    ngAfterViewInit(): void {        
        // COMMENT: this.stopAutoUpdateView();
    }
    initCombobox(): void {

    }

    exportToExcel() {
        let reportInfo = new ReportInfo();
        reportInfo.typeExport = ReportTypeConsts.Excel;

        this.setFilterInputSearch()
        let filterReport = { ...this.filterInput }
        filterReport.maxResultCount = -1;

        reportInfo.parameters = this.GetParamsFromFilter(filterReport)

        reportInfo.values = this.GetParamsFromFilter({
            A1: this.l('CompanyReportHeader')
        });

        reportInfo.pathName = "/ASS_MASTER/rpt-ass-liquidation.xlsx";
        reportInfo.storeName = "ASS_LIQUIDATION_Search";

        this.asposeService.getReport(reportInfo).subscribe(x => {
            this.fileDownloadService.downloadTempFile(x);
        });
    }

    search(): void {

        this.showTableLoading();

        if (!this.filterInputSearch.brancH_ID) {
            this.filterInputSearch.brancH_ID = this.appSession.user.subbrId;
        }

        this.setSortingForFilterModel(this.filterInputSearch);
        this.setFilterInputSearch()

        this.assLiquidationService.aSS_LIQUIDATION_Search(this.filterInputSearch)
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
        this.navigatePassParam('/app/admin/ass-liquidation-add', null, { filterInput: JSON.stringify(this.filterInputSearch) });
    }

    onUpdate(item: ASS_LIQUIDATION_ENTITY): void {
        this.navigatePassParam('/app/admin/ass-liquidation-edit', { id: item.liQ_ID }, { filterInput: JSON.stringify(this.filterInputSearch) });
    }

    onDelete(item: ASS_LIQUIDATION_ENTITY): void {
        this.message.confirm(
            this.l('DeleteWarningMessage', item.liQ_ID),
            this.l('AreYouSure'),
            (isConfirmed) => {
                if (isConfirmed) {
                    this.saving = true;
                    this.assLiquidationService.aSS_LIQUIDATION_Del(item.liQ_ID)
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

    onApprove(item: ASS_LIQUIDATION_ENTITY): void {

    }

    onViewDetail(item: ASS_LIQUIDATION_ENTITY): void {
        this.navigatePassParam('/app/admin/ass-liquidation-view', { id: item.liQ_ID }, { filterInput: JSON.stringify(this.filterInputSearch) });
    }

    onSave(): void {

    }

    onResetSearch(): void {
        this.filterInput = new ASS_LIQUIDATION_ENTITY();
        this.initDefaultFilter()
        this.changePage(0);
    }
}

