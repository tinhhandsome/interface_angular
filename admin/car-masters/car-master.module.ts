import { NgModule } from '@angular/core';
import { commonDeclarationImports } from '../core/ultils/CommonDeclarationModule';
import { CarMasterRoutingModule } from './car-master-routing.module';
import { CarMasterServiceProxyModule } from './car-master-service-proxy.module';
import { NplateCarInputComponent } from './nplate-car-input/nplate-car-input.component';
import { CarMasterEditComponent } from './car-master/car-master-edit.component';
import { CarMasterListComponent } from './car-master/car-master-list.component';
import { CarInsureEditComponent } from './car-insure/car-insure-edit.component';
import { CarInsureListComponent } from './car-insure/car-insure-list.component';
import { CarChargeEditComponent } from './car-charge/car-charge-edit.component';
import { CarChargeInfoComponent } from './car-charge/car-charge-info.component';
import { CarMaintainEditComponent } from './car-maintain/car-maintain-edit.component';
import { CarMaintainListComponent } from './car-maintain/car-maintain-list.component';
import { CarOfferInfoComponent } from './car-offer/car-offer-info.component';
import { CarOfferEditComponent } from './car-offer/car-offer-edit.component';
import { CarDriveComponent } from './car-drive/car-drive.component';
import { CarDriveEditComponent } from './car-drive/car-drive-edit.component';
import { CarRegisterEditComponent } from './car-register/car-register-edit.component';
import { CarRegisterListComponent } from './car-register/car-register-list.component';
import { CarViewDetailComponent } from './car-view-detail/car-view-detail.component';

@NgModule({
    imports: [
        commonDeclarationImports,
        CarMasterRoutingModule,
        CarMasterServiceProxyModule
    ],
    declarations: [
        // Chọn số xe
        NplateCarInputComponent,
        // Thông tin xe
        CarMasterEditComponent, CarMasterListComponent,
        // Thông tin bảo hiểm
        CarInsureEditComponent, CarInsureListComponent,
        // Thông tin phí đường bộ
        CarChargeEditComponent, CarChargeInfoComponent,
        // Thông tin sửa chữa
        CarOfferInfoComponent, CarOfferEditComponent,
        // Thông tin vận hành
        CarDriveComponent, CarDriveEditComponent,
        // Thông tin đăng kiểm
        CarRegisterListComponent, CarRegisterEditComponent,
        // Thông tin bảo dưỡng
        CarMaintainEditComponent, CarMaintainListComponent,
        // Chi tiết thông tin xe
        CarViewDetailComponent
    ],
    exports: [

    ],
    providers: [

    ]
})
export class CarMasterModule { }
