import { EventEmitter, Component, Input, OnInit, Injector, ViewEncapsulation, Output } from "@angular/core";
import { createCustomInputControlValueAccessor, ControlComponent } from "@app/admin/core/controls/control.component";
import { DepartmentServiceProxy, CM_DEPARTMENT_ENTITY, UltilityServiceProxy } from "@shared/service-proxies/service-proxies";
import { forEach } from "@angular/router/src/utils/collection";
import { FileDownloadService } from "@shared/utils/file-download.service";

declare var $: JQueryStatic;


@Component({
    selector: "file-modal",
    templateUrl: "./file-picker.component.html",
    encapsulation: ViewEncapsulation.None,
    providers: [createCustomInputControlValueAccessor(FilePickerComponent)]
})

export class FilePickerComponent extends ControlComponent implements OnInit {

    _ngModel: string;

    @Input() disabled: boolean;

    @Input() multiFile: boolean = true;

    public get ngModel(): any {
        
        return this._ngModel;
    }

    @Input() @Output() public set ngModel(value) {
        this._ngModel = value;
    }

    @Input() inpCss: string;
    @Input() folderUpload: string;

    constructor(
        injector: Injector,
        private ultilityService: UltilityServiceProxy,
        private fileDownloadService: FileDownloadService,
    ) {
        super(injector)
    }

    ngOnInit(): void {
        if (!$('#roxyCustomPanel').length) {
            $('body').append(`<div id="roxyCustomPanel" style="display: none;">
            <iframe src="/assets/fileman/index.html?integration=custom" id="roxy-fileman" style="width:100%;height:100%" frameborder="0"></iframe>
        </div>`);
            ($('#roxyCustomPanel') as any).dialog().dialog('close');
        }
    }

    importFileFromServer() {

        ($('#roxyCustomPanel>iframe#roxy-fileman') as any).attr('folder-upload', this.folderUpload);

        var windowParent: any = window.parent;
        windowParent.refreshFilemanWindow(this.multiFile);

        ($('#roxyCustomPanel') as any).dialog({ modal: true, width: 875, height: 600 });
        var $scope = this;


        windowParent.onSelectCustomRoxy = function (filePath: string) {
            if (filePath.startsWith('/')) {
                filePath = filePath.substr(1);
            }
            if (filePath.startsWith('\\')) {
                filePath = filePath.substr(1);
            }
            $scope.onChangeCallback(filePath);
            $scope.ngModel = filePath;
            ($('#roxyCustomPanel') as any).dialog('close');
            $scope.updateParentView();
        };

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
            var value = paths.join(',');
            $scope.onChangeCallback(value);
            $scope.ngModel = value;
            ($('#roxyCustomPanel') as any).dialog('close');
            $scope.updateParentView();
        };
    }
    getMultiFile(event) {
        var $scope = this;
        $scope.onChangeCallback(event);
        $scope.ngModel = event;
        $scope.updateParentView();
    }
    deleteFile() {
        var $scope = this;
        $scope.onChangeCallback(undefined);
        $scope.ngModel = undefined;
        $scope.updateParentView();

    }
    downloadFile() {
        if (!this.multiFile) {
            if (this.ngModel) {
                this.ultilityService.downloadFile(this.ngModel).subscribe(file => {
                    this.fileDownloadService.downloadTempFile(file);
                })
            }
        }
    }
}