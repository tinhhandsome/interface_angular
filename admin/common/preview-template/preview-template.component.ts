import { AfterViewChecked, Component, ElementRef, EventEmitter, Injector, Output, ViewChild, OnInit, ViewEncapsulation } from '@angular/core';
import { AppConsts } from '@shared/AppConsts';
import { AppComponentBase } from '@shared/common/app-component-base';
import { ModalDirective } from 'ngx-bootstrap';
import * as _ from 'lodash';
import { finalize } from 'rxjs/operators';
import { LoginMethod } from '@app/ultilities/enum/login-method';
import { WebConsts } from '@app/ultilities/enum/consts';
import { NgForm, FormGroup, FormControl } from '@angular/forms';
import { LdapResultStatusConsts } from '@app/ultilities/enum/ldap-result-status-consts';
import { RecordStatusConsts } from '@app/admin/core/ultils/consts/RecordStatusConsts';
import { AuthStatusConsts } from '@app/admin/core/ultils/consts/AuthStatusConsts';
import { appModuleAnimation } from '@shared/animations/routerTransition';
import { DefaultComponentBase } from '@app/ultilities/default-component-base';
import { FileDownloadService } from '@shared/utils/file-download.service';
import { ReportNoteModalComponent } from '../../core/controls/report-note-modal/report-note-modal.component';
import { PreviewTemplateService } from './preview-template.service';
import { ReportTable, CM_REPORT_TEMPLATE_DETAIL_ENTITY, CM_REPORT_TEMPLATE_ENTITY, AsposeServiceProxy, ReportTemplateServiceProxy, ReportHtmlInfo, ReportInfo, ReportParameter } from '@shared/service-proxies/service-proxies';
declare var $: JQueryStatic;

@Component({
    templateUrl: './preview-template.component.html',
    styleUrls: ['./preview-template.css'],
    encapsulation: ViewEncapsulation.None,
    animations: [appModuleAnimation()],
})
export class PreviewTemplateComponent extends DefaultComponentBase implements OnInit {
    @ViewChild('editForm') editForm: ElementRef;

    @ViewChild('reportNoteModal') reportNoteModal: ReportNoteModalComponent;

    disabled: boolean = true;
    storeData: ReportTable[];


    reportTemplateItems: CM_REPORT_TEMPLATE_ENTITY[];
    reportTemplateModel = new CM_REPORT_TEMPLATE_ENTITY();

    reportTemplateDetailItems: CM_REPORT_TEMPLATE_DETAIL_ENTITY[];
    reportTemplateDetailModel = new CM_REPORT_TEMPLATE_DETAIL_ENTITY();
    isShowError = false;
    constructor(
        injector: Injector,
        private _reportService: AsposeServiceProxy,
        private _reportTemplateService: ReportTemplateServiceProxy,
        private _fileDownloadService: FileDownloadService,
        private _templateService: PreviewTemplateService,


    ) {
        super(injector);
    }

    ngOnInit(): void {


        var template = new CM_REPORT_TEMPLATE_ENTITY();
        template.maxResultCount = 1000;
        this._reportTemplateService.cM_REPORT_TEMPLATE_Search(template).subscribe(response => {
            this.reportTemplateItems = response.items;
            this.updateView();
        });







    }

    noteDialog() {

    }
    onChange() {
        // if (!this.reportTemplateModel.reporT_TEMPLATE_ID || !this.reportTemplateDetailModel.reporT_TEMPLATE_DETAIL_ID) {
        //     this.reportTemplateDetailModel.reporT_TEMPLATE_DETAIL_CONTENT = "";
        // }

        // this.reportContent = this.reportTemplateDetailModel.reporT_TEMPLATE_DETAIL_CONTENT;

        // this.reportContent = this._templateService.ReloadDataFromStoreToPreview(this.reportContent, this.storeData);

        // if (this.reportContent) {
        //     document.getElementsByClassName("previewContent")[0].innerHTML = this.reportContent;
        // } else {
        //     document.getElementsByClassName("previewContent")[0].innerHTML = "";
        // }
    }

    saveTemplate() {

        if ((this.editForm as any).form.invalid) {
            this.isShowError = true;
            this.showErrorMessage(this.l('FormInvalid'));
            return;
        }

        if (this.reportTemplateModel.reporT_TEMPLATE_ID && this.reportTemplateDetailModel.reporT_TEMPLATE_DETAIL_ID) {
            this._reportTemplateService.cM_REPORT_TEMPLATE_DETAIL_Upd(this.reportTemplateDetailModel).pipe(finalize(() => { }))
                .subscribe((response) => {
                    if (response.result != '0') {
                        this.showErrorMessage(response.errorDesc);
                    }
                    else {
                        this.showSuccessMessage(this.l('UpdateSuccessful'));
                    }
                });
        }

        else {
            this.showErrorMessage(this.l('UpdateError'));

        }
    }
    onChangePageSize(event) {

        if (this.reportTemplateDetailModel.reporT_TEMPLATE_DETAIL_ID) {

            this._reportTemplateService.cM_REPORT_TEMPLATE_DETAIL_ById(this.reportTemplateDetailModel.reporT_TEMPLATE_DETAIL_ID).subscribe(x => {

                this.reportTemplateDetailModel = x;
                this.updateView();

            });
        }

    }




    onChangeTemplate(event) {

        this.reportTemplateModel = Object.assign({}, this.reportTemplateItems.find(x => x.reporT_TEMPLATE_ID == this.reportTemplateModel.reporT_TEMPLATE_ID));

        this._reportTemplateService.cM_REPORT_TEMPLATE_DETAIL_ByTemplateId(this.reportTemplateModel.reporT_TEMPLATE_ID).subscribe(response => {
            this.reportTemplateDetailItems = response;
            if (this.reportTemplateModel.reporT_TEMPLATE_STORE) {
                var storeInfo = new ReportInfo();
                storeInfo.storeName = this.reportTemplateModel.reporT_TEMPLATE_STORE;
                storeInfo.parameters = null;
                storeInfo.values = [];
                this._reportService.getDataFromStore(storeInfo).subscribe(x => {
                    this.reportTemplateDetailModel = Object.assign({}, response.find(x => x.isDefault == true));
                    this.storeData = x;
                    this.updateView();
                });
            }
            // this.onChange();


        });
    }
    exportWordReport() {
        if ((this.editForm as any).form.invalid) {
            this.isShowError = true;
            this.showErrorMessage(this.l('DownloadError'));
            return;
        }
        var reportInfo = new ReportHtmlInfo();
        // reportInfo.parammeters = [];
        // reportInfo.values = [];

        reportInfo.typeExport = "w";

        // reportInfo.htmlString = this.reportContent;
        // reportInfo.htmlString = this._templateService.ReloadDataFromStoreToPreview(this.reportTemplateDetailModel.reporT_TEMPLATE_DETAIL_CONTENT, this.storeData);
        reportInfo.fileName = this.reportTemplateItems.find(x => x.reporT_TEMPLATE_ID == this.reportTemplateModel.reporT_TEMPLATE_ID).reporT_TEMPLATE_NAME;
        reportInfo.pageInfo = this.reportTemplateDetailItems.find(x => x.reporT_TEMPLATE_DETAIL_ID == this.reportTemplateDetailModel.reporT_TEMPLATE_DETAIL_ID).pagE_SIZE;

        this._templateService.ReloadDataFromStoreToPreview(this.reportTemplateDetailModel.reporT_TEMPLATE_DETAIL_CONTENT, this.storeData).then(result => {
            reportInfo.htmlString = result;
            this._reportService.getReportFromHTML(reportInfo).subscribe(x => {
                //this.reportStoreData = x;
                this._fileDownloadService.downloadTempFile(x);
                this.showSuccessMessage(this.l('DownloadSuccessful'));

            });
        });
        // reportInfo.pathName = "nestedWordTemplate.docx";
        // reportInfo.storeName = "TestReportCustomer";

    }

    printContent() {

        // var newWin = window.open('', 'Print-Document');

        // newWin.document.open();

        // newWin.document.write(this._templateService.ReloadDataFromStoreToPreview(this.reportTemplateDetailModel.reporT_TEMPLATE_DETAIL_CONTENT, this.storeData));
        // newWin.print();
        // newWin.document.close();
        // newWin.close();
        this._templateService.printContent(this.reportTemplateDetailModel.reporT_TEMPLATE_DETAIL_CONTENT, this.storeData);
    }
    showReportNoteModal(reporT_TEMPLATE_STORE) {

        this.reportNoteModal.show(this.storeData);

    }

}
