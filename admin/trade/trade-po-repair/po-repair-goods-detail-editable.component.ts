import { ViewEncapsulation, Component, ViewChild, ChangeDetectorRef, Injector, Input, OnInit, AfterViewInit, Output, EventEmitter, AfterContentChecked, AfterViewChecked } from "@angular/core";
import { appModuleAnimation } from "@shared/animations/routerTransition";
import { EditableTableComponent } from "@app/admin/core/controls/editable-table/editable-table.component";
import { TR_PO_REPAIR_DT_ENTITY, TR_PO_GOODS_ENTITY, CM_BRANCH_ENTITY, CM_GOODSTYPE_REAL_ENTITY, GoodsTypeRealServiceProxy, TradePoRepairServiceProxy, TR_PO_REPAIR_ENTITY, GoodsTypeServiceProxy, CM_GOODS_ENTITY, ASS_MASTER_ENTITY } from "@shared/service-proxies/service-proxies";
import { EditPageState } from "@app/ultilities/enum/edit-page-state";
import { NgForm } from "@angular/forms";
import { ChangeDetectionComponent } from "@app/admin/core/ultils/change-detection.component";
import { DisplayComponent } from "@app/admin/core/controls/display/display.component";
import { AssetModalComponent } from "@app/admin/core/controls/asset-modal/asset-modal.component";

@Component({
    selector: "po-repair-goods-detail-editable",
    templateUrl: "./po-repair-goods-detail-editable.component.html",
    encapsulation: ViewEncapsulation.None,
    animations: [appModuleAnimation()]
})
export class PoRepairGoodsDetailEditableComponent extends ChangeDetectionComponent implements OnInit, AfterViewInit, AfterContentChecked, AfterViewChecked {
    ngAfterViewChecked(): void {
        console.log('afterViewChecked');
    }


    @ViewChild('editTableGoodsDetailView') editTableGoodsDetailView: EditableTableComponent<TR_PO_REPAIR_DT_ENTITY>;
    @ViewChild('editTablePaymentTrackingView') editTablePaymentTrackingView: EditableTableComponent<TR_PO_REPAIR_DT_ENTITY>;
    @ViewChild('totalAmtElement') totalAmtElement: DisplayComponent;
    @ViewChild('assetModal') assetModal: AssetModalComponent;
    @ViewChild('myForm') myForm: NgForm;

    get editTableGoodsDetail() {
        if (!this.editTableGoodsDetailView) {
            return {} as EditableTableComponent<TR_PO_REPAIR_DT_ENTITY>;
        }
        return this.editTableGoodsDetailView;
    }
    get editTablePaymentTracking() {
        if (!this.editTablePaymentTrackingView && this.editPageState != EditPageState.add) {
            return {} as EditableTableComponent<TR_PO_REPAIR_DT_ENTITY>;
        }
        return this.editTablePaymentTrackingView;
    }


    EditPageState = EditPageState;

    constructor(
        injector: Injector,
        private goodsTypeRealService: GoodsTypeRealServiceProxy,
        private tradePoRepairService: TradePoRepairServiceProxy,
    ) {
        super(injector);
    }

    ngAfterContentChecked(): void {

    }


    ngOnInit(): void {
        this.initCombobox();
    }

    ngAfterViewInit(): void {
        // COMMENT: this.stopAutoUpdateView();
        this.assetModal.filterInput.brancH_ID = this.appSession.user.subbrId;
        this.assetModal.filterInput.brancH_LOGIN = this.appSession.user.subbrId;
        this.assetModal.filterInput.level = 'ALL';
        this.editTableGoodsDetail.ngForm = this.myForm;
        if (this.editTablePaymentTracking) {
            this.editTablePaymentTracking.tableState = this.editTableGoodsDetail.tableState;
            this.editTablePaymentTracking.ngForm = this.myForm;
        }
    }

    reloadList() {

    }

    @Input() inputModel: TR_PO_REPAIR_ENTITY;
    @Input() disableInput: boolean;
    @Input() isShowError: boolean;
    @Input() editPageState: EditPageState;
    @Input() editForm: NgForm;

    @Output() onChangeTotalAmt: EventEmitter<any> = new EventEmitter<any>();

    gdTypeReals: CM_GOODSTYPE_REAL_ENTITY[];

    static times = 0;

    get paymentTrackingTable() {
        return ((this.editTableGoodsDetail || <any>{}).allData || []);
    }


    initCombobox() {
        let filterCombobox = this.getFillterForCombobox();

        this.goodsTypeRealService.cM_GOODSTYPE_REAL_Search(filterCombobox).subscribe(response => {
            this.gdTypeReals = response.items;

            // reload page
            this.updateView();
        })
    }

    // lưu PO_DETAIL hiện tại để gán giá trị sau khi chọn đơn vị nhận từ popup
    currentPoDetail: TR_PO_REPAIR_DT_ENTITY;

    _totalAmt: number;

    get totalAmt(): number {
        return this._totalAmt;
    }
    set totalAmt(value: number) {
        this._totalAmt = value;
        this.totalAmtElement.value = this.formatMoney(value || 0);
    }

    onSelectTrRequestGoods(selectedGoods: CM_GOODS_ENTITY[]) {
        var datas = this.editTableGoodsDetail.allData;
        selectedGoods.forEach(x => {
            var model = new TR_PO_REPAIR_DT_ENTITY();
            Object.assign(model, x);
            model.goodS_NAME = x.gD_NAME;
            model.goodS_ID = x.gD_ID;
            model.paymenT_STATUS = 'CTT';
            model.amounT_PAID = 0;
            model['isChecked'] = false;
            model.vat = 10;
            model.iS_DELIVERY = '0';
            model.quantity = 1;
            model.iS_HQ_PAY = '1';
            this.reloadPoDetailPriceVat(model);
            this.reloadPoDetailTotalAmt(model);
            datas.push(model);
        });
        this.editTableGoodsDetail.resetNoAndPage();
        // updateView called
        this.editTableGoodsDetail.changePage(0);
        this.reloadTotalAmt();
    }

    onSelectBranch(branch: CM_BRANCH_ENTITY) {
        this.currentPoDetail.receivE_BRANCH = branch.brancH_ID;
        this.currentPoDetail.receivE_ADDR = branch.addr;
        this.currentPoDetail.r_BRANCH_NAME = branch.brancH_NAME;
    }

    onSelectAsset(assMaster: ASS_MASTER_ENTITY) {
        this.editTableGoodsDetail.currentItem.assetid = assMaster.asseT_ID;
        this.editTableGoodsDetail.currentItem.asseT_CODE = assMaster.asseT_CODE;
        this.editTableGoodsDetail.currentItem.asseT_NAME = assMaster.asseT_NAME;
    }

    /* #region Common function */

    /** reload totalAmt for each item */
    reloadPoDetailTotalAmt(item: TR_PO_REPAIR_DT_ENTITY) {
        var price = item.price || 0;
        var priceVat = item.pricE_VAT || 0;
        var quantity = item.quantity || 0;

        item.totaL_AMT = Math.round((price + priceVat) * quantity);
    }

    /**  reload % VAT */
    reloadPoDetailVat(item: TR_PO_REPAIR_DT_ENTITY) {
        var priceVat = item.pricE_VAT || 0;
        var price = item.price || 0;
        item.vat = Math.round((priceVat * 100) / price);
    }

    /**  reload VAT */
    reloadPoDetailPriceVat(item: TR_PO_REPAIR_DT_ENTITY) {
        var vatPercent = item.vat || 0;
        var price = item.price || 0;
        item.pricE_VAT = Math.round(price * vatPercent / 100);
    }

    /**  reload totalAmt all */
    reloadTotalAmt() {
        if (!this.editTableGoodsDetail) {
            return 0;
        }
        this.totalAmt = Math.round(this.editTableGoodsDetail.allData.map(x => x.totaL_AMT).filter(x => x).reduce(this.sumFunct, 0));
        this.onChangeTotalAmt.emit(this.totalAmt);
    }

    /** reload remaiN_AMT */
    reloadPoDetailRemainAmt(item: TR_PO_REPAIR_DT_ENTITY) {
        item.remaiN_AMT = item.totaL_AMT - item.amounT_PAID;
    }

    /* #endregion */

    /* #region  Event Listener */

    onQuatityFocusOut(item: TR_PO_REPAIR_DT_ENTITY) {
        this.reloadPoDetailTotalAmt(item);
        this.reloadPoDetailRemainAmt(item);
        this.reloadTotalAmt();
        this.updateView();
    }

    onUnitPriceFocusOut(item: TR_PO_REPAIR_DT_ENTITY) {
        this.reloadPoDetailPriceVat(item);
        this.reloadPoDetailTotalAmt(item);
        this.reloadPoDetailRemainAmt(item);
        this.reloadTotalAmt();
        this.updateView();
    }

    onVatFocusOut(item: TR_PO_REPAIR_DT_ENTITY) {
        this.reloadPoDetailPriceVat(item);
        this.reloadPoDetailTotalAmt(item);
        this.reloadPoDetailRemainAmt(item);
        this.reloadTotalAmt();
        this.updateView();
    }

    onPriceVatFocusOut(item: TR_PO_REPAIR_DT_ENTITY) {
        this.reloadPoDetailVat(item);
        this.reloadPoDetailTotalAmt(item);
        this.reloadPoDetailRemainAmt(item);
        this.reloadTotalAmt();
        this.updateView();
    }

    onAmountPaidFocusOut(item: TR_PO_REPAIR_DT_ENTITY) {
        this.reloadPoDetailRemainAmt(item);
        this.updateView();
    }

    /* #endregion */
}