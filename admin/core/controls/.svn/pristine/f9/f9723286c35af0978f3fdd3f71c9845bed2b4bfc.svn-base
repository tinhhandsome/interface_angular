import { ViewEncapsulation, Injector, Component, ViewChild, Input } from "@angular/core";
import { PopupFrameComponent } from "../popup-frames/popup-frame.component";
import { CM_GOODS_ENTITY, GoodsServiceProxy, CM_GOODSTYPE_ENTITY, GoodsTypeServiceProxy } from "@shared/service-proxies/service-proxies";
import { finalize } from "rxjs/operators";
import { PopupBaseComponent } from "../../ultils/popup-base.component";

@Component({
    selector: "goods-modal",
    templateUrl: "./goods-modal.component.html",
    encapsulation: ViewEncapsulation.None
})
export class GoodsModalComponent extends PopupBaseComponent<CM_GOODS_ENTITY> {
    @ViewChild('goodsModal')goodsModal: PopupFrameComponent;

    goodTypes: CM_GOODSTYPE_ENTITY[];

    planMonth: number;

    constructor(injector: Injector,
        private goodsService: GoodsServiceProxy,
        private goodTypesService: GoodsTypeServiceProxy) {
        super(injector);
        this.filterInput = new CM_GOODS_ENTITY();
        this.keyMember = 'gD_ID';
        this.initCombobox();
        this.filterInput.recorD_STATUS = '1';
    }

    initCombobox() {
        this.goodTypesService.cM_GOODSTYPE_Search(this.getFillterForCombobox())
            .subscribe(result => {
                this.goodTypes = result.items;
                this.updateView();
            });
    }

    async getResult(checkAll: boolean = false): Promise<any> {
        this.filterInputSearch = this.filterInput;
        this.setSortingForFilterModel(this.filterInputSearch);

        if (checkAll) {
            this.filterInputSearch.maxResultCount = -1;
        }

        var result = await this.goodsService.cM_GOODS_Search(this.filterInputSearch)
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