import { Injector, ViewChild, AfterContentInit } from '@angular/core';
import { Paginator } from 'primeng/primeng';
import * as $ from 'jquery';
import { DefaultComponentBase } from './default-component-base';
import { CoreTableComponent } from '@app/admin/core/controls/core-table/core-table.component';
import { IListComponent } from './ilist-component';
import { EditableTableComponent } from '@app/admin/core/controls/editable-table/editable-table.component';

export abstract class ListComponentBase<T> extends DefaultComponentBase implements AfterContentInit, IListComponent {

    @ViewChild('coreTable') dataTable: CoreTableComponent<T>;

    // Paging Client Start
    pagingClient: boolean;
    clientData: T[];
    // Paging Client End

    currentItem: T = (<T>{});

    shouldResetTable: boolean = false;
    shouldReloadPaging: boolean = false;

    // dataCached: T[] = [];

    private _filterInputSearch: T;
    public get filterInputSearch(): T {
        return this._filterInputSearch;
    }
    public set filterInputSearch(value: T) {
        this._filterInputSearch = value;
    }

    constructor(injector: Injector) {
        super(injector);
        this.pagingClient = false;
    }

    showTableLoading(): void {
        this.dataTable.setIsLoading(true);
    }

    hideTableLoading(): void {
        this.dataTable.setIsLoading(false);
    }

    changePage(currentPage: number) {

        // Paging Client Start

        if (this.pagingClient) {
            this.pagingClient_ChangePage(currentPage);
            return;
        }

        // Paging Client End

        this.dataTable.paginator.paginator.first = this.dataTable.paginator.paginator.paginatorState.rows * currentPage;
        this.dataTable.getData();

        // let maxResultCount = this.dataTable.paginator.paginator.paginatorState.rows;
        // let skipCount = currentPage * maxResultCount;

        // this.shouldReloadPaging = false;

        // if (skipCount + maxResultCount > this.dataCached.length) {
        //     this.shouldReloadPaging = true;
        // }

        // if (this.shouldReloadPaging) {
        //     this.dataTable.getData();
        // }
        // else {
        //     this.dataTable.records = this.dataCached.slice(skipCount, skipCount + maxResultCount);
        //     this.filterInputSearch['skipCount'] = skipCount;
        //     this.filterInputSearch['maxResultCount'] = skipCount;
        //     this.updateView();
        // }
    }

    reloadPage(): void {
        this.changePage(this.dataTable.paginator.paginator.getPage());
    }

    onSetData(records: T[]) {
        // if (this.shouldReloadPaging) {
        //     let maxResultCount = this.dataTable.paginator.paginator.paginatorState.rows;
        //     let skipCount = this.dataTable.paginator.paginator.getPage() * maxResultCount;
        //     this.dataCached = [...this.dataCached.slice(0, skipCount), ...records];
        // }
    }

    onRouteBack() {
        if (this.shouldResetTable && this['filterInputSearch']) {
            this['filterInputSearch']['totalCount'] = 0;
            this.search();
            this.shouldResetTable = false;
        }
    }

    ngAfterContentInit(): void {
        this.initFilterSession();

        let scope = this;

        if (this.dataTable) {
            this.dataTable.listComponent = this;
        }


        // Paging Client Start
        if (this.pagingClient) {
            this.dataTable.onClickSorting = (sorting: string) => {
                if (this.clientData && this.clientData.length > 0) {
                    let firstItem = this.clientData[0];

                    let sortField, sortDirection: string;

                    let sorts = sorting.split(' ')
                    if (sorts.length == 2) {
                        sortField = sorts[0];
                        sortDirection = sorts[1];
                        let keys = Object.keys(firstItem);

                        let realKey = keys.filter(x => x.toLocaleLowerCase() == sortField.toLocaleLowerCase()).firstOrDefault(undefined);
                        if (!realKey) {
                            return false;
                        }

                        if (!this.dataTable.paginator.paginator.paginatorState.rows || this.dataTable.paginator.paginator.paginatorState.rows == 0) {
                            return false;
                        }

                        if (sortDirection.toLocaleLowerCase() == 'asc') {
                            this.clientData = this.clientData.sort(EditableTableComponent.sortAsc(realKey));
                        }
                        else {
                            this.clientData = this.clientData.sort(EditableTableComponent.sortDesc(realKey));
                        }
                        let currentPage = this.dataTable.paginator.paginator.first / this.dataTable.paginator.paginator.paginatorState.rows;
                        this.pagingClient_ChangePage(currentPage);
                        this.updateView();
                        return true;
                    }
                    return false;
                }
                return true;
            }
        }

        // Paging Client End
    }

    initFilterSession() {
        let filterInput = (this as any).filterInput;
        if (filterInput) {
            if (this.dataTable) {
                this.dataTable.setSorting(filterInput.sorting);
                if (this.dataTable.paginator && this.dataTable.paginator.paginator) {
                    this.dataTable.paginator.paginator.first = filterInput.skipCount || 0;
                }
            }
        }
        if (this.shouldResetTable) {
            this.onSearch();
        }
    }

    // onGetFilter(filterInput) {
    //     this.initFilterSession();
    // }

    onGetFilter(filterInput) {
        this.initFilterSession();
    }

    setSortingForFilterModel(filterInput: any) {
        if (!filterInput) {
            return;
        }
        filterInput.sorting = this.dataTable.getSorting();
        filterInput.maxResultCount = (this.dataTable.paginator.paginator.paginatorState.rows || 0);
        filterInput.skipCount = this.dataTable.paginator.paginator.first;

        // Paging Client Start

        if (this.pagingClient) {
            filterInput.maxResultCount = -1;
        }

        // Paging Client End

    }

    // Paging Client Start

    setRecords(result) {
        if (this.pagingClient) {
            this.clientData = result.items;
            this.dataTable.totalRecordsCount = result.totalCount;
            this.filterInputSearch['totalCount'] = result.totalCount;
            this.pagingClient_ChangePage(0);
        }
        else {
            this.dataTable.records = result.items;
            this.dataTable.totalRecordsCount = result.totalCount;
            this.filterInputSearch['totalCount'] = result.totalCount;
        }
    }

    pagingClient_ChangePage(page) {
        if (!this.clientData) {
            this.dataTable.records = [];
        }
        else {
            this.filterInputSearch['skipCount'] = this.dataTable.paginator.paginator.first;
            let pageSize = (this.dataTable.paginator.paginator.paginatorState.rows || 0);
            this.dataTable.records = this.clientData.slice(page * pageSize, page * pageSize + pageSize);
        }
    }

    // Paging Client End

    onSelectRow(item: T): void {
        this.appToolbar.onSelectRow(item);
    }

    initDefaultFilter() {

    }

    initFilter() {
        this.initDefaultFilter();
        this.getFilterInputInRoute((filterJson) => {
            if (filterJson) {
                this['filterInput'] = JSON.parse(filterJson);
            }
        });
    }

    selectRowInIndex(index) {
        let item = this.dataTable.records[index];
        let element = $(this.dataTable.tableRef.nativeElement).find('tr:nth-child(' + (index + 1) + ')');
        this.selectRow({
            currentTarget: element,
        }, item);
    }

    selectRow(event, item: any): void {
        // set ui selected
        $(event.currentTarget).closest('table').find('tr.selectable').removeClass('selected');
        $(event.currentTarget).addClass('selected');
        this.currentItem = item;
        this.onSelectRow(item);

        if ($(event.currentTarget).closest('.modal.show').length == 0) {
            setTimeout(() => {
                this.updateView();
            })
        }
    }

    onUpdate(item: T): void {
    }

    onViewDetail(item: T): void {
    }

    onDblclick(record: T) {
        if (this.appToolbar.buttonUpdateVisible) {
            this.onUpdate(record);
        }
        else if (this.appToolbar.buttonViewDetailEnable) {
            this.onViewDetail(record);
        }
    }

    exportExcel() {
        this.filterInputSearch = { ...this['filterInput'] };
        this.filterInputSearch['top'] = 0;
        this.exportToExcel();
    }

    exportToExcel() {

    }

    copyFilterInput() {
        this['filterInput']['totalCount'] = 0;

        this['filterInputSearch'] = { ...this['filterInput'] };
        this['filterInputSearch']['skipCount'] = 0;

        let obj = this['filterInputSearch'];

        obj['toJSON'] = function () {
            return obj;
            let data = {};
            let scope = this;
            Object.keys(this).filter(x => x != "toJSON").forEach(function (k) {
                if (k) {
                    data[k] = scope[k];
                }
            })
            return data;
        }
    }

    search() {

    }

    onSearch(): void {
        this.dataTable.paginator.paginator.first = 0;
        this.copyFilterInput();
        this.search();
        // this.changePage(0);
    }
}
