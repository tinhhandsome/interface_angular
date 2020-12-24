import { NgModule } from '@angular/core';
import { commonDeclarationImports } from '../core/ultils/CommonDeclarationModule';
import { RetMasterRoutingModule } from './ret-master-routing.module';
import { RetMasterServiceProxyModule } from './ret-master-service-proxy.module';
import { RealEstateListComponent } from './real-estate/real-estate-list.component';
import { RealEstateEditComponent } from './real-estate/real-estate-edit.component';
import { RetRepairEditComponent } from './ret-repair/ret-repair-edit.component';
import { RetRepairListComponent } from './ret-repair/ret-repair-list.component';
@NgModule({
    imports: [
        ...commonDeclarationImports,
        RetMasterRoutingModule,
        RetMasterServiceProxyModule
    ],
    declarations: [
        RealEstateListComponent, RealEstateEditComponent,RetRepairEditComponent,RetRepairListComponent
    ],
    exports: [

    ],
    providers: [

    ]
})
export class RetMasterModule { }
