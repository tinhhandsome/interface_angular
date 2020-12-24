import { AbpHttpInterceptor } from '@abp/abpHttpInterceptor';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { NgModule } from '@angular/core';
import * as ApiServiceProxies from '../../../shared/service-proxies/service-proxies'

@NgModule({
    providers: [
        // Tờ trình
        ApiServiceProxies.TradeRequestDocServiceProxy,
        // Quản lý thầu
        ApiServiceProxies.BidMasterServiceProxy,
        // Quản lý dự án
        ApiServiceProxies.ProjectServiceProxy,
        // Quản lý POf
        ApiServiceProxies.TradePoMasterServiceProxy,
        // Po sửa chữa
        ApiServiceProxies.TradePoRepairServiceProxy,
        // Quản lý hợp đồng
        ApiServiceProxies.TradeContractServiceProxy,
        // Cập nhật nhận hàng
        ApiServiceProxies.TradePoUpServiceProxy,
        // Hủy PO
        ApiServiceProxies.TradePoCancelServiceProxy,
        // Kỳ đánh giá nhà cung cấp
        ApiServiceProxies.RatTermMasterServiceProxy,
        // Đánh giá nhà cung cấp
        ApiServiceProxies.RateSupplierServiceProxy,

        ApiServiceProxies.CategoryTradeServiceProxy,
        ApiServiceProxies.PlMasterServiceProxy,

       { provide: HTTP_INTERCEPTORS, useClass: AbpHttpInterceptor, multi: true }
    ]
})
export class TradeServiceProxyModule { }
