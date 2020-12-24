import { PreviewTemplateService } from '@app/admin/common/preview-template/preview-template.service';
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
import { AssetModalComponent } from '@app/admin/core/controls/asset-modal/asset-modal.component';
import { BranchModalComponent } from '@app/admin/core/controls/branch-modal/branch-modal.component';
import { DepartmentModalComponent } from '@app/admin/core/controls/dep-modal/department-modal.component';
import { DivisionModalComponent } from '@app/admin/core/controls/division-modal/division-modal.component';
import { EmployeeModalComponent } from '@app/admin/core/controls/employee-modal/employee-modal.component';
import { NgForm } from '@angular/forms';
import { ReportTypeConsts } from '@app/admin/core/ultils/consts/ReportTypeConsts';
import { AccentsCharService } from '@app/admin/core/ultils/accents-char.service';

@Component({
    templateUrl: './ass-use-multi-master-fa-edit.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    animations: [appModuleAnimation()]
})
export class AssUseMultiMasterFaEditComponent extends DefaultComponentBase implements OnInit, AfterViewInit, IUiActionRejectExt<ASS_USE_MULTI_MASTER_ENTITY> {


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
        // COMMENT: this.stopAutoUpdateView();
    }

    @ViewChild('editForm') editForm: ElementRef;
    @ViewChild('rejectModal') rejectModal: RejectModalComponent;
    @ViewChild('branchModal') branchModal: BranchModalComponent;
    @ViewChild('assetModal') assetModal: AssetModalComponent;
    @ViewChild('depModal') depModal: DepartmentModalComponent;
    @ViewChild('divisionModal') divisionModal: DivisionModalComponent;
    @ViewChild('empModal') empModal: EmployeeModalComponent;

    @ViewChild('editTableAssUseMultiDtView') editTableAssUseMultiDt: EditableTableComponent<ASS_USE_MULTI_DT_ENTITY>;
    @ViewChild('editTableAmortAssetView') editTableAmortAsset: EditableTableComponent<ASS_USE_MULTI_DT_ENTITY>;
    @ViewChild('ngFormAssUse') ngFormAssUse: NgForm;
    // @ViewChild('ngFormAmortAssset') ngFormAmortAssset: NgForm;

    EditPageState = EditPageState;
    AllCodes = AllCodes;
    editPageState: EditPageState;


    inputModel: ASS_USE_MULTI_MASTER_ENTITY = new ASS_USE_MULTI_MASTER_ENTITY();
    filterInput: ASS_USE_MULTI_MASTER_ENTITY;
    isApproveFunct: boolean;

    coreNotePattern: RegExp = new RegExp(this.s("gAMSProCore.CoreNoteRegexValidation"))

    get disableInput(): boolean {
        return this.editPageState == EditPageState.viewDetail || this.inputModel.autH_STATUS == AuthStatusConsts.Approve;
    }

    get isShowPrintButton(): boolean {
        return this.inputModel.autH_STATUS == AuthStatusConsts.Approve
    }

    isShowError = false;

    get apptoolbar(): ToolbarRejectExtComponent {
        return this.appToolbar as ToolbarRejectExtComponent;
    }

    ngAfterViewInit(): void {
        // COMMENT: this.stopAutoUpdateView();
        this.setupValidationMessage()
        this.editTableAssUseMultiDt.ngForm = this.ngFormAssUse;
        this.editTableAmortAsset.ngForm = this.ngFormAssUse
        this.editTableAssUseMultiDt.tableState = this.editTableAmortAsset.tableState
    }

    ngOnInit(): void {
        let { subbrId, name } = this.appSession.user
        switch (this.editPageState) {
            case EditPageState.add:
                this.inputModel.recorD_STATUS = RecordStatusConsts.Active;
                this.appToolbar.setRole('AssUseMultiMasterFa', false, false, true, false, false, false, false, false);
                this.appToolbar.setEnableForEditPage();
                this.inputModel['brancH_ID'] = subbrId;
                this.inputModel.useR_EXPORT = name
                this.inputModel.usE_EXPORT_DT = moment();
                break;
            case EditPageState.edit:
                this.inputModel['brancH_ID'] = subbrId;
                this.appToolbar.setRole('AssUseMultiMasterFa', false, false, true, false, false, false, false, false);
                this.appToolbar.setEnableForEditPage();
                this.getAssUseMultiMaster();
                break;
            case EditPageState.viewDetail:
                this.inputModel['brancH_ID'] = subbrId;
                this.appToolbar.setRole('AssUseMultiMasterFa', false, false, false, false, false, false, true, false);
                this.appToolbar.setEnableForViewDetailPage();
                this.getAssUseMultiMaster();
                break;
        }

        this.appToolbar.setUiAction(this);
        this.initCustomValidMessage()
        this.initAssetModalFilter()

        //set form default value 	

    }

    getModelName() {
        return this.inputModel.useR_MASTER_ID
    }

    initIsApproveFunct() {
        this.ultilityService.isApproveFunct(this.getCurrentFunctionId()).subscribe(isApproveFunct => {
            this.isApproveFunct = isApproveFunct;
        })
    }

    initCombobox() {

    }

    initAssetModalFilter() {
        const { subbrId } = this.appSession.user
        this.assetModal.filterInput.brancH_ID = subbrId
        this.assetModal.filterInput.brancH_LOGIN = subbrId
        this.assetModal.filterInput.level = 'UNIT'
        this.assetModal.filterInput.typE_ID = 'TSCD'
        this.assetModal.filterInput.amorT_STATUS = 'VNM'
    }


    initCustomValidMessage() {
        let scope = this
        this.editTableAmortAsset.validations.push({
            message: this.l("CoreNoteValidDescription").toLowerCase(),
            field: 'corE_NOTE',
            checkValid: (context: ASS_USE_MULTI_DT_ENTITY) => {
                return context && this.coreNotePattern.test(context.corE_NOTE)
            }
        })
        this.editTableAmortAsset.validations.push({
            message: this.l("AmortStartDateCannotLessThanCurrentDate").toLowerCase(),
            field: 'amorT_START_DATE',
            checkValid: (context: ASS_USE_MULTI_DT_ENTITY) => {
                return context && scope.compareDate(moment().add(-1, 'day'), context.amorT_START_DATE)
            }
        })
    }

    openDivisionModal(branchId) {
        this.divisionModal.filterInput.brancH_ID = branchId
        this.divisionModal.show()
    }

    showAssetModal() {
        this.assetModal.show()
    }
    onRemoveCheckedItems() {
        this.editTableAssUseMultiDt.removeAllCheckedItem()
        this.editTableAmortAsset.removeAllCheckedItem()
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


    onSelectAssets(items: ASS_MASTER_ENTITY[]) {

        if (!this.isNull(items)) {

            let duplicateObj = this.isContainItemInArray(this.editTableAssUseMultiDt.allData, items)
            if (duplicateObj.errorDesc == '') {
                let tempArr =
                    [
                        ... this.isNull(this.editTableAssUseMultiDt.allData) ? [] : this.editTableAssUseMultiDt.allData,
                        ...items.map((element, index) => {
                            let newItem = new ASS_USE_MULTI_DT_ENTITY()
                            let { useR_MASTER_ID } = this.inputModel
                            if (!this.isNull(useR_MASTER_ID) && useR_MASTER_ID != '') {
                                newItem.useR_MASTER_ID = useR_MASTER_ID
                            }

                            newItem.asseT_ID = element.asseT_ID
                            newItem.asseT_CODE = element.asseT_CODE
                            newItem.asseT_NAME = element.asseT_NAME
                            newItem.amorT_START_DATE = element.amorT_START_DATE
                            newItem.amorT_MONTH = element.amorT_MONTH
                            newItem.amorT_END_DATE = element.amorT_END_DATE

                            newItem.creatE_DT_ASS = element.creatE_DT
                            newItem.asseT_SERIAL_NO = element.asseT_SERIAL_NO
                            newItem.buY_PRICE = element.buY_PRICE
                            newItem.brancH_CREATE_NAME = element.brancH_CREATE_NAME
                            newItem.asremaiN_AMT = element.remaiN_AMORTIZED_AMT
                            newItem.creatE_DT_ASS = element.creatE_DT
                            return newItem
                        })
                    ]
                this.editTableAssUseMultiDt.setList(tempArr)
                this.editTableAmortAsset.setList(tempArr)
            } else {
                this.scrollTop();
                this.showWarningMessage(this.l(`${duplicateObj.dupItems}.${duplicateObj.errorDesc}`))
            }
            this.updateView()
        }
    }
    onSelectBranch(item: CM_BRANCH_ENTITY) {
        if (!this.isNull(item)) {
            this.editTableAssUseMultiDt.currentItem.brancH_ID = item.brancH_ID
            this.editTableAssUseMultiDt.currentItem.brancH_CODE = item.brancH_CODE
            this.editTableAssUseMultiDt.currentItem.brancH_NAME = item.brancH_NAME
            this.editTableAssUseMultiDt.currentItem.brancH_TYPE = item.brancH_TYPE
            this.updateView()
        }
    }
    onSelectEmployee(item: CM_EMPLOYEE_ENTITY) {
        if (!this.isNull(item)) {
            this.editTableAssUseMultiDt.currentItem.emP_ID = item.emP_ID
            this.editTableAssUseMultiDt.currentItem.emP_CODE = item.emP_CODE
            this.editTableAssUseMultiDt.currentItem.emP_NAME = item.emP_NAME
            this.updateView()
        }
    }
    onSelectDivision(item: CM_DIVISION_ENTITY) {
        if (!this.isNull(item)) {
            this.editTableAssUseMultiDt.currentItem.divisioN_ID = item.diV_ID
            this.editTableAssUseMultiDt.currentItem.diV_CODE = item.diV_CODE
            this.editTableAssUseMultiDt.currentItem.diV_NAME = item.diV_NAME
            this.updateView()
        }
    }
    onSelectDepartment(item: CM_DEPARTMENT_ENTITY) {
        if (!this.isNull(item)) {
            this.editTableAssUseMultiDt.currentItem.depT_ID = item.deP_ID
            this.editTableAssUseMultiDt.currentItem.deP_CODE = item.deP_CODE
            this.editTableAssUseMultiDt.currentItem.deP_NAME = item.deP_NAME
            this.updateView()
        }
    }

    // onchangeAmortMonth(value: number) {
    //     this.editTableAmortAsset.currentItem.amorT_MONTH = !this.isNull(value) && value > 0 ? value : 1;
    //     this.resetAmortEndDate(this.editTableAmortAsset.currentItem)
    //     this.updateView()
    // }

    onchangeAmortStartDate() {
        if (this.isNull(this.editTableAmortAsset.currentItem.amorT_START_DATE)) {
            this.editTableAmortAsset.currentItem.amorT_START_DATE = moment()
        }

        this.resetAmortEndDate(this.editTableAmortAsset.currentItem)
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

    isShowSelectDepartment(branchType: String) {
        let isShowButton = false;
        if (!this.isNull(branchType) && branchType === 'HS') isShowButton = true
        return isShowButton
    }


    getAssUseMultiMaster() {
        this.assUseMultiMasterService.aSS_USE_MULTI_MASTER_ById(this.inputModel.useR_MASTER_ID).subscribe(response => {
            this.inputModel = response;

            if (this.inputModel.autH_STATUS == AuthStatusConsts.Approve) {
                this.appToolbar.setButtonSaveEnable(false);
                this.appToolbar.setButtonApproveEnable(false);
                this.updateView();
            }

            if (this.inputModel.useR_MASTER_ID) {
                // CM_ATTACH_FILE
                this.getFile(this.inputModel.useR_MASTER_ID, this.inputModel);
            }

            this.editTableAssUseMultiDt.setList(this.inputModel.assUseMultiDetails)
            this.editTableAmortAsset.setList(this.inputModel.assUseMultiDetails)
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

        const validMessage = this.editTableAssUseMultiDt.getValidationMessage()
        if (validMessage) {
            this.isShowError = true;
            this.showErrorMessage(this.l("List") + ' ' + this.l("Asset") + ' ' + validMessage);
            this.updateView()
            return;
        }

        const validMessageAmortAsset = this.editTableAmortAsset.getValidationMessage()
        if (validMessageAmortAsset) {
            this.isShowError = true;
            this.showErrorMessage(this.l("List") + ' ' + this.l("Asset") + ' ' + validMessageAmortAsset);
            this.updateView()
            return;
        }

        let errorMessage = this.isValid()
        if (errorMessage != '') {
            this.isShowError = true;
            this.showErrorMessage(this.l(errorMessage));
            this.updateView();
            return;
        }


        if (this.editPageState != EditPageState.viewDetail) {
            this.saving = true;

            this.inputModel.makeR_ID = this.appSession.user.userName;
            this.inputModel.assUseMultiDetails = this.editTableAssUseMultiDt.allData
            this.inputModel.typE_ID = 'TSCD'

            if (!this.inputModel.useR_MASTER_ID) {

                this.assUseMultiMasterService.aSS_USE_MULTI_MASTER_Ins(this.inputModel).pipe(finalize(() => { this.saving = false; }))
                    .subscribe((response) => {
                        if (response["Result"] != '0') {
                            this.showErrorMessage(response["ErrorDesc"]);
                        }
                        else {
                            //CM_ATTACH_FILE
                            this.addFile(this.inputModel, 'ASS_USE_MULTI_MASTER_FA', undefined, response['ID']);
                            this.showSuccessMessage(this.l('InsertSuccessful'));
                            if (!this.isApproveFunct) {
                                this.assUseMultiMasterService.aSS_USE_MULTI_MASTER_App(response.id, this.appSession.user.userName)
                                    .pipe(finalize(() => { this.saving = false; }))
                                    .subscribe((response) => {
                                        if (response["Result"] != '0') {
                                            this.showErrorMessage(response["ErrorDesc"]);
                                        } else {
                                            this.appToolbar.setButtonApproveEnable(false)
                                            this.appToolbar.setButtonSaveEnable(false)
                                            this.inputModel.autH_STATUS = AuthStatusConsts.Approve;
                                        }
                                        this.updateView();
                                    });
                            }
                        }
                        this.updateView();
                    });
            }
            else {
                if (this.appSession.user.subbrId != this.inputModel.brancH_ID && this.inputModel.autH_STATUS == AuthStatusConsts.Reject) {
                    this.showErrorMessage(this.l('UpdateFailed'));
                    return;
                }
                this.assUseMultiMasterService.aSS_USE_MULTI_MASTER_Upd(this.inputModel).pipe(finalize(() => { this.saving = false; }))
                    .subscribe((response) => {
                        if (response["Result"] != '0') {
                            this.showErrorMessage(response["ErrorDesc"]);
                        }
                        else {
                            //CM_ATTACH_FILE
                            this.updateFile(this.inputModel, 'ASS_USE_MULTI_MASTER_FA', undefined, response['ID']);
                            this.showSuccessMessage(this.l('UpdateSuccessful'));
                            if (!this.isApproveFunct) {
                                this.assUseMultiMasterService.aSS_USE_MULTI_MASTER_TSCD_App(this.inputModel, this.appSession.user.userName)
                                    .pipe(finalize(() => { this.saving = false; }))
                                    .subscribe((response) => {
                                        if (response["Result"] != '0') {
                                            this.showErrorMessage(response["ErrorDesc"]);
                                        }
                                        else {
                                            this.appToolbar.setButtonSaveEnable(false);
                                            this.appToolbar.setButtonApproveEnable(false);
                                            this.inputModel.autH_STATUS = AuthStatusConsts.Approve;
                                        }
                                        this.updateView();
                                    });
                            }
                            else {
                                this.inputModel.autH_STATUS = AuthStatusConsts.NotApprove;
                            }
                        }
                        this.updateView();
                    });
            }
        }
    }

    goBack() {
        this.navigatePassParam('/app/admin/ass-use-multi-master-fa', null, { filterInput: JSON.stringify(this.filterInput) });
    }

    onAdd(): void {
    }

    onUpdate(item: ASS_USE_MULTI_MASTER_ENTITY): void {
    }

    onDelete(item: ASS_USE_MULTI_MASTER_ENTITY): void {
    }

    onApprove(item: ASS_USE_MULTI_MASTER_ENTITY): void {
        if (this.isNull(this.inputModel.useR_MASTER_ID)) return
        this.inputModel.typE_ID = 'TSCD'

        let currentUserName = this.appSession.user.userName;
        if (currentUserName == this.inputModel.makeR_ID || this.inputModel.autH_STATUS == AuthStatusConsts.Reject) {
            this.showErrorMessage(this.l('ApproveFailed'));
            this.updateView();
            return;
        }
        this.message.confirm(
            this.l('ApproveWarningMessage', this.l(this.getModelName())),
            this.l('AreYouSure'),
            (isConfirmed) => {
                if (isConfirmed) {
                    this.saving = true;
                    this.assUseMultiMasterService.aSS_USE_MULTI_MASTER_TSCD_App(this.inputModel, currentUserName)
                        .pipe(finalize(() => { this.saving = false; }))
                        .subscribe((response) => {
                            if (response["Result"] != '0') {
                                this.showErrorMessage(response['ErrorDesc']);
                            }
                            else {
                                this.showSuccessMessage(this.l('SuccessfullyApprove'));
                                this.appToolbar.setButtonApproveEnable(false)
                                this.appToolbar.setButtonSaveEnable(false)
                                this.inputModel.autH_STATUS = AuthStatusConsts.Approve;
                            }
                            this.updateView()
                        });
                }
            });
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


    private isValid() {
        let errorMessage = ''
        try {
            if (!this.editTableAssUseMultiDt.allData || this.editTableAssUseMultiDt.allData && this.editTableAssUseMultiDt.allData.length == 0)
                errorMessage = 'AssetListRequired'

        } catch{
            errorMessage = 'ERROR'
        }

        return errorMessage
    }
}

