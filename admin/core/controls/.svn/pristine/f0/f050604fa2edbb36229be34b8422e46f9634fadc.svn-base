import { ViewEncapsulation, Injector, Component, ViewChild, Output, EventEmitter, Input } from "@angular/core";
import { CM_GOODS_ENTITY, GoodsServiceProxy,  GoodsTypeRealServiceProxy, CM_GOODSTYPE_REAL_ENTITY } from "@shared/service-proxies/service-proxies";
import { finalize } from "rxjs/operators";
import { PopupBaseComponent } from "../../ultils/popup-base.component";

@Component({
    selector: "goodstype-real-modal",
    templateUrl: "./goodstype-real-modal.component.html",
    encapsulation: ViewEncapsulation.None
})
export class GoodsRealModalComponent extends PopupBaseComponent<CM_GOODSTYPE_REAL_ENTITY> {
  
    constructor(injector: Injector,
        private goodsTypeRealService: GoodsTypeRealServiceProxy) {
        super(injector);
        this.filterInput = new CM_GOODSTYPE_REAL_ENTITY();
        this.keyMember = 'gD_RETYPE_ID';
        this.initFilterInput();
    }

    initFilterInput(){
        this.filterInput.top = 0;
    }

    async getResult(checkAll: boolean = false): Promise<any> {

        this.setSortingForFilterModel(this.filterInputSearch);

        if (checkAll) {
            this.filterInputSearch.maxResultCount = -1;
        }

        var result = await this.goodsTypeRealService.cM_GOODSTYPE_REAL_Search(this.filterInputSearch)
            .pipe(finalize(() => this.hideTableLoading())).toPromise();

        if (checkAll) {
            this.selectedItems = result.items;
        }
        else {
            this.dataTable.records = result.items;
            this.filterInputSearch.totalCount = result.totalCount;
            this.dataTable.totalRecordsCount = result.totalCount;
        }

        return result;
    }
}