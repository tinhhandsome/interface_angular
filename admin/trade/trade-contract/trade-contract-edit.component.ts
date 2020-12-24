import { Component, Injector, ViewChild, OnInit, ViewEncapsulation, ElementRef, AfterViewInit } from '@angular/core';
import { appModuleAnimation } from '@shared/animations/routerTransition';
import * as _ from 'lodash';
import { TR_CONTRACT_ENTITY, TradeContractServiceProxy, CM_BRANCH_ENTITY, BranchServiceProxy, UltilityServiceProxy, TR_CONTRACT_DT_ENTITY, CM_GOODS_ENTITY, BID_MASTER_ENTITY, TR_CONTRACT_PAYMENT_ENTITY, AttachFileServiceProxy, CM_ATTACH_FILE_ENTITY, BidMasterServiceProxy } from '@shared/service-proxies/service-proxies';
import { EditPageState } from '@app/ultilities/enum/edit-page-state';
import { AllCodes } from '@app/ultilities/enum/all-codes';
import { finalize } from 'rxjs/operators';
import { DefaultComponentBase } from '@app/ultilities/default-component-base';
import { IUiAction } from '@app/ultilities/ui-action';
import { AuthStatusConsts } from '@app/admin/core/ultils/consts/AuthStatusConsts';
import { RecordStatusConsts } from '@app/admin/core/ultils/consts/RecordStatusConsts';
import { EditableTableComponent } from '@app/admin/core/controls/editable-table/editable-table.component';
import { GoodsModalComponent } from '@app/admin/core/controls/goods-modal/goods-modal.component';
import { BidMasterModalComponent } from '@app/admin/core/controls/bid-master-modal/bid-master-modal.component';

@Component({
    templateUrl: './trade-contract-edit.component.html',
    encapsulation: ViewEncapsulation.None,
    animations: [appModuleAnimation()]
})
export class TradeContractEditComponent extends DefaultComponentBase implements OnInit, IUiAction<TR_CONTRACT_ENTITY>, AfterViewInit {
    ngAfterViewInit(): void {
        this.setupValidationMessage();
        // COMMENT: this.stopAutoUpdateView();
    }
    attachFile: any;
    constructor(
        injector: Injector,
        // private attachFileService: AttachFileServiceProxy,
        private ultilityService: UltilityServiceProxy,
        private branchService: BranchServiceProxy,
        private tradeContractService: TradeContractServiceProxy,
        private bidMasterService: BidMasterServiceProxy
    ) {
        super(injector);

        this.attachFile = injector.get(AttachFileServiceProxy);
        this.editPageState = this.getRouteData('editPageState');
        this.inputModel.contracT_ID = this.getRouteParam('id');
        this.inputModel.assetDetail = [];
        this.inputModel.paymentDetail = [];

        this.initFilter();
        this.initIsApproveFunct();

    }
    @ViewChild('bidMasterModal') bidMasterModal: BidMasterModalComponent;

    @ViewChild('editForm') editForm: ElementRef;
    @ViewChild('goodModal') goodModal: GoodsModalComponent;
    @ViewChild('editGoodsTable') editGoodsTable: EditableTableComponent<TR_CONTRACT_DT_ENTITY>;
    @ViewChild('editPaymentTable') editPaymentTable: EditableTableComponent<TR_CONTRACT_PAYMENT_ENTITY>;


    EditPageState = EditPageState;
    AllCodes = AllCodes;
    editPageState: EditPageState;

    inputModel: TR_CONTRACT_ENTITY = new TR_CONTRACT_ENTITY();
    filterInput: TR_CONTRACT_ENTITY;
    isApproveFunct: boolean;

    get disableInput(): boolean {
        return this.editPageState == EditPageState.viewDetail;
    }

    branchs: CM_BRANCH_ENTITY[];

    isShowError = false;
    isCheckAllGood = false;

    processValue: number = 0;

    // dataInTables: LIQ_DETAIL_ENTITY[] = [];

    ngOnInit(): void {
        switch (this.editPageState) {
            case EditPageState.add:
                this.inputModel.recorD_STATUS = RecordStatusConsts.Active;
                this.appToolbar.setRole('TradeTRContractList', false, false, true, false, false, false, false, false);
                this.appToolbar.setEnableForEditPage();
                this.inputModel.assetDetail = [];
                this.inputModel.paymentDetail = [];
                break;
            case EditPageState.edit:
                this.appToolbar.setRole('TradeTRContractList', false, false, true, false, false, false, false, false);
                this.appToolbar.setEnableForEditPage();
                this.getTradeContract();
                break;
            case EditPageState.viewDetail:
                this.appToolbar.setRole('TradeTRContractList', false, false, false, false, false, false, true, false);
                this.appToolbar.setEnableForViewDetailPage();
                this.getTradeContract();
                break;
        }

        this.appToolbar.setUiAction(this);
        this.initCombobox();
    }

    initIsApproveFunct() {
        this.ultilityService.isApproveFunct(this.getCurrentFunctionId()).subscribe(isApproveFunct => {
            this.isApproveFunct = isApproveFunct;
        })
    }

    initCombobox() {
        this.branchService.cM_BRANCH_Search(this.getFillterForCombobox()).subscribe(response => {
            this.branchs = response.items;
        });
    }


    getTradeContract() {
        this.tradeContractService.tR_CONTRACT_ById(this.inputModel.contracT_ID).subscribe(response => {
            this.inputModel = response;

            this.editPaymentTable.setList(this.inputModel.paymentDetail);
            this.editGoodsTable.setList(this.inputModel.assetDetail);
            if (this.inputModel.contracT_CODE) {
                this.getFileContract(this.inputModel.contracT_ID, this.inputModel);
                // this.getFile(this.inputModel.contracT_ID, this.inputModel, undefined, undefined, function (result) {
                //     if (fileAttachment['filE_ATTACHMENT']) {
                //         var file1 = { ...fileAttachment['filE_ATTACHMENT'] };
                //         var file2 = { ...fileAttachment['filE_ATTACHMENT'] };
                //         file1["filE_NAME_NEW"] = file1["filE_NAME_NEW"].split('|')[0];
                //         file1["filE_NAME_OLD"] = file1["filE_NAME_OLD"].split('|')[0]
                //         file1["patH_NEW"] = file1["patH_NEW"].split('|')[0]
                //         file1["filE_TYPE"] = file1["filE_TYPE"].split('|')[0]

                //         file2["filE_NAME_NEW"] = file2["filE_NAME_NEW"].split('|')[1];
                //         file2["filE_NAME_OLD"] = file2["filE_NAME_OLD"].split('|')[1]
                //         file2["patH_NEW"] = file2["patH_NEW"].split('|')[1]
                //         file2["filE_TYPE"] = file2["filE_TYPE"].split('|')[1]

                //         fileAttachment['filE_ATTACHMENT_1'] = file1;
                //         fileAttachment['filE_ATTACHMENT_2'] = file2;
                //     }
                //     cst.updateView();

                // });

            }
            if (this.inputModel.autH_STATUS == AuthStatusConsts.Approve) {
                this.appToolbar.setButtonApproveEnable(false);
            }

            this.reloadTotalAmt();
            this.updateView();
        });
    }
    getFileContract(refMasterId: string, master: any, childs: any[] = undefined, childIdName = undefined, onGetFileSuccess = undefined, detailFileAttachmentName = 'filE_ATTACHMENT') {
        this.attachFile.cM_ATTACH_FILE_By_RefMaster(refMasterId).subscribe(response => {

            master['olD_FILE_PATHS'] = [];
            // init old file
            response.forEach(x => {
                master['olD_FILE_PATHS'].push(...this.getAllFiles(x));
            })

            var fileMaster = response.filter(x => x.reF_ID == refMasterId);
            if (fileMaster.length) {
                master['filE_ATTACHMENT'] = fileMaster[0];
                master['attacH_ID'] = fileMaster[0].attacH_ID;
            }

            if (childs) {
                response.forEach(file => {
                    var child = childs.filter(x => x[childIdName] == file.reF_ID);
                    if (child.length > 0) {
                        child[0]['filE_ATTACHMENT'] = child[0][detailFileAttachmentName] = file;
                        child[0]['attacH_ID'] = child[0].attacH_ID;
                    }
                })
            }

            // if (onGetFileSuccess) {
            //     // onGetFileSuccess(response);
            // }
            this.inputModel["filE_ATTACHMENT_1"] = response.firstOrDefault(x => x.index == '1');
            this.inputModel["filE_ATTACHMENT_2"] = response.firstOrDefault(x => x.index == '2');

            this.updateView();
        });
    }
    addNewPayment() {
        var itemDetail = new TR_CONTRACT_PAYMENT_ENTITY();
        itemDetail.paY_PHASE = (this.editPaymentTable.allData.length + 1).toString();
        itemDetail.paY_ID = '';
        itemDetail.percent = 0;
        itemDetail.amount = 0;

        this.editPaymentTable.pushItem(itemDetail);
        this.updateView();
    }


    saveInput() {
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
        if ((this.editGoodsTable.allData.length == 0)) {
            this.showErrorMessage(this.l('GoodsListCannotBeNull'));
            return;
        }
        let editTableError = this.editGoodsTable.getValidationMessage();
        if (editTableError) {
            this.showErrorMessage(this.l('TradeContract') + ': ' + editTableError);
            return;
        }
        let editPaymentTableError = this.editPaymentTable.getValidationMessage();
        if (editPaymentTableError) {
            this.showErrorMessage(this.l('TradeContract') + ': ' + editPaymentTableError);
            return;
        }
        if (this.editPageState != EditPageState.viewDetail) {
            this.saving = true;
            this.inputModel.makeR_ID = this.appSession.user.userName;

            this.inputModel.assetDetail = this.editGoodsTable.allData;
            this.inputModel.paymentDetail = this.editPaymentTable.allData;
            // var attachFile = this.inputModel;


            if (!this.inputModel.contracT_ID) {
                this.inputModel.contracT_TYPE = '1';
                this.inputModel.construcT_PROGRESS = 0;
                this.inputModel.approvE_VALUE = 0;
                this.tradeContractService.tR_CONTRACT_Ins(this.inputModel).pipe(finalize(() => { this.saving = false; }))
                    .subscribe((response) => {
                        if (response.result != '0') {
                            this.showErrorMessage(response.errorDesc);
                        }
                        else {
                            // this.inputModel['filE_ATTACHMENT_OLD'] = this.inputModel['filE_ATTACHMENT_OLD_1'] ? this.inputModel['filE_ATTACHMENT_OLD_1'] : '' + '|' + this.inputModel['filE_ATTACHMENT_OLD_2'] ? this.inputModel['filE_ATTACHMENT_OLD_2'] : '';
                            // attachFile['filE_ATTACHMENT'] = (attachFile['filE_ATTACHMENT_1'] ? attachFile['filE_ATTACHMENT_1'] : '') + '|' + (attachFile['filE_ATTACHMENT_2'] ? attachFile['filE_ATTACHMENT_2'] : '');


                            this.addNewSuccess();
                            this.addContractFile(response);
                            if (!this.isApproveFunct) {
                                this.tradeContractService.tR_CONTRACT_App(response.id, this.appSession.user.userName)
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
                this.tradeContractService.tR_CONTRACT_Upd(this.inputModel).pipe(finalize(() => { this.saving = false; }))
                    .subscribe((response) => {
                        if (response.result != '0') {
                            this.showErrorMessage(response.errorDesc);
                        }
                        else {
                            // this.inputModel['filE_ATTACHMENT_OLD'] = this.inputModel['filE_ATTACHMENT_OLD_1'] ? this.inputModel['filE_ATTACHMENT_OLD_1'] : '' + '|' + this.inputModel['filE_ATTACHMENT_OLD_2'] ? this.inputModel['filE_ATTACHMENT_OLD_2'] : '';
                            // attachFile['filE_ATTACHMENT'] = (attachFile['filE_ATTACHMENT_1'] ? attachFile['filE_ATTACHMENT_1'] : '') + '|' + (attachFile['filE_ATTACHMENT_2'] ? attachFile['filE_ATTACHMENT_2'] : '');

                            // this.updateFile(this.inputModel, 'TRADE_CONTRACT', undefined, response.id);
                            this.updateSuccess();
                            this.updateContractFile(response);

                            // this.inputModel.filE_ATTACHMENT_OLD_1 = this.inputModel.filE_ATTACHMENT_1;
                            // this.inputModel.filE_ATTACHMENT_OLD_2 = this.inputModel.filE_ATTACHMENT_2;

                            if (!this.isApproveFunct) {
                                this.tradeContractService.tR_CONTRACT_App(this.inputModel.contracT_ID, this.appSession.user.userName)
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
        this.navigatePassParam('/app/admin/trade-contract', null, { filterInput: JSON.stringify(this.filterInput) });
    }

    onAdd(): void {
    }

    onUpdate(item: TR_CONTRACT_ENTITY): void {
    }

    onDelete(item: TR_CONTRACT_ENTITY): void {
    }

    onApprove(item: TR_CONTRACT_ENTITY): void {
        var currentUserName = this.appSession.user.userName;
        if (currentUserName == this.inputModel.makeR_ID) {
            this.showErrorMessage(this.l('ApproveFailed'));
            return;
        }
        if (this.inputModel.autH_STATUS == AuthStatusConsts.Approve) {
            this.showErrorMessage(this.l('ApproveFailed'));
            return;
        }
        this.message.confirm(
            this.l('ApproveWarningMessage', this.l(this.inputModel.contracT_NAME)),
            this.l('AreYouSure'),
            (isConfirmed) => {
                if (isConfirmed) {
                    this.saving = true;
                    this.tradeContractService.tR_CONTRACT_App(this.inputModel.contracT_ID, currentUserName)
                        .pipe(finalize(() => { this.saving = false; }))
                        .subscribe((response) => {
                            if (response.result != '0') {
                                this.showErrorMessage(response.errorDesc);
                            }
                            else {
                                this.approveSuccess();
                                this.appToolbar.setButtonApproveEnable(false);
                                this.updateView();

                            }
                        });
                }
            }
        );
    }

    onViewDetail(item: TR_CONTRACT_ENTITY): void {

    }

    onSave(): void {
        this.saveInput();
    }

    onSearch(): void {

    }

    onResetSearch(): void {

    }

    onCheckAllGood(isCheckAll): void {
        this.inputModel.assetDetail.forEach(x => {
            x.isChecked = isCheckAll;
        });
        this.updateView();
    }

    onAddNewGoodsItem(): void {
        this.goodModal.show();
    }

    onRemoveGoodsItem(): void {
        this.inputModel.assetDetail = this.inputModel.assetDetail.filter(x => !x.isChecked);
        this.editGoodsTable.setList(this.inputModel.assetDetail);
    }

    onSelectGoods(selectedGood: CM_GOODS_ENTITY[]) {
        this.inputModel.assetDetail = [...this.editGoodsTable.allData];
        selectedGood.forEach(x => {
            if (!this.inputModel.assetDetail.firstOrDefault(y => y.goodS_ID == x.gD_ID)) {
                var item = new TR_CONTRACT_DT_ENTITY();
                item.gD_CODE = x.gD_CODE;
                item.gD_NAME = x.gD_NAME;
                item.goodS_ID = x.gD_ID;
                item.uniT_ID = x.uniT_ID;
                item.price = x.price;
                item.no = this.inputModel.assetDetail.length + 1;
                item.gD_NAME_REAL = x.gD_NAME;
                item.notes = x.notes;
                item.quantity = 1;
                item.quantitY_USE = 0;
                item['AMOUNT'] = item.quantity * item.price;

                this.inputModel.assetDetail.push(item);
            }

        });
        this.editGoodsTable.setList(this.inputModel.assetDetail);
        this.reloadTotalAmt();
        this.reloadFromPercent();
        this.updateView();
    }

    onSelectBidMaster(bid: BID_MASTER_ENTITY) {
        this.inputModel.biD_CODE = bid.biD_CODE;
        this.inputModel.suP_CODE = bid.suP_CODE;
        this.inputModel.suP_NAME = bid.suP_NAME;
        this.inputModel.suP_TEL = bid.suP_TEL;

        this.inputModel.biD_ID = bid.biD_ID;
        this.inputModel.suP_ID = bid.suP_ID;

        this.inputModel.addr = bid.suP_ADD;
        this.inputModel.suP_CONTACT_PERSON = bid.suP_CONTACT_PERSON;

    }

    reloadTotalAmt() {
        this.inputModel.totaL_AMT = 0;
        this.editGoodsTable.allData.forEach(x => {
            // this.inputModel.totaL_AMT = this.inputModel.totaL_AMT + (x.quantity * x.price);
            x['AMOUNT'] = x.quantity * x.price;
            this.inputModel.totaL_AMT += x['AMOUNT'];
        });
        this.updateView();

    }
    reloadFromPercent() {

        this.editPaymentTable.allData.forEach(x => {
            if (x.percent > 100) {
                x.percent = 100;
            }
            x.amount = this.inputModel.totaL_AMT * x.percent / 100;
        });
        this.updateView();

    }
    reloadFromAmount() {
        this.editPaymentTable.allData.forEach(x => {
            x.percent = x.amount * 100 / this.inputModel.totaL_AMT;
        });
        this.updateView();

    }
    focusOut() {
        this.updateView();
    }
    getContractFile() {


    }
    addContractFile(response) {
        // file1["filE_NAME_NEW"] =  file1["filE_NAME_NEW"].split('|')[0];
        // file1["filE_NAME_OLD"] =  file1["filE_NAME_OLD"].split('|')[0]
        // file1["patH_NEW"] =  file1["patH_NEW"].split('|')[0]

        // var file = new CM_ATTACH_FILE_ENTITY();
        // file.filE_NAME_NEW = (this.inputModel["filE_ATTACHMENT_1"] ? this.inputModel["filE_ATTACHMENT_1"]["filE_NAME_NEW"] : "") + '|' + (this.inputModel["filE_ATTACHMENT_2"] ? this.inputModel["filE_ATTACHMENT_2"]["filE_NAME_NEW"] : "")
        // file.filE_NAME_OLD = (this.inputModel["filE_ATTACHMENT_1"] ? this.inputModel["filE_ATTACHMENT_1"]["filE_NAME_OLD"] : "") + '|' + (this.inputModel["filE_ATTACHMENT_2"] ? this.inputModel["filE_ATTACHMENT_2"]["filE_NAME_OLD"] : "")
        // file.patH_NEW = (this.inputModel["filE_ATTACHMENT_1"] ? this.inputModel["filE_ATTACHMENT_1"]["patH_NEW"] : "") + '|' + (this.inputModel["filE_ATTACHMENT_2"] ? this.inputModel["filE_ATTACHMENT_2"]["patH_NEW"] : "")

        if (!this.inputModel["filE_ATTACHMENT_1"]) {
            this.inputModel["filE_ATTACHMENT_1"] = new CM_ATTACH_FILE_ENTITY();
        }

        this.inputModel["filE_ATTACHMENT_1"]["index"] = '1';
        var ids = (response.id) + ',' + (response.id.substr(2) + '_2');
        this.inputModel["filE_ATTACHMENT"] = this.inputModel["filE_ATTACHMENT_1"];
        var clone = {};
        clone["filE_ATTACHMENT"] = this.inputModel["filE_ATTACHMENT_2"];
        if (!clone["filE_ATTACHMENT"]) {
            clone["filE_ATTACHMENT"] = new CM_ATTACH_FILE_ENTITY();
        }
        clone["filE_ATTACHMENT"]["index"] = '2';
        this.addFile(this.inputModel, 'TR_CONTRACT', [clone], ids, 'TR_CONTRACT');

    }
    updateContractFile(response) {
        // var file = new CM_ATTACH_FILE_ENTITY();
        // file.filE_NAME_NEW = (this.inputModel["filE_ATTACHMENT_1"] ? this.inputModel["filE_ATTACHMENT_1"]["filE_NAME_NEW"] : "") + '|' + (this.inputModel["filE_ATTACHMENT_2"] ? this.inputModel["filE_ATTACHMENT_2"]["filE_NAME_NEW"] : "")
        // file.filE_NAME_OLD = (this.inputModel["filE_ATTACHMENT_1"] ? this.inputModel["filE_ATTACHMENT_1"]["filE_NAME_OLD"] : "") + '|' + (this.inputModel["filE_ATTACHMENT_2"] ? this.inputModel["filE_ATTACHMENT_2"]["filE_NAME_OLD"] : "")
        // file.patH_NEW = (this.inputModel["filE_ATTACHMENT_1"] ? this.inputModel["filE_ATTACHMENT_1"]["patH_NEW"] : "") + '|' + (this.inputModel["filE_ATTACHMENT_2"] ? this.inputModel["filE_ATTACHMENT_2"]["patH_NEW"] : "")
        // this.inputModel["filE_ATTACHMENT"] = file;
        if (!this.inputModel["filE_ATTACHMENT_1"]) {
            this.inputModel["filE_ATTACHMENT_1"] = new CM_ATTACH_FILE_ENTITY();
        }

        this.inputModel["filE_ATTACHMENT_1"]["index"] = '1';

        var ids = (response.id) + ',' + (response.id.substr(2) + '_2');
        this.inputModel["filE_ATTACHMENT"] = this.inputModel["filE_ATTACHMENT_1"];
        var clone = {};
        clone["filE_ATTACHMENT"] = this.inputModel["filE_ATTACHMENT_2"];
        clone["filE_ATTACHMENT"] ? clone["filE_ATTACHMENT"]["index"] = '2' : clone["filE_ATTACHMENT"] = new CM_ATTACH_FILE_ENTITY();
        clone["filE_ATTACHMENT"]["index"] = '2';
        this.updateFile(this.inputModel, 'TR_CONTRACT', [clone], ids, 'TR_CONTRACT');

    }
    findBranch() {
        this.bidMasterService.bID_MASTER_Search(this.getFillterForCombobox()).subscribe(bidList => {
            var bid = bidList.items.firstOrDefault(x => x.biD_CODE == this.inputModel.biD_CODE);
            if (bid) {
                this.inputModel.biD_CODE = bid.biD_CODE;
                this.inputModel.suP_CODE = bid.suP_CODE;
                this.inputModel.suP_NAME = bid.suP_NAME;
                this.inputModel.suP_TEL = bid.suP_TEL;

                this.inputModel.biD_ID = bid.biD_ID;
                this.inputModel.suP_ID = bid.suP_ID;

                this.inputModel.addr = bid.suP_ADD;
                this.inputModel.suP_CONTACT_PERSON = bid.suP_CONTACT_PERSON;
            }
            else {
                this.inputModel.biD_CODE = '';
                this.inputModel.suP_CODE = '';
                this.inputModel.suP_NAME = '';
                this.inputModel.suP_TEL = '';

                this.inputModel.biD_ID = '';
                this.inputModel.suP_ID = '';

                this.inputModel.addr = '';
                this.inputModel.suP_CONTACT_PERSON = '';
            }
            this.updateView();

        })
    }
}
