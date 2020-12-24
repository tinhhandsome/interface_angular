import { ViewEncapsulation, Injector, Component, Input } from "@angular/core";
import { ASS_GROUP_ENTITY, AssGroupServiceProxy, BranchServiceProxy, CM_BRANCH_ENTITY, ASS_TYPE_ENTITY, AssTypeServiceProxy } from "@shared/service-proxies/service-proxies";
import { finalize } from "rxjs/operators";
import { AuthStatusConsts } from "../../ultils/consts/AuthStatusConsts";
import { RecordStatusConsts } from "../../ultils/consts/RecordStatusConsts";
import { PopupBaseComponent } from "../../ultils/popup-base.component";

@Component({
    selector: "ass-group-modal",
    templateUrl: "./ass-group-modal.component.html",
    encapsulation: ViewEncapsulation.None
})
export class AssGroupModalComponent extends PopupBaseComponent<ASS_GROUP_ENTITY> {

    constructor(injector: Injector,
        private _assTypeService: AssTypeServiceProxy,
        private assGroupService: AssGroupServiceProxy) {
        super(injector);
        this.filterInput = new ASS_GROUP_ENTITY();
        this.filterInputSearch = this.filterInput;
        this.filterInputSearch.top = 200;
        this.keyMember = 'grouP_ID';

        this.initCombobox();
    }

    assTypes: ASS_TYPE_ENTITY[];
    @Input() labelTitle : string = this.l('AssGroupTitleModal');
    @Input() showColGroupCode : boolean = true;
    @Input() showColGroupName: boolean = true;
    @Input() showColTypeName : boolean = true;
    @Input() showColParentCode : boolean = true;
    @Input() showColAuthStatus : boolean = true;

    // @Input() disableAssGroupCode : boolean = false;
    // @Input() disableAssGroupName : boolean = false;
    @Input() disableAssType : boolean = false;


    initCombobox() {
        this._assTypeService.aSS_TYPE_Search(this.getFillterForCombobox()).subscribe(response => {
            this.assTypes = response.items;
        });
    }
    ngAfterViewInit() {
        super.ngAfterViewInit();

    }
    async getResult(checkAll: boolean = false): Promise<any> {

        this.setSortingForFilterModel(this.filterInputSearch);

        // this.filterInputSearch.autH_STATUS = AuthStatusConsts.Approve;
        // this.filterInputSearch.recorD_STATUS = RecordStatusConsts.Active;

        if (checkAll) {
            this.filterInputSearch.maxResultCount = -1;
        }

        var result = await this.assGroupService.aSS_GROUP_Search(this.filterInputSearch)
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