import { Component, Injector, ViewChild, OnInit, ViewEncapsulation, ElementRef, AfterViewInit } from '@angular/core';
import { appModuleAnimation } from '@shared/animations/routerTransition';
import * as _ from 'lodash';
import { AssGroupServiceProxy, ASS_GROUP_ENTITY, ASS_TYPE_ENTITY, AssTypeServiceProxy, UltilityServiceProxy } from '@shared/service-proxies/service-proxies';
import { EditPageState } from '@app/ultilities/enum/edit-page-state';
import { AllCodes } from '@app/ultilities/enum/all-codes';
import { finalize } from 'rxjs/operators';
import { DefaultComponentBase } from '@app/ultilities/default-component-base';
import { IUiAction } from '@app/ultilities/ui-action';
import { AuthStatusConsts } from '@app/admin/core/ultils/consts/AuthStatusConsts';
import { RecordStatusConsts } from '@app/admin/core/ultils/consts/RecordStatusConsts';

@Component({
    templateUrl: './ass-group-edit.component.html',
    encapsulation: ViewEncapsulation.None,
    animations: [appModuleAnimation()]
})
export class AssGroupEditComponent extends DefaultComponentBase implements OnInit, IUiAction<ASS_GROUP_ENTITY>, AfterViewInit {
    @ViewChild('editForm') editForm: ElementRef;

    EditPageState = EditPageState;
    AllCodes = AllCodes;
    editPageState: EditPageState;

    inputModel: ASS_GROUP_ENTITY = new ASS_GROUP_ENTITY();
    filterInput: ASS_GROUP_ENTITY;
    isApproveFunct: boolean;

    assTypes: ASS_TYPE_ENTITY[];

    constructor(
        injector: Injector,
        private assGroupService: AssGroupServiceProxy,
        private ultilityService: UltilityServiceProxy,
        private assTypeService: AssTypeServiceProxy,
    ) {
        super(injector);
        this.editPageState = this.getRouteData('editPageState');
        this.inputModel.grouP_ID = this.getRouteParam('id');
        this.initFilter();
        this.initCombobox();
        this.initIsApproveFunct();
        ;
        this.initDefaultValue();
    }


    get disableInput(): boolean {
        return this.editPageState == EditPageState.viewDetail;
    }

    isShowError = false;

    initDefaultValue() {
        this.inputModel.asS_CAT = 'CAR';
        this.inputModel.iS_LEAF = 'Y';
        this.inputModel.amorT_RATE = 0;
        this.inputModel.amorT_MONTH = 0;
    }

    ngOnInit(): void {
        switch (this.editPageState) {
            case EditPageState.add:
                this.inputModel.recorD_STATUS = RecordStatusConsts.Active;
                this.appToolbar.setRole('AssGroup', false, false, true, false, false, false, false, false);
                this.appToolbar.setEnableForEditPage();
                break;
            case EditPageState.edit:
                this.appToolbar.setRole('AssGroup', false, false, true, false, false, false, false, false);
                this.appToolbar.setEnableForEditPage();
                this.getAssGroup();
                break;
            case EditPageState.viewDetail:
                this.appToolbar.setRole('AssGroup', false, false, false, false, false, false, true, false);
                this.appToolbar.setEnableForViewDetailPage();
                this.getAssGroup();
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
        this.assTypeService.aSS_TYPE_Search(this.getFillterForCombobox()).subscribe(response => {
            this.assTypes = response.items;
            this.updateView();
        });
    }

    onAssGroupParentIdChange(assGroup: ASS_GROUP_ENTITY) {
        this.inputModel.parenT_NAME = assGroup.grouP_NAME;
    }

    amortRateChange() {
        if (this.inputModel.amorT_RATE) {
            this.inputModel.amorT_MONTH = Math.round(1200 / this.inputModel.amorT_RATE);
        }
        else {
            this.inputModel.amorT_MONTH = 0;
            this.inputModel.amorT_RATE = 0;
            this.onChangeProperty('amorT_RATE');
        }
        this.onChangeProperty('amorT_MONTH');
    }

    getAssGroup() {
        this.assGroupService.aSS_GROUP_ById(this.inputModel.grouP_ID).subscribe(response => {
            this.inputModel = response;
            if (this.inputModel.autH_STATUS == AuthStatusConsts.Approve) {
                this.appToolbar.setButtonApproveEnable(false);
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

            if (!this.inputModel.grouP_ID) {

                this.assGroupService.aSS_GROUP_Ins(this.inputModel).pipe(finalize(() => { this.saving = false; }))
                    .subscribe((response) => {
                        if (response.result != '0') {
                            this.showErrorMessage(response.errorDesc);
                        }
                        else {
                            this.addNewSuccess();
                            if (!this.isApproveFunct) {
                                this.assGroupService.aSS_GROUP_App(response.id, this.appSession.user.userName)
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
                this.assGroupService.aSS_GROUP_Upd(this.inputModel).pipe(finalize(() => { this.saving = false; }))
                    .subscribe((response) => {
                        if (response.result != '0') {
                            this.showErrorMessage(response.errorDesc);
                        }
                        else {
                            this.updateSuccess();
                            if (!this.isApproveFunct) {
                                this.assGroupService.aSS_GROUP_App(this.inputModel.grouP_ID, this.appSession.user.userName)
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
        this.navigatePassParam('/app/admin/ass-group', null, { filterInput: JSON.stringify(this.filterInput) });
    }

    onAdd(): void {
    }

    onUpdate(item: ASS_GROUP_ENTITY): void {
    }

    onDelete(item: ASS_GROUP_ENTITY): void {
    }

    onApprove(item: ASS_GROUP_ENTITY): void {
        if (!this.inputModel.grouP_ID) {
            return;
        }
        var currentUserName = this.appSession.user.userName;
        if (currentUserName == this.inputModel.makeR_ID) {
            this.showErrorMessage(this.l('ApproveFailed'));
            return;
        }
        this.message.confirm(
            this.l('ApproveWarningMessage', this.l(this.inputModel.grouP_NAME)),
            this.l('AreYouSure'),
            (isConfirmed) => {
                if (isConfirmed) {
                    this.saving = true;
                    this.assGroupService.aSS_GROUP_App(this.inputModel.grouP_ID, currentUserName)
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

    onSelectAssGroup(assGroup: ASS_GROUP_ENTITY) {
        this.inputModel.parenT_ID = assGroup.grouP_ID;
        this.inputModel.parenT_CODE = assGroup.grouP_CODE;
        this.inputModel.parenT_NAME = assGroup.grouP_NAME;
        this.updateView();
    }

    onAssGroupParentChange() {
        if (!this.inputModel.parenT_CODE) {
            this.inputModel.parenT_ID = undefined;
            this.inputModel.parenT_NAME = undefined;
            this.updateView();
        }

    }


    onViewDetail(item: ASS_GROUP_ENTITY): void {
    }

    onSave(): void {
        this.saveInput();
    }

    onSearch(): void {
    }

    onResetSearch(): void {
    }
}
