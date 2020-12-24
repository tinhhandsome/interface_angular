import { Component, Input, OnInit, Injector, ViewEncapsulation, Output, Inject, Optional, ViewChild, ElementRef, inject, OnDestroy, HostListener } from "@angular/core";
import { createCustomInputControlValueAccessor, ControlComponent } from "@app/admin/core/controls/control.component";
import { UltilityServiceProxy, API_BASE_URL, AttachFileServiceProxy, CM_ATTACH_FILE_ENTITY } from "@shared/service-proxies/service-proxies";
import { HttpClient, HttpRequest, HttpHeaders, HttpEventType, HttpResponse } from "@angular/common/http";
import { FileUploaderMultiModalComponent } from "./file-uploader-multi-modal.component";
import { FileDownloadService } from "@shared/utils/file-download.service";
declare const ProgressBar;

declare var $: JQueryStatic;


@Component({
    moduleId: module.id,
    selector: "file-picker",
    templateUrl: "./file-uploader.component.html",
    encapsulation: ViewEncapsulation.None,
    providers: [createCustomInputControlValueAccessor(FileUploaderComponent)]
})

export class FileUploaderComponent extends ControlComponent implements OnInit, OnDestroy {


    private injector: Injector;
    private ultilityService: UltilityServiceProxy;
    private fileDownloadService: FileDownloadService;
    private attachFileService: AttachFileServiceProxy;
    constructor(injector: Injector, @Optional() @Inject(API_BASE_URL) baseUrl?: string) {
        super(injector);
        this.linkServer = baseUrl + this.linkServer;
        this.idProgress = 'f' + this.generateUUID();
        this.injector = injector;
        this.ultilityService = this.injector.get(UltilityServiceProxy);
        this.fileDownloadService = this.injector.get(FileDownloadService);

        if ($('file-multi-modal').length == 0) {
            FileUploaderComponent.fileUploaderMultiModal = undefined;
        }

        if (FileUploaderComponent.fileUploaderMultiModal) {
            this._showMultiFile = false;
        }


        this.fileName = '';

        // console.log(this);
    }

    httpClient: HttpClient;
    idProgress: string;
    linkServer: string = '/RoxyFileman/UPLOAD_W_T';

    @Input() multiFile: boolean = true;

    @Input() disabled: boolean;

    @Input() inpCss: string = 'form-control';

    @ViewChild('fileControl') fileControl: ElementRef;
    @ViewChild('loading') loading: ElementRef;
    @ViewChild('fileMulti') fileMultiModal: FileUploaderMultiModalComponent;
    @ViewChild('control1') control1: ElementRef;
    static fileUploaderMultiModal: FileUploaderMultiModalComponent;

    _showMultiFile = true;

    static g: string;

    get showMultifile() {
        return this._showMultiFile;
    }


    loadingProgress: any;

    afterViewInit() {
        // this.updateView();
        setTimeout(() => {
            this.loadingProgress = new ProgressBar.Circle(this.loading.nativeElement, {
                strokeWidth: 6,
                easing: 'easeInOut',
                duration: 1400,
                color: '#639bb7',
                trailColor: '#eee',
                trailWidth: 1,
                svgStyle: null
            });
        }, 1000)

        if (!FileUploaderComponent.fileUploaderMultiModal) {
            FileUploaderComponent.fileUploaderMultiModal = this.fileMultiModal;
        }
        else {
            this.fileMultiModal = FileUploaderComponent.fileUploaderMultiModal;
        }

        this.updateView();
    }

    fileName: string;

    _ngModel: CM_ATTACH_FILE_ENTITY;
    public get ngModel() {
        return this._ngModel;
    }
    @Input() @Output() public set ngModel(value) {
        if (value) {
            this.fileName = value.filE_NAME_OLD;
        }
        else {
            this.fileName = '';
        }
        this._ngModel = value;
        this.sendValueOut(this._ngModel);
        this.control1.nativeElement.value = this.fileName;
    }
    @Input() folderUpload: string;

    ngOnInit(): void {

    }

    deleteFile() {
        this.ngModel = undefined;
        this.fileName = '';
        this.control1.nativeElement.value = this.fileName;
        this.sendValueOut(this.ngModel);
        this.updateView();
    }

    // @HostListener('window:beforeunload', ['$event'])
    // @HostListener('window:pagehide')
    beforeUnload($event) {

    }

    downloadFile(file: CM_ATTACH_FILE_ENTITY = undefined) {

        if (!file) {
            file = this.ngModel;
        }

        if ((this.multiFile && file == this.ngModel) || !file.filE_NAME_OLD) {
            return;
        }

        if (file) {
            this.ultilityService.downloadFile(file.patH_NEW + '/' + file.filE_NAME_NEW).subscribe(f => {
                f.fileName = file.filE_NAME_OLD;
                this.fileDownloadService.downloadTempFile(f);
            })
        }
    }

    importFileFromServer() {
        this.fileControl.nativeElement.click();
    }

    async uploadFile(evt) {
        if (!evt.target.value) {
            return;
        }
        await this.fileUpload(undefined);
    }

    getCookie(name) {
        var value = "; " + document.cookie;
        var parts = value.split("; " + name + "=");
        if (parts.length == 2) return parts.pop().split(";").shift();
    }

    updateUploadProgress(evt, i) {
        if (evt.lengthComputable) {
            var percentComplete = evt.loaded / evt.total;
            this.loadingProgress.animate(percentComplete);
        }
        console.log('updateUploadProgress')
    }

    uploadComplete(e, i) {
        if (this.multiFile) {
            this.fileMultiModal.uploadComplete(e, i);
            return;
        }
        this.ngModel = e.body.result.cM_ATTACH_FILE_ENTITY;
        this.ngModel['toJSON'] = this.toJSON;
        this.hideLoading();
        this.updateView();
    }

    uploadError(e, i) {
        this.hideLoading();
        console.log('uploadError')
    }

    uploadCanceled(e, i) {
        this.hideLoading();
        console.log('uploadCanceled')
    }

    showLoading() {
        // $(this.loading.nativeElement).show();
    }

    hideLoading() {
        this.loadingProgress.set(0);
        // $(this.loading.nativeElement).hide();
    }


    progressbar: any;

    deleteFiles(fileNames: string[]) {
        this.ultilityService.dEL_F(fileNames).subscribe(() => {

        })
    }

    async fileUpload(i) {

        this.httpClient = this.injector.get(HttpClient);
        let scope = this;

        let el = scope.fileControl.nativeElement;

        let tokenAuth = scope.getCookie('Abp.AuthToken');
        // let http = new XMLHttpRequest();


        // http.upload.addEventListener("progress", function (e) { scope.updateUploadProgress(e, i); }, false);
        // http.addEventListener("load", function (e) { scope.uploadComplete(e, i); }, false);
        // http.addEventListener("error", function (e) { scope.uploadError(e, i); }, false);
        // http.addEventListener("abort", function (e) { scope.uploadCanceled(e, i); }, false);
        // http.open("POST", scope.linkServer);

        let headers = { 'Authorization': 'Bearer ' + tokenAuth, 'Accept': 'application/json, text/plain, */*', 'Access-Encoding': 'gzip, deflate', 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET, POST, PATCH, PUT, DELETE, OPTIONS', 'Access-Control-Allow-Headers': 'Origin, Content-Type, X-Auth-Token' };


        const endpoint = scope.linkServer;

        let fData = new FormData();
        fData.append("action", 'upload');
        fData.append("method", 'ajax');
        fData.append("d", scope.folderUpload);

        for (var inn = 0; inn < el.files.length; inn++) {
            fData.append("files[]", el.files[inn]);
        }

        let h = new HttpHeaders();

        Object.keys(headers).forEach(k => {
            h.append(k, headers[k]);
        })

        try {

            const req = new HttpRequest('POST', endpoint, fData, { headers: h, reportProgress: true, });

            //let sub = this.httpClient.request(req).toPromise();

            // let event = await sub;

            // scope.uploadComplete(event, undefined);

            this.httpClient.request(req).subscribe(event => {
                if (event.type === HttpEventType.UploadProgress) {
                    console.log(event);
                    const percentDone = Math.round(event.loaded * 10 / event.total) / 10;
                    console.log(`File is ${percentDone}% uploaded.`);

                    // if (!this.progressbar) {
                    //     this.progressbar = new ProgressBar.Circle('#' + this.idProgress, {
                    //         strokeWidth: 6,
                    //         easing: 'easeInOut',
                    //         duration: 1400,
                    //         color: '#639bb7',
                    //         trailColor: '#eee',
                    //         trailWidth: 1,
                    //         svgStyle: null
                    //     });
                    // }
                    // try {
                    //     this.progressbar.animate(percentDone);
                    // }
                    // catch {

                    // }

                } else if (event instanceof HttpResponse) {
                    scope.uploadComplete(event, undefined);
                    // sub.unsubscribe();
                }
            })

            // console.log(event);


            // 

        } catch (err) {
            console.log(err);
        }

        //    .post(endpoint, fData, { headers: headers, reportProgress: true, });
        //   .catch((e) => this.handleError(e));

        // Object.keys(headers).forEach(k => {
        //     http.setRequestHeader(k, headers[k]);
        // })
        // http.setRequestHeader("Accept", "*/*");
        //   http.setRequestHeader("Authorization", 'Bearer ' + tokenAuth);

        //http.fetch(fData);
        //    http.send(fData);

    }

    // getMultiFile


    getMultiFile(event) {
        var $scope = this;
        $scope.onChangeCallback(event);
        $scope.ngModel = event;
        $scope.updateParentView();
    }

    protected onChange() {
    }

    ngOnDestroy(): void {
        console.log('ngOnDestroy');
    }
}