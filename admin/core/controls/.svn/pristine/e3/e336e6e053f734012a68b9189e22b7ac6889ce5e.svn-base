import { ViewEncapsulation, Injector, Component, ViewChild, Input } from "@angular/core";
import { PopupFrameComponent } from "../popup-frames/popup-frame.component";
import { CM_GOODS_ENTITY, GoodsServiceProxy, CM_GOODSTYPE_ENTITY, GoodsTypeServiceProxy, TR_PO_DETAIL_ENTITY, TradePoMasterServiceProxy, TR_PO_DETAIL_PARAM } from "@shared/service-proxies/service-proxies";
import { finalize } from "rxjs/operators";
import { PopupBaseComponent } from "../../ultils/popup-base.component";
import { EditableTableComponent } from "../editable-table/editable-table.component";

@Component({
    selector: "tr-po-goods-modal",
    templateUrl: "./tr-po-goods-modal.component.html",
    encapsulation: ViewEncapsulation.None
})
export class TrPoGoodsModalComponent extends PopupBaseComponent<TR_PO_DETAIL_ENTITY> {
    @ViewChild('goodsModal') goodsModal: PopupFrameComponent;

    @ViewChild('dataEditTable') dataEditTable: EditableTableComponent<TR_PO_DETAIL_ENTITY>;

    @Input() poIds: string;
    @Input() gdType: string;

    goodTypes: CM_GOODSTYPE_ENTITY[];

    constructor(injector: Injector,
        private poMasterService: TradePoMasterServiceProxy) {
        super(injector);
        this.filterInput = new TR_PO_DETAIL_ENTITY();
        this.keyMember = 'pD_ID';
        console.log(this);
    }

    show() {
        super.show();
    }

    showTableLoading(): void {
        this.dataEditTable.isLoading = true;
    }

    hideTableLoading(): void {
        this.dataEditTable.isLoading = false;
    }

    async getResult(checkAll: boolean = false): Promise<any> {

        let input = { pO_ID : this.poIds, brancH_LOGIN : this.appSession.user.subbrId, asseT_TYPE : this.gdType, gD_CODE : this.filterInput.gD_CODE, gD_NAME : this.filterInput.gD_NAME } as TR_PO_DETAIL_PARAM;

        var result = await this.poMasterService.tR_PO_DETAIL_ById(input)
            .pipe(finalize(() => this.hideTableLoading())).toPromise();

        this.dataEditTable.allData = result;
        this.dataEditTable.resetNoAndPage();
        this.dataEditTable.changePage(0);

        return result;
    }


    async onCheckAll(element) {
        this.dataEditTable.checkAll(element.checked); 
        if (element.checked) {
            this.selectedItems = [...this.dataEditTable.allData];
        }
        this.updateView();
    }
}