import { ViewChild, AfterViewInit, Injector, Output, EventEmitter, Input, ElementRef, AfterViewChecked, AfterContentInit, AfterContentChecked } from "@angular/core";
import { PopupFrameComponent } from "../controls/popup-frames/popup-frame.component";
import { ListComponentBase } from "@app/ultilities/list-component-base";

export class PopupBaseComponent<T> extends ListComponentBase<T> implements AfterViewInit, AfterViewChecked, AfterContentChecked {
    ngAfterContentChecked(): void {

    }
    ngAfterViewChecked(): void {

    }

    ngAfterContentInit() {
        super.ngAfterContentInit();
        if (!this.hideColumns)
            return;
        let scope = this;
        this.hideColumns.split(',').forEach(function (e) {
            let th = $(scope.dataTable.tableRef.nativeElement).find('thead>tr>th[sortField="' + e + '"]');
            th.hide();
        });
    }

    @ViewChild('popupFrame') popupFrame: PopupFrameComponent;

    currentItem: T;
    selectedItems: T[] = [];
    keyMember: string;
    checkAll: boolean;
    filterInput: T;

    ref: ElementRef;

    @Input() multiple: boolean;
    @Input() disableFields: string;
    @Input() hideFields: string;
    @Input() hideColumns: string;
    @Output() onSelect: EventEmitter<any> = new EventEmitter<any>();
    @Input() removeAllCheckOnShow: boolean = true;

    constructor(
        injector: Injector,
    ) {
        super(injector);
        this.multiple = true;
        this.idCheckbox = this.generateUUID();
        this.ref = injector.get(ElementRef);
    }

    idCheckbox: string;

    ngAfterViewInit(): void {
        // COMMENT: this.stopAutoUpdateView();

        // nhan phim enter de search
        var scope = this;
        // $(this.ref.nativeElement).find('.filter-form').find('input,textarea,select').on('keypress', function (e) {
        //     if (e.which == 13) {
        //         e.preventDefault();
        //         scope.search(true);
        //     }
        // });

        //
        if (this.disableFields) {
            this.disableFields.split(',').forEach(x => {
                $(this.ref.nativeElement).find('form.filter-form').find(`input[name=${x}],select[name=${x}],textarea[name=${x}],*[name=${x}]>input,*[name=${x}]>select`).prop('disabled', true);
            })
        }

        if (this.hideFields) {
            if (this.hideFields) {
                this.hideFields.split(',').forEach(x => {
                    $(this.ref.nativeElement).find('>popup-frame').find(`input[name=${x}],select[name=${x}],textarea[name=${x}],*[name=${x}]>input,*[name=${x}]>select`).closest('.form-group').parent().css('display', 'none');
                    $(this.ref.nativeElement).find('>popup-frame').find(`*[name=${x}]`).hide();
                })
            }
        }
    }

    accept() {
        if (!this.multiple) {
            this.onSelect.emit(this.currentItem);
            this.updateParentView();
            this.close();
        }
        else {
            this.onSelect.emit(this.selectedItems);
            this.updateParentView();
            this.close();
        }
    }

    async buttonSearch() {
        await this.search(true);
    }

    async search(copyFilterInput = false) {
        this.showTableLoading();
        this.popupFrame.waiting = true;

        if (copyFilterInput || !this.filterInputSearch) {
            this.copyFilterInput();
        }

        setTimeout(async () => {

            await this.getResult();
            this.popupFrame.waiting = false;
            // this.dataTable = null when page is edit-table
            if (this.dataTable) {
                this.dataTable.records.forEach(x => {
                    x['isChecked'] = this.isChecked(x);
                });
            }
            this.hideTableLoading();
            this.updateView();
        })
    }

    async getResult(checkAll: boolean = false): Promise<any> {

    }

    onDoubleClick(item: any): void {
        if (!this.multiple) {
            this.currentItem = item;
            this.onSelect.emit(this.currentItem);
            this.updateParentView();
            this.popupFrame.close();
        }
    }

    onSelectRow(item: any) {
        this.currentItem = item;
    }

    close() {
        this.popupFrame.close();
    }

    show() {
        if (this.dataTable && this.removeAllCheckOnShow) {
            this.checkAll = undefined;
            this.dataTable.records.forEach(x => {
                x['isChecked'] = false;
            })
            this.selectedItems = [];
        }

        $(this.ref.nativeElement).find('table input[type=checkbox]').each(function () {
            this.checked = false;
        })

        this.popupFrame.show();
        if (this.dataTable && this.dataTable['reloadPageOnInit']) {
            this.changePage(0);
        }
        this.updateView();
        // this.updateParentView();
    }

    isChecked(record): boolean {
        return this.selectedItems.filter(x => x[this.keyMember] == record[this.keyMember]).length > 0;
    }

    setChecked(checked, record: T) {
        (record as any).isChecked = checked;
        this.checkAll = false;
        if (checked && !this.isChecked(record)) {
            this.selectedItems.push(record);
            return;
        }
        this.selectedItems = this.selectedItems.filter(x => x[this.keyMember] != record[this.keyMember])
    }

    async onCheckAll(element) {
        this.checkAll = element.checked;
        $(element).closest('table').find('input[type="checkbox"').prop('checked', this.checkAll);
        this.dataTable.records.forEach(x => {
            x['isChecked'] = this.checkAll;
        })
        if (element.checked) {

            this.popupFrame.waiting = true;
            if (!this.filterInputSearch) {
                return;
            }
            var response = await this.getResult(true);
            this.popupFrame.waiting = false;

            this.dataTable.records.forEach(x => {
                x['isChecked'] = true;
            });
        }
        else {
            this.selectedItems = [];
        }

        this.updateView();
    }
}