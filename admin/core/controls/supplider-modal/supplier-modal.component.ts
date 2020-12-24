import { ViewEncapsulation, Injector, Component, ViewChild, Output, EventEmitter, Input, AfterViewInit } from "@angular/core";
import { CM_SUPPLIER_ENTITY, SupplierServiceProxy } from "@shared/service-proxies/service-proxies";
import { finalize } from "rxjs/operators";
import { PopupBaseComponent } from "../../ultils/popup-base.component";
import { AuthStatusConsts } from "../../ultils/consts/AuthStatusConsts";
import { RecordStatusConsts } from "../../ultils/consts/RecordStatusConsts";

@Component({
    selector: "supplier-modal",
    templateUrl: "./supplier-modal.component.html",
    encapsulation: ViewEncapsulation.None
})
export class SupplierModalComponent extends PopupBaseComponent<CM_SUPPLIER_ENTITY> {

    constructor(injector: Injector,
        private supplierService: SupplierServiceProxy) {
        super(injector);
        this.filterInput = new CM_SUPPLIER_ENTITY();
        this.keyMember = 'suP_ID';
        this.filterInput.top = 200;
        this.filterInput.recorD_STATUS = RecordStatusConsts.Active;
        this.filterInput.autH_STATUS = AuthStatusConsts.Approve;

    }
    @Input() labelTitle: string = this.l("SupplierModalTitle")

    async getResult(checkAll: boolean = false): Promise<any> {

        this.setSortingForFilterModel(this.filterInputSearch);

        if (checkAll) {
            this.filterInputSearch.maxResultCount = -1;
        }
        // this.filterInputSearch.autH_STATUS = AuthStatusConsts.Approve;
        // this.filterInputSearch.recorD_STATUS = RecordStatusConsts.Active;
        var result = await this.supplierService.cM_SUPPLIER_Search(this.filterInputSearch)
            .pipe(finalize(() => this.hideTableLoading())).toPromise();

        if (checkAll) {
            this.selectedItems = result.items;
        }
        else {
            this.dataTable.records = result.items;
            this.dataTable.totalRecordsCount = result.totalCount;
            this.filterInputSearch.totalCount = result.totalCount;
        }

        return result;
    }
}