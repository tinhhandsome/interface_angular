import { Component, Injector, ViewChild, OnInit, ViewEncapsulation, ElementRef, AfterViewInit } from '@angular/core';
import { appModuleAnimation } from '@shared/animations/routerTransition';
import * as _ from 'lodash';
import { AppMenuServiceProxy, TL_MENU_ENTITY, UltilityServiceProxy } from '@shared/service-proxies/service-proxies';
import { EditPageState } from '@app/ultilities/enum/edit-page-state';
import { AllCodes } from '@app/ultilities/enum/all-codes';
import { finalize } from 'rxjs/operators';
import { DefaultComponentBase } from '@app/ultilities/default-component-base';
import { TreeRadioSelectComponent } from '@app/admin/core/controls/tree-select-radio/tree-radio-select.component';
import { Select2CustomComponent } from '@app/admin/core/controls/custom-select2/select2-custom.component';
import { IUiAction } from '@app/ultilities/ui-action';
import { AuthStatusConsts } from '@app/admin/core/ultils/consts/AuthStatusConsts';
import { RecordStatusConsts } from '@app/admin/core/ultils/consts/RecordStatusConsts';

@Component({
    templateUrl: './app-menu-edit.component.html',
    encapsulation: ViewEncapsulation.None,
    animations: [appModuleAnimation()]
})
export class AppMenuEditComponent extends DefaultComponentBase implements OnInit, IUiAction<TL_MENU_ENTITY>, AfterViewInit {

    constructor(
        injector: Injector,
        private ultilityService: UltilityServiceProxy,
        private menuService: AppMenuServiceProxy
    ) {
        super(injector);
        this.editPageState = this.getRouteData('editPageState');
        this.inputModel.menU_ID = this.getRouteParam('id');
        this.initFilter();
        this.initIsApproveFunct();
    }

    @ViewChild('permissionTree') permissionTree: TreeRadioSelectComponent;
    @ViewChild('menU_PARENT') menU_PARENT: Select2CustomComponent;
    @ViewChild('editForm') editForm: ElementRef;

    EditPageState = EditPageState;
    AllCodes = AllCodes;
    editPageState: EditPageState;

    inputModel: TL_MENU_ENTITY = new TL_MENU_ENTITY();
    filterInput: TL_MENU_ENTITY;

    // sua
    isApproveFunct: boolean;

    get disableInput(): boolean {
        return this.editPageState == EditPageState.viewDetail;
    }

    isShowError = false;

    menuItems: TL_MENU_ENTITY[];

    ngOnInit(): void {
        switch (this.editPageState) {
            case EditPageState.add:
                this.inputModel.recorD_STATUS = RecordStatusConsts.Active;
                this.appToolbar.setRole('Menu', false, false, true, false, false, false, false, false);
                this.appToolbar.setEnableForEditPage();
                break;
            case EditPageState.edit:
                this.appToolbar.setRole('Menu', false, false, true, false, false, false, false, false);
                this.appToolbar.setEnableForEditPage();
                this.getAppMenu();
                break;
            case EditPageState.viewDetail:
                this.appToolbar.setRole('Menu', false, false, false, false, false, false, true, false);
                this.appToolbar.setEnableForViewDetailPage();
                this.getAppMenu();
                break;
        }

        this.appToolbar.setUiAction(this);

        this.menuService.tL_MENU_Search(this.getFillterForCombobox()).subscribe((response) => {
            this.menuItems = response.items;
            this.updateView();
        })
    }

    ngAfterViewInit(): void {
        // COMMENT: this.stopAutoUpdateView();
        this.setupValidationMessage();
    }

    // sua
    initIsApproveFunct() {
        this.ultilityService.isApproveFunct(this.getCurrentFunctionId()).subscribe(isApproveFunct => {
            this.isApproveFunct = isApproveFunct;
        })
    }

    menuKeyChange() {
        this.inputModel.menU_LINK = '/app/admin/' + this.inputModel.menU_NAME_EL.toLocaleLowerCase();
        this.onChangeProperty('menU_LINK');
    }

    getAppMenu() {
        this.menuService.tL_MENU_ById(this.inputModel.menU_ID).subscribe(response => {
            this.inputModel = response;
            if (this.inputModel.autH_STATUS == AuthStatusConsts.Approve) {
                this.appToolbar.setButtonApproveEnable(false);
            }
            this.updateView();
        });
    }

    showPermissionModal() {
        this.permissionTree.modal.show();
    }

    saveInput() {
        // sua moi
        if (this.isApproveFunct == undefined) {
            this.showErrorMessage(this.l('PageLoadUndone'));
            this.updateView();
            return;
        }

        if ((this.editForm as any).form.invalid) {
            this.isShowError = true;
            this.showErrorMessage(this.l('FormInvalid'));
            this.updateView();
            return;
        }
        if (this.editPageState != EditPageState.viewDetail) {
            this.saving = true;
            // sua
            this.inputModel.makeR_ID = this.appSession.user.userName;
            if (!this.inputModel.menU_ID) {
                this.menuService.tL_MENU_Ins(this.inputModel).pipe(finalize(() => { this.saving = false; }))
                    .subscribe((response) => {
                        if (response.result != '0') {
                            this.showErrorMessage(response.errorDesc);
                        }
                        else {
                            this.addNewSuccess();
                            // sua
                            if (!this.isApproveFunct) {
                                this.menuService.tL_MENU_App(parseInt(response.id), this.appSession.user.userName)
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
                this.menuService.tL_MENU_Upd(this.inputModel).pipe(finalize(() => { this.saving = false; }))
                    .subscribe((response) => {
                        if (response.result != '0') {
                            this.showErrorMessage(response.errorDesc);
                        }
                        else {
                            this.updateSuccess();
                            // sua
                            if (!this.isApproveFunct) {
                                this.menuService.tL_MENU_App(this.inputModel.menU_ID, this.appSession.user.userName)
                                    .pipe(finalize(() => { this.saving = false; }))
                                    .subscribe((response) => {
                                        if (response.result != '0') {
                                            this.showErrorMessage(response.errorDesc);
                                        }
                                        else {
                                            this.inputModel.autH_STATUS = AuthStatusConsts.Approve;
                                            this.appToolbar.setButtonApproveEnable(false);
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
        this.navigatePassParam('/app/admin/app-menu', null, undefined);
    }

    onAdd(): void {
    }

    onUpdate(item: TL_MENU_ENTITY): void {
    }

    onDelete(item: TL_MENU_ENTITY): void {
    }

    onApprove(item: TL_MENU_ENTITY): void {
        if (!this.inputModel.menU_ID) {
            return;
        }
        // sua
        var currentUserName = this.appSession.user.userName;
        // sua
        if (currentUserName == this.inputModel.makeR_ID) {
            this.showErrorMessage(this.l('ApproveFailed'));
            return;
        }
        this.message.confirm(
            this.l('ApproveWarningMessage', this.inputModel.menU_NAME),
            this.l('AreYouSure'),
            (isConfirmed) => {
                if (isConfirmed) {
                    this.saving = true;
                    // sua
                    this.menuService.tL_MENU_App(this.inputModel.menU_ID, currentUserName)
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

    onViewDetail(item: TL_MENU_ENTITY): void {
    }

    onSave(): void {
        this.saveInput();
    }

    onSearch(): void {
    }

    onResetSearch(): void {
    }
}
