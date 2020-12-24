import { ViewEncapsulation, Injector, Component, ViewChild, Output, EventEmitter, Input } from "@angular/core";
import { ComponentBase } from "@app/ultilities/component-base";
import { PopupFrameComponent } from "../popup-frames/popup-frame.component";
import { ListComponentBase } from "@app/ultilities/list-component-base";
import { CM_DIVISION_ENTITY, DivisionServiceProxy, DeptGroupServiceProxy, CM_DEPT_GROUP_ENTITY, BranchServiceProxy, CM_BRANCH_ENTITY } from "@shared/service-proxies/service-proxies";
import { finalize } from "rxjs/operators";
import { AuthStatusConsts } from "../../ultils/consts/AuthStatusConsts";
import { RecordStatusConsts } from "../../ultils/consts/RecordStatusConsts";
import { PopupBaseComponent } from "../../ultils/popup-base.component";

@Component({
    selector: "division-modal",
    templateUrl: "./division-modal.component.html",
    encapsulation: ViewEncapsulation.None
})
export class DivisionModalComponent extends PopupBaseComponent<CM_DIVISION_ENTITY>{

    constructor(injector: Injector,
        private divisionService: DivisionServiceProxy,
        private branchService: BranchServiceProxy) {
        super(injector);
        this.filterInput = new CM_DIVISION_ENTITY();
        this.keyMember = 'deP_ID';

        this.initCombobox();
        this.filterInput.recorD_STATUS = '1';
        // this.updateView();
    }

    
    branchs: CM_BRANCH_ENTITY[];
    @Input() labelTitle = this.l('Search') + ' ' + this.l("Division").toLowerCase()
    @Input() showColDivCode: boolean = false
    @Input() showColDivName: boolean = true
    @Input() showColBranchCode : boolean = true
    @Input() showColAddress : boolean = true
    initCombobox() {
        this.branchService.cM_BRANCH_Search(this.getFillterForCombobox()).subscribe(response => {
            this.branchs = response.items;
            this.updateView();
        });
    }

    async getResult(checkAll: boolean = false): Promise<any> {

        this.setSortingForFilterModel(this.filterInputSearch);

        this.filterInputSearch.autH_STATUS = AuthStatusConsts.Approve;
        this.filterInputSearch.recorD_STATUS = RecordStatusConsts.Active;

        if (checkAll) {
            this.filterInputSearch.maxResultCount = -1;
        }

        var result = await this.divisionService.cM_DIVISION_Search(this.filterInputSearch)
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