import { NgModule } from '@angular/core';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { EditPageState } from '@app/ultilities/enum/edit-page-state';
import { TradeDetailListComponent } from './trade-detail/trade-detail-list.component';
 import { TradeDetailEditComponent } from './trade-detail/trade-detail-edit.component';
import { ConstDetailListComponent } from './const-detail/const-detail-list.component';
import { ConstDetailEditComponent } from './const-detail/const-detail-edit.component';
import { CategoryTradeListComponent } from './category-trade/category-trade-list.component';
import { CategoryTradeEditComponent } from './category-trade/category-trade-edit.component';
 import { LiquidDetailListComponent } from './liquid-detail/liquid-detail-list.component';
 import { LiquidDetailEditComponent } from './liquid-detail/liquid-detail-edit.component';
import { ApproveAllPlMaster } from './trade-detail/approve-all-pl-master.component';

@NgModule({
    imports: [
        RouterModule.forChild([
            {
                path: '',
                children: [
                    { path: 'trade-detail', component: TradeDetailListComponent, data: { permission: 'Pages.Administration.TradeDetail' } },
                    { path: 'trade-detail-add', component: TradeDetailEditComponent, data: { permission: 'Pages.Administration.TradeDetail.Create', editPageState : EditPageState.add } },
                    { path: 'trade-detail-edit', component: TradeDetailEditComponent, data: { permission: 'Pages.Administration.TradeDetail.Edit', editPageState : EditPageState.edit } },
                    { path: 'trade-detail-view', component: TradeDetailEditComponent, data: { permission: 'Pages.Administration.TradeDetail.View', editPageState : EditPageState.viewDetail } },

                    { path: 'trade-detail-app', component: ApproveAllPlMaster, data: { permission: 'Pages.Administration.ApproveAllPlMaster' } },


                    { path: 'const-detail', component: ConstDetailListComponent, data: { permission: 'Pages.Administration.ConstDetail' } },
                    { path: 'const-detail-add', component: ConstDetailEditComponent, data: { permission: 'Pages.Administration.ConstDetail.Create', editPageState : EditPageState.add } },
                    { path: 'const-detail-edit', component: ConstDetailEditComponent, data: { permission: 'Pages.Administration.ConstDetail.Edit', editPageState : EditPageState.edit } },
                    { path: 'const-detail-view', component: ConstDetailEditComponent, data: { permission: 'Pages.Administration.ConstDetail.View', editPageState : EditPageState.viewDetail } },

                    { path: 'liquid-detail', component: LiquidDetailListComponent, data: { permission: 'Pages.Administration.PlanLiquid' } },
                    { path: 'liquid-detail-add', component: LiquidDetailEditComponent, data: { permission: 'Pages.Administration.PlanLiquid.Create', editPageState : EditPageState.add } },
                    { path: 'liquid-detail-edit', component: LiquidDetailEditComponent, data: { permission: 'Pages.Administration.PlanLiquid.Edit', editPageState : EditPageState.edit } },
                    { path: 'liquid-detail-view', component: LiquidDetailEditComponent, data: { permission: 'Pages.Administration.PlanLiquid.View', editPageState : EditPageState.viewDetail } },

                    // { path: 'branch', component: BranchListComponent, data: { permission: 'Pages.Administration.Branch' } },
                    // { path: 'branch-add', component: BranchEditComponent, data: { permission: 'Pages.Administration.Branch.Create', editPageState : EditPageState.add } },
                    // { path: 'branch-edit', component: BranchEditComponent, data: { permission: 'Pages.Administration.Branch.Edit', editPageState : EditPageState.edit } },
                    // { path: 'branch-view', component: BranchEditComponent, data: { permission: 'Pages.Administration.Branch.View', editPageState : EditPageState.viewDetail } },
                    { path: 'categorytrade', component: CategoryTradeListComponent, data: { permission: 'Pages.Administration.CategoryTrade' } },
                    { path: 'categorytrade-add', component: CategoryTradeEditComponent, data: { permission: 'Pages.Administration.CategoryTrade', editPageState: EditPageState.add } },
                    { path: 'categorytrade-edit', component: CategoryTradeEditComponent, data: { permission: 'Pages.Administration.CategoryTrade', editPageState: EditPageState.edit } },
                    { path: 'categorytrade-view', component: CategoryTradeEditComponent, data: { permission: 'Pages.Administration.CategoryTrade', editPageState: EditPageState.viewDetail } },


                ]
            }
        ])
    ],
    exports: [
        RouterModule
    ]
})
export class PlanMasterRoutingModule {

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
