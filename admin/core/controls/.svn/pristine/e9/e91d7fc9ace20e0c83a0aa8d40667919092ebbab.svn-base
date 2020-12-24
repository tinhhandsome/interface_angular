import { Component, Input, OnInit, Output, ViewChild, EventEmitter, ElementRef, Injector, ChangeDetectionStrategy, AfterViewChecked, AfterContentChecked } from "@angular/core";
import { createCustomInputControlValueAccessor, ControlComponent } from "@app/admin/core/controls/control.component";

declare var $: JQueryStatic;

@Component({
    selector: 'select2-custom',
    templateUrl: './select2-custom.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [createCustomInputControlValueAccessor(Select2CustomComponent)]
})
export class Select2CustomComponent extends ControlComponent implements OnInit {
    constructor(
        injector: Injector,
        public ref: ElementRef
    ) {
        super(injector);
        this._disabled = false;
        this.changeSelect2OnLoad = true;
    }

    @ViewChild("control") inputRef: ElementRef;

    _list: Array<any>;
    _oldlist: Array<any>;
    _disabled: boolean;

    allowChangeSelect2: boolean;
    @Input() get changeSelect2OnLoad(): boolean {
        return this.allowChangeSelect2;
    }
    set changeSelect2OnLoad(value) {
        this.allowChangeSelect2 = value;
    }
    @Input() valueMember: string;
    @Input() displayMember: string;
    @Input() emptyText: string;
    @Input() inputCss: string;

    @Output() onChangeSelect2: EventEmitter<any> = new EventEmitter<any>();

    get isRequired(): boolean {
        return !(this.ref.nativeElement.getAttribute('required') == null) && !(this.ref.nativeElement.getAttribute('required') == undefined);
    }

    get disabled(): boolean {
        return this._disabled || !(this.ref.nativeElement.getAttribute('disabled') == null) && !(this.ref.nativeElement.getAttribute('disabled') == undefined);
    }


    @Input() set disabled(value: boolean) {
        this._disabled = value;
    }

    afterViewInit() {
        if (this.list && !this.ngModel && !this.isRequired && !this.isNull(this.emptyText)) {
            $(this.inputRef.nativeElement).val(''); // hungdv 29-10 them cho nhung du lieu set cung khong dung api de hien chu them tat ca
            this.refreshSelect2();// hungdv 29-10 
        }
        this.updateView();
    }


    _ngModel: any;

    public get ngModel(): any {
        if (!this._ngModel) {
            return '';
        }
        return this._ngModel;
    }

    @Input() public set ngModel(value) {
        var isValueChange = true;
        if (value == this._ngModel) {
            isValueChange = false;
        }

        // neu set value nhung chua co list set binh thuong
        if (!this._list) {
            this._ngModel = value ? value : '';
            return;
        }
        var val = this.getValue(value);
        if (this.isNull(value) || this.isNull(val)) { // khi gia tri duoc chon khong nam trong list
            // khi nguoi dung chon gia tri null
            if (this._ngModel && this._ngModel != value && this.allowChangeSelect2) {
                this.onChangeSelect2.emit(val);
                this.allowChangeSelect2 = true;
            }
            this._ngModel = '';
            $(this.inputRef.nativeElement).val(this._ngModel);
            this.refreshSelect2();
            if (this.onChangeCallback) {
                this.onChangeCallback(undefined);
            }
            this.updateView();
            // this.updateView.emit(null);
        }
        else { // khi gia tri duoc chon nam trong list
            this._ngModel = value;
            $(this.inputRef.nativeElement).val(value);
            this.refreshSelect2();

            if (isValueChange && this.allowChangeSelect2) {
                this.onChangeSelect2.emit(val);
                this.allowChangeSelect2 = true;
            }
        }
    }

    getValue(value) {
        if (!this._list) {
            return null;
        }

        for (var item of this._list) {
            if (item[this.valueMember] == value) {
                return item;
            }
        }

        return null;
    }


    setNgModelValue(value) {
        this.ngModel = value;
    }

    updateControlView() {
        this.inputRef.nativeElement.value = this._ngModel;
        if (this.list) {
            this.refreshSelect2();
        }
    }

    getDisplay(item) {
        if (item[this.valueMember] == null) {
            return this.emptyText;
        }

        if (item[this.valueMember] == ' ') {
            return item[this.displayMember.substr(this.displayMember.indexOf('|') + 1)];
        }

        return this.displayMember.split('|').map(x => item[x]).join(' - ');
    }

    public get list(): Array<any> {
        return this._list;
    }

    @Input() public set list(pList) {
        // neu truyen lai list cu vao
        if (pList == this._oldlist) {
            return;
        }
        // neu gia tri truyen vao = null
        if (!pList) {
            this._list = pList;
            return;
        }
        this._oldlist = pList;
        // kiem tra co bat buoc nhap khong
        if (!this.isRequired && !this.isNull(this.emptyText) && !this.isNull(this.emptyText.trim()) && !pList.filter(x => x[this.displayMember] == this.emptyText).length
        && !pList.filter(x => !x[this.valueMember]).length
        ) {
            var obj: any = {};
            obj[this.valueMember] = undefined;
            obj[this.displayMember] = this.emptyText;

            if (!pList) {
                pList = [obj];
            }
            else {
                pList.unshift(obj);
            }
        }
        else if (pList && (this.isRequired || this.isNull(this.emptyText))) {
            pList = pList.filter(x => !this.isNull(x[this.valueMember]))
        }

        this._list = pList;
        if (!this.ngModel) {
            this.updateView();
            return;
        }
        var val = this.getValue(this.ngModel);

        if (!val) { // neu gia tri khong nam trong list
            $(this.inputRef.nativeElement).val('');
            this.refreshSelect2();
            if (this.onChangeCallback) {
                this.onChangeCallback(undefined);
            }

        }
        else { // neu gia tri nam trong list
            if (this.allowChangeSelect2) {
                this.onChangeSelect2.emit(val);
                this.allowChangeSelect2 = true;
            }
        }
        this.updateView();
        // $(this.inputRef.nativeElement).trigger("change.select2")
        // this.updateView.emit(null);
    }

    createSelect2() {
        var scope = this;
        $(this.inputRef.nativeElement).select2({ width: '100%' }).on('select2:select', function (e) {
            var value = (e.currentTarget as any).value;
            scope.ngModel = value;
            if (scope.onChangeCallback) {
                scope.onChangeCallback(value);
            }
        });
    }

    refreshSelect2() {
        $(this.inputRef.nativeElement).trigger("change.select2");
    }

    ngOnInit(): void {
        // fix vu edit table khong hien thi data
        if (this._ngModel && !$(this.inputRef.nativeElement).val()) {
            var val = this.getValue(this.ngModel);
            if (val) {
                $(this.inputRef.nativeElement).val(this._ngModel);
            }
        }
        this.createSelect2();
    }

    setSingleValue(value, display) {
        this.valueMember = 'value';
        this.displayMember = 'display';
        if (value) {
            this.list = [
                {
                    value: value,
                    display: display
                }
            ]
            this.ngModel = value;
        }
    }

    setValueDisplay(list, valueMember, displayMember, isShowSelectedObject = true, showAllSelectedObjectLabel = this.l('AllSelectedObject'), joinSymbol = ';') {
        list = list.filter(x => x[valueMember]);
        this.valueMember = 'value';
        this.displayMember = 'display';
        if (list.length > 0) {
            list.forEach(function (x) {
                x.value = x[valueMember];
                x.display = x[displayMember];
            });

            var allObject = {
                value: list.map(x => x.value).join(joinSymbol) + joinSymbol,
                display: showAllSelectedObjectLabel
            };

            if (isShowSelectedObject) {
                // append {allObject} to first
                list.splice(0, 0, allObject)
            }

            this.list = list;
            if (isShowSelectedObject) {
                if (list.length == 3) {
                    this.ngModel = list[2].value;
                }
                else {
                    this.ngModel = allObject.value;
                }
            }
            else if (list.length == 2) {
                this.ngModel = list[1].value;
            }

            this.updateView();
        }
    }
}
