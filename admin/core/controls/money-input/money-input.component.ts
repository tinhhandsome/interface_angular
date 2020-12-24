import { EventEmitter, Component, Input, OnInit, Injector, ViewEncapsulation, Output } from "@angular/core";
import { createCustomInputControlValueAccessor, ControlComponent } from "@app/admin/core/controls/control.component";
import { DepartmentServiceProxy, CM_DEPARTMENT_ENTITY } from "@shared/service-proxies/service-proxies";


declare var $: JQueryStatic;

@Component({
    selector: "money-input",
    templateUrl: "./money-input.component.html",
    encapsulation: ViewEncapsulation.None,
    providers: [createCustomInputControlValueAccessor(MoneyInputComponent)]
})

export class MoneyInputComponent extends ControlComponent implements OnInit {

    @Output() onMoneyValueChange: EventEmitter<number> = new EventEmitter<number>();
    @Output() focusout: EventEmitter<any> = new EventEmitter<any>();
    @Input() disabled = false;
    @Input() isNegative = false;
    @Input() isDecimal = false;

    @Input() inputCss: string = 'form-control';

    _ngModel: string;


    afterViewInit() {
    }

    moneyTextToNumber(moneyText) {
        if (this.isDecimal) {
            return super.moneyTextToNumberF(moneyText);
        }
        else {
            return super.moneyTextToNumber(moneyText);
        }
    }

    setNgModelValue(value) {
        this.ngModel = value;
    }

    updateControlView() {
        this.inputRef.nativeElement.value = this._ngModel;
    }

    public get ngModel(): any {
        return this.moneyTextToNumber(this._ngModel);
    }

    @Input() @Output() public set ngModel(value) {
        this._ngModel = this.formatMoney(value);
    }

    onFocusOut(event) {
        var value = parseInt(event.target.value.replaceAll(',', ''));
        if (value < 0 && !this.isNegative) {
            this.ngModel = 0;
            event.target.value = 0;
        }
        this._ngModel = event.target.value;
        this.onChangeCallback(this.ngModel);
        this.onMoneyValueChange.emit(event);
        this.focusout.emit(event);
    }

    constructor(
        injector: Injector
    ) {
        super(injector)
    }

    ngOnInit(): void {
    }

}