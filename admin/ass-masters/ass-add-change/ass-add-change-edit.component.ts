import { Component, Injector, ViewChild, Output, EventEmitter, OnInit, ViewEncapsulation, ElementRef, AfterViewInit } from '@angular/core';
import { appModuleAnimation } from '@shared/animations/routerTransition';
import * as _ from 'lodash';
import { AssAddNewServiceProxy, ASS_ADDNEW_ENTITY, UltilityServiceProxy, ASS_MASTER_ENTITY, TR_PO_MASTER_ENTITY, ASS_GROUP_ENTITY, ASS_TYPE_ENTITY, AssGroupServiceProxy, AssTypeServiceProxy, CM_DIVISION_ENTITY, TradePoMasterServiceProxy } from '@shared/service-proxies/service-proxies';
import { EditPageState } from '@app/ultilities/enum/edit-page-state';
import { finalize } from 'rxjs/operators';
import { DefaultComponentBase } from '@app/ultilities/default-component-base';
import { IUiAction } from '@app/ultilities/ui-action';
import { AuthStatusConsts } from '@app/admin/core/ultils/consts/AuthStatusConsts';
import { RecordStatusConsts } from '@app/admin/core/ultils/consts/RecordStatusConsts';
import { AssetModalComponent } from '@app/admin/core/controls/asset-modal/asset-modal.component';
import * as moment from 'moment';
import { TradePoMasterModalComponent } from '@app/admin/core/controls/trade-po-master-modal/trade-po-master-modal.component';
import { AssWarantyComponent } from '../common/ass-waranty/ass-waranty.component';
import { AssAddChangeExportUseComponent } from './ass-add-change-export-use.component';
import { NgForm } from '@angular/forms';
@Component({
    templateUrl: './ass-add-change-edit.component.html',
    encapsulation: ViewEncapsulation.None,
    animations: [appModuleAnimation()]
})

export class AssAddChangeEditComponent extends DefaultComponentBase implements OnInit, IUiAction<ASS_ADDNEW_ENTITY>, AfterViewInit {
    constructor(
        injector: Injector,
        private ultilityService: UltilityServiceProxy,
        private assAddNewService: AssAddNewServiceProxy,
        private assTypeService: AssTypeServiceProxy,
        private assGroupService: AssGroupServiceProxy,
        private poMasterService: TradePoMasterServiceProxy
    ) {
        super(injector);
        this.editPageState = this.getRouteData('editPageState');
        this.inputModel.addneW_ID = this.getRouteParam('id');
        this.initIsApproveFunct();
        // COMMENT: this.stopAutoUpdateView();
        // console.log(this)
    }

    @ViewChild('editForm') editForm: NgForm;
    @ViewChild('assetModal') assetModal: AssetModalComponent;
    @ViewChild('poModal') poModal: TradePoMasterModalComponent;
    @ViewChild('assAddChangeExportUse') assAddChangeExportUse: AssAddChangeExportUseComponent;
    @ViewChild('assWarEditTable') assWarEditTable: AssWarantyComponent;
    EditPageState = EditPageState;
    editPageState: EditPageState;


    inputModel: ASS_ADDNEW_ENTITY = new ASS_ADDNEW_ENTITY();
    poModel: TR_PO_MASTER_ENTITY = new TR_PO_MASTER_ENTITY();
    assGroups: ASS_GROUP_ENTITY[];
    assTypes: ASS_TYPE_ENTITY[];
    temp: any = {};

    filterInput: ASS_ADDNEW_ENTITY;
    isApproveFunct: boolean;

    get disableInput(): boolean {
        return (this.editPageState == EditPageState.viewDetail);
    }

    isShowError = false;
    ngAfterViewInit() {
        this.setupValidationMessage()
        this.updateView();
    }
    ngOnInit(): void {
        switch (this.editPageState) {
            case EditPageState.add:
                this.inputModel.recorD_STATUS = RecordStatusConsts.Active;
                this.appToolbar.setRole('AssAddChange', false, false, true, false, false, false, false, false);
                this.appToolbar.setEnableForEditPage();
                break;
            case EditPageState.edit:
                this.appToolbar.setRole('AssAddChange', false, false, true, false, false, false, false, false);
                this.appToolbar.setEnableForEditPage();
                this.getAssAddChange();
                break;
            case EditPageState.viewDetail:
                this.appToolbar.setRole('AssAddChange', false, false, false, false, false, false, true, false);
                this.appToolbar.setEnableForViewDetailPage();
                this.getAssAddChange();
                break;
        }
        this.appToolbar.setUiAction(this);
        this.initFilter();
        this.initInput();
        this.initModalInput();
        this.initCombobox();
    }
    initInput() {
        // this.inputModel.requesT_DT = moment();
        this.inputModel.buY_DATE = moment();
        this.inputModel.amorT_START_DATE = moment();
        this.inputModel.brancH_CREATE = this.appSession.user.subbrId;
        this.inputModel.posteD_STATUS = 'Y';
        this.inputModel.warrantY_MONTHS = 0;
        this.inputModel.amorT_MONTH = 0;
        this.inputModel.amorT_RATE = 0;
        this.inputModel.buY_PRICE = 0;
        this.inputModel.amorT_AMT = 0;
        this.inputModel.entrY_BOOKED = 'Y';
        this.inputModel.iS_MULTIPLE = '0';
        this.inputModel.qty = 1;
        this.inputModel.asS_ADDNEW_GOODSs = [];
        this.inputModel.asS_ADDNEW_POs = [];
        this.inputModel.asS_ADDNEW_WARs = [];
        this.inputModel.division = new CM_DIVISION_ENTITY();
    }
    initIsApproveFunct() {
        this.ultilityService.isApproveFunct(this.getCurrentFunctionId()).subscribe(isApproveFunct => {
            this.isApproveFunct = isApproveFunct;
        })
    }

    initCombobox() {
        this.assTypeService.aSS_TYPE_Lis().subscribe(response => {
            this.assTypes = response;
            this.updateView();
        });
    }
    onTypeSelectChange(type: ASS_TYPE_ENTITY) {
        this.getAssGroupOnType(type.typE_ID);
    }
    getAssGroupOnType(type: string) {
        this.assGroupService.aSS_GROUP_GetLeaf(type).subscribe(response => {
            this.assGroups = response;
            this.updateView();
            if (this.temp.grouP_ID) {
                this.inputModel.grouP_ID = this.temp.grouP_ID;
                this.temp.grouP_ID = null;
            }
            this.updateView();
        });
    }
    onGroupSelectChange(assGroup: ASS_GROUP_ENTITY) {
        if (!assGroup) return;
        this.inputModel.amorT_MONTH = assGroup.amorT_MONTH;
        this.inputModel.amorT_RATE = assGroup.amorT_RATE;
        this.updateView();
    }
    initModalInput() {
        this.initAssetModal();
        this.initPoModal();
    }
    initAssetModal() {
        this.assetModal.filterInput.brancH_ID = this.appSession.user.subbrId;
        this.assetModal.filterInput.brancH_LOGIN = this.appSession.user.subbrId;
        this.assetModal.filterInput.level = 'UNIT';
        this.assetModal.filterInput.amorT_STATUS = 'DTL';
    }
    initPoModal() {
        this.poModal.filterInput.pO_TYPE = -1;
        this.poModal.filterInput.level = 'ALL';
        this.poModal.filterInput.brancH_LOGIN = this.appSession.user.subbrId;
    }
    onBuyPriceFocusOut() {
        this.inputModel.amorT_AMT = this.inputModel.buY_PRICE;
        this.updateView();
    }
    getSingleAsset(asset: ASS_MASTER_ENTITY) {
        if (!asset) return;
        this.inputModel.buY_DATE = asset.buY_DATE;
        this.inputModel.typE_ID = asset.typE_ID;
        this.temp.grouP_ID = asset.grouP_ID;
        this.inputModel.asseT_NAME = asset.asseT_NAME;
        this.inputModel.asseT_SERIAL_NO = asset.asseT_SERIAL_NO;
        this.inputModel.asseT_DESC = asset.asseT_DESC;
        this.inputModel.brancH_ID = asset.brancH_ID;
        this.inputModel.depT_ID = asset.depT_ID;
        this.inputModel.emP_ID = asset.emP_ID;
        this.inputModel.divisioN_ID = asset.divisioN_ID;
        this.inputModel.buY_PRICE = asset.buY_PRICE;
        this.inputModel.amorT_AMT = asset.amorT_AMT;
        this.inputModel.amorT_MONTH = asset.amorT_MONTH;
        this.inputModel.amorT_RATE = asset.amorT_RATE;
        this.inputModel.pO_ID = asset.pO_ID;
        this.getPoById(asset.pO_ID);
        this.inputModel.reF_ASSET_ID = asset.asseT_ID;
        this.inputModel.reF_ASS_CODE = asset.asseT_CODE;
        this.inputModel.reF_AMORTIZED_AMT = asset.amortizeD_AMT
        this.inputModel.warrantY_MONTHS = asset.warrantY_MONTHS;
        this.inputModel.notes = asset.notes;
        this.updateView();
    }
    getPoById(id: string) {
        var poInput = new TR_PO_MASTER_ENTITY();
        poInput.pO_ID = id;
        poInput.level = 'ALL';
        poInput.brancH_LOGIN = this.appSession.user.subbrId;
        this.poMasterService.tR_PO_MASTER_Search(poInput).subscribe(response => {
            this.getSinglePo(response.items[0]);
        });
    }
    getSinglePo(po: TR_PO_MASTER_ENTITY) {
        if (!po) return;
        this.poModel = po;
        this.inputModel.pO_ID = po.pO_ID;
        this.updateView();
    }
    getAssAddChange() {
        this.assAddNewService.aSS_ADDNEW_ById(this.inputModel.addneW_ID, this.appSession.user.subbrId).subscribe(response => {
            this.inputModel = response;
            this.inputModel.reF_ASS_CODE = this.getRouteParam('refAssCode');
            this.assWarEditTable.assWars = this.inputModel.asS_ADDNEW_WARs;
            this.assWarEditTable.warrantyMonths = this.inputModel.warrantY_MONTHS;
            this.getPoById(response.pO_ID);
            if (this.inputModel.autH_STATUS == AuthStatusConsts.Approve) {
                this.appToolbar.setButtonApproveEnable(false);
                this.appToolbar.setButtonSaveEnable(false);
            }
            this.assWarEditTable.updateView();
            this.updateView();
        });
    }

    checkValid() {
        if (this.assAddChangeExportUse.isExportUse) {
            if (this.isNull(this.inputModel.brancH_ID)) {
                return false;
            }
            if (this.isNull(this.inputModel.divisioN_ID)) {
                return false;
            }
        }

        return true;
    }

    addNew() {
        this.assAddNewService.aSS_ADDNEW_Ins(this.inputModel).pipe(finalize(() => { this.saving = false; }))
            .subscribe((response) => {
                if (response['Result'] != '0') {
                    this.showErrorMessage(response['ErrorDesc']);
                }
                else {
                    this.addNewSuccess();
                    if (!this.isApproveFunct) {
                        this.assAddNewService.aSS_ADDNEW_App(response['ADDNEW_ID'], this.appSession.user.userName)
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

    update() {
        this.assAddNewService.aSS_ADDNEW_Upd(this.inputModel).pipe(finalize(() => { this.saving = false; }))
            .subscribe((response) => {
                if (response['Result'] != '0') {
                    this.showErrorMessage(response['ErrorDesc']);
                }
                else {
                    this.updateSuccess();
                    if (!this.isApproveFunct) {
                        this.assAddNewService.aSS_ADDNEW_App(this.inputModel.addneW_ID, this.appSession.user.userName)
                            .pipe(finalize(() => { this.saving = false; }))
                            .subscribe((response) => {
                                if (response['Result'] != '0') {
                                    this.showErrorMessage(response['ErrorDesc']);
                                }
                                else {
                                    this.inputModel.autH_STATUS = AuthStatusConsts.Approve;
                                    this.updateView();
                                }
                            });
                    }
                    else {
                        this.inputModel.autH_STATUS = AuthStatusConsts.NotApprove;
                    }
                }
            });
    }
    inputIsValid(): boolean {
        if ((this.editForm as any).form.invalid || !this.checkValid()) {
            this.isShowError = true;
            this.showErrorMessage(this.l('FormInvalid'));
            this.updateView();
            return false;
        }
        if (this.assWarEditTable.assWars.length > 0) {
            var list = this.assWarEditTable.assWars.filter(x => x.waR_DT == null);
            if (list.length > 0) {
                var str = this.l('WarDTRequired') + " " + this.l('No') + ": ";
                list.forEach(x => {
                    str += ' ' + x['no'] + ",";
                });
                str = str.slice(0, str.length - 1);
                this.showErrorMessage(str);
                this.updateView();
                return false;
            }
        }
        return true;
    }
    saveInput() {
        if (this.isApproveFunct == undefined) {
            this.showErrorMessage(this.l('PageLoadUndone'));
            this.updateView();
            return;
        }

        if (!this.inputIsValid()) return;
        if (this.editPageState != EditPageState.viewDetail) {
            this.saving = true;
            this.inputModel.makeR_ID = this.appSession.user.userName;
            this.inputModel.asS_ADDNEW_WARs = this.assWarEditTable.assWars;
            this.inputModel.warrantY_MONTHS = this.assWarEditTable.warrantyMonths;
            if (!this.inputModel.addneW_ID) {
                this.addNew();
            }
            else {
                this.update();
            }
        }
    }

    goBack() {
        this.navigatePassParam('/app/admin/ass-add-change', null, { filterInput: JSON.stringify(this.filterInput) });
    }

    onAdd(): void {
    }

    onUpdate(item: ASS_ADDNEW_ENTITY): void {
    }

    onDelete(item: ASS_ADDNEW_ENTITY): void {
    }

    onApprove(item: ASS_ADDNEW_ENTITY): void {
        if (!this.inputModel.addneW_ID) {
            return;
        }
        var currentUserName = this.appSession.user.userName;
        if (currentUserName == this.inputModel.makeR_ID) {
            this.showErrorMessage(this.l('ApproveFailed'));
            return;
        }
        this.message.confirm(
            this.l('ApproveWarningMessage', this.l(this.inputModel.addneW_ID)),
            this.l('AreYouSure'),
            (isConfirmed) => {
                if (isConfirmed) {
                    this.saving = true;
                    this.assAddNewService.aSS_ADDNEW_App(this.inputModel.addneW_ID, currentUserName)
                        .pipe(finalize(() => { this.saving = false; }))
                        .subscribe((response) => {
                            if (response['Result'] != '0') {
                                this.showErrorMessage(response['ErrorDesc']);
                            }
                            else {
                                this.approveSuccess();
                            }
                        });
                }
            }
        );
    }

    onViewDetail(item: ASS_ADDNEW_ENTITY): void {
    }

    onSave(): void {
        this.saveInput();
    }

    onSearch(): void {
    }

    onResetSearch(): void {
    }
}
