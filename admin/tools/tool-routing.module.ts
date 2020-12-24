import { NgModule } from '@angular/core';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { EditPageState } from '@app/ultilities/enum/edit-page-state';
import { AdjustPriceListComponent } from './adjust-price/adjust-price-list.component';
import { AdjustPriceEditComponent } from './adjust-price/adjust-price-edit.component';
import { CancelAssListComponent } from './cancel-ass/cancel-ass-list.component';
import { CancelAssEditComponent } from './cancel-ass/cancel-ass-edit.component';
import { DeleteAssListComponent } from './delete-ass/delete-ass-list.component';
import { DeleteAssEditComponent } from './delete-ass/delete-ass-edit.component';
import { DistributionDeleteListComponent } from './distribution-delete-list/distribution-delete-list.component';
import { DistributionDeleteEditComponent } from './distribution-delete-list/distribution-delete-list-edit.component';
import { UpdateDateListComponent } from './update-date-list/update-date-list.component';
import { UpdateDateListEditComponent } from './update-date-list/update-date-list-edit.component';
import { DistributionExecuteListComponent } from './distribution-execute-list/distribution-execute-list.component';
import { DistributionExecuteListEditComponent } from './distribution-execute-list/distribution-execute-list-edit.component';
import { DeleteMultiAssListComponent } from './delete-multi-ass/delete-multi-ass-list.component';
import { DeleteMultiAssEditComponent } from './delete-multi-ass/delete-multi-ass-edit.component';
@NgModule({
    imports: [
        RouterModule.forChild([
            {
                path: '',
                children: [
                    //Cập nhật giá trị
                    { path: 'adjust-price-list', component: AdjustPriceListComponent, data: { permission: 'Pages.Administration.AdjustPriceList' } },
                    { path: 'adjust-price-list-add', component: AdjustPriceEditComponent, data: { permission: 'Pages.Administration.AdjustPriceList.Create', editPageState: EditPageState.add } },
                    { path: 'adjust-price-list-edit', component: AdjustPriceEditComponent, data: { permission: 'Pages.Administration.AdjustPriceList.Edit', editPageState: EditPageState.edit } },
                    { path: 'adjust-price-list-view', component: AdjustPriceEditComponent, data: { permission: 'Pages.Administration.AdjustPriceList.View', editPageState: EditPageState.viewDetail } },

                    //Hủy thanh lý
                    { path: 'cancel-ass', component: CancelAssListComponent, data: { permission: 'Pages.Administration.CancelAss' } },
                    { path: 'cancel-ass-add', component: CancelAssEditComponent, data: { permission: 'Pages.Administration.CancelAss.Create', editPageState: EditPageState.add } },
                    { path: 'cancel-ass-edit', component: CancelAssEditComponent, data: { permission: 'Pages.Administration.CancelAss.Edit', editPageState: EditPageState.edit } },
                    { path: 'cancel-ass-view', component: CancelAssEditComponent, data: { permission: 'Pages.Administration.CancelAss.View', editPageState: EditPageState.viewDetail } },

                    //Xóa tài sản
                    { path: 'delete-ass', component: DeleteAssListComponent, data: { permission: 'Pages.Administration.DeleteAss' } },
                    { path: 'delete-ass-add', component: DeleteAssEditComponent, data: { permission: 'Pages.Administration.DeleteAss.Create', editPageState: EditPageState.add } },
                    { path: 'delete-ass-edit', component: DeleteAssEditComponent, data: { permission: 'Pages.Administration.DeleteAss.Edit', editPageState: EditPageState.edit } },
                    { path: 'delete-ass-view', component: DeleteAssEditComponent, data: { permission: 'Pages.Administration.DeleteAss.View', editPageState: EditPageState.viewDetail } },

                    // Cập nhật danh sách xóa khấu hao / phân bổ
                    { path: 'distribution-delete-list', component: DistributionDeleteListComponent, data: { permission: 'Pages.Administration.ToolDistributionDeleteList' } },
                    { path: 'distribution-delete-list-add', component: DistributionDeleteEditComponent, data: { permission: 'Pages.Administration.ToolDistributionDeleteList.Create', editPageState: EditPageState.add } },
                    { path: 'distribution-delete-list-edit', component: DistributionDeleteEditComponent, data: { permission: 'Pages.Administration.ToolDistributionDeleteList.Edit', editPageState: EditPageState.edit } },
                    { path: 'distribution-delete-list-view', component: DistributionDeleteEditComponent, data: { permission: 'Pages.Administration.ToolDistributionDeleteList.View', editPageState: EditPageState.viewDetail } },

                    // Cập nhật ngày
                    { path: 'update-date-list', component: UpdateDateListComponent, data: { permission: 'Pages.Administration.ToolUpdateDayList' } },
                    { path: 'update-date-list-add', component: UpdateDateListEditComponent, data: { permission: 'Pages.Administration.ToolUpdateDayList.Create', editPageState: EditPageState.add } },
                    { path: 'update-date-list-edit', component: UpdateDateListEditComponent, data: { permission: 'Pages.Administration.ToolUpdateDayList.Edit', editPageState: EditPageState.edit } },
                    { path: 'update-date-list-view', component: UpdateDateListEditComponent, data: { permission: 'Pages.Administration.ToolUpdateDayList.View', editPageState: EditPageState.viewDetail } },

                    // Thực thi phân bổ
                    { path: 'distribution-execute-list', component: DistributionExecuteListComponent, data: { permission: 'Pages.Administration.ToolDistributionExecuteList' } },
                    { path: 'distribution-execute-list-add', component: DistributionExecuteListEditComponent, data: { permission: 'Pages.Administration.ToolDistributionExecuteList.Create', editPageState: EditPageState.add } },
                    { path: 'distribution-execute-list-edit', component: DistributionExecuteListEditComponent, data: { permission: 'Pages.Administration.ToolDistributionExecuteList.Edit', editPageState: EditPageState.edit } },
                    { path: 'distribution-execute-list-view', component: DistributionExecuteListEditComponent, data: { permission: 'Pages.Administration.ToolDistributionExecuteList.View', editPageState: EditPageState.viewDetail } },

                    //Xóa nhiều tài sản
                    { path: 'delete-multi-ass', component: DeleteMultiAssListComponent, data: { permission: 'Pages.Administration.DeleteMultiAss'} },
                    { path: 'delete-multi-ass-add', component: DeleteMultiAssEditComponent, data: { permission: 'Pages.Administration.DeleteMultiAss.Create', editPageState: EditPageState.add } },
                    { path: 'delete-multi-ass-edit', component: DeleteMultiAssEditComponent, data: { permission: 'Pages.Administration.DeleteMultiAss.Edit', editPageState: EditPageState.edit } },
                    { path: 'delete-multi-ass-view', component: DeleteMultiAssEditComponent, data: { permission: 'Pages.Administration.DeleteMultiAss.View', editPageState: EditPageState.viewDetail } },

                ]
            }
        ])
    ],
    exports: [
        RouterModule
    ]
})
export class ToolRoutingModule {

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
