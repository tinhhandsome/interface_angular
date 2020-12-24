import { Component, Injector, ViewChild, OnInit, ViewEncapsulation, ElementRef, ChangeDetectionStrategy, AfterViewInit } from '@angular/core';
import { appModuleAnimation } from '@shared/animations/routerTransition';
import * as _ from 'lodash';
import { AssAddNewServiceProxy, TRADE_DETAIL_ENTITY, CM_DEPARTMENT_ENTITY, DepartmentServiceProxy, UltilityServiceProxy, ASS_ADDNEW_ENTITY, ASS_GROUP_ENTITY, AssGroupServiceProxy, CM_DIVISION_ENTITY, CM_GOODS_ENTITY, ASS_ADDNEW_GOODS_ENTITY, ReportInfo, SysParametersServiceProxy } from '@shared/service-proxies/service-proxies';
import { EditPageState } from '@app/ultilities/enum/edit-page-state';
import { AllCodes } from '@app/ultilities/enum/all-codes';
import { finalize } from 'rxjs/operators';
import { DefaultComponentBase } from '@app/ultilities/default-component-base';
import { AuthStatusConsts } from '@app/admin/core/ultils/consts/AuthStatusConsts';
import { RecordStatusConsts } from '@app/admin/core/ultils/consts/RecordStatusConsts';
import { GoodsModalComponent } from '@app/admin/core/controls/goods-modal/goods-modal.component';
import { EditableTableComponent } from '@app/admin/core/controls/editable-table/editable-table.component';
import { RejectModalComponent } from '@app/admin/core/controls/reject-modals/reject-modal.component';
import { RejectMessageComponent } from '@app/admin/core/controls/reject-messages/reject-message.component';
import { AssWarantyComponent } from '../common/ass-waranty/ass-waranty.component';
import { DisabledInputComponent } from '@app/admin/core/controls/disabledInput/disabled-input.component';
import { IUiAction } from '@app/ultilities/ui-action';
import { AssAddNewTableEditPoComponent } from './ass-add-new-table-edit-po.component';
import { AssAddNewExportUseComponent } from './ass-add-new-export-use.component';
import * as moment from 'moment';
import { PreviewTemplateService } from '@app/admin/common/preview-template/preview-template.service';
import { ReportTypeConsts } from '@app/admin/core/ultils/consts/ReportTypeConsts';
import { NgForm } from '@angular/forms';
import { AccentsCharService } from '@app/admin/core/ultils/accents-char.service';

@Component({
    templateUrl: './ass-add-new-edit.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    animations: [appModuleAnimation()]
})
export class AssAddNewEditComponent extends DefaultComponentBase implements OnInit, IUiAction<ASS_ADDNEW_ENTITY>, AfterViewInit {


    constructor(
        injector: Injector,
        private previewTemplateService: PreviewTemplateService,
        private ultilityService: UltilityServiceProxy,
        private departmentService: DepartmentServiceProxy,
        private assGroupService: AssGroupServiceProxy,
        private assAddNewService: AssAddNewServiceProxy,
        private sysParaService: SysParametersServiceProxy,
        private accentsCharService: AccentsCharService
    ) {
        super(injector);
        this.editPageState = this.getRouteData('editPageState');
        this.inputModel.addneW_ID = this.getRouteParam('id');
        this.inputModel.asS_ADDNEW_GOODSs = [];
        this.inputModel.asS_ADDNEW_POs = [];
        this.inputModel.asS_ADDNEW_WARs = [];
        this.inputModel.division = new CM_DIVISION_ENTITY();
        this.initDefaultValue();
        this.initFilter();
        this.initIsApproveFunct();
        // COMMENT: this.stopAutoUpdateView();
        // console.log(this);
    }

    @ViewChild('editForm') editForm: NgForm;
    @ViewChild('goodsModal') goodsModal: GoodsModalComponent;
    @ViewChild('editTable') editTable: EditableTableComponent<TRADE_DETAIL_ENTITY>;
    @ViewChild('rejectModal') rejectModal: RejectModalComponent;
    @ViewChild('rejectMessage') rejectMessage: RejectMessageComponent;
    @ViewChild('totalAmt') totalAmtElement: DisabledInputComponent;
    @ViewChild('assAddNewTable') assAddNewTable: AssAddNewTableEditPoComponent;
    @ViewChild('assAddNewExportUse') assAddNewExportUse: AssAddNewExportUseComponent;
    @ViewChild('assWarEditTable') assWarEditTable: AssWarantyComponent;

    EditPageState = EditPageState;
    AllCodes = AllCodes;
    editPageState: EditPageState;

    inputModel: ASS_ADDNEW_ENTITY = new ASS_ADDNEW_ENTITY();
    filterInput: TRADE_DETAIL_ENTITY;
    isApproveFunct: boolean;
    assGroups: ASS_GROUP_ENTITY[];

    valTSCD: number;

    // đơn giá trước thuế
    price: number;

    get disableInput(): boolean {
        return this.editPageState == EditPageState.viewDetail;
    }
    get isShowPrintButton(): boolean {
        return this.inputModel.autH_STATUS == AuthStatusConsts.Approve
    }

    get quanty(): number {
        if (this.inputModel.iS_MULTIPLE == '1') {
            return this.inputModel.qty;
        }
        return 1;
    }

    set quanty(val) {
        this.inputModel.qty = val;
    }

    departments: CM_DEPARTMENT_ENTITY[];

    isShowError = false;

    totalAmt: number = 0;
    processValue: number = 0;

    dataInTables: TRADE_DETAIL_ENTITY[] = [];

    ngOnInit(): void {
        switch (this.editPageState) {
            case EditPageState.add:
                this.inputModel.recorD_STATUS = RecordStatusConsts.Active;
                this.appToolbar.setRole('AssAddNew', false, false, true, false, false, false, false, false);
                this.appToolbar.setEnableForEditPage();
                break;
            case EditPageState.edit:
                this.appToolbar.setRole('AssAddNew', false, false, true, false, false, false, false, false);
                this.appToolbar.setEnableForEditPage();
                this.getAssAddNew();
                break;
            case EditPageState.viewDetail:
                this.appToolbar.setRole('AssAddNew', false, false, false, false, false, false, true, false);
                this.appToolbar.setEnableForViewDetailPage();
                this.getAssAddNew();
                break;
        }

        this.appToolbar.setUiAction(this);
        this.initCombobox();
    }

    ngAfterViewInit(): void {
        this.setupValidationMessage();
        this.updateView();
        this.assAddNewExportUse.reloadAmortEndDate();
        this.assAddNewExportUse.editForm = this.editForm;
    }

    initDefaultValue() {
        this.inputModel.iS_MULTIPLE = '0';
        this.inputModel.qty = 1;
        this.inputModel.accounT_GL = 'VND';
        this.inputModel.posteD_STATUS = 'Y';
        this.inputModel.vat = 10;
        this.inputModel.amorT_MONTH = 0;
        this.inputModel.amorT_RATE = 0;
        this.inputModel.buY_DATE = moment();
        this.inputModel.warrantY_MONTHS = 0;
        this.inputModel.amorT_START_DATE = moment();
        this.inputModel.brancH_CREATE = this.appSession.user.subbrId;
        this.inputModel.entrY_BOOKED = 'Y';
        this.reloadPriceVat();
        this.reloadAmortAMT();
        this.reloadBuyPrice();
    }

    getModelName() {
        return this.inputModel.asseT_NAME;
    }

    initIsApproveFunct() {
        this.ultilityService.isApproveFunct(this.getCurrentFunctionId()).subscribe(isApproveFunct => {
            this.isApproveFunct = isApproveFunct;
        })
    }

    initCombobox() {
        var filterCombobox = this.getFillterForCombobox();
        filterCombobox.brancH_ID = this.appSession.user.subbrId;

        this.sysParaService.sYS_PARAMETERS_ByParaKey('ASSET_VALUE').subscribe(response => {
            this.valTSCD = parseInt(response.paraValue);
        })

        this.departmentService.cM_DEPARTMENT_Search(filterCombobox).subscribe(response => {
            this.departments = response.items;
            this.updateView();
        });

        this.assGroupService.aSS_GROUP_GetLeaf('TSCD').subscribe(response => {
            this.assGroups = response;
            this.updateView();
        });
    }

    printCoreNoteInvoice() {
        if (!this.inputModel.addneW_ID) {
            this.showErrorMessage(this.l('CannotExport'));
            return;
        }

        let reportInfo = new ReportInfo();
        reportInfo.typeExport = ReportTypeConsts.Word;

        let curDate = moment()
        let { userName, name, taxNo } = this.appSession.user
        let { brancH_NAME, brancH_TYPE, taX_NO } = this.appSession.user.branch

        let parameters = [this.GetParamNameAndValue('REF_ID', this.inputModel.addneW_ID)];
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

    getAssAddNew() {

        this.assAddNewService.aSS_ADDNEW_ById(this.inputModel.addneW_ID, this.appSession.user.subbrId).subscribe(response => {
            this.inputModel = response;
            if (this.inputModel.autH_STATUS == AuthStatusConsts.Approve) {
                this.appToolbar.setButtonApproveEnable(false);
            }
            this.assWarEditTable.warrantyMonths = this.inputModel.warrantY_MONTHS;

            this.assWarEditTable.editTableWar.setList(this.inputModel.asS_ADDNEW_WARs);
            this.assAddNewTable.editTablePo.setList(this.inputModel.asS_ADDNEW_POs);
            this.assAddNewTable.editablePoGoods.setList(this.inputModel.asS_ADDNEW_GOODSs);

            if (this.inputModel.brancH_ID) {
                this.assAddNewExportUse.isExportUse = true;
            }

            if (this.inputModel.autH_STATUS == AuthStatusConsts.Approve) {
                this.appToolbar.setButtonApproveEnable(false);
                this.appToolbar.setButtonSaveEnable(false);
            }

            // CM_ATTACH_FILE
            this.getFile(this.inputModel.addneW_ID, this.inputModel);

            this.reloadPrice();

            this.updateAllView();

        });


    }

    saveInput() {
        if (this.isApproveFunct == undefined) {
            this.showErrorMessage(this.l('PageLoadUndone'));
            this.updateView();
            return;
        }


        if (!this.checkValid() || (this.editForm as any).form.invalid) {
            this.isShowError = true;
            this.showErrorMessage(this.l('FormInvalid'));
            this.updateView();
            return;
        }

        if (this.assAddNewTable.editTablePo.allData.length == 0) {
            this.showErrorMessage(this.l('PleaseSelectPo'));
            this.updateView();
            return;
        }



        if (this.editPageState != EditPageState.viewDetail) {
            this.saving = true;
            this.inputModel.makeR_ID = this.appSession.user.userName;

            this.inputModel.warrantY_MONTHS = this.assWarEditTable.warrantyMonths;
            this.inputModel.asS_ADDNEW_GOODSs = this.assAddNewTable.editablePoGoods.allData;
            this.inputModel.asS_ADDNEW_POs = this.assAddNewTable.editTablePo.allData;
            this.inputModel.asS_ADDNEW_WARs = this.assWarEditTable.assWars;

            if (!this.inputModel.addneW_ID) {
                this.addNew();
            }
            else {
                this.update();
            }
        }
    }
    checkValid() {
        let result = true;
        if (this.inputModel.accounT_GL.toUpperCase() == 'VND') {
            result = false;
        }

        if (this.assAddNewExportUse.isExportUse) {
            if (this.isNull(this.inputModel.brancH_ID)) {
                result = false;
            }
            if (this.isNull(this.inputModel.divisioN_ID)) {
                result = false;
            }
        }

        if (this.quanty * this.inputModel.buY_PRICE < this.valTSCD) {
            result = false;
        }

        if (this.inputModel.amorT_AMT < this.valTSCD) {
            result = false;
        }

        if (!this.assAddNewExportUse.checkValid()) {
            result = false;
        }
        
        return result;
    }

    private update() {
        this.assAddNewService.aSS_ADDNEW_Upd(this.inputModel).pipe(finalize(() => { this.saving = false; }))
            .subscribe((response) => {
                if (response['Result'] != '0') {
                    this.showErrorMessage(response['ErrorDesc']);
                }
                else {
                    // CM_ATTACH_FILE
                    this.updateFile(this.inputModel, 'ASS_ADDNEW', undefined, this.inputModel.addneW_ID);

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
                        this.updateView();
                    }
                }
            });
    }

    private addNew() {
        this.inputModel.typE_ID = 'TSCD';
        this.assAddNewService.aSS_ADDNEW_Ins(this.inputModel).pipe(finalize(() => { this.saving = false; }))
            .subscribe((response) => {
                if (response['Result'] != '0') {
                    this.showErrorMessage(response['ErrorDesc']);
                }
                else {
                    // CM_ATTACH_FILE
                    this.addFile(this.inputModel, 'ASS_T_ADDNEW', undefined, response['ADDNEW_ID']);
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

    goBack() {
        this.navigatePassParam('/app/admin/ass-add-new', null, { filterInput: JSON.stringify(this.filterInput) });
    }

    onAdd(): void {
    }

    onUpdate(item: ASS_ADDNEW_ENTITY): void {
    }

    onDelete(item: ASS_ADDNEW_ENTITY): void {
    }

    onReject(item: ASS_ADDNEW_ENTITY): void {
        var currentUserName = this.appSession.user.userName;
        if (currentUserName == this.inputModel.makeR_ID) {
            this.showErrorMessage(this.l('RejectFailed'));
            return;
        }
        this.rejectModal.show();
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
            this.l('ApproveWarningMessage', this.l(this.getModelName())),
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

    onSelectConMaster(conMaster) {

    }

    onAssGroupChange(assGroup: ASS_GROUP_ENTITY) {
        this.inputModel.amorT_MONTH = assGroup.amorT_MONTH;
        this.inputModel.amorT_RATE = assGroup.amorT_RATE;
        this.assAddNewExportUse.reloadAmortEndDate();
        this.updateView();
        this.assAddNewExportUse.updateView();
    }

    updateAllView() {
        this.assAddNewTable.updateView();
        this.assWarEditTable.updateView();
        this.assAddNewExportUse.updateView();
        this.updateView();
    }

    showErrorOnValidation() {
        if (this.isShowError) {
            this.updateView();
        }
    }

    onSelectGoods(goods: ASS_ADDNEW_GOODS_ENTITY) {
        if (this.editPageState == EditPageState.add) {
            this.inputModel.asseT_NAME = goods.goodS_NAME;
            this.price = goods.price;
            this.inputModel.vat = goods.vat;
            this.inputModel.pricE_VAT = this.price * this.inputModel.vat / 100;
            this.inputModel.buY_PRICE = this.price + this.inputModel.pricE_VAT;
            this.inputModel.amorT_AMT = this.inputModel.buY_PRICE;
            this.inputModel.pD_ID = goods.pD_ID;
        }
        this.updateView();
    }

    // VAT
    reloadPriceVat() {
        this.inputModel.pricE_VAT = Math.round((this.price || 0) * (this.inputModel.vat || 0) / 100);
    }

    // Giá trị khấu hao
    reloadAmortAMT() {
        this.inputModel.amorT_AMT = (this.price || 0) + (this.inputModel.pricE_VAT || 0);
    }

    // Nguyên giá tài sản cố định
    reloadBuyPrice() {
        this.inputModel.buY_PRICE = (this.price || 0) + (this.inputModel.pricE_VAT || 0);
    }

    reloadPrice() {
        this.price = (this.inputModel.buY_PRICE || 0) - (this.inputModel.pricE_VAT || 0);
    }

    onChangePrice() {
        this.reloadPriceVat();
        this.reloadAmortAMT();
        this.reloadBuyPrice();
        this.updateView();
    }

    onChangeVat() {
        this.reloadPriceVat();
        this.reloadAmortAMT();
        this.reloadBuyPrice();
        this.updateView();
    }

    onChangePriceVat() {
        this.reloadAmortAMT();
        this.reloadBuyPrice();
        this.updateView();
    }

}
