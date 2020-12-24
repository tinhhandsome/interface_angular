import { NgModule } from '@angular/core';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { EditPageState } from '@app/ultilities/enum/edit-page-state';
import { RealEstateListComponent } from './real-estate/real-estate-list.component';
import { RealEstateEditComponent } from './real-estate/real-estate-edit.component';
@NgModule({
    imports: [
        RouterModule.forChild([
            {
                path: '',
                children: [
                    { path: 'real-estate', component:RealEstateListComponent, data: { permission:'Pages.Administration.RealEstate'}},
                    { path: 'real-estate-add', component:RealEstateEditComponent, data:{ permission:'Pages.Administration.RealEstate.Create', editPageState : EditPageState.add}},
                    { path: 'real-estate-edit', component:RealEstateEditComponent, data:{ permission:'Pages.Administration.RealEstate.Edit', editPageState : EditPageState.edit}},
                    { path: 'real-estate-view', component:RealEstateEditComponent, data:{ permission:'Pages.Administration.RealEstate.View', editPageState : EditPageState.viewDetail}},
                ]
            }
        ])
    ],
    exports: [
        RouterModule
    ]
})
export class RetMasterRoutingModule {

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
