import { ViewEncapsulation, Injector, Component } from "@angular/core";
import { CAR_MASTER_ENTITY, CarMasterServiceProxy, CM_BRANCH_ENTITY, CM_CAR_TYPE_ENTITY, CarTypeServiceProxy, BranchServiceProxy } from "@shared/service-proxies/service-proxies";
import { finalize } from "rxjs/operators";
import { PopupBaseComponent } from "../../ultils/popup-base.component";

@Component({
    selector: "car-master-modal",
    templateUrl: "./car-master-modal.component.html",
    encapsulation: ViewEncapsulation.None
})
export class CarMasterModalComponent extends PopupBaseComponent<CAR_MASTER_ENTITY> {
    constructor(injector: Injector,
        private branchService : BranchServiceProxy,
        private carTypeService : CarTypeServiceProxy,
        private supplierService: CarMasterServiceProxy) {
        super(injector);
        this.filterInput = new CAR_MASTER_ENTITY();
        this.keyMember = 'caR_ID';
        this.initCombobox();
        this.filterInputSearch = this.filterInput;
    }

    branchs : CM_BRANCH_ENTITY[];
    carTypes : CM_CAR_TYPE_ENTITY[];

    initCombobox(): void {
        let filterCombobox = this.getFillterForCombobox();
        this.branchService.cM_BRANCH_Search(filterCombobox).subscribe(response => {
            this.branchs = response.items;
        });
        this.carTypeService.cM_CAR_TYPE_Search(filterCombobox).subscribe(response => {
            this.carTypes = response.items;
        });
    }

    async getResult(checkAll: boolean = false): Promise<any> {

        this.setSortingForFilterModel(this.filterInputSearch);

        if (checkAll) {
            this.filterInputSearch.maxResultCount = -1;
        }

        var result = await this.supplierService.cAR_MASTER_Search(this.filterInputSearch)
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

