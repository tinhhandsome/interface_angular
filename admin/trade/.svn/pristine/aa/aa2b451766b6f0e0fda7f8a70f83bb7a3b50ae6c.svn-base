import { ViewEncapsulation, Component, Injector, ChangeDetectorRef, ViewChild, Input, AfterViewInit } from "@angular/core";
import { appModuleAnimation } from "@shared/animations/routerTransition";
import { EditableTableComponent } from "@app/admin/core/controls/editable-table/editable-table.component";
import { TR_PO_PAYMENT_ENTITY, TR_PO_REPAIR_ENTITY, TradePoRepairServiceProxy } from "@shared/service-proxies/service-proxies";
import { EditPageState } from "@app/ultilities/enum/edit-page-state";
import { NgForm } from "@angular/forms";
import { ChangeDetectionComponent } from "@app/admin/core/ultils/change-detection.component";

@Component({
    selector: 'po-repair-payment-editable',
    templateUrl: './po-repair-payment-editable.component.html',
    encapsulation: ViewEncapsulation.None,
    animations: [appModuleAnimation()]
})
export class PoRepairPaymentEditableComponent extends ChangeDetectionComponent implements AfterViewInit {

    constructor(
        injector: Injector,
        private tradePoRepairService: TradePoRepairServiceProxy,
    ) {
        super(injector);
    }

    @Input() totalAmt: number;


    @ViewChild('editTablePoRepairPayment') editTablePoRepairPayment: EditableTableComponent<TR_PO_PAYMENT_ENTITY>;

    reloadList() {

    }

    ngAfterViewInit(): void {
        // COMMENT: this.stopAutoUpdateView();
    }

    @Input() inputModel: TR_PO_REPAIR_ENTITY;
    @Input() disableInput: boolean;
    @Input() isShowError: boolean;
    @Input() editPageState: EditPageState;

    @Input() editForm: NgForm;


    /* #region  Bảng con: lịch thanh toán */

    addNewTrPoRepairPayment() {
        var item = this.editTablePoRepairPayment.addNewItem();
        item.paY_PHASE = item.no.toString();
        item.percent = 0;
        item.amount = 0;
        this.updateView();
    }

    reloadPaymentPercent(item: TR_PO_PAYMENT_ENTITY) {
        item.percent = this.round(item.amount * 100 / this.totalAmt) || 0;
        this.updateView();
    }

    reloadPaymentAmount(item: TR_PO_PAYMENT_ENTITY) {
        item.percent = this.round(item.percent);
        item.amount = Math.round((this.totalAmt * item.percent / 100.0) || 0);
        this.updateView();
    }

    reloadAllPaymentAmount() {
        (this.editTablePoRepairPayment.allData || []).forEach(item => {
            item.percent = this.round(item.percent);
            item.amount = Math.round((this.totalAmt * item.percent / 100.0) || 0);
        });
        this.updateView();
    }


    /* #endregion */
}