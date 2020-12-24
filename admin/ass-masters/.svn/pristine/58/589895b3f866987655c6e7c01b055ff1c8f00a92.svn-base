import { ListComponentBase } from "@app/ultilities/list-component-base";
import { Injector, Component, OnInit, ViewEncapsulation, ChangeDetectionStrategy, AfterViewInit } from "@angular/core";
import { ASS_ADDNEW_ENTITY, AssAddNewServiceProxy, TRADE_DETAIL_ENTITY, ASS_GROUP_ENTITY, AssGroupServiceProxy, ReportInfo, AsposeServiceProxy, } from "@shared/service-proxies/service-proxies";
import { LazyLoadEvent } from "primeng/api";
import { IUiAction } from "@app/ultilities/ui-action";
import { appModuleAnimation } from "@shared/animations/routerTransition";
import { finalize } from "rxjs/operators";
import { RecordStatusConsts } from "@app/admin/core/ultils/consts/RecordStatusConsts";
import * as moment from 'moment';
import { ReportTypeConsts } from "@app/admin/core/ultils/consts/ReportTypeConsts";
import { FileDownloadService } from "@shared/utils/file-download.service";

@Component({
    templateUrl: './ass-add-new-list.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    animations: [appModuleAnimation()]
})

export class AssAddNewListComponent extends ListComponentBase<ASS_ADDNEW_ENTITY> implements IUiAction<ASS_ADDNEW_ENTITY>, OnInit, AfterViewInit {

    filterInput: ASS_ADDNEW_ENTITY = new ASS_ADDNEW_ENTITY();
    assGroups: ASS_GROUP_ENTITY[];

    constructor(injector: Injector,
        private assGroupService: AssGroupServiceProxy,
        private fileDownloadService : FileDownloadService,
        private asposeService : AsposeServiceProxy,
        private assAddNewService: AssAddNewServiceProxy) {
        super(injector);
        this.initFilter();

    }

    initDefaultFilter() {
        this.filterInput.fR_BUY_DATE = moment().startOf('month');
        this.filterInput.tO_BUY_DATE = moment();
        this.filterInput.typE_ID = 'TSCD';
        this.filterInput.type = 'ADD_NEW';
        this.filterInput.brancH_CREATE = this.appSession.user.subbrId;
        this.filterInput.level = 'UNIT';
        this.filterInput.recorD_STATUS = RecordStatusConsts.Active;
        this.filterInput.top = 300;
        this.filterInput.pricE_FROM = 0;
        this.filterInput.pricE_TO = 0;
    }

    ngAfterViewInit(): void {
        this.updateView();
    }

    ngOnInit(): void {
        // set ui action
        this.appToolbar.setUiAction(this);
        // set role toolbar
        this.appToolbar.setRole('AssAddNew', true, true, false, true, true, true, false, true);
        this.appToolbar.setEnableForListPage();
        this.initComboboxs();
    }

    initComboboxs() {
        this.assGroupService.aSS_GROUP_ByType('TSCD').subscribe(response => {
            this.assGroups = response;
            this.updateView();
        });
    }

    search(): void {
        this.showTableLoading();

        this.setSortingForFilterModel(this.filterInputSearch);

        this.assAddNewService.aSS_ADDNEW_Search(this.filterInputSearch)
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
        this.navigatePassParam('/app/admin/ass-add-new-add', null, { filterInput: JSON.stringify(this.filterInputSearch) });
    }

    onUpdate(item: ASS_ADDNEW_ENTITY): void {
        this.navigatePassParam('/app/admin/ass-add-new-edit', { id: item.addneW_ID }, { filterInput: JSON.stringify(this.filterInputSearch) });
    }

    onDelete(item: ASS_ADDNEW_ENTITY): void {
        this.message.confirm(
            this.l('DeleteWarningMessage', item.asseT_NAME),
            this.l('AreYouSure'),
            (isConfirmed) => {
                if (isConfirmed) {
                    this.saving = true;
                    this.assAddNewService.aSS_ADDNEW_Del(item.addneW_ID)
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

    exportToExcel() {
        let reportInfo = new ReportInfo();
        reportInfo.typeExport = ReportTypeConsts.Excel;

        let reportFilter = { ...this.filterInputSearch };

        reportFilter.maxResultCount = -1;

        reportInfo.parameters = this.GetParamsFromFilter(reportFilter)

        reportInfo.values = this.GetParamsFromFilter({
            A1: this.l('CompanyReportHeader')
        });

        reportInfo.values = this.GetParamsFromFilter({
            A1 : this.l('CompanyReportHeader')
        });

        reportInfo.pathName = "/ASS_MASTER/rpt_ass_addnew.xlsx";
        reportInfo.storeName = "ASS_ADDNEW_Search";

        this.asposeService.getReport(reportInfo).subscribe(x => {
            this.fileDownloadService.downloadTempFile(x);
        });
    }

    onApprove(item: ASS_ADDNEW_ENTITY): void {

    }

    onViewDetail(item: ASS_ADDNEW_ENTITY): void {
        this.navigatePassParam('/app/admin/ass-add-new-view', { id: item.addneW_ID }, { filterInput: JSON.stringify(this.filterInputSearch) });
    }

    onSave(): void {

    }

    onResetSearch(): void {
        this.filterInput = new ASS_ADDNEW_ENTITY();
        this.initDefaultFilter();
        this.changePage(0);
    }
}
