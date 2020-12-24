import { EventEmitter, Component, ViewEncapsulation, Injector, Input, ViewChild, Output, ElementRef } from "@angular/core";
import { ComponentBase } from "@app/ultilities/component-base";
import { ModalDirective } from "ngx-bootstrap";

@Component({
    selector: "reject-modal",
    templateUrl: "./reject-modal.component.html",
    encapsulation: ViewEncapsulation.None
})
export class RejectModalComponent extends ComponentBase {

    @ViewChild('rejectModal') modal: ModalDirective;
    @ViewChild('editForm') editForm: ElementRef;

    @Output() onSubmitEvent : EventEmitter<string> = new EventEmitter<string>();
    @Output() onCancelEvent : EventEmitter<any> = new EventEmitter<any>();

    @Input() title: string;

    notes: string;
    isShowError = false;

    waiting: boolean;
    active: boolean = false;

    onShowEvent : EventEmitter<any> = new EventEmitter<any>();

    constructor(injector: Injector) {
        super(injector);
    }

    show() {
        this.active = true;
        this.modal.show();
    }

    onShown() {
        this.onShowEvent.emit(null);
    }

    close() {
        this.active = false;
        this.modal.hide();
    }

    onSubmit(){
        if ((this.editForm as any).form.invalid) {
            this.isShowError = true;
            return;
        }
        this.onSubmitEvent.emit(this.notes);
        this.notes = '';
        this.isShowError = false;
        this.close();
    }

    onCancel(){
        this.onCancelEvent.emit(null);
        this.close();
    }
}