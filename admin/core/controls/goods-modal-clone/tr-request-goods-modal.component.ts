import { ViewEncapsulation, Injector, Component, ViewChild, Output, EventEmitter, ElementRef, Input } from "@angular/core";
import { TR_PO_GOODS_ENTITY, TradeRequestDocServiceProxy, PL_MASTER_ENTITY, TR_CONTRACT_ENTITY } from "@shared/service-proxies/service-proxies";
import { finalize } from "rxjs/operators";
import { TradeDetailModalComponent } from "../trade-detail-modal/trade-detail-modal.component";
import { PopupBaseComponent } from "../../ultils/popup-base.component";
import { ContractModalComponent } from "../contract-modal/contract-modal.component";
import { AuthStatusConsts } from "../../ultils/consts/AuthStatusConsts";

@Component({
    selector: "tr-request-goods-modal-clone",
    templateUrl: "./tr-request-goods-modal.component.html",
    encapsulation: ViewEncapsulation.None
})
export class TrRequestGoodsModalCloneComponent extends PopupBaseComponent<TR_PO_GOODS_ENTITY> {
    constructor(injector: Injector,
        private trRequestDocService: TradeRequestDocServiceProxy) {
        super(injector);
        this.filterInput = new TR_PO_GOODS_ENTITY();
        this.keyMember = 'keyMember';
    }

    @ViewChild('tradeDetailModal') tradeDetailModal: TradeDetailModalComponent;
    @ViewChild('contractModal') contractModal: ContractModalComponent;

    planIdEmpty = false;
    level:string;
    ngAfterViewInit(): void {
        super.ngAfterViewInit();
        this.tradeDetailModal.updateView();
        this.contractModal.updateView();
    }

    get isContractCodeHidden(): boolean { // hideField = contractcode thi chuyen 2 radion button thanh col-md-3
        if (!this.hideFields || this.hideFields.indexOf('contracT_CODE') < 0)
            return false;
        return true;
    }

    isShowError: boolean;
    @Input() hasContract: boolean;

    async getResult(checkAll: boolean = false): Promise<any> {
        if (!this.filterInputSearch.plaN_ID) {
            this.planIdEmpty = true;
            this.hideTableLoading();
            return;
        }
        // this.filterInputSearch = this.filterInput;
        this.planIdEmpty = false;

        this.setSortingForFilterModel(this.filterInputSearch);
        this.filterInputSearch.branchlogin = this.filterInputSearch.brancH_ID = this.appSession.user.subbrId;

        if (checkAll) {
            this.filterInputSearch.maxResultCount = -1;
        }

        var result = await this.trRequestDocService.tR_PO_GOODS_Search(this.filterInputSearch)
            .pipe(finalize(() => this.hideTableLoading())).toPromise();

        if (checkAll) {
            this.selectedItems = result.items;
        }
        else {
            this.dataTable.records = result.items;
            result.items.forEach(x => {
                x['keyMember'] = (x.gD_ID || '') + '|' + (x.cD_ID || '');
            })
            this.dataTable.totalRecordsCount = result.totalCount;
            this.filterInputSearch.totalCount = result.totalCount;
        }

        return result;
    }

    onSelectTypePlan(type): void {
        this.filterInput.pO_TYPE = type;
    }

    onChangePlanCode(planCode) {
        if (!planCode) {
            this.filterInput.plaN_ID = undefined;
            this.filterInput.plaN_CODE = undefined;
            this.planIdEmpty = true;
            this.updateView();
        }
    }

    onSelectTradeDetail(plan: PL_MASTER_ENTITY) {
        this.filterInput.plaN_ID = plan.plaN_ID;
        this.filterInput.plaN_CODE = plan.plaN_CODE;
        this.planIdEmpty = false;
    }

    onSelectContract(contract: TR_CONTRACT_ENTITY) {
        this.filterInput.contracT_CODE = contract.contracT_CODE;
    }

    onContractCodeFocusOut(contractCode) {
        if (!contractCode) {
            this.filterInput.contracT_ID = undefined;
            this.filterInput.contracT_CODE = undefined;
        }
    }
}