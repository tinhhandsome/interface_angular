import { Component, Injector, ViewChild, OnInit, ViewEncapsulation, ElementRef, AfterViewInit } from '@angular/core';
import { appModuleAnimation } from '@shared/animations/routerTransition';
import * as _ from 'lodash';
import { RAT_TERM_MASTER_ENTITY, RatTermMasterServiceProxy, RAT_TERM_CONDITIONS_ENTITY, UltilityServiceProxy, CM_SUPPLIER_ENTITY, CM_ALLCODE_ENTITY, RAT_TERM_MASTER_DT_ENTITY, CM_GOODSTYPE_REAL_ENTITY, GoodsTypeRealServiceProxy } from '@shared/service-proxies/service-proxies';
import { EditPageState } from '@app/ultilities/enum/edit-page-state';
import { AllCodes } from '@app/ultilities/enum/all-codes';
import { finalize } from 'rxjs/operators';
import { DefaultComponentBase } from '@app/ultilities/default-component-base';
import { AuthStatusConsts } from '@app/admin/core/ultils/consts/AuthStatusConsts';
import { RecordStatusConsts } from '@app/admin/core/ultils/consts/RecordStatusConsts';
import { EditableTableComponent } from '@app/admin/core/controls/editable-table/editable-table.component';
import { IUiActionRejectExt } from '@app/ultilities/ui-action-re';
import { ToolbarRejectExtComponent } from '@app/admin/core/controls/toolbar-reject-ext/toolbar-reject-ext.component';
import { RejectModalComponent } from '@app/admin/core/controls/reject-modals/reject-modal.component';
import * as moment from 'moment';
import { SupplierModalComponent } from '@app/admin/core/controls/supplider-modal/supplier-modal.component';


@Component({
    templateUrl: './rat-term-master-edit.component.html',
    encapsulation: ViewEncapsulation.None,
    animations: [appModuleAnimation()]
})
export class RatTermMasterEditComponent extends DefaultComponentBase implements OnInit, AfterViewInit, IUiActionRejectExt<RAT_TERM_MASTER_ENTITY> {


    constructor(
        injector: Injector,
        private ultilityService: UltilityServiceProxy,
        private ratTermMasterService: RatTermMasterServiceProxy,
    ) {
        super(injector);

        this.editPageState = this.getRouteData('editPageState');
        this.inputModel.raT_ID = this.getRouteParam('id');
        console.log(this)
        this.initFilter();
        this.initCombobox();
        this.initIsApproveFunct();
        // COMMENT: this.stopAutoUpdateView();
    }

    @ViewChild('editForm') editForm: ElementRef;
    @ViewChild('rejectModal') rejectModal: RejectModalComponent;
    @ViewChild('supplierModal') supplierModal: SupplierModalComponent;
    @ViewChild('goodsTypeRealModal') goodsTypeRealModal: GoodsTypeRealServiceProxy;
    @ViewChild('supTable') supTable: EditableTableComponent<CM_SUPPLIER_ENTITY>;
    @ViewChild('goodTypeTable') goodTypeTable: EditableTableComponent<CM_GOODSTYPE_REAL_ENTITY>;
    @ViewChild('editTable3') editTable3: EditableTableComponent<RAT_TERM_MASTER_DT_ENTITY>;
    @ViewChild('editTable4') editTable4: EditableTableComponent<RAT_TERM_MASTER_DT_ENTITY>;

    EditPageState = EditPageState;
    AllCodes = AllCodes;
    editPageState: EditPageState;
    currentUnit: CM_ALLCODE_ENTITY


    inputModel: RAT_TERM_MASTER_ENTITY = new RAT_TERM_MASTER_ENTITY();
    filterInput: RAT_TERM_MASTER_ENTITY;
    isApproveFunct: boolean;

    unit: string = "ALL"

    get disableInput(): boolean {
        return this.editPageState == EditPageState.viewDetail;
    }



    isShowError = false;


    get apptoolbar(): ToolbarRejectExtComponent {
        return this.appToolbar as ToolbarRejectExtComponent;
    }

    ngAfterViewInit(): void {
        this.setupValidationMessage()
        this.editTable4.tableState = this.editTable3.tableState
    }

    ngOnInit(): void {
        let { subbrId } = this.appSession.user
        switch (this.editPageState) {
            case EditPageState.add:
                this.inputModel.recorD_STATUS = RecordStatusConsts.Active;
                this.appToolbar.setRole('RatTermMaster', false, false, true, false, false, false, false, false);
                this.appToolbar.setEnableForEditPage();
                this.inputModel['brancH_ID'] = subbrId;
                break;
            case EditPageState.edit:
                this.inputModel['brancH_ID'] = subbrId;
                this.appToolbar.setRole('RatTermMaster', false, false, true, false, false, false, false, false);
                this.appToolbar.setEnableForEditPage();
                this.getRatTermMaster();
                break;
            case EditPageState.viewDetail:
                this.inputModel['brancH_ID'] = subbrId;
                this.appToolbar.setRole('RatTermMaster', false, false, false, false, false, false, true, false);
                this.appToolbar.setEnableForViewDetailPage();
                this.getRatTermMaster();
                break;
        }

        this.appToolbar.setUiAction(this);
        if (this.isNull(this.inputModel.inpuT_DT))
            this.inputModel.inpuT_DT = moment()
        if (this.isNull(this.inputModel.passeD_PERCENT))
            this.inputModel.passeD_PERCENT = 50

        if(this.editPageState == EditPageState.add){
            this.unit = 'HO';
        }
    }

    initIsApproveFunct() {
        this.ultilityService.isApproveFunct(this.getCurrentFunctionId()).subscribe(isApproveFunct => {
            this.isApproveFunct = isApproveFunct;
        })
    }

    initCombobox() {

    }

    onSelectSuppliers(items: CM_SUPPLIER_ENTITY[]) {
        if (items) {
            if (!this.supTable.allData) {
                this.supTable.setList(items)
            } else {
                items.forEach(item => {
                    if (!this.supTable.allData.some(sup => sup.suP_ID == item.suP_ID))
                        this.supTable.pushItem(item)
                })
            }
            this.updateView();
        }
    }
    onSelectGoodsTypeReals(items: CM_GOODSTYPE_REAL_ENTITY[]) {
        if (items) {
            if (!this.goodTypeTable.allData) {
                this.goodTypeTable.setList(items)
            } else {
                items.forEach(item => {
                    if (!this.goodTypeTable.allData.some(goodType => goodType.gD_RETYPE_ID == item.gD_RETYPE_ID))
                        this.goodTypeTable.pushItem(item)
                })
            }
            this.updateView();
        }
    }

    setUnit(conditions: RAT_TERM_CONDITIONS_ENTITY[]) {
        if (this.isNull(conditions)) this.unit = "ALL"
        let arr = conditions.filter(x => x.conditioN_ID == "BRN")
        this.unit = arr.length > 0 ? arr[0].conditioN_VAL : 'ALL'
        this.updateView();
    }

    getRatTermMaster() {
        this.ratTermMasterService.rAT_TERM_MASTER_ById(this.inputModel.raT_ID).subscribe(response => {
            this.inputModel = response;
            this.setUnit(this.inputModel.raT_TERM_CONDITIONSes)
            this.supTable.setList(this.inputModel.suppliers)
            this.goodTypeTable.setList(this.inputModel.goodsTypeReals)
            this.editTable3.setList(this.inputModel.ratTermMasterDts)
            this.editTable4.setList(this.inputModel.ratTermMasterDts)

            if (this.editPageState == EditPageState.viewDetail) {
                this.apptoolbar.setEnableForViewDetailPage();
            }
            if (this.inputModel.autH_STATUS == AuthStatusConsts.Approve) {
                this.appToolbar.setButtonApproveEnable(false);
            }
            this.updateView();
        });
    }


    systemCalcuteTerm() {
        let oldRateTerm = this.inputModel.ratE_TERM;
        this.inputModel.ratE_TERM = this.inputModel.notes;
        this.ratTermMasterService.rAT_TERM_MASTER_calc_Rate(this.inputModel).subscribe(response => {
            this.inputModel.ratTermMasterDts = response;
            this.editTable3.setList(this.inputModel.ratTermMasterDts)
            this.editTable4.setList(this.inputModel.ratTermMasterDts)
            this.updateView();
        });

        this.inputModel.ratE_TERM = oldRateTerm;
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

            let ratTermConditionUnit = new RAT_TERM_CONDITIONS_ENTITY()
            ratTermConditionUnit.id = undefined
            ratTermConditionUnit.raT_ID = this.inputModel.raT_ID
            ratTermConditionUnit.conditioN_ID = "BRN"
            ratTermConditionUnit.conditioN_VAL = this.unit

            this.inputModel.suppliers = this.supTable.allData
            this.inputModel.goodsTypeReals = this.goodTypeTable.allData

            this.inputModel.raT_TERM_CONDITIONSes = [ratTermConditionUnit]


            if (!this.inputModel.raT_ID) {

                this.ratTermMasterService.rAT_TERM_MASTER_Ins(this.inputModel).pipe(finalize(() => { this.saving = false; }))
                    .subscribe((response) => {
                        console.log(response)
                        if (response["Result"] != '0') {
                            this.showErrorMessage(response["ErrorDesc"]);
                        }
                        else {
                            this.addNewSuccess();
                            if (!this.isApproveFunct) {
                                this.ratTermMasterService.rAT_TERM_MASTER_App(response['ID'], this.appSession.user.userName)
                                    .pipe(finalize(() => { this.saving = false; }))
                                    .subscribe((response) => {
                                        if (response["Result"] != '0') {
                                            this.showErrorMessage(response["ErrorDesc"]);
                                        } else {
                                            this.inputModel.autH_STATUS = AuthStatusConsts.Approve;
                                            this.appToolbar.setButtonApproveEnable(false)
                                            this.appToolbar.setButtonSaveEnable(false)
                                            this.updateView()
                                        }
                                    });
                            }
                        }
                    });
            }
            else {
                this.ratTermMasterService.rAT_TERM_MASTER_Upd(this.inputModel).pipe(finalize(() => { this.saving = false; }))
                    .subscribe((response) => {
                        if (response["Result"] != '0') {
                            this.showErrorMessage(response["ErrorDesc"]);
                        }
                        else {
                            this.updateSuccess();
                            if (!this.isApproveFunct) {
                                this.ratTermMasterService.rAT_TERM_MASTER_App(this.inputModel.raT_ID, this.appSession.user.userName)
                                    .pipe(finalize(() => { this.saving = false; }))
                                    .subscribe((response) => {
                                        if (response["Result"] != '0') {
                                            this.showErrorMessage(response["ErrorDesc"]);
                                        }
                                        else {
                                            this.inputModel.autH_STATUS = AuthStatusConsts.Approve;
                                            this.appToolbar.setButtonApproveEnable(false)
                                            this.appToolbar.setButtonSaveEnable(false)
                                            this.updateView()
                                        }
                                    });
                            }
                            else {
                                this.inputModel.autH_STATUS = AuthStatusConsts.NotApprove;
                            }
                        }
                    });
            }
        }
    }

    goBack() {
        this.navigatePassParam('/app/admin/rat-term-master', null, { filterInput: JSON.stringify(this.filterInput) });
    }

    onAdd(): void {
    }

    onUpdate(item: RAT_TERM_MASTER_ENTITY): void {
    }

    onDelete(item: RAT_TERM_MASTER_ENTITY): void {
    }

    onApprove(item: RAT_TERM_MASTER_ENTITY): void {
        if (this.isNull(this.inputModel.raT_ID)) return

        let currentUserName = this.appSession.user.userName;
        if (currentUserName == this.inputModel.makeR_ID || this.inputModel.autH_STATUS == AuthStatusConsts.Reject) {
            this.showErrorMessage(this.l('ApproveFailed'));
            return;
        }
        this.message.confirm(
            this.l('ApproveWarningMessage', this.l(this.inputModel.raT_ID)),
            this.l('AreYouSure'),
            (isConfirmed) => {
                if (isConfirmed) {
                    this.saving = true;
                    this.ratTermMasterService.rAT_TERM_MASTER_App(this.inputModel.raT_ID, currentUserName)
                        .pipe(finalize(() => { this.saving = false; }))
                        .subscribe((response) => {
                            if (response["Result"] != '0') {
                                this.showErrorMessage(response['ErrorDesc']);
                            }
                            else {
                                this.approveSuccess();
                                this.inputModel.autH_STATUS = AuthStatusConsts.Approve;
                                this.appToolbar.setButtonApproveEnable(false)
                                this.appToolbar.setButtonSaveEnable(false)
                                this.updateView()
                            }
                        });
                }
            }
        );
    }
    onViewDetail(item: RAT_TERM_MASTER_ENTITY): void {
    }

    onSave(): void {
        this.saveInput();
    }

    onSearch(): void {
    }

    onResetSearch(): void {
    }

    onReject(item: RAT_TERM_MASTER_ENTITY): void {
        this.rejectModal.show();
    }

    onReturn(notes: string) {
    }

    private isValid() {
        let errorMessage = ''
        let { froM_DT, tO_DT } = this.inputModel
        try {
            errorMessage = !this.compareDate(froM_DT, tO_DT, true) ? 'FromDateMustSmallerThanToDate' : ''
        } catch{
            errorMessage = 'ERROR'
        }

        return errorMessage
    }
}
