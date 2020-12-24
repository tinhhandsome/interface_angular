import { ListComponentBase } from "@app/ultilities/list-component-base";
import { Injector, Component, OnInit, ViewEncapsulation, ViewChild, AfterViewInit, ɵConsole, ChangeDetectionStrategy } from "@angular/core";
import { AssUpdateServiceProxy, ASS_UPDATE_ENTITY, CM_BRANCH_ENTITY, BranchServiceProxy, AsposeServiceProxy, ReportInfo, ASS_GROUP_ENTITY, ASS_TYPE_ENTITY, ASS_STATUS_ENTITY, ASS_AMORT_STATUS_ENTITY, AssTypeServiceProxy, AssGroupServiceProxy, ASS_MASTER_ENTITY } from "@shared/service-proxies/service-proxies";
import { LazyLoadEvent } from "primeng/api";
import { IUiAction } from "@app/ultilities/ui-action";
import { appModuleAnimation } from "@shared/animations/routerTransition";
import { FileDownloadService } from "@shared/utils/file-download.service";
import { finalize } from "rxjs/operators";
import { ReportTypeConsts } from "@app/admin/core/ultils/consts/ReportTypeConsts";
import * as moment from 'moment'
import { AssetModalComponent } from "@app/admin/core/controls/asset-modal/asset-modal.component";

@Component({
    templateUrl: './ass-update-list.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    animations: [appModuleAnimation()]
})

export class AssUpdateListComponent extends ListComponentBase<ASS_UPDATE_ENTITY> implements IUiAction<ASS_UPDATE_ENTITY>, OnInit, AfterViewInit {


    @ViewChild('assetModal') assetModal: AssetModalComponent;

    filterInput: ASS_UPDATE_ENTITY = new ASS_UPDATE_ENTITY();;
    branchName: string
    branches: CM_BRANCH_ENTITY[];

    typeId: string

    assGroups: ASS_GROUP_ENTITY[];
    assTypes: ASS_TYPE_ENTITY[];

    constructor(injector: Injector,
        private fileDownloadService: FileDownloadService,
        private asposeService: AsposeServiceProxy,
        private assGroupService: AssGroupServiceProxy,
        private assTypeService: AssTypeServiceProxy,
        private assUpdateService: AssUpdateServiceProxy) {
        super(injector);

        this.initFilter();
        this.initCombobox()
    }

    initDefaultFilter() {
        this.branchName = this.appSession.user.branchName;
        this.filterInput.brancH_ID = this.appSession.user.subbrId
        this.filterInput.top = 300
        this.filterInput.fR_BUY_DATE = moment().startOf('month')
        this.filterInput.tO_BUY_DATE = moment()
        this.typeId = null
        this.filterInput.level = 'UNIT'
    }

    ngOnInit(): void {
        // set ui action
        this.appToolbar.setUiAction(this);
        // set role toolbar
        this.appToolbar.setRole('AssUpdate', true, true, false, true, true, true, false, true);
        this.appToolbar.setEnableForListPage();



    }
    ngAfterViewInit(): void {
        // COMMENT: this.stopAutoUpdateView();
    }
    initCombobox(): void {
        this.assTypeService.aSS_TYPE_Lis().subscribe(response => {
            this.assTypes = response;
            this.updateView()
        });
        this.onGetAssGroups(null)
    }
    setFilterInputSearch() {
        if (!this.filterInputSearch.brancH_ID) {
            this.filterInputSearch.brancH_ID = this.appSession.user.subbrId;
        }
    }
    openAssetModal() {
        this.assetModal.filterInput.brancH_ID = this.appSession.user.subbrId
        this.assetModal.filterInput.brancH_CODE = this.appSession.user.branchCode
        this.assetModal.filterInput.brancH_NAME = this.appSession.user.branchName
        this.assetModal.filterInput.level = 'ALL'
        this.assetModal.filterInput.top = 1000
        this.assetModal.show()
    }


    onGetAssGroups(entity: ASS_TYPE_ENTITY) {
        this.typeId = !this.isNull(entity) ? entity.typE_ID : ''
        this.assGroupService.aSS_GROUP_ByType(this.typeId).subscribe(response => {
            this.assGroups = response;
            this.updateView()
        });
    }

    getSingleAsset(item: ASS_MASTER_ENTITY) {
        this.filterInput.asseT_ID = item.asseT_CODE
        this.filterInput.asseT_CODE = item.asseT_CODE
        this.updateView()
    }

    exportToExcel() {
        let reportInfo = new ReportInfo();
        reportInfo.typeExport = ReportTypeConsts.Excel;

        this.setFilterInputSearch()
        let filterReport = { ...this.filterInputSearch }
        filterReport.maxResultCount = -1;

        reportInfo.parameters = this.GetParamsFromFilter(filterReport)

        reportInfo.values = this.GetParamsFromFilter({
            A1: this.l('CompanyReportHeader')
        });

        reportInfo.pathName = "/ASS_MASTER/rpt-ass-update.xlsx";
        reportInfo.storeName = "ASS_UPDATE_Search";

        this.asposeService.getReport(reportInfo).subscribe(x => {
            this.fileDownloadService.downloadTempFile(x);
        });
    }

    search(): void {

        this.showTableLoading();

        //sql dkien tim kiem ass_code = p_ass_id
        this.filterInputSearch.asseT_ID = this.filterInputSearch.asseT_CODE

        this.setFilterInputSearch()

        this.setSortingForFilterModel(this.filterInputSearch);

        this.assUpdateService.aSS_UPDATE_Search(this.filterInputSearch)
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
        this.navigatePassParam('/app/admin/ass-update-add', null, { filterInput: JSON.stringify(this.filterInputSearch) });
    }

    onUpdate(item: ASS_UPDATE_ENTITY): void {
        this.navigatePassParam('/app/admin/ass-update-edit', { id: item.updatE_ID }, { filterInput: JSON.stringify(this.filterInputSearch) });
    }

    onDelete(item: ASS_UPDATE_ENTITY): void {
        this.message.confirm(
            this.l('DeleteWarningMessage', item.updatE_ID),
            this.l('AreYouSure'),
            (isConfirmed) => {
                if (isConfirmed) {
                    this.saving = true;
                    this.assUpdateService.aSS_UPDATE_Del(item.updatE_ID)
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
                            this.updateView()
                        });
                }
            }
        );
    }

    onApprove(item: ASS_UPDATE_ENTITY): void {

    }

    onViewDetail(item: ASS_UPDATE_ENTITY): void {
        this.navigatePassParam('/app/admin/ass-update-view', { id: item.updatE_ID }, { filterInput: JSON.stringify(this.filterInputSearch) });
    }

    onSave(): void {

    }



    onResetSearch(): void {
        this.filterInput = new ASS_UPDATE_ENTITY();
        this.initDefaultFilter()
        this.changePage(0);
    }
}

