import { Component, ViewChild, ViewEncapsulation, Output, EventEmitter, OnInit, Input, Injector } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap';
import { FileDownloadService } from '@shared/utils/file-download.service';
import { UltilityServiceProxy, AttachFileServiceProxy, CM_ATTACH_FILE_ENTITY } from '@shared/service-proxies/service-proxies';
import { ChangeDetectionComponent } from '../../ultils/change-detection.component';
import { PopupFrameComponent } from '../popup-frames/popup-frame.component';
import { FileUploaderComponent } from './file-uploader.component';

@Component({
    selector: "file-multi-modal",
    templateUrl: "./file-uploader-multi-modal.component.html",
    encapsulation: ViewEncapsulation.None
})
export class FileUploaderMultiModalComponent extends ChangeDetectionComponent implements OnInit {
    @ViewChild('popupFrame') modal: PopupFrameComponent;
    active = false;

    listFile: CM_ATTACH_FILE_ENTITY[];
    ngModel: CM_ATTACH_FILE_ENTITY;
    saving: boolean;
    @Input() disabled: boolean;

    @Output() modalSave: EventEmitter<any> = new EventEmitter<any>();
    @Input() folderUpload: string;

    fileUploader: FileUploaderComponent;

    constructor(
        injector: Injector,
        private ultilityService: UltilityServiceProxy,
        private attachFileService: AttachFileServiceProxy,
        private fileDownloadService: FileDownloadService,
    ) {
        super(injector)
    }
    selectedFiles() {
    }


    show(fileUploader: FileUploaderComponent): void {
        this.fileUploader = fileUploader;
        let multiFilePath = fileUploader.ngModel;
        if (multiFilePath && multiFilePath.filE_NAME_OLD.trim()) {
            let fileOlds = fileUploader.ngModel.filE_NAME_OLD.split('|');
            let fileNames = fileUploader.ngModel.filE_NAME_NEW.split('|');
            let paths = fileUploader.ngModel.patH_NEW.split('|');

            let m = Math.min(fileOlds.length, fileNames.length);
            m = Math.min(m, paths.length);
            this.listFile = [];
            for (let i = 0; i < m; i++) {
                let item = new CM_ATTACH_FILE_ENTITY();
                item.filE_NAME_NEW = fileNames[i];
                item.filE_NAME_OLD = fileOlds[i];
                item.patH_NEW = paths[i];
                this.listFile.push(item);
            }
        }
        else {
            this.listFile = [];
        }
        this.modal.show();
        this.updateView();
    }
    ngOnInit(): void {
        // if (!$('#roxyCustomPanel').length) {
        //     $('body').append(`<div id="roxyCustomPanel" style="display: none;">
        //     <iframe src="/assets/fileman/index.html?integration=custom" id="roxy-fileman" style="width:100%;height:100%" frameborder="0"></iframe>
        // </div>`);
        // }
    }

    uploadFile(evt) {

    }
    showFilePicker() {
        $(this.fileUploader.fileControl.nativeElement).click();
    }
    onShown() {

    }


    uploadComplete(e, i) {

        // if (this.listFile) {
        //     this.attachFileService.deleteMultTmpFile(this.listFile).subscribe(response => {
        //     });
        // }

        let result: CM_ATTACH_FILE_ENTITY = e.body.result.cM_ATTACH_FILE_ENTITY;

        if (!this.listFile) {
            this.ngModel = result;
        }

        let paths = (result.patH_NEW || '').split('|');
        let names = (result.filE_NAME_NEW || '').split('|');
        let fileNameOlds = (result.filE_NAME_OLD || '').split('|');
        let m = Math.min(paths.length, names.length, fileNameOlds.length);
        for (let i = 0; i < m; i++) {
            if (this.listFile.filter(x => x.patH_NEW + x.filE_NAME_NEW == paths[i] + '/' + names[i]).length == 0) {
                let file = new CM_ATTACH_FILE_ENTITY();
                file.patH_NEW = paths[i];
                file.filE_NAME_NEW = names[i];
                file.filE_NAME_OLD = fileNameOlds[i];
                this.listFile.push(file);
            }
        }
        this.updateView();
    }

    save() {
        this.saving = true;
        let file = new CM_ATTACH_FILE_ENTITY();

        if (this.listFile && this.listFile.length) {
            file.patH_NEW = this.listFile.map(x => x.patH_NEW).join('|');
            file.filE_NAME_NEW = this.listFile.map(x => x.filE_NAME_NEW).join('|');
            file.filE_NAME_OLD = this.listFile.map(x => x.filE_NAME_OLD).join('|');
        }
        else {
            file.patH_NEW = '';
            file.filE_NAME_NEW = '';
            file.filE_NAME_OLD = '';
        }

        this.fileUploader.ngModel = file;
        // this.modalSave.emit(this.listFile);
        this.close();
    }
    close() {
        this.active = false;
        this.saving = false;
        this.modal.close();
    }
    download(file: CM_ATTACH_FILE_ENTITY) {
        this.fileUploader.downloadFile(file);
    }
    delete(filePath) {
        this.listFile = this.listFile.filter(e => e !== filePath);
        this.updateView();
    }
}