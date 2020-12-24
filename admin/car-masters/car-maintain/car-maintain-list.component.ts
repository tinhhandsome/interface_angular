import { ListComponentBase } from "@app/ultilities/list-component-base";
import { Injector, Component, OnInit, ViewEncapsulation, ViewChild, AfterViewInit } from "@angular/core";
import { CAR_MASTER_ENTITY, CAR_MAINTAIN_ENTITY, CarMaintainServiceProxy, ReportInfo, AsposeServiceProxy, } from "@shared/service-proxies/service-proxies";
import { IUiAction } from "@app/ultilities/ui-action";
import { appModuleAnimation } from "@shared/animations/routerTransition";
import { FileDownloadService } from "@shared/utils/file-download.service";
import { finalize } from "rxjs/operators";
import { CarMasterModalComponent } from "@app/admin/core/controls/car-modal/car-master-modal.component";
import { ReportTypeConsts } from "@app/admin/core/ultils/consts/ReportTypeConsts";
import { AuthStatusConsts } from "@app/admin/core/ultils/consts/AuthStatusConsts";

@Component({
    templateUrl: './car-maintain-list.component.html',
    encapsulation: ViewEncapsulation.None,
    animations: [appModuleAnimation()]
})

export class CarMaintainListComponent extends ListComponentBase<CAR_MAINTAIN_ENTITY> implements IUiAction<CAR_MAINTAIN_ENTITY>, OnInit, AfterViewInit {
    ngAfterViewInit(): void {
        this.stopAutoUpdateView();
    }

    filterInput: CAR_MAINTAIN_ENTITY = new CAR_MAINTAIN_ENTITY();
    @ViewChild('carMasterModal') carMasterModal: CarMasterModalComponent;
    appr = "Thông tin bảo dưỡng xe của ";

    constructor(injector: Injector,
        private fileDownloadService: FileDownloadService,
        private asposeService: AsposeServiceProxy,
        private carMaintainService: CarMaintainServiceProxy) {
        super(injector);
        this.initFilter();

    }

    ngOnInit(): void {
        // set ui action
        this.appToolbar.setUiAction(this);
        // set role toolbar
        this.appToolbar.setRole('CarMaintain', true, true, false, true, true, true, false, true);
        this.appToolbar.setEnableForListPage();
    }

    exportToExcel() {
        let reportInfo = new ReportInfo();
        reportInfo.typeExport = ReportTypeConsts.Excel;

        let filterReport = { ...this.filterInput }
        filterReport.maxResultCount = -1;
        filterReport.top = 0;
        reportInfo.parameters = this.GetParamsFromFilter(filterReport)

        reportInfo.pathName = "/CAR_MASTER/rpt_car_maintain.xlsx";
        reportInfo.storeName = "CAR_MAINTAIN_Search";

        this.asposeService.getReport(reportInfo).subscribe(x => {
            this.fileDownloadService.downloadTempFile(x);
        });
    }

    search(): void {

        this.showTableLoading();

        this.setSortingForFilterModel(this.filterInputSearch);

        this.carMaintainService.cAR_MAINTAIN_Search(this.filterInputSearch)
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
        this.navigatePassParam('/app/admin/carmaintain-add', null, { filterInput: JSON.stringify(this.filterInputSearch) });
    }

    onUpdate(item: CAR_MAINTAIN_ENTITY): void {
        this.navigatePassParam('/app/admin/carmaintain-edit', { maintId: item.caR_MAIN_ID }, { filterInput: JSON.stringify(this.filterInputSearch) });
    }

    onDelete(item: CAR_MAINTAIN_ENTITY): void {
        if (item.autH_STATUS == AuthStatusConsts.Approve) {
            this.showErrorMessage(this.l('YouCannotDeleteThisObject'));
            this.updateView();
        }
        else {
            this.message.confirm(
                this.l('DeleteWarningMessage', '').replace(new RegExp('"', 'g'), '') + this.appr + item.n_PLATE,
                this.l('AreYouSure'),
                (isConfirmed) => {
                    if (isConfirmed) {

                        this.saving = true;
                        this.carMaintainService.cAR_MAINTAIN_Del(item.caR_MAIN_ID)
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
                                this.updateView();
                            });
                    }
                }

            );
        }
    }

    onApprove(item: CAR_MAINTAIN_ENTITY): void {

    }

    onViewDetail(item: CAR_MAINTAIN_ENTITY): void {
        this.navigatePassParam('/app/admin/carmaintain-view', { maintId: item.caR_MAIN_ID }, { filterInput: JSON.stringify(this.filterInputSearch) });
    }

    onSave(): void {

    }

    onResetSearch(): void {
        this.filterInput = new CAR_MAINTAIN_ENTITY();

        this.changePage(0);
    }
    onSelectCar(car: CAR_MASTER_ENTITY) {
        this.filterInput.caR_ID = car.caR_ID;
        this.filterInput.n_PLATE = car.n_PLATE;
        this.filterInput.model = car.model;
        this.filterInput.caR_TYPE_NAME = car.caR_TYPE_NAME;
        this.filterInput.manufacturer = car.manufacturer;
        this.filterInput.procountry = car.procountry;
        this.filterInput.manufacturE_YEAR = car.manufacturE_YEAR;
        this.filterInput.gearboX_TYPE = car.gearboX_TYPE;
        this.filterInput.fuelS_TYPE = car.fuelS_TYPE;
        this.filterInput.volume = car.volume;
        this.filterInput.poweR_RATE = car.poweR_RATE;
        this.filterInput.machineS_ID = car.machineS_ID;
        this.filterInput.slopeS_ID = car.slopeS_ID;

        this.onSearch();

    }


}
