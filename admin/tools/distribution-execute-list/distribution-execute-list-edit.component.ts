import { Component, Injector, ViewChild, OnInit, ViewEncapsulation, ElementRef, AfterViewInit } from '@angular/core';
import { appModuleAnimation } from '@shared/animations/routerTransition';
import * as _ from 'lodash';
import { UltilityServiceProxy, DISTRIBUTION_EXECUTE_LIST_ENTITY, DistributionExecuteListServiceProxy, AssMasterServiceProxy, CM_BRANCH_ENTITY } from '@shared/service-proxies/service-proxies';
import { EditPageState } from '@app/ultilities/enum/edit-page-state';
import { finalize } from 'rxjs/operators';
import { DefaultComponentBase } from '@app/ultilities/default-component-base';
import { IUiAction } from '@app/ultilities/ui-action';
import { AuthStatusConsts } from '@app/admin/core/ultils/consts/AuthStatusConsts';
import { RecordStatusConsts } from '@app/admin/core/ultils/consts/RecordStatusConsts';
import * as moment from 'moment';
import { BranchModalComponent } from '@app/admin/core/controls/branch-modal/branch-modal.component';

@Component({
    templateUrl: './distribution-execute-list-edit.component.html',
    encapsulation: ViewEncapsulation.None,
    animations: [appModuleAnimation()]
})
export class DistributionExecuteListEditComponent extends DefaultComponentBase implements OnInit, AfterViewInit, IUiAction<DISTRIBUTION_EXECUTE_LIST_ENTITY> {

    constructor(
        injector: Injector,
        private distributionExecuteListService: DistributionExecuteListServiceProxy,
        private ultilityService: UltilityServiceProxy,
    ) {
        super(injector);
        this.editPageState = this.getRouteData('editPageState');
        this.inputModel.exeC_DISTR_ID = this.getRouteParam('id');
        this.initFilter();
        this.initIsApproveFunct();
        this.stopAutoUpdateView();
    }

    @ViewChild('editForm') editForm: ElementRef;
    @ViewChild('branchModal') branchModal: BranchModalComponent;

    EditPageState = EditPageState;
    editPageState: EditPageState;

    inputModel: DISTRIBUTION_EXECUTE_LIST_ENTITY = new DISTRIBUTION_EXECUTE_LIST_ENTITY();
    filterInput: DISTRIBUTION_EXECUTE_LIST_ENTITY;
    isApproveFunct: boolean;
    asstype: DISTRIBUTION_EXECUTE_LIST_ENTITY[] = [];
    dateNull = moment("01/01/1900 00:00:00", "DD/MM/YYYY hh:mm:ss");

    get disableInput(): boolean {
        return (this.editPageState == EditPageState.viewDetail || this.inputModel.autH_STATUS == AuthStatusConsts.Approve);
    }

    get disableBranchName(): boolean {
        return this.editPageState != EditPageState.add;
    }

    isShowError = false;

    ngOnInit(): void {
        switch (this.editPageState) {
            case EditPageState.add:
                this.inputModel.recorD_STATUS = RecordStatusConsts.Active;
                this.appToolbar.setRole('ToolDistributionExecuteList', false, false, true, false, false, false, false, false);
                this.appToolbar.setEnableForEditPage();
                this.inputModel.creatE_DT = moment();
                this.inputModel.makeR_ID = this.appSession.user.userName;
                this.inputModel.requesT_DT = moment();
                break;
            case EditPageState.edit:
                this.appToolbar.setRole('ToolDistributionExecuteList', false, false, true, false, false, false, false, false);
                this.appToolbar.setEnableForEditPage();
                this.getdistributionExecuteListForEdit();
                break;
            case EditPageState.viewDetail:
                this.appToolbar.setRole('ToolDistributionExecuteList', false, false, false, false, false, false, true, false);
                this.appToolbar.setEnableForViewDetailPage();
                this.getdistributionExecuteList();
                break;
        }
        this.appToolbar.setUiAction(this);

    }

    ngAfterViewInit(): void {
        this.updateView();
        this.setupValidationMessage();
    }

    initIsApproveFunct() {
        this.ultilityService.isApproveFunct(this.getCurrentFunctionId()).subscribe(isApproveFunct => {
            this.isApproveFunct = isApproveFunct;
            this.updateView();
        })
    }



    getdistributionExecuteList() {
        this.inputModel.totalCount = 1;
        this.distributionExecuteListService.dISTRIBUTION_EXECUTE_LIST_ById(this.inputModel).subscribe(response => {
            this.inputModel = response;
            if (this.inputModel.autH_STATUS == AuthStatusConsts.Approve) {
                this.appToolbar.setButtonApproveEnable(false);
            }
            this.updateView();
        });
    }

    getdistributionExecuteListForEdit() {
        this.inputModel.totalCount = 1;
        this.distributionExecuteListService.dISTRIBUTION_EXECUTE_LIST_ById(this.inputModel).subscribe(response => {
            this.inputModel = response;
            this.inputModel.makeR_ID = this.appSession.user.userName;
            this.inputModel.approvE_DT = this.dateNull;
            if (this.inputModel.autH_STATUS == AuthStatusConsts.Approve) {
                this.appToolbar.setButtonSaveEnable(false);
            }
            this.updateView();
        });
    }

    saveInput() {
        if ((this.editForm as any).form.invalid) {
            this.isShowError = true;
            this.showErrorMessage(this.l('FormInvalid'));
            this.updateView();
            return;
        }
        if (this.editPageState != EditPageState.viewDetail) {
            this.saving = true;
            if (this.inputModel.requesT_DT == null)
                this.inputModel.requesT_DT = this.dateNull;
            if (!this.inputModel.exeC_DISTR_ID) {

                this.distributionExecuteListService.dISTRIBUTION_EXECUTE_LIST_Ins(this.inputModel).pipe(finalize(() => { this.saving = false; }))
                    .subscribe((response) => {
                        if (response['Result'] != '0') {
                            this.showErrorMessage(response['ErrorDesc']);
                        }
                        else {
                            this.addNewSuccess();
                            if (!this.isApproveFunct) {
                                this.distributionExecuteListService.dISTRIBUTION_EXECUTE_LIST_App(response['EXEC_DISTR_ID'], this.appSession.user.userName)
                                    .pipe(finalize(() => { this.saving = false; }))
                                    .subscribe((response) => {
                                        if (response['Result'] != '0') {
                                            this.showErrorMessage(response['ErrorDesc']);
                                        }
                                        this.updateView();
                                    });
                            }
                        }
                        this.updateView();
                    });
            }
            else {
                this.distributionExecuteListService.dISTRIBUTION_EXECUTE_LIST_Upd(this.inputModel).pipe(finalize(() => { this.saving = false; }))
                    .subscribe((response) => {
                        if (response['Result'] != '0') {
                            this.showErrorMessage(response['ErrorDesc']);
                        }
                        else {
                            this.updateSuccess();
                            if (!this.isApproveFunct) {
                                this.distributionExecuteListService.dISTRIBUTION_EXECUTE_LIST_App(response['EXEC_DISTR_ID'], this.appSession.user.userName)
                                    .pipe(finalize(() => { this.saving = false; }))
                                    .subscribe((response) => {
                                        if (response['Result'] != '0') {
                                            this.showErrorMessage(response['ErrorDesc']);
                                        }
                                        else {
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
        this.saving = false;
        this.updateView();
    }

    goBack() {
        this.navigatePassParam('/app/admin/distribution-execute-list', null, { filterInput: JSON.stringify(this.filterInput) });
    }

    onAdd(): void {
    }

    onUpdate(item: DISTRIBUTION_EXECUTE_LIST_ENTITY): void {
    }

    onDelete(item: DISTRIBUTION_EXECUTE_LIST_ENTITY): void {
    }

    onApprove(item: DISTRIBUTION_EXECUTE_LIST_ENTITY): void {
        var currentUserName = this.appSession.user.userName;
        if (currentUserName == this.inputModel.makeR_ID) {
            this.showErrorMessage(this.l('ApproveFailed'));
            this.updateView();
            return;
        }
        this.message.confirm(
            this.l('ApproveWarningMessage', this.l(this.inputModel.exeC_DISTR_ID)),
            this.l('AreYouSure'),
            (isConfirmed) => {
                if (isConfirmed) {
                    this.saving = true;
                    this.distributionExecuteListService.dISTRIBUTION_EXECUTE_LIST_App(this.inputModel.exeC_DISTR_ID, currentUserName)
                        .pipe(finalize(() => { this.saving = false; }))
                        .subscribe((response) => {
                            if (response['Result'] != '0') {
                                this.showErrorMessage(response['ErrorDesc']);
                            }
                            else {
                                this.approveSuccess();
                            }
                            this.updateView();
                        });
                }
            }
        );
    }

    showBranchModal() {
        this.branchModal.filterInput.brancH_LOGIN = this.appSession.user.subbrId;
        this.branchModal.show();
    }

    onSingleSelectBranch(branch: CM_BRANCH_ENTITY) {
        this.inputModel.brancH_ID = branch.brancH_ID;
        this.inputModel.brancH_NAME = branch.brancH_NAME;
    }


    onViewDetail(item: DISTRIBUTION_EXECUTE_LIST_ENTITY): void {
    }

    onSave(): void {
        this.saveInput();
    }

    onSearch(): void {
    }

    onResetSearch(): void {
    }
}
