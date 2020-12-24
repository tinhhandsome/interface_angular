import { ViewEncapsulation, Component, ViewChild, ChangeDetectorRef, Injector, Input, OnInit, AfterViewInit, Output, EventEmitter, AfterContentChecked } from "@angular/core";
import { appModuleAnimation } from "@shared/animations/routerTransition";
import { EditableTableComponent } from "@app/admin/core/controls/editable-table/editable-table.component";
import { TR_PO_DETAIL_ENTITY, TR_PO_GOODS_ENTITY, CM_BRANCH_ENTITY, CM_GOODSTYPE_REAL_ENTITY, GoodsTypeRealServiceProxy, TradePoMasterServiceProxy, TR_PO_MASTER_ENTITY, GoodsTypeServiceProxy } from "@shared/service-proxies/service-proxies";
import { EditPageState } from "@app/ultilities/enum/edit-page-state";
import { NgForm } from "@angular/forms";
import { ChangeDetectionComponent } from "@app/admin/core/ultils/change-detection.component";
import { DisplayComponent } from "@app/admin/core/controls/display/display.component";
import { TrRequestGoodsModalComponent } from "@app/admin/core/controls/goods-modal/tr-request-goods-modal.component";

@Component({
    selector: "goods-detail-editable",
    templateUrl: "./goods-detail-editable.component.html",
    encapsulation: ViewEncapsulation.None,
    animations: [appModuleAnimation()]
})
export class GoodsDetailEditableComponent extends ChangeDetectionComponent implements OnInit, AfterViewInit {


    @ViewChild('editTableGoodsDetailView') editTableGoodsDetailView: EditableTableComponent<TR_PO_DETAIL_ENTITY>;
    @ViewChild('editTablePaymentTrackingView') editTablePaymentTrackingView: EditableTableComponent<TR_PO_DETAIL_ENTITY>;
    @ViewChild('totalAmtElement') totalAmtElement: DisplayComponent;
    @ViewChild('trRequestGoodsModal') trRequestGoodsModal: TrRequestGoodsModalComponent;
    @ViewChild('ngForm') ngForm: NgForm;

    get editTableGoodsDetail() {
        if(!this.editTableGoodsDetailView){
            return {} as EditableTableComponent<TR_PO_DETAIL_ENTITY>;
        }
        return this.editTableGoodsDetailView;
    }

    get editTablePaymentTracking() {
        if(!this.editTablePaymentTrackingView && this.editPageState != EditPageState.add){
            return {} as EditableTableComponent<TR_PO_DETAIL_ENTITY>;
        }
        return this.editTablePaymentTrackingView;
    }

    EditPageState = EditPageState;

    constructor(
        injector: Injector,
        private goodsTypeRealService: GoodsTypeRealServiceProxy,
        private tradePoMasterService: TradePoMasterServiceProxy,
    ) {
        super(injector);
    }


    ngOnInit(): void {
        this.initCombobox();
    }

    ngAfterViewInit(): void {
        this.editTableGoodsDetail.ngForm = this.ngForm;
        if (this.editTablePaymentTracking) {
            this.editTablePaymentTracking.ngForm = this.ngForm;
            this.editTablePaymentTracking.tableState = this.editTableGoodsDetail.tableState;
            this.editTablePaymentTracking.updateView();
        }
        this.updateView();
        // COMMENT: this.stopAutoUpdateView();
    }

    reloadList() {
    }

    @Input() inputModel: TR_PO_MASTER_ENTITY;
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

            console.log(response.items);

            // reload page
            this.updateView();
        })
    }

    // lưu PO_DETAIL hiện tại để gán giá trị sau khi chọn đơn vị nhận từ popup
    currentPoDetail: TR_PO_DETAIL_ENTITY;

    _totalAmt: number;

    get totalAmt(): number {
        return this._totalAmt;
    }
    set totalAmt(value: number) {
        this._totalAmt = value;
        this.totalAmtElement.value = this.formatMoney(value || 0);
    }

    onSelectTrRequestGoods(selectedGoods: TR_PO_GOODS_ENTITY[]) {
        var datas = this.editTableGoodsDetail.allData;
        selectedGoods.forEach(x => {
            var model = new TR_PO_DETAIL_ENTITY();
            Object.assign(model, x);
            model.goodS_NAME = x.gD_NAME;
            model['isChecked'] = false;
            model.vat = 10;
            model.receivE_BRANCH = x.brancH_ID;
            model.receivE_BRANCH_NAME = x.brancH_NAME;
            model.receivE_ADDR = x.r_ADDR;
            model.description = x.contraC_DESC;
            model.goodS_ID = x.gD_ID;
            model.iS_DELIVERY = '0';
            model.paymenT_STATUS = 'CTT';
            model.amounT_PAID = 0;
            model.quantity = x.quantity;
            model.uniT_ID = x.uniT_ID;
            model.iS_HQ_PAY = '1';

            this.reloadPoDetailPriceVat(model);
            this.reloadPoDetailTotalAmt(model);
            datas.push(model);
        });
        this.inputModel.pO_TYPE = this.trRequestGoodsModal.filterInput.pO_TYPE;

        this.editTableGoodsDetail.resetNoAndPage();
        // updateView called
        this.editTableGoodsDetail.changePage(0);
        this.reloadTotalAmt();
    }

    onSelectBranch(branch: CM_BRANCH_ENTITY) {
        this.editTableGoodsDetail.currentItem.receivE_BRANCH = branch.brancH_ID;
        this.editTableGoodsDetail.currentItem.receivE_ADDR = branch.addr;
        this.editTableGoodsDetail.currentItem.receivE_BRANCH_NAME = branch.brancH_NAME;
    }

    showRequestGoods() {
        this.trRequestGoodsModal.filterInput.contracT_CODE = this.inputModel.contracT_CODE;
        this.trRequestGoodsModal.filterInput.contracT_ID = this.inputModel.contracT_ID;
        this.trRequestGoodsModal.show();
    }

    /* #region Common function */

    /** reload totalAmt for each item */
    reloadPoDetailTotalAmt(item: TR_PO_DETAIL_ENTITY) {
        var price = item.price || 0;
        var priceVat = item.pricE_VAT || 0;
        var quantity = item.quantity || 0;

        item.totaL_AMT = (price + priceVat) * quantity;
    }

    /**  reload % VAT */
    reloadPoDetailVat(item: TR_PO_DETAIL_ENTITY) {
        var priceVat = item.pricE_VAT || 0;
        var price = item.price || 0;
        item.vat = (priceVat * 100) / price;
    }

    /**  reload VAT */
    reloadPoDetailPriceVat(item: TR_PO_DETAIL_ENTITY) {
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
    reloadPoDetailRemainAmt(item: TR_PO_DETAIL_ENTITY) {
        item.remaiN_AMT = item.totaL_AMT - item.amounT_PAID;
    }

    /* #endregion */

    /* #region  Event Listener */

    onQuatityFocusOut(item: TR_PO_DETAIL_ENTITY) {
        this.reloadPoDetailTotalAmt(item);
        this.reloadPoDetailRemainAmt(item);
        this.reloadTotalAmt();
        this.updateView();
    }

    onUnitPriceFocusOut(item: TR_PO_DETAIL_ENTITY) {
        this.reloadPoDetailPriceVat(item);
        this.reloadPoDetailTotalAmt(item);
        this.reloadPoDetailRemainAmt(item);
        this.reloadTotalAmt();
        this.updateView();
    }

    onVatFocusOut(item: TR_PO_DETAIL_ENTITY) {
        this.reloadPoDetailPriceVat(item);
        this.reloadPoDetailTotalAmt(item);
        this.reloadPoDetailRemainAmt(item);
        this.reloadTotalAmt();
        this.updateView();
    }

    onPriceVatFocusOut(item: TR_PO_DETAIL_ENTITY) {
        this.reloadPoDetailVat(item);
        this.reloadPoDetailTotalAmt(item);
        this.reloadPoDetailRemainAmt(item);
        this.reloadTotalAmt();
        this.updateView();
    }

    onAmountPaidFocusOut(item: TR_PO_DETAIL_ENTITY) {
        this.reloadPoDetailRemainAmt(item);
        this.updateView();
    }

    /* #endregion */
}