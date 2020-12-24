import { NgModule } from '@angular/core';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { EditPageState } from '@app/ultilities/enum/edit-page-state';
import { AssTypeListComponent } from './ass-type/ass-type-list.component';
import { AssTypeEditComponent } from './ass-type/ass-type-edit.component';
import { AssGroupListComponent } from './ass-group/ass-group-list.component';
import { AssGroupEditComponent } from './ass-group/ass-group-edit.component';
import { AssAddNewListComponent } from './ass-add-new/ass-add-new-list.component';
import { AssAddNewEditComponent } from './ass-add-new/ass-add-new-edit.component';
import { AssUpdateListComponent } from './ass-update/ass-update-list.component';
import { AssUpdateEditComponent } from './ass-update/ass-update-edit.component';
import { AssTAddNewEditComponent } from './ass-t-add-new/ass-t-add-new-edit.component';
import { AssTAddNewListComponent } from './ass-t-add-new/ass-t-add-new-list.component';
import { AssTAddNewKTListComponent } from './ass-t-add-new-kt/ass-t-add-new-kt-list.component';
import { AssTAddNewKTEditComponent } from './ass-t-add-new-kt/ass-t-add-new-kt-edit.component';
import { AssWarehousingComponent } from './ass-warehousing/ass-warehousing.component';
import { AssDeliveryComponent } from './ass-delivery/ass-delivery.component';
import { AssUseMultiMasterListComponent } from './ass-use-multi-master/ass-use-multi-master-list.component';
import { AssUseMultiKtListComponent } from './ass-use-multi-kt/ass-use-multi-kt-list.component';
import { AssUseMultiMasterEditComponent } from './ass-use-multi-master/ass-use-multi-master-edit.component';
import { AssUseMultiKtEditComponent } from './ass-use-multi-kt/ass-use-multi-kt-edit.component';
import { AssMasterListComponent } from './ass-master/ass-master-list.component';
import { AssMasterEditComponent } from './ass-master/ass-master-edit.component';
import { AssAmortCCLDComponent } from './ass-amort-ccld/ass-amort-ccld.component';
import { EODComponent } from './eod/eod.component';
import { AssTransferMultiListComponent } from './ass-transfer-multi/ass-transfer-multi-list.component';
import { AssTransferMultiEditComponent } from './ass-transfer-multi/ass-transfer-multi-edit.component';
import { AssAmortPendListComponent } from './ass-amort-pend/ass-amort-pend-list.component';
import { AssAmortPendEditComponent } from './ass-amort-pend/ass-amort-pend-edit.component';
import { AssAmortComponent } from './ass-amort/ass-amort.component';
import { AssLiquidationListComponent } from './ass-liquidation/ass-liquidation-list.component';
import { AssLiquidationEditComponent } from './ass-liquidation/ass-liquidation-edit.component';
import { AssRepairMultiListComponent } from './ass-multi-repair/ass-multi-repair-list.component';
import { AssRepairMultiEditComponent } from './ass-multi-repair/ass-multi-repair-edit.component';
import { AssUpdateReportComponent } from './ass_update_report/ass-update-report.component';
import { AssCollectMultiListComponent } from './ass-collect-multi/ass-collect-multi-list.component';
import { AssCollectMultiEditComponent } from './ass-collect-multi/ass-collect-multi-edit.component';
import { AssInventoryListComponent } from './ass-inventory/ass-inventory-list.component';
import { AssInventoryEditComponent } from './ass-inventory/ass-inventory-edit.component';
import { AssLiqRequestListComponent } from './ass-liq-request/ass-liq-request-list.component';
import { AssLiqRequestEditComponent } from './ass-liq-request/ass-liq-request-edit.component';
import { AssAddChangeListComponent } from './ass-add-change/ass-add-change-list.component';
import { AssAddChangeEditComponent } from './ass-add-change/ass-add-change-edit.component';
import { AssPrintTempComponent } from './ass-print-temp/ass-print-temp.component';
import { AssUseMultiMasterFaListComponent } from './ass-use-multi-master-fa/ass-use-multi-master-fa-list.component';
import { AssUseMultiMasterFaEditComponent } from './ass-use-multi-master-fa/ass-use-multi-master-fa-edit.component';

@NgModule({
    imports: [
        RouterModule.forChild([
            {
                path: '',
                children: [
                    // Loại tài sản
                    { path: 'ass-type', component: AssTypeListComponent, data: { permission: 'Pages.Administration.AssType' } },
                    { path: 'ass-type-add', component: AssTypeEditComponent, data: { permission: 'Pages.Administration.AssType.Create', editPageState: EditPageState.add } },
                    { path: 'ass-type-edit', component: AssTypeEditComponent, data: { permission: 'Pages.Administration.AssType.Edit', editPageState: EditPageState.edit } },
                    { path: 'ass-type-view', component: AssTypeEditComponent, data: { permission: 'Pages.Administration.AssType.View', editPageState: EditPageState.viewDetail } },

                    // Nhóm tài sản
                    { path: 'ass-group', component: AssGroupListComponent, data: { permission: 'Pages.Administration.AssGroup' } },
                    { path: 'ass-group-add', component: AssGroupEditComponent, data: { permission: 'Pages.Administration.AssGroup.Create', editPageState: EditPageState.add } },
                    { path: 'ass-group-edit', component: AssGroupEditComponent, data: { permission: 'Pages.Administration.AssGroup.Edit', editPageState: EditPageState.edit } },
                    { path: 'ass-group-view', component: AssGroupEditComponent, data: { permission: 'Pages.Administration.AssGroup.View', editPageState: EditPageState.viewDetail } },

                    // Nhập mới tài sản cố định
                    { path: 'ass-add-new', component: AssAddNewListComponent, data: { permission: 'Pages.Administration.AssAddNew' } },
                    { path: 'ass-add-new-add', component: AssAddNewEditComponent, data: { permission: 'Pages.Administration.AssAddNew.Create', editPageState: EditPageState.add } },
                    { path: 'ass-add-new-edit', component: AssAddNewEditComponent, data: { permission: 'Pages.Administration.AssAddNew.Edit', editPageState: EditPageState.edit } },
                    { path: 'ass-add-new-view', component: AssAddNewEditComponent, data: { permission: 'Pages.Administration.AssAddNew.View', editPageState: EditPageState.viewDetail } },

                    // Nhập mới CCDC - HC
                    { path: 'ass-t-add-new', component: AssTAddNewListComponent, data: { permission: 'Pages.Administration.AssTAddNew' } },
                    { path: 'ass-t-add-new-add', component: AssTAddNewEditComponent, data: { permission: 'Pages.Administration.AssTAddNew.Create', editPageState: EditPageState.add } },
                    { path: 'ass-t-add-new-edit', component: AssTAddNewEditComponent, data: { permission: 'Pages.Administration.AssTAddNew.Edit', editPageState: EditPageState.edit } },
                    { path: 'ass-t-add-new-view', component: AssTAddNewEditComponent, data: { permission: 'Pages.Administration.AssTAddNew.View', editPageState: EditPageState.viewDetail } },

                    // Nhập mới CCDC - KT
                    { path: 'ass-t-add-new-kt', component: AssTAddNewKTListComponent, data: { permission: 'Pages.Administration.AssTAddNewKT' } },
                    { path: 'ass-t-add-new-kt-add', component: AssTAddNewKTEditComponent, data: { permission: 'Pages.Administration.AssTAddNewKT.Create', editPageState: EditPageState.add } },
                    { path: 'ass-t-add-new-kt-edit', component: AssTAddNewKTEditComponent, data: { permission: 'Pages.Administration.AssTAddNewKT.Edit', editPageState: EditPageState.edit } },
                    { path: 'ass-t-add-new-kt-view', component: AssTAddNewKTEditComponent, data: { permission: 'Pages.Administration.AssTAddNewKT.View', editPageState: EditPageState.viewDetail } },

                    // Cập nhật tài sản
                    { path: 'ass-update', component: AssUpdateListComponent, data: { permission: 'Pages.Administration.AssUpdate' } },
                    { path: 'ass-update-add', component: AssUpdateEditComponent, data: { permission: 'Pages.Administration.AssUpdate.Create', editPageState: EditPageState.add } },
                    { path: 'ass-update-edit', component: AssUpdateEditComponent, data: { permission: 'Pages.Administration.AssUpdate.Edit', editPageState: EditPageState.edit } },
                    { path: 'ass-update-view', component: AssUpdateEditComponent, data: { permission: 'Pages.Administration.AssUpdate.View', editPageState: EditPageState.viewDetail } },

                    // Phiếu nhập kho
                    { path: 'ass-warehousing', component: AssWarehousingComponent, data: { permission: 'Pages.Administration.AssWarehousing' } },

                    // Phiếu xuất kho
                    { path: 'ass-delivery', component: AssDeliveryComponent, data: { permission: 'Pages.Administration.AssDelivery' } },

                    // Xuất sử dụng nhiều CCDC - HC 
                    { path: 'ass-use-multi-master', component: AssUseMultiMasterListComponent, data: { permission: 'Pages.Administration.AssUseMultiMaster' } },
                    { path: 'ass-use-multi-master-add', component: AssUseMultiMasterEditComponent, data: { permission: 'Pages.Administration.AssUseMultiMaster.Create', editPageState: EditPageState.add } },
                    { path: 'ass-use-multi-master-edit', component: AssUseMultiMasterEditComponent, data: { permission: 'Pages.Administration.AssUseMultiMaster.Edit', editPageState: EditPageState.edit } },
                    { path: 'ass-use-multi-master-view', component: AssUseMultiMasterEditComponent, data: { permission: 'Pages.Administration.AssUseMultiMaster.View', editPageState: EditPageState.viewDetail } },

                    // Xuất sử dụng nhiều CCDC – KT
                    { path: 'ass-use-multi-kt', component: AssUseMultiKtListComponent, data: { permission: 'Pages.Administration.AssUseMultiKt' } },
                    { path: 'ass-use-multi-kt-edit', component: AssUseMultiKtEditComponent, data: { permission: 'Pages.Administration.AssUseMultiKt.Edit', editPageState: EditPageState.edit } },
                    { path: 'ass-use-multi-kt-view', component: AssUseMultiKtEditComponent, data: { permission: 'Pages.Administration.AssUseMultiKt.View', editPageState: EditPageState.viewDetail } },

                    // Thông tin tài sản
                    { path: 'ass-master', component: AssMasterListComponent },
                    { path: 'ass-master-view', component: AssMasterEditComponent, data: { permission: 'Pages.Administration.AssMaster.View', editPageState: EditPageState.viewDetail } },

                    // Phân bổ chi phí công cụ lao động
                    { path: 'ass-amort-ccld', component: AssAmortCCLDComponent, data: { permission: 'Pages.Administration.ASSAmortCCLD' } },

                    // Hạch toán cuối ngày
                    { path: 'eod', component: EODComponent, data: { permission: 'Pages.Administration.EOD' } },

                    // Điều chuyển nhiều tài sản
                    { path: 'ass-transfer-multi', component: AssTransferMultiListComponent, data: { permission: 'Pages.Administration.AssTransferMulti' } },
                    { path: 'ass-transfer-multi-add', component: AssTransferMultiEditComponent, data: { permission: 'Pages.Administration.AssTransferMulti.Create', editPageState: EditPageState.add } },
                    { path: 'ass-transfer-multi-edit', component: AssTransferMultiEditComponent, data: { permission: 'Pages.Administration.AssTransferMulti.Edit', editPageState: EditPageState.edit } },
                    { path: 'ass-transfer-multi-view', component: AssTransferMultiEditComponent, data: { permission: 'Pages.Administration.AssTransferMulti.View', editPageState: EditPageState.viewDetail } },

                    // Thanh lý tài sản
                    { path: 'ass-liquidation', component: AssLiquidationListComponent, data: { permission: 'Pages.Administration.AssLiquidation' } },
                    { path: 'ass-liquidation-add', component: AssLiquidationEditComponent, data: { permission: 'Pages.Administration.AssLiquidation.Create', editPageState: EditPageState.add } },
                    { path: 'ass-liquidation-edit', component: AssLiquidationEditComponent, data: { permission: 'Pages.Administration.AssLiquidation.Edit', editPageState: EditPageState.edit } },
                    { path: 'ass-liquidation-view', component: AssLiquidationEditComponent, data: { permission: 'Pages.Administration.AssLiquidation.View', editPageState: EditPageState.viewDetail } },

                    // Khấu hao tài sản
                    { path: 'ass-amort', component: AssAmortComponent, data: { permission: 'Pages.Administration.AssAmort' } },

                    // Ngưng khấu hao
                    { path: 'ass-amort-pend', component: AssAmortPendListComponent, data: { permission: 'Pages.Administration.AssetManagerASSAmortPendList' } },
                    { path: 'ass-amort-pend-add', component: AssAmortPendEditComponent, data: { permission: 'Pages.Administration.AssetManagerASSAmortPendList.Create', editPageState: EditPageState.add } },
                    { path: 'ass-amort-pend-edit', component: AssAmortPendEditComponent, data: { permission: 'Pages.Administration.AssetManagerASSAmortPendList.Edit', editPageState: EditPageState.edit } },
                    { path: 'ass-amort-pend-view', component: AssAmortPendEditComponent, data: { permission: 'Pages.Administration.AssetManagerASSAmortPendList.View', editPageState: EditPageState.viewDetail } },

                    // Chỉnh sửa nhiều tài sản
                    { path: 'ass-repair-multi', component: AssRepairMultiListComponent, data: { permission: 'Pages.Administration.AssRepairMulti' } },
                    { path: 'ass-repair-multi-add', component: AssRepairMultiEditComponent, data: { permission: 'Pages.Administration.AssRepairMulti.Create', editPageState: EditPageState.add } },
                    { path: 'ass-repair-multi-edit', component: AssRepairMultiEditComponent, data: { permission: 'Pages.Administration.AssRepairMulti.Edit', editPageState: EditPageState.edit } },
                    { path: 'ass-repair-multi-view', component: AssRepairMultiEditComponent, data: { permission: 'Pages.Administration.AssRepairMulti.View', editPageState: EditPageState.viewDetail } },

                    // Cập nhật in phiếu nhập xuất kho
                    { path: 'ass-update-report', component: AssUpdateReportComponent, data: { permission: 'Pages.Administration.AssUpdateReport' } },

                    // Thu hồi nhiều tài sản
                    { path: 'ass-collect-multi', component: AssCollectMultiListComponent, data: { permission: 'Pages.Administration.AssCollectMulti' } },
                    { path: 'ass-collect-multi-add', component: AssCollectMultiEditComponent, data: { permission: 'Pages.Administration.AssCollectMulti.Create', editPageState: EditPageState.add } },
                    { path: 'ass-collect-multi-edit', component: AssCollectMultiEditComponent, data: { permission: 'Pages.Administration.AssCollectMulti.Edit', editPageState: EditPageState.edit } },
                    { path: 'ass-collect-multi-view', component: AssCollectMultiEditComponent, data: { permission: 'Pages.Administration.AssCollectMulti.View', editPageState: EditPageState.viewDetail } },

                    // Kiểm kê tài sản
                    { path: 'ass-inventory', component: AssInventoryListComponent, data: { permission: 'Pages.Administration.AssInventory' } },
                    { path: 'ass-inventory-add', component: AssInventoryEditComponent, data: { permission: 'Pages.Administration.AssInventory.Create', editPageState: EditPageState.add } },
                    { path: 'ass-inventory-edit', component: AssInventoryEditComponent, data: { permission: 'Pages.Administration.AssInventory.Edit', editPageState: EditPageState.edit } },
                    { path: 'ass-inventory-view', component: AssInventoryEditComponent, data: { permission: 'Pages.Administration.AssInventory.View', editPageState: EditPageState.viewDetail } },

                    // Đề xuất thanh lý tài sản
                    { path: 'ass-liq-request', component: AssLiqRequestListComponent },
                    { path: 'ass-liq-request-add', component: AssLiqRequestEditComponent, data: { permission: 'Pages.Administration.AssLiqRequest.Create', editPageState: EditPageState.add } },
                    { path: 'ass-liq-request-edit', component: AssLiqRequestEditComponent, data: { permission: 'Pages.Administration.AssLiqRequest.Edit', editPageState: EditPageState.edit } },
                    { path: 'ass-liq-request-view', component: AssLiqRequestEditComponent, data: { permission: 'Pages.Administration.AssLiqRequest.View', editPageState: EditPageState.viewDetail } },

                    //Nhập mới điều chỉnh tài sản
                    { path: 'ass-add-change', component: AssAddChangeListComponent, data: { permission: 'Pages.Administration.AssAddChange' } },
                    { path: 'ass-add-change-add', component: AssAddChangeEditComponent, data: { permission: 'Pages.Administration.AssAddChange.Create', editPageState: EditPageState.add } },
                    { path: 'ass-add-change-edit', component: AssAddChangeEditComponent, data: { permission: 'Pages.Administration.AssAddChange.Edit', editPageState: EditPageState.edit } },
                    { path: 'ass-add-change-view', component: AssAddChangeEditComponent, data: { permission: 'Pages.Administration.AssAddChange.View', editPageState: EditPageState.viewDetail } },

                    // In nhãn
                    { path: 'ass-print-temp', component: AssPrintTempComponent, data: { permission: 'Pages.Administration.AssPrintTemp' } },

                     // Xuất nhiều TSCD
                     { path: 'ass-use-multi-master-fa', component: AssUseMultiMasterFaListComponent, data: { permission: 'Pages.Administration.AssUseMultiMasterFa' } },
                     { path: 'ass-use-multi-master-fa-add', component: AssUseMultiMasterFaEditComponent, data: { permission: 'Pages.Administration.AssUseMultiMasterFa.Create', editPageState: EditPageState.add } },
                     { path: 'ass-use-multi-master-fa-edit', component: AssUseMultiMasterFaEditComponent, data: { permission: 'Pages.Administration.AssUseMultiMasterFa.Edit', editPageState: EditPageState.edit } },
                     { path: 'ass-use-multi-master-fa-view', component: AssUseMultiMasterFaEditComponent, data: { permission: 'Pages.Administration.AssUseMultiMasterFa.View', editPageState: EditPageState.viewDetail } },

                ]
            }
        ])
    ],
    exports: [
        RouterModule
    ]
})
export class AssMasterRoutingModule {

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
