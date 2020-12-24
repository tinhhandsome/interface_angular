import { Component, ElementRef, EventEmitter, Injector, Output, ViewChild, Inject, OnInit } from '@angular/core';
import { AppComponentBase } from '@shared/common/app-component-base';
import { RoleEditDto, ReportTable, AsposeServiceProxy as ReportServiceProxy, ReportInfo, ReportParameter, ReportTemplateServiceProxy } from '@shared/service-proxies/service-proxies';
import { ModalDirective } from 'ngx-bootstrap';
import { CkeditorControlComponent } from '@app/admin/core/controls/ckeditor-control/ckeditor-control.component';
import { ReportNoteModalComponent } from '@app/admin/core/controls/report-note-modal/report-note-modal.component';
import { PreviewTemplateService } from '@app/admin/common/preview-template/preview-template.service';
import { DefaultComponentBase } from '@app/ultilities/default-component-base';


@Component({
    selector: 'report-template',
    templateUrl: './report-template-modal.component.html'
})
export class ReportTemplateModalComponent extends DefaultComponentBase {

    templateContent: string;
    storeData: ReportTable[];

    @ViewChild('reportNoteModal') reportNoteModal: ReportNoteModalComponent;
    @ViewChild('ckeditor') ckeditor: CkeditorControlComponent;
    @ViewChild('previewModal') previewModal: ModalDirective;
    //@ViewChild('permissionTree') permissionTree: PermissionTreeComponent;

    @Output() modalSave: EventEmitter<any> = new EventEmitter<any>();

    active = false;
    // saving = false;


    role: RoleEditDto = new RoleEditDto();
    constructor(
        injector: Injector,
        private _reportService: ReportServiceProxy,
        private _templatetService: PreviewTemplateService,
        private _reportTemplateService: ReportTemplateServiceProxy,


    ) {
        super(injector);
    }



    show(reportTemplateCode: string, params: ReportParameter[], values: ReportParameter[]): void {

        this.active = true;
        // this.storeData = ReportTable;
        // this.templateContent = templateContent;
        // this.previewModal.show();
        abp.ui.setBusy(undefined, this.l('SavingWithThreeDot'));
        this._reportTemplateService.cM_REPORT_TEMPLATE_ByCode(reportTemplateCode).subscribe(response => {
            var defaultTemplate = response.reporT_TEMPLATE_DETAILs.find(x => x.isDefault == true);
            var reportInfo = new ReportInfo();
            reportInfo.storeName = response.reporT_TEMPLATE_STORE;
            reportInfo.parameters = params;
            reportInfo.values = values;
            this._reportService.getDataFromStore(reportInfo).subscribe(storeData => {
                this.storeData = storeData;
                this.templateContent = defaultTemplate.reporT_TEMPLATE_DETAIL_CONTENT;
                this.previewModal.show();
                this.updateParentView();
                abp.ui.clearBusy();
            });
        });
        // this._reportService.getDataFromStore(storeInfo).subscribe(result => {
        //     this.storeData = result;
        //     this.ckeditor.refreshTemplate();

        // });

    }

    onShown(): void {
    }

    save(event): void {

        const self = this;
        this.saving = true;
        this.modalSave.emit(this.templateContent);
        this.close();


        // this._roleService.createOrUpdateRole(input)
        //     .pipe(finalize(() => this.saving = false))
        //     .subscribe(() => {
        //         this.showSuccessMessage(this.l('SavedSuccessfully'));
        //         this.close();
        //         this.modalSave.emit(null);
        //     });
    }

    close(): void {
        this.active = false;
        // this.saving = false;
        this.previewModal.hide();
    }
    showReportNoteModale() {
        // var storeInfo = new ReportInfo();
        // storeInfo.storeName = storeName;
        // storeInfo.parameters = null;
        this.reportNoteModal.show(this.storeData);

    }
    print() {
        this._templatetService.print(this.ckeditor.reportContent);
    }

}
