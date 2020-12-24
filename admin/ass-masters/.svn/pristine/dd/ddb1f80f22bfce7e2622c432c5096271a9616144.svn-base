import { ListComponentBase } from "@app/ultilities/list-component-base";
import { Injector, Component, OnInit, ViewEncapsulation, AfterViewInit } from "@angular/core";
import { AssGroupServiceProxy, ASS_GROUP_ENTITY, ASS_TYPE_ENTITY, AssTypeServiceProxy, ReportInfo, AsposeServiceProxy, } from "@shared/service-proxies/service-proxies";
import { LazyLoadEvent } from "primeng/api";
import { IUiAction } from "@app/ultilities/ui-action";
import { appModuleAnimation } from "@shared/animations/routerTransition";
import { FileDownloadService } from "@shared/utils/file-download.service";
import { finalize } from "rxjs/operators";
import { ReportTypeConsts } from "@app/admin/core/ultils/consts/ReportTypeConsts";

@Component({
    templateUrl: './ass-group-list.component.html',
    encapsulation: ViewEncapsulation.None,
    animations: [appModuleAnimation()]
})

export class AssGroupListComponent extends ListComponentBase<ASS_GROUP_ENTITY> implements IUiAction<ASS_GROUP_ENTITY>, OnInit, AfterViewInit {

    filterInput: ASS_GROUP_ENTITY = new ASS_GROUP_ENTITY();
    assTypes: ASS_TYPE_ENTITY[];
    assGroupParents: ASS_GROUP_ENTITY[];

    constructor(injector: Injector,
        private _assTypeService: AssTypeServiceProxy,
        private asposeService: AsposeServiceProxy,
        private fileDownloadService: FileDownloadService,
        private _assGroupService: AssGroupServiceProxy) {
        super(injector);
        this.initFilter();
    }

    initDefaultFilter() {
        this.filterInput.top = 200;
    }

    ngOnInit(): void {
        // set ui action
        this.appToolbar.setUiAction(this);
        // set role toolbar
        this.appToolbar.setRole('AssGroup', true, true, false, true, true, true, false, true);
        this.appToolbar.setEnableForListPage();

        this.initCombobox();
    }

    ngAfterViewInit(): void {
        // COMMENT: this.stopAutoUpdateView();
    }

    initCombobox() {
        this._assTypeService.aSS_TYPE_Search(this.getFillterForCombobox()).subscribe(response => {
            this.assTypes = response.items;
            this.updateView();
        });
        this._assGroupService.aSS_GROUP_ByIsLeaf().subscribe(response => {
            response.unshift({
                grouP_ID: ' ',
                grouP_NAME: this.l('NullSelect')
            } as any);
            this.assGroupParents = response;
            this.updateView();
        });
    }

    onAssGroupParentChange(assGroup: ASS_GROUP_ENTITY) {
        if (assGroup && assGroup.grouP_ID == ' ') {
            this.filterInput.iS_LEAF = 'N';
            this.filterInput.grouP_LEVEL = 1;
        }
        else {
            this.filterInput.iS_LEAF = undefined;
            this.filterInput.grouP_LEVEL = undefined;
        }
    }

    exportToExcel() {
        let reportInfo = new ReportInfo();
        reportInfo.typeExport = ReportTypeConsts.Excel;

        let reportFilter = { ...this.filterInputSearch };

        reportFilter.maxResultCount = -1;

        reportInfo.parameters = this.GetParamsFromFilter(reportFilter)

        reportInfo.values = this.GetParamsFromFilter({
            A1: this.l('CompanyReportHeader')
        });

        reportInfo.pathName = "/COMMON/BC_ASS_GROUP.xlsx";
        reportInfo.storeName = "rpt_BC_ASS_GROUP";

        this.asposeService.getReport(reportInfo).subscribe(x => {
            this.fileDownloadService.downloadTempFile(x);
        });
    }

    search(): void {
        this.showTableLoading();

        this.setSortingForFilterModel(this.filterInputSearch);
        this.appToolbar.setEnableForListPage();

        this._assGroupService.aSS_GROUP_Search(this.filterInputSearch)
            .pipe(finalize(() => this.hideTableLoading()))
            .subscribe(result => {
                this.dataTable.records = result.items;
                this.dataTable.totalRecordsCount = result.totalCount;
                this.filterInputSearch.totalCount = result.totalCount;
                this.appToolbar.setEnableForListPage();
                this.updateView();
            });
    }

    onAdd(): void {
        this.navigatePassParam('/app/admin/ass-group-add', null, { filterInput: JSON.stringify(this.filterInputSearch) });
    }

    onUpdate(item: ASS_GROUP_ENTITY): void {
        this.navigatePassParam('/app/admin/ass-group-edit', { id: item.grouP_ID }, { filterInput: JSON.stringify(this.filterInputSearch) });
    }

    onDelete(item: ASS_GROUP_ENTITY): void {
        this.message.confirm(
            this.l('DeleteWarningMessage', item.grouP_NAME),
            this.l('AreYouSure'),
            (isConfirmed) => {
                if (isConfirmed) {
                    this.saving = true;
                    this._assGroupService.aSS_GROUP_Del(item.grouP_ID)
                        .pipe(finalize(() => { this.saving = false; }))
                        .subscribe((response) => {
                            if (response.result != '0') {
                                this.showErrorMessage(response.errorDesc);
                            }
                            else {
                                this.showSuccessMessage(this.l('SuccessfullyDeleted'));
                                this.filterInputSearch.totalCount = 0;
                                this.reloadPage();
                            }
                        });
                }
            }
        );
    }

    onApprove(item: ASS_GROUP_ENTITY): void {

    }

    onViewDetail(item: ASS_GROUP_ENTITY): void {
        this.navigatePassParam('/app/admin/ass-group-view', { id: item.grouP_ID }, { filterInput: JSON.stringify(this.filterInputSearch) });
    }

    onSave(): void {

    }



    onResetSearch(): void {
        this.filterInput = new ASS_GROUP_ENTITY();
        this.changePage(0);
    }
}
