import { NgModule } from '@angular/core';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { AuditLogsComponent } from './zero-base/audit-logs/audit-logs.component';
import { HostDashboardComponent } from './zero-base/dashboard/host-dashboard.component';
import { DemoUiComponentsComponent } from './zero-base/demo-ui-components/demo-ui-components.component';
import { EditionsComponent } from './zero-base/editions/editions.component';
import { InstallComponent } from './zero-base/install/install.component';
import { LanguageTextsComponent } from './zero-base/languages/language-texts.component';
import { LanguagesComponent } from './zero-base/languages/languages.component';
import { MaintenanceComponent } from './zero-base/maintenance/maintenance.component';
import { OrganizationUnitsComponent } from './zero-base/organization-units/organization-units.component';
import { RolesComponent } from './zero-base/roles/roles.component';
import { HostSettingsComponent } from './zero-base/settings/host-settings.component';
import { TenantSettingsComponent } from './zero-base/settings/tenant-settings.component';
import { TenantsComponent } from './zero-base/tenants/tenants.component';
import { UiCustomizationComponent } from './zero-base/ui-customization/ui-customization.component';
import { UsersComponent } from './zero-base/users/users.component';
import { SubscriptionManagementComponent } from './zero-base/subscription-management/subscription-management.component';
import { InvoiceComponent } from './zero-base/subscription-management/invoice/invoice.component';
// import {  } from './'

@NgModule({
    imports: [
        RouterModule.forChild([
            {
                path: '',
                children: [
                    { path: 'users', component: UsersComponent, data: { permission: 'Pages.Administration.Users' } },
                    { path: 'roles', component: RolesComponent, data: { permission: 'Pages.Administration.Roles' } },
                    { path: 'auditLogs', component: AuditLogsComponent, data: { permission: 'Pages.Administration.AuditLogs' } },
                    { path: 'maintenance', component: MaintenanceComponent, data: { permission: 'Pages.Administration.Host.Maintenance' } },
                    { path: 'hostSettings', component: HostSettingsComponent, data: { permission: 'Pages.Administration.Host.Settings' } },
                    { path: 'editions', component: EditionsComponent, data: { permission: 'Pages.Editions' } },
                    { path: 'languages', component: LanguagesComponent, data: { permission: 'Pages.Administration.Languages' } },
                    { path: 'languages/:name/texts', component: LanguageTextsComponent, data: { permission: 'Pages.Administration.Languages.ChangeTexts' } },
                    { path: 'tenants', component: TenantsComponent, data: { permission: 'Pages.Tenants' } },
                    { path: 'organization-units', component: OrganizationUnitsComponent, data: { permission: 'Pages.Administration.OrganizationUnits' } },
                    { path: 'subscription-management', component: SubscriptionManagementComponent, data: { permission: 'Pages.Administration.Tenant.SubscriptionManagement' } },
                    { path: 'invoice/:paymentId', component: InvoiceComponent, data: { permission: 'Pages.Administration.Tenant.SubscriptionManagement' } },
                    { path: 'tenantSettings', component: TenantSettingsComponent, data: { permission: 'Pages.Administration.Tenant.Settings' } },
                    { path: 'hostDashboard', component: HostDashboardComponent, data: { permission: 'Pages.Administration.Dashboard' } },
                    { path: 'demo-ui-components', component: DemoUiComponentsComponent, data: { permission: 'Pages.DemoUiComponents' } },
                    { path: 'install', component: InstallComponent },
                    { path: 'ui-customization', component: UiCustomizationComponent },
                ]
            }
        ])
    ],
    exports: [
        RouterModule
    ]
})
export class AdminRoutingModule {

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
