import { ViewEncapsulation, Injector, Component, ViewChild, Output, EventEmitter, Input } from "@angular/core";
import { ComponentBase } from "@app/ultilities/component-base";
import { PopupFrameComponent } from "../popup-frames/popup-frame.component";
import { ListComponentBase } from "@app/ultilities/list-component-base";
import { CM_EMPLOYEE_ENTITY, EmployeeServiceProxy, DeptGroupServiceProxy, CM_DEPT_GROUP_ENTITY, BranchServiceProxy, CM_BRANCH_ENTITY } from "@shared/service-proxies/service-proxies";
import { finalize } from "rxjs/operators";
import { AuthStatusConsts } from "../../ultils/consts/AuthStatusConsts";
import { RecordStatusConsts } from "../../ultils/consts/RecordStatusConsts";
import { PopupBaseComponent } from "../../ultils/popup-base.component";

@Component({
    selector: "employee-modal",
    templateUrl: "./employee-modal.component.html",
    encapsulation: ViewEncapsulation.None
})
export class EmployeeModalComponent extends PopupBaseComponent<CM_EMPLOYEE_ENTITY> {

    constructor(injector: Injector,
        private employeeService: EmployeeServiceProxy,
        private branchService: BranchServiceProxy) {
        super(injector);
        this.filterInput = new CM_EMPLOYEE_ENTITY();
        this.keyMember = 'deP_ID';
        this.filterInput.level = 'UNIT';
        //    this.filterInput.brancH_ID = this.appSession.user.subbrId;
        //    this.filterInput.pgd = this.appSession.user.branchName;
        this.filterInput.top = 300;
        this.filterInput.autH_STATUS = AuthStatusConsts.Approve;

        this.initCombobox();
    }
    @Input() labelTitle: string = this.l('EmployeeModalTitle')

    @Input() showEmployeeCode: boolean = true

    @Input() showColKhuVuc: boolean = true
    @Input() showColChiNhanh: boolean = true
    @Input() showColPGD: boolean = true
    @Input() showColEmployeeName: boolean = true

    branchs: CM_BRANCH_ENTITY[];

    initCombobox() {
        this.branchService.cM_BRANCH_Search(this.getFillterForCombobox()).subscribe(response => {
            this.branchs = response.items;
            this.updateParentView();
        });
    }

    async getResult(checkAll: boolean = false): Promise<any> {

        this.setSortingForFilterModel(this.filterInputSearch);

        // this.filterInputSearch.recorD_STATUS = RecordStatusConsts.Active;

        if (!this.filterInputSearch.brancH_ID) {
            this.filterInputSearch.brancH_ID = this.appSession.user.subbrId;
        }

        if (checkAll) {
            this.filterInputSearch.maxResultCount = -1;
        }

        var result = await this.employeeService.cM_EMPLOYEE_Search(this.filterInputSearch)
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