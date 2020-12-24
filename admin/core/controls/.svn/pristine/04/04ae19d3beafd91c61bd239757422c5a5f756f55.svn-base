import { ViewEncapsulation, Injector, Component, ViewChild, Output, EventEmitter, Input } from "@angular/core";
import { TR_PO_MASTER_ENTITY, TradePoMasterServiceProxy, CM_SUPPLIER_ENTITY, AllCodeServiceProxy } from "@shared/service-proxies/service-proxies";
import { finalize } from "rxjs/operators";
import { PopupBaseComponent } from "../../ultils/popup-base.component";

@Component({
    selector: "trade-po-master-modal",
    templateUrl: "./trade-po-master-modal.component.html",
    encapsulation: ViewEncapsulation.None
})
export class TradePoMasterModalComponent extends PopupBaseComponent<TR_PO_MASTER_ENTITY> {
    poTypes: any[]
    constructor(injector: Injector,
        private tradePoMasterService: TradePoMasterServiceProxy,
        private allCodeService: AllCodeServiceProxy) {
        super(injector);
        this.filterInput = new TR_PO_MASTER_ENTITY();
        this.keyMember = 'pO_ID';
        this.filterInput.brancH_LOGIN = this.appSession.user.subbrId;
        this.filterInput.autH_STATUS = 'A';
        this.filterInput.level = 'ALL';
        this.filterInput.top = 1000;

        this.initCombobox()
    }

    onSelectSupplier(item: CM_SUPPLIER_ENTITY) {
        this.filterInput.suP_ID = item.suP_ID
    }

    initCombobox() {
        this.allCodeService.cM_ALLCODE_GetByCDNAME('TRTYPE', 'TR').subscribe(response => {
            this.poTypes = response;
            this.poTypes.forEach(x => {
                if (x.cdval == '0') {
                    x.cdval = '1';
                }
                else if (x.cdval == '1') {
                    x.cdval = '0';
                }
                else {
                    x.cdval = '-1';
                }
            })
        })
    }
    async getResult(checkAll: boolean = false): Promise<any> {

        this.setSortingForFilterModel(this.filterInputSearch);

        if (!this.filterInputSearch['pO_TYPE1']) {
            this.filterInputSearch.pO_TYPE = -1;
        }
        else {
            this.filterInputSearch.pO_TYPE = this.filterInputSearch['pO_TYPE1'];
        }

        if (checkAll) {
            this.filterInputSearch.maxResultCount = -1;
        }

        var result = await this.tradePoMasterService.tR_PO_MASTER_Search(this.filterInputSearch)
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