import { Component, forwardRef, ViewChild, ElementRef, OnInit, Injector, AfterViewInit, Input, Output, EventEmitter } from '@angular/core';
import { NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';
import { ComponentBase } from '../../../ultilities/component-base';
import { ChangeDetectionComponent } from '../ultils/change-detection.component';
declare var $: JQueryStatic;

export function createCustomInputControlValueAccessor(extendedInputComponent: any) {
    return {
        provide: NG_VALUE_ACCESSOR,
        useExisting: forwardRef(() => extendedInputComponent),
        multi: true
    };
}

@Component({
    template: ''
})
export class ControlComponent extends ChangeDetectionComponent implements ControlValueAccessor, AfterViewInit {

    constructor(injector: Injector) {
        super(injector);
    }

    @ViewChild('control') inputRef: ElementRef;

    @Output() onChangeEvent: EventEmitter<any> = new EventEmitter<any>();

    waitingValue: any;

    sendValueOut(value) {
        if (this.onChangeCallback) {
            this.onChangeCallback(value);
        }
        else {
            this.waitingValue = value;
        }
    }


    // The internal data model
    public innerValue: any = '';

    // Placeholders for the callbacks which are later provided
    // by the Control Value Accessor
    protected onChangeCallback: any;

    protected onChangeOverride(value) {

    }

    setNgModelValue(value) {

    }

    updateControlView() {

    }

    // implements ControlValueAccessor interface
    writeValue(value: any) {
        if (!value) {
            this.innerValue = '';
        }
        else if (value !== this.innerValue) {
            this.innerValue = value;
        }

        this.setNgModelValue(value);
        this.updateControlView();
    }
    // implements ControlValueAccessor interface
    registerOnChange(fn: any) {
        this.onChangeCallback = fn;
        if (this.waitingValue) {
            this.onChangeCallback(this.waitingValue);
        }
    }

    // implements ControlValueAccessor interface - not used, used for touch input
    registerOnTouched() { }

    // change events from the textarea
    protected onChange() {
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
            }
            else {
                this.onChangeCallback(newValue);
            }
        }

        this.onChangeEvent.emit(this.inputRef);
        this.onChangeOverride(newValue);
    }

    afterViewInit() {

    }

    ngAfterViewInit() {
        const inputElement = <HTMLInputElement>this.inputRef.nativeElement;
        inputElement.onchange = () => this.onChange();
        inputElement.onkeyup = () => this.onChange();
        this.afterViewInit();
    }
}