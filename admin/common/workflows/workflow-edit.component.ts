import { Component, Injector, ViewChild, Output, EventEmitter, OnInit, ViewEncapsulation, ElementRef } from '@angular/core';
import { appModuleAnimation } from '@shared/animations/routerTransition';
import * as _ from 'lodash';
import { WorkflowServiceProxy, CM_WORKFLOW_ENTITY, RoleServiceProxy, AppPermissionServiceProxy, AppMenuDto, AppMenuServiceProxy, CM_WORKFLOW_ASSIGN_ENTITY, RoleListDto, UltilityServiceProxy } from '@shared/service-proxies/service-proxies';
import { EditPageState } from '@app/ultilities/enum/edit-page-state';
import { AllCodes } from '@app/ultilities/enum/all-codes';
import { finalize } from 'rxjs/operators';
import { DefaultComponentBase } from '@app/ultilities/default-component-base';
import { IUiAction } from '@app/ultilities/ui-action';
import { AuthStatusConsts } from '@app/admin/core/ultils/consts/AuthStatusConsts';
import { RecordStatusConsts } from '@app/admin/core/ultils/consts/RecordStatusConsts';
import { EditableTableComponent } from '@app/admin/core/controls/editable-table/editable-table.component';

@Component({
    templateUrl: './workflow-edit.component.html',
    encapsulation: ViewEncapsulation.None,
    animations: [appModuleAnimation()]
})
export class WorkflowEditComponent extends DefaultComponentBase implements OnInit, IUiAction<CM_WORKFLOW_ENTITY> {
    constructor(
        injector: Injector,
        private ultilityService: UltilityServiceProxy,
        private menuService: AppMenuServiceProxy,
        private roleService: RoleServiceProxy,
        private workflowService: WorkflowServiceProxy
    ) {
        super(injector);
        this.editPageState = this.getRouteData('editPageState');
        this.inputModel.workfloW_ID = this.getRouteParam('id');
        this.initFilter();
        this.initCombobox();
        this.initIsApproveFunct();
    }

    @ViewChild('editForm') editForm: ElementRef;
    @ViewChild('editTable') editTable: EditableTableComponent<CM_WORKFLOW_ASSIGN_ENTITY>;

    EditPageState = EditPageState;
    AllCodes = AllCodes;
    editPageState: EditPageState;
    menus: AppMenuDto[];
    roles: RoleListDto[];

    inputModel: CM_WORKFLOW_ENTITY = new CM_WORKFLOW_ENTITY();
    filterInput: CM_WORKFLOW_ENTITY;
    isApproveFunct: boolean;


    get disableInput(): boolean {
        return this.editPageState == EditPageState.viewDetail;
    }

    isShowError = false;

    ngOnInit(): void {
        switch (this.editPageState) {
            case EditPageState.add:
                this.inputModel.recorD_STATUS = RecordStatusConsts.Active;
                this.inputModel.workfloW_ASSIGNs = [];
                this.editTable.setList(this.inputModel.workfloW_ASSIGNs);
                this.appToolbar.setRole('Workflow', false, false, true, false, false, false, false, false);
                this.appToolbar.setEnableForEditPage();
                break;
            case EditPageState.edit:
                this.appToolbar.setRole('Workflow', false, false, true, false, false, false, false, false);
                this.appToolbar.setEnableForEditPage();
                this.getWorkflow();
                break;
            case EditPageState.viewDetail:
                this.appToolbar.setRole('Workflow', false, false, false, false, false, false, true, false);
                this.appToolbar.setEnableForViewDetailPage();
                this.getWorkflow();
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
        this.menuService.getAllMenus().subscribe(response => {
            var menus = response.filter(x => x.route);
            this.menus = menus;
        });

        this.roleService.getRoles('',undefined).subscribe(response => {
            this.roles = response.items;
            this.roles.forEach(x => {
                x.displayName = this.l(x.displayName);
            })
        })
    }

    stepNumberChange() {
        var steps = this.inputModel.steP_NUMBERS;
        var stepsAdd = steps - this.editTable.allData.length;
        if (stepsAdd > 0) {
            for (var i = 0; i < stepsAdd; i++) {
                var item = new CM_WORKFLOW_ASSIGN_ENTITY();
                item.limiT_VALUE_FROM = item.limiT_VALUE_TO = 0;
                this.editTable.pushItem(item);
            }
        }
        else {
            this.editTable.allData.filter(x => x.no >= this.editTable.allData.length + stepsAdd + 1).forEach(x => x.isChecked = true);
            this.editTable.removeAllCheckedItem();
            this.inputModel.workfloW_ASSIGNs = this.editTable.allData;
        }
    }

    getWorkflow() {
        this.workflowService.cM_WORKFLOW_ById(this.inputModel.workfloW_ID).subscribe(response => {
            this.inputModel = response;
            this.editTable.setList(this.inputModel.workfloW_ASSIGNs);
            if (this.inputModel.autH_STATUS == AuthStatusConsts.Approve) {
                this.appToolbar.setButtonApproveEnable(false);
            }
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
            this.saving = true;
            this.inputModel.makeR_ID = this.appSession.user.userName;
            if (!this.inputModel.workfloW_ID) {
                this.workflowService.cM_WORKFLOW_Ins(this.inputModel).pipe(finalize(() => { this.saving = false; }))
                    .subscribe((response) => {
                        if (response.result != '0') {
                            this.showErrorMessage(response.errorDesc);
                        }
                        else {
                            this.addNewSuccess();
                            if (!this.isApproveFunct) {
                                this.workflowService.cM_WORKFLOW_App(response.id, this.appSession.user.userName)
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
                this.workflowService.cM_WORKFLOW_Upd(this.inputModel).pipe(finalize(() => { this.saving = false; }))
                    .subscribe((response) => {
                        if (response.result != '0') {
                            this.showErrorMessage(response.errorDesc);
                        }
                        else {
                            this.updateSuccess();
                            if (!this.isApproveFunct) {
                                this.workflowService.cM_WORKFLOW_App(this.inputModel.workfloW_ID, this.appSession.user.userName)
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
        this.navigatePassParam('/app/admin/workflow', null, { filterInput: JSON.stringify(this.filterInput) });
    }

    onAdd(): void {
    }
    onUpdate(item: CM_WORKFLOW_ENTITY): void {
    }
    onDelete(item: CM_WORKFLOW_ENTITY): void {
    }
    onApprove(item: CM_WORKFLOW_ENTITY): void {
        var currentUserName = this.appSession.user.userName;
        if (currentUserName == this.inputModel.makeR_ID) {
            this.showErrorMessage(this.l('ApproveFailed'));
            return;
        }
        this.message.confirm(
            this.l('ApproveWarningMessage', this.l(this.inputModel.workfloW_ID)),
            this.l('AreYouSure'),
            (isConfirmed) => {
                if (isConfirmed) {
                    this.saving = true;
                    this.workflowService.cM_WORKFLOW_App(this.inputModel.workfloW_ID, currentUserName)
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

    onViewDetail(item: CM_WORKFLOW_ENTITY): void {
    }

    onSave(): void {
        this.saveInput();
    }

    onSearch(): void {
    }

    onResetSearch(): void {
    }

}
