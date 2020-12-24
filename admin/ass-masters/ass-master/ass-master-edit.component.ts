import { Component, Injector, ViewChild, Output, EventEmitter, OnInit, ViewEncapsulation, ElementRef } from '@angular/core';
import { appModuleAnimation } from '@shared/animations/routerTransition';
import * as _ from 'lodash';
import { AssMasterServiceProxy, ASS_MASTER_ENTITY, UltilityServiceProxy, ASS_MASTER_LIQ_ENTITY, ASS_MASTER_REPAIR_OPERATION, ASS_MASTER_USE_ENTITY, ASS_MASTER_REPAIR_DETAIL, ASS_MASTER_AMORT, ReportInfo, AsposeServiceProxy, CM_ATTACH_FILE_MODEL, AttachFileServiceProxy, ASS_MASTER_FILE_DETAIL } from '@shared/service-proxies/service-proxies';
import { EditPageState } from '@app/ultilities/enum/edit-page-state';
import { finalize } from 'rxjs/operators';
import { DefaultComponentBase } from '@app/ultilities/default-component-base';
import { IUiAction } from '@app/ultilities/ui-action';
import { AuthStatusConsts } from '@app/admin/core/ultils/consts/AuthStatusConsts';
import { RecordStatusConsts } from '@app/admin/core/ultils/consts/RecordStatusConsts';
import { EditableTableComponent } from '@app/admin/core/controls/editable-table/editable-table.component';
import { ReportTypeConsts } from '@app/admin/core/ultils/consts/ReportTypeConsts';
import { FileDownloadService } from '@shared/utils/file-download.service';

@Component({
    templateUrl: './ass-master-edit.component.html',
    encapsulation: ViewEncapsulation.None,
    animations: [appModuleAnimation()]
})

export class AssMasterEditComponent extends DefaultComponentBase implements OnInit, IUiAction<ASS_MASTER_ENTITY> {
    constructor(
        injector: Injector,
        private asposeService: AsposeServiceProxy,
        private ultilityService: UltilityServiceProxy,
        private fileDownloadService: FileDownloadService,
        private assMasterService: AssMasterServiceProxy
    ) {
        super(injector);
        this.editPageState = this.getRouteData('editPageState');
        this.inputModel.asseT_ID = this.getRouteParam('id');
        this.initFilter();
        this.initCombobox();
        this.initIsApproveFunct();
        this.inputModel.asS_MASTER_LIQ_ENTITYs = new ASS_MASTER_LIQ_ENTITY();
        // COMMENT: this.stopAutoUpdateView();

    }

    @ViewChild('editForm') editForm: ElementRef;
    @ViewChild('editableOperationUseExe') editableOperationUseExe: EditableTableComponent<ASS_MASTER_USE_ENTITY>;
    @ViewChild('editableOperationRepairExe') editableOperationRepairExe: EditableTableComponent<ASS_MASTER_REPAIR_OPERATION>;
    @ViewChild('editableRepairDetail') editableRepairDetail: EditableTableComponent<ASS_MASTER_REPAIR_DETAIL>;
    @ViewChild('editableAmort') editableAmort: EditableTableComponent<ASS_MASTER_AMORT>
    @ViewChild('editableFileAttachment') editableFileAttachment : EditableTableComponent<ASS_MASTER_FILE_DETAIL>

    EditPageState = EditPageState;
    editPageState: EditPageState;

    inputModel: ASS_MASTER_ENTITY = new ASS_MASTER_ENTITY();
    filterInput: ASS_MASTER_ENTITY;
    isApproveFunct: boolean;

    files: CM_ATTACH_FILE_MODEL[];

    get disableInput(): boolean {
        return this.editPageState == EditPageState.viewDetail;
    }

    isShowError = false;

    ngOnInit(): void {
        switch (this.editPageState) {
            case EditPageState.viewDetail:
                this.appToolbar.setRole('AssMaster', false, false, false, false, false, false, true, false);
                this.appToolbar.setEnableForViewDetailPage();
                this.getAssMaster();
                break;
        }
        this.appToolbar.setUiAction(this);
        this.initFiles();
    }

    initFiles() {
        // this.attachFileService.cM_ATTACH_FILE_By_RefMaster()
    }

    initIsApproveFunct() {
        this.ultilityService.isApproveFunct(this.getCurrentFunctionId()).subscribe(isApproveFunct => {
            this.isApproveFunct = isApproveFunct;
        })
    }

    initCombobox() {

    }

    getAssMaster() {
        this.assMasterService.aSS_MASTER_ViewDetail(this.inputModel.asseT_ID).subscribe(response => {
            this.inputModel = response;
            this.editableAmort.setList(response.asS_MASTER_AMORTs || []);
            this.editableOperationRepairExe.setList(response.asS_MASTER_REPAIR_OPERATIONs || []);
            this.editableOperationUseExe.setList(response.asS_MASTER_USE_ENTITYs || []);
            this.editableRepairDetail.setList(response.asS_MASTER_REPAIR_DETAILs || []);
            this.editableFileAttachment.setList(response.asS_MASTER_FILE_DETAILs || []);

            // CM_ATTACH_FILE ASS_ADD_NEW
            this.getFile(this.inputModel.addneW_ID, this.inputModel);

            // CM_ATTACH_FILE ASS_LIQUIDATION
            this.getFile(this.inputModel.asS_MASTER_LIQ_ENTITYs.liQ_ID, this.inputModel.asS_MASTER_LIQ_ENTITYs);

            // CM_ATTACH_FILE ASS_REPAIR_MULTI
            this.getFileByRefIds(response.asS_MASTER_REPAIR_OPERATIONs, 'repaiR_ID');

            if (this.inputModel.autH_STATUS == AuthStatusConsts.Approve) {
                this.appToolbar.setButtonApproveEnable(false);
            }
            this.updateView();
        });
    }

    saveInput() {

    }

    goBack() {
        this.navigatePassParam('/app/admin/ass-master', null, { filterInput: JSON.stringify(this.filterInput) });
    }

    onAdd(): void {
    }

    onUpdate(item: ASS_MASTER_ENTITY): void {
    }

    onDelete(item: ASS_MASTER_ENTITY): void {
    }

    onApprove(item: ASS_MASTER_ENTITY): void {
        if (!this.inputModel.asseT_ID) {
            return;
        }
        var currentUserName = this.appSession.user.userName;
        if (currentUserName == this.inputModel.makeR_ID) {
            this.showErrorMessage(this.l('ApproveFailed'));
            return;
        }
        this.message.confirm(
            this.l('ApproveWarningMessage', this.l(this.inputModel.asseT_NAME)),
            this.l('AreYouSure'),
            (isConfirmed) => {
                if (isConfirmed) {
                    this.saving = true;
                    this.assMasterService.aSS_MASTER_App(this.inputModel.asseT_ID, currentUserName)
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

    onViewDetail(item: ASS_MASTER_ENTITY): void {
    }

    exportExcel() {
        let reportInfo = new ReportInfo();
        reportInfo.typeExport = ReportTypeConsts.Excel;

        reportInfo.parameters = this.GetParamsFromFilter({ ASSET_ID: this.inputModel.asseT_ID });
        reportInfo.values = this.GetParamsFromFilter({ ASSET_CODE: this.inputModel.asseT_CODE });

        reportInfo.pathName = "/ASS_MASTER/ASSET_LIST.xlsx";
        reportInfo.storeName = "rpt_ASS_MASTER_REPORT";

        this.asposeService.getReport(reportInfo).subscribe(x => {
            this.fileDownloadService.downloadTempFile(x);
        });

    }

    download(filePath) {
        this.ultilityService.downloadFile(filePath).subscribe(x => {
            this.fileDownloadService.downloadTempFile(x);
        });
    }

    onSave(): void {
        this.saveInput();
    }

    onSearch(): void {
    }

    onResetSearch(): void {
    }
}
