import { ListComponentBase } from "@app/ultilities/list-component-base";
import { Injector, Component, OnInit, ViewEncapsulation, ViewChild } from "@angular/core";
import { RealEstateServiceProxy, RET_MASTER_ENTITY, ASS_MASTER_ENTITY, CM_DIVISION_ENTITY, ReportInfo, AsposeServiceProxy } from "@shared/service-proxies/service-proxies";
import { IUiAction } from "@app/ultilities/ui-action";
import { appModuleAnimation } from "@shared/animations/routerTransition";
import { LazyLoadEvent } from "primeng/api";
import { finalize } from "rxjs/operators";
import { AssetModalComponent } from "@app/admin/core/controls/asset-modal/asset-modal.component";
import { DivisionModalComponent } from "@app/admin/core/controls/division-modal/division-modal.component";
import { RecordStatusConsts } from "@app/admin/core/ultils/consts/RecordStatusConsts";
import { ReportTypeConsts } from "@app/admin/core/ultils/consts/ReportTypeConsts";
import { FileDownloadService } from "@shared/utils/file-download.service";

@Component({
    templateUrl: './real-estate-list.component.html',
    encapsulation: ViewEncapsulation.None,
    animations: [appModuleAnimation()]
})

export class RealEstateListComponent extends ListComponentBase<RET_MASTER_ENTITY> implements IUiAction<RET_MASTER_ENTITY>, OnInit {
    @ViewChild('assetModal') assetModal: AssetModalComponent;
    @ViewChild('divisionModal') divModal: DivisionModalComponent;

    filterInput: RET_MASTER_ENTITY = new RET_MASTER_ENTITY();
    assType: string = '3';
    assCat: string = 'RET';
    level: string = 'UNIT';
    constructor(injector: Injector,
        private _realEstateService: RealEstateServiceProxy,
        private fileDownloadService: FileDownloadService,
        private asposeService: AsposeServiceProxy) {
        super(injector);

        this.initFilter();
    }

    initFilter() {
    }

    onDivisionFocusOut() {
        if (!this.filterInput.diV_CODE) {
            this.filterInput.diV_ID = undefined;
            this.filterInput.diV_CODE = undefined;
            this.filterInput.diV_NAME = undefined;
            this.updateView();
        }
    }

    onAssetFocusOut() {
        if (!this.filterInput.asseT_CODE) {
            this.filterInput.asseT_ID = undefined;
        }
    }

    

    ngOnInit(): void {
        // set ui action
        this.appToolbar.setUiAction(this);
        // set role toolbar

        //initialize modal input
        this.appToolbar.setRole('RealEstate', true, true, false, true, true, true, false, true);
        this.appToolbar.setEnableForListPage();
    }
    showAssetModal() {
        this.assetModal.filterInput.brancH_ID = this.appSession.user.subbrId;
        // this.assetModal.filterInput.asS_TYPE = this.assType;
        this.assetModal.filterInput.asS_CAT = this.assCat;
        this.assetModal.filterInput.brancH_LOGIN = this.appSession.user.subbrId;
        this.assetModal.filterInput.level = this.level;
        this.assetModal.filterInput.asS_TYPE = '3';
        this.assetModal.show();
    }
    showDivisionModal() {
        this.divModal.filterInput.brancH_ID = '';
        this.divModal.filterInput.recorD_STATUS = RecordStatusConsts.Active;
        this.divModal.filterInput.top = 200;
        this.divModal.show();
    }
    search() {

        this.showTableLoading();

        this.setSortingForFilterModel(this.filterInputSearch);
        this._realEstateService.rET_MASTER_Search(this.filterInputSearch)
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

        let reportFilter = { ...this.filterInputSearch };

        reportFilter.maxResultCount = -1;

        reportInfo.parameters = this.GetParamsFromFilter(reportFilter)

        reportInfo.values = this.GetParamsFromFilter({
            A1: this.l('CompanyReportHeader')
        });

        reportInfo.pathName = "/RET_MASTER/rpt_real_estate.xlsx";
        reportInfo.storeName = "RET_MASTER_Search";

        this.asposeService.getReport(reportInfo).subscribe(x => {
            this.fileDownloadService.downloadTempFile(x);
        });
    }


    onSingleSelectAsset(input: ASS_MASTER_ENTITY) {
        this.filterInput.asseT_CODE = input.asseT_CODE;
        this.filterInput.asseT_ID = input.asseT_ID;
    }

    onSingleSelectDivision(input: CM_DIVISION_ENTITY) {
        this.filterInput.diV_CODE = input.diV_CODE;
        this.filterInput.diV_ID = input.diV_ID;
        this.filterInput.diV_NAME = input.diV_NAME;
    }

    onAdd(): void {
        this.navigatePassParam('/app/admin/real-estate-add', null, { filterInput: JSON.stringify(this.filterInputSearch) });
    }

    onUpdate(item: RET_MASTER_ENTITY): void {
        this.navigatePassParam('/app/admin/real-estate-edit', { id: item.reT_ID }, { filterInput: JSON.stringify(this.filterInputSearch) });
    }

    onDelete(item: RET_MASTER_ENTITY): void {
        this.message.confirm(
            this.l('DeleteWarningMessage', item.reT_ID),
            this.l('AreYouSure'),
            (isConfirmed) => {
                if (isConfirmed) {
                    this.saving = true;
                    this._realEstateService.rET_MASTER_Del(item.reT_ID)
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

    onApprove(): void {

    }

    onViewDetail(item: RET_MASTER_ENTITY): void {
        this.navigatePassParam('/app/admin/real-estate-view', { id: item.reT_ID }, { filterInput: JSON.stringify(this.filterInputSearch) });
    }

    onSave(): void {

    }



    onResetSearch(): void {
        this.filterInput = new RET_MASTER_ENTITY();
        this.changePage(0);
    }
}
