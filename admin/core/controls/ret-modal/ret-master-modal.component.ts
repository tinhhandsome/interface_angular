import { ViewEncapsulation, Injector, Component, ViewChild, Output, EventEmitter, Input, AfterViewInit } from "@angular/core";
import { ASS_MASTER_ENTITY, AssMasterServiceProxy, AssAmortStatusServiceProxy, AssStatusServiceProxy, AssGroupServiceProxy, AssTypeServiceProxy, ASS_GROUP_ENTITY, ASS_TYPE_ENTITY, ASS_STATUS_ENTITY, ASS_AMORT_STATUS_ENTITY, CM_BRANCH_ENTITY, CM_DEPARTMENT_ENTITY, RET_MASTER_ENTITY, RealEstateServiceProxy, CM_DIVISION_ENTITY } from "@shared/service-proxies/service-proxies";
import { finalize } from "rxjs/operators";
import { PopupBaseComponent } from "../../ultils/popup-base.component";
import { AuthStatusConsts } from "../../ultils/consts/AuthStatusConsts";
import { RecordStatusConsts } from "../../ultils/consts/RecordStatusConsts";
import { DepartmentModalComponent } from "../dep-modal/department-modal.component";
import { DivisionModalComponent } from "../division-modal/division-modal.component";
import { AssetModalComponent } from "../asset-modal/asset-modal.component";

@Component({
    selector: "ret-modal",
    templateUrl: "./ret-master-modal.component.html",
    encapsulation: ViewEncapsulation.None
})
export class RetModalComponent extends PopupBaseComponent<RET_MASTER_ENTITY> {

    @ViewChild('assetModal') assetModal: AssetModalComponent;
    @ViewChild('divisionModal') divModal: DivisionModalComponent;

    filterInput: RET_MASTER_ENTITY = new RET_MASTER_ENTITY();
    assType: string = '3';
    assCat: string = 'RET';
    level: string = 'UNIT';

    @Input() showBuyPrice: boolean = true
    @Input() showAssetName: boolean = true
    @Input() showDivisionName: boolean = true
    @Input() showAddress: boolean = true
    @Input() showChargeTerms: boolean = true
    @Input() showApproveStatus: boolean = true
    @Input() showLength: boolean = true
    @Input() showWidth: boolean = true
    @Input() showCurrentState: boolean = true


    @ViewChild('departmentModal') departmentModal: DepartmentModalComponent;

    constructor(injector: Injector,
        private _realEstateService: RealEstateServiceProxy) {
        super(injector);

        this.initFilter();
    }
    initFilter() {
    }

    onDivisionFocusOut() {
        if (!this.filterInput.diV_CODE) {
            this.filterInput.diV_ID = undefined;
            this.filterInput.diV_NAME = undefined;
        }
    }

    onAssetFocusOut() {
        if (!this.filterInput.asseT_CODE) {
            this.filterInput.asseT_ID = undefined;
        }
    }


    ngAfterViewInit() {
        super.ngAfterViewInit();

    }
    showAssetModal() {
        this.assetModal.filterInput.brancH_ID = this.appSession.user.subbrId;
        // this.assetModal.filterInput.asS_TYPE = this.assType;
        this.assetModal.filterInput.asS_CAT = this.assCat;
        this.assetModal.filterInput.brancH_LOGIN = this.appSession.user.subbrId;
        this.assetModal.filterInput.level = this.level;
        this.assetModal.show();
    }
    showDivisionModal() {
        this.divModal.filterInput.brancH_ID = this.appSession.user.subbrId;
        this.divModal.filterInput.recorD_STATUS = RecordStatusConsts.Active;
        this.divModal.show();
    }
    async getResult(checkAll: boolean = false): Promise<any> {

        this.setSortingForFilterModel(this.filterInputSearch);
        this.bindingFilter()


        if (checkAll) {
            this.filterInputSearch.maxResultCount = -1;
        }
        var result = await this._realEstateService.rET_MASTER_Search(this.filterInputSearch)
            .pipe(finalize(() => this.hideTableLoading())).toPromise();
        // var result = await this.assMasterService.aSS_MASTER_Search(this.filterInputSearch)
        //     .pipe(finalize(() => this.hideTableLoading())).toPromise();

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
    onSingleSelectAsset(input: ASS_MASTER_ENTITY) {
        this.filterInput.asseT_CODE = input.asseT_CODE;
        this.filterInput.asseT_ID = input.asseT_ID;
    }

    onSingleSelectDivision(input: CM_DIVISION_ENTITY) {
        this.filterInput.diV_CODE = input.diV_CODE;
        this.filterInput.diV_ID = input.diV_ID;
        this.filterInput.diV_NAME = input.diV_NAME;
    }
    onInitFilter(): void {
        //this.filterInput.level = 'UNIT'        

        // this.onGetTypes()
        // this.assStatusService.aSS_STATUS_Lst().subscribe(response => {
        //     this.assStatuses = response;
        // });

        // this.assAmortStatusService.aSS_AMORT_STATUS_Lst().subscribe(response => {
        //     this.assAmortStatuses = response;
        // });

    }



    bindingFilter() {
    }

}