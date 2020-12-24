import { ViewEncapsulation, Component, Input, AfterViewInit, ViewChild, ElementRef, AfterContentInit, Output, EventEmitter, AfterViewChecked, AfterContentChecked, DoCheck, ChangeDetectorRef, Renderer, Renderer2, Injector, OnInit } from "@angular/core";
import { ChangeDetectionComponent } from "../../ultils/change-detection.component";
import { AppConsts } from "@shared/AppConsts";
import { LocalizationService } from "abp-ng2-module/dist/src/localization/localization.service";
import { Paginator2Component } from "../p-paginator2/p-paginator2.component";
import { IListComponent } from "@app/ultilities/ilist-component";
declare var $: JQueryStatic;

@Component({
    selector: "core-table",
    templateUrl: "./core-table.component.html",
    styleUrls: ["./core-table.css"],
    encapsulation: ViewEncapsulation.None
})
export class CoreTableComponent<T> implements OnInit, AfterViewInit, AfterContentChecked {

    @ViewChild("table") tableRef: ElementRef;
    @ViewChild('paginator') paginator: Paginator2Component;

    localizationSourceName = AppConsts.localization.defaultLocalizationSourceName;
    shouldResetPaging: boolean;
    predefinedRecordsCountPerPage = JSON.parse(abp.setting.get("gAMSProCore.PredefinedRecordsCountPerPage"));
    defaultRecordsCountPerPage = abp.setting.getInt("gAMSProCore.DefaultRecordsCountPerPage");
    isResponsive = abp.setting.getBoolean("gAMSProCore.IsResponsive");
    resizableColumns = abp.setting.getBoolean("gAMSProCore.ResizableColumns");
    _totalRecordCount: number = 0;

    listComponent: IListComponent;

    onClickSorting: any;

    get totalRecordsCount(): number {
        return this._totalRecordCount;
    }

    set totalRecordsCount(value: number) {
        if (!value) {
            value = 0;
        }
        this._totalRecordCount = value;
    }

    isLoading: string = "noloading";

    @Output() onSortAsc: EventEmitter<any> = new EventEmitter<any>();
    @Output() onSortDesc: EventEmitter<any> = new EventEmitter<any>();
    @Output() reloadPage: EventEmitter<any> = new EventEmitter<any>();

    @Input() reloadPageOnInit = false;

    private _records: T[];

    get records(): T[] {
        return this._records;
    }

    set records(value: T[]) {
        this._records = value;
        if (this.paginator && value.length == 0 && this.paginator.paginator.getPage() > 0) {
            this.paginator.changePage(this.paginator.paginator.getPage() - 1);
        }
        if (this.listComponent) {
            this.listComponent.onSetData(value);
        }
    }

    sorting: string;
    canLoading: boolean;

    constructor(
        private cdr: ChangeDetectorRef,
        private localization: LocalizationService
    ) {
        this.shouldResetPaging = false;
        this.records = [];
        console.log(this)
    }

    ngOnInit(): void {

    }

    myPageChange(evt) {
        // this.paginator.changePage(evt);
        if (this.listComponent) {
            this.listComponent.changePage(evt.page);
            this.updateParentView();
        }
    }

    l(key: string, ...args: any[]): string {
        args.unshift(key);
        args.unshift(this.localizationSourceName);
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

    updateParentView() {
        var par = this.cdr['_view'].parent;
        if (par && par.component && par.component.updateView) {
            par.component.updateView();
        }
    }

    ngAfterContentChecked(): void {

        let tableRef = this.tableRef.nativeElement;
        $(tableRef).find('thead>tr>th').each(function () {
            if (this.style.display == 'none') {
                let index = $(this).index();
                $(tableRef).find('tbody>tr>td:nth-child(' + (index + 1) + ')').hide();
            }
        })

        
        let colIndexToWidth = {};

        $(this.tableRef.nativeElement).find('thead>tr>th').each(function () {
            let index = $(this).index();
            let width = $(this).width();
            colIndexToWidth[index] = width;
        })


        $(this.tableRef.nativeElement).find('tbody>tr').each(function (indexRow, valueRow) {
            $(valueRow).find('td').each(function (indexCol, valueCol) {
                // let span = document.createElement('span');
                // $(span).text($(value).text());
                // $(value).append(span);
                if ($(valueCol).find(':input').length == 0) {


                    let hiddenElement = $("<span class='overflow-text'></span>");
                    $(valueCol).append(hiddenElement);
                    hiddenElement.append($(valueCol).contents().filter(function () {
                        return this.nodeType === 3;
                    }))
                }
            });
        });


        setTimeout(() => {
            if (!$(this.tableRef.nativeElement).find('tbody>tr>td>span.mobile-header').length) {
                this.resetResponsiveLayout();
            }

            if (!this.records.length) {
                $(this.tableRef.nativeElement).parent().addClass('no-data');
            }
            else {
                $(this.tableRef.nativeElement).parent().removeClass('no-data');
            }

            $(this.tableRef.nativeElement).find('tbody>tr>td').each(function (index, value) {
                if ($(value).find(':input').length == 0) {
                    var textContent = $(value)
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
            });

            $(this.tableRef.nativeElement).find('tbody>tr').each(function (indexRow, valueRow) {
                $(valueRow).find('td').each(function (indexCol, valueCol) {
                    // let span = document.createElement('span');
                    // $(span).text($(value).text());
                    // $(value).append(span);
                    if ($(valueCol).find(':input').length == 0) {
                        var textContent = $(valueCol).find('>span.overflow-text')
                            .text();
                        var colWidth = colIndexToWidth[indexCol];

                        if (colWidth / textContent.length < 10) {
                            $(valueCol).tooltip({
                                items: "td, span",
                                content: textContent,
                                close: function (event, ui) {
                                    $(".ui-tooltip").remove();
                                },
                                hide: false,

                                tooltipClass: "custom_tooltip"
                            });

                            // $(value).css({ "overflow": "hidden", "table-layout": "fixed", "white-space": "nowrap" });

                        }

                    }
                });
            });
            $('.ui-helper-hidden-accessible').remove();
        })
    }


    ngAfterViewInit(): void {
        if (this.reloadPage && this.reloadPageOnInit) {
            this.reloadPage.emit(null);
        }

        var table = this.tableRef.nativeElement;
        var scope = this;
        $(table).find('thead>tr>th[sortfield]').each(function () {
            $(this).click(() => {
                scope.onClickSortColumn(this);
            })
        });

        if (!this.records.length) {
            $(this.tableRef.nativeElement).parent().addClass('no-data');
        }
    }

    setIsLoading(isLoading) {
        var scope = this;
        if (isLoading) {
            abp.ui.setBusy();
            //scope.updateParentView();
        }
        else {
            abp.ui.clearBusy();
            // scope.updateParentView();
        }
    }

    getSorting() {
        return this.sorting;
    }

    setSorting(sorting: string) {
        if (sorting) {
            var sortings = sorting.split(' ');
            $(this.tableRef.nativeElement).find('thead>tr>th[sortfield="' + sortings[0] + '"]').addClass('sort-' + sortings[1]);
            this.sorting = sorting;
        }
    }

    onSelectRecordChange(pageSize) {
        this.paginator.changePage(0);
    }

    onClickSortColumn(thElement) {
        var table = this.tableRef.nativeElement;
        $(table).find('thead>tr>th[sortfield]').each(function () {
            if (this != thElement) {
                $(this).removeClass('sort-asc').removeClass('sort-desc');
            }
        });
        if ($(thElement).hasClass('sort-asc')) {
            $(thElement).removeClass('sort-asc');
            $(thElement).addClass('sort-desc');
            if (this.onSortDesc) {
                this.onSortDesc.emit($(thElement).attr('sortfield'));
            }
            this.sorting = $(thElement).attr('sortfield') + ' desc';
        }
        else {
            $(thElement).removeClass('sort-desc');
            $(thElement).addClass('sort-asc');
            if (this.onSortAsc) {
                this.onSortAsc.emit($(thElement).attr('sortfield'));
            }
            this.sorting = $(thElement).attr('sortfield') + ' asc';
        }

        if (!this.onClickSorting || !this.onClickSorting(this.sorting)) {
            this.getData();
        }
    }

    getData() {
        if (this.paginator.totalRecords) {
            this.reloadPage.emit(null);
        }
    }

    resetResponsiveLayout() {
        var tbody = $(this.tableRef.nativeElement).find('>tbody')[0];
        if (tbody.getElementsByTagName('tr').length) {

            var thead = this.tableRef.nativeElement.getElementsByTagName('thead')[0];
            var columns = thead.getElementsByTagName('th');

            var trs = tbody.getElementsByTagName('tr');

            for (let tr of trs) {
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

                    var mobileSpan = tds[inh].getElementsByClassName('mo-header');

                    if (spans.length && !tds[inh].style.width) {
                        tds[inh].style.width = spans[0].style.width;
                    }

                    if (mobileSpan.length) {
                        mobileSpan[0].innerText = text;
                    }
                }
            }
        }
    }

    @Input() id: string;

}