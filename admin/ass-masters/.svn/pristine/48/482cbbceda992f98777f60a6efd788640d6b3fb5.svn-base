import { Component, Injector, ViewChild, Output, EventEmitter, OnInit, ViewEncapsulation, ElementRef, AfterViewChecked, AfterViewInit } from '@angular/core';
import { appModuleAnimation } from '@shared/animations/routerTransition';
import * as _ from 'lodash';
import { AssRepairMultiMasterServiceProxy, ASS_REPAIR_MULTI_MASTER_ENTITY, UltilityServiceProxy, ASS_REPAIR_MULTI_DT_ENTITY, ASS_MASTER_ENTITY, CM_EMPLOYEE_ENTITY, ReportInfo, ListAssetId } from '@shared/service-proxies/service-proxies';
import { EditPageState } from '@app/ultilities/enum/edit-page-state';
import { finalize } from 'rxjs/operators';
import { DefaultComponentBase } from '@app/ultilities/default-component-base';
import { IUiAction } from '@app/ultilities/ui-action';
import { AuthStatusConsts } from '@app/admin/core/ultils/consts/AuthStatusConsts';
import { RecordStatusConsts } from '@app/admin/core/ultils/consts/RecordStatusConsts';
import * as moment from 'moment';
import { EditableTableComponent } from '@app/admin/core/controls/editable-table/editable-table.component';
import { PreviewTemplateService } from '@app/admin/common/preview-template/preview-template.service';
import { AssetModalComponent } from '@app/admin/core/controls/asset-modal/asset-modal.component';
import { NgForm } from '@angular/forms';

@Component({
    templateUrl: './ass-multi-repair-edit.component.html',
    encapsulation: ViewEncapsulation.None,
    animations: [appModuleAnimation()]
})

export class AssRepairMultiEditComponent extends DefaultComponentBase implements OnInit, IUiAction<ASS_REPAIR_MULTI_MASTER_ENTITY>, AfterViewInit {
    @ViewChild('editTableAsset') editTableAsset: EditableTableComponent<ASS_REPAIR_MULTI_DT_ENTITY>
    @ViewChild('editableRepairOffer') editableRepairOffer: EditableTableComponent<ASS_REPAIR_MULTI_DT_ENTITY>
    @ViewChild('editableRepairRecent') editableRepairRecent: EditableTableComponent<ASS_REPAIR_MULTI_DT_ENTITY>
    @ViewChild('editableRepairRealTime') editableRepairRealTime: EditableTableComponent<ASS_REPAIR_MULTI_DT_ENTITY>
    @ViewChild('assetMasterModal') assetMasterModal: AssetModalComponent

    ngAfterViewInit(): void {
        this.setupValidationMessage();



        // this.editTableAsset.tableState.editTables.push(this.editTableAsset);
        // this.editTableAsset.tableState.editTables.push(this.editableRepairRecent);
        // this.editTableAsset.tableState.editTables.push(this.editableRepairRealTime);
        // this.editTableAsset.tableState.editTables.push(this.editableRepairOffer);

        this.updateView();
    }

    isApprove: boolean = false;

    constructor(
        injector: Injector,
        private ultilityService: UltilityServiceProxy,
        private assMultiRepairService: AssRepairMultiMasterServiceProxy,
        private _previewTemplateService: PreviewTemplateService
    ) {
        super(injector);
        this.editPageState = this.getRouteData('editPageState');
        this.inputModel = new ASS_REPAIR_MULTI_MASTER_ENTITY();
        this.inputModel.repaiR_MUL_ID = this.getRouteParam('id');
        this.inputModel.ngaY_THUC_HIEN = moment().startOf('day');
        this.inputModel.brancH_ID = this.appSession.user.subbrId;
        this.initFilter();
        this.initCombobox();
        this.initIsApproveFunct();
        // COMMENT: this.stopAutoUpdateView();
        // console.log(this);
    }

    @ViewChild('editForm') editForm: NgForm;
    @ViewChild('editTableAssetForm') editTableAssetForm: NgForm;


    EditPageState = EditPageState;
    editPageState: EditPageState;

    inputModel: ASS_REPAIR_MULTI_MASTER_ENTITY;;
    filterInput: ASS_REPAIR_MULTI_MASTER_ENTITY;
    isApproveFunct: boolean;

    get disableInput(): boolean {
        return this.editPageState == EditPageState.viewDetail || this.editPageState == EditPageState.edit;
    }

    isShowError = false;

    ngOnInit(): void {
        abp.ui.setBusy(undefined, '', 1);

        this.editTableAsset.ngForm = this.editTableAssetForm;

        this.editableRepairOffer.tableState = this.editTableAsset.tableState;
        this.editableRepairRecent.tableState = this.editTableAsset.tableState;
        this.editableRepairRealTime.tableState = this.editTableAsset.tableState;

        this.editTableAsset.ngForm = this.editTableAssetForm;
        this.editableRepairOffer.ngForm = this.editTableAssetForm;
        this.editableRepairRecent.ngForm = this.editTableAssetForm;
        this.editableRepairRealTime.ngForm = this.editTableAssetForm;
        switch (this.editPageState) {
            case EditPageState.add:
                this.inputModel.recorD_STATUS = RecordStatusConsts.Active;
                this.appToolbar.setRole('AssRepairMulti', false, false, true, false, false, false, false, false);
                this.appToolbar.setEnableForEditPage();
                this.inputModel.useR_REPAIR_ID = this.appSession.user.name;
                break;
            case EditPageState.edit:
                this.appToolbar.setRole('AssRepairMulti', false, false, true, false, false, false, false, false);
                this.appToolbar.setEnableForEditPage();
                this.getAssRepairMultiMaster();
                break;
            case EditPageState.viewDetail:
                this.appToolbar.setRole('AssRepairMulti', false, false, false, false, false, false, true, false);
                this.appToolbar.setEnableForViewDetailPage();
                this.getAssRepairMultiMaster();
                break;
        }

        this.appToolbar.setUiAction(this);
        abp.ui.clearBusy();

    }

    initIsApproveFunct() {
        this.ultilityService.isApproveFunct(this.getCurrentFunctionId()).subscribe(isApproveFunct => {
            this.isApproveFunct = isApproveFunct;
        })
    }

    initCombobox() {

    }

    getAssRepairMultiMaster() {
        this.assMultiRepairService.aSS_REPAIR_MULTI_MASTER_ById(this.inputModel.repaiR_MUL_ID).subscribe(response => {
            this.inputModel = response;
            this.getFile(this.inputModel.repaiR_MUL_ID, response, this.inputModel.assetDetail, 'asS_RE_MUL_DT_ID');
            this.editTableAsset.setList(response.assetDetail);
            if (this.inputModel.autH_STATUS == AuthStatusConsts.Approve) {
                this.appToolbar.setButtonApproveEnable(false);
                this.appToolbar.setButtonSaveEnable(false);
                this.isApprove = true;
            }
        });
    }

    addNew() {
        this.assMultiRepairService.aSS_REPAIR_MULTI_MASTER_Ins(this.inputModel).pipe(finalize(() => { this.saving = false; }))
            .subscribe((response) => {
                if (response['Result'] != '0') {
                    this.showErrorMessage(response['ErrorDesc']);
                }
                else {
                    this.addNewSuccess();
                    this.addFile(this.inputModel, 'ASS_REPAIR_MULTI_MASTER', this.inputModel.assetDetail, response.Ids, 'RE_MUL_MASTER');
                    if (!this.isApproveFunct) {
                        this.assMultiRepairService.aSS_REPAIR_MULTI_MASTER_App(response['id'], this.appSession.user.userName)
                            .pipe(finalize(() => { this.saving = false; }))
                            .subscribe((response) => {
                                if (response['Result'] != '0') {
                                    this.showErrorMessage(response['ErrorDesc']);
                                }
                            });
                    }
                }
            });
    }

    update() {
        this.assMultiRepairService.aSS_REPAIR_MULTI_MASTER_Upd(this.inputModel).pipe(finalize(() => { this.saving = false; }))
            .subscribe((response) => {
                if (response['Result'] != '0') {
                    this.showErrorMessage(response['ErrorDesc']);
                }
                else {
                    this.updateSuccess();
                    this.updateFile(this.inputModel, 'ASS_REPAIR_MULTI_MASTER', this.inputModel.assetDetail, response.Ids, 'RE_MUL_MASTER');
                    // this.updateFile(this.inputModel, 'BID_MASTER', this.inputModel.biD_CONTRACTOR_DTs, response.ids, 'BID_CONTRACTOR_DT');

                    if (!this.isApproveFunct) {
                        this.assMultiRepairService.aSS_REPAIR_MULTI_MASTER_App(this.inputModel.repaiR_MUL_ID, this.appSession.user.userName)
                            .pipe(finalize(() => { this.saving = false; }))
                            .subscribe((response) => {
                                if (response['Result'] != '0') {
                                    this.showErrorMessage(response['ErrorDesc']);
                                }
                                else {
                                    this.inputModel.autH_STATUS = AuthStatusConsts.Approve;
                                }
                            });
                    }
                    else {
                        this.inputModel.autH_STATUS = AuthStatusConsts.NotApprove;
                    }
                }
            });
    }

    saveInput() {
        if (this.isApproveFunct == undefined) {
            this.showErrorMessage(this.l('PageLoadUndone'));
            return;
        }
        if (this.editTableAsset.allData.length == 0) {
            this.showErrorMessage(this.l('AssetListCannotBeNull'));
            return;
        }
        if ((this.editForm as any).form.invalid) {
            this.isShowError = true;
            this.showErrorMessage(this.l('FormInvalid'));
            this.updateView();

            return;
        }
        let editableRepairOfferError = this.editableRepairOffer.getValidationMessage();
        if (editableRepairOfferError) {
            this.showErrorMessage(this.l('AssRepairMulti') + ': ' + editableRepairOfferError);
            return;
        }
        if (this.editPageState != EditPageState.add) {
            let editTableError = this.editableRepairRealTime.getValidationMessage();
            if (editTableError) {
                this.showErrorMessage(this.l('AssRepairMulti') + ': ' + editTableError);
                return;
            }
        }

        if (this.editPageState != EditPageState.viewDetail) {
            for (var i = 0; i < this.editTableAsset.allData.length; i++) {
                if (this.editTableAsset.allData[i].offeR_DT.isAfter(this.editTableAsset.allData[i].finisH_DT)) {
                    this.showErrorMessage(this.l('Line') + ' ' + (i + 1).toString() + ' ' + this.l('FinishDateCannotSmallerThanOfferDate').toLowerCase());
                    return;
                }
            }

            this.saving = true;
            this.inputModel.assetDetail = this.editTableAsset.allData;
            if (!this.inputModel.repaiR_MUL_ID) {
                this.inputModel.makeR_ID = this.appSession.user.userName;
                this.inputModel.autH_STATUS = AuthStatusConsts.NotApprove;
                this.inputModel.recorD_STATUS = '1';
                this.inputModel.creatE_DT = moment();

                // this.inputModel.makeR_ID = this.appSession.userId;
                this.addNew();
            }
            else {
                this.inputModel.makeR_ID_KT = this.appSession.user.userName;
                this.inputModel.approvE_DT = moment();
                this.update();
            }
        }

    }

    goBack() {
        this.navigatePassParam('/app/admin/ass-repair-multi', null, { filterInput: JSON.stringify(this.filterInput) });
    }

    onAdd(): void {
    }

    onUpdate(item: ASS_REPAIR_MULTI_MASTER_ENTITY): void {
    }

    onDelete(item: ASS_REPAIR_MULTI_MASTER_ENTITY): void {
    }

    onApprove(item: ASS_REPAIR_MULTI_MASTER_ENTITY): void {
        if (!this.inputModel.repaiR_MUL_ID) {
            return;
        }
        var currentUserName = this.appSession.user.userName;
        if (currentUserName == this.inputModel.makeR_ID) {
            this.showErrorMessage(this.l('ApproveFailed'));
            return;
        }
        if (!this.inputModel.makeR_ID_KT) {
            this.showErrorMessage(this.l('UpdateRepairInfoBeforeApprove'));
            return;
        }
        this.message.confirm(
            this.l('ApproveWarningMessage', this.l(this.inputModel.useR_REPAIR_ID)),
            this.l('AreYouSure'),
            (isConfirmed) => {
                if (isConfirmed) {
                    this.saving = true;
                    this.inputModel.autH_STATUS = AuthStatusConsts.Approve;

                    this.assMultiRepairService.aSS_REPAIR_MULTI_MASTER_App(this.inputModel.repaiR_MUL_ID, currentUserName)
                        .pipe(finalize(() => { this.saving = false; }))
                        .subscribe((response) => {
                            if (response['Result'] != '0') {
                                this.showErrorMessage(response['ErrorDesc']);
                            }
                            else {
                                this.approveSuccess();
                            }
                        });
                }
            }
        );
    }

    onViewDetail(item: ASS_REPAIR_MULTI_MASTER_ENTITY): void {
    }

    onSave(): void {
        this.saveInput();
    }

    onSearch(): void {
    }

    onResetSearch(): void {
    }

    onSelectAsset(event: ASS_MASTER_ENTITY[]) {
        var listAssetid = new ListAssetId();
        listAssetid.listAssetid = "A;" + event.map(e => e.asseT_ID).join(";");
        var lstAssMultiRepair = this.editTableAsset.allData;
        for (var item1 of event) {
            if (!lstAssMultiRepair.firstOrDefault(x => x.asseT_ID == item1.asseT_ID)) {
                var assDT = new ASS_REPAIR_MULTI_DT_ENTITY();

                assDT.asseT_CODE = item1.asseT_CODE;
                assDT.asseT_ID = item1.asseT_ID;
                assDT.asseT_NAME = item1.asseT_NAME;
                assDT.buY_PRICE = item1.buY_PRICE;
                assDT.asremaiN_AMT = item1.remaiN_AMORTIZED_AMT;
                assDT.usE_DATE = item1.usE_DATE;
                assDT.brancH_NAME = item1.pgd;
                assDT.deP_NAME = item1.deP_NAME;
                assDT.deP_ID = item1.depT_ID;
                assDT.deP_CODE = item1.deP_CODE;

                assDT.offeR_DT = moment();
                assDT.finisH_DT = moment();
                assDT.offeR_BRANCH = this.appSession.user.subbrId;
                // assDT.brancH_CREATE = item1.pgd;

                assDT.performance = '0';
                assDT.repaiR_AMT = 0;
                lstAssMultiRepair.push(assDT);
            }
        }
        // var lstAssetId = event.map(e => e.asseT_ID).join(";");
        this.assMultiRepairService.aSS_REPAIR_MULTI_DT_FIXNEW(listAssetid).subscribe(response => {
            if (response.length > 0) {
                for (var item of response) {
                    var findAsset = lstAssMultiRepair.find(x => x.asseT_ID == item.asseT_ID_RECENT);

                    findAsset.repaiR_DT_RECENT = item.repaiR_DT_RECENT;

                    findAsset.repaiR_DIVISION_RECENT = item.repaiR_DIVISION_RECENT;
                    findAsset.repaiR_AMT_RECENT = item.repaiR_AMT_RECENT;
                    findAsset.repaiR_CONTENT_RECENT = item.repaiR_CONTENT_RECENT;
                    findAsset.repaiR_NOTE_RECENT = item.repaiR_NOTE_RECENT;
                    findAsset.offeR_REASON_RECENT = item.offeR_REASON_RECENT;
                    findAsset.asS_RE_MUL_DT_ID_RECENT = item.asS_RE_MUL_DT_ID_RECENT;
                    findAsset.asseT_ID_RECENT = item.asseT_ID_RECENT;
                    findAsset.invoicE_NO_RECENT = item.invoicE_NO_RECENT;
                    findAsset.invoicE_DT_RECENT = item.invoicE_DT_RECENT;
                }

            }
            this.editTableAsset.setList(lstAssMultiRepair);
            // this.updateView();


        });
    }

    currentRepairDetail: ASS_REPAIR_MULTI_DT_ENTITY = new ASS_REPAIR_MULTI_DT_ENTITY();
    onSelectEmployee(event: CM_EMPLOYEE_ENTITY) {
        this.currentRepairDetail.offeR_PERSON = event.emP_ID;
        this.currentRepairDetail.offeR_PERSON_NAME = event.emP_NAME;
    }
    exportReportPreview() {
        var parameters = [];
        parameters.push(this.GetParamNameAndValue("REPAIR_MUL_ID", this.inputModel.repaiR_MUL_ID));
        this._previewTemplateService.printReportTemplate("RepairAssetDoc", parameters, []);

    }
    showAssetModal() {
        this.assetMasterModal.filterInput.brancH_ID = this.appSession.user.subbrId;
        this.assetMasterModal.filterInput.amorT_STATUS = 'CKH,DKH,DPB,KHX,KKH,NKH,';
        this.assetMasterModal.filterInput.brancH_LOGIN = this.appSession.user.subbrId;
        this.assetMasterModal.filterInput.brancH_NAME = this.appSession.user.branchName;
        this.assetMasterModal.filterInput.level = 'ALL';

        // this.assetMasterModal.filterInput.typE_ID = "CCLD";
        this.assetMasterModal.show();
    }
}
