import { Component, ViewChild, ViewEncapsulation, Output, EventEmitter, OnInit, Input, Injector } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap';
import { FileDownloadService } from '@shared/utils/file-download.service';
import { UltilityServiceProxy } from '@shared/service-proxies/service-proxies';
import { ChangeDetectionComponent } from '../../ultils/change-detection.component';
import { PopupFrameComponent } from '../popup-frames/popup-frame.component';

@Component({
    selector: "file-multi",
    templateUrl: "./file-multi.component.html",
    encapsulation: ViewEncapsulation.None
})
export class FileMultiComponent extends ChangeDetectionComponent implements OnInit {
    @ViewChild('popupFrame') modal: PopupFrameComponent;
    active = false;

    listFile: string[];
    saving: boolean;
    @Input() disabled: boolean;

    @Output() modalSave: EventEmitter<any> = new EventEmitter<any>();
    @Input() folderUpload: string;
    constructor(
        injector: Injector,
        private ultilityService: UltilityServiceProxy,
        private fileDownloadService: FileDownloadService,
    ) {
        super(injector)
    }
    selectedFiles() {

    }
    show(multiFilePath): void {
        this.active = true;
        if(multiFilePath){
            this.listFile = multiFilePath.split('|');

        }
        else{
            this.listFile=[];
        }
        this.modal.show();


    }
    ngOnInit(): void {
        // if (!$('#roxyCustomPanel').length) {
        //     $('body').append(`<div id="roxyCustomPanel" style="display: none;">
        //     <iframe src="/assets/fileman/index.html?integration=custom" id="roxy-fileman" style="width:100%;height:100%" frameborder="0"></iframe>
        // </div>`);
        // }
    }
    showFilePicker() {

        ($('#roxyCustomPanel>iframe#roxy-fileman') as any).attr('folder-upload', this.folderUpload);

        var windowParent: any = window.parent;
        windowParent.refreshFilemanWindow(true);

        ($('#roxyCustomPanel') as any).dialog({ modal: true, width: 875, height: 600 });
        var $scope = this;



        windowParent.onSelectCustomRoxyMulti = function (filePaths: string) {

            let paths = [];
            for (let filePath of filePaths) {
                if (filePath.startsWith('/')) {
                    filePath = filePath.substr(1);
                }
                if (filePath.startsWith('\\')) {
                    filePath = filePath.substr(1);
                }

                paths.push(filePath);
            }
            // var value = paths.join(',');
            // $scope.onChangeCallback(value);
            for(var item of paths){
                if ($scope.listFile.indexOf(item) == -1){
                    $scope.listFile.push(item);

                }
            }
            
            ($('#roxyCustomPanel') as any).dialog('close');
            $scope.updateParentView();
        };
    }
    onShown() {

    }
    save() {
        this.saving = true;
        this.modalSave.emit(this.listFile.join('|'));
        this.close();

    }
    close() {
        this.active = false;
        this.saving = false;
        this.modal.close();
    }
    download(filePath) {
        this.ultilityService.downloadFile(filePath).subscribe(x => {
            this.fileDownloadService.downloadTempFile(x);
        });
    }
    delete(filePath) {
        this.listFile = this.listFile.filter(e => e !== filePath);
    }
}