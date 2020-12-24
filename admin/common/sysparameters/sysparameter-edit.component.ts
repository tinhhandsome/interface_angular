import { Component, Injector, ViewChild, Output, EventEmitter, OnInit, ViewEncapsulation, ElementRef } from '@angular/core';
import { appModuleAnimation } from '@shared/animations/routerTransition';
import * as _ from 'lodash';
import { SysParametersServiceProxy, SYS_PARAMETERS_ENTITY, RoleServiceProxy, AppPermissionServiceProxy } from '@shared/service-proxies/service-proxies';
import { EditPageState } from '@app/ultilities/enum/edit-page-state';
import { AllCodes } from '@app/ultilities/enum/all-codes';
import { finalize } from 'rxjs/operators';
import { DefaultComponentBase } from '@app/ultilities/default-component-base';
import { IUiAction } from '@app/ultilities/ui-action';
import { AuthStatusConsts } from '@app/admin/core/ultils/consts/AuthStatusConsts';
import { RecordStatusConsts } from '@app/admin/core/ultils/consts/RecordStatusConsts';

@Component({
    templateUrl: './sysparameter-edit.component.html',
    encapsulation: ViewEncapsulation.None,
    animations: [appModuleAnimation()]
})
export class SysParameterEditComponent extends DefaultComponentBase implements OnInit, IUiAction<SYS_PARAMETERS_ENTITY> {
    constructor(
        injector: Injector,
        private sysParameterService: SysParametersServiceProxy
    ) {
        super(injector);
        this.editPageState = this.getRouteData('editPageState');
        this.inputModel.id = this.getRouteParam('id');
        this.initFilter();
    }

    @ViewChild('editForm') editForm: ElementRef;

    EditPageState = EditPageState;
    AllCodes = AllCodes;
    editPageState: EditPageState;

    inputModel: SYS_PARAMETERS_ENTITY = new SYS_PARAMETERS_ENTITY();
    filterInput: SYS_PARAMETERS_ENTITY;


    get disableInput(): boolean {
        return this.editPageState == EditPageState.viewDetail;
    }

    isShowError = false;

    ngOnInit(): void {
        switch (this.editPageState) {
            case EditPageState.add:
                this.inputModel.recorD_STATUS = RecordStatusConsts.Active;
                this.appToolbar.setRole('SysParameter', false, false, true, false, false, false, false, false);
                this.appToolbar.setEnableForEditPage();
                break;
            case EditPageState.edit:
                this.appToolbar.setRole('SysParameter', false, false, true, false, false, false, false, false);
                this.appToolbar.setEnableForEditPage();
                this.getSysParameter();
                break;
            case EditPageState.viewDetail:
                this.appToolbar.setRole('SysParameter', false, false, false, false, false, false, true, false);
                this.appToolbar.setButtonApproveVisible(false);
                this.getSysParameter();
                break;
        }

        this.appToolbar.setUiAction(this);
    }

    getSysParameter() {
        this.sysParameterService.sYS_PARAMETERS_ById(this.inputModel.id).subscribe(response => {
            this.inputModel = response;
            if (this.inputModel.autH_STATUS == AuthStatusConsts.Approve) {
                this.appToolbar.setButtonApproveEnable(false);
            }
        });
    }

    saveInput() {
        if ((this.editForm as any).form.invalid) {
            this.isShowError = true;
            this.showErrorMessage(this.l('FormInvalid'));
            return;
        }
        if (this.editPageState != EditPageState.viewDetail) {
            this.saving = true;
            if (!this.inputModel.id) {

                this.sysParameterService.sYS_PARAMETERS_Ins(this.inputModel).pipe(finalize(() => { this.saving = false; }))
                    .subscribe((response) => {
                        if (response.result != '0') {
                            this.showErrorMessage(response.errorDesc);
                        }
                        else {
                            this.addNewSuccess();
                        }
                    });
            }
            else {
                this.sysParameterService.sYS_PARAMETERS_Upd(this.inputModel).pipe(finalize(() => { this.saving = false; }))
                    .subscribe((response) => {
                        if (response.result != '0') {
                            this.showErrorMessage(response.errorDesc);
                        }
                        else {
                            this.updateSuccess();
                        }
                    });
            }
        }
    }

    goBack() {
        this.navigatePassParam('/app/admin/argument', null, { filterInput: JSON.stringify(this.filterInput) });
    }

    onAdd(): void {
    }

    onUpdate(item: SYS_PARAMETERS_ENTITY): void {
    }

    onDelete(item: SYS_PARAMETERS_ENTITY): void {
    }

    onApprove(item: SYS_PARAMETERS_ENTITY): void {

    }

    onViewDetail(item: SYS_PARAMETERS_ENTITY): void {
    }

    onSave(): void {
        this.saveInput();
    }

    onSearch(): void {
    }

    onResetSearch(): void {
    }
}
