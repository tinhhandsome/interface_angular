import { AbpHttpInterceptor } from '@abp/abpHttpInterceptor';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { NgModule } from '@angular/core';
import * as ApiServiceProxies from '../../../shared/service-proxies/service-proxies'

@NgModule({
    providers: [
        // Thông tin xe
        ApiServiceProxies.CarMasterServiceProxy,
        // Thông tin bảo hiểm
        ApiServiceProxies.CarInsureServiceProxy,
        // Thông tin phí đường bộ
        ApiServiceProxies.CarChargeServiceProxy,
        // Thông tin bảo dưỡng
        ApiServiceProxies.CarMaintainServiceProxy,
        // Thông tin sửa chữa
        ApiServiceProxies.CarOfferServiceProxy,
        // Thông tin vận hành
        ApiServiceProxies.CarDriveServiceProxy,
        // Chi tiết thông tin xe
        ApiServiceProxies.CarViewDetailServiceProxy,
        // Thông tin đăng kiểm
        ApiServiceProxies.CarRegisterServiceProxy,

        { provide: HTTP_INTERCEPTORS, useClass: AbpHttpInterceptor, multi: true }
    ]
})
export class CarMasterServiceProxyModule { }
