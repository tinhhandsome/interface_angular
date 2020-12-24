import { Component, Injector, ViewChild, Output, EventEmitter, OnInit, ViewEncapsulation, ElementRef } from '@angular/core';
import { appModuleAnimation } from '@shared/animations/routerTransition';
import * as _ from 'lodash';
import { AllCodeServiceProxy, CM_ALLCODE_ENTITY } from '@shared/service-proxies/service-proxies';
import { EditPageState } from '@app/ultilities/enum/edit-page-state';
import { AllCodes } from '@app/ultilities/enum/all-codes';
import { finalize } from 'rxjs/operators';
import { DefaultComponentBase } from '@app/ultilities/default-component-base';
import { IUiAction } from '@app/ultilities/ui-action';

@Component({
    templateUrl: './all-code-edit.component.html',
    encapsulation: ViewEncapsulation.None,
    animations: [appModuleAnimation()]
})
export class AllCodeEditComponent extends DefaultComponentBase implements OnInit, IUiAction<CM_ALLCODE_ENTITY> {
    constructor(
        injector: Injector,
        private allCodeService: AllCodeServiceProxy
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

    inputModel: CM_ALLCODE_ENTITY = new CM_ALLCODE_ENTITY();
    filterInput: CM_ALLCODE_ENTITY;


    get disableInput(): boolean {
        return this.editPageState == EditPageState.viewDetail;
    }

    isShowError = false;

    ngOnInit(): void {
        switch (this.editPageState) {
            case EditPageState.add:
                this.appToolbar.setRole('AllCode', false, false, true, false, false, false, false, false);
                this.appToolbar.setEnableForEditPage();
                break;
            case EditPageState.edit:
                this.appToolbar.setRole('AllCode', false, false, true, false, false, false, false, false);
                this.appToolbar.setEnableForEditPage();
                this.getAllCode();
                break;
            case EditPageState.viewDetail:
                this.appToolbar.setRole('AllCode', false, false, false, false, false, false, true, false);
                this.appToolbar.setEnableForViewDetailPage();
                this.getAllCode();
                break;
        }

        this.appToolbar.setUiAction(this);
    }


    getAllCode() {
        this.allCodeService.cM_ALLCODE_ById(this.inputModel.id).subscribe(response => {
            this.inputModel = response;
            this.appToolbar.setButtonApproveEnable(false);
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
                this.allCodeService.cM_ALLCODE_Ins(this.inputModel).pipe(finalize(() => { this.saving = false; }))
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
                this.allCodeService.cM_ALLCODE_Upd(this.inputModel).pipe(finalize(() => { this.saving = false; }))
                    .subscribe((response) => {
                        if (response.result != '0') {
                            this.showErrorMessage(response.errorDesc);
                        }
                        else {
                            this.updateSuccess();
                            this.getAllCode();
                        }
                    });
            }
        }
    }

    goBack() {
        this.navigatePassParam('/app/admin/all-code', null, { filterInput: JSON.stringify(this.filterInput) });
    }

    onAdd(): void {
    }

    onUpdate(item: CM_ALLCODE_ENTITY): void {
    }

    onDelete(item: CM_ALLCODE_ENTITY): void {
    }

    onApprove(item: CM_ALLCODE_ENTITY): void {
    }

    onViewDetail(item: CM_ALLCODE_ENTITY): void {
    }

    onSave(): void {
        this.saveInput();
    }

    onSearch(): void {
    }

    onResetSearch(): void {
    }
}
