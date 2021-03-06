import { NgModule } from '@angular/core';
import { commonDeclarationImports } from '../core/ultils/CommonDeclarationModule';
import { TradeRoutingModule } from './trade-routing.module';
import { TradeServiceProxyModule } from './trade-service-proxy.module';

import { TradeRequestDocListComponent } from './trade-request-doc/trade-request-doc-list.component';
import { TradeRequestDocEditComponent } from './trade-request-doc/trade-request-doc-edit.component';
import { BidMasterListComponent } from './bid-master/bid-master-list.component';
import { BidMasterEditComponent } from './bid-master/bid-master-edit.component';
import { ProjectEditComponent } from './project/project-edit.component';
import { ProjectListComponent } from './project/project-list.component';
import { TradePoMasterEditComponent } from './trade-po-master/trade-po-master-edit.component';
import { TradePoMasterListComponent } from './trade-po-master/trade-po-master-list.component';
import { TradeContractListComponent } from './trade-contract/trade-contract-list.component';
import { TradeContractEditComponent } from './trade-contract/trade-contract-edit.component';
import { PoPaymentEditableComponent } from './trade-po-master/po-payment-editable.component';
import { RoleNotificationEditableComponent } from './trade-po-master/role-notification-editable.component';
import { GoodsDetailEditableComponent } from './trade-po-master/goods-detail-editable.component';
import { TradePoUpdateListComponent } from './po-update/po-update-list.component';
import { TradePoUpdateEditComponent } from './po-update/po-update-edit.component';
import { TradePoCancelListComponent } from './trade-po-cancel/trade-po-cancel-list.component';
import { TradePoCancelEditComponent } from './trade-po-cancel/trade-po-cancel-edit.component';
import { RatTermMasterEditComponent } from './rat-term-master/rat-term-master-edit.component';
import { RatTermMasterListComponent } from './rat-term-master/rat-term-master-list.component';
import { RateSupEditComponent } from './rate-supplier-upd/rate-sup-edit.component';
import { RatSupReportStatus } from './rate-supplier-report-status/rate-supplier-report-status.component';
import { PoRepairGoodsDetailEditableComponent } from './trade-po-repair/po-repair-goods-detail-editable.component';
import { PoRepairPaymentEditableComponent } from './trade-po-repair/po-repair-payment-editable.component';
import { PoRepairRoleNotificationEditableComponent } from './trade-po-repair/po-repair-role-notification-editable.component';
import { TradePoRepairListComponent } from './trade-po-repair/trade-po-repair-list.component';
import { TradePoRepairEditComponent } from './trade-po-repair/trade-po-repair-edit.component';
import { RatSupCriteriaReport } from './rat-sup-criteria/rat-sup-criteria.component';

export const tradeComponents = [
    // Tờ trình
    TradeRequestDocListComponent, TradeRequestDocEditComponent,
    // Quản lý thầu
    BidMasterListComponent, BidMasterEditComponent,
    // Quản lý dự án
    ProjectListComponent, ProjectEditComponent,
    // Quản lý PO
    TradePoMasterListComponent, TradePoMasterEditComponent, GoodsDetailEditableComponent, PoPaymentEditableComponent, RoleNotificationEditableComponent,
    // Quản lý sửa chữa PO
    TradePoRepairListComponent, TradePoRepairEditComponent, PoRepairGoodsDetailEditableComponent, PoRepairPaymentEditableComponent, PoRepairRoleNotificationEditableComponent,
    // Quản lý hợp đồng
    TradeContractListComponent, TradeContractEditComponent,
    // Cập nhật nhận hàng
    TradePoUpdateListComponent, TradePoUpdateEditComponent,
    // Hủy PO
    TradePoCancelListComponent,TradePoCancelEditComponent,
    // Kỳ đánh giá nhà cung cấp
    RatTermMasterEditComponent,RatTermMasterListComponent,
    // Đánh giá nhà cung cấp
    RateSupEditComponent,
    // Báo cáo tình trạng đánh giá nhà cung cấp
    RatSupReportStatus,
    // Báo cáo đánh giá nhà cung cấp theo tiêu chí
    RatSupCriteriaReport
   
];

@NgModule({
    imports: [
        commonDeclarationImports,
        TradeRoutingModule,
        TradeServiceProxyModule
    ],
    declarations: tradeComponents,
    exports: [
    ],
    providers: [

    ]
})
export class TradeModule { }
