import { NgModule, ComponentFactoryResolver } from '@angular/core';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { TradeRequestDocListComponent } from './trade-request-doc/trade-request-doc-list.component';
import { TradeRequestDocEditComponent } from './trade-request-doc/trade-request-doc-edit.component';
import { EditPageState } from '@app/ultilities/enum/edit-page-state';
import { BidMasterListComponent } from './bid-master/bid-master-list.component';
import { BidMasterEditComponent } from './bid-master/bid-master-edit.component';
import { ProjectListComponent } from './project/project-list.component';
import { ProjectEditComponent } from './project/project-edit.component';
import { TradePoMasterEditComponent } from './trade-po-master/trade-po-master-edit.component';
import { TradePoMasterListComponent } from './trade-po-master/trade-po-master-list.component';
import { TradeContractListComponent } from './trade-contract/trade-contract-list.component';
import { TradeContractEditComponent } from './trade-contract/trade-contract-edit.component';
import { TradePoUpdateListComponent } from './po-update/po-update-list.component';
import { TradePoUpdateEditComponent } from './po-update/po-update-edit.component';
import { tradeComponents } from './trade.module';
import { TradePoCancelListComponent } from './trade-po-cancel/trade-po-cancel-list.component';
import { TradePoCancelEditComponent } from './trade-po-cancel/trade-po-cancel-edit.component';
import { RatTermMasterListComponent } from './rat-term-master/rat-term-master-list.component';
import { RatTermMasterEditComponent } from './rat-term-master/rat-term-master-edit.component';
import { RateSupEditComponent } from './rate-supplier-upd/rate-sup-edit.component';
import { RatSupReportStatus } from './rate-supplier-report-status/rate-supplier-report-status.component';
import { TradePoRepairListComponent } from './trade-po-repair/trade-po-repair-list.component';
import { TradePoRepairEditComponent } from './trade-po-repair/trade-po-repair-edit.component';
import { RatSupCriteriaReport } from './rat-sup-criteria/rat-sup-criteria.component';

var trades = tradeComponents;

@NgModule({
    imports: [
        RouterModule.forChild([
            {
                path: '',
                children: [
                    // Tờ trình
                    { path: 'trade-request-doc', component: TradeRequestDocListComponent, data: { permission: 'Pages.Administration.TradeRequestDoc' } },
                    { path: 'trade-request-doc-add', component: TradeRequestDocEditComponent, data: { permission: 'Pages.Administration.TradeRequestDoc.Create', editPageState: EditPageState.add } },
                    { path: 'trade-request-doc-edit', component: TradeRequestDocEditComponent, data: { permission: 'Pages.Administration.TradeRequestDoc.Edit', editPageState: EditPageState.edit } },
                    { path: 'trade-request-doc-view', component: TradeRequestDocEditComponent, data: { permission: 'Pages.Administration.TradeRequestDoc.View', editPageState: EditPageState.viewDetail } },

                    // Quản lý hồ sơ thầu
                    { path: 'bid-master', component: BidMasterListComponent, data: { permission: 'Pages.Administration.BidMaster' } },
                    { path: 'bid-master-add', component: BidMasterEditComponent, data: { permission: 'Pages.Administration.BidMaster.Create', editPageState: EditPageState.add } },
                    { path: 'bid-master-edit', component: BidMasterEditComponent, data: { permission: 'Pages.Administration.BidMaster.Edit', editPageState: EditPageState.edit } },
                    { path: 'bid-master-view', component: BidMasterEditComponent, data: { permission: 'Pages.Administration.BidMaster.View', editPageState: EditPageState.viewDetail } },

                    // Quản lý dự án
                    { path: 'trade-project', component: ProjectListComponent, data: { permission: 'Pages.Administration.TradeProject' } },
                    { path: 'trade-project-add', component: ProjectEditComponent, data: { permission: 'Pages.Administration.TradeProject.Create', editPageState: EditPageState.add } },
                    { path: 'trade-project-edit', component: ProjectEditComponent, data: { permission: 'Pages.Administration.TradeProject.Edit', editPageState: EditPageState.edit } },
                    { path: 'trade-project-view', component: ProjectEditComponent, data: { permission: 'Pages.Administration.TradeProject.View', editPageState: EditPageState.viewDetail } },

                    // Quản lý PO
                    { path: 'po-list', component: TradePoMasterListComponent, data: { permission: 'Pages.Administration.TradePoMaster' } },
                    { path: 'po-list-add', component: TradePoMasterEditComponent, data: { permission: 'Pages.Administration.TradePoMaster.Create', editPageState: EditPageState.add } },
                    { path: 'po-list-edit', component: TradePoMasterEditComponent, data: { permission: 'Pages.Administration.TradePoMaster.Edit', editPageState: EditPageState.edit } },
                    { path: 'po-list-view', component: TradePoMasterEditComponent, data: { permission: 'Pages.Administration.TradePoMaster.View', editPageState: EditPageState.viewDetail } },

                    // PO sửa chữa
                    { path: 'trade-po-repair', component: TradePoRepairListComponent, data: { permission: 'Pages.Administration.TradePoRepair' } },
                    { path: 'trade-po-repair-add', component: TradePoRepairEditComponent, data: { permission: 'Pages.Administration.TradePoRepair.Create', editPageState: EditPageState.add } },
                    { path: 'trade-po-repair-edit', component: TradePoRepairEditComponent, data: { permission: 'Pages.Administration.TradePoRepair.Edit', editPageState: EditPageState.edit } },
                    { path: 'trade-po-repair-view', component: TradePoRepairEditComponent, data: { permission: 'Pages.Administration.TradePoRepair.View', editPageState: EditPageState.viewDetail } },

                    // Quản lý hợp đồng
                    { path: 'trade-contract', component: TradeContractListComponent, data: { permission: 'Pages.Administration.TradeTRContractList' } },
                    { path: 'trade-contract-add', component: TradeContractEditComponent, data: { permission: 'Pages.Administration.TradeTRContractList.Create', editPageState: EditPageState.add } },
                    { path: 'trade-contract-edit', component: TradeContractEditComponent, data: { permission: 'Pages.Administration.TradeTRContractList.Edit', editPageState: EditPageState.edit } },
                    { path: 'trade-contract-view', component: TradeContractEditComponent, data: { permission: 'Pages.Administration.TradeTRContractList.View', editPageState: EditPageState.viewDetail } },

                    // Cập nhật nhận hàng
                    { path: 'trade-po-update', component: TradePoUpdateListComponent, data: { permission: 'Pages.Administration.TradePoUpdateList' } },
                    { path: 'trade-po-update-add', component: TradePoUpdateEditComponent, data: { permission: 'Pages.Administration.TradePoUpdateList.Create', editPageState: EditPageState.add } },
                    { path: 'trade-po-update-edit', component: TradePoUpdateEditComponent, data: { permission: 'Pages.Administration.TradePoUpdateList.Edit', editPageState: EditPageState.edit } },
                    { path: 'trade-po-update-view', component: TradePoUpdateEditComponent, data: { permission: 'Pages.Administration.TradePoUpdateList.View', editPageState: EditPageState.viewDetail } },

                    // Hủy PO
                    { path: 'trade-po-cancel', component: TradePoCancelListComponent, data: { permission: 'Pages.Administration.TradePoCancel' } },
                    { path: 'trade-po-cancel-add', component: TradePoCancelEditComponent, data: { permission: 'Pages.Administration.TradePoCancel.Create', editPageState: EditPageState.add } },
                    { path: 'trade-po-cancel-edit', component: TradePoCancelEditComponent, data: { permission: 'Pages.Administration.TradePoCancel.Edit', editPageState: EditPageState.edit } },
                    { path: 'trade-po-cancel-view', component: TradePoCancelEditComponent, data: { permission: 'Pages.Administration.TradePoCancel.View', editPageState: EditPageState.viewDetail } },

                    // Kỳ đánh giá nhà cung cấp
                    { path: 'rat-term-master', component: RatTermMasterListComponent, data: { permission: 'Pages.Administration.RatTermMaster' } },
                    { path: 'rat-term-master-add', component: RatTermMasterEditComponent, data: { permission: 'Pages.Administration.RatTermMaster.Create', editPageState: EditPageState.add } },
                    { path: 'rat-term-master-edit', component: RatTermMasterEditComponent, data: { permission: 'Pages.Administration.RatTermMaster.Edit', editPageState: EditPageState.edit } },
                    { path: 'rat-term-master-view', component: RatTermMasterEditComponent, data: { permission: 'Pages.Administration.RatTermMaster.View', editPageState: EditPageState.viewDetail } },

                    // Đánh giá nhà cung cấp
                    { path: 'rat-sup-edit', component: RateSupEditComponent, data: { permission: 'Pages.Administration.RateSupplierUpdateSupplierEdit' } },

                    // Đánh giá tình trạng đánh giá nhà cung cấp
                    { path: 'rat-report', component: RatSupReportStatus, data: { permission: 'Pages.Administration.RatReport' } },

                    // Báo cáo đánh giá nhà cung cấp theo tiêu chí
                    { path: 'rat-sup-criteria', component: RatSupCriteriaReport, data: { permission: 'Pages.Administration.RatSupCriteria' } },
                    // Hạn mục mua sắm
                ]
            }
        ])
    ],
    exports: [
        RouterModule
    ]
})
export class TradeRoutingModule {

    constructor(
        private router: Router,
        private componentFactoryResolver: ComponentFactoryResolver
    ) {
        router.events.subscribe((event) => {
            if (event instanceof NavigationEnd) {
                window.scroll(0, 0);
            }
        });

        // trades.forEach(element => {
        //     // Get its resolved factory
        //     const factory = this.componentFactoryResolver.resolveComponentFactory(element as any);

        //     console.log('Factory:', factory);
        //     console.log('Selector:', factory.selector);
        //   });
    }
}
