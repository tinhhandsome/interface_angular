import { Component, Injector, ViewChild, OnInit, ElementRef } from '@angular/core';
import { appModuleAnimation } from '@shared/animations/routerTransition';
import * as _ from 'lodash';
import { BranchServiceProxy, CM_BRANCH_ENTITY, RegionServiceProxy, CM_REGION_ENTITY, UltilityServiceProxy } from '@shared/service-proxies/service-proxies';
import { EditPageState } from '@app/ultilities/enum/edit-page-state';
import { AllCodes } from '@app/ultilities/enum/all-codes';
import { finalize } from 'rxjs/operators';
import { DefaultComponentBase } from '@app/ultilities/default-component-base';
import { IUiAction } from '@app/ultilities/ui-action';
import { AllCodeSelectComponent } from '@app/admin/core/controls/allCodes/all-code-select.component';
import { AuthStatusConsts } from '@app/admin/core/ultils/consts/AuthStatusConsts';
import { RecordStatusConsts } from '@app/admin/core/ultils/consts/RecordStatusConsts';

@Component({
    templateUrl: './branch-edit.component.html',
    animations: [appModuleAnimation()]
})
export class BranchEditComponent extends DefaultComponentBase implements OnInit, IUiAction<CM_BRANCH_ENTITY> {
    constructor(
        injector: Injector,
        private branchService: BranchServiceProxy,
        private ultilityService: UltilityServiceProxy,
        private _regionService: RegionServiceProxy
    ) {
        super(injector);
        this.editPageState = this.getRouteData('editPageState');
        this.inputModel.brancH_ID = this.getRouteParam('id');
        this.initFilter();
        this.initCombobox();
        this.initIsApproveFunct();
    }

    @ViewChild("brancH_TYPE") branchTypeSelect: AllCodeSelectComponent;
    @ViewChild('editForm') editForm: ElementRef;

    @ViewChild('iS_POTENTIAL') iS_POTENTIAL_chk: ElementRef;

    EditPageState = EditPageState;
    AllCodes = AllCodes;
    editPageState: EditPageState;

    inputModel: CM_BRANCH_ENTITY = new CM_BRANCH_ENTITY();
    filterInput: CM_BRANCH_ENTITY;
    isApproveFunct: boolean;


    get disableInput(): boolean {
        return this.editPageState == EditPageState.viewDetail;
    }

    fatherLists: CM_BRANCH_ENTITY[];
    regions: CM_REGION_ENTITY[];

    isShowError = false;

    ngOnInit(): void {
        this.ultilityService.isApproveFunct(this.getCurrentFunctionId()).subscribe(isApproveFunct => {
            this.isApproveFunct = isApproveFunct;
        })
        switch (this.editPageState) {
            case EditPageState.add:
                this.inputModel.recorD_STATUS = RecordStatusConsts.Active;
                this.appToolbar.setRole('Branch', false, false, true, false, false, false, false, false);
                this.appToolbar.setEnableForEditPage();
                break;
            case EditPageState.edit:
                this.appToolbar.setRole('Branch', false, false, true, false, false, false, false, false);
                this.appToolbar.setEnableForEditPage();
                this.getBranch();
                break;
            case EditPageState.viewDetail:
                this.appToolbar.setRole('Branch', false, false, false, false, false, false, true, false);
                this.appToolbar.setEnableForViewDetailPage();
                this.getBranch();
                break;
        }
        this.appToolbar.setUiAction(this);
    }

    initIsApproveFunct() {
        this.ultilityService.isApproveFunct(this.getCurrentFunctionId()).subscribe(isApproveFunct => {
            this.isApproveFunct = isApproveFunct;
        })
    }

    initCombobox() {
        this._regionService.cM_REGION_Search(this.getFillterForCombobox()).subscribe(response => {
            this.regions = response.items;
        });
    }

    getBranch() {
        this.branchService.cM_BRANCH_ById(this.inputModel.brancH_ID).subscribe(response => {
            this.inputModel = response;
            if (this.inputModel.autH_STATUS == AuthStatusConsts.Approve) {
                this.appToolbar.setButtonApproveEnable(false);
            }
        });
    }

    reloadFatherList() {
        if (!this.inputModel || !this.inputModel.regioN_ID || !this.inputModel.brancH_TYPE) {
            return;
        }

        var regionId = this.inputModel.regioN_ID;
        var branchType = this.inputModel.brancH_TYPE;
        this.branchService.cM_BRANCH_GetFatherList(regionId, branchType).subscribe(response => {
            this.fatherLists = response;
            if (this.fatherLists.filter(x => x.fatheR_ID != this.inputModel.fatheR_ID).length == 0) {
                this.inputModel.fatheR_ID = '';
            }
        })
    }

    saveInput() {
        if (this.isApproveFunct == undefined) {
            this.showErrorMessage(this.l('PageLoadUndone'));
            return;
        }

        if (this.editPageState != EditPageState.viewDetail) {
            if ((this.editForm as any).form.invalid) {
                this.isShowError = true;
                this.showErrorMessage(this.l('FormInvalid'));
                return;
            }

            this.saving = true;
            this.inputModel.makeR_ID = this.appSession.user.userName;
            if (!this.inputModel.brancH_ID) {

                this.branchService.cM_BRANCH_Ins(this.inputModel).pipe(finalize(() => { this.saving = false; }))
                    .subscribe((response) => {
                        if (response.result != '0') {
                            this.showErrorMessage(response.errorDesc);
                        }
                        else {
                            this.addNewSuccess();
                            if (!this.isApproveFunct) {
                                this.branchService.cM_BRANCH_App(response.id, this.appSession.user.userName)
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
                this.branchService.cM_BRANCH_Upd(this.inputModel).pipe(finalize(() => { this.saving = false; }))
                    .subscribe((response) => {
                        if (response.result != '0') {
                            this.showErrorMessage(response.errorDesc);
                        }
                        else {
                            this.updateSuccess();
                            if (!this.isApproveFunct) {
                                this.branchService.cM_BRANCH_App(this.inputModel.brancH_ID, this.appSession.user.userName)
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
        this.navigatePassParam('/app/admin/branch', null, { filterInput: JSON.stringify(this.filterInput) });
    }

    onAdd(): void {
    }

    onUpdate(item: CM_BRANCH_ENTITY): void {
    }

    onDelete(item: CM_BRANCH_ENTITY): void {
    }

    onApprove(item: CM_BRANCH_ENTITY): void {
        var currentUserName = this.appSession.user.userName;
        if (this.editPageState != EditPageState.viewDetail) {
            return;
        }
        if (currentUserName == this.inputModel.makeR_ID) {
            this.showErrorMessage(this.l('ApproveFailed'));
            return;
        }
        this.message.confirm(
            this.l('ApproveWarningMessage', this.inputModel.brancH_NAME),
            this.l('AreYouSure'),
            (isConfirmed) => {
                if (isConfirmed) {
                    this.saving = true;
                    this.branchService.cM_BRANCH_App(this.inputModel.brancH_ID, currentUserName)
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

    onViewDetail(item: CM_BRANCH_ENTITY): void {
    }

    onSave(): void {
        this.saveInput();
    }

    onSearch(): void {
    }

    onResetSearch(): void {
    }
}
