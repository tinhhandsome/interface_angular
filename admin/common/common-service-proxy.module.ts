import { AbpHttpInterceptor } from '@abp/abpHttpInterceptor';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { NgModule } from '@angular/core';
import * as ApiServiceProxies from '../../../shared/service-proxies/service-proxies'
import { PreviewTemplateService } from './preview-template/preview-template.service';
import { AccentsCharService } from '../core/ultils/accents-char.service';

@NgModule({
    providers: [
        ApiServiceProxies.AppMenuServiceProxy,
        ApiServiceProxies.AppPermissionServiceProxy,
        ApiServiceProxies.DeptGroupServiceProxy,
        ApiServiceProxies.SupplierTypeServiceProxy,
        ApiServiceProxies.SupplierServiceProxy,
        ApiServiceProxies.GoodsTypeServiceProxy,
        ApiServiceProxies.UnitServiceProxy,
        ApiServiceProxies.GoodsServiceProxy,
        ApiServiceProxies.DivisionServiceProxy,
        ApiServiceProxies.EmployeeServiceProxy,
        ApiServiceProxies.InsuCompanyServiceProxy,
        ApiServiceProxies.ModelServiceProxy,
        ApiServiceProxies.CarTypeServiceProxy,
        ApiServiceProxies.AllCodeServiceProxy,
        ApiServiceProxies.WorkflowServiceProxy,
        ApiServiceProxies.SysParametersServiceProxy,
        ApiServiceProxies.UltilityServiceProxy,
        ApiServiceProxies.ReportTemplateServiceProxy,
        ApiServiceProxies.AsposeServiceProxy,
        ApiServiceProxies.GoodsTypeRealServiceProxy,
        AccentsCharService,
        PreviewTemplateService,
        { provide: HTTP_INTERCEPTORS, useClass: AbpHttpInterceptor, multi: true }
    ]
})
export class CommonServiceProxyModule { }
