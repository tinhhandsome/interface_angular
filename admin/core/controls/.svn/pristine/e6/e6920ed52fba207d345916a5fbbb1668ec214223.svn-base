import { ViewEncapsulation, Injector, Component, ViewChild, Input } from "@angular/core";
import { PopupFrameComponent } from "../popup-frames/popup-frame.component";
import { PL_CATEGORYTRADE_DT_ENTITY, CategoryTradeServiceProxy, CM_GOODSTYPE_ENTITY, GoodsTypeServiceProxy } from "@shared/service-proxies/service-proxies";
import { finalize } from "rxjs/operators";
import { PopupBaseComponent } from "../../ultils/popup-base.component";

@Component({
    selector: "categorytrade-modal",
    templateUrl: "./categorytrade-modal.component.html",
    encapsulation: ViewEncapsulation.None
})
export class CategorytradeModalComponent extends PopupBaseComponent<PL_CATEGORYTRADE_DT_ENTITY> {
    @ViewChild('categorytradeModal')categorytradeModal: PopupFrameComponent;
    @Input() cgtyear: string;
    goodTypes: CM_GOODSTYPE_ENTITY[];

    planMonth: number;

    constructor(injector: Injector,
        private categoryTradeService: CategoryTradeServiceProxy,
        private goodTypesService: GoodsTypeServiceProxy) {
        super(injector);
        this.filterInput = new PL_CATEGORYTRADE_DT_ENTITY();
        this.keyMember = 'goodS_ID';
        this.initCombobox();
        this.filterInput.recorD_STATUS = '1';
        this.filterInput.useR_LOGIN=this.appSession.user.userName;
        this.filterInput.brancH_ID=this.appSession.user.subbrId;
        this.filterInput.brancH_TYPE=this.appSession.user.branch.brancH_TYPE;
       
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
        this.filterInputSearch.cgT_YEAR=this.cgtyear;
        this.setSortingForFilterModel(this.filterInputSearch);

        if (checkAll) {
            this.filterInputSearch.maxResultCount = -1;
        }

        var result = await this.categoryTradeService.pL_CATEGORYTRADE_Search_ByLevel(this.filterInputSearch)
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