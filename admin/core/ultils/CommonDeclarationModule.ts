import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ToolbarComponent } from '@app/admin/core/controls/toolbar/toolbar.component';
import { TableModule } from 'primeng/table';
import { TreeModule } from 'primeng/tree';
import { AuthStatusComponent } from '@app/admin/core/controls/auth-status/auth-status.component';
import { UtilsModule } from '@shared/utils/utils.module';
import { Select2CustomComponent } from '@app/admin/core/controls/custom-select2/select2-custom.component';
import { ControlComponent } from '@app/admin/core/controls/control.component';
import { AllCodeSelectComponent } from '../controls/allCodes/all-code-select.component';
import { ModalModule, TabsModule, TooltipModule, PopoverModule, BsDropdownModule, BsDatepickerModule } from 'ngx-bootstrap';
import { AppCommonModule } from '@app/shared/common/app-common.module';
import { AutoCompleteModule, EditorModule, FileUploadModule as PrimeNgFileUploadModule, InputMaskModule, PaginatorModule, FileUploadModule, DragDropModule, ContextMenuModule } from 'primeng/primeng';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { TextMaskModule } from 'angular2-text-mask';
import { ImageCropperModule } from 'ngx-image-cropper';
import { CoreTableComponent } from '../controls/core-table/core-table.component';
import { TreeRadioSelectComponent } from '../controls/tree-select-radio/tree-radio-select.component';
import { AppPermissionTreeComponent } from '../controls/app-permission-tree/app-permission-tree.component';
import { PopupTableBaseComponent } from '../controls/popup-table-base/popup-table-base.component';
import { CheckboxControlComponent } from '../controls/checkbox-control/checkbox-control.component';
import { PermissionSelectorComponent } from '../controls/permission-selector/permission-selector.component';
import { TreeCheckboxSelectComponent } from '../controls/tree-checkbox-select/tree-checkbox-select.component';
import { AuthStatusInputPageComponent } from '../controls/auth-status-input-page/auth-status-input-page.component';
import { NgxCleaveDirectiveModule } from 'ngx-cleave-directive';
import { MoneyInputComponent } from '../controls/money-input/money-input.component';
import { DateFormatPipe } from '../pipes/date-format.pipe';
import { MoneyFormatPipe } from '../pipes/money-format.pipe';
import { EditableTableComponent } from '../controls/editable-table/editable-table.component';
import { PopupFrameComponent } from '../controls/popup-frames/popup-frame.component';
import { GoodsModalComponent } from '../controls/goods-modal/goods-modal.component';
import { CustomFlatpickrComponent } from '../controls/custom-flatpickr/custom-flatpickr.component';
import { FilePickerComponent } from '../controls/file-picker/file-picker.component';
import { AssetModalComponent } from '../controls/asset-modal/asset-modal.component';
import { ToolbarRejectExtComponent } from '../controls/toolbar-reject-ext/toolbar-reject-ext.component';
import { RejectModalComponent } from '../controls/reject-modals/reject-modal.component';
import { RejectMessageComponent } from '../controls/reject-messages/reject-message.component';
import { AutoCompleteComponent } from '../controls/auto-complete/auto-complete.component';
import { CKEditorModule } from 'ng2-ckeditor';
import { CarMasterModalComponent } from '../controls/car-modal/car-master-modal.component';
import { CkeditorControlComponent } from '../controls/ckeditor-control/ckeditor-control.component';
// import { TradeDetailModalComponent } from '../controls/trade-detail-modal/trade-detail-modal.component';
import { TrRequestGoodsModalComponent } from '../controls/goods-modal/tr-request-goods-modal.component';
import { SupplierModalComponent } from '../controls/supplider-modal/supplier-modal.component';
import { RadioControlComponent } from '../controls/radio-control/radio-control.component';
import { ProjectModalComponent } from '../controls/trade-project-modal/trade-project-modal.component';
import { BranchModalComponent } from '../controls/branch-modal/branch-modal.component';
import { BidMasterModalComponent } from '../controls/bid-master-modal/bid-master-modal.component';
import { ContractModalComponent } from '../controls/contract-modal/contract-modal.component';
import { UserModalComponent } from '../controls/users-modal/user-modal.component';
import { RoleComboComponent } from '@app/admin/zero-base/shared/role-combo.component';
import { DisplayComponent } from '../controls/display/display.component';
import { TradePoMasterModalComponent } from '../controls/trade-po-master-modal/trade-po-master-modal.component';
// import { GoodsRealModalComponent } from '../controls/goodstype-real-modal/goodstype-real-modal.component';
import { TrPoGoodsModalComponent } from '../controls/tr-po-goods-modal/tr-po-goods-modal.component';
import { ReportNoteModalComponent } from '../controls/report-note-modal/report-note-modal.component';
// import { ReportTemplateModalComponent } from '../controls/report-template-modal/report-template-modal.component';
// import { CodeScannerComponent } from '../controls/code-scanner/code-scanner/code-scanner.component';
// import { AppInfoDialogComponent } from '../controls/code-scanner/app-info-dialog/app-info-dialog.component';
// import { AppInfoComponent } from '../controls/code-scanner/app-info/app-info.component';
// import { FormatsDialogComponent } from '../controls/code-scanner/formats-dialog/formats-dialog.component';
// import { WebcamModule } from 'ngx-webcam';
// import { MatDialogModule } from '@angular/material/dialog';
// import { MatListModule } from '@angular/material/list';
// import { MatSelectModule } from '@angular/material/select';
// import {ZXingScannerModule} from '@zxing/ngx-scanner'
import { DisabledInputComponent } from '../controls/disabledInput/disabled-input.component';
import { DepartmentModalComponent } from '../controls/dep-modal/department-modal.component';
import { DivisionModalComponent } from '../controls/division-modal/division-modal.component';
import { EmployeeModalComponent } from '../controls/employee-modal/employee-modal.component';
// import { ConMasterModalComponent } from '../controls/con-master-modal/con-master-modal.component';
import { FileMultiComponent } from '../controls/file-picker/file-multi.component';
// import { ToolbarUpdateReportComponent } from '../controls/toolbar-update-report/toolbar-update-report.component';
import { DateTimeFormatPipe } from '../pipes/date-time-format.pipe';
import { TermFormatPipe } from '../pipes/term-format.pipe';
import { AssetSkModalComponent } from '../controls/asset-modal/asset-modal-sk.component';
import { AssGroupModalComponent } from '../controls/ass-group-modal/ass-group-modal.component';
import { ReportTemplateModalComponent } from '../controls/report-template-modal/report-template-modal.component';
import { RetModalComponent } from '../controls/ret-modal/ret-master-modal.component';
import { ImportExcelComponent } from '../controls/import-excel/import-excel.component';
import { GoodsRealModalComponent } from '../controls/goodstype-real-modal/goodstype-real-modal.component';
import { Paginator2Component } from '../controls/p-paginator2/p-paginator2.component';
import { TradeDetailModalComponent } from '../controls/trade-detail-modal/trade-detail-modal.component';
import { BranchLevComponent } from '../controls/branch-lev/branch-lev.component';
import { LocationControlComponent } from '../controls/localtion-control/location-control.component';
import { FileUploaderComponent } from '../controls/file-uploader/file-uploader.component';
import { FileUploaderMultiModalComponent } from '../controls/file-uploader/file-uploader-multi-modal.component';
import { AssetWarehouseInModalComponent } from '../controls/wh-asset-i-modal/asset-wh-i-modal.component.';
import { AssetWarehouseOutModalComponent } from '../controls/wh-asset-o-modal/asset-wh-o-modal.component.';
import { GoodsModalCloneComponent } from '../controls/goods-modal-clone/goods-modal.component';
import { TrRequestGoodsModalCloneComponent } from '../controls/goods-modal-clone/tr-request-goods-modal.component';
import { RejectNotesComponent } from '../controls/reject-notes/reject-notes.component';
import { CategorytradeModalComponent } from '../controls/goods-modal/categorytrade-modal.component';

export const commonDeclarationDeclarations = [
    ToolbarComponent,
    Select2CustomComponent,
    AuthStatusComponent,
    ControlComponent,
    AllCodeSelectComponent,
    CoreTableComponent,
    TreeRadioSelectComponent,
    AppPermissionTreeComponent,
    PopupTableBaseComponent,
    CheckboxControlComponent,
    TreeCheckboxSelectComponent,
    AuthStatusInputPageComponent,
    MoneyInputComponent,
    EditableTableComponent,
    DateFormatPipe,
    DateTimeFormatPipe,
    TermFormatPipe,
    MoneyFormatPipe,
    PopupFrameComponent,
    GoodsModalComponent,
    CustomFlatpickrComponent,
    FilePickerComponent,
    PermissionSelectorComponent,
    ToolbarRejectExtComponent,
    RejectModalComponent,
    RejectMessageComponent,
    AutoCompleteComponent,
    CarMasterModalComponent,
    AssetModalComponent,
    // TradeDetailModalComponent,
    TrRequestGoodsModalComponent,
    SupplierModalComponent,
    RadioControlComponent,
    ProjectModalComponent,
    CkeditorControlComponent,
    BranchModalComponent,
    ContractModalComponent,
    RoleComboComponent,
    UserModalComponent,
    DisplayComponent,
    TradePoMasterModalComponent,
    GoodsRealModalComponent,
    TrPoGoodsModalComponent,
    ReportNoteModalComponent,
    // AppInfoDialogComponent,
    // AppInfoComponent,
    // CodeScannerComponent,
    // FormatsDialogComponent,
    DisabledInputComponent,
    DepartmentModalComponent,
    DivisionModalComponent,
    EmployeeModalComponent,
    // ConMasterModalComponent,
    FileMultiComponent,
    // ToolbarUpdateReportComponent,
    BidMasterModalComponent,
    AssetSkModalComponent,
    AssGroupModalComponent,
    ReportTemplateModalComponent,
    RetModalComponent,
    GoodsRealModalComponent,
    ImportExcelComponent,
    Paginator2Component,
    TradeDetailModalComponent,
    BranchLevComponent,
    AssetWarehouseInModalComponent,
    AssetWarehouseOutModalComponent,
    LocationControlComponent,
    FileUploaderComponent,
    FileUploaderMultiModalComponent,
    GoodsModalCloneComponent,
    TrRequestGoodsModalCloneComponent,
    RejectNotesComponent,
    CategorytradeModalComponent
    
];

@NgModule({
    imports: [
        ReactiveFormsModule,
        FormsModule,
        CommonModule,
        ModalModule.forRoot(),
        TreeModule,
        NgxCleaveDirectiveModule,
        UtilsModule,
        CKEditorModule,
        PaginatorModule,
        // MatDialogModule,
        // ZXingScannerModule,
        // MatSelectModule,
        // MatListModule,
        // WebcamModule,

    ],
    declarations: [
        commonDeclarationDeclarations
    ],
    exports: [
        commonDeclarationDeclarations
    ],
    providers: [

    ]
})
export class CommonDeclarationDeclarationModule {

}

export const commonDeclarationImports = [
    ReactiveFormsModule,
    FileUploadModule,
    ModalModule.forRoot(),
    TabsModule.forRoot(),
    TooltipModule.forRoot(),
    PopoverModule.forRoot(),
    BsDropdownModule.forRoot(),
    BsDatepickerModule.forRoot(),
    AppCommonModule,
    PrimeNgFileUploadModule,
    InputMaskModule,
    NgxChartsModule,
    TextMaskModule,
    ImageCropperModule,
    TableModule,
    TreeModule,
    DragDropModule,
    ContextMenuModule,
    PaginatorModule,
    AutoCompleteModule,
    UtilsModule,
    EditorModule,
    FormsModule,
    NgxCleaveDirectiveModule,
    CKEditorModule,
    CommonDeclarationDeclarationModule,
    // WebcamModule,
    // MatDialogModule,
    // ZXingScannerModule,
    // MatSelectModule,
    // MatListModule,
];