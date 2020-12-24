import { ViewEncapsulation, Injector, Component, ViewChild, Output, EventEmitter, Input } from "@angular/core";
import { TR_CONTRACT_ENTITY, TradeContractServiceProxy, BID_CONTRACTOR_DT_ENTITY, CM_SUPPLIER_ENTITY } from "@shared/service-proxies/service-proxies";
import { finalize } from "rxjs/operators";
import { PopupBaseComponent } from "../../ultils/popup-base.component";
import { AuthStatusConsts } from "../../ultils/consts/AuthStatusConsts";
import { RecordStatusConsts } from "../../ultils/consts/RecordStatusConsts";

@Component({
    selector: "contract-modal",
    templateUrl: "./contract-modal.component.html",
    encapsulation: ViewEncapsulation.None
})
export class ContractModalComponent extends PopupBaseComponent<TR_CONTRACT_ENTITY> {

    constructor(injector: Injector,
        private contractService: TradeContractServiceProxy) {
        super(injector);
        this.filterInput = new TR_CONTRACT_ENTITY();
        this.keyMember = 'contracT_ID';
        this.filterInput.top = 500;
        this.filterInput.constracT_TYPE = '1';

    }
    @Input() branchTitle: string = this.l('Contract_ModalTitle') 
    @Input() showColContractCode: boolean = true
    @Input() showColContractName: boolean = true
    @Input() showColBidCode: boolean = true
    @Input() showColDeliveryDt: boolean = true
    @Input() showColSupId: boolean = true

    async getResult(checkAll : boolean = false): Promise<any> {

        this.setSortingForFilterModel(this.filterInputSearch);

        this.filterInputSearch.autH_STATUS = AuthStatusConsts.Approve;
        this.filterInputSearch.recorD_STATUS = RecordStatusConsts.Active;

        if(checkAll){
            this.filterInputSearch.maxResultCount = -1;
        }

        var result = await this.contractService.tR_CONTRACT_Search(this.filterInputSearch)
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

    onSelectBidMaster(bid: BID_CONTRACTOR_DT_ENTITY) {
        this.filterInput.biD_ID = bid.biD_ID;
        this.filterInput.biD_CODE = bid.biD_CODE;
    }

    onSelectSupplier(sup: CM_SUPPLIER_ENTITY) {
        this.filterInput.suP_ID = sup.suP_ID;
        this.filterInput.suP_CODE = sup.suP_CODE;
    }

}