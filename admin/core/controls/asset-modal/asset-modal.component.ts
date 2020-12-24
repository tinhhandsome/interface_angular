import { ViewEncapsulation, Injector, Component, ViewChild, Output, EventEmitter, Input, AfterViewInit, Optional, Inject } from "@angular/core";
import { ASS_MASTER_ENTITY, AssMasterServiceProxy, AssAmortStatusServiceProxy, AssStatusServiceProxy, AssGroupServiceProxy, AssTypeServiceProxy, ASS_GROUP_ENTITY, ASS_TYPE_ENTITY, ASS_STATUS_ENTITY, ASS_AMORT_STATUS_ENTITY, CM_BRANCH_ENTITY, CM_DEPARTMENT_ENTITY, API_BASE_URL } from "@shared/service-proxies/service-proxies";
import { finalize } from "rxjs/operators";
import { PopupBaseComponent } from "../../ultils/popup-base.component";
import { AuthStatusConsts } from "../../ultils/consts/AuthStatusConsts";
import { RecordStatusConsts } from "../../ultils/consts/RecordStatusConsts";
import { DepartmentModalComponent } from "../dep-modal/department-modal.component";
import { Select2CustomComponent } from "../custom-select2/select2-custom.component";
import { HttpClient } from "@angular/common/http";

@Component({
    selector: "asset-modal",
    templateUrl: "./asset-modal.component.html",
    encapsulation: ViewEncapsulation.None
})
export class AssetModalComponent extends PopupBaseComponent<ASS_MASTER_ENTITY> {

    planMonth: number = 0;
    planLiq: number = 0;
    totalPrice: number;
    subbrId: string = '';
    userName: string = '';
    branchName: string = '';
    branchType: string = '';
    //private typeIdDefault:string = null
    protected baseUrl: string;
    assGroups: ASS_GROUP_ENTITY[];
    assTypes: ASS_TYPE_ENTITY[];
    assStatuses: ASS_STATUS_ENTITY[];
    assAmortStatuses: ASS_AMORT_STATUS_ENTITY[];
    departments: CM_DEPARTMENT_ENTITY[]

    
    protected assMasterService: AssMasterServiceProxy;
    protected assGroupService: AssGroupServiceProxy;
    protected assTypeService: AssTypeServiceProxy;
    protected assStatusService: AssStatusServiceProxy;
    protected assAmortStatusService: AssAmortStatusServiceProxy;
    protected httpClient: HttpClient;


    @Input() isDepFieldSelect2: boolean = false;
    @Input() isGroupColMd2: boolean = false; // field năm mua ts + số kì KH có div class='col-md-2'

    @Output() onEmitPlanMonth: EventEmitter<number> = new EventEmitter<number>();
    @Output() onEmitPlanLiq: EventEmitter<number> = new EventEmitter<number>();

    @ViewChild('departmentModal') departmentModal: DepartmentModalComponent;
    @ViewChild('depSelect')depSelect: Select2CustomComponent;
    @Input() popupTitle : string;
    
    constructor(injector: Injector,
        @Optional() @Inject(API_BASE_URL) baseUrl?: string
    ) {
        super(injector);

        this.assMasterService = injector.get(AssMasterServiceProxy);
        this.assGroupService= injector.get(AssGroupServiceProxy);
        this.assTypeService= injector.get(AssTypeServiceProxy);
        this.assStatusService= injector.get(AssStatusServiceProxy);
        this.assAmortStatusService= injector.get(AssAmortStatusServiceProxy); 
        this.httpClient= injector.get(HttpClient);

        // this.pagingClient = true;
        this.baseUrl = baseUrl ? baseUrl : "";
        this.filterInput = new ASS_MASTER_ENTITY();
        this.filterInputSearch = this.filterInput;
        this.keyMember = 'asseT_ID';
        this.popupTitle = this.l('Search') + ' ' + this.l('Asset').toLowerCase();
        this.onInitFilter();
    }

    get isAssetTypeDisabled(): boolean {
        if(!this.disableFields || this.disableFields.indexOf('asseT_TYPE') < 0)
            return false;
        return true;
    }

    // get isDisabledDeparment(): boolean {
    //     return this.filterInput.brancH_ != 'HS';
    // }

    ngAfterViewInit() {
        super.ngAfterViewInit();
    }

    getUserLoginInfo(): void {
        var temp = this.appSession.user;
        this.userName = temp.userName;
        this.subbrId = temp.subbrId;
        this.branchName = temp.branchName;
        this.branchType = temp.branch.brancH_TYPE;
    }

    async getResult(checkAll: boolean = false): Promise<any> {

        this.setSortingForFilterModel(this.filterInputSearch);
        this.bindingFilter() 


        if (checkAll) {
            this.filterInputSearch.maxResultCount = -1;
        }
        let result = await this.httpClient.post(this.baseUrl + '/api/AssMaster/ASS_MASTER_Search', this.filterInputSearch).pipe(finalize(() => this.hideTableLoading())).toPromise();
        result = result['result'];
        // var result = await this.assMasterService.aSS_MASTER_Search(this.filterInputSearch)
        //     .pipe(finalize(() => this.hideTableLoading())).toPromise();

        if(result['items'] && result['items']['length'] > 0)
            result['items'].forEach(item => item.toJSON = this.tojsonf)
            
        if (checkAll) {
            this.selectedItems = result['items'];
        }
        else {
            this.dataTable.records = result['items'];
            this.dataTable.totalRecordsCount = result['totalCount'];
            this.filterInputSearch.totalCount = result['totalCount'];
        }
        return result;
    }

    accept() {
        this.onEmitPlanMonth.emit(this.planMonth);
        this.onEmitPlanLiq.emit(this.planLiq);
        super.accept();
    }
    onInitFilter(): void {
        this.filterInput.level = 'UNIT';

        this.filterInput.brancH_NAME = this.branchName;
        this.filterInput.brancH_ID = this.filterInput.brancH_LOGIN = this.subbrId;
        this.filterInput.top = 1000;

        this.getUserLoginInfo();
        this.onGetTypes();
        
        this.getAssStatusList();
        this.getAssAmortStatusList();
    }

    getAssStatusList(): void {
        this.assStatusService.aSS_STATUS_Lst().subscribe(response => {
            this.assStatuses = response;
        });
    }

    getAssAmortStatusList(): void {
        this.assAmortStatusService.aSS_AMORT_STATUS_Lst().subscribe(response => {
            this.assAmortStatuses = response;
        });
    }

    onGetTypes(): void {
        this.assTypeService.aSS_TYPE_Lis().subscribe(response => {
            this.assTypes = response;
        });
        this.onGetAssGroups({typE_ID: this.filterInput.typE_ID } as ASS_TYPE_ENTITY)
    }

    onGetAssGroups(entity: ASS_TYPE_ENTITY) {
        if (!this.isAssetTypeDisabled) {
            this.filterInput.typE_ID = !this.isNull(entity) ? entity.typE_ID : ''
        }
        // if(this.filterInput && !this.filterInput.typE_ID){
        //     this.assGroups = [];
        //     this.updateView();
        //     return;
        // }

        this.assGroupService.aSS_GROUP_ByType(this.filterInput.typE_ID).subscribe(response => {
            this.assGroups = response;
            this.updateView()
        });
    }

    onSelectDepartment(department: CM_DEPARTMENT_ENTITY) {
        if(this.isDepFieldSelect2)
        this.depSelect.setSingleValue(department.deP_ID, department.deP_NAME); 
        this.filterInput.depT_ID = department.deP_ID;
        this.filterInput.deP_NAME = department.deP_NAME;
    }

    onSelectBranch(branch: CM_BRANCH_ENTITY) {
        this.filterInput.brancH_NAME = branch.brancH_NAME;
        this.filterInput.brancH_ID = branch.brancH_ID;
        this.branchType = branch.brancH_TYPE;
        if(this.isDepFieldSelect2)
        if(this.branchType != 'HS'){
            this.filterInput.depT_ID = this.filterInput.deP_NAME = '';
            this.depSelect.setSingleValue('', '');
        }
    }

    onDepartmentFocusOut() {
        // if (!this.filterInput.deP_NAME) {
        //     this.onSelectDepartment({} as CM_DEPARTMENT_ENTITY);
        // }
    }

    onBranchFocusOut() {
        // if (!this.filterInput.brancH_NAME) {
        //     this.onSelectBranch({} as CM_BRANCH_ENTITY);
        // }
    }

    bindingFilter() {
        this.setAmortStatus();
    }
    setAmortStatus() {
        // this.filterInput.amorT_STATUS = this.filterInput['amorT_STATUS_TMP'];
    }
}