import { Component, Injector, ViewChild, Output, EventEmitter, OnInit, ViewEncapsulation, ElementRef, AfterViewInit, ChangeDetectionStrategy } from '@angular/core';
import { appModuleAnimation } from '@shared/animations/routerTransition';
import * as _ from 'lodash';
import * as moment from 'moment';
import { AssLiquidationServiceProxy, ASS_LIQUIDATION_ENTITY, UltilityServiceProxy, ASS_MASTER_ENTITY, ASS_LIQUIDATION_DT_ENTITY, ReportInfo } from '@shared/service-proxies/service-proxies';
import { EditPageState } from '@app/ultilities/enum/edit-page-state';
import { finalize } from 'rxjs/operators';
import { DefaultComponentBase } from '@app/ultilities/default-component-base';
import { IUiAction } from '@app/ultilities/ui-action';
import { AuthStatusConsts } from '@app/admin/core/ultils/consts/AuthStatusConsts';
import { RecordStatusConsts } from '@app/admin/core/ultils/consts/RecordStatusConsts';
import { AssetModalComponent } from '@app/admin/core/controls/asset-modal/asset-modal.component';
import { EditableTableComponent } from '@app/admin/core/controls/editable-table/editable-table.component';
import { PreviewTemplateService } from '@app/admin/common/preview-template/preview-template.service';
import { ReportTypeConsts } from '@app/admin/core/ultils/consts/ReportTypeConsts';
import { NgForm } from '@angular/forms';
import { ReportTemplateModalComponent } from '@app/admin/core/controls/report-template-modal/report-template-modal.component';
import { AccentsCharService } from '@app/admin/core/ultils/accents-char.service';

@Component({
    templateUrl: './ass-liquidation-edit.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    animations: [appModuleAnimation()]
})

export class AssLiquidationEditComponent extends DefaultComponentBase implements OnInit, AfterViewInit, IUiAction<ASS_LIQUIDATION_ENTITY> {
    constructor(
        injector: Injector,
        private ultilityService: UltilityServiceProxy,
        private assLiquidationService: AssLiquidationServiceProxy,
        private previewTemplateService: PreviewTemplateService,
        private accentsCharService: AccentsCharService
    ) {
        super(injector);
        this.editPageState = this.getRouteData('editPageState');
        this.inputModel.liQ_ID = this.getRouteParam('id');
        this.initFilter();
        this.initCombobox();
        this.initIsApproveFunct();

        console.log(this)
    }

    @ViewChild('editForm') editForm: NgForm;
    @ViewChild('assetModal') assetModal: AssetModalComponent;
    @ViewChild('ngFormAssLiq') ngFormAssLiq: NgForm;
    @ViewChild('editTableView') editTable: EditableTableComponent<ASS_LIQUIDATION_DT_ENTITY>;
    @ViewChild('reportTemplate') reportTemplate: ReportTemplateModalComponent;

    EditPageState = EditPageState;
    editPageState: EditPageState;

    inputModel: ASS_LIQUIDATION_ENTITY = new ASS_LIQUIDATION_ENTITY();
    filterInput: ASS_LIQUIDATION_ENTITY;
    isApproveFunct: boolean;


    importStartPosition: string = 'A2'


    totalRemainAmortAmt: number = 0
    totalBuyPrice: number = 0

    xlsStructure: Array<string> = ['no', 'asseT_CODE', 'asseT_NAME', 'buY_PRICE', 'remaiN_AMORTIZED_AMT', 'buY_PRICE_LIQ', 'remaiN_VALUE',
        'liQ_PRICE', 'asS_STATUS_NAME', 'liQ_TYPE']

    get disableInput(): boolean {
        return this.editPageState == EditPageState.viewDetail || this.inputModel.autH_STATUS == AuthStatusConsts.Approve;
    }

    get isShowPrintButton(): boolean {
        return this.inputModel.autH_STATUS == AuthStatusConsts.Approve
    }

    isShowError = false;

    ngOnInit(): void {
        switch (this.editPageState) {
            case EditPageState.add:
                this.inputModel.buY_PRICE = 0
                this.inputModel.creatE_DT = moment()
                this.inputModel.recorD_STATUS = RecordStatusConsts.Active;
                this.appToolbar.setRole('AssLiquidation', false, false, true, false, false, false, false, false);
                this.appToolbar.setEnableForEditPage();
                break;
            case EditPageState.edit:
                this.appToolbar.setRole('AssLiquidation', false, false, true, false, false, false, false, false);
                this.appToolbar.setEnableForEditPage();
                this.getAssLiquidation();
                break;
            case EditPageState.viewDetail:
                this.appToolbar.setRole('AssLiquidation', false, false, false, false, false, false, true, false);
                this.appToolbar.setEnableForViewDetailPage();
                this.getAssLiquidation();
                break;
        }
        this.appToolbar.setUiAction(this);
        this.inputModel.brancH_ID = this.appSession.user.subbrId

    }

    ngAfterViewInit(): void {
        // COMMENT: this.stopAutoUpdateView();
        this.setupValidationMessage()
        this.editTable.ngForm = this.ngFormAssLiq;
    }

    initIsApproveFunct() {
        this.ultilityService.isApproveFunct(this.getCurrentFunctionId()).subscribe(isApproveFunct => {
            this.isApproveFunct = isApproveFunct;
        })
    }

    initCombobox() {

    }

    //TESTING DATA 
    printCoreNoteInvoice() {
        if (!this.inputModel.liQ_ID) {
            this.showErrorMessage(this.l('CannotExport'));
            return;
        }

        let reportInfo = new ReportInfo();
        reportInfo.typeExport = ReportTypeConsts.Word;

        let curDate = moment()
        let { userName, name, taxNo } = this.appSession.user
        let { brancH_NAME, brancH_TYPE, taX_NO } = this.appSession.user.branch

        let parameters = [this.GetParamNameAndValue('REF_ID', this.inputModel.liQ_ID)];
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
        // let values = this.GetParamsFromFilter({
        //     branchName: 'Hoi so',
        //     branchType: 'VN0010001',
        //     userName: userName,
        //     userFullName: 'thieuvq',
        //     branchTaxNo: '12039896',
        //     day: curDate.format('D'),
        //     month: curDate.format('M'),
        //     year: curDate.format('Y'),
        // });
        this.previewTemplateService.printReportTemplate('rpt_ASS_ENTRIES', parameters, values);
    }

    onImportAssLiquidation(rows: any) {
        let curItems = !this.inputModel.assLiquidDetails ? [] : this.inputModel.assLiquidDetails;
        console.time('onImportAssLiquidationTotal')
        console.time('onImportAssLiquidation')
        let arr = this.xlsRowsToArr(rows, this.xlsStructure, function (obj: ASS_LIQUIDATION_DT_ENTITY) {
            if (!obj) {
                return null
            }

            if (!obj.asseT_CODE || !obj.asseT_NAME
                || !obj.liQ_PRICE || obj.liQ_PRICE && obj.liQ_PRICE < 0
                || !obj.buY_PRICE || obj.buY_PRICE && obj.buY_PRICE < 0
                || !obj.remaiN_AMORTIZED_AMT || obj.remaiN_AMORTIZED_AMT && obj.remaiN_AMORTIZED_AMT < 0
                || !obj.remaiN_VALUE || obj.remaiN_VALUE && obj.remaiN_VALUE < 0
            ) {
                return null;
            }

            curItems.forEach(item => {
                if (item.asseT_CODE == obj.asseT_CODE) {
                    return null;
                }
            })

            if (obj.liQ_TYPE == '1' && obj.buY_PRICE_LIQ != obj.buY_PRICE || obj.liQ_TYPE == '1' && obj.remaiN_VALUE != obj.buY_PRICE) {
                obj.buY_PRICE_LIQ = obj.buY_PRICE || 0
                obj.remaiN_VALUE = obj.buY_PRICE || 0
            }

            return obj;
        })
        console.timeEnd('onImportAssLiquidation')
        this.inputModel.assLiquidDetails = arr
        this.editTable.setList(this.inputModel.assLiquidDetails);
        this.reloadSumMultiValue(this.inputModel.assLiquidDetails)
        this.updateView()
        console.timeEnd('onImportAssLiquidationTotal')
    }

    getAssLiquidation() {

        this.assLiquidationService.aSS_LIQUIDATION_ById(this.inputModel.liQ_ID).subscribe(response => {
            this.inputModel = response;

            this.editTable.setList(response.assLiquidDetails);
            this.reloadSumMultiValue(this.inputModel.assLiquidDetails)


            if (this.inputModel.autH_STATUS == AuthStatusConsts.Approve) {
                this.appToolbar.setButtonApproveEnable(false);
            }

            if (this.inputModel.liQ_ID) {
                // CM_ATTACH_FILE
                this.getFile(this.inputModel.liQ_ID, this.inputModel);
            }

            this.updateView()
        });
    }

    removeAllCheckedItem() {
        this.editTable.removeAllCheckedItem()
        this.inputModel.assLiquidDetails = this.editTable.allData
        this.reloadSumMultiValue(this.inputModel.assLiquidDetails)
    }

    onSelectAssets(items: ASS_MASTER_ENTITY[]) {

        if (!this.isNull(items)) {
            let tempArr = items.map((item, index) => {
                let detailItem = new ASS_LIQUIDATION_DT_ENTITY()
                detailItem.asseT_ID = item.asseT_ID
                detailItem.asseT_CODE = item.asseT_CODE
                detailItem.asseT_NAME = item.asseT_NAME
                detailItem.buY_PRICE = item.buY_PRICE
                detailItem.buY_PRICE_LIQ = item.buY_PRICE > 0 ? item.buY_PRICE : 0

                detailItem.remaiN_AMORTIZED_AMT = item.remaiN_AMORTIZED_AMT > 0 ? item.remaiN_AMORTIZED_AMT : 0
                detailItem.liQ_PRICE = detailItem.buY_PRICE_LIQ

                detailItem.remaiN_VALUE = this.calItemRemainValue(detailItem.buY_PRICE_LIQ, detailItem.buY_PRICE, detailItem.remaiN_AMORTIZED_AMT)
                detailItem.asS_STATUS_NAME = item.asS_STATUS_NAME
                detailItem.liQ_TYPE = '1'

                return detailItem
            })
            this.inputModel.assLiquidDetails = tempArr
            this.reloadSumMultiValue(this.inputModel.assLiquidDetails)
            this.editTable.setList(this.inputModel.assLiquidDetails)
            this.updateView()
        }
    }

    onBuyPriceLiqChange(item: ASS_LIQUIDATION_DT_ENTITY, buyLiqPriceInputName, remainValueInputName) {
        let { buY_PRICE_LIQ, buY_PRICE, remaiN_AMORTIZED_AMT, liQ_TYPE } = item
        if (this.isNull(buY_PRICE_LIQ))
            buY_PRICE_LIQ = 0
        else {
            if (isNaN(buY_PRICE_LIQ)) buY_PRICE_LIQ = 0
        }

        if (liQ_TYPE == '1' || buY_PRICE_LIQ > buY_PRICE) buY_PRICE_LIQ = buY_PRICE


        this.ngFormAssLiq.controls[buyLiqPriceInputName].setValue(buY_PRICE_LIQ)
        const remainVal = this.calItemRemainValue(buY_PRICE_LIQ, buY_PRICE, remaiN_AMORTIZED_AMT)
        this.ngFormAssLiq.controls[remainValueInputName].setValue(remainVal)

    }

    onSumMultiValue(items: ASS_LIQUIDATION_DT_ENTITY[]) {
        this.reloadSumMultiValue(items)
        this.updateView()
    }

    onLiqTypeChange(item: ASS_LIQUIDATION_DT_ENTITY) {
        if (item.liQ_TYPE == '1') {
            this.editTable.currentItem.buY_PRICE_LIQ = this.editTable.currentItem.buY_PRICE || 0
            this.editTable.currentItem.remaiN_VALUE = this.editTable.currentItem.buY_PRICE || 0
            this.updateView()
        }
    }

    setValue() {
        this.editForm.controls["buY_PRICE_LIQ-d1-0"].setValue(12345);
    }

    calItemRemainValue(buY_PRICE_LIQ, buY_PRICE, remaiN_AMORTIZED_AMT) {
        return Math.round(buY_PRICE_LIQ / (buY_PRICE != 0 ? buY_PRICE : 1) * remaiN_AMORTIZED_AMT);
    }

    reloadSumMultiValue(items: ASS_LIQUIDATION_DT_ENTITY[]) {
        // hiển thị tổng giá trị của items trong ASS_MASTER
        this.totalBuyPrice = 0
        this.totalRemainAmortAmt = 0

        // Tính tổng giá trị thanh lý
        let totalLiqPrice = 0

        if (!this.isNull(items)) {
            items.forEach(element => {
                if (!this.isNull(element)) {
                    this.totalBuyPrice += element.buY_PRICE || 0
                    this.totalRemainAmortAmt += element.remaiN_AMORTIZED_AMT || 0
                    totalLiqPrice += element.liQ_PRICE || 0
                }
            });
        }


        // tổng giá trị thanh lý (ASS_LIQUIDATION -> buyPrice)       
        this.inputModel.buY_PRICE = totalLiqPrice;
    }

    addNew() {
        this.assLiquidationService.aSS_LIQUIDATION_Ins(this.inputModel).pipe(finalize(() => { this.saving = false; }))
            .subscribe((response) => {
                if (response["Result"] != '0') {
                    this.showErrorMessage(response['ErrorDesc']);
                }
                else {
                    this.addFile(this.inputModel, 'ASS_LIQUIDATION', undefined, response['LIQUIDATION_ID']);
                    this.showSuccessMessage(this.l('InsertSuccessful'));
                    if (!this.isApproveFunct) {
                        this.assLiquidationService.aSS_LIQUIDATION_App(response.id, this.appSession.user.userName)
                            .pipe(finalize(() => { this.saving = false; }))
                            .subscribe((response) => {
                                if (response["Result"] != '0') {
                                    this.showErrorMessage(response['ErrorDesc']);
                                } else {
                                    this.appToolbar.setButtonApproveEnable(false)
                                    this.appToolbar.setButtonSaveEnable(false)
                                    this.inputModel.autH_STATUS = AuthStatusConsts.Approve;
                                }
                                this.updateView()
                            });
                    }
                }
                this.updateView()
            });
    }



    update() {
        this.assLiquidationService.aSS_LIQUIDATION_Upd(this.inputModel).pipe(finalize(() => { this.saving = false; }))
            .subscribe((response) => {
                if (response["Result"] != '0') {
                    this.showErrorMessage(response['ErrorDesc']);
                    this.updateView()
                }
                else {
                    //CM_ATTACH_FILE
                    this.updateFile(this.inputModel, 'ASS_LIQUIDATION', undefined, response['LIQUIDATION_ID']);
                    this.showSuccessMessage(this.l('UpdateSuccessful'));
                    if (!this.isApproveFunct) {
                        this.assLiquidationService.aSS_LIQUIDATION_App(this.inputModel.liQ_ID, this.appSession.user.userName)
                            .pipe(finalize(() => { this.saving = false; }))
                            .subscribe((response) => {
                                if (response["Result"] != '0') {
                                    this.showErrorMessage(response['ErrorDesc']);
                                }
                                else {
                                    this.appToolbar.setButtonApproveEnable(false)
                                    this.appToolbar.setButtonSaveEnable(false)
                                    this.inputModel.autH_STATUS = AuthStatusConsts.Approve;
                                }
                                this.updateView()
                            });
                    }
                    else {
                        this.inputModel.autH_STATUS = AuthStatusConsts.NotApprove;
                    }
                }
            });
    }

    saveInput() {
        if (this.isApproveFunct == undefined) {
            this.showErrorMessage(this.l('PageLoadUndone'));
            this.updateView()
            return;
        }

        if ((this.editForm as any).form.invalid) {
            this.isShowError = true;
            this.showErrorMessage(this.l('FormInvalid'));
            this.updateView()
            return;
        }

        let errorMessage = this.isValid()
        if (errorMessage != '') {
            this.isShowError = true;
            this.showErrorMessage(this.l(errorMessage));
            this.updateView();
            return;
        }

        const validMessage = this.editTable.getValidationMessage()
        if (validMessage) {
            this.isShowError = true;
            this.showErrorMessage(validMessage);
            this.updateView()
            return;
        }

        if (this.editPageState != EditPageState.viewDetail) {
            this.saving = true;
            this.inputModel.makeR_ID = this.appSession.user.userName;
            this.inputModel.assLiquidDetails = this.editTable.allData
            if (!this.inputModel.liQ_ID) {
                this.addNew();
            }
            else {
                this.update();
            }
        }
    }

    goBack() {
        this.navigatePassParam('/app/admin/ass-liquidation', null, { filterInput: JSON.stringify(this.filterInput) });
    }

    onAdd(): void {
    }

    onUpdate(item: ASS_LIQUIDATION_ENTITY): void {
    }

    onDelete(item: ASS_LIQUIDATION_ENTITY): void {
    }

    onApprove(item: ASS_LIQUIDATION_ENTITY): void {
        if (!this.inputModel.liQ_ID) {
            return;
        }
        var currentUserName = this.appSession.user.userName;
        if (currentUserName == this.inputModel.makeR_ID) {
            this.showErrorMessage(this.l('ApproveFailed'));
            return;
        }

        let errorMessage = this.isValid()
        if (errorMessage != '') {
            this.isShowError = true;
            this.showErrorMessage(this.l(errorMessage));
            this.updateView();
            return;
        }

        this.message.confirm(
            this.l('ApproveWarningMessage', this.l(this.inputModel.liQ_ID)),
            this.l('AreYouSure'),
            (isConfirmed) => {
                if (isConfirmed) {
                    this.saving = true;
                    this.assLiquidationService.aSS_LIQUIDATION_App(this.inputModel.liQ_ID, currentUserName)
                        .pipe(finalize(() => { this.saving = false; }))
                        .subscribe((response) => {
                            if (response["Result"] != '0') {
                                this.showErrorMessage(response['ErrorDesc']);
                            }
                            else {
                                this.inputModel.autH_STATUS = AuthStatusConsts.Approve;
                                this.appToolbar.setButtonApproveEnable(false)
                                this.appToolbar.setButtonSaveEnable(false)
                                this.showSuccessMessage(this.l('SuccessfullyApprove'));
                            }
                            this.updateView()
                        });
                }
            }
        );
    }

    onViewDetail(item: ASS_LIQUIDATION_ENTITY): void {
    }

    onSave(): void {
        this.saveInput();
    }

    onSearch(): void {
    }

    onResetSearch(): void {
    }

    private isValid() {
        let errorMessage = ''
        let assLiquidDetails = this.editTable.allData || []
        try {
            //valid here
            if (!assLiquidDetails || assLiquidDetails && assLiquidDetails.length == 0) {
                errorMessage = 'AssLiquidationRequireInvalid'
            }
        } catch{
            errorMessage = 'ValidException'
        }

        return errorMessage
    }
}
