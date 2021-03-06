import { ListComponentBase } from "@app/ultilities/list-component-base";
import { Injector, Component, OnInit, ViewChild, ViewEncapsulation, OnDestroy, AfterViewInit } from "@angular/core";
import { DeleteAssServiceProxy, T_DELETE_ASS_ENTITY,ASS_MASTER_ENTITY, ReportInfo, AsposeServiceProxy } from "@shared/service-proxies/service-proxies";
import { LazyLoadEvent } from "primeng/api";
import { IUiAction } from "@app/ultilities/ui-action";
import { appModuleAnimation } from "@shared/animations/routerTransition";
import { FileDownloadService } from "@shared/utils/file-download.service";
import { finalize } from "rxjs/operators";
import { AssetModalComponent } from "@app/admin/core/controls/asset-modal/asset-modal.component";
import { AuthStatusConsts } from "@app/admin/core/ultils/consts/AuthStatusConsts";
import { ReportTypeConsts } from "@app/admin/core/ultils/consts/ReportTypeConsts";

@Component({
    templateUrl: './delete-ass-list.component.html',
    encapsulation: ViewEncapsulation.None,
    animations: [appModuleAnimation()]
})

export class DeleteAssListComponent extends ListComponentBase<T_DELETE_ASS_ENTITY> implements IUiAction<T_DELETE_ASS_ENTITY>, OnInit, AfterViewInit {

    filterInput: T_DELETE_ASS_ENTITY = new T_DELETE_ASS_ENTITY();
    @ViewChild('assetModal')assetModal : AssetModalComponent;
    constructor(injector: Injector,
        private fileDownloadService: FileDownloadService,
        private asposeService: AsposeServiceProxy,
        private deleteAssService: DeleteAssServiceProxy) {
        super(injector);
        this.initFilter();
        // COMMENT: this.stopAutoUpdateView();
    }


    initDefaultFilter(){
        this.filterInput.top = 200;
    }

    ngAfterViewInit(): void {
        this.updateView();
    }
    getSingleAsset(asset: ASS_MASTER_ENTITY)
    {
        this.filterInput.asS_CODE = asset.asseT_CODE;
        this.updateView();
    }
    showAssetModal()
    {
        this.assetModal.filterInput.level = 'ALL';
        this.assetModal.show();
    }
    ngOnInit(): void {
        // set ui action
        this.appToolbar.setUiAction(this);
        // set role toolbar
        this.appToolbar.setRole('DeleteAss', true, true, false, true, true, true, false, true);
        this.appToolbar.setEnableForListPage();
    }


    search(): void {
        this.showTableLoading();

        this.setSortingForFilterModel(this.filterInputSearch);
        this.filterInputSearch.level = 'UNIT';
        this.deleteAssService.t_DELETE_ASS_Search(this.filterInputSearch)
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
        this.navigatePassParam('/app/admin/delete-ass-add', null, { filterInput: JSON.stringify(this.filterInputSearch) });
    }

    onUpdate(item: T_DELETE_ASS_ENTITY): void {
        this.navigatePassParam('/app/admin/delete-ass-edit', { id: item.deL_ASS_ID,assCode:item.asS_CODE, assId: item.asS_ID  }, { filterInput: JSON.stringify(this.filterInputSearch) });
    }

    onDelete(item: T_DELETE_ASS_ENTITY): void {
        if(item.autH_STATUS == AuthStatusConsts.Approve)
        {
            this.showErrorMessage(this.l('YouCannotDeleteThisObject'));
            return;
        }
        this.message.confirm(
            this.l('DeleteWarningMessage', item.deL_ASS_CODE),
            this.l('AreYouSure'),
            (isConfirmed) => {
                if (isConfirmed) {
                    this.saving = true;
                    this.deleteAssService.t_DELETE_ASS_Del(item.deL_ASS_ID )
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

    onApprove(item: T_DELETE_ASS_ENTITY): void {

    }

    onViewDetail(item: T_DELETE_ASS_ENTITY): void {
        this.navigatePassParam('/app/admin/delete-ass-view', { id: item.deL_ASS_ID, assCode:item.asS_CODE, assId: item.asS_ID  }, { filterInput: JSON.stringify(this.filterInputSearch) });
    }

    onSave(): void {

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

        reportInfo.pathName = "/TOOL/rpt_ass_delete.xlsx";
        reportInfo.storeName = "T_DELETE_ASS_Search";

        this.asposeService.getReport(reportInfo).subscribe(x => {
            this.fileDownloadService.downloadTempFile(x);
        });
    }

    onResetSearch(): void {
        this.filterInput = new T_DELETE_ASS_ENTITY();
        this.initDefaultFilter();
        this.changePage(0);
        this.updateView();

    }
}
