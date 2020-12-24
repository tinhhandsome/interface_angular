import { Component, Injector, ViewChild, Output, EventEmitter, OnInit, ViewEncapsulation, ElementRef, AfterViewInit } from '@angular/core';
import { appModuleAnimation } from '@shared/animations/routerTransition';
import * as _ from 'lodash';
import { ReportTemplateServiceProxy, CM_REPORT_TEMPLATE_ENTITY, RoleServiceProxy, AppPermissionServiceProxy, AppMenuDto, AppMenuServiceProxy, CM_WORKFLOW_ASSIGN_ENTITY, RoleListDto, UltilityServiceProxy, CM_REPORT_TEMPLATE_DETAIL_ENTITY, ReportInfo, AsposeServiceProxy as ReportServiceProxy } from '@shared/service-proxies/service-proxies';
import { EditPageState } from '@app/ultilities/enum/edit-page-state';
import { AllCodes } from '@app/ultilities/enum/all-codes';
import { finalize } from 'rxjs/operators';
import { DefaultComponentBase } from '@app/ultilities/default-component-base';
import { IUiAction } from '@app/ultilities/ui-action';
import { AuthStatusConsts } from '@app/admin/core/ultils/consts/AuthStatusConsts';
import { RecordStatusConsts } from '@app/admin/core/ultils/consts/RecordStatusConsts';
import { EditableTableComponent } from '@app/admin/core/controls/editable-table/editable-table.component';
import { PreviewTemplateModalComponent } from './preview-template-modal.component';

@Component({
    templateUrl: './report-template-edit.component.html',
    encapsulation: ViewEncapsulation.None,
    animations: [appModuleAnimation()]
})
export class ReportTemplateEditComponent extends DefaultComponentBase implements OnInit, IUiAction<CM_REPORT_TEMPLATE_ENTITY>, AfterViewInit {
    constructor(
        injector: Injector,
        private ultilityService: UltilityServiceProxy,
        private reportTemplateService: ReportTemplateServiceProxy,
        private _reportService: ReportServiceProxy,

    ) {
        super(injector);
        this.editPageState = this.getRouteData('editPageState');
        this.inputModel.reporT_TEMPLATE_ID = this.getRouteParam('id');
        this.initFilter();
        this.initCombobox();
        this.initIsApproveFunct();
    }

    @ViewChild('editForm') editForm: ElementRef;
    @ViewChild('editTable') editTable: EditableTableComponent<CM_REPORT_TEMPLATE_DETAIL_ENTITY>;
    @ViewChild('previewTemplateModal') previewTemplateModal: PreviewTemplateModalComponent;

    EditPageState = EditPageState;
    AllCodes = AllCodes;
    editPageState: EditPageState;
    menus: AppMenuDto[];
    roles: RoleListDto[];

    inputModel: CM_REPORT_TEMPLATE_ENTITY = new CM_REPORT_TEMPLATE_ENTITY();
    filterInput: CM_REPORT_TEMPLATE_ENTITY;
    isApproveFunct: boolean;


    get disableInput(): boolean {
        return this.editPageState == EditPageState.viewDetail;
    }

    isShowError = false;

    ngOnInit(): void {
        switch (this.editPageState) {
            case EditPageState.add:
                this.inputModel.recorD_STATUS = RecordStatusConsts.Active;
                this.inputModel.reporT_TEMPLATE_DETAILs = [];
                this.editTable.setList(this.inputModel.reporT_TEMPLATE_DETAILs);
                this.appToolbar.setRole('ReportTemplate', false, false, true, false, false, false, false, false);
                this.appToolbar.setEnableForEditPage();
                break;
            case EditPageState.edit:
                this.appToolbar.setRole('ReportTemplate', false, false, true, false, false, false, false, false);
                this.appToolbar.setEnableForEditPage();
                this.getReportTemplate();
                break;
            case EditPageState.viewDetail:
                this.appToolbar.setRole('ReportTemplate', false, false, false, false, false, false, true, false);
                this.appToolbar.setEnableForViewDetailPage();
                this.getReportTemplate();
                break;
        }

        this.appToolbar.setUiAction(this);
    }

    ngAfterViewInit(): void {
        // COMMENT: this.stopAutoUpdateView();
        this.setupValidationMessage();
    }

    initIsApproveFunct() {
        this.ultilityService.isApproveFunct(this.getCurrentFunctionId()).subscribe(isApproveFunct => {
            this.isApproveFunct = isApproveFunct;
        })
    }

    initCombobox() {

        // this.roleService.getRoles('').subscribe(response => {
        //     this.roles = response.items;
        //     this.roles.forEach(x => {
        //         x.displayName = this.l(x.displayName);
        //     })
        // })
    }

    addNewPlan() {
        var item = new CM_REPORT_TEMPLATE_DETAIL_ENTITY();
        item.pagE_SIZE = 'A4';
        this.editTable.pushItem(item);
        this.updateView();
    }


    getReportTemplate() {
        this.reportTemplateService.cM_REPORT_TEMPLATE_ById(this.inputModel.reporT_TEMPLATE_ID).subscribe(response => {
            this.inputModel = response;
            this.editTable.setList(this.inputModel.reporT_TEMPLATE_DETAILs);
            if (this.inputModel.autH_STATUS == AuthStatusConsts.Approve) {
                this.appToolbar.setButtonApproveEnable(false);
            }
            this.updateView();
        });
    }

    saveInput() {

        if (this.isApproveFunct == undefined) {
            this.showErrorMessage(this.l('PageLoadUndone'));
            return;
        }

        if ((this.editForm as any).form.invalid) {
            this.isShowError = true;
            this.showErrorMessage(this.l('FormInvalid'));
            return;
        }
        if (this.editPageState != EditPageState.viewDetail) {
            this.inputModel.reporT_TEMPLATE_DETAILs = this.editTable.allData;

            this.saving = true;
            this.inputModel.makeR_ID = this.appSession.user.userName;
            if (!this.inputModel.reporT_TEMPLATE_ID) {
                this.reportTemplateService.cM_REPORT_TEMPLATE_Ins(this.inputModel).pipe(finalize(() => { this.saving = false; }))
                    .subscribe((response) => {
                        if (response.result != '0') {
                            this.showErrorMessage(response.errorDesc);
                        }
                        else {
                            this.addNewSuccess();
                            if (!this.isApproveFunct) {
                                this.reportTemplateService.cM_REPORT_TEMPLATE_App(response.id, this.appSession.user.userName)
                                    .pipe(finalize(() => { this.saving = false; }))
                                    .subscribe((response) => {
                                        if (response.result != '0') {
                                            this.showErrorMessage(response.errorDesc);
                                        }
                                    });
                            }
                        }
                    });
            }
            else {
                this.reportTemplateService.cM_REPORT_TEMPLATE_Upd(this.inputModel).pipe(finalize(() => { this.saving = false; }))
                    .subscribe((response) => {
                        if (response.result != '0') {
                            this.showErrorMessage(response.errorDesc);
                        }
                        else {
                            this.updateSuccess();
                            if (!this.isApproveFunct) {
                                this.reportTemplateService.cM_REPORT_TEMPLATE_App(this.inputModel.reporT_TEMPLATE_ID, this.appSession.user.userName)
                                    .pipe(finalize(() => { this.saving = false; }))
                                    .subscribe((response) => {
                                        if (response.result != '0') {
                                            this.showErrorMessage(response.errorDesc);
                                        }
                                        else {
                                            this.inputModel.autH_STATUS = AuthStatusConsts.Approve;
                                            this.updateView();
                                        }
                                    });
                            }
                            else {
                                this.inputModel.autH_STATUS = AuthStatusConsts.NotApprove;
                                this.updateView();
                            }
                        }
                    });
            }
        }
    }

    goBack() {
        this.navigatePassParam('/app/admin/reporttemplate', null, { filterInput: JSON.stringify(this.filterInput) });
    }

    onAdd(): void {
    }
    onUpdate(item: CM_REPORT_TEMPLATE_ENTITY): void {
    }
    onDelete(item: CM_REPORT_TEMPLATE_ENTITY): void {
    }
    onApprove(item: CM_REPORT_TEMPLATE_ENTITY): void {
        var currentUserName = this.appSession.user.userName;
        if (currentUserName == this.inputModel.makeR_ID) {
            this.showErrorMessage(this.l('ApproveFailed'));
            return;
        }
        this.message.confirm(
            this.l('ApproveWarningMessage', this.l(this.inputModel.reporT_TEMPLATE_ID)),
            this.l('AreYouSure'),
            (isConfirmed) => {
                if (isConfirmed) {
                    this.saving = true;
                    this.reportTemplateService.cM_REPORT_TEMPLATE_App(this.inputModel.reporT_TEMPLATE_ID, currentUserName)
                        .pipe(finalize(() => { this.saving = false; }))
                        .subscribe((response) => {
                            if (response.result != '0') {
                                this.showErrorMessage(response.errorDesc);
                            }
                            else {
                                this.approveSuccess();
                            }
                        });
                }
            }
        );
    }

    onViewDetail(item: CM_REPORT_TEMPLATE_ENTITY): void {
    }

    onSave(): void {
        this.saveInput();
    }

    onSearch(): void {
    }

    onResetSearch(): void {
    }
    defaultChange(no) {
        this.editTable.allData.forEach(function (element) {
            if (element.no == no) {
                element.isDefault = true;
            }
            else {
                element.isDefault = false;
            }
        });
    }
    no: any;
    showPreviewModal(templateContent: string, no) {
        var storeInfo = new ReportInfo();

        storeInfo.storeName = this.inputModel.reporT_TEMPLATE_STORE;
        storeInfo.parameters = null;
        var reportTable;
        this.no = no;

        this._reportService.getDataFromStore(storeInfo).subscribe(result => {
            reportTable = result;
            this.previewTemplateModal.show(templateContent, reportTable);
            this.updateView();
        });
    }
    changeTemplateContent(event) {
        if (event) {
            let no = this.no;
            this.editTable.allData.forEach(function (element) {
                if (element.no == no) {
                    element.reporT_TEMPLATE_DETAIL_CONTENT = event;
                }
            });
            this.updateView();
        }
    }

}
