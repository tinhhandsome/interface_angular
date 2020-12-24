import { Component, Injector, ViewChild, OnInit, ViewEncapsulation, ElementRef, AfterViewChecked, AfterViewInit } from '@angular/core';
import { appModuleAnimation } from '@shared/animations/routerTransition';
import * as _ from 'lodash';
import { ProjectServiceProxy, TR_PROJECT_ENTITY, UltilityServiceProxy } from '@shared/service-proxies/service-proxies';
import { EditPageState } from '@app/ultilities/enum/edit-page-state';
import { AllCodes } from '@app/ultilities/enum/all-codes';
import { finalize } from 'rxjs/operators';
import { DefaultComponentBase } from '@app/ultilities/default-component-base';
import { IUiAction } from '@app/ultilities/ui-action';
import { AuthStatusConsts } from '@app/admin/core/ultils/consts/AuthStatusConsts';
import { RecordStatusConsts } from '@app/admin/core/ultils/consts/RecordStatusConsts';
import * as moment from 'moment';

@Component({
    templateUrl: './project-edit.component.html',
    encapsulation: ViewEncapsulation.None,
    animations: [appModuleAnimation()]
})
export class ProjectEditComponent extends DefaultComponentBase implements OnInit, IUiAction<TR_PROJECT_ENTITY>, AfterViewInit {
    ngAfterViewInit(): void {
        this.setupValidationMessage();
        this.updateView();
        // COMMENT: this.stopAutoUpdateView();
    }
    constructor(
        injector: Injector,
        private ultilityService: UltilityServiceProxy,
        private projectService: ProjectServiceProxy,
    ) {
        super(injector);
        this.editPageState = this.getRouteData('editPageState');
        this.inputModel.projecT_CODE = this.getRouteParam('code');
        this.inputModel.creatE_DT = moment();
        this.inputModel.disciplines = 'CAR';
        this.initFilter();
        this.initIsApproveFunct();
    }

    @ViewChild('editForm') editForm: ElementRef;

    isDisabled: boolean = true;
    EditPageState = EditPageState;
    AllCodes = AllCodes;
    editPageState: EditPageState;

    filterInput: TR_PROJECT_ENTITY = new TR_PROJECT_ENTITY();
    inputModel: TR_PROJECT_ENTITY = new TR_PROJECT_ENTITY();

    isApproveFunct: boolean;


    get disableInput(): boolean {
        return this.editPageState == EditPageState.viewDetail || (this.inputModel.autH_STATUS == AuthStatusConsts.Approve && this.editPageState == EditPageState.edit);
    }

    isShowError = false;

    ngOnInit(): void {

        switch (this.editPageState) {
            case EditPageState.add:
                this.inputModel.recorD_STATUS = RecordStatusConsts.Active;
                this.appToolbar.setRole('TradeProject', false, false, true, false, false, false, false, false);
                this.appToolbar.setEnableForEditPage();
                break;
            case EditPageState.edit:
                this.appToolbar.setRole('TradeProject', false, false, true, false, false, false, false, false);
                this.appToolbar.setEnableForEditPage();
                this.getProject();
                break;
            case EditPageState.viewDetail:
                this.appToolbar.setRole('TradeProject', false, false, false, false, false, false, true, false);
                this.appToolbar.setEnableForViewDetailPage();
                this.getProject();
                break;
        }

        this.appToolbar.setUiAction(this);
    }

    initIsApproveFunct() {
        this.ultilityService.isApproveFunct(this.getCurrentFunctionId()).subscribe(isApproveFunct => {
            this.isApproveFunct = isApproveFunct;
        })
    }

    getProject() {
        this.projectService.tR_PROJECT_ById(this.inputModel.projecT_CODE).subscribe(response => {
            this.inputModel = response;
            if (this.inputModel.autH_STATUS == AuthStatusConsts.Approve) {
                this.appToolbar.setButtonApproveEnable(false);
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
            this.inputModel.makeR_ID = this.appSession.user.userName;
            if (!this.inputModel.projecT_ID) {
                this.inputModel.autH_STATUS = AuthStatusConsts.NotApprove;
                this.projectService.tR_PROJECT_Ins(this.inputModel).pipe(finalize(() => { this.saving = false; }))
                    .subscribe((response) => {
                        if (response.result != '0') {
                            this.showErrorMessage(response.errorDesc);
                        }
                        else {
                            this.addNewSuccess();
                            // this.addNewSuccess();
                            if (!this.isApproveFunct) {
                                this.projectService.tR_PROJECT_App(response.id, this.appSession.user.userName)
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
                this.projectService.tR_PROJECT_Upd(this.inputModel).pipe(finalize(() => { this.saving = false; }))
                    .subscribe((response) => {
                        if (response.result != '0') {
                            this.showErrorMessage(response.errorDesc);
                        }
                        else {
                            this.updateSuccess();
                            // this.updateSuccess();
                            if (!this.isApproveFunct) {
                                this.projectService.tR_PROJECT_App(this.inputModel.projecT_ID, this.appSession.user.userName)
                                    .pipe(finalize(() => { this.saving = false; }))
                                    .subscribe((response) => {
                                        if (response.result != '0') {
                                            this.showErrorMessage(response.errorDesc);
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
        }
    }

    goBack() {
        this.navigatePassParam('/app/admin/trade-project', null, { filterInput: JSON.stringify(this.filterInput) });
    }

    onAdd(): void {
    }

    onUpdate(item: TR_PROJECT_ENTITY): void {
    }

    onDelete(item: TR_PROJECT_ENTITY): void {
    }

    onApprove(item: TR_PROJECT_ENTITY): void {
        var currentUserName = this.appSession.user.userName;
        if (currentUserName == this.inputModel.makeR_ID) {
            this.showErrorMessage(this.l('ApproveFailed'));
            return;
        }
        this.message.confirm(
            this.l('ApproveWarningMessage', this.l(this.inputModel.projecT_CODE)),
            this.l('AreYouSure'),
            (isConfirmed) => {
                if (isConfirmed) {
                    this.saving = true;
                    this.projectService.tR_PROJECT_App(this.inputModel.projecT_ID, currentUserName)
                        .pipe(finalize(() => { this.saving = false; }))
                        .subscribe((response) => {
                            if (response.result != '0') {
                                this.showErrorMessage(response.errorDesc);
                            }
                            else {
                                // this.showSuccessMessage(this.l('SuccessfullyApprove'));
                                // this.inputModel.autH_STATUS = AuthStatusConsts.Approve;
                                this.approveSuccess();
                                this.appToolbar.setButtonApproveEnable(false);
                                this.updateView();
                            }
                        });
                }
            }
        );
    }

    onViewDetail(item: TR_PROJECT_ENTITY): void {
    }

    onSave(): void {
        this.saveInput();
    }

    onSearch(): void {
    }

    onResetSearch(): void {
    }
    focusOut() {
        this.updateView();
    }
}
