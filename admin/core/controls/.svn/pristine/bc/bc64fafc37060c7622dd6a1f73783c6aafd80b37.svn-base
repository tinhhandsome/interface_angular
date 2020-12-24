import { Component, Input, OnInit, Injector, Output, AfterViewInit, EventEmitter } from "@angular/core";
import { createCustomInputControlValueAccessor, ControlComponent } from "@app/admin/core/controls/control.component";

@Component({
    selector: "checkbox-control",
    templateUrl: "./checkbox-control.component.html",
    providers: [createCustomInputControlValueAccessor(CheckboxControlComponent)]
})

export class CheckboxControlComponent extends ControlComponent implements OnInit {

    constructor(
        injector: Injector
    ) {
        super(injector);
        this.id = "ckbIdGlobal-" + this.generateUUID();

    }

    get readOnlyAttribute(){
        return this.readOnly? 'readonly' : '';
    }

    onChange() {
    }

    generateUUID() { // Public Domain/MIT
        var d = new Date().getTime();
        if (typeof performance !== 'undefined' && typeof performance.now === 'function') {
            d += performance.now(); //use high-precision timer if available
        }
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = (d + Math.random() * 16) % 16 | 0;
            d = Math.floor(d / 16);
            return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
        });
    }

    _ngModel: boolean;

    _checked: boolean;

    @Input() disabled: boolean;
    @Input() readOnly : boolean;

    @Input() TrueValue: any = 1;
    @Input() FalseValue: any = 0;

    @Output() onchange : EventEmitter<any> = new EventEmitter<any>();

    @Output() @Input() public get ngModel(): string {
        if (this._ngModel) {
            return this.TrueValue;
        }
        else {
            return this.FalseValue;
        }
    }
    public set ngModel(value) {
        this._ngModel = (value == this.TrueValue);
        this.inputRef.nativeElement.checked = this._ngModel;
    }

    checkedChange(checked) {
        this._ngModel = checked;
        this.sendValueOut(this.ngModel);
    }

    setNgModelValue(value) {
        this.ngModel = value;
    }

    updateControlView() {
        this.inputRef.nativeElement.checked = this._ngModel;
    }

    @Input() id: string;

    @Input() label: string;

    @Input() get checked(): boolean {
        return this.ngModel == this.TrueValue;
    }

    set checked(value) {
        this._checked = value;
        this._ngModel = value;
        this.sendValueOut(this.ngModel);
        this.inputRef.nativeElement.checked = value;
    }

    afterViewInit() {

    }

    ngOnInit(): void {
        if (!this._checked && !this._ngModel) {
            this.checked = false;
        }
    }
}