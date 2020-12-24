import { ControlComponent } from "../control.component";
import { Component, ViewChild, Injector } from "@angular/core";
import { Paginator } from "primeng/primeng";
import { CoreTableComponent } from "../core-table/core-table.component";

@Component({
    template: ''
})
export class PopupTableBaseComponent<T> extends ControlComponent {

    @ViewChild('paginator') paginator: Paginator;
    @ViewChild('coreTable') dataTable: CoreTableComponent<T>;

    constructor(injector: Injector) {
        super(injector);
    }


    showTableLoading(): void {
        this.dataTable.setIsLoading(true);
    }

    hideTableLoading(): void {
        this.dataTable.setIsLoading(false);
    }

    changePage(page: number): void {
        this.paginator.changePage(page);
    }

    reloadPage(): void {
        this.changePage(this.paginator.getPage());
    }

    setSortingForFilterModel(filterInput: any) {
        if (!filterInput) {
            return;
        }
        filterInput.sorting = this.dataTable.getSorting();
        filterInput.skipCount = this.paginator.getPage();
        filterInput.maxResultCount = this.paginator.paginatorState.rows;
    }

    onSelectRow(item: any) {

    }

    selectRow(event, item: any): void {
        // set ui selected
        $(event.currentTarget).closest('table').find('tr.selectable').removeClass('selected');
        $(event.currentTarget).addClass('selected');
        this.onSelectRow(item);
    }

}