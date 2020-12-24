import { ViewEncapsulation, Injector, Component, ViewChild, Output, EventEmitter, Input, Optional, Inject } from "@angular/core";
import { ASS_MASTER_ENTITY, AssMasterServiceProxy, AssAmortStatusServiceProxy, AssStatusServiceProxy, AssGroupServiceProxy, AssTypeServiceProxy, ASS_GROUP_ENTITY, ASS_TYPE_ENTITY, ASS_STATUS_ENTITY, ASS_AMORT_STATUS_ENTITY, CM_BRANCH_ENTITY, CM_DEPARTMENT_ENTITY, API_BASE_URL } from "@shared/service-proxies/service-proxies";
import { finalize } from "rxjs/operators";
import { AssetModalComponent } from "../asset-modal/asset-modal.component";

@Component({
    selector: "asset-modal-wh-o",
    templateUrl: "../asset-modal/asset-modal.component.html",
    encapsulation: ViewEncapsulation.None
})
export class AssetWarehouseOutModalComponent extends AssetModalComponent {

    constructor(injector: Injector,
        @Optional() @Inject(API_BASE_URL) baseUrl?: string) {
        super(injector, baseUrl);
    }

    onInitFilter(){
        super.onInitFilter();
        this.filterInput.brancH_ID = this.appSession.user.subbrId;
    }

    async getResult(checkAll: boolean = false): Promise<any> {
        this.setAmortStatus();
        this.setSortingForFilterModel(this.filterInputSearch);
        this.bindingFilter()

        if (checkAll) {
            this.filterInputSearch.maxResultCount = -1;
        }
        this.showTableLoading();
        var result = await this.assMasterService.aSS_MASTER_SEARCH_WH_O(this.filterInputSearch)
            .pipe(finalize(() => this.hideTableLoading())).toPromise();
        if (checkAll) {
            this.selectedItems = result.items;
        }
        else {
            this.dataTable.records = result.items;
            this.dataTable.totalRecordsCount = result.totalCount;
            this.filterInputSearch.totalCount = result.totalCount
        }

        return result;
    }

    setAmortStatus() {
        if (this.isNull(this.filterInput.amorT_STATUS)) {
            this.filterInputSearch.amorT_STATUS =
                this.assAmortStatuses
                    .filter(x => x.statuS_CODE)
                    .map(x => x.statuS_CODE + ',')
                    .join('');
        }
    }
}