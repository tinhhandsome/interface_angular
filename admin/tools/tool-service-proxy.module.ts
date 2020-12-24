import { AbpHttpInterceptor } from '@abp/abpHttpInterceptor';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { NgModule } from '@angular/core';
import * as ApiServiceProxies from '../../../shared/service-proxies/service-proxies'

@NgModule({
    providers: [
        //Cập nhật giá trị
        ApiServiceProxies.AdjustPriceServiceProxy,
        //Hủy thanh lý
        ApiServiceProxies.LiquidCancelServiceProxy,
        //Xóa tài sản
        ApiServiceProxies.DeleteAssServiceProxy,
        // Xóa khấu hao / phân bổ
        ApiServiceProxies.DistributionDeleteListServiceProxy,
        // Cập nhật ngày 
        ApiServiceProxies.UpdateDateListServiceProxy,
        // Thực thi phân bổ
        ApiServiceProxies.DistributionExecuteListServiceProxy,
        //Xóa nhiều tài sản
        ApiServiceProxies.DeleteMultiAssServiceProxy,
        ApiServiceProxies.UltilityServiceProxy,
        { provide: HTTP_INTERCEPTORS, useClass: AbpHttpInterceptor, multi: true }
    ]
})
export class ToolServiceProxyModule { }
