import { Component, Injector, ViewChild, OnInit, ViewEncapsulation, ElementRef, AfterViewInit, ChangeDetectionStrategy } from '@angular/core';
import { appModuleAnimation } from '@shared/animations/routerTransition';
import * as _ from 'lodash';
import * as moment from 'moment';
import { ASS_USE_MULTI_MASTER_ENTITY, AssUseMultiMasterServiceProxy, UltilityServiceProxy, ASS_MASTER_ENTITY, CM_BRANCH_ENTITY, CM_DEPT_GROUP_ENTITY, CM_DIVISION_ENTITY, ASS_USE_MULTI_DT_ENTITY, CM_DEPARTMENT_ENTITY, CM_EMPLOYEE_ENTITY, ReportInfo } from '@shared/service-proxies/service-proxies';
import { EditPageState } from '@app/ultilities/enum/edit-page-state';
import { AllCodes } from '@app/ultilities/enum/all-codes';
import { finalize } from 'rxjs/operators';
import { DefaultComponentBase } from '@app/ultilities/default-component-base';
import { AuthStatusConsts } from '@app/admin/core/ultils/consts/AuthStatusConsts';
import { RecordStatusConsts } from '@app/admin/core/ultils/consts/RecordStatusConsts';
import { IUiActionRejectExt } from '@app/ultilities/ui-action-re';
import { ToolbarRejectExtComponent } from '@app/admin/core/controls/toolbar-reject-ext/toolbar-reject-ext.component';
import { RejectModalComponent } from '@app/admin/core/controls/reject-modals/reject-modal.component';
import { EditableTableComponent } from '@app/admin/core/controls/editable-table/editable-table.component';
import { ReportTypeConsts } from '@app/admin/core/ultils/consts/ReportTypeConsts';
import { PreviewTemplateService } from '@app/admin/common/preview-template/preview-template.service';
import { NgForm } from '@angular/forms';
import { AccentsCharService } from '@app/admin/core/ultils/accents-char.service';


@Component({
    templateUrl: './ass-use-multi-kt-edit.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    animations: [appModuleAnimation()]
})
export class AssUseMultiKtEditComponent extends DefaultComponentBase implements OnInit, AfterViewInit, IUiActionRejectExt<ASS_USE_MULTI_MASTER_ENTITY> {


    constructor(
        injector: Injector,
        private ultilityService: UltilityServiceProxy,
        private assUseMultiMasterService: AssUseMultiMasterServiceProxy,
        private previewTemplateService: PreviewTemplateService,
        private accentsCharService: AccentsCharService
    ) {
        super(injector);

        this.editPageState = this.getRouteData('editPageState');
        this.inputModel.useR_MASTER_ID = this.getRouteParam('id');

        this.inputModel.assUseMultiDetails = []


        this.initFilter();
        this.initCombobox();
        this.initIsApproveFunct();
    }

    @ViewChild('editForm') editForm: NgForm;
    @ViewChild('rejectModal') rejectModal: RejectModalComponent;
    @ViewChild('editTableAssetView') editTableAsset: EditableTableComponent<ASS_USE_MULTI_DT_ENTITY>;
    @ViewChild('editTableAmortView') editTableAmort: EditableTableComponent<ASS_USE_MULTI_DT_ENTITY>;
    @ViewChild('ngFormAsset') ngFormAsset: NgForm;
    // @ViewChild('ngFormAmort') ngFormAmort: NgForm;


    EditPageState = EditPageState;
    AllCodes = AllCodes;
    editPageState: EditPageState;


    inputModel: ASS_USE_MULTI_MASTER_ENTITY = new ASS_USE_MULTI_MASTER_ENTITY();
    filterInput: ASS_USE_MULTI_MASTER_ENTITY;
    isApproveFunct: boolean;

    coreNotePattern: RegExp = new RegExp(this.s("gAMSProCore.CoreNoteRegexValidation"))

    get disableInput(): boolean {
        return this.editPageState == EditPageState.viewDetail || this.inputModel.autH_STATUS_KT == AuthStatusConsts.Approve;
    }

    get isShowPrintButton(): boolean {
        return this.inputModel.autH_STATUS_KT == AuthStatusConsts.Approve
    }



    isShowError = false;

    get apptoolbar(): ToolbarRejectExtComponent {
        return this.appToolbar as ToolbarRejectExtComponent;
    }

    ngAfterViewInit(): void {
        // COMMENT: this.stopAutoUpdateView();
        this.setupValidationMessage()

        this.editTableAsset.ngForm = this.ngFormAsset
        this.editTableAmort.ngForm = this.ngFormAsset
        this.editTableAmort.tableState = this.editTableAsset.tableState
    }

    ngOnInit(): void {
        let { subbrId, name } = this.appSession.user
        switch (this.editPageState) {
            case EditPageState.add:
                this.inputModel.recorD_STATUS = RecordStatusConsts.Active;
                this.appToolbar.setRole('AssUseMultiKt', false, false, true, false, false, false, false, false);
                this.appToolbar.setEnableForEditPage();
                this.inputModel['brancH_ID'] = subbrId;
                this.inputModel.useR_EXPORT = name
                this.inputModel.usE_EXPORT_DT = moment()
                break;
            case EditPageState.edit:
                this.inputModel['brancH_ID'] = subbrId;
                this.appToolbar.setRole('AssUseMultiKt', false, false, true, false, false, false, false, false);
                this.appToolbar.setEnableForEditPage();
                this.getAssUseMultiMaster();
                break;
            case EditPageState.viewDetail:
                this.inputModel['brancH_ID'] = subbrId;
                this.appToolbar.setRole('AssUseMultiKt', false, false, false, false, false, false, true, false);
                this.appToolbar.setEnableForViewDetailPage();
                this.getAssUseMultiMaster();
                break;
        }

        this.appToolbar.setUiAction(this);
        this.initCustomValidMessage()
    }

    getModelName() {
        return this.inputModel.useR_MASTER_ID
    }

    initIsApproveFunct() {
        this.ultilityService.isApproveFunct(this.getCurrentFunctionId()).subscribe(isApproveFunct => {
            this.isApproveFunct = isApproveFunct;
        })
    }

    initCustomValidMessage() {
        this.editTableAmort.validations.push({
            message: this.l("CoreNoteValidDescription").toLowerCase(),
            field: 'corE_NOTE',
            checkValid: (context: ASS_USE_MULTI_DT_ENTITY) => {
                return context && this.coreNotePattern.test(context.corE_NOTE)
            }
        })
    }



    initCombobox() {

    }

    isContainItemInArray(arr: ASS_USE_MULTI_DT_ENTITY[], compareArr: ASS_MASTER_ENTITY[]) {
        let dupObj = {
            dupItems: [],
            errorDesc: ''
        }

        if (!this.isNull(arr)) {
            for (const itemArr of arr) {
                for (const itemCompareArr of compareArr) {
                    if (itemArr.asseT_ID === itemCompareArr.asseT_ID && itemArr.asseT_ID != "") {
                        if (dupObj.errorDesc == '') {
                            dupObj.errorDesc = "DuplicatedData"
                        }

                        if (!this.isNull(dupObj.dupItems) && dupObj.dupItems.length != 0) {
                            dupObj.dupItems = [...dupObj.dupItems, ', ' + itemArr.asseT_CODE]
                        } else {
                            dupObj.dupItems = [itemArr.asseT_CODE]
                        }
                    }
                }
            }
        }

        return dupObj
    }

    isShowSelectDepartment(branchType: String) {
        let isShowButton = false;
        if (!this.isNull(branchType) && branchType === 'HS') isShowButton = true
        return isShowButton
    }

    printCoreNoteInvoice() {
        if (!this.inputModel.useR_MASTER_ID) {
            this.showErrorMessage(this.l('CannotExport'));
            return;
        }

        let reportInfo = new ReportInfo();
        reportInfo.typeExport = ReportTypeConsts.Word;

        let curDate = moment()
        let { userName, name, taxNo } = this.appSession.user
        let { brancH_NAME, brancH_TYPE, taX_NO } = this.appSession.user.branch

        let parameters = [this.GetParamNameAndValue('REF_ID', this.inputModel.useR_MASTER_ID)];
        //let parameters = [this.GetParamNameAndValue('REF_ID','SMA000000000006')];
        let values = this.GetParamsFromFilter({
            branchName: this.accentsCharService.removeDiacritics(brancH_NAME),
            branchType: this.accentsCharService.removeDiacritics(brancH_TYPE),
            userName: this.accentsCharService.removeDiacritics(userName),
            userFullName: this.accentsCharService.removeDiacritics(name),
            branchTaxNo: this.accentsCharService.removeDiacritics(taxNo),
            day: curDate.format('D'),
            month: curDate.format('M'),
            year: curDate.format('Y'),
        });

        this.previewTemplateService.printReportTemplate('rpt_ASS_ENTRIES', parameters, values);
    }

    getAssUseMultiMaster() {
        this.assUseMultiMasterService.aSS_USE_MULTI_MASTER_ById(this.inputModel.useR_MASTER_ID).subscribe(response => {
            this.inputModel = response;

            if (this.editPageState == EditPageState.viewDetail) {
                this.apptoolbar.setEnableForViewDetailPage();
            }

            if (this.inputModel.autH_STATUS_KT == AuthStatusConsts.Approve) {
                this.appToolbar.setButtonApproveEnable(false);
            }else{
                if(this.inputModel.kT_IS_DO ==='N'){
                    this.inputModel.assUseMultiDetails.forEach(x=>x.amorT_START_DATE = moment())
                }
            }

            this.editTableAsset.setList(this.inputModel.assUseMultiDetails)
            this.editTableAmort.setList(this.inputModel.assUseMultiDetails)
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
            this.updateView();
            return;
        }

        const validMessage = this.editTableAmort.getValidationMessage()
        if (validMessage) {
            this.isShowError = true;
            this.showErrorMessage(validMessage);
            this.updateView()
            return;
        }


        if (this.editPageState != EditPageState.viewDetail) {
            this.saving = true;
            this.inputModel.makeR_ID = this.appSession.user.userName;


            if (!this.inputModel.useR_MASTER_ID) {


            }
            else {
                if (this.appSession.user.subbrId != this.inputModel.brancH_ID && this.inputModel.autH_STATUS_KT == AuthStatusConsts.Reject) {
                    this.showErrorMessage(this.l('UpdateFailed'));
                    return;
                }
                this.assUseMultiMasterService.aSS_USE_MULTI_KT_Upd(this.inputModel).pipe(finalize(() => { this.saving = false; }))
                    .subscribe((response) => {
                        if (response["Result"] != '0') {
                            this.showErrorMessage(response["ErrorDesc"]);
                        }
                        else {
                            this.updateSuccess()
                            if (!this.isApproveFunct) {
                                this.assUseMultiMasterService.aSS_USE_MULTI_KT_App(this.inputModel.useR_MASTER_ID, this.appSession.user.userName)
                                    .pipe(finalize(() => { this.saving = false; }))
                                    .subscribe((response) => {
                                        if (response["Result"] != '0') {
                                            this.showErrorMessage(response["ErrorDesc"]);
                                        }
                                        else {
                                            this.inputModel.autH_STATUS_KT = AuthStatusConsts.Approve;
                                            this.appToolbar.setButtonSaveEnable(false);
                                            this.appToolbar.setButtonApproveEnable(false);
                                            this.updateView();
                                        }
                                    });
                            }
                            else {
                                this.inputModel.autH_STATUS_KT = AuthStatusConsts.NotApprove;
                                this.updateView();
                            }
                        }
                    });
            }
        }
    }

    goBack() {
        this.navigatePassParam('/app/admin/ass-use-multi-kt', null, { filterInput: JSON.stringify(this.filterInput) });
    }

    onAdd(): void {
    }

    onUpdate(item: ASS_USE_MULTI_MASTER_ENTITY): void {
    }

    onDelete(item: ASS_USE_MULTI_MASTER_ENTITY): void {
    }

    onApprove(item: ASS_USE_MULTI_MASTER_ENTITY): void {
        if (this.isNull(this.inputModel.useR_MASTER_ID)) return

        let currentUserName = this.appSession.user.userName;
        if (currentUserName == this.inputModel.makeR_ID_KT || this.inputModel.autH_STATUS_KT == AuthStatusConsts.Reject) {
            this.showErrorMessage(this.l('ApproveFailed'));
            return;
        }
        this.message.confirm(
            this.l('ApproveWarningMessage', this.l(this.getModelName())),
            this.l('AreYouSure'),
            (isConfirmed) => {
                if (isConfirmed) {
                    this.saving = true;
                    this.assUseMultiMasterService.aSS_USE_MULTI_KT_App(this.inputModel.useR_MASTER_ID, currentUserName)
                        .pipe(finalize(() => { this.saving = false; }))
                        .subscribe((response) => {
                            if (response["Result"] != '0') {
                                this.showErrorMessage(response['ErrorDesc']);
                            }
                            else {
                                this.showSuccessMessage(this.l('SuccessfullyApprove'));
                                this.appToolbar.setButtonSaveEnable(false);
                                this.appToolbar.setButtonApproveEnable(false);
                                this.inputModel.autH_STATUS_KT = AuthStatusConsts.Approve;
                                this.updateView()
                            }
                        });
                }
            }
        );
    }
    onViewDetail(item: ASS_USE_MULTI_MASTER_ENTITY): void {
    }

    onSave(): void {
        this.saveInput();
    }

    onSearch(): void {
    }

    onResetSearch(): void {
    }

    onReject(item: ASS_USE_MULTI_MASTER_ENTITY): void {
        this.rejectModal.show();
    }

    onReturn(notes: string) {
    }

    onchangeAmortMonth(value: number) {
        this.editTableAmort.currentItem.amorT_MONTH = (!this.isNull(value) && value > 0) ? value : 1;
        this.resetAmortEndDate(this.editTableAmort.currentItem)
        this.updateView()
    }

    onchangeAmortStartDate() {
        if (this.isNull(this.editTableAmort.currentItem.amorT_START_DATE)) {
            this.editTableAmort.currentItem.amorT_START_DATE = moment()
        }

        this.resetAmortEndDate(this.editTableAmort.currentItem)
        this.updateView()
    }
    resetAmortEndDate(item: ASS_USE_MULTI_DT_ENTITY) {
        let { amorT_MONTH, amorT_START_DATE } = item
        let tempDate = moment(amorT_START_DATE)
        if (amorT_MONTH > 1) {
            item.amorT_END_DATE = tempDate.add(amorT_MONTH - 1, 'M')
        }
        item.amorT_END_DATE = tempDate.endOf('month')
    }
}

