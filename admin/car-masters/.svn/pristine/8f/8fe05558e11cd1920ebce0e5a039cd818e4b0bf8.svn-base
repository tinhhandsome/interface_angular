import { ViewEncapsulation, Injector, Component, ViewChild, Output, EventEmitter } from "@angular/core";
import { ListComponentBase } from "@app/ultilities/list-component-base";
import { CAR_MASTER_ENTITY } from "@shared/service-proxies/service-proxies";
import { CarMasterModalComponent } from "@app/admin/core/controls/car-modal/car-master-modal.component";

@Component({
    templateUrl: "./nplate-car-input.component.html",
    encapsulation: ViewEncapsulation.None
})
export class NplateCarInputComponent extends ListComponentBase<CAR_MASTER_ENTITY> {
    
    constructor(injector: Injector) {
        super(injector);
    }

    nPlate : string;

    @ViewChild('carMasterModal') carMasterModal : CarMasterModalComponent;


    onSelectCar(car: CAR_MASTER_ENTITY) {
        this.nPlate = car.n_PLATE;
    }
}