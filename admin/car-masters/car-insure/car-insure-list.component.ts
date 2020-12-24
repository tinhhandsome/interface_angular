import { ListComponentBase } from "@app/ultilities/list-component-base";
import { Injector, Component, OnInit, ViewEncapsulation, ViewChild, Input, AfterViewInit, AfterViewChecked } from "@angular/core";
import { CAR_INSURE_ENTITY, CarInsureServiceProxy, CAR_MASTER_ENTITY, CarMasterServiceProxy, ReportInfo, AsposeServiceProxy, } from "@shared/service-proxies/service-proxies";
import { LazyLoadEvent } from "primeng/api";
import { IUiAction } from "@app/ultilities/ui-action";
import { appModuleAnimation } from "@shared/animations/routerTransition";
import { FileDownloadService } from "@shared/utils/file-download.service";
import { finalize } from "rxjs/operators";
import { CarMasterModalComponent } from "@app/admin/core/controls/car-modal/car-master-modal.component";
import { AsposeSampleComponent } from "@app/admin/common/aspose-sample/aspose-sample.component";
import { ReportTypeConsts } from "@app/admin/core/ultils/consts/ReportTypeConsts";
import { AuthStatusConsts } from "@app/admin/core/ultils/consts/AuthStatusConsts";

@Component({
    templateUrl: './car-insure-list.component.html',
    encapsulation: ViewEncapsulation.None,
    animations: [appModuleAnimation()]
})

export class CarInsureListComponent extends ListComponentBase<CAR_INSURE_ENTITY> implements IUiAction<CAR_INSURE_ENTITY>, OnInit, AfterViewInit {
    ngAfterViewInit(): void {
        this.updateView();
    }


    filterInput: CAR_INSURE_ENTITY = new CAR_INSURE_ENTITY();
    @ViewChild('carMasterModal') carMasterModal: CarMasterModalComponent;

    constructor(injector: Injector,
        private _CarInsureService: CarInsureServiceProxy,
        private _CarMasterService: CarMasterServiceProxy,
        private fileDownloadService: FileDownloadService,
        private asposeService: AsposeServiceProxy) {
        super(injector);
        this.filterInput.caR_MASTER = new CAR_MASTER_ENTITY();
        this.initFilter();
        // COMMENT: this.stopAutoUpdateView();

    }

    initDefaultFilter() {
        this.filterInput.brancH_ID = this.appSession.user.subbrId;
        this.filterInput.top = 200;
    }

    ngOnInit(): void {
        this.filterInput.caR_MASTER = new CAR_MASTER_ENTITY();
        // set ui action
        this.appToolbar.setUiAction(this);
        // set role toolbar
        this.appToolbar.setRole('CarInsure', true, true, false, true, true, true, false, true);
        this.appToolbar.setEnableForListPage();
    }

    exportToExcel() {
        // this._CarInsureService.cAR_INSURE_ToExcel(this.filterInput).subscribe(response => {
        //     this._fileDownloadService.downloadTempFile(response);
        // })

        let reportInfo = new ReportInfo();
        reportInfo.typeExport = ReportTypeConsts.Excel;

        let filterReport = { ...this.filterInputSearch }

        // filterReport.maxResultCount = -1;
        // filterReport.totalCount = this.isNull(filterReport.totalCount) ? 0 : filterReport.totalCount;
        // filterReport.skipCount = 0;
        reportInfo.parameters = this.GetParamsFromFilter(filterReport)

        reportInfo.values = this.GetParamsFromFilter({
            A1: this.l('CompanyReportHeader')
        });

        reportInfo.pathName = "/CAR_MASTER/rpt_car_insure.xlsx";
        reportInfo.storeName = "CAR_INSURE_Search";

        this.asposeService.getReport(reportInfo).subscribe(x => {
            this.fileDownloadService.downloadTempFile(x);
        });
    }

    search(): void {

        if (!this.filterInputSearch.n_PLATE) {
            this.filterInputSearch.caR_MASTER = new CAR_MASTER_ENTITY();
        } else {
            this._CarMasterService.cAR_MASTER_ById(this.filterInputSearch.caR_MASTER.n_PLATE, this.appSession.user.subbrId)
                .subscribe(result => {
                    this.filterInputSearch.caR_MASTER = result;
                    this.updateView();
                });
        }
        this.showTableLoading();
        this.setSortingForFilterModel(this.filterInputSearch);


        this._CarInsureService.cAR_INSURE_Search(this.filterInputSearch)
            .pipe(finalize(() => this.hideTableLoading()))
            .subscribe(result => {
                this.dataTable.records = result.items;
                this.dataTable.totalRecordsCount = result.totalCount;
                this.filterInputSearch.totalCount = result.totalCount;
                this.updateView();
                this.appToolbar.setEnableForListPage();
            });
        // this._CarMasterService.cAR_MASTER_ById(this.filterInputSearch.caR_MASTER.n_PLATE, this.filterInputSearch.caR_MASTER.brancH_ID)
        //     .subscribe(result => {
        //         this.filterInputSearch.caR_MASTER = result;
        //     });
    }

    onAdd(): void {
        this.navigatePassParam('/app/admin/car-insure-add', null, { filterInput: JSON.stringify(this.filterInputSearch) });
    }

    onUpdate(item: CAR_INSURE_ENTITY): void {
        this.navigatePassParam('/app/admin/car-insure-edit', { insureId: item.caR_INSU_ID }, { filterInput: JSON.stringify(this.filterInputSearch) });
    }

    onDelete(item: CAR_INSURE_ENTITY): void {
        if (item.autH_STATUS == AuthStatusConsts.Approve) {
            this.showErrorMessage(this.l('CantDeleteApprovedItem'));
            return;
        }
        this.message.confirm(
            this.l('DeleteWarningMessage', item.caR_INSU_ID),
            this.l('AreYouSure'),
            (isConfirmed) => {
                if (isConfirmed) {
                    this.saving = true;
                    this._CarInsureService.cAR_INSURE_Del(item.caR_INSU_ID)
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

    onApprove(item: CAR_INSURE_ENTITY): void {

    }

    onViewDetail(item: CAR_INSURE_ENTITY): void {
        this.navigatePassParam('/app/admin/car-insure-view', { insureId: item.caR_INSU_ID }, { filterInput: JSON.stringify(this.filterInputSearch) });
    }

    onSave(): void {

    }

    onResetSearch(): void {
        this.filterInput = new CAR_INSURE_ENTITY();
        this.filterInput.caR_MASTER = new CAR_MASTER_ENTITY();
        this.initDefaultFilter();
        this.changePage(0);
    }
    onSelectCar(car: CAR_MASTER_ENTITY) {
        this.filterInput.caR_MASTER = car;
        // this.filterInput.caR_ID = car.caR_ID;
        this.filterInput.n_PLATE = car.n_PLATE;

        this.onSearch();
        this.updateView();
    }
    findCar() {
        // if(!this.filterInputSearch){
        //     this.filterInputSearch = new CAR_INSURE_ENTITY();
        //     // this.filterInputSearch.caR_MASTER = new CAR_MASTER_ENTITY();
        // }
        this._CarMasterService.cAR_MASTER_ById(this.filterInput.n_PLATE, this.appSession.user.subbrId)
            .subscribe(result => {
                this.filterInput.caR_MASTER = result;
                this.updateView();
            });
    }
}
