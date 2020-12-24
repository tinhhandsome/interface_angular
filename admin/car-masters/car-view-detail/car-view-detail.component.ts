import { ViewEncapsulation, Injector, Component, ViewChild, OnInit, ElementRef } from "@angular/core";
import { ListComponentBase } from "@app/ultilities/list-component-base";
import { CarMasterServiceProxy, CarViewDetailServiceProxy, CAR_ACCESSORY_ENTITY, CAR_DRIVE_ENTITY, CAR_CHARGE_ENTITY, CAR_INSURE_ENTITY, CAR_OFFER_ENTITY, CAR_MAINTAIN_ENTITY, ASS_MASTER_ENTITY } from "@shared/service-proxies/service-proxies";
import { CAR_MASTER_ENTITY, CAR_VIEW_DETAIL_ENTITY, CAR_VIEW_DETAIL_INPUT, CAR_REGISTER_ENTITY } from "@shared/service-proxies/service-proxies";
import { appModuleAnimation } from "@shared/animations/routerTransition";
import { CarMasterModalComponent } from "@app/admin/core/controls/car-modal/car-master-modal.component";
import { EditableTableComponent } from '@app/admin/core/controls/editable-table/editable-table.component';

@Component({
    templateUrl: './car-view-detail.component.html',
    encapsulation: ViewEncapsulation.None,
    animations: [appModuleAnimation()]
})
export class CarViewDetailComponent extends ListComponentBase<CAR_MASTER_ENTITY> implements OnInit {

    carViewDetail: CAR_VIEW_DETAIL_ENTITY = new CAR_VIEW_DETAIL_ENTITY();
    assViewDetail: ASS_MASTER_ENTITY = new ASS_MASTER_ENTITY();
    carViewDetailInput: CAR_VIEW_DETAIL_INPUT = new CAR_VIEW_DETAIL_INPUT();

    sumRepairAMT: number = 0; // tổng chi phí sửa chữa

    constructor(
        injector: Injector,
        private carViewDetailService: CarViewDetailServiceProxy,
        private carMasterService: CarMasterServiceProxy

    ) {
        super(injector);
        this.initFilter();
    }

    ngOnInit(): void {
        this.appToolbar.setUiAction(this);
        this.appToolbar.setRole('CarViewDetail', false, false, false, false, false, false, false, false);
        this.appToolbar.setEnableForListPage();
    }

    @ViewChild('carMasterModal') carMasterModal: CarMasterModalComponent;
    @ViewChild('viewFrom') viewFrom: ElementRef;
    @ViewChild('accessoriesTable') accessoriesTable: EditableTableComponent<CAR_ACCESSORY_ENTITY>;
    @ViewChild('carDriveTable') carDriveTable: EditableTableComponent<CAR_DRIVE_ENTITY>;
    @ViewChild('carChargeTable') carChargeTable: EditableTableComponent<CAR_CHARGE_ENTITY>;
    @ViewChild('carInsureTable') carInsureTable: EditableTableComponent<CAR_INSURE_ENTITY>;
    @ViewChild('carOfferTable') carOfferTable: EditableTableComponent<CAR_OFFER_ENTITY>;
    @ViewChild('carMaintainTable') carMaintainTable: EditableTableComponent<CAR_MAINTAIN_ENTITY>;
    @ViewChild('carRegisterTable') carRegisterTable: EditableTableComponent<CAR_REGISTER_ENTITY>;


    setEditableTableList(item: any): void {
        if (item instanceof CAR_VIEW_DETAIL_ENTITY) {
            this.accessoriesTable.setList(item.caR_ACCESSORIes);
            this.carDriveTable.setList(item.caR_DRIVEs);
            this.carChargeTable.setList(item.caR_CHARGEs);
            this.carInsureTable.setList(item.caR_INSUREs);
            this.carOfferTable.setList(item.caR_OFFERs);
            this.carMaintainTable.setList(item.caR_MAINTAINs);
            this.carRegisterTable.setList(item.caR_REGISTERs);
        }
        else {
            this.carDriveTable.setList(item);
            this.accessoriesTable.setList(item);
            this.carChargeTable.setList(item);
            this.carInsureTable.setList(item);
            this.carOfferTable.setList(item);
            this.carMaintainTable.setList(item);
            this.carRegisterTable.setList(item);
        }
    }

    getCarViewDetails(): void {
        this.carViewDetailInput.brancH_ID = this.appSession.user.subbrId;
        this.carViewDetailService.cAR_MASTER_ViewDetail(this.carViewDetailInput)
            .subscribe(result => {
                this.getAssViewDetails();
                this.carViewDetail = result;
                this.sumRepairAMT = this.getSumRepairAMT(result);
                this.setEditableTableList(result);
            });
    }

    getAssViewDetails(): void {
        this.carViewDetailService.aSS_MASTER_GeId(this.carViewDetailInput)
            .subscribe(result => {
                this.assViewDetail = result;
            });
    }

    onSelectCar(event: CAR_MASTER_ENTITY): void {
        this.carViewDetailInput.caR_ID = event.caR_ID;
        this.carViewDetailInput.asseT_ID = event.asseT_ID;
        this.carViewDetailInput.n_PLATE = event.n_PLATE;
        this.getCarViewDetails();
    }

    getSumRepairAMT(item: CAR_VIEW_DETAIL_ENTITY): number {
        var sum = 0;
        item.caR_OFFERs.forEach(_repairAMT => {
            sum += _repairAMT.repaiR_AMT;
        });
        return sum;
    }

    resetAllWhenNPlateNotFound(): void {
        this.carViewDetailInput = new CAR_VIEW_DETAIL_INPUT();
        this.carViewDetail = new CAR_VIEW_DETAIL_ENTITY();
        this.assViewDetail = new ASS_MASTER_ENTITY();

        this.setEditableTableList([]);

        this.sumRepairAMT = 0;
    }

    getCarViewDetailsByNPlate(): void {
        this.carMasterService.cAR_MASTER_ById(this.carViewDetailInput.n_PLATE, this.appSession.user.subbrId)
            .subscribe(result => {
                if (result.caR_ID == null || result.caR_ID == undefined) {
                    var temp = this.carViewDetailInput.n_PLATE;
                    this.resetAllWhenNPlateNotFound();
                    this.carViewDetailInput.n_PLATE = temp;
                    return;
                }
                this.onSelectCar(result);
            })
    }

    onAdd() { }
    onUpdate() { }
    onDelete() { }
    onSave() { }
    onSearch() { }
    onResetSearch() {
        this.carViewDetailInput.n_PLATE = '';
        this.resetAllWhenNPlateNotFound();
    }
    onApprove() { }
    onViewDetail() { }
}

