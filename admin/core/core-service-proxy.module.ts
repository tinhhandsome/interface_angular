import { AbpHttpInterceptor } from '@abp/abpHttpInterceptor';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { NgModule } from '@angular/core';
import * as ApiServiceProxies from '../../../shared/service-proxies/service-proxies'

@NgModule({
    providers: [
        ApiServiceProxies.BranchServiceProxy,
        ApiServiceProxies.AllCodeServiceProxy,
        ApiServiceProxies.RegionServiceProxy,
        ApiServiceProxies.DepartmentServiceProxy,
        ApiServiceProxies.WorkflowRejectDetailServiceProxy,
        ApiServiceProxies.AttachFileServiceProxy,
        ApiServiceProxies.CmUserServiceProxy,
        { provide: HTTP_INTERCEPTORS, useClass: AbpHttpInterceptor, multi: true }
    ]
})
export class CoreServiceProxyModule { }
