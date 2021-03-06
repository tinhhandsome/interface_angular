import { NgModule } from '@angular/core';
import { commonDeclarationImports } from '../core/ultils/CommonDeclarationModule';
import { ReportRoutingModule } from './report-routing.module';
import { ReportServiceProxyModule } from './report-service-proxy.module';
import { AssListWorkComponent } from './ass-list-work/ass-list-work.component';
import { PlPoRepairComponent } from './pl-po-repair/pl-po-repair.component';
import { AssSyntheticComponent } from './ass-synthetic/ass-synthetic.component';
import { CCLDBc08_2Component } from './ccld-bc08-2/ccld-bc08-2.component';
import { CCLDBc08_1Component } from './ccld-bc08-1/ccld-bc08-1.component';
import { CCLDBc08_3Component } from './ccld-bc08-3/ccld-bc08-3.component';
import { CommonCollectListComponent } from './common-collect/common-collect-list.component';
import { HistoryCollectAssetListComponent } from './history-collect-asset/history-collect-asset-list.component';
import { HistoryTransferListComponent } from './history-transfer/history-transfer-list.component';
import { ReListBranchComponent } from './re-list-branch/re-list-branch.component';
import { CarBc04Component } from './car-maintain-schedule/car-bc04.component';
import { CarListSysDetailComponent } from './car-list-sys-detail/car-list-sys-detail.component';
import { CARBC06Component } from './car-bc06/car-bc06.component';
import { RatSupplierReportComponent } from './rat-supplier-report/rat-supplier-report.component';
import { AssListAssetLiquidComponent } from './ass-list-asset-liquid/ass-list-asset-liquid.component';
import { PlRepairComponent } from './pl-repair/pl-repair.component';
import { PlPoComponent } from './pl-po/pl-po.component';
import { PLBuyAssetOutPlanComponent } from './pl-buy-asset-out-plan/pl-buy-asset-out-plan.component';
import { PlPoContractComponent } from './pl-po-contract/pl-po-contract.component';
import { CCLDBc08_4Component } from './ccld-bc08-4/ccld-bc08-4.component';
import { CCLDBc08_5Component } from './ccld-bc08-5/ccld-bc08-5.component';
import { CCLDBc08_6Component } from './ccld-bc08-6/ccld-bc08-6.component';
import { CCLDBc08_7Component } from './ccld-bc08-7/ccld-bc08-7.component';
import { PlKHBC07Component } from './pl-kh-bc-07/pl-kh-bc-07.component';
import { CarListSystemComponent } from './car-list-sys/car-list-sys.component';
import { CarBc05Component } from './car-bc05/car-bc05.component';
import { CarBc07Component } from './car-bc07/car-bc07.component';
import { CarListSysRateComponent } from './car-list-sys-rate/car-list-sys-rate.component';
import { AssListBranchInventory } from './ass-list-branch-inventory/ass-list-branch-inventory.component';
import { ReStatusNotCompleteComponent } from './re-status-not-complete/re-status-not-complete.component';
import { ReStatusNotUseComponent } from './re-status-not-use/re-status-not-use.component';
import { ReStatusUseComponent } from './re-status-use/re-status-use.component';
import { ReSystemListComponent } from './re-system-list/re-system-list.component';
import { StatementAssetsComponent } from './statement-assets/statement-assets.component';
import { AssListAssetInventory } from './ass-list-asset-inventory/ass-list-asset-inventory.component';
import { AssListAssetThuaThieuSaoKe } from './ass-list-asset-thua-thieu-saoke/ass-list-asset-thua-thieu-saoke.component';
import { AssSaoKeTSCDDetailComponent } from './ass-saoke-TSCD-detail/ass-saoke-TSCD-detail.component';
import { AssListAllAssetComponent } from './ass-list-all-asset/ass-list-all-asset.component';
import { AssetListOverViewAssetComponent } from './asset-list-over-view-asset/asset-list-over-view-asset.component';
import { AssetListOverViewAssetMainComponent } from './asset-list-over-view-asset-main/asset-list-over-view-asset-main.component';
import { AssListOverViewPOConstructionAssetFixComponent } from './ass-list-over-view-PO-construction-asset-fix/ass-list-over-view-PO-construction-asset-fix.component';
import { AssListLiquidAssetComponent } from './ass-list-liquid-asset/ass-list-liquid-asset.component';
import { AssListAssetGrowComponent } from './ass-list-asset-grow/ass-list-asset-grow.component';
import { CARBC09Component } from './car-bc09/car-bc09.component';
import { CarListDriveComponent } from './car-list-drive/car-list-drive.component';
import { BcConRequestComponent } from './rpt-con-request/rpt-con-request.component';
import { ReBudRegisterComponent } from './re-bud-register/re-bud-register.component';
import { BcConPaymentDetailComponent } from './rpt-con-payment-detail/rpt-con-payment-detail.component';
import { BcConRequestDocComponent } from './rpt-con-request-doc/rpt-con-request-doc.component';
import { HCQTStorageAsset as HCQTStorageAssetComponent } from './hcqt-bc01/hcqt-bc01.component';
import { PlOverallComponent } from './pl-overall/pl-overall.component';
@NgModule({
    imports: [
        commonDeclarationImports,
        ReportRoutingModule,
        ReportServiceProxyModule
    ],
    declarations: [
        // Danh sách CCLD tại đơn vị
        AssListWorkComponent,
        // Báo cáo tổng hợp TSCĐ
        AssSyntheticComponent,
        // Báo cáo PO sửa chữa
        PlPoRepairComponent,
        // Sao kê CCLD đang sử dụng
        CCLDBc08_1Component,
        // BC Chi tiết Nhập -Xuất - Tồn CCLD
        CCLDBc08_2Component,
        // DM CCLD Tồn kho
        CCLDBc08_3Component,
        // Báo cáo danh mục thu hồi vào kho
        CommonCollectListComponent,
        // Báo cáo lịch sử thu hồi tài sản
        HistoryCollectAssetListComponent,
        // Báo cáo lịch sử điều chuyển tài sản
        HistoryTransferListComponent,
        // Danh sách CN, PGD thuộc NH
        ReListBranchComponent,
        //Danh sách xe đến lịch bảo trì bảo dưỡng
        CarBc04Component,
        //Tổng hợp loại xe toàn hệ thống
        CarListSysDetailComponent,
        //Danh sách xe đến hạn đóng phí đường bộ
        CARBC06Component,
        // Báo cáo đánh giá nhà cung cấp
        RatSupplierReportComponent,
        // Tổng hợp TS đề xuất thanh lý
        AssListAssetLiquidComponent,
        // Kế hoạch sửa chữa
        PlRepairComponent,
        // Báo cáo PO
        PlPoComponent,
        // Báo cáo tổng thể kế hoạch
        PlOverallComponent,
        // Tờ trình mua sắm TSCĐ / CCLD ngoài kế hoạch
        PLBuyAssetOutPlanComponent,
        // Gọi hàng và thanh toán theo hợp đồng
        PlPoContractComponent,
        // Danh sách công cụ lao động nhập kho
        CCLDBc08_4Component,
        // Danh sách công cụ lao động xuất sử dụng
        CCLDBc08_5Component,
        // Chi phí CCLĐ phát sinh TN...ĐN
        CCLDBc08_6Component,
        // BC CP CCLD PS theo tháng
        CCLDBc08_7Component,
        // In phiếu đề xuất gọi hàng
        PlKHBC07Component,
        // Tổng hợp xe toàn hệ thống
        CarListSystemComponent,
        // DS xe đến bảo hiểm trong tháng
        CarBc05Component,
        // DS xe đến hạn thanh lý
        CarBc07Component,
        // Xe toàn hệ thống theo khu vực
        CarListSysRateComponent,
        // Tình hình kiểm kê
        AssListBranchInventory,
        // BC BĐS chưa hoàn thành pháp lý
        ReStatusNotCompleteComponent,
        // Báo cáo BĐS chưa sử dụng
        ReStatusNotUseComponent,
        // Báo cáo BĐS đã sử dụng
        ReStatusUseComponent,
        // Danh mục BĐS toàn hệ thống
        ReSystemListComponent,
        // 6.3 Sao kê TSCĐ từ ngày...đến...
        StatementAssetsComponent,
        // Tổng hợp kiểm kê tài sản
        AssListAssetInventory,
        // DSTS thừa thiếu so với sao kê
        AssListAssetThuaThieuSaoKe,
        // Sao kê TSCD đến ngày
        AssSaoKeTSCDDetailComponent,
        // Danh mục tài sản
        AssListAllAssetComponent,
        // Tổng hợp tăng giảm TSCĐ
        AssetListOverViewAssetComponent,
        // Tổng thể tăng giảm tài sản
        AssetListOverViewAssetMainComponent,
        // Mua sắm TSCĐ, CT, SC, TS
        AssListOverViewPOConstructionAssetFixComponent,
        // Danh mục tài sản thanh lý
        AssListLiquidAssetComponent,
        // Danh mục tài sản tăng thêm
        AssListAssetGrowComponent,
        // BC DS xe đi đăng kiểm
        CARBC09Component,
        // Báo cáo chi phí vận hành xe
        CarListDriveComponent,
        // Báo cáo tổng hợp tiến độ thanh toán
        BcConRequestComponent,
        // Báo cáo tình hình khai thác trụ sở
        ReBudRegisterComponent,
        // Báo cáo theo dõi ngân sách
        BcConRequestDocComponent,
        BcConPaymentDetailComponent,

        // Báo cáo Lịch sử Tài sản nhập kho P.HCQT

        // Báo cáo Lịch sử Tài sản xuất kho P.HCQT

        // Báo cáo Danh mục Tài sản lưu kho P.HCQT 
        HCQTStorageAssetComponent
    ],
    exports: [

    ],
    providers: [

    ]
})
export class ReportModule { }
