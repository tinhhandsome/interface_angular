import { ViewEncapsulation, Injector, Component, ViewChild, Output, EventEmitter, Input } from "@angular/core";
import { ComponentBase } from "@app/ultilities/component-base";
import { PopupFrameComponent } from "../popup-frames/popup-frame.component";
import { ListComponentBase } from "@app/ultilities/list-component-base";
import { CM_DEPARTMENT_ENTITY, DepartmentServiceProxy, DeptGroupServiceProxy, CM_DEPT_GROUP_ENTITY } from "@shared/service-proxies/service-proxies";
import { finalize } from "rxjs/operators";
import { AuthStatusConsts } from "../../ultils/consts/AuthStatusConsts";
import { RecordStatusConsts } from "../../ultils/consts/RecordStatusConsts";
import { PopupBaseComponent } from "../../ultils/popup-base.component";

@Component({
    selector: "dep-modal",
    templateUrl: "./department-modal.component.html",
    encapsulation: ViewEncapsulation.None
})
export class DepartmentModalComponent extends PopupBaseComponent<CM_DEPARTMENT_ENTITY> {

    constructor(injector: Injector,
        private departmentService: DepartmentServiceProxy,
        private deptGroupService: DeptGroupServiceProxy, ) {
        super(injector);
        this.filterInput = new CM_DEPARTMENT_ENTITY();
        this.keyMember = 'deP_ID';
        
        this.initCombobox();
    }


    deptGroups: CM_DEPT_GROUP_ENTITY[];

    initCombobox() {
        this.deptGroupService.cM_DEPT_GROUP_Search(this.getFillterForCombobox()).subscribe(response => {
            this.deptGroups = response.items;
        });
    }

    async getResult(checkAll: boolean = false): Promise<any> {
        this.filterInputSearch = this.filterInput;
        this.setSortingForFilterModel(this.filterInputSearch);

        this.filterInputSearch.recorD_STATUS = RecordStatusConsts.Active;

        if (checkAll) {
            this.filterInputSearch.maxResultCount = -1;
        }

        var result = await this.departmentService.cM_DEPARTMENT_Search(this.filterInputSearch)
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