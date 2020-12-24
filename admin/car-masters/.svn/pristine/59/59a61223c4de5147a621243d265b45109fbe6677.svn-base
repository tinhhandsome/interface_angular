import { Component, Injector, ViewChild, OnInit, ViewEncapsulation, ElementRef } from '@angular/core';
import { appModuleAnimation } from '@shared/animations/routerTransition';
import * as _ from 'lodash';
import { UltilityServiceProxy, CAR_MASTER_ENTITY, CAR_REGISTER_ENTITY, CarRegisterServiceProxy } from '@shared/service-proxies/service-proxies';
import { EditPageState } from '@app/ultilities/enum/edit-page-state';
import { AllCodes } from '@app/ultilities/enum/all-codes';
import { finalize } from 'rxjs/operators';
import { DefaultComponentBase } from '@app/ultilities/default-component-base';
import { IUiAction } from '@app/ultilities/ui-action';
import { AuthStatusConsts } from '@app/admin/core/ultils/consts/AuthStatusConsts';
import { RecordStatusConsts } from '@app/admin/core/ultils/consts/RecordStatusConsts';
import { CarMasterModalComponent } from '@app/admin/core/controls/car-modal/car-master-modal.component';
import * as moment from 'moment';

@Component({
    templateUrl: './car-register-edit.component.html',
    encapsulation: ViewEncapsulation.None,
    animations: [appModuleAnimation()]
})
export class CarRegisterEditComponent extends DefaultComponentBase implements OnInit, IUiAction<CAR_REGISTER_ENTITY> {
   
    constructor(
        injector: Injector,
        private ultilityService: UltilityServiceProxy,
        private carRegisterService: CarRegisterServiceProxy,


    ) {
        super(injector);
        this.editPageState = this.getRouteData('editPageState');
        this.inputModel.caR_REG_ID = this.getRouteParam('regId');

        this.initFilter();
        this.initIsApproveFunct();
        
    }

    @ViewChild('carMasterModal') carMasterModal: CarMasterModalComponent;

    @ViewChild('editForm') editForm: ElementRef;
   
    EditPageState = EditPageState;
    AllCodes = AllCodes;
    editPageState: EditPageState;

    filterInput: CAR_REGISTER_ENTITY;
    inputModel: CAR_REGISTER_ENTITY = new CAR_REGISTER_ENTITY();
    appr = "Thông tin đăng kiểm xe của ";
    
    isApproveFunct: boolean;


    get disableInput(): boolean {
        return (this.editPageState == EditPageState.viewDetail || this.inputModel.autH_STATUS==AuthStatusConsts.Approve);
    }

    isShowError = false;


    ngOnInit(): void {
       
            switch (this.editPageState) {
                case EditPageState.add:
                    this.inputModel.recorD_STATUS = RecordStatusConsts.Active;
                    this.appToolbar.setRole('CarRegister', false, false, true, false, false, false, false, false);
                    this.appToolbar.setEnableForEditPage();
                    this.initInfo();
                    break;
                case EditPageState.edit:
                    this.appToolbar.setRole('CarRegister', false, false, true, false, false, false, false, false);
                    this.appToolbar.setEnableForEditPage();
                    this.getCarRegister();
                    break;
                case EditPageState.viewDetail:
                    this.appToolbar.setRole('CarRegister', false, false, false, false, false, false, true, false);
                    this.appToolbar.setEnableForViewDetailPage();
                    this.getCarRegister();
                    break;
            }
            this.appToolbar.setUiAction(this);

        }

    initInfo(){
        this.inputModel.reG_DT = moment();
        this.inputModel.reG_TERMS = 1;
        this.inputModel.reG_MAT_DT = moment().add(1, 'M');
        this.inputModel.reG_AMT = 0;
    }    



    initIsApproveFunct() {
        this.ultilityService.isApproveFunct(this.getCurrentFunctionId()).subscribe(isApproveFunct => {
            this.isApproveFunct = isApproveFunct;
        })
    }

    getCarRegister() {
        this.carRegisterService.cAR_REGISTER_ById(this.inputModel.caR_REG_ID).subscribe(response => {
            this.inputModel = response;
            if (this.inputModel.autH_STATUS == AuthStatusConsts.Approve) {
                this.appToolbar.setButtonApproveEnable(false);
                this.appToolbar.setButtonSaveEnable(false);
            }               
        });
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

    onRegDateChange(event: any): void {
        this.setDefaultValueIfEmpty(event, '0');
        if (!this.checkNum(this.inputModel.reG_TERMS.toString())) {
            this.inputModel.reG_TERMS = 1;
        }
        if (event == null || event == undefined)
            return;
        this.inputModel.reG_MAT_DT = this.inputModel.reG_DT.clone().add(this.inputModel.reG_TERMS, 'M');
    }

    onRegMatDateChange(event: any) {
        this.setDefaultValueIfEmpty(event, '0');
        if (!this.checkNum(this.inputModel.reG_TERMS.toString())) {
            this.inputModel.reG_TERMS = 1;
        }
        if (event == null || event == undefined)
            return;
        this.inputModel.reG_DT = this.inputModel.reG_MAT_DT.clone().add(-this.inputModel.reG_TERMS, 'M');
    }

    saveInput() {


        if ((this.editForm as any).form.invalid) {
            this.isShowError = true;
            this.showErrorMessage(this.l('FormInvalid'));
            return;
        }
        if (this.editPageState != EditPageState.viewDetail) {
            this.saving = true;
            this.inputModel.makeR_ID = this.appSession.user.userName;
            
            if (!this.inputModel.caR_REG_ID) {

                this.carRegisterService.cAR_REGISTER_Ins(this.inputModel).pipe(finalize(() => { this.saving = false; }))
                    .subscribe((response) => {
                        if (response['Result'] != '0') {
                            this.showErrorMessage(response['ErrorDesc']);
                        }
                        else {
                            this.showSuccessMessage(this.l('InsertSuccessful'));
                            if (!this.isApproveFunct) {
                                this.carRegisterService.cAR_REGISTER_Appr(response.id, this.appSession.user.userName)
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
                this.carRegisterService.cAR_REGISTER_Upd(this.inputModel).pipe(finalize(() => { this.saving = false; }))
                    .subscribe((response) => {
                        if (response['Result'] != '0') {
                            this.showErrorMessage(response['ErrorDesc']);
                        }
                        else {
                            this.showSuccessMessage(this.l('UpdateSuccessful'));
                            if (!this.isApproveFunct) {
                                this.carRegisterService.cAR_REGISTER_Appr(this.inputModel.caR_REG_ID, this.appSession.user.userName)
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
        this.navigatePassParam('/app/admin/car-register', null, { filterInput: JSON.stringify(this.filterInput) });
    }

    onAdd(): void {
    }

    onUpdate(item: CAR_REGISTER_ENTITY): void {
    }

    onDelete(item: CAR_REGISTER_ENTITY): void {
    }

    onApprove(item: CAR_REGISTER_ENTITY): void {
        var currentUserName = this.appSession.user.userName;
        if (currentUserName == this.inputModel.makeR_ID) {
            this.showErrorMessage(this.l('ApproveFailed'));
            return;
        }
        this.message.confirm(
            this.l('ApproveWarningMessage','').replace(new RegExp('"','g'), '') + this.appr + this.inputModel.n_PLATE,
            this.l('AreYouSure'),
            (isConfirmed) => {
                if (isConfirmed) {
                    this.saving = true;
                    this.carRegisterService.cAR_REGISTER_Appr(this.inputModel.caR_REG_ID, currentUserName)
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

    onViewDetail(item: CAR_REGISTER_ENTITY): void {
    }

    onSelectedChanged(event: any): void {
    }

    onSave(): void {
        this.saveInput();
    }

    onSearch(): void {
    }

    onResetSearch(): void {
    }
    onSelectCar(car: CAR_MASTER_ENTITY) {
        this.inputModel.caR_ID = car.caR_ID;
        this.inputModel.n_PLATE = car.n_PLATE;
        this.inputModel.model = car.model;
        this.inputModel.caR_TYPE_NAME = car.caR_TYPE_NAME;
        this.inputModel.procountry = car.procountry;
        this.inputModel.fuelS_TYPE = car.fuelS_TYPE;
        this.inputModel.brancH_NAME = car.brancH_NAME;
        
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
 
}
