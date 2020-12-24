import { ViewEncapsulation, Injector, Component, ViewChild, Output, EventEmitter, Input } from "@angular/core";
import { PopupFrameComponent } from "../popup-frames/popup-frame.component";
import { ListComponentBase } from "@app/ultilities/list-component-base";
import { TR_PROJECT_ENTITY, ProjectServiceProxy } from "@shared/service-proxies/service-proxies";
import { finalize } from "rxjs/operators";
import { AuthStatusConsts } from "../../ultils/consts/AuthStatusConsts";
import { RecordStatusConsts } from "../../ultils/consts/RecordStatusConsts";
import { PopupBaseComponent } from "../../ultils/popup-base.component";

@Component({
    selector: "trade-project-modal",
    templateUrl: "./trade-project-modal.component.html",
    encapsulation: ViewEncapsulation.None
})
export class ProjectModalComponent extends PopupBaseComponent<TR_PROJECT_ENTITY> {

    constructor(injector: Injector,
        private projectService: ProjectServiceProxy) {
        super(injector);
        this.filterInput = new TR_PROJECT_ENTITY();
        this.keyMember = 'projecT_ID';
        this.filterInput.autH_STATUS = AuthStatusConsts.Approve;
        this.filterInput.top = 100;
    }
    @Input() branchTitle: string = this.l('Search')  + ' ' + this.l('Project').toLowerCase();
    @Input() showColProjectCode: boolean = true
    @Input() showColProjectName: boolean = true
    @Input() showColCreateDt: boolean = true
   

    async getResult(checkAll: boolean = false): Promise<any> {

        this.setSortingForFilterModel(this.filterInputSearch);

        if (checkAll) {
            this.filterInputSearch.maxResultCount = -1;
        }

        var result = await this.projectService.tR_PROJECT_Search(this.filterInputSearch)
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