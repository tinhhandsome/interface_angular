import { ComponentBase } from "@app/ultilities/component-base";
import { Injector, ChangeDetectorRef, ElementRef } from "@angular/core";

export class ChangeDetectionComponent extends ComponentBase {
    cdr: ChangeDetectorRef;
    ref: ElementRef;
    constructor(
        injector: Injector,
    ) {
        super(injector);
        this.cdr = injector.get(ChangeDetectorRef);
        this.ref = injector.get(ElementRef);
    }

    stopAutoUpdateView() {
        this.cdr.detach();
    }

    autoUpdateView() {
        this.cdr.reattach();

    }

    updateView() {
        // this.cdr.markForCheck();
        this.cdr.detectChanges();
    }

    updateParentView() {
        var par = this.cdr['_view'].parent;
        if (par && par.component && par.component.updateView) {
            par.component.updateView();
        }
    }

    setupValidationMessage() {

        this.ref.nativeElement.querySelectorAll('input[required], textarea[required],input[pattern],money-input[required]>input,date-control>input, input[hidden][required]~input').forEach(x => {
            var self = this;
            x['focusout'] = function () {
                if (self['isShowError']) {
                    self.updateView();
                }
            }
        });

        document.querySelectorAll('select2-custom[required],all-code-select[required]').forEach(x => {
            var self = this;
            $(x).on('select2:select', function (e) {
                if (self['isShowError']) {
                    self.updateView();
                }
            });
        });
    }
}