import { Component, Injector, ViewChild, OnInit, ViewEncapsulation, ElementRef } from '@angular/core';
import { appModuleAnimation } from '@shared/animations/routerTransition';
import * as _ from 'lodash';
import { CarChargeServiceProxy, UltilityServiceProxy } from '@shared/service-proxies/service-proxies';
import { EditPageState } from '@app/ultilities/enum/edit-page-state';
import { AllCodes } from '@app/ultilities/enum/all-codes';
import { finalize } from 'rxjs/operators';
import { DefaultComponentBase } from '@app/ultilities/default-component-base';
import { IUiAction } from '@app/ultilities/ui-action';
import { AuthStatusConsts } from '@app/admin/core/ultils/consts/AuthStatusConsts';
import { RecordStatusConsts } from '@app/admin/core/ultils/consts/RecordStatusConsts';
import { CarMasterModalComponent } from "@app/admin/core/controls/car-modal/car-master-modal.component";
import { MoneyInputComponent } from "@app/admin/core/controls/money-input/money-input.component";
import { CAR_MASTER_ENTITY, CM_ALLCODE_ENTITY, CAR_CHARGE_ENTITY } from "@shared/service-proxies/service-proxies";
import * as moment from 'moment';

@Component({
    templateUrl: './car-charge-edit.component.html',
    encapsulation: ViewEncapsulation.None,
    animations: [appModuleAnimation()]
})

export class CarChargeEditComponent extends DefaultComponentBase implements OnInit, IUiAction<CAR_CHARGE_ENTITY> {

    constructor(
        injector: Injector,
        private carChargeService: CarChargeServiceProxy,
        private ultilityService: UltilityServiceProxy
    ) {
        super(injector);
        this.editPageState = this.getRouteData('editPageState');
        this.inputModel.caR_CHAR_ID = this.getRouteParam('id');
        this.initFilter();
        this.initIsApproveFunct();
    }

    @ViewChild('editForm') editForm: ElementRef;
    @ViewChild('carMasterModal') carMasterModal: CarMasterModalComponent;

    EditPageState = EditPageState;
    AllCodes = AllCodes;
    editPageState: EditPageState;

    inputModel: CAR_CHARGE_ENTITY = new CAR_CHARGE_ENTITY();

    filterInput: CAR_CHARGE_ENTITY;
    carMasterFilter: CAR_MASTER_ENTITY;

    isApproveFunct: boolean;

    get disableInput(): boolean {
        return this.editPageState == EditPageState.viewDetail;
    }

    isShowError = false;

    ngOnInit(): void {
        switch (this.editPageState) {
            case EditPageState.add:
                this.inputModel.recorD_STATUS = RecordStatusConsts.Active;
                this.appToolbar.setRole('CarCharge', false, false, true, false, false, false, false, false);
                this.appToolbar.setEnableForEditPage();
                this.initInfo();
                break;
            case EditPageState.edit:
                if(this.inputModel.autH_STATUS == AuthStatusConsts.Approve)
                    this.appToolbar.setButtonSaveVisible(false);
                this.appToolbar.setRole('CarCharge', false, false, true, false, false, false, false, false);
                this.appToolbar.setEnableForEditPage();
                break;
            case EditPageState.viewDetail:
                this.appToolbar.setRole('CarCharge', false, false, false, false, false, false, true, false);
                this.appToolbar.setEnableForViewDetailPage();
                break;
        }
        if (this.editPageState != EditPageState.add)
            this.getCarCharge();
        this.appToolbar.setUiAction(this);
    }

    initInfo() {
        this.inputModel.makeR_ID = this.appSession.user.userName;
        this.inputModel.charG_DT = moment();
        this.inputModel.charG_TERMS = 1;
        this.inputModel.charG_MAT_DT = moment().add(1, 'M');
        this.inputModel.charG_AMT = 0;
    }

    initIsApproveFunct() {
        this.ultilityService.isApproveFunct(this.getCurrentFunctionId()).subscribe(isApproveFunct => {
            this.isApproveFunct = isApproveFunct;
        })
    }

    setDefaultValueIfEmpty(event: any, value: any) {
        if (event == null || event == undefined)
            return;
        if (event.target.value == '') {
            event.target.value = value;
        }

    }

    checkNum(num : string): boolean {
        var reg = /^[0-9]+$/;
        if(num.match(reg))
            return true;
        return false;

    }

    onChargDateChange(event: any): void {
        this.setDefaultValueIfEmpty(event, '0');
        if (!this.checkNum(this.inputModel.charG_TERMS.toString())) {
            this.inputModel.charG_TERMS = 1;
        }
        if (event == null || event == undefined)
            return;
        this.inputModel.charG_MAT_DT = this.inputModel.charG_DT.clone().add(this.inputModel.charG_TERMS, 'M');
    }

    onChargMatDateChange(event: any) {
        this.setDefaultValueIfEmpty(event, '0');
        if (!this.checkNum(this.inputModel.charG_TERMS.toString())) {
            this.inputModel.charG_TERMS = 1;
        }
        if (event == null || event == undefined)
            return;
        this.inputModel.charG_DT = this.inputModel.charG_MAT_DT.clone().add(-this.inputModel.charG_TERMS, 'M');
    }

    initCombobox() {
    }

    getCarCharge(): void {
        this.carChargeService.cAR_CHARGE_ById(this.inputModel.caR_CHAR_ID).subscribe(response => {
            this.inputModel = response;
            if (this.inputModel.autH_STATUS == AuthStatusConsts.Approve) {
                this.appToolbar.setEnableForViewDetailPage();
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
            if (!this.inputModel.caR_CHAR_ID) {
                this.inputModel.recorD_STATUS = RecordStatusConsts.Active;
                this.carChargeService.cAR_CHARGE_Ins(this.inputModel).pipe(finalize(() => { this.saving = false; }))
                    .subscribe((response) => {
                        if (response['Result'] != '0') {
                            this.showErrorMessage(response['ErrorDesc']);
                        }
                        else {
                            this.showSuccessMessage(this.l('InsertSuccessful'));
                            if (!this.isApproveFunct) {
                                this.carChargeService.cAR_CHARGE_App(response.id, this.appSession.user.userName)
                                    .pipe(finalize(() => { this.saving = false; }))
                                    .subscribe((response) => {
                                        if (response['Result'] != '0') {
                                            this.showErrorMessage(response['ErrorDesc']);
                                        }
                                    });
                            }
                        }
                    });
            }
            else {
                this.inputModel.makeR_ID = this.appSession.user.userName;
                this.inputModel.checkeR_ID = '';
                this.carChargeService.cAR_CHARGE_Upd(this.inputModel).pipe(finalize(() => { this.saving = false; }))
                    .subscribe((response) => {
                        if (response['Result'] != '0') {
                            this.showErrorMessage(response['ErrorDesc']);
                        }
                        else {
                            this.showSuccessMessage(this.l('UpdateSuccessful'));
                            if (!this.isApproveFunct) {
                                this.carChargeService.cAR_CHARGE_App(this.inputModel.caR_CHAR_ID, this.appSession.user.userName)
                                    .pipe(finalize(() => { this.saving = false; }))
                                    .subscribe((response) => {
                                        if (response['Result'] != '0') {
                                            this.showErrorMessage(response['ErrorDesc']);
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
        this.navigatePassParam('/app/admin/car-charge', null, { filterInput: JSON.stringify(this.filterInput), carMasterFilter: JSON.stringify(this.carMasterFilter) });
    }

    onAdd(): void {
    }

    onUpdate(item: CAR_CHARGE_ENTITY): void {
    }

    onDelete(item: CAR_CHARGE_ENTITY): void {
    }

    onApprove(item: CAR_CHARGE_ENTITY): void {
        if (!this.inputModel.caR_CHAR_ID) {
            return;
        }
        var currentUserName = this.appSession.user.userName;
        if (currentUserName == this.inputModel.makeR_ID) {
            this.showErrorMessage(this.l('ApproveFailed'));
            return;
        }

        this.message.confirm(
            this.l('ApproveWarningMessage', this.l(this.inputModel.n_PLATE)),
            this.l('AreYouSure'),
            (isConfirmed) => {
                if (isConfirmed) {
                    this.saving = true;
                    this.carChargeService.cAR_CHARGE_App(this.inputModel.caR_CHAR_ID, currentUserName)
                        .pipe(finalize(() => { this.saving = false; }))
                        .subscribe((response) => {
                            if (response['Result'] != '0') {
                                this.showErrorMessage(response['ErrorDesc']);
                            }
                            else {
                                this.showSuccessMessage(this.l('SuccessfullyApprove'));
                                this.inputModel.autH_STATUS = AuthStatusConsts.Approve;
                            }
                        });
                }
            }
        );
    }

    onSelectCar(event: CAR_MASTER_ENTITY): void {
        this.inputModel.asseT_ID = event.asseT_ID;
        this.inputModel.asseT_NAME = event.asseT_NAME;
        this.inputModel.caR_ID = event.caR_ID;
        this.inputModel.n_PLATE = event.n_PLATE;
        this.inputModel.model = event.model;
        this.inputModel.caR_TYPE_NAME = event.caR_TYPE_NAME;
        this.inputModel.fuelS_TYPE = event.fuelS_TYPE;
        this.inputModel.procountry = event.procountry;
        this.inputModel.owner = event.owner;
    }

    initFilter() {
        this.getFilterInputInRoute((filterJson) => {
            if (filterJson['filterInput'])
                (this as any).filterInput = JSON.parse(filterJson['filterInput']);
            if (filterJson['carMasterFilter'])
                (this as any).carMasterFilter = JSON.parse(filterJson['carMasterFilter']);
        });
    }

    getFilterInputInRoute(getFilterInput): any {
        this.activeRoute.queryParams.subscribe(response => {
            if (getFilterInput) {
                getFilterInput(response);
            }
        })
    }

    onSelectedChanged(event: any): void {
    }

    onViewDetail(item: CAR_CHARGE_ENTITY): void {
    }

    onSave(): void {
        this.saveInput();
    }

    onSearch(): void {
    }

    onResetSearch(): void {
    }
}