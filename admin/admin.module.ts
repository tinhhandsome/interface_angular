import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AppCommonModule } from '@app/shared/common/app-common.module';
import { UtilsModule } from '@shared/utils/utils.module';
import { AddMemberModalComponent } from '@app/admin/zero-base/organization-units/add-member-modal.component';
import { AddRoleModalComponent } from '@app/admin/zero-base/organization-units/add-role-modal.component';
import { FileUploadModule } from 'ng2-file-upload';
import { ModalModule, PopoverModule, TabsModule, TooltipModule, BsDropdownModule } from 'ngx-bootstrap';
import { BsDatepickerModule, BsDatepickerConfig, BsDaterangepickerConfig, BsLocaleService } from 'ngx-bootstrap/datepicker';
import { AutoCompleteModule, EditorModule, FileUploadModule as PrimeNgFileUploadModule, InputMaskModule, PaginatorModule } from 'primeng/primeng';
import { TableModule } from 'primeng/table';
import { TreeModule } from 'primeng/tree';
import { DragDropModule } from 'primeng/dragdrop';
import { TreeDragDropService } from 'primeng/api';
import { ContextMenuModule } from 'primeng/contextmenu';
import { AdminRoutingModule } from './admin-routing.module';
import { AuditLogDetailModalComponent } from './zero-base/audit-logs/audit-log-detail-modal.component';
import { AuditLogsComponent } from './zero-base/audit-logs/audit-logs.component';
import { HostDashboardComponent } from './zero-base/dashboard/host-dashboard.component';
import { DemoUiComponentsComponent } from './zero-base/demo-ui-components/demo-ui-components.component';
import { DemoUiDateTimeComponent } from './zero-base/demo-ui-components/demo-ui-date-time.component';
import { DemoUiEditorComponent } from './zero-base/demo-ui-components/demo-ui-editor.component';
import { DemoUiFileUploadComponent } from './zero-base/demo-ui-components/demo-ui-file-upload.component';
import { DemoUiInputMaskComponent } from './zero-base/demo-ui-components/demo-ui-input-mask.component';
import { DemoUiSelectionComponent } from './zero-base/demo-ui-components/demo-ui-selection.component';
import { CreateEditionModalComponent } from './zero-base/editions/create-edition-modal.component';
import { EditEditionModalComponent } from './zero-base/editions/edit-edition-modal.component';
import { MoveTenantsToAnotherEditionModalComponent } from './zero-base/editions/move-tenants-to-another-edition-modal.component';
import { EditionsComponent } from './zero-base/editions/editions.component';
import { InstallComponent } from './zero-base/install/install.component';
import { CreateOrEditLanguageModalComponent } from './zero-base/languages/create-or-edit-language-modal.component';
import { EditTextModalComponent } from './zero-base/languages/edit-text-modal.component';
import { LanguageTextsComponent } from './zero-base/languages/language-texts.component';
import { LanguagesComponent } from './zero-base/languages/languages.component';
import { MaintenanceComponent } from './zero-base/maintenance/maintenance.component';
import { CreateOrEditUnitModalComponent } from './zero-base/organization-units/create-or-edit-unit-modal.component';
import { OrganizationTreeComponent } from './zero-base/organization-units/organization-tree.component';
import { OrganizationUnitMembersComponent } from './zero-base/organization-units/organization-unit-members.component';
import { OrganizationUnitRolesComponent } from './zero-base/organization-units/organization-unit-roles.component';
import { OrganizationUnitsComponent } from './zero-base/organization-units/organization-units.component';
import { CreateOrEditRoleModalComponent } from './zero-base/roles/create-or-edit-role-modal.component';
import { RolesComponent } from './zero-base/roles/roles.component';
import { HostSettingsComponent } from './zero-base/settings/host-settings.component';
import { TenantSettingsComponent } from './zero-base/settings/tenant-settings.component';
import { CreateTenantModalComponent } from './zero-base/tenants/create-tenant-modal.component';
import { EditTenantModalComponent } from './zero-base/tenants/edit-tenant-modal.component';
import { TenantFeaturesModalComponent } from './zero-base/tenants/tenant-features-modal.component';
import { TenantsComponent } from './zero-base/tenants/tenants.component';
import { UiCustomizationComponent } from './zero-base/ui-customization/ui-customization.component';
import { DefaultThemeUiSettingsComponent } from './zero-base/ui-customization/default-theme-ui-settings.component';
import { Theme2ThemeUiSettingsComponent } from './zero-base/ui-customization/theme2-theme-ui-settings.component';
import { Theme3ThemeUiSettingsComponent } from './zero-base/ui-customization/theme3-theme-ui-settings.component';
import { Theme4ThemeUiSettingsComponent } from './zero-base/ui-customization/theme4-theme-ui-settings.component';
import { Theme5ThemeUiSettingsComponent } from './zero-base/ui-customization/theme5-theme-ui-settings.component';
import { Theme6ThemeUiSettingsComponent } from './zero-base/ui-customization/theme6-theme-ui-settings.component';
import { Theme7ThemeUiSettingsComponent } from './zero-base/ui-customization/theme7-theme-ui-settings.component';
import { Theme8ThemeUiSettingsComponent } from './zero-base/ui-customization/theme8-theme-ui-settings.component';
import { Theme9ThemeUiSettingsComponent } from './zero-base/ui-customization/theme9-theme-ui-settings.component';
import { Theme10ThemeUiSettingsComponent } from './zero-base/ui-customization/theme10-theme-ui-settings.component';
import { Theme11ThemeUiSettingsComponent } from './zero-base/ui-customization/theme11-theme-ui-settings.component';
import { Theme12ThemeUiSettingsComponent } from './zero-base/ui-customization/theme12-theme-ui-settings.component';
import { CreateOrEditUserModalComponent } from './zero-base/users/create-or-edit-user-modal.component';
import { EditUserPermissionsModalComponent } from './zero-base/users/edit-user-permissions-modal.component';
import { ImpersonationService } from './zero-base/users/impersonation.service';
import { UsersComponent } from './zero-base/users/users.component';
import { CountoModule } from 'angular2-counto';
import { TextMaskModule } from 'angular2-text-mask';
import { ImageCropperModule } from 'ngx-image-cropper';
import { NgxBootstrapDatePickerConfigService } from 'assets/ngx-bootstrap/ngx-bootstrap-datepicker-config.service';
import { CCoreModule } from './core/core.module';
// import { AppPieChartComponent } from './zero-base/dashboard/app-pie-charts.component';
import { NgxChartsModule } from '@swimlane/ngx-charts';
// import { ChartsModule } from 'ng2-charts';
// import { AppStackVerticalChartComponent } from './zero-base/dashbo/ard/app-stack-vertical-charts.component';
import { MaintainanceStatisticPopupComponent } from './zero-base/dashboard/maintainance-statistic-popup.component';
import { CCommonModule } from './common/common.module';
import { CommonDeclarationDeclarationModule } from './core/ultils/CommonDeclarationModule';
import { AssMasterModule } from './ass-masters/ass-master.module';
import { PermissionComboComponent } from './zero-base/shared/permission-combo.component';
// import { RoleComboComponent } from './zero-base/shared/role-combo.component';
import { PermissionTreeComponent } from './zero-base/shared/permission-tree.component';
import { FeatureTreeComponent } from './zero-base/shared/feature-tree.component';
import { OrganizationUnitsTreeComponent } from './zero-base/shared/organization-unit-tree.component';
import { EditionComboComponent } from './zero-base/shared/edition-combo.component';
import { InvoiceComponent } from './zero-base/subscription-management/invoice/invoice.component';
import { SubscriptionManagementComponent } from './zero-base/subscription-management/subscription-management.component';
import { CustomStackVerticalChartComponent } from './zero-base/utils/custom-stack-vertical-chart/custom-stack-vertical-chart.component';
import { PlanMasterModule } from './plan-masters/plan-master.module';
import { GridPermissionComponent } from './zero-base/roles/grid-permission.component';
import { CarMasterModule } from './car-masters/car-master.module';
import { TradeModule } from './trade/trade.module';
import { ReportModule } from './reports/report.module';
import { RetMasterModule } from './retMasters/ret-master.module';
import { ToolModule } from './tools/tool.module';

@NgModule({
    imports: [
        FormsModule,
        ReactiveFormsModule,
        CommonModule,
        FileUploadModule,
        ModalModule.forRoot(),
        TabsModule.forRoot(),
        PopoverModule.forRoot(),
        BsDropdownModule.forRoot(),
        BsDatepickerModule.forRoot(),
        AdminRoutingModule,
        UtilsModule,
        AppCommonModule,
        TableModule,
        TreeModule,
        DragDropModule,
        ContextMenuModule,
        PaginatorModule,
        PrimeNgFileUploadModule,
        AutoCompleteModule,
        EditorModule,
        InputMaskModule,
        NgxChartsModule,
        CountoModule,
        TextMaskModule,
        ImageCropperModule,
        // ChartsModule,
        CCommonModule,
        AssMasterModule,
        PlanMasterModule,
        TradeModule,
        CarMasterModule,
        CommonDeclarationDeclarationModule,
        CCoreModule,
        ReportModule,
        RetMasterModule,
        TooltipModule.forRoot(),
        ToolModule
    ],
    declarations: [
        UsersComponent,
        PermissionComboComponent,
        // RoleComboComponent,
        CreateOrEditUserModalComponent,
        MaintainanceStatisticPopupComponent,
        EditUserPermissionsModalComponent,
        PermissionTreeComponent,
        FeatureTreeComponent,
        OrganizationUnitsTreeComponent,
        RolesComponent,
        CreateOrEditRoleModalComponent,
        AuditLogsComponent,
        AuditLogDetailModalComponent,
        HostSettingsComponent,
        InstallComponent,
        MaintenanceComponent,
        EditionsComponent,
        CreateEditionModalComponent,
        EditEditionModalComponent,
        MoveTenantsToAnotherEditionModalComponent,
        LanguagesComponent,
        LanguageTextsComponent,
        CreateOrEditLanguageModalComponent,
        TenantsComponent,
        CreateTenantModalComponent,
        EditTenantModalComponent,
        TenantFeaturesModalComponent,
        CreateOrEditLanguageModalComponent,
        EditTextModalComponent,
        OrganizationUnitsComponent,
        OrganizationTreeComponent,
        OrganizationUnitMembersComponent,
        OrganizationUnitRolesComponent,
        CreateOrEditUnitModalComponent,
        TenantSettingsComponent,
        HostDashboardComponent,
        EditionComboComponent,
        InvoiceComponent,
        SubscriptionManagementComponent,
        AddMemberModalComponent,
        AddRoleModalComponent,
        DemoUiComponentsComponent,
        DemoUiDateTimeComponent,
        DemoUiSelectionComponent,
        DemoUiFileUploadComponent,
        DemoUiInputMaskComponent,
        DemoUiEditorComponent,
        UiCustomizationComponent,
        DefaultThemeUiSettingsComponent,
        Theme2ThemeUiSettingsComponent,
        Theme3ThemeUiSettingsComponent,
        Theme4ThemeUiSettingsComponent,
        Theme5ThemeUiSettingsComponent,
        Theme6ThemeUiSettingsComponent,
        Theme7ThemeUiSettingsComponent,
        Theme8ThemeUiSettingsComponent,
        Theme9ThemeUiSettingsComponent,
        Theme10ThemeUiSettingsComponent,
        Theme12ThemeUiSettingsComponent,
        CustomStackVerticalChartComponent,
        // AppPieChartComponent,
        // AppStackVerticalChartComponent,
        Theme11ThemeUiSettingsComponent,
        GridPermissionComponent
    ],
    exports: [
        AddMemberModalComponent,
        AddRoleModalComponent
    ],
    providers: [
        ImpersonationService,
        TreeDragDropService,
        { provide: BsDatepickerConfig, useFactory: NgxBootstrapDatePickerConfigService.getDatepickerConfig },
        { provide: BsDaterangepickerConfig, useFactory: NgxBootstrapDatePickerConfigService.getDaterangepickerConfig },
        { provide: BsLocaleService, useFactory: NgxBootstrapDatePickerConfigService.getDatepickerLocale }
    ]
})
export class AdminModule { }
