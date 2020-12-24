import { EventEmitter, Component, ViewEncapsulation, Injector, Input, ViewChild, Output, ElementRef } from "@angular/core";
import { ComponentBase } from "@app/ultilities/component-base";
import { ModalDirective } from "ngx-bootstrap";

@Component({
    selector: "popup-frame",
    templateUrl: "./popup-frame.component.html",
    encapsulation: ViewEncapsulation.None
})
export class PopupFrameComponent extends ComponentBase {

    @ViewChild('popupFrameModal') modal: ModalDirective;

    @Output() onSelectEvent : EventEmitter<any> = new EventEmitter<any>();
    @Output() onCancelEvent : EventEmitter<any> = new EventEmitter<any>();
    @Output() onSearchEvent : EventEmitter<any> = new EventEmitter<any>();

    @Input() title: string;

    waiting: boolean;
    active: boolean = false;

    @Input() showSearchButton : boolean = true;

    onShowEvent : EventEmitter<any> = new EventEmitter<any>();

    ;

    constructor(injector: Injector,
        public ref : ElementRef) {
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

    onSelect(){
        this.onSelectEvent.emit(null);
        this.close();
    }

    onSearch(){
        this.onSearchEvent.emit(null);
    }

    onCancel(){
        this.onCancelEvent.emit(null);
        this.close();
    }
}