import { ViewEncapsulation, Injector, Component, ViewChild, Output, EventEmitter, OnInit } from "@angular/core";
import { ListComponentBase } from "@app/ultilities/list-component-base";
import { CarChargeServiceProxy, ReportInfo, AsposeServiceProxy } from "@shared/service-proxies/service-proxies";
import { CAR_MASTER_ENTITY, CAR_CHARGE_ENTITY } from "@shared/service-proxies/service-proxies";
import { appModuleAnimation } from "@shared/animations/routerTransition";
import { FileDownloadService } from "@shared/utils/file-download.service";
import { IUiAction } from "@app/ultilities/ui-action";
import { finalize } from "rxjs/operators";
import { LazyLoadEvent } from "primeng/api";
import { MoneyFormatPipe } from '../../core/pipes/money-format.pipe'
import { DateFormatPipe } from '../../core/pipes/date-format.pipe'
import { CarMasterModalComponent } from "@app/admin/core/controls/car-modal/car-master-modal.component";
import { ReportTypeConsts } from "@app/admin/core/ultils/consts/ReportTypeConsts";
import { AuthStatusConsts } from "@app/admin/core/ultils/consts/AuthStatusConsts";

@Component({
  templateUrl: './car-charge-info.component.html',
  encapsulation: ViewEncapsulation.None,
  animations: [appModuleAnimation()]
})
export class CarChargeInfoComponent extends ListComponentBase<CAR_CHARGE_ENTITY> implements IUiAction<CAR_CHARGE_ENTITY>, OnInit {

  constructor(
    injector: Injector,
    private carChargeService: CarChargeServiceProxy,
    private fileDownloadService: FileDownloadService,
    private asposeService: AsposeServiceProxy,

  ) {
    super(injector);
    this.initFilter();
  }

  ngOnInit(): void {
    this.appToolbar.setUiAction(this);
    if (this.carMasterFilter === null)
      this.carMasterFilter = new CAR_MASTER_ENTITY();
    // set role toolbar
    this.appToolbar.setRole('CarCharge', true, true, false, true, true, true, false, true);
    this.appToolbar.setEnableForListPage();
  }

  filterInput: CAR_CHARGE_ENTITY = new CAR_CHARGE_ENTITY();
  carMasterFilter: CAR_MASTER_ENTITY = new CAR_MASTER_ENTITY();


  @ViewChild('carMasterModal') carMasterModal: CarMasterModalComponent;

  search(): void {

    this.showTableLoading();

    this.setSortingForFilterModel(this.filterInputSearch);
    this.appToolbar.setEnableForListPage();

    this.filterInputSearch.brancH_ID = this.appSession.user.subbrId;
    this.carChargeService.cAR_CHARGE_Search(this.filterInputSearch)
      .pipe(finalize(() => this.hideTableLoading()))
      .subscribe(result => {
        this.dataTable.records = result.items;
        this.dataTable.totalRecordsCount = result.totalCount;
        this.appToolbar.setEnableForListPage();
      });
  }

  onSelectRow(car: CAR_CHARGE_ENTITY): void {
    this.appToolbar.onSelectRow(car);
  }

  onSelectCar(event: CAR_MASTER_ENTITY): void {
    this.carMasterFilter = event;
  }

  onAdd(): void {
    this.navigatePassParam('/app/admin/car-charge-add', null, { filterInput: JSON.stringify(this.filterInput), carMasterFilter: JSON.stringify(this.carMasterFilter) });
  }

  onUpdate(item: CAR_CHARGE_ENTITY): void {
    this.navigatePassParam('/app/admin/car-charge-edit', { id: item.caR_CHAR_ID }, { filterInput: JSON.stringify(this.filterInput), carMasterFilter: JSON.stringify(this.carMasterFilter) });
  }

  onDelete(item: CAR_CHARGE_ENTITY): void {
    if(item.autH_STATUS == AuthStatusConsts.Approve){
      this.showErrorMessage(this.l('YouCannotDeleteThisObject'));
      return;
    }
    
    this.message.confirm(
      this.l('DeleteWarningMessage', item.n_PLATE),
      this.l('AreYouSure'),
      (isConfirmed) => {
        if (isConfirmed) {
          this.saving = true;
          this.carChargeService.cAR_CHARGE_Del(item.caR_CHAR_ID)
            .pipe(finalize(() => { this.saving = false; }))
            .subscribe((response) => {
              if (response['Result'] != '0') {
                this.showErrorMessage(response['ErrorDesc']);
              }
              else {
                this.showSuccessMessage(this.l('SuccessfullyDeleted'));
                this.reloadPage();
              }
            });
        }
      }
    );
  }

  onApprove(item: CAR_CHARGE_ENTITY): void {
  }

  onViewDetail(item: CAR_CHARGE_ENTITY): void {
    this.navigatePassParam('/app/admin/car-charge-view', { id: item.caR_CHAR_ID }
      , {
        filterInput: JSON.stringify(this.filterInput),
        carMasterFilter: JSON.stringify(this.carMasterFilter)
      });
  }

  onSave(): void {

  }

  onResetSearch(): void {
    this.filterInput = new CAR_CHARGE_ENTITY();
    this.carMasterFilter = new CAR_MASTER_ENTITY();
    this.changePage(0);
  }

  exportToExcel() {
    let reportInfo = new ReportInfo();
    reportInfo.typeExport = ReportTypeConsts.Excel;

    let filterReport = { ...this.filterInputSearch }
    filterReport.maxResultCount = -1;

    reportInfo.parameters = this.GetParamsFromFilter(filterReport)

    reportInfo.pathName = "/CAR_MASTER/rpt_car_charge.xlsx";
    reportInfo.storeName = "CAR_CHARGE_Search";
    this.asposeService.getReport(reportInfo).subscribe(x => {
      this.fileDownloadService.downloadTempFile(x);
    });
  }

  initFilter() {
    this.getFilterInputInRoute((filterJson) => {
      if (filterJson['filterInput'])
        (this as any).filterInput = JSON.parse(filterJson['filterInput']);
      if (filterJson['carMasterFilter'])
        (this as any).carMasterFilter = JSON.parse(filterJson['carMasterFilter']);
    });
  }

  getFilterInputInRoute(getFilterInput): any {
    this.activeRoute.queryParams.subscribe(response => {
      if (getFilterInput) {
        getFilterInput(response);
      }
    })
  }
}