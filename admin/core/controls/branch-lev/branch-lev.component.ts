import { Component, Input, OnInit, Injector, ViewEncapsulation, Output, ViewChild } from "@angular/core";
import { createCustomInputControlValueAccessor, ControlComponent } from "@app/admin/core/controls/control.component";
import { LocationServiceProxy, CM_DISTRICT, CM_WARD, CM_NATION, CM_PROVINCE, CM_LOCATION_ENTITY, BranchServiceProxy, CM_BRANCH_ENTITY, CM_BRANCH_LEV_ENTITY } from "@shared/service-proxies/service-proxies";
import { Select2CustomComponent } from "../custom-select2/select2-custom.component";


declare var $: JQueryStatic;

@Component({
    selector: "branch-lev",
    templateUrl: "./branch-lev.component.html",
    encapsulation: ViewEncapsulation.None,
    providers: [createCustomInputControlValueAccessor(BranchLevComponent)]
})

export class BranchLevComponent extends ControlComponent implements OnInit {
    constructor(injector: Injector,
        private branchService: BranchServiceProxy) {
        super(injector);
        // console.log(this);
    }

    branchLev: CM_BRANCH_LEV_ENTITY = new CM_BRANCH_LEV_ENTITY();

    areas: CM_BRANCH_ENTITY[];
    branchs: CM_BRANCH_ENTITY[];
    subBranchs: CM_BRANCH_ENTITY[];

    area: string;
    branch: string;
    subBranch: string;

    @Input() disabled: boolean;

    private _branchLogin: string;
    private _ngModel: string;

    @Input() get branchLogin() {
        return this._branchLogin;
    }

    @ViewChild('areaControl') areaControl : Select2CustomComponent;
    @ViewChild('branchControl') branchControl : Select2CustomComponent;
    @ViewChild('subBranchControl') subBranchControl : Select2CustomComponent;

    initList() {
        this.branchService.cM_BRANCH_Lev(this.branchLogin).subscribe(response => {

            let branchId = this._ngModel || this._branchLogin;
            let isheadquarter = branchId &&
                (response.areas.firstOrDefault(x => x.brancH_ID == branchId) ||
                    response.branchs.firstOrDefault(x => x.brancH_ID == branchId) ||
                    response.subBranchs.firstOrDefault(x => x.brancH_ID == branchId) == undefined);

            if (isheadquarter) {
                branchId = response.areas.firstOrDefault(undefined).brancH_ID;
                this.ngModel = branchId;
            }

            this.branchLev = response;

            this.areas = this.branchLev.areas;

            this.branchLev.subBranchs.forEach(s => {
                let areaId = this.branchLev.branchs.firstOrDefault(b => b.brancH_ID == s.fatheR_ID, {}).fatheR_ID;

                s['SUB_BRANCH'] = s.brancH_ID;
                s['BRANCH'] = s.fatheR_ID;
                s['AREA'] = areaId;
            });

            this.branchLev.branchs.forEach(b => {
                b['BRANCH'] = b.brancH_ID;
                b['AREA'] = b.fatheR_ID;
            });

            this.branchLev.areas.forEach(a => {
                a['AREA'] = a.brancH_ID;
            });

            if (this.ngModel) {
                this.setValueBranchLev(this.ngModel);
            }
            else {
                this.setValueBranchLev(this.branchLogin);
            }

            this.updateView();
        })
    }


    set branchLogin(branchId: string) {
        if (!this._branchLogin) {
            this._branchLogin = branchId;
        }

        this.initList();
    }

    @Input() get ngModel(): string {
        return this._ngModel;
    }

    set ngModel(branchId: string) {
        if (!branchId) {
            return;
        }
        this._ngModel = branchId;
        if (this.areas) {
            this.setValueBranchLev(branchId);
        }
    }

    afterViewInit() {
        // COMMENT: this.stopAutoUpdateView();
    }

    ngOnInit(): void {

    }

    getFirstOrDefault(list: any[], defaultValue = undefined) {
        if (list.length == 0) {
            return defaultValue;
        }
        return list[0];
    }

    setValueBranchLev(value) {
        if (!value) {
            return;
        }

        let branchLev: CM_BRANCH_ENTITY = undefined;

        branchLev = this.branchLev.subBranchs.firstOrDefault(a => a['SUB_BRANCH'] == value) ||
            this.branchLev.branchs.firstOrDefault(a => a['BRANCH'] == value) ||
            this.branchLev.areas.firstOrDefault(a => a['AREA'] == value);

        if (branchLev['AREA']) {
            this.area = branchLev['AREA'];
            this.updateView();
        }
        if (branchLev['BRANCH']) {
            this.branch = branchLev['BRANCH'];
            this.updateView();
        }
        if (branchLev['SUB_BRANCH']) {
            this.subBranch = branchLev['SUB_BRANCH'];
            this.updateView();
        }
    }

    setNgModel(value) {
        this._ngModel = value;
        this.sendValueOut(value);
        this.updateView();
    }

    onChangeArea(area: CM_BRANCH_ENTITY) {
        if (!area) {
            return;
        }

        this.branchs = this.branchLev.branchs.filter(x => x['AREA'] == area['AREA']);
        this.subBranchs = [];
        this.setNgModel(area['AREA']);

        this.branchControl.ngModel = '';
        this.subBranchControl.ngModel = '';
    }

    onChangeBranch(branch: CM_BRANCH_ENTITY) {
        if (!branch) {
            return;
        }
        this.subBranchs = this.branchLev.subBranchs.filter(x => x['BRANCH'] == branch['BRANCH']);
        this.setNgModel(branch['BRANCH']);
        
        this.subBranchControl.ngModel = '';
    }

    onChangeSubBranch(subBranch: CM_BRANCH_ENTITY) {
        if (!subBranch) {
            return;
        }
        this.setNgModel(subBranch['SUB_BRANCH']);
    }

}