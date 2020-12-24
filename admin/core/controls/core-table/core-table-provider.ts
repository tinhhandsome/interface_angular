import { ElementRef } from "@angular/core";
declare var $: JQueryStatic;


export class CoreTableProvider {
    tableRef: ElementRef;

    setTableRef(tableRef: ElementRef) {
        this.tableRef = tableRef;

        var scope = this;
        $(tableRef.nativeElement).find('thead>tr>th').each(function () {
            var element = this;
            $(element).click(function () {
                scope.onClickTh(element);
            });
        });
    }

    onClickTh(thElement: any) {
    }


}