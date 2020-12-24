import { Component, Injector, ViewChild, Output, EventEmitter, OnInit, ViewEncapsulation, ElementRef, AfterViewInit, AfterViewChecked } from '@angular/core';
import { appModuleAnimation } from '@shared/animations/routerTransition';
import * as _ from 'lodash';
import { CarInsureServiceProxy, CAR_INSURE_ENTITY, UltilityServiceProxy, CAR_MASTER_ENTITY, InsuCompanyServiceProxy, CM_INSU_COMPANY_ENTITY, CarMasterServiceProxy } from '@shared/service-proxies/service-proxies';
import { EditPageState } from '@app/ultilities/enum/edit-page-state';
import { AllCodes } from '@app/ultilities/enum/all-codes';
import { finalize } from 'rxjs/operators';
import { DefaultComponentBase } from '@app/ultilities/default-component-base';
import { IUiAction } from '@app/ultilities/ui-action';
import { AuthStatusConsts } from '@app/admin/core/ultils/consts/AuthStatusConsts';
import { RecordStatusConsts } from '@app/admin/core/ultils/consts/RecordStatusConsts';
import { CarMasterModalComponent } from '@app/admin/core/controls/car-modal/car-master-modal.component';
import * as moment from 'moment';
import { ToolbarRejectExtComponent } from '@app/admin/core/controls/toolbar-reject-ext/toolbar-reject-ext.component';

@Component({
    templateUrl: './car-insure-edit.component.html',
    encapsulation: ViewEncapsulation.None,
    animations: [appModuleAnimation()]
})
export class CarInsureEditComponent extends DefaultComponentBase implements OnInit, IUiAction<CAR_INSURE_ENTITY>, AfterViewInit {
    ngAfterViewInit(): void {
        this.updateView();
    }
    constructor(
        injector: Injector,
        private ultilityService: UltilityServiceProxy,
        private carInsureService: CarInsureServiceProxy,
        private carMasterService: CarMasterServiceProxy,

        private insuCompanyService: InsuCompanyServiceProxy,

    ) {
        super(injector);
        this.editPageState = this.getRouteData('editPageState');
        this.inputModel.caR_MASTER = new CAR_MASTER_ENTITY();
        this.inputModel.caR_INSU_ID = this.getRouteParam('insureId');
        this.inputModel.insU_TYPE = 'BHDS';
        this.inputModel.insU_DT = moment();
        this.inputModel.insU_MAT_DT = moment().add(1, 'M');
        this.inputModel.insU_TERMS = 1;
        this.inputModel.insU_AMT = 0;

        this.initFilter();
        this.initIsApproveFunct();
        // COMMENT: this.stopAutoUpdateView();
    }


    @ViewChild('carMasterModal') carMasterModal: CarMasterModalComponent;

    @ViewChild('editForm') editForm: ElementRef;
    insuCompanies: CM_INSU_COMPANY_ENTITY[];
    insuCompany: CM_INSU_COMPANY_ENTITY = new CM_INSU_COMPANY_ENTITY();
    EditPageState = EditPageState;
    AllCodes = AllCodes;
    editPageState: EditPageState;

    filterInput: CAR_INSURE_ENTITY = new CAR_INSURE_ENTITY();
    inputModel: CAR_INSURE_ENTITY = new CAR_INSURE_ENTITY();

    isApproveFunct: boolean;
    get apptoolbar(): ToolbarRejectExtComponent {
        return this.appToolbar as ToolbarRejectExtComponent;
    }

    get disableInput(): boolean {
        // return this.editPageState == EditPageState.viewDetail || (this.inputModel.autH_STATUS == 'A' && this.editPageState == EditPageState.edit);
        return this.editPageState == EditPageState.viewDetail || this.inputModel.autH_STATUS == AuthStatusConsts.Approve;
    }

    isShowError = false;

    ngOnInit(): void {
        this.insuCompanyService.cM_INSU_COMPANY_Search(this.getFillterForCombobox()).subscribe(x => {
            this.insuCompanies = x.items;
            switch (this.editPageState) {
                case EditPageState.add:
                    this.inputModel.recorD_STATUS = RecordStatusConsts.Active;
                    this.appToolbar.setRole('CarInsure', false, false, true, false, false, false, false, false);
                    this.appToolbar.setEnableForEditPage();
                    break;
                case EditPageState.edit:
                    this.appToolbar.setRole('CarInsure', false, false, true, false, false, false, false, false);
                    this.appToolbar.setEnableForEditPage();
                    this.getCarInsure();
                    break;
                case EditPageState.viewDetail:
                    this.appToolbar.setRole('CarInsure', false, false, false, false, false, false, true, false);
                    this.appToolbar.setEnableForViewDetailPage();
                    this.getCarInsure();
                    break;
            }

            this.appToolbar.setUiAction(this);
            this.updateView();

        })



    }

    initIsApproveFunct() {
        this.ultilityService.isApproveFunct(this.getCurrentFunctionId()).subscribe(isApproveFunct => {
            this.isApproveFunct = isApproveFunct;
        })
    }

    getCarInsure() {
        this.carInsureService.cAR_INSURE_ById(this.inputModel.caR_INSU_ID).subscribe(response => {
            this.inputModel = response;
            this.inputModel.caR_MASTER = new CAR_MASTER_ENTITY();
            if (this.inputModel.autH_STATUS == AuthStatusConsts.Approve) {
                this.appToolbar.setButtonApproveEnable(false);
                this.appToolbar.setButtonSaveEnable(false);
            }

            this.carMasterService.cAR_MASTER_ById(response.n_PLATE, this.appSession.user.subbrId).subscribe(x => {
                this.inputModel.caR_MASTER = x;
                this.inputModel.n_PLATE = x.n_PLATE
                this.inputModel.caR_ID = x.caR_ID
                this.updateView();

            });
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
            this.inputModel.caR_ID = this.inputModel.caR_MASTER.caR_ID;
            this.inputModel.asseT_ID = this.inputModel.caR_MASTER.asseT_ID;
            this.inputModel.asseT_NAME = this.inputModel.caR_MASTER.asseT_NAME;
            this.inputModel.insU_COMPANY_NAME = this.insuCompany.name;
            if (!this.inputModel.caR_INSU_ID) {

                this.carInsureService.cAR_INSURE_Ins(this.inputModel).pipe(finalize(() => { this.saving = false; }))
                    .subscribe((response) => {
                        if (response.result != '0') {
                            this.showErrorMessage(response.errorDesc);
                        }
                        else {
                            this.addNewSuccess();
                            if (!this.isApproveFunct) {
                                this.carInsureService.cAR_INSURE_App(response.id, this.appSession.user.userName)
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
                this.carInsureService.cAR_INSURE_Upd(this.inputModel).pipe(finalize(() => { this.saving = false; }))
                    .subscribe((response) => {
                        if (response.result != '0') {
                            this.showErrorMessage(response.errorDesc);
                        }
                        else {
                            this.updateSuccess();
                            if (!this.isApproveFunct) {
                                this.carInsureService.cAR_INSURE_App(this.inputModel.caR_INSU_ID, this.appSession.user.userName)
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
        this.navigatePassParam('/app/admin/car-insure', null, { filterInput: JSON.stringify(this.filterInput) });
    }

    onAdd(): void {
    }

    onUpdate(item: CAR_INSURE_ENTITY): void {
    }

    onDelete(item: CAR_INSURE_ENTITY): void {
    }


    messageApprove: string = this.l('CarInsure');
    onApprove(item: CAR_INSURE_ENTITY): void {
        var currentUserName = this.appSession.user.userName;
        if (currentUserName == this.inputModel.makeR_ID) {
            this.showErrorMessage(this.l('ApproveFailed'));
            return;
        }
        this.message.confirm(
            this.l('ApproveWarningMessage', '').replace(new RegExp('"', 'g'), '') + this.messageApprove.toLowerCase() + ' ' + this.l(this.inputModel.n_PLATE),
            this.l('AreYouSure'),
            (isConfirmed) => {
                if (isConfirmed) {
                    this.saving = true;
                    this.carInsureService.cAR_INSURE_App(this.inputModel.caR_INSU_ID, currentUserName)
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

    onViewDetail(item: CAR_INSURE_ENTITY): void {
    }

    onSave(): void {
        this.saveInput();
    }

    onSearch(): void {
    }

    onResetSearch(): void {
    }
    onSelectCar(car: CAR_MASTER_ENTITY) {
        this.inputModel.caR_MASTER = car;

        this.inputModel.caR_ID = car.caR_ID;
        this.inputModel.n_PLATE = car.n_PLATE;
        this.onChangeProperty('caR_ID');
        // this.getCarInsures();
        // this.updateView();
    }
    select2Change(event: CM_INSU_COMPANY_ENTITY) {
        this.insuCompany = event;
        this.updateView();
    }



    reloadDateFrom() {
        this.inputModel.insU_MAT_DT = this.inputModel.insU_DT.clone().add(this.inputModel.insU_TERMS, 'months');
        this.updateView();
    }
    reloadDateTo() {
        this.inputModel.insU_DT = this.inputModel.insU_MAT_DT.clone().subtract(this.inputModel.insU_TERMS, 'months');
        this.updateView();
    }
    findCarCode(){
        this.carMasterService.cAR_MASTER_ById(this.inputModel.n_PLATE, this.appSession.user.subbrId).subscribe(x => {
            this.inputModel.caR_MASTER = x;
            this.inputModel.n_PLATE = x.n_PLATE
            this.inputModel.caR_ID = x.caR_ID
            this.updateView();

        });
    }
}
