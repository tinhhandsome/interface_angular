import { ViewEncapsulation, Injector, Component, Input } from "@angular/core";
import { BidMasterServiceProxy, BID_MASTER_ENTITY } from "@shared/service-proxies/service-proxies";
import { finalize } from "rxjs/operators";
import { PopupBaseComponent } from "../../ultils/popup-base.component";
import { AuthStatusConsts } from "../../ultils/consts/AuthStatusConsts";
import { RecordStatusConsts } from "../../ultils/consts/RecordStatusConsts";

@Component({
    selector: "bid-master-modal",
    templateUrl: "./bid-master-modal.component.html",
    encapsulation: ViewEncapsulation.None
})
export class BidMasterModalComponent extends PopupBaseComponent<BID_MASTER_ENTITY> {

    constructor(injector: Injector,
        private bidMasterService: BidMasterServiceProxy) {
        super(injector);
        this.filterInput = new BID_MASTER_ENTITY();
        this.keyMember = 'biD_ID';
        this.filterInput.biD_TYPE = '1';
        this.filterInput.top = 200;
    }
    @Input() branchTitle: string = this.l('SearchBidInfo') 
    @Input() showColBidCode: boolean = true
    @Input() showColTermBid: boolean = true
    @Input() showColInputDt: boolean = true
    @Input() showColForm: boolean = true

    async getResult(checkAll: boolean = false): Promise<any> {

        this.setSortingForFilterModel(this.filterInputSearch);

        this.filterInputSearch.autH_STATUS = AuthStatusConsts.Approve;
        this.filterInputSearch.recorD_STATUS = RecordStatusConsts.Active;

        if (checkAll) {
            this.filterInputSearch.maxResultCount = -1;
        }

        var result = await this.bidMasterService.bID_MASTER_Search(this.filterInputSearch)
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