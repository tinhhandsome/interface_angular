import { Component, ViewEncapsulation, ViewChild, ElementRef, AfterContentChecked, AfterViewInit, Output, EventEmitter, ChangeDetectorRef, OnInit, Input, NgZone } from "@angular/core";
import { LocalizationService } from "abp-ng2-module/dist/src/localization/localization.service";
import { Paginator2Component } from "../p-paginator2/p-paginator2.component";
import { EditTableState } from "./editable-state.component";
import { NgForm, FormControl } from "@angular/forms";

@Component({
    selector: "editable-table",
    templateUrl: "./editable-table.component.html",
    styleUrls: ["./editable-table.component.css"],
    encapsulation: ViewEncapsulation.None
})
export class EditableTableComponent<T extends Object> implements AfterViewInit, AfterContentChecked, OnInit {


    @ViewChild('table') table: ElementRef;

    @Input() editTableName: string;
    @Input() ngForm: NgForm;

    _tableState: EditTableState;

    get tableState() {
        return this._tableState;
    }

    set tableState(value) {
        this._tableState = value;
        if (this._tableState && this._tableState.editTables.indexOf(this) == -1) {
            this._tableState.editTables.push(this);
        }
    }

    validations: any = [];
    _requiredFields: string[] = [];

    @Input() get requiredFields(): string[] {
        return this._requiredFields;
    }

    isNull(value) {
        if (value === 0) {
            return false;
        }
        return !value;
    }

    set requiredFields(val: string[]) {
        if ($(this.table.nativeElement).find('>thead>tr>th').length > 0) {
            if (!this.tableState.isInitRequiredField) {
                this.initRequiredFieldsHeader();
            }
        }
        this._requiredFields = val;

        if (this._requiredFields) {
            this._requiredFields.forEach(x => {
                this.validations.push({
                    message: this.l('ValidationRequired'),
                    field: x,
                    checkValid: (context) => {
                        if (this.isNull(context[x])) {
                            return false;
                        }
                        return true;
                    }
                })
            })
        }
    }

    ngOnInit(): void {
        let oldUpdateVali = FormControl.prototype.updateValueAndValidity;
        let scope = this;
        FormControl.prototype.updateValueAndValidity = function (opts) {
            if (scope.ngForm) {
                let controls = Object.values(scope.ngForm.controls);
                if (controls.indexOf(this) >= 0) {
                    return;
                }
            }
            oldUpdateVali.call(this, opts);
        }
    }

    getValidationMessage() {
        this.tableState.showErrorOnPage = true;
        this.checkShowErrorOnPage();
        let validationMessages = [];
        for (let i = 0; i < this.tableState.allData.length; i++) {
            let item = this.tableState.allData[i];
            validationMessages = [];
            this.validations.forEach(v => {
                if (!v.checkValid(item)) {
                    let elem = $(this.table.nativeElement).find(`>thead>tr>th[sortField="${v.field}"]>span`);
                    if (elem.length) {
                        var headerText = elem.text();
                        if (headerText) {
                            validationMessages.push(headerText + ' ' + v.message);
                        }
                    }
                }
            });
            if (validationMessages.length > 0) {
                return this.l('Line') + ' ' + (i + 1) + ': ' + validationMessages.join('<br>');
            }
        }
        return undefined;
    }

    checkShowErrorOnPage() {
        if (!this.tableState.showErrorOnPage) {
            return;
        }
        for (let i = 0; i < this.dataInPage.length; i++) {
            let item = this.dataInPage[i];
            this.validations.forEach(v => {
                if (!v.checkValid(item)) {
                    let indexTh = $(this.table.nativeElement).find(`>thead>tr>th[sortField="${v.field}"]`).index();
                    $($($(this.table.nativeElement).find('>tbody>tr')[i]).find('>td')[indexTh]).addClass('error');
                }
            });
        }
    }

    isLoading: boolean;

    @Output() onSort: EventEmitter<any> = new EventEmitter<any>();
    @Output() onSelectRow: EventEmitter<T> = new EventEmitter<T>();

    @ViewChild('paginator') paginator: Paginator2Component;

    constructor(
        private cdr: ChangeDetectorRef,
        private ref: ElementRef,
        private localization: LocalizationService,
        private ngZone: NgZone
    ) {
        // this.itemsPerPage = this.defaultRecordsCountPerPage;
        this.tableState = new EditTableState();
        this.tableState.currentPage = 0;
        this.idCheckbox = this.generateUUID();
        this.tableState.editTables.push(this);
    }

    updateView() {
        this.cdr.detectChanges();
    }

    /** Tạo random id */
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

    l(key: string, ...args: any[]): string {
        args.unshift(key);
        args.unshift(this.tableState.localizationSourceName);
        return this.ls.apply(this, args);
    }

    ls(sourcename: string, key: string, ...args: any[]): string {
        let localizedText = this.localization.localize(key, sourcename);

        if (!localizedText) {
            localizedText = key;
        }

        if (!args || !args.length) {
            return localizedText;
        }

        args.unshift(localizedText);
        return abp.utils.formatString.apply(this, args);
    }

    updateParentView(preventChildUpdateView = false) {
        var par = this.cdr['_view'].parent;
        if (par && par.component && par.component.updateView) {
            par.component.updateView(true, preventChildUpdateView);
        }
    }

    initRequiredFieldsHeader() {
        if (this.requiredFields.length == 0 || $(this.table.nativeElement).find('>thead>tr>th').length == 0) {
            return;
        }
        this.requiredFields.forEach(x => {
            $(this.table.nativeElement).find(`>thead>tr>th[sortField="${x}"]`).addClass('required');
        });
        this.tableState.isInitRequiredField = true;
    }

    idCheckbox: string;

    ngAfterContentChecked(): void {
        $(this.table.nativeElement).find('tbody tr textarea:not([rows])').attr('rows', 1);

        setTimeout(() => {

            if (this.requiredFields.length > 0) {
                if (!this.tableState.isInitRequiredField) {
                    this.initRequiredFieldsHeader();
                }
            }
            if (!$(this.table.nativeElement).find('tbody>tr>td>span.mobile-header').length) {
                this.resetResponsiveLayout();
            }

            var is_ctrl_pressed = false;
            $(this.ref.nativeElement).find('td input.label, td .label>input').on('keydown', function (e) {
                var code = e.which;
                if ((code > 47 && code < 59) || (code > 95 && code < 106) || (is_ctrl_pressed && (code == 67))) {
                    return true;
                } else if (code == 17) {
                    is_ctrl_pressed = true;
                } else {
                    return false;
                }
            });
            $(this.ref.nativeElement).find('td input.label, td .label>input').on('keyup', function (e) {
                if (e.which == 17) {
                    is_ctrl_pressed = false;
                }
            });


            var scope = this;
            $(this.ref.nativeElement).find('input,select,textarea').on('focusout', function () {
                var td = $(this).closest('td');
                if (td.hasClass('error')) {
                    td.removeClass('error');
                }
            })

            var scope = this;

            $(this.table.nativeElement).find('tbody>tr>td input[type="number"]').focusout(function (evt) {

            })


            let colIndexToWidth = {};

            $(this.table.nativeElement).find('thead>tr>th').each(function () {
                let index = $(this).parent().index();
                let width = $(this).width();
                colIndexToWidth[index] = width;
            })

            $(this.table.nativeElement).find('tbody>tr>td').each(function (index, value) {
                if ($(value).find(':input').length == 0) {
                    var textContent = '';
                    textContent = $(value)
                        .clone()
                        .children()
                        .remove()
                        .end()
                        .text();
                    var colWidth = $(value).width();
                    if (colWidth / textContent.length < 10) {
                        $(value).tooltip({
                            items: "td, span",
                            content: textContent,
                            close: function (event, ui) {
                                $(".ui-tooltip").remove();
                            },
                            hide: false,

                            tooltipClass: "custom_tooltip"
                        });
                    }
                }
                else {
                    // var textContent = $(value)
                    //     .clone()
                    //     .children()
                    //     .remove()
                    //     .end()
                    //     .text();
                    var textContent = '';
                    textContent = $(value).find(':input:first')[0].value;
                    var colWidth = $(value).width();
                    if (colWidth / textContent.length < 10) {
                        $(value).tooltip({
                            items: "td, input",
                            content: textContent,
                            close: function (event, ui) {
                                $(".ui-tooltip").remove();
                            },
                            hide: false,

                            tooltipClass: "custom_tooltip"
                        });
                    }
                }
            });
        });

    }

    ngAfterViewInit(): void {
        var table = this.table.nativeElement;
        var scope = this;
        this.paginator.rows = this.tableState.defaultRecordsCountPerPage;
        $(table).find('thead>tr>th[sortfield]').each(function () {
            $(this).click(function () {
                scope.onClickSortColumn(this);
            });
        });

        if (!this.tableState.allData.length) {
            $(this.table.nativeElement).parent().addClass('no-data');
        }
        else {
            $(this.table.nativeElement).parent().removeClass('no-data');
        }
    }

    onClickSortColumn(thElement) {
        var table = this.table.nativeElement;
        $(table).find('thead>tr>th[sortfield]').each(function () {
            if (this != thElement) {
                $(this).removeClass('sort-desc').removeClass('sort-asc')
            }
        });

        let pageSize = Math.min(this.tableState.defaultRecordsCountPerPage, this.tableState.allData.length);
        let page = this.tableState.currentPage;

        var sortField = $(thElement).attr('sortfield');
        if ($(thElement).hasClass('sort-asc')) {

            console.log('sort-desc');
            $(thElement).removeClass('sort-asc');
            $(thElement).addClass('sort-desc');



            // let newData = this.tableState.allData.map(function (x) { return { ...x } });
            // this.tableState.allData.length = 0;

            // newData.sort(this.sortDesc(sortField));
            // this.tableState.allData = newData;

            this.tableState.allData.sort(EditableTableComponent.sortDesc(sortField));
            this.resetNoAndPage();

            for (var i = page; i < page + pageSize; i++) {
                let toJson = this.tableState.allData[i]['toJSON']
                this.tableState.allData[i] = { ...this.tableState.allData[i] };
                this.tableState.allData[i]['toJSON'] = toJson;
            }

            this.changePage(this.tableState.currentPage);
            // setTimeout(() => {
            //     this.changePage(this.tableState.currentPage);
            // })

            this.onSort.emit('desc');
        }
        else {

            $(thElement).removeClass('sort-desc');
            $(thElement).addClass('sort-asc');
            console.log('sort-asc');

            // let newData = this.tableState.allData.map(function (x) { return { ...x } });
            // this.tableState.allData.length = 0;

            // newData.sort(this.sortAsc(sortField));
            // this.tableState.allData = newData;
            this.tableState.allData.sort(EditableTableComponent.sortAsc(sortField));
            this.resetNoAndPage();

            for (var i = page; i < page + pageSize; i++) {
                let toJson = this.tableState.allData[i]['toJSON']
                this.tableState.allData[i] = { ...this.tableState.allData[i] };
                this.tableState.allData[i]['toJSON'] = toJson;
            }

            this.changePage(this.tableState.currentPage);

            // setTimeout(() => {
            //     this.changePage(this.tableState.currentPage);
            // })

            this.onSort.emit('asc');
        }

        // this.updateParentView();
    }

    static sortDesc(sortField) {
        return function (x1, x2) {
            if (!x1[sortField] && x1[sortField] != 0) {
                return -1;
            }

            if (!x2[sortField] && x2[sortField] != 0) {
                return 1;
            }

            if (x1[sortField] >= x2[sortField]) {
                return -1;
            }
            return 1;
        }
    }

    static sortAsc(sortField) {
        return function (x1, x2) {
            if (!x1[sortField] && x1[sortField] != 0) {
                return 1;
            }

            if (!x2[sortField] && x2[sortField] != 0) {
                return -1;
            }

            if (x1[sortField] > x2[sortField]) {
                return 1;
            }
            return -1;
        }
    }

    name(fieldName: string, index: number): string {
        return `${fieldName}-${index}-${this.editTableName}`;
    }

    setList(list: any[], page = 0) {
        this.tableState.allData = list;
        this.resetNoAndPage();
        this.changePage(page);
        this.updateParentView();

        // this.tableState.editTables.forEach(x => {
        //     if (x != this) {
        //         x.cdr.detectChanges();
        //     }
        // })
    }

    resetNoAndPage() {
        console.log('resetNoAndPage');
        for (var i = 0; i < this.tableState.allData.length; i++) {
            var item = this.tableState.allData[i] as any;
            item.no = i + 1;
            item.page = ~~(i / this.paginator.rows);
        }

        if (!this.tableState.allData.length) {
            $(this.table.nativeElement).parent().addClass('no-data');
        }
        else {
            $(this.table.nativeElement).parent().removeClass('no-data');
        }
    }

    pushItem(item: any) {
        this.tableState.allData.push(item);
        item.no = this.tableState.allData.length;
        item.page = ~~((this.tableState.allData.length - 1) / this.paginator.rows);
        if (!this.tableState.pageData) {
            this.tableState.pageData = this.tableState.allData.filter(x => (x as any).page == this.tableState.currentPage);
        }
        else if (item.page == this.tableState.currentPage) {
            this.tableState.pageData.push(item);
        }
        $(this.table.nativeElement).parent().removeClass('no-data');
    }

    addNewItem(): T {
        let obj = {} as T;

        obj['toJSON'] = function () {
            let data = {};
            let scope = this;
            Object.keys(this).filter(x => x != "toJSON").forEach(function (k) {
                if (k) {
                    data[k] = scope[k];
                }
            })
            return data;
        }

        this.pushItem(obj);

        this.updateParentView();

        return obj;

    }

    getAllCheckedItem(): T[] {
        return this.tableState.allData.filter(x => x['isChecked']);
    }

    removeAllCheckedItem() {
        this.allData = this.allData.filter(x => !x['isChecked']);
        this.resetNoAndPage();
        this.changePage(this.currentPage);
    }

    public get dataInPage(): T[] {
        return this.tableState.pageData;
    }

    public get isCheckAll() {
        return this.tableState.isCheckAll;
    }
    public get currentPage() {
        return this.tableState.currentPage;
    }
    public get allData(): T[] {
        return this.tableState.allData;
    }
    public set allData(value: T[]) {
        this.tableState.allData = value;
    }
    public get currentItem() {
        return this.tableState.currentItem;
    }
    /** parent view updated */
    changePage(page, force: boolean = true, updateView = false, updateInput = true) {
        console.log('changePage');
        if (!force && this.tableState.currentPage == page) {
            return;
        }
        // console.time('EditTable Change Page');

        this.tableState.currentPage = page;
        if (this.tableState.pageData) {
            this.tableState.pageData.length = 0;
        }
        let pageSize = this.tableState.defaultRecordsCountPerPage;
        this.tableState.pageData = this.tableState.allData.slice(page * pageSize, page * pageSize + pageSize);
        if (this.ngForm && !updateView) {
            if (updateInput) {
                this.updateInputField();
            }
            this.tableState.editTables.filter(x => x).forEach(x => {
                setTimeout(() => {
                    x.cdr.detectChanges();
                })
            });
        }
        else {
            setTimeout(() => {
                this.updateParentView();
            })
        }
        this.checkShowErrorOnPage();
        // console.timeEnd('EditTable Change Page');
    }

    onSelectRecordChange(pageSize) {
        console.time('record-per-page ' + pageSize);

        this.tableState.defaultRecordsCountPerPage = pageSize;
        this.tableState.editTables.forEach(x => {
            x.paginator.rows = pageSize;
        });
        this.resetNoAndPage();
        this.changePage(0, true, true, false);
        // this.updateParentView();
        console.timeEnd('record-per-page ' + pageSize);
    }

    reloadPage() {
        this.changePage(this.tableState.currentPage);
    }

    checkAll(isCheckAll): void {
        $(this.table.nativeElement).find('input[type="checkbox"]').prop('checked', isCheckAll);
        this.tableState.allData.forEach(x => {
            (x as any).isChecked = isCheckAll;
        });
    }

    selectRow(event, item: any): void {
        // set ui selected
        var indexOfRow = $(event.currentTarget).index();
        this.tableState.editTables.forEach(x => {
            $(x.ref.nativeElement).find('table>tbody>tr.selectable').removeClass('selected');
            $(x.ref.nativeElement).find('table>tbody>tr:nth-child(' + (indexOfRow + 1) + ')').addClass('selected');
        })
        if (this.tableState.currentItem && (this.tableState.currentItem != item)) {
            this.tableState.currentItem['editableIsSelected'] = false;
            item['editableIsSelected'] = true;
            this.tableState.currentItem = item;
        }
        this.onSelectRow.emit(item);
    }

    doNothing() {
    }

    updateInputField() {
        if (!this.ngForm) {
            return;
        }
        console.time('updateInputField');
        let editName = this.editTableName;

        this.tableState.editTables.forEach(x => {
            let trs = $(x.ref.nativeElement).find('table>tbody>tr');
            if (trs.length == 0) {
                return;
            }

            if (this.dataInPage.length > trs.length) {
                this.updateParentView();
                return;
            }

            let len = Math.min(this.paginator.rows, trs.length);
            for (let i = this.dataInPage.length; i < len; i++) {
                trs[i].style.display = 'none';
            }
            len = Math.min(this.dataInPage.length, trs.length);
            for (let i = 0; i < len; i++) {
                trs[i].style.display = '';
            }
        })

        // let oldUpdateField = FormControl.prototype.updateValueAndValidity;
        // FormControl.prototype.updateValueAndValidity = this.doNothing;

        Object.entries(this.ngForm.controls).forEach(x => {

            let key = x[0];
            let control = x[1];

            control.updateValueAndValidity = this.doNothing;

            let keywords = key.split('-');
            if (keywords.length != 3) {
                return;
            }
            let fieldKey = keywords[0];
            let index = parseInt(keywords[1]);
            let tableName = keywords[2];
            if (this.dataInPage[index]) {
                control.setValue(this.dataInPage[index][fieldKey]);
            }

            // setTimeout(() => {
            //     let key = x[0];
            //     let control = x[1];

            //     let keywords = key.split('-');
            //     if (keywords.length != 3) {
            //         return;
            //     }
            //     let fieldKey = keywords[0];
            //     let index = parseInt(keywords[1]);
            //     let tableName = keywords[2];
            //     if (this.dataInPage[index]) {
            //         control.setValue(this.dataInPage[index][fieldKey]);
            //     }
            // })
        })

        // setTimeout(() => {
        //     FormControl.prototype.updateValueAndValidity = oldUpdateField;
        // }, 1000);
        // for (const [key, control] of Object.entries(this.ngForm.controls)) {

        // }

        // let keys: string[];
        // if (this.dataInPage.length > 0) {
        //     keys = Object.keys(this.dataInPage[0]);
        // }

        // keys.forEach(k => {
        //     for (var i = 0; i < this.dataInPage.length; i++) {
        //         let inputName = k + '-' + i + '-' + editName;
        //         let control = this.ngForm.controls[inputName];
        //         if (control) {
        //             control.setValue(this.dataInPage[i][k]);
        //         }
        //     }
        // });
        console.timeEnd('updateInputField');
    }

    resetResponsiveLayout() {
        var tbody = $(this.table.nativeElement).find('>tbody')[0];
        if (tbody.getElementsByTagName('tr').length) {

            var thead = this.table.nativeElement.getElementsByTagName('thead')[0];
            var columns = thead.getElementsByTagName('th');

            var trs = $(this.table.nativeElement).find('>tbody>tr');

            trs.each(function () {
                let tr = this;

                var tds = tr.getElementsByTagName('td');
                for (var inh = 0; inh < columns.length; inh++) {
                    var th = columns[inh];
                    var spans = th.getElementsByTagName('span');
                    var text = '';
                    if (spans.length) {
                        text = spans[0].textContent;
                    }
                    else {
                        text = th.innerText;
                    }

                    if (spans.length && !tds[inh].style.width) {
                        tds[inh].style.width = spans[0].style.width;
                    }

                    if (spans.length && !tds[inh].style['max-width']) {
                        tds[inh].style['max-width'] = spans[0].style['max-width'];
                    }

                    var mobileSpan = tds[inh].getElementsByClassName('mo-header');

                    if (mobileSpan.length) {
                        mobileSpan[0].innerText = text;
                    }
                }
            })
        }
    }

}