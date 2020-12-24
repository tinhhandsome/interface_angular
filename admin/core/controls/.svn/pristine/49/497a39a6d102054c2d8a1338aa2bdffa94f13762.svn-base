import { ViewEncapsulation, Injector, Component, Input } from "@angular/core";
import { TLUSER_GETBY_BRANCHID_ENTITY, CmUserServiceProxy, RoleListDto, RoleServiceProxy } from "@shared/service-proxies/service-proxies";
import { finalize } from "rxjs/operators";
import { PopupBaseComponent } from "../../ultils/popup-base.component";

@Component({
    selector: "user-modal",
    templateUrl: "./user-modal.component.html",
    encapsulation: ViewEncapsulation.None
})
export class UserModalComponent extends PopupBaseComponent<TLUSER_GETBY_BRANCHID_ENTITY> {


    constructor(injector: Injector,
        private roleService: RoleServiceProxy,
        private userService: CmUserServiceProxy) {
        super(injector);
        this.filterInput = new TLUSER_GETBY_BRANCHID_ENTITY();
        this.keyMember = 'tlnanme';
        this.initCombobox();
        
        // this.initFilterInput();
    }

    roles: RoleListDto[] = [];
    
    initCombobox() {
        this.roleService.getRoles(undefined, undefined).subscribe(result => {
            this.roles = result.items;
        });
    }

    initFilterInput() {
        this.filterInput.tlnanme = this.filterInput.roleName = this.filterInput.autH_STATUS = '%';
    }

    async getResult(checkAll: boolean = false): Promise<any> {
        this.filterInputSearch = this.filterInput;
        this.setSortingForFilterModel(this.filterInputSearch);

        this.filterInputSearch.tlsubbrid = this.appSession.user.subbrId;

        if (checkAll) {
            this.filterInputSearch.maxResultCount = -1;
        }

        var result = await this.userService.tLUSER_GETBY_BRANCHID(this.filterInputSearch)
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

    getRolesAsString(roles): string {
        let roleNames = '';

        for (let j = 0; j < roles.length; j++) {
            if (roleNames.length) {
                roleNames = roleNames + ', ';
            }
            roleNames = roleNames + roles[j].roleName;
        }

        return roleNames;
    }

}