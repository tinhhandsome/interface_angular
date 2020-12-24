import { Component, Injector, ViewChild, OnInit, ViewEncapsulation, ElementRef, AfterViewInit } from '@angular/core';
import { appModuleAnimation } from '@shared/animations/routerTransition';
import * as _ from 'lodash';
import { ASS_UPDATE_ENTITY, AssUpdateServiceProxy, UltilityServiceProxy, ASS_MASTER_ENTITY, AssMasterServiceProxy, ASS_STATUS_ENTITY, AssStatusServiceProxy, ReportInfo, LASTEST_ASSET_INFO } from '@shared/service-proxies/service-proxies';
import { EditPageState } from '@app/ultilities/enum/edit-page-state';
import { AllCodes } from '@app/ultilities/enum/all-codes';
import { finalize } from 'rxjs/operators';
import { DefaultComponentBase } from '@app/ultilities/default-component-base';
import { AuthStatusConsts } from '@app/admin/core/ultils/consts/AuthStatusConsts';
import { RecordStatusConsts } from '@app/admin/core/ultils/consts/RecordStatusConsts';
import { IUiActionRejectExt } from '@app/ultilities/ui-action-re';
import { ToolbarRejectExtComponent } from '@app/admin/core/controls/toolbar-reject-ext/toolbar-reject-ext.component';
import { RejectModalComponent } from '@app/admin/core/controls/reject-modals/reject-modal.component';
import { AssetModalComponent } from '@app/admin/core/controls/asset-modal/asset-modal.component';
import * as moment from 'moment'
import { ReportTypeConsts } from '@app/admin/core/ultils/consts/ReportTypeConsts';
import { PreviewTemplateService } from '@app/admin/common/preview-template/preview-template.service';
import { ReportTemplateModalComponent } from '@app/admin/core/controls/report-template-modal/report-template-modal.component';
import { AccentsCharService } from '@app/admin/core/ultils/accents-char.service';
@Component({
    templateUrl: './ass-update-edit.component.html',
    encapsulation: ViewEncapsulation.None,
    animations: [appModuleAnimation()]
})
export class AssUpdateEditComponent extends DefaultComponentBase implements OnInit, AfterViewInit, IUiActionRejectExt<ASS_UPDATE_ENTITY> {


    constructor(
        injector: Injector,
        private ultilityService: UltilityServiceProxy,
        private assUpdateService: AssUpdateServiceProxy,
        private assMasterService: AssMasterServiceProxy,
        private assStatusService: AssStatusServiceProxy,
        private previewTemplateService: PreviewTemplateService,
        private accentsCharService: AccentsCharService
    ) {
        super(injector);
        this.editPageState = this.getRouteData('editPageState');
        this.inputModel.updatE_ID = this.getRouteParam('id');
        console.log(this)
        this.initFilter();
        this.initCombobox();
        this.initIsApproveFunct();
    }

    @ViewChild('editForm') editForm: ElementRef;
    @ViewChild('rejectModal') rejectModal: RejectModalComponent;
    @ViewChild('assetModal') assetModal: AssetModalComponent;
    @ViewChild('reportTemplate') reportTemplate: ReportTemplateModalComponent;

    EditPageState = EditPageState;
    AllCodes = AllCodes;
    editPageState: EditPageState;


    _amortAmt: number = 0;
    _buyPrice: number = 0;
    _extValue: number = 0

    _disableInput = false

    assStatuses: ASS_STATUS_ENTITY[]
    assetInfo: ASS_MASTER_ENTITY = new ASS_MASTER_ENTITY()
    inputModel: ASS_UPDATE_ENTITY = new ASS_UPDATE_ENTITY();
    filterInput: ASS_UPDATE_ENTITY;
    isApproveFunct: boolean;

    get disableInput(): boolean {
        return this.editPageState == EditPageState.viewDetail || this.inputModel.u_AUTH_STATUS == AuthStatusConsts.Approve;
    }

    get isShowPrintButton(): boolean {
        return this.inputModel.autH_STATUS == AuthStatusConsts.Approve
    }

    isShowError = false;

    get apptoolbar(): ToolbarRejectExtComponent {
        return this.appToolbar as ToolbarRejectExtComponent;
    }

    ngAfterViewInit(): void {
        // COMMENT: this.stopAutoUpdateView();
        this.initAssetModal()
    }

    ngOnInit(): void {
        let { subbrId } = this.appSession.user
        switch (this.editPageState) {
            case EditPageState.add:
                this.inputModel.recorD_STATUS = RecordStatusConsts.Active;
                this.appToolbar.setRole('AssUpdate', false, false, true, false, false, false, false, false);
                this.appToolbar.setEnableForEditPage();
                this.inputModel['brancH_ID'] = subbrId;
                this.inputModel.u_AMORT_MONTH = 0
                break;
            case EditPageState.edit:
                this.inputModel['brancH_ID'] = subbrId;
                this.appToolbar.setRole('AssUpdate', false, false, true, false, false, false, false, false);
                this.appToolbar.setEnableForEditPage();
                this.getAssUpdate();
                this._disableInput = true;
                break;
            case EditPageState.viewDetail:
                this.inputModel['brancH_ID'] = subbrId;
                this.appToolbar.setRole('AssUpdate', false, false, false, false, false, false, true, false);
                this.appToolbar.setEnableForViewDetailPage();
                this.getAssUpdate();
                this._disableInput = true;
                break;
        }

        this.appToolbar.setUiAction(this);

        //set form default value 	

    }

    initIsApproveFunct() {
        this.ultilityService.isApproveFunct(this.getCurrentFunctionId()).subscribe(isApproveFunct => {
            this.isApproveFunct = isApproveFunct;
        })
    }

    initCombobox() {
        this.assStatusService.aSS_STATUS_Lst().subscribe(response => {
            this.assStatuses = response;
            this.updateView();
        });
    }

    initAssetModal() {
        this.assetModal.onGetAssGroups(null)
    }

    openAssetModal() {
        this.assetModal.filterInput.brancH_ID = this.appSession.user.subbrId
        this.assetModal.filterInput.brancH_CODE = this.appSession.user.branchCode
        this.assetModal.filterInput.brancH_NAME = this.appSession.user.branchName
        this.assetModal.filterInput.level = 'ALL'
        this.assetModal.filterInput.top = 1000
        this.assetModal.show()
    }


    onMoneyChanged() {
        let { exT_VALUE, u_BUY_PRICE, u_AMORT_AMT } = this.inputModel
        if (this.isNull(exT_VALUE) || isNaN(exT_VALUE)) exT_VALUE = 0
        if (this.isNull(u_BUY_PRICE) || isNaN(u_BUY_PRICE)) u_BUY_PRICE = 0
        if (this.isNull(u_AMORT_AMT) || isNaN(u_AMORT_AMT)) u_AMORT_AMT = 0

        if (this.isNull(this._extValue) || isNaN(this._extValue)) this._extValue = 0

        let extChanged = 0
        extChanged = this._extValue - exT_VALUE
        if (this.isNull(extChanged) || isNaN(extChanged)) extChanged = 0

        this._buyPrice = u_BUY_PRICE + extChanged
        this._amortAmt = u_AMORT_AMT + extChanged

        this._buyPrice = this._buyPrice > 0 ? this._buyPrice : 0
        this._amortAmt = this._amortAmt > 0 ? this._amortAmt : 0

        this.updateView()
    }

    onSelectAsset(item: ASS_MASTER_ENTITY) {
        this.assetInfo = item
        this.inputModel.asseT_ID = item.asseT_ID
        this.inputModel.grouP_ID = item.grouP_ID
        this.inputModel.exT_VALUE = 0
        this.inputModel.u_BUY_PRICE = item.buY_PRICE
        this.inputModel.u_AMORT_AMT = item.amorT_AMT
        this.inputModel.u_AMORT_MONTH = item.amorT_MONTH
        this.inputModel.u_ASSET_NAME = item.asseT_NAME
        this.inputModel.u_ASSET_DESC = item.asseT_DESC
        this.inputModel.u_CREATE_DT = moment()
        this.setChangedAmount(item.buY_PRICE, item.amorT_AMT, this.inputModel.exT_VALUE)

        this.inputModel.asseT_CODE = item.asseT_CODE
        this.inputModel.asS_STATUS = item.asS_STATUS
        this.inputModel.asS_STATUS_NAME = item.asS_STATUS_NAME

        this.getLastestAssetInfo()

        if (this.editPageState == EditPageState.add) {
            this.inputModel.u_ASS_STATUS = item.asS_STATUS
        }
        this.updateView()
    }
    onSelectStatus(item: ASS_STATUS_ENTITY) {

    }

    printCoreNoteInvoice() {
        if (!this.inputModel.updatE_ID) {
            this.showErrorMessage(this.l('CannotExport'));
            return;
        }

        let reportInfo = new ReportInfo()
        reportInfo.typeExport = ReportTypeConsts.Word;

        let curDate = moment()
        let { userName, name, taxNo } = this.appSession.user
        let { brancH_NAME, brancH_TYPE, taX_NO } = this.appSession.user.branch

        let parameters = [this.GetParamNameAndValue('REF_ID', this.inputModel.updatE_ID)];
        //let parameters = [this.GetParamNameAndValue('REF_ID','SMA000000000006')];
        let values = this.GetParamsFromFilter({
            branchName: this.accentsCharService.removeDiacritics(brancH_NAME),
            branchType: this.accentsCharService.removeDiacritics(brancH_TYPE),
            userName: this.accentsCharService.removeDiacritics(userName),
            userFullName: this.accentsCharService.removeDiacritics(name),
            branchTaxNo: this.accentsCharService.removeDiacritics(taxNo),
            day: curDate.format('D'),
            month: curDate.format('M'),
            year: curDate.format('Y'),
        });

        this.previewTemplateService.printReportTemplate('rpt_ASS_ENTRIES', parameters, values);

    }
    getAssUpdate() {
        this.assUpdateService.aSS_UPDATE_ById(this.inputModel.updatE_ID).subscribe(response => {
            this.inputModel = response;
            this.getLastestAssetInfo()
            let { asseT_ID, buY_PRICE, amorT_AMT, exT_VALUE } = this.inputModel

            this.setChangedAmount(buY_PRICE, amorT_AMT, exT_VALUE)
            //get assetInfo
            if (this.isNull(this.assetInfo))
                this.assetInfo = new ASS_MASTER_ENTITY()
            else {
                this.assMasterService.aSS_MASTER_ById(asseT_ID).subscribe(res => {
                    this.assetInfo = res
                    this.updateView()
                })
            }

            if (this.editPageState == EditPageState.viewDetail) {
                this.apptoolbar.setEnableForViewDetailPage();
            }
            if (this.inputModel.u_AUTH_STATUS == AuthStatusConsts.Approve) {
                this.appToolbar.setButtonApproveEnable(false);
                this.appToolbar.setButtonUpdateEnable(false);
                this.updateView()
            }

            if (this.inputModel.updatE_ID) {
                // CM_ATTACH_FILE
                this.getFile(this.inputModel.updatE_ID, this.inputModel);
            }

            let { subbrId } = this.appSession.user
            this.inputModel['brancH_ID'] = subbrId;
            this.updateView();
        });
    }

    getLastestAssetInfo() {
        if (this.inputModel.asseT_ID) {
            let filterObj: LASTEST_ASSET_INFO = new LASTEST_ASSET_INFO()
            filterObj.asseT_ID = this.inputModel.asseT_ID
            this.assUpdateService.lASTEST_ASSET_INFO_ById(filterObj).subscribe(res => {
                this.inputModel.nql = res.nql
                this.inputModel.l_NQL = res.nql
                this.updateView()
            })
        }
    }

    saveInput() {
        this.setRealInputToSave()

        if (this.isApproveFunct == undefined) {
            this.showErrorMessage(this.l('PageLoadUndone'));
            return;
        }

        if ((this.editForm as any).form.invalid) {
            this.isShowError = true;
            this.showErrorMessage(this.l('FormInvalid'));
            this.updateView();
            return;
        }

        let assUpdateEntity = this.getSavedEntity()


        if (this.editPageState != EditPageState.viewDetail) {
            this.saving = true;
            assUpdateEntity.makeR_ID = this.appSession.user.userName;

            if (!assUpdateEntity.updatE_ID) {

                this.assUpdateService.aSS_UPDATE_Ins(assUpdateEntity).pipe(finalize(() => { this.saving = false; }))
                    .subscribe((response) => {
                        if (response["Result"] != '0') {
                            this.showErrorMessage(response["ErrorDesc"]);
                            this.updateView();
                        }
                        else {
                            //CM_ATTACH_FILE
                            this.addFile(assUpdateEntity, 'ASS_UPDATE', undefined, response['ID']);
                            this.showSuccessMessage(this.l('InsertSuccessful'));
                            if (!this.isApproveFunct) {
                                this.assUpdateService.aSS_UPDATE_App(response.id, this.appSession.user.userName)
                                    .pipe(finalize(() => { this.saving = false; }))
                                    .subscribe((response) => {
                                        if (response["Result"] != '0') {
                                            this.showErrorMessage(response["ErrorDesc"]);
                                        }
                                        this.updateView();
                                    });
                            }
                            this.updateView();
                        }
                    });
            }
            else {
                if (this.appSession.user.subbrId != assUpdateEntity.brancH_ID && assUpdateEntity.autH_STATUS == AuthStatusConsts.Reject) {
                    this.showErrorMessage(this.l('UpdateFailed'));
                    this.updateView();
                    return;
                }
                this.assUpdateService.aSS_UPDATE_Upd(assUpdateEntity).pipe(finalize(() => { this.saving = false; }))
                    .subscribe((response) => {
                        if (response["Result"] != '0') {
                            this.showErrorMessage(response["ErrorDesc"]);
                            this.updateView();
                        }
                        else {
                            //CM_ATTACH_FILE
                            this.updateFile(assUpdateEntity, 'ASS_UPDATE', undefined, response['ID']);
                            this.showSuccessMessage(this.l('UpdateSuccessful'));
                            if (!this.isApproveFunct) {
                                this.assUpdateService.aSS_UPDATE_App(assUpdateEntity.updatE_ID, this.appSession.user.userName)
                                    .pipe(finalize(() => { this.saving = false; }))
                                    .subscribe((response) => {
                                        if (response["Result"] != '0') {
                                            this.showErrorMessage(response["ErrorDesc"]);
                                        }
                                        else {
                                            this.inputModel.u_AUTH_STATUS = AuthStatusConsts.Approve;
                                        }
                                        this.updateView();
                                    });
                            }
                            else {
                                this.inputModel.u_AUTH_STATUS = AuthStatusConsts.NotApprove;
                            }
                            this.updateView();
                        }
                    });
            }
        }
    }

    goBack() {
        this.navigatePassParam('/app/admin/ass-update', null, { filterInput: JSON.stringify(this.filterInput) });
    }

    onAdd(): void {
    }

    onUpdate(item: ASS_UPDATE_ENTITY): void {
    }

    onDelete(item: ASS_UPDATE_ENTITY): void {
    }

    onApprove(item: ASS_UPDATE_ENTITY): void {
        if (this.isNull(this.inputModel.updatE_ID)) return


        let currentUserName = this.appSession.user.userName;
        if (currentUserName == this.inputModel.u_MAKER_ID || this.inputModel.u_AUTH_STATUS == AuthStatusConsts.Reject) {
            this.showErrorMessage(this.l('ApproveFailed'));
            return;
        }

        this.message.confirm(
            this.l('ApproveWarningMessage', this.l(this.inputModel.updatE_ID)),
            this.l('AreYouSure'),
            (isConfirmed) => {
                if (isConfirmed) {
                    this.saving = true;
                    this.assUpdateService.aSS_UPDATE_App(this.inputModel.updatE_ID, currentUserName)
                        .pipe(finalize(() => { this.saving = false; }))
                        .subscribe((response) => {
                            if (response["Result"] != '0') {
                                this.showErrorMessage(response['ErrorDesc']);
                                this.updateView();
                            }
                            else {
                                this.showSuccessMessage(this.l('SuccessfullyApprove'));
                                this.inputModel.u_AUTH_STATUS = AuthStatusConsts.Approve;
                                this.appToolbar.setButtonApproveEnable(false);
                                this.appToolbar.setButtonUpdateEnable(false);
                                this.updateView()
                            }
                        });
                }
            }
        );
    }
    onViewDetail(item: ASS_UPDATE_ENTITY): void {
    }

    onSave(): void {
        this.saveInput();
    }

    onSearch(): void {
    }

    onResetSearch(): void {
    }

    onReject(item: ASS_UPDATE_ENTITY): void {
        this.rejectModal.show();
    }

    onReturn(notes: string) {
    }

    private setChangedAmount(buyPrice: number, amortAmt: number, extValue: number) {
        this._buyPrice = this.isNull(buyPrice) ? 0 : buyPrice
        this._amortAmt = this.isNull(amortAmt) ? 0 : amortAmt
        this._extValue = this.isNull(extValue) ? 0 : extValue
    }

    private setRealInputToSave() {
        this.inputModel.buY_PRICE = this._buyPrice
        this.inputModel.amorT_AMT = this._amortAmt
        this.inputModel.exT_VALUE = this._extValue

        this.inputModel.amorT_MONTH = this.inputModel.u_AMORT_MONTH
        this.inputModel.asseT_SERIAL_NO = this.inputModel.u_ASSET_SERIAL_NO
        this.inputModel.asseT_NAME = this.inputModel.u_ASSET_NAME
        this.inputModel.asseT_DESC = this.inputModel.u_ASSET_DESC
        this.inputModel.notes = this.inputModel.u_NOTES

    }

    private getSavedEntity() {
        let assUpdateEntity = this.inputModel;
        assUpdateEntity.asS_STATUS = this.inputModel.u_ASS_STATUS
        assUpdateEntity.autH_STATUS = this.inputModel.u_AUTH_STATUS
        //  assUpdateEntity.creatE_DT = this.inputModel.u_CREATE_DT
        assUpdateEntity.creatE_DT = moment()
        assUpdateEntity.makeR_ID = this.inputModel.u_MAKER_ID
        assUpdateEntity.approvE_DT = this.inputModel.u_APPROVE_DT
        assUpdateEntity.checkeR_ID = this.inputModel.u_CHECKER_ID
        return assUpdateEntity
    }

}

