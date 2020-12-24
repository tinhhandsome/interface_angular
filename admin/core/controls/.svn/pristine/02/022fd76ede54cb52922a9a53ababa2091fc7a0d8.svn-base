import { EventEmitter, Component, Input, OnInit, Output, ViewEncapsulation, Injector, ChangeDetectionStrategy, AfterViewChecked } from "@angular/core";
import { createCustomInputControlValueAccessor, ControlComponent } from "@app/admin/core/controls/control.component";
import { Vietnamese } from "flatpickr/dist/l10n/vn.js"
import * as moment from 'moment'
import { Key } from "selenium-webdriver";

declare var $: JQueryStatic;

@Component({
    selector: 'date-control',
    templateUrl: './custom-flatpickr.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,

    providers: [createCustomInputControlValueAccessor(CustomFlatpickrComponent)]
})
export class CustomFlatpickrComponent extends ControlComponent implements OnInit, AfterViewChecked {

    @Input() name: string;
    @Input() inpCss: string;
    @Input() disabled = false;

    @Input() hasTime = false;

    @Output() change: EventEmitter<any> = new EventEmitter<any>();

    _config: any;

    constructor(injector: Injector) {
        super(injector);
        this.config = {};
    }

    public get config() {
        return this._config;
    }
    @Input() public set config(value) {
        value['altInput'] = true;
        value['altFormat'] = this.s('gAMSProCore.DatePickerDisplayFormat');
        value['locale'] = Vietnamese;
        value['allowInput'] = true;
        value['dateFormat'] = this.s('gAMSProCore.DatePickerValueFormat');
        this._config = value;
    }

    _ngModel: any;

    @Input() @Output() public get ngModel(): any {
        return this._ngModel;
    }

    registerOnChange(fn: any) {
        var t = this;
        this.onChangeCallback = function (value) {
            if (!t.hasTime && value && value instanceof moment) {
                value = value['startOf']('day');
            }
            fn(value);
        }

        if (this.waitingValue) {
            this.onChangeCallback(this.waitingValue);
            this.waitingValue = undefined;
        }
    }

    setNgModelValue(value) {
        this.ngModel = value;
    }

    updateControlView() {
        //this.initValue();
    }

    ngAfterViewChecked(): void {
        if (!this.ngModel) {
            $(this.inputRef.nativeElement._flatpickr.altInput).val('');
        }
    }

    public set ngModel(value) {
        if (typeof (value) == 'string') {
            value = value['toMoment']();
        }
        if (value && !this.hasTime && value instanceof moment) {
            value = value['startOf']('day');
            this.sendValueOut(value);
        }
        this._ngModel = value;
        this.initValue();
    }

    initValue() {
        if (!this._ngModel) {
            if (!this.inputRef.nativeElement._flatpickr) {
                return;
            }
            this.inputRef.nativeElement._flatpickr
                .setDate(undefined);
        }
        if (this.inputRef.nativeElement._flatpickr && this._ngModel && typeof (this._ngModel) != 'string') {
            setTimeout(() => {
                if (this._ngModel) {
                    this.inputRef.nativeElement._flatpickr
                        .setDate(this._ngModel.format(this.s('gAMSProCore.DatePickerValueFormat')
                            .replace('d', 'DD')
                            .replace('m', 'MM')));
                }

            })
        }
    }

    getDisplayFormat() {
        return this.s('gAMSProCore.DatePickerDisplayFormat').replace('D', 'DD')
            .replace('M', 'MM')
            .replace('Y', 'YYYY')
            .replace('d', 'DD')
            .replace('m', 'MM')
            .replace('y', 'YYYY');
    }

    getDisplayFormat1() {
        return this.s('gAMSProCore.DatePickerDisplayFormat')
            .replace('Y', 'YYYY')
            .replace('d', 'D')
            .replace('m', 'M')
            .replace('y', 'YYYY');
    }

    onChange() {
        const input = <HTMLInputElement>this.inputRef.nativeElement;
        // get value from text area
        var newValue = input.value;

        if (!newValue) {
            newValue = '';
        }

        // update the form
        if (this.onChangeCallback) {
            if (this.waitingValue) {
                this.onChangeCallback(this.waitingValue);
                this.waitingValue = undefined;
            }
            else {
                var value = moment(newValue, this.s('gAMSProCore.DatePickerValueFormat')
                    .replace('D', 'DD')
                    .replace('M', 'MM')
                    .replace('Y', 'YYYY')
                    .replace('d', 'DD')
                    .replace('m', 'MM')
                    .replace('y', 'YYYY'));
                this.onChangeCallback(value);
                this.change.emit(this._ngModel);
            }
        }

        this.onChangeEvent.emit(this.inputRef);
        this.onChangeOverride(newValue);
    }


    // tu dong chon ngay khi nhap dung dinh dang
    afterViewInit() {
        $(this.inputRef.nativeElement._flatpickr.altInput).attr('placeholder', this.getDisplayFormat());
        var scope = this;
        $(this.inputRef.nativeElement._flatpickr.altInput).on('input', function () {
            let isDateValid = moment(this.value, scope.getDisplayFormat(), true).isValid() ||
                moment(this.value, scope.getDisplayFormat1(), true).isValid();
            if (isDateValid && this.value.length >= 10) {
                let keyEnter = {
                    view: window,
                    keyCode: 13,
                    bubbles: true,
                    cancelable: true,
                };
                const event = new KeyboardEvent('keydown', keyEnter);
                this.dispatchEvent(event);
                this.focus();
            }
        });

        $(this.inputRef.nativeElement._flatpickr.altInput).on('focusout', function () {
            let isDateValid = moment(this.value, scope.getDisplayFormat(), true).isValid() ||
                moment(this.value, scope.getDisplayFormat1(), true).isValid();


            if (isDateValid && this.value.length < 10) {
                let keyEnter = {
                    view: window,
                    keyCode: 13,
                    bubbles: true,
                    cancelable: true,
                };
                const event = new KeyboardEvent('keydown', keyEnter);
                this.dispatchEvent(event);
            }

            scope.sendValueOut(moment(this.value, scope.getDisplayFormat(), true));

            if (!isDateValid) {
                this.value = null;
                scope.inputRef.nativeElement._flatpickr.setDate(null);
                scope.sendValueOut(undefined);
            }
        });
    }

    ngOnInit(): void {
        $(this.inputRef.nativeElement).flatpickr(this._config);
        this.initValue();
    }
}
