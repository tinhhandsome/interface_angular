import { ViewEncapsulation, Component, Injector, ChangeDetectorRef, ViewChild, Input, AfterViewInit } from "@angular/core";
import { appModuleAnimation } from "@shared/animations/routerTransition";
import { EditableTableComponent } from "@app/admin/core/controls/editable-table/editable-table.component";
import { TR_PO_PAYMENT_ENTITY, TR_PO_MASTER_ENTITY, TradePoMasterServiceProxy } from "@shared/service-proxies/service-proxies";
import { EditPageState } from "@app/ultilities/enum/edit-page-state";
import { NgForm } from "@angular/forms";
import { ChangeDetectionComponent } from "@app/admin/core/ultils/change-detection.component";

@Component({
    selector: 'po-payment-editable',
    templateUrl: './po-payment-editable.component.html',
    encapsulation: ViewEncapsulation.None,
    animations: [appModuleAnimation()]
})
export class PoPaymentEditableComponent extends ChangeDetectionComponent implements AfterViewInit {

    constructor(
        injector: Injector,
        private tradePoMasterService: TradePoMasterServiceProxy,
    ) {
        super(injector);
    }

    @Input() totalAmt: number;


    @ViewChild('editTablePoPayment') editTablePoPayment: EditableTableComponent<TR_PO_PAYMENT_ENTITY>;

    reloadList() {

    }

    ngAfterViewInit(): void {
        // COMMENT: this.stopAutoUpdateView();
    }

    @Input() inputModel: TR_PO_MASTER_ENTITY;
    @Input() disableInput: boolean;
    @Input() isShowError: boolean;
    @Input() editPageState: EditPageState;

    @Input() editForm: NgForm;

    @ViewChild('poPaymentForm') poPaymentForm: NgForm;


    /* #region  Bảng con: lịch thanh toán */

    addNewTrPoPayment() {
        var item = this.editTablePoPayment.addNewItem();
        item.paY_PHASE = item.no.toString();
        item.percent = 0;
        item.amount = 0;
        this.updateView();
    }

    updateViewItem(item: TR_PO_PAYMENT_ENTITY, propName) {
        let index = this.editTablePoPayment.dataInPage.indexOf(item);
        let nameOfItem = propName + '-' + index + '-2';
        this.poPaymentForm.controls[nameOfItem].setValue(item[propName]);
    }

    percent_change(item: TR_PO_PAYMENT_ENTITY) {
        this.reloadPaymentAmount(item);
        this.updateViewItem(item, 'amount');
    }

    amount_change(item: TR_PO_PAYMENT_ENTITY) {
        this.reloadPaymentPercent(item);
        this.updateViewItem(item, 'percent');
        this.updateViewItem(item, 'amount');
    }

    reloadPaymentPercent(item: TR_PO_PAYMENT_ENTITY) {
        item.percent = this.round(item.amount / this.totalAmt) || 0;
    }

    reloadPaymentAmount(item: TR_PO_PAYMENT_ENTITY) {
        item.amount = Math.round(this.totalAmt * item.percent / 100 || 0);
    }

    reloadItem(item: TR_PO_PAYMENT_ENTITY) {
        item.percent = this.round(item.percent);
        this.reloadPaymentAmount(item);
    }

    reloadAllPaymentAmount() {
        (this.editTablePoPayment.allData || []).forEach(item => {
            item.percent = this.round(item.percent);
            item.amount = Math.round((this.totalAmt * item.percent / 100.0) || 0);
        });
        this.updateView();
    }


    /* #endregion */
}