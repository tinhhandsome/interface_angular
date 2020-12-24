import { AbpHttpInterceptor } from '@abp/abpHttpInterceptor';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { NgModule } from '@angular/core';
import * as ApiServiceProxies from '../../../shared/service-proxies/service-proxies'

@NgModule({
    providers: [
        // Loại tài sản
        ApiServiceProxies.AssTypeServiceProxy,
        // Nhóm tài sản
        ApiServiceProxies.AssGroupServiceProxy,
        // Thông tin tài sản
        ApiServiceProxies.AssMasterServiceProxy,
        // Nhập mới tài sản cố định & Nhập mới CCDC - HC
        ApiServiceProxies.AssAddNewServiceProxy,
        // Cập nhật tài sản
        ApiServiceProxies.AssUpdateServiceProxy,
        // Trạng thái khấu hao tài sản
        ApiServiceProxies.AssAmortStatusServiceProxy,
        // Tình trạng tài sản
        ApiServiceProxies.AssStatusServiceProxy,
        // Công trình xây dựng cơ bản
        // Xuất sử dụng nhiều CCDC - HC
        ApiServiceProxies.AssUseMultiMasterServiceProxy,
        // Hạch toán cuối ngày
        ApiServiceProxies.EODLogServiceProxy,

        ApiServiceProxies.AssEntriesPostServiceProxy,
        // Phân bổ chi phí công cụ lao động
        ApiServiceProxies.AssAmortCCLDServiceProxy,
        // Điều chuyển nhiều tài sản
        ApiServiceProxies.AssTransferMultiServiceProxy,
        // Ngưng khấu hao
        ApiServiceProxies.AssAmortPendServiceProxy,
        // Khấu hao tài sản
        ApiServiceProxies.AssAmortServiceProxy,
        // Thanh lý tài sản
        ApiServiceProxies.AssLiquidationServiceProxy,
        // Chỉnh sửa nhiều tài sản
        ApiServiceProxies.AssRepairMultiMasterServiceProxy,
        // Cập nhật in phiếu nhập xuất kho
        ApiServiceProxies.AssUpdateReportServiceProxy,
        // Thu hồi nhiều tài sản
        ApiServiceProxies.AssCollectMultiServiceProxy,
        // Thu hồi nhiều tài sản
        ApiServiceProxies.AssInventoryServiceProxy,
        // Đề xuất thanh lý tài sản
        ApiServiceProxies.AssLiqRequestServiceProxy,

       { provide: HTTP_INTERCEPTORS, useClass: AbpHttpInterceptor, multi: true }
    ]
})
export class AssMasterServiceProxyModule { }
