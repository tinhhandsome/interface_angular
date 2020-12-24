import { Component, ElementRef, EventEmitter, Injector, Output, ViewChild, Inject, OnInit } from '@angular/core';
import { AppComponentBase } from '@shared/common/app-component-base';
import { AsposeServiceProxy as ReportServiceProxy, ReportParameter, ReportTable, ReportInfo } from '@shared/service-proxies/service-proxies';
import { ModalDirective } from 'ngx-bootstrap';
import { finalize } from 'rxjs/operators';
import { DOCUMENT } from '@angular/common';
import { AppMenu } from '@app/shared/layout/nav/app-menu';
import { PreviewTemplateService } from '../../../common/preview-template/preview-template.service';
import { CkeditorControlComponent } from '@app/admin/core/controls/ckeditor-control/ckeditor-control.component';


@Component({
    selector: 'reportNoteModal',
    styleUrls: ['./report-note-modal.css'],

    templateUrl: './report-note-modal.component.html'
})
export class ReportNoteModalComponent extends AppComponentBase {

    // reportStore: ReportTable[][][];

    reportStore: ReportTable[];

    @ViewChild('reportNoteModal') modal: ModalDirective;
    @ViewChild('ckeditorControl') ckeditorControl: CkeditorControlComponent;

    //@ViewChild('permissionTree') permissionTree: PermissionTreeComponent;

    @Output() modalSave: EventEmitter<any> = new EventEmitter<any>();

    saving = false;
    outsideTm: any;
    insideTm: any;
    // Permission: AppMenu;

    constructor(
        injector: Injector,
        private _reportService: ReportServiceProxy,
        private _previewTemplateService: PreviewTemplateService,

    ) {
        super(injector);
    }



    show(storeData?: ReportTable[]): void {
        const self = this;
        this.reportStore = storeData;
        self.modal.show();


    }

    onShown(): void {
        //document.getElementById('RoleDisplayName').focus();
    }

    save(event): void {

        const self = this;

    }

    close(): void {

        this.modal.hide();
    }

    insertTableToEditor(ReportTable: ReportTable) {

        var template = '<table border="1" cellpadding="1" cellspacing="1" style="width:100%"> <tbody> <tr>';
        for (var a of ReportTable.columns) {
            template += '<td>' + a.colName + '</td>';
        }
        template += '</tr>';
        // for(let a of ReportTable.rows)
        // {
        //     template += '<tr>';
        //     for(let b of a.cells){
        //         template += '<td>' + b + '</td>';
        //     }
        //     template += '</tr>';

        // }
        template += '<tr>';

        for (var a of ReportTable.columns) {

            template += '<td>' + a.keyName + '</td>';

        }
        template += '</tr>';

        template += '</tbody> </table>';

        // this.ckeditorControl.InsertTableToEditor(template);
        this.modalSave.emit(template);
        this.modal.hide();
    }

}
