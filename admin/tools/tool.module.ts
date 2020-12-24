import { NgModule } from '@angular/core';
import { commonDeclarationImports } from '../core/ultils/CommonDeclarationModule';
import { ToolRoutingModule } from './tool-routing.module';
import { ToolServiceProxyModule } from './tool-service-proxy.module';
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
        ...commonDeclarationImports,
        ToolRoutingModule,
        ToolServiceProxyModule
    ],
    declarations: [
        //Cập nhật giá trị
        AdjustPriceListComponent, AdjustPriceEditComponent,
        //Hủy thanh lý
        CancelAssListComponent, CancelAssEditComponent,
        //Xóa tài sản
        DeleteAssListComponent, DeleteAssEditComponent,
        // Xóa khấu hao / phân bổ
        DistributionDeleteListComponent, DistributionDeleteEditComponent,
        // Cập nhật ngày
        UpdateDateListComponent, UpdateDateListEditComponent,
        // Thực thi phân bổ 
        DistributionExecuteListComponent, DistributionExecuteListEditComponent,
        //Xóa nhiều tài sản
        DeleteMultiAssListComponent,DeleteMultiAssEditComponent,
    ],
    exports: [

    ],
    providers: [

    ]
})
export class ToolModule { }
