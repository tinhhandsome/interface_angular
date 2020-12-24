import { NgModule } from '@angular/core';
import { commonDeclarationImports } from '../core/ultils/CommonDeclarationModule';
import { PlanMasterRoutingModule } from './plan-master-routing.module';
import { PlanMasterServiceProxyModule } from './plan-master-service-proxy.module';
 import { TradeDetailListComponent } from './trade-detail/trade-detail-list.component';
 import { TradeDetailEditComponent } from './trade-detail/trade-detail-edit.component';
import { ConstDetailEditComponent } from './const-detail/const-detail-edit.component';
import { ConstDetailListComponent } from './const-detail/const-detail-list.component';
import { CategoryTradeListComponent } from './category-trade/category-trade-list.component';
import { CategoryTradeEditComponent } from './category-trade/category-trade-edit.component';

 import { LiquidDetailListComponent } from './liquid-detail/liquid-detail-list.component';
 import { LiquidDetailEditComponent } from './liquid-detail/liquid-detail-edit.component';
import { ApproveAllPlMaster } from './trade-detail/approve-all-pl-master.component';
@NgModule({
    imports: [
        ...commonDeclarationImports,
        PlanMasterRoutingModule,
        PlanMasterServiceProxyModule
    ],
    declarations: [
         TradeDetailEditComponent,TradeDetailListComponent,
         LiquidDetailListComponent,LiquidDetailEditComponent,
        ConstDetailEditComponent, ConstDetailListComponent,
        CategoryTradeListComponent,CategoryTradeEditComponent,
        ApproveAllPlMaster

    ],
    exports: [

    ],
    providers: [

    ]
})
export class PlanMasterModule { }
