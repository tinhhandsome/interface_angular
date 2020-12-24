import { Component, Injector, ViewChild, OnInit, ViewEncapsulation, ElementRef, AfterViewInit } from '@angular/core';
import { appModuleAnimation } from '@shared/animations/routerTransition';
import * as _ from 'lodash';
import { UltilityServiceProxy, CAR_MASTER_ENTITY, CAR_MAINTAIN_ENTITY, CarMaintainServiceProxy, CarMasterServiceProxy, CarDriveServiceProxy, CAR_DRIVE_ENTITY } from '@shared/service-proxies/service-proxies';
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
    templateUrl: './car-maintain-edit.component.html',
    encapsulation: ViewEncapsulation.None,
    animations: [appModuleAnimation()]
})
export class CarMaintainEditComponent extends DefaultComponentBase implements OnInit, IUiAction<CAR_MAINTAIN_ENTITY>, AfterViewInit {
    ngAfterViewInit(): void {
        this.stopAutoUpdateView();
    }
    constructor(
        injector: Injector,
        private ultilityService: UltilityServiceProxy,
        private carMaintainService: CarMaintainServiceProxy,
        private carMasterService: CarMasterServiceProxy,
        private carDriveService: CarDriveServiceProxy,
    ) {
        super(injector);
        this.editPageState = this.getRouteData('editPageState');
        this.inputModel.caR_MAIN_ID = this.getRouteParam('maintId');

        this.initFilter();
        this.initIsApproveFunct();
    }

    @ViewChild('carMasterModal') carMasterModal: CarMasterModalComponent;

    @ViewChild('editForm') editForm: ElementRef;

    EditPageState = EditPageState;
    AllCodes = AllCodes;
    editPageState: EditPageState;

    filterInput: CAR_MAINTAIN_ENTITY;
    inputModel: CAR_MAINTAIN_ENTITY = new CAR_MAINTAIN_ENTITY();
    appr = "Thông tin bảo dưỡng xe của ";

    isApproveFunct: boolean;

    get disableInput(): boolean {
        return (this.editPageState == EditPageState.viewDetail || this.inputModel.autH_STATUS == AuthStatusConsts.Approve);
    }

    isShowError = false;
    carMaintainEntity: CAR_MAINTAIN_ENTITY;

    ngOnInit(): void {
        this.inputModel.indeX_NUMBER = 0;
        this.inputModel.mainT_AMT = 0;
        this.inputModel.mainT_DT = moment();
        this.inputModel.mainT_PROVIDER = 'SCB';

        switch (this.editPageState) {
            case EditPageState.add:
                this.inputModel.recorD_STATUS = RecordStatusConsts.Active;
                this.appToolbar.setRole('CarMaintain', false, false, true, false, false, false, false, false);
                this.appToolbar.setEnableForEditPage();
                break;
            case EditPageState.edit:

                this.appToolbar.setRole('CarMaintain', false, false, true, false, false, false, false, false);
                this.appToolbar.setEnableForEditPage();
                this.getCarMaintain();
                break;
            case EditPageState.viewDetail:
                this.appToolbar.setRole('CarMaintain', false, false, false, false, false, false, true, false);
                this.appToolbar.setEnableForViewDetailPage();
                this.getCarMaintain();
                break;
        }
        this.appToolbar.setUiAction(this);

    }

    initIsApproveFunct() {
        this.ultilityService.isApproveFunct(this.getCurrentFunctionId()).subscribe(isApproveFunct => {
            this.isApproveFunct = isApproveFunct;
            this.updateView();
        })
    }

    getCarMaintain() {
        this.carMaintainService.cAR_MAINTAIN_ById(this.inputModel.caR_MAIN_ID).subscribe(response => {
            this.inputModel = response;
            if (this.inputModel.autH_STATUS == AuthStatusConsts.Approve) {
                this.appToolbar.setButtonApproveEnable(false);
                this.appToolbar.setButtonSaveEnable(false);
            }
            this.updateView();
        });
    }

    getCarMaster(): void {
        this.carMasterService.cAR_MASTER_ById(this.inputModel.n_PLATE, this.appSession.user.subbrId).subscribe(res => {
            if (!res.caR_ID) {
                this.resetCarInput();
                this.updateView();
                return;
            }

            this.onSelectCar(res);
            this.getCarDrive();
            this.updateView();
        });
    }

    resetCarInput(): void {
        this.inputModel.caR_TYPE_NAME = this.inputModel.model = this.inputModel.procountry = this.inputModel.fuelS_TYPE = this.inputModel.owner = '';
        this.inputModel.indeX_NUMBER = 0;
    }

    getCarDrive(): void {
        var temp: CAR_DRIVE_ENTITY = new CAR_DRIVE_ENTITY();
        temp.n_PLATE = this.inputModel.n_PLATE;
        temp.brancH_ID = this.appSession.user.subbrId;
        temp.searcH_TYPE = 'N';
        temp.top = 200;
        this.carDriveService.cAR_DRIVE_Search(temp).subscribe(res => {
            this.inputModel.indeX_NUMBER = res.items[0].indeX_NUMBER;
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
        if (!this.inputModel.caR_ID) {
            this.showErrorMessage(this.l('InvalidPlate'));
            this.updateView();
            return;
        }

        if (this.editPageState != EditPageState.viewDetail) {
            this.saving = true;
            this.inputModel.makeR_ID = this.appSession.user.userName;

            if (!this.inputModel.caR_MAIN_ID) {

                this.carMaintainService.cAR_MAINTAIN_Ins(this.inputModel).pipe(finalize(() => { this.saving = false; }))
                    .subscribe((response) => {
                        if (response['Result'] != '0') {
                            this.showErrorMessage(response['ErrorDesc']);
                        }
                        else {
                            this.addNewSuccess();
                            if (!this.isApproveFunct) {
                                this.carMaintainService.cAR_MAINTAIN_App(response['ID'], this.appSession.user.userName)
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
                this.carMaintainService.cAR_MAINTAIN_Upd(this.inputModel).pipe(finalize(() => { this.saving = false; }))
                    .subscribe((response) => {
                        if (response['Result'] != '0') {
                            this.showErrorMessage(response['ErrorDesc']);
                        }
                        else {
                            this.updateSuccess();
                            if (!this.isApproveFunct) {
                                this.carMaintainService.cAR_MAINTAIN_App(this.inputModel.caR_MAIN_ID, this.appSession.user.userName)
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
        this.navigatePassParam('/app/admin/carmaintain', null, { filterInput: JSON.stringify(this.filterInput) });
    }

    onAdd(): void {
    }

    onUpdate(item: CAR_MAINTAIN_ENTITY): void {
    }

    onDelete(item: CAR_MAINTAIN_ENTITY): void {
    }

    onApprove(item: CAR_MAINTAIN_ENTITY): void {
        var currentUserName = this.appSession.user.userName;
        if (currentUserName == this.inputModel.makeR_ID) {
            this.showErrorMessage(this.l('ApproveFailed'));
            this.updateView();
            return;
        }
        this.message.confirm(
            this.l('ApproveWarningMessage', '').replace(new RegExp('"', 'g'), '') + this.appr + this.inputModel.n_PLATE,
            this.l('AreYouSure'),
            (isConfirmed) => {
                if (isConfirmed) {
                    this.saving = true;
                    this.carMaintainService.cAR_MAINTAIN_App(this.inputModel.caR_MAIN_ID, currentUserName)
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

    onViewDetail(item: CAR_MAINTAIN_ENTITY): void {
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
        this.inputModel.owner = car.owner;
    }
}
