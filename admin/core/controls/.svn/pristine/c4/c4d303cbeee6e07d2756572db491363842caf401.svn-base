import { Component, Input, OnInit, Injector, Output, AfterViewInit } from "@angular/core";
import { createCustomInputControlValueAccessor, ControlComponent } from "@app/admin/core/controls/control.component";
import { CM_ALLCODE_ENTITY, AllCodeServiceProxy } from "@shared/service-proxies/service-proxies";

@Component({
    selector: "radio-control",
    templateUrl: "./radio-control.component.html",
    providers: [createCustomInputControlValueAccessor(RadioControlComponent)]
})

export class RadioControlComponent extends ControlComponent implements OnInit {

    constructor(
        injector: Injector
    ) {
        super(injector);
        this.id = "rdIdGlobal-" + this.generateUUID();
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

    @Input() TrueValue: any = 1;
    @Input() FalseValue: any = 0;

    @Input() nameInput = '';

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

        if (checked) {
            $(`input[type="radio"][name="${this.nameInput}"]:not(input[id="${this.id}"])`).trigger("deselect");
        }
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
        var scope = this;
        $(this.inputRef.nativeElement).bind("deselect", function () {
            scope.checkedChange(false);
        });
    }

    ngOnInit(): void {
        if (!this._checked) {
            if (!this._ngModel) {
                this._ngModel = false;
            }
            this.checked = this._ngModel;
        }
    }
}