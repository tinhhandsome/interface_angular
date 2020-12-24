import { NgModule } from '@angular/core';
import { BsDatepickerConfig, BsDaterangepickerConfig, BsLocaleService } from 'ngx-bootstrap/datepicker';
import { TreeDragDropService } from 'primeng/api';
import { NgxBootstrapDatePickerConfigService } from 'assets/ngx-bootstrap/ngx-bootstrap-datepicker-config.service';
import { CoreRoutingModule } from './core-routing.module';
import { CoreServiceProxyModule } from './core-service-proxy.module';
import { DashboardComponent } from '@app/main/dashboard/dashboard.component';
import { commonDeclarationImports } from './ultils/CommonDeclarationModule';

@NgModule({
    imports: [
        ...commonDeclarationImports,
        CoreServiceProxyModule,
        CoreRoutingModule,
    ],
    declarations: [
        DashboardComponent
    ],
    exports: [

    ],
    providers: [
        TreeDragDropService,
        { provide: BsDatepickerConfig, useFactory: NgxBootstrapDatePickerConfigService.getDatepickerConfig },
        { provide: BsDaterangepickerConfig, useFactory: NgxBootstrapDatePickerConfigService.getDaterangepickerConfig },
        { provide: BsLocaleService, useFactory: NgxBootstrapDatePickerConfigService.getDatepickerLocale }
    ]
})
export class CCoreModule { }
