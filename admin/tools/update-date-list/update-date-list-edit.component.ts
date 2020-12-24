import { Component, Injector, ViewChild, OnInit, ViewEncapsulation, ElementRef, AfterViewInit } from '@angular/core';
import { appModuleAnimation } from '@shared/animations/routerTransition';
import * as _ from 'lodash';
import { UltilityServiceProxy, UPDATE_DATE_LIST_ENTITY, UpdateDateListServiceProxy, AssMasterServiceProxy, ASS_MASTER_ENTITY } from '@shared/service-proxies/service-proxies';
import { EditPageState } from '@app/ultilities/enum/edit-page-state';
import { finalize } from 'rxjs/operators';
import { DefaultComponentBase } from '@app/ultilities/default-component-base';
import { IUiAction } from '@app/ultilities/ui-action';
import { AuthStatusConsts } from '@app/admin/core/ultils/consts/AuthStatusConsts';
import { RecordStatusConsts } from '@app/admin/core/ultils/consts/RecordStatusConsts';
import { AssetModalComponent } from '@app/admin/core/controls/asset-modal/asset-modal.component';
import * as moment from 'moment';

@Component({
    templateUrl: './update-date-list-edit.component.html',
    encapsulation: ViewEncapsulation.None,
    animations: [appModuleAnimation()]
})
export class UpdateDateListEditComponent extends DefaultComponentBase implements OnInit, AfterViewInit, IUiAction<UPDATE_DATE_LIST_ENTITY> {

    constructor(
        injector: Injector,
        private UpdateDateListService: UpdateDateListServiceProxy,
        private ultilityService: UltilityServiceProxy,
    ) {
        super(injector);
        this.editPageState = this.getRouteData('editPageState');
        this.inputModel.upD_DAY_ID = this.getRouteParam('id');
        this.initFilter();
        this.initIsApproveFunct();
        this.stopAutoUpdateView();
    }

    @ViewChild('editForm') editForm: ElementRef;
    @ViewChild('assetModal') assetModal: AssetModalComponent;

    EditPageState = EditPageState;
    // AllCodes = AllCodes;
    editPageState: EditPageState;

    inputModel: UPDATE_DATE_LIST_ENTITY = new UPDATE_DATE_LIST_ENTITY();
    filterInput: UPDATE_DATE_LIST_ENTITY;
    isApproveFunct: boolean;
    asstype: UPDATE_DATE_LIST_ENTITY[] = [];
    dateNull = moment("01/01/1900 00:00:00", "DD/MM/YYYY hh:mm:ss");

    userName: string = '';
    subbrId: string = '';

    get disableInput(): boolean {
        return (this.editPageState == EditPageState.viewDetail || this.inputModel.autH_STATUS == AuthStatusConsts.Approve);
    }


    isShowError = false;

    ngOnInit(): void {
        this.initUserInfo();
        switch (this.editPageState) {
            case EditPageState.add:
                this.inputModel.recorD_STATUS = RecordStatusConsts.Active;
                this.appToolbar.setRole('ToolUpdateDayList', false, false, true, false, false, false, false, false);
                this.appToolbar.setEnableForEditPage();
                this.inputModel.hcqT_CREATE_DT =
                this.inputModel.hcqT_APP_DT =
                this.inputModel.hcqT_EXP_DT =
                this.inputModel.kT_APP_DT = 
                this.inputModel.kT_CREATE_DT = 
                this.inputModel.kT_EXP_DT = 
                this.inputModel.creatE_DT =
                this.inputModel.requesT_DT = moment();
                this.inputModel.makeR_ID = this.userName;
                break;
            case EditPageState.edit:
                this.appToolbar.setRole('ToolUpdateDayList', false, false, true, false, false, false, false, false);
                this.appToolbar.setEnableForEditPage();
                this.getUpdateDateListForEdit();
                break;
            case EditPageState.viewDetail:
                this.appToolbar.setRole('ToolUpdateDayList', false, false, false, false, false, false, true, false);
                this.appToolbar.setEnableForViewDetailPage();
                this.inputModel.totalCount = 1;
                this.getUpdateDateList();
                break;
        }
        this.appToolbar.setUiAction(this);
        this.inputModel.asset = this.inputModel.asset ? this.inputModel.asset : new ASS_MASTER_ENTITY();
    }

    ngAfterViewInit(): void {
        this.updateView();
        this.setupValidationMessage();
    }

    initUserInfo(): void {
        this.userName = this.appSession.user.userName;
        this.subbrId = this.appSession.user.subbrId;
    }

    initIsApproveFunct() {
        this.ultilityService.isApproveFunct(this.getCurrentFunctionId()).subscribe(isApproveFunct => {
            this.isApproveFunct = isApproveFunct;
            this.updateView();
        })
    }

    getUpdateDateList() {
        this.inputModel.totalCount = 1;
        this.UpdateDateListService.uPDATE_DATE_LIST_ById(this.inputModel).subscribe(response => {
            this.inputModel = response;
            if (this.inputModel.autH_STATUS == AuthStatusConsts.Approve) {
                this.appToolbar.setButtonApproveEnable(false);
            }
            this.updateView();
        });
    }

    getUpdateDateListForEdit() {
        this.inputModel.totalCount = 1;
        this.UpdateDateListService.uPDATE_DATE_LIST_ById(this.inputModel).subscribe(response => {
            this.inputModel = response;
            this.inputModel.makeR_ID = this.userName;
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
        if (this.inputModel.hcqT_APP_DT != null && this.inputModel.hcqT_CREATE_DT != null && this.inputModel.hcqT_APP_DT != this.dateNull && this.inputModel.hcqT_CREATE_DT != this.dateNull)
            if (!(this.inputModel.hcqT_APP_DT > this.inputModel.hcqT_CREATE_DT)) {
                this.showErrorMessage(this.l('HCQTApproveDTSmallerThanCreatDT'));
                this.updateView();
                return;
            }
        if (this.inputModel.kT_APP_DT != null && this.inputModel.kT_CREATE_DT != null && this.inputModel.kT_APP_DT != this.dateNull && this.inputModel.kT_CREATE_DT != this.dateNull)
            if (!(this.inputModel.kT_APP_DT > this.inputModel.kT_CREATE_DT)) {
                this.showErrorMessage(this.l('KTApproveDTSmallerThanCreatDT'));
                this.updateView();
                return;
            }
        if (this.editPageState != EditPageState.viewDetail) {
            this.saving = true;
            if (this.inputModel.hcqT_APP_DT == null)
                this.inputModel.hcqT_APP_DT = this.dateNull;
            if (this.inputModel.hcqT_CREATE_DT == null)
                this.inputModel.hcqT_CREATE_DT = this.dateNull;
            if (this.inputModel.hcqT_EXP_DT == null)
                this.inputModel.hcqT_EXP_DT = this.dateNull;
            if (this.inputModel.kT_APP_DT == null)
                this.inputModel.kT_APP_DT = this.dateNull;
            if (this.inputModel.kT_CREATE_DT == null)
                this.inputModel.kT_CREATE_DT = this.dateNull;
            if (this.inputModel.kT_EXP_DT == null)
                this.inputModel.kT_EXP_DT = this.dateNull;
            if (!this.inputModel.upD_DAY_ID) {
                this.UpdateDateListService.uPDATE_DATE_LIST_Ins(this.inputModel).pipe(finalize(() => { this.saving = false; }))
                    .subscribe((response) => {
                        if (response['Result'] != '0') {
                            this.showErrorMessage(response['ErrorDesc']);
                        }
                        else {
                            this.addNewSuccess();
                            if (!this.isApproveFunct) {
                                this.UpdateDateListService.uPDATE_DATE_LIST_App(response['UPD_DAY_ID'], this.userName)
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
                this.UpdateDateListService.uPDATE_DATE_LIST_Upd(this.inputModel).pipe(finalize(() => { this.saving = false; }))
                    .subscribe((response) => {
                        if (response['Result'] != '0') {
                            this.showErrorMessage(response['ErrorDesc']);
                        }
                        else {
                            this.updateSuccess();
                            if (!this.isApproveFunct) {
                                this.UpdateDateListService.uPDATE_DATE_LIST_App(response['UPD_DAY_ID'], this.userName)
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
    }

    goBack() {
        this.navigatePassParam('/app/admin/update-date-list', null, { filterInput: JSON.stringify(this.filterInput) });
    }

    onAdd(): void {
    }

    onUpdate(item: UPDATE_DATE_LIST_ENTITY): void {
    }

    onDelete(item: UPDATE_DATE_LIST_ENTITY): void {
    }

    onApprove(item: UPDATE_DATE_LIST_ENTITY): void {
        if (this.userName == this.inputModel.makeR_ID) {
            this.showErrorMessage(this.l('ApproveFailed'));
            this.updateView();
            return;
        }
        this.message.confirm(
            this.l('ApproveWarningMessage', this.l(this.inputModel.upD_DAY_ID)),
            this.l('AreYouSure'),
            (isConfirmed) => {
                if (isConfirmed) {
                    this.saving = true;
                    this.UpdateDateListService.uPDATE_DATE_LIST_App(this.inputModel.upD_DAY_ID, this.userName)
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


    showAssetModal() {
        this.assetModal.filterInput.level = "ALL";
        this.assetModal.show();
    }

    onSingleSelectAsset(asset: ASS_MASTER_ENTITY) {
        this.inputModel.asS_ID = asset.asseT_ID;
        this.inputModel.asS_CODE = asset.asseT_CODE;
        this.inputModel.asseT_NAME = asset.asseT_NAME;
        this.inputModel.brancH_ID = asset.brancH_ID;
        this.inputModel.asset = asset;
    }


    onViewDetail(item: UPDATE_DATE_LIST_ENTITY): void {
    }

    onSave(): void {
        this.saveInput();
    }

    onSearch(): void {
    }

    onResetSearch(): void {
    }
}
