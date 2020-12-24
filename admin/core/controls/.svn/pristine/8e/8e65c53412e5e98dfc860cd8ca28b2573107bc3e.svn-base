import { ViewEncapsulation, Injector, Component, ViewChild, Output, EventEmitter, Input, ChangeDetectionStrategy, Optional, Inject } from "@angular/core";
import { ASS_MASTER_ENTITY, AssMasterServiceProxy, AssAmortStatusServiceProxy, AssStatusServiceProxy, AssGroupServiceProxy, AssTypeServiceProxy, ASS_GROUP_ENTITY, ASS_TYPE_ENTITY, ASS_STATUS_ENTITY, ASS_AMORT_STATUS_ENTITY, CM_BRANCH_ENTITY, CM_DEPARTMENT_ENTITY, API_BASE_URL } from "@shared/service-proxies/service-proxies";
import { finalize } from "rxjs/operators";
import { PopupBaseComponent } from "../../ultils/popup-base.component";
import { AuthStatusConsts } from "../../ultils/consts/AuthStatusConsts";
import { RecordStatusConsts } from "../../ultils/consts/RecordStatusConsts";
import { DepartmentModalComponent } from "../dep-modal/department-modal.component";
import { AssetModalComponent } from "./asset-modal.component";
import { CoreTableComponent } from "../core-table/core-table.component";
import { HttpClient } from "@angular/common/http";
import *  as moment from 'moment';

@Component({
    selector: "asset-modal-sk",
    templateUrl: "./asset-modal.component.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})
export class AssetSkModalComponent extends AssetModalComponent {

    protected baseUrl: string;

    constructor(injector: Injector,
        @Optional() @Inject(API_BASE_URL) baseUrl?: string
    ) {
        super(injector, baseUrl);
        this.baseUrl = baseUrl ? baseUrl : "";
    }

    @Input() @ViewChild('coreTable') coreTable: CoreTableComponent<ASS_MASTER_ENTITY>;
    @Input() isPagingClient: boolean = false;



    async getResult(checkAll: boolean = false): Promise<any> {
        this.pagingClient = this.isPagingClient;
        this.setAmortStatus();
        this.setSortingForFilterModel(this.filterInputSearch);
        this.bindingFilter()

        if (checkAll) {
            this.filterInputSearch.maxResultCount = -1;
        }
        this.showTableLoading();

        // console.time('assMasterSk2')
        var result: any;
        if (this.isPagingClient) {
            result = await this.httpClient.post(this.baseUrl + '/api/AssMaster/ASS_MASTER_Search_SK2', this.filterInputSearch).pipe(finalize(() => this.hideTableLoading())).toPromise();
            result = result['result'];

            result['items'].forEach(item => {
                item['toJSON'] = this.tojsonf;
            })
        }
        else {
            // this.pagingClient = false;
            result = await this.assMasterService.aSS_MASTER_Search_SK(this.filterInputSearch)
                .pipe(finalize(() => this.hideTableLoading())).toPromise();
        }
        // console.timeEnd('assMasterSk2')



        // var result = await this.assMasterService.aSS_MASTER_Search_SK(this.filterInputSearch)
        //     .pipe(finalize(() => this.hideTableLoading())).toPromise();
        // if(result['items']) result['items'] = this.setBuyDate(result['items']);
        if (checkAll) {
            this.selectedItems = result['items'];
        }
        else {
            this.setRecords(result);
            // this.dataTable.records = result.items;
            // this.dataTable.totalRecordsCount = result.totalCount;
            // this.filterInputSearch.totalCount = result.totalCount
        }


        return result;
    }

    setAmortStatus() {
        // let amrtStatus = this.filterInput.amorT_STATUS;
        if (this.isNull(this.filterInput.amorT_STATUS)) {
            this.filterInputSearch.amorT_STATUS =
                this.assAmortStatuses
                    .filter(x => x.statuS_CODE)
                    .map(x => x.statuS_CODE + ',')
                    .join('');
        }
        // else {
        //     this.filterInput.amorT_STATUS = amrtStatus;
        // }
    }

    // setBuyDate(result: any) : any {
    //     result.forEach(item => {
    //         item.buY_DATE = item["buY_DATE"] ? moment(item["buY_DATE"].toString()).format('DD/MM/YYYY') : <any>undefined;
    //     });
    //     return result;
    // }
}