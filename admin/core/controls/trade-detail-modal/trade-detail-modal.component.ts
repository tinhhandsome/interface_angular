import { ViewEncapsulation, Injector, Component } from "@angular/core";
import { PL_MASTER_ENTITY, PlMasterServiceProxy } from "@shared/service-proxies/service-proxies";
import { finalize } from "rxjs/operators";
import { AuthStatusConsts } from "../../ultils/consts/AuthStatusConsts";
import { RecordStatusConsts } from "../../ultils/consts/RecordStatusConsts";
import { PopupBaseComponent } from "../../ultils/popup-base.component";

@Component({
    selector: "trade-detail-modal",
    templateUrl: "./trade-detail-modal.component.html",
    encapsulation: ViewEncapsulation.None
})
export class TradeDetailModalComponent extends PopupBaseComponent<PL_MASTER_ENTITY> {

    constructor(injector: Injector,
        private plMasterService: PlMasterServiceProxy) {
        super(injector);
        this.filterInput = new PL_MASTER_ENTITY();
        // this.filterInput.year = moment().year().toString();
        this.setDefaultFilter();
    }

    setDefaultFilter() {
        this.filterInput.auth = AuthStatusConsts.Approve;
        this.filterInput.branchid = this.appSession.user.subbrId;
        this.filterInput.branchlogin = this.appSession.user.subbrId;
        this.filterInput.plantype = '1';
        this.filterInput.all = 'Y';
        this.filterInput.level = 'UNIT';
    }

    async getResult(checkAll: boolean = false): Promise<any> {

        this.setSortingForFilterModel(this.filterInputSearch);


        if (checkAll) {
            this.filterInputSearch.maxResultCount = -1;
        }
        this.filterInputSearch.useR_LOGIN=this.appSession.user.userName;
        var result = await this.plMasterService.pL_MASTER_Search(this.filterInputSearch)
            .pipe(finalize(() => this.hideTableLoading())).toPromise();

        this.dataTable.records = result.items;
        this.dataTable.totalRecordsCount = result.totalCount;

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