import { NgModule } from '@angular/core';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { NplateCarInputComponent } from './nplate-car-input/nplate-car-input.component';
import { CarMasterListComponent } from './car-master/car-master-list.component';
import { CarMasterEditComponent } from './car-master/car-master-edit.component';
import { EditPageState } from '@app/ultilities/enum/edit-page-state';
import { CarInsureListComponent } from './car-insure/car-insure-list.component';
import { CarInsureEditComponent } from './car-insure/car-insure-edit.component';
import { CarChargeInfoComponent } from './car-charge/car-charge-info.component';
import { CarChargeEditComponent } from './car-charge/car-charge-edit.component';
import { CarMaintainListComponent } from './car-maintain/car-maintain-list.component';
import { CarMaintainEditComponent } from './car-maintain/car-maintain-edit.component';
import { CarOfferInfoComponent } from './car-offer/car-offer-info.component';
import { CarOfferEditComponent } from './car-offer/car-offer-edit.component';
import { CarDriveComponent } from './car-drive/car-drive.component';
import { CarDriveEditComponent } from './car-drive/car-drive-edit.component';
import { CarViewDetailComponent } from './car-view-detail/car-view-detail.component';
import { CarRegisterListComponent } from './car-register/car-register-list.component';
import { CarRegisterEditComponent } from './car-register/car-register-edit.component';


@NgModule({
    imports: [
        RouterModule.forChild([
            {
                path: '',
                children: [
                    // Thông tin xe
                    { path: 'car-master-dialog', component: NplateCarInputComponent },
                    { path: 'car-master', component: CarMasterListComponent, data: { permission: 'Pages.Administration.CarMaster' } },
                    { path: 'car-master-add', component: CarMasterEditComponent, data: { permission: 'Pages.Administration.CarMaster.Create', editPageState: EditPageState.add } },
                    { path: 'car-master-edit', component: CarMasterEditComponent, data: { permission: 'Pages.Administration.CarMaster.Edit', editPageState: EditPageState.edit } },
                    { path: 'car-master-view', component: CarMasterEditComponent, data: { permission: 'Pages.Administration.CarMaster.View', editPageState: EditPageState.viewDetail } },

                    // Thông tin bảo hiểm
                    { path: 'car-insure', component: CarInsureListComponent, data: { permission: 'Pages.Administration.CarInsure' } },
                    { path: 'car-insure-add', component: CarInsureEditComponent, data: { permission: 'Pages.Administration.CarInsure.Create', editPageState: EditPageState.add } },
                    { path: 'car-insure-edit', component: CarInsureEditComponent, data: { permission: 'Pages.Administration.CarInsure.Edit', editPageState: EditPageState.edit } },
                    { path: 'car-insure-view', component: CarInsureEditComponent, data: { permission: 'Pages.Administration.CarInsure.View', editPageState: EditPageState.viewDetail } },

                    // Thông tin phí đường bộ
                    { path: 'car-charge', component: CarChargeInfoComponent, data: { permission: 'Pages.Administration.CarCharge' } },
                    { path: 'car-charge-add', component: CarChargeEditComponent, data: { permission: 'Pages.Administration.CarCharge.Create', editPageState: EditPageState.add } },
                    { path: 'car-charge-edit', component: CarChargeEditComponent, data: { permission: 'Pages.Administration.CarCharge.Edit', editPageState: EditPageState.edit } },
                    { path: 'car-charge-view', component: CarChargeEditComponent, data: { permission: 'Pages.Administration.CarCharge.View', editPageState: EditPageState.viewDetail } },

                    // Thông tin bảo dưỡng
                    { path: 'carmaintain', component: CarMaintainListComponent, data: { permission: 'Pages.Administration.CarMaintain' } },
                    { path: 'carmaintain-add', component: CarMaintainEditComponent, data: { permission: 'Pages.Administration.CarMaintain.Create', editPageState: EditPageState.add } },
                    { path: 'carmaintain-edit', component: CarMaintainEditComponent, data: { permission: 'Pages.Administration.CarMaintain.Edit', editPageState: EditPageState.edit } },
                    { path: 'carmaintain-view', component: CarMaintainEditComponent, data: { permission: 'Pages.Administration.CarMaintain.View', editPageState: EditPageState.viewDetail } },

                    // Thông tin sửa chữa
                    { path: 'car-offer', component: CarOfferInfoComponent, data: { permission: 'Pages.Administration.CarOffer' } },
                    { path: 'car-offer-add', component: CarOfferEditComponent, data: { permission: 'Pages.Administration.CarOffer.Create', editPageState: EditPageState.add } },
                    { path: 'car-offer-edit', component: CarOfferEditComponent, data: { permission: 'Pages.Administration.CarOffer.Edit', editPageState: EditPageState.edit } },
                    { path: 'car-offer-view', component: CarOfferEditComponent, data: { permission: 'Pages.Administration.CarOffer.View', editPageState: EditPageState.viewDetail } },

                    // Thông tin vận hành
                    { path: 'car-drive', component: CarDriveComponent, data: { permission: 'Pages.Administration.CarDrive' } },
                    { path: 'car-drive-add', component: CarDriveEditComponent, data: { permission: 'Pages.Administration.CarDrive.Create', editPageState: EditPageState.add } },
                    { path: 'car-drive-edit', component: CarDriveEditComponent, data: { permission: 'Pages.Administration.CarDrive.Edit', editPageState: EditPageState.edit } },
                    { path: 'car-drive-view', component: CarDriveEditComponent, data: { permission: 'Pages.Administration.CarDrive.View', editPageState: EditPageState.viewDetail } },

                    // Thông tin đăng kiểm
                    { path: 'car-register', component: CarRegisterListComponent, data: { permission: 'Pages.Administration.CarRegister' } },
                    { path: 'car-register-add', component: CarRegisterEditComponent, data: { permission: 'Pages.Administration.CarRegister.Create', editPageState: EditPageState.add } },
                    { path: 'car-register-edit', component: CarRegisterEditComponent, data: { permission: 'Pages.Administration.CarRegister.Edit', editPageState: EditPageState.edit } },
                    { path: 'car-register-view', component: CarRegisterEditComponent, data: { permission: 'Pages.Administration.CarRegister.View', editPageState: EditPageState.viewDetail } },

                    // Chi tiết thông tin xe
                    { path: 'car-view-detail', component: CarViewDetailComponent, data: { permission: 'Pages.Administration.CarViewDetail' } },

                ]
            }
        ])
    ],
    exports: [
        RouterModule
    ]
})
export class CarMasterRoutingModule {

    constructor(
        private router: Router
    ) {
        router.events.subscribe((event) => {
            if (event instanceof NavigationEnd) {
                window.scroll(0, 0);
            }
        });
    }
}
