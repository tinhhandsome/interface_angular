import { ListComponentBase } from "@app/ultilities/list-component-base";
import { Injector, Component, OnInit, ViewChild, ViewEncapsulation, OnDestroy, AfterViewInit, ɵConsole } from "@angular/core";
import { AssAddNewServiceProxy, ASS_ADDNEW_ENTITY, ASS_GROUP_ENTITY, ASS_TYPE_ENTITY, AssTypeServiceProxy, AssGroupServiceProxy, ReportInfo, AsposeServiceProxy } from "@shared/service-proxies/service-proxies";
import { LazyLoadEvent } from "primeng/api";
import { IUiAction } from "@app/ultilities/ui-action";
import { appModuleAnimation } from "@shared/animations/routerTransition";
import { FileDownloadService } from "@shared/utils/file-download.service";
import { finalize } from "rxjs/operators";
import { AuthStatusConsts } from "@app/admin/core/ultils/consts/AuthStatusConsts";
import { ReportTypeConsts } from "@app/admin/core/ultils/consts/ReportTypeConsts";

@Component({
    templateUrl: './ass-add-change-list.component.html',
    encapsulation: ViewEncapsulation.None,
    animations: [appModuleAnimation()]
})

export class AssAddChangeListComponent extends ListComponentBase<ASS_ADDNEW_ENTITY> implements IUiAction<ASS_ADDNEW_ENTITY>, OnInit, AfterViewInit {

    filterInput: ASS_ADDNEW_ENTITY = new ASS_ADDNEW_ENTITY();
    assGroups: ASS_GROUP_ENTITY[];
    assTypes: ASS_TYPE_ENTITY[];
    constructor(injector: Injector,
        private asposeService : AsposeServiceProxy,
        private fileDownloadService: FileDownloadService,
        private assAddNewService: AssAddNewServiceProxy,
        private assTypeService: AssTypeServiceProxy,
        private assGroupService: AssGroupServiceProxy) {
        super(injector);
        // console.log(this)
        this.initFilter();

    }


    initCombobox() {
        this.assTypeService.aSS_TYPE_Lis().subscribe(response => {
            this.assTypes = response;
            this.updateView();
        });
    }
    ngAfterViewInit(): void {
        // COMMENT: this.stopAutoUpdateView();
    }

    ngOnInit(): void {
        this.initCombobox();
        // set ui action
        this.appToolbar.setUiAction(this);
        // set role toolbar
        this.appToolbar.setRole('AssAddChange', true, true, false, true, true, true, false, true);
        this.appToolbar.setEnableForListPage();
    }
    onTypeSelectChange(type: ASS_TYPE_ENTITY) {
        if (!type) {
            this.assGroups = [];
            this.filterInput.grouP_ID = '';
            this.updateView();
            return;
        }
        this.assGroupService.aSS_GROUP_ByType(type.typE_ID).subscribe(response => {
            this.assGroups = response;
            this.filterInput.grouP_ID = '';
            this.updateView();
        });
    }

    initDefaultFilter() {
        this.filterInput.brancH_CREATE = this.appSession.user.subbrId;
        this.filterInput.level = 'UNIT';
        this.filterInput.type = 'ADD_REF';
        this.filterInput.top = 300;
        this.filterInput.pricE_FROM = 0
        this.filterInput.pricE_TO = 0
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
    exportToExcel() {
        let reportInfo = new ReportInfo();
        reportInfo.typeExport = ReportTypeConsts.Excel;

        let filterReport = { ...this.filterInput }
        filterReport.maxResultCount = -1;

        reportInfo.parameters = this.GetParamsFromFilter(filterReport)

        reportInfo.values = this.GetParamsFromFilter({
            A1: this.l('CompanyReportHeader')
        });

        reportInfo.pathName = "/ASS_MASTER/rpt-ass-add-change.xlsx";
        reportInfo.storeName = "ASS_ADDNEW_Search";

        this.asposeService.getReport(reportInfo).subscribe(x => {
            this.fileDownloadService.downloadTempFile(x);
        });
    }

    onAdd(): void {
        this.navigatePassParam('/app/admin/ass-add-change-add', null, { filterInput: JSON.stringify(this.filterInputSearch) });
    }

    onUpdate(item: ASS_ADDNEW_ENTITY): void {
        this.navigatePassParam('/app/admin/ass-add-change-edit', { id: item.addneW_ID, refAssCode: item.reF_ASS_CODE }, { filterInput: JSON.stringify(this.filterInputSearch) });
    }

    onDelete(item: ASS_ADDNEW_ENTITY): void {
        if (item.autH_STATUS == AuthStatusConsts.Approve) {
            this.showErrorMessage(this.l('YouCannotDeleteThisObject'));
            return;
        }
        this.message.confirm(
            this.l('DeleteWarningMessage'),
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

    onApprove(item: ASS_ADDNEW_ENTITY): void {

    }

    onViewDetail(item: ASS_ADDNEW_ENTITY): void {
        this.navigatePassParam('/app/admin/ass-add-change-view', { id: item.addneW_ID, refAssCode: item.reF_ASS_CODE }, { filterInput: JSON.stringify(this.filterInputSearch) });
    }

    onSave(): void {

    }



    onResetSearch(): void {
        this.filterInput = new ASS_ADDNEW_ENTITY();
        this.initDefaultFilter()
        this.changePage(0);
    }
}
