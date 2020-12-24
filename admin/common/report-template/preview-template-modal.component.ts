import { Component, EventEmitter, Injector, Output, ViewChild } from '@angular/core';
import { AppComponentBase } from '@shared/common/app-component-base';
import { RoleEditDto, ReportTable, AsposeServiceProxy as ReportServiceProxy } from '@shared/service-proxies/service-proxies';
import { ModalDirective } from 'ngx-bootstrap';
import { PreviewTemplateService } from '../preview-template/preview-template.service';
import { ReportNoteModalComponent } from '../../core/controls/report-note-modal/report-note-modal.component';
import { CkeditorControlComponent } from '@app/admin/core/controls/ckeditor-control/ckeditor-control.component';


@Component({
    selector: 'previewTemplateModal',
    templateUrl: './preview-template-model.component.html'
})
export class PreviewTemplateModalComponent extends AppComponentBase {

    templateContent: string;
    storeData: ReportTable[];

    @ViewChild('reportNoteModal') reportNoteModal: ReportNoteModalComponent;
    @ViewChild('ckeditor') ckeditor: CkeditorControlComponent;
    @ViewChild('createOrEditModal') modal: ModalDirective;
    //@ViewChild('permissionTree') permissionTree: PermissionTreeComponent;

    @Output() modalSave: EventEmitter<any> = new EventEmitter<any>();

    active = false;
    saving = false;


    role: RoleEditDto = new RoleEditDto();
    constructor(
        injector: Injector,
    ) {
        super(injector);
    }



    show(templateContent: string, reportTable: ReportTable[]): void {

        this.active = true;
        this.storeData = reportTable;
        this.templateContent = templateContent;
        this.modal.show();

        // this._reportService.getDataFromStore(storeInfo).subscribe(result => {
        //     this.storeData = result;
        //     this.ckeditor.refreshTemplate();

        // });

    }

    onShown(): void {
    }

    save(): void {

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
        this.modal.hide();
    }
    showReportNoteModale(){
        // var storeInfo = new ReportInfo();
        // storeInfo.storeName = storeName;
        // storeInfo.parameters = null;
        this.reportNoteModal.show(this.storeData);

    }

}
