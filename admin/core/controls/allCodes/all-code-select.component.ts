import { EventEmitter, Component, Input, OnInit, Injector, Output, ElementRef } from "@angular/core";
import { createCustomInputControlValueAccessor, ControlComponent } from "@app/admin/core/controls/control.component";
import { CM_ALLCODE_ENTITY, AllCodeServiceProxy } from "@shared/service-proxies/service-proxies";
import { Select2CustomComponent } from "../custom-select2/select2-custom.component";

@Component({
    selector: "all-code-select",
    templateUrl: "../custom-select2/select2-custom.component.html",
    providers: [createCustomInputControlValueAccessor(AllCodeSelectComponent)]
})
export class AllCodeSelectComponent extends Select2CustomComponent {
    @Input() cdName: string;
    @Input() cdType: string;
    @Output() onSetListSuccess: EventEmitter<any> = new EventEmitter<any>();

    _ngModel: string;

    static allCodeMap: Map<string, any> = new Map<string, any>();

    static waitingSetList: Map<string, any> = new Map<string, any>();

    constructor(
        injector: Injector,
        private allCodeService: AllCodeServiceProxy,
        ref: ElementRef
    ) {
        super(injector, ref);
        this.displayMember = 'content';
        this.valueMember = 'cdval';
    }

    afterViewInit() {
        this.refreshList();
        super.afterViewInit();
    }

    refreshList() {
        let allCodeMap = AllCodeSelectComponent.allCodeMap;
        let waitingSetList = AllCodeSelectComponent.waitingSetList;

        let key = (this.cdName || '') + '|' + (this.cdType || '');
        if (!allCodeMap.has(key)) {
            allCodeMap.set(key, 0);
            this.allCodeService.cM_ALLCODE_GetByCDNAME(this.cdName, this.cdType).subscribe(response => {
                this.list = response;
                this.onSetListSuccess.emit(response);
                allCodeMap.set(key, [...response]);

                let waiting = waitingSetList.get(key);
                waiting.forEach(f => {
                    f();
                });

                waitingSetList.delete(key);
            });
        }

        let val = allCodeMap.get(key);

        if (val != 0) {
            setTimeout(()=>{
                this.list = allCodeMap.get(key).filter(x => x.cdval);
            })
            return;
        }

        let waitingValue = waitingSetList.get(key);

        if (!waitingValue) {
            waitingValue = [];
        }

        let component = this;
        waitingValue.push(function () {
            component.list = allCodeMap.get(key)
            component.onSetListSuccess.emit(component.list);
        });

        waitingSetList.set(key, waitingValue);

    }

    refreshSelect2() {
        $(this.inputRef.nativeElement).trigger("change.select2");
    }
}