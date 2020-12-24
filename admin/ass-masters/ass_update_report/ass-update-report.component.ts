import { ListComponentBase } from "@app/ultilities/list-component-base";
import { Injector, Component, OnInit, ViewEncapsulation, ViewChild, AfterViewChecked, AfterViewInit } from "@angular/core";
import { ASS_UPDATE_REPORT_ENTITY, AssUpdateReportServiceProxy, ASS_GROUP_ENTITY, AssGroupServiceProxy, ASS_UPDATE_REPORT_LIST, UltilityServiceProxy } from "@shared/service-proxies/service-proxies";
import { LazyLoadEvent } from "primeng/api";
import { IUiAction } from "@app/ultilities/ui-action";
import { appModuleAnimation } from "@shared/animations/routerTransition";
import { finalize } from "rxjs/operators";
import * as moment from 'moment';

@Component({
    templateUrl: './ass-update-report.component.html',
    encapsulation: ViewEncapsulation.None,
    animations: [appModuleAnimation()]
})

export class AssUpdateReportComponent extends ListComponentBase<ASS_UPDATE_REPORT_ENTITY> implements IUiAction<ASS_UPDATE_REPORT_ENTITY>, OnInit, AfterViewInit {
    filterInput: ASS_UPDATE_REPORT_ENTITY = new ASS_UPDATE_REPORT_ENTITY();
    updateinput: ASS_UPDATE_REPORT_LIST = new ASS_UPDATE_REPORT_LIST();
    updatelist: ASS_UPDATE_REPORT_ENTITY[] = [];
    assgroups: ASS_GROUP_ENTITY[];
    totalcount: number;
    checkAll: boolean;
    isApproveFunct: boolean;

    constructor(injector: Injector,
        private ultilityService: UltilityServiceProxy,
        private assUpdateReportService: AssUpdateReportServiceProxy,
        private assGroupService: AssGroupServiceProxy
    ) {
        super(injector);
        this.initFilter();
        this.initIsApproveFunct();

    }

    ngAfterViewInit(): void {
        // COMMENT: this.stopAutoUpdateView();
        this.setupValidationMessage();
    }

    ngOnInit(): void {

        this.appToolbar.setRole('AssUpdateReport', false, false, true, false, false, true, false, false);
        this.appToolbar.isList = false;
        this.appToolbar.isEdit = false;
        this.appToolbar.setButtonSaveEnable(true);
        this.appToolbar.setButtonSearchEnable(true);
        this.appToolbar.isAssUpdateReport = true;
        this.appToolbar.setUiAction(this);
        this.filterInput.date = moment();
        this.filterInput.price = 0;
        this.filterInput.searcH_TYPE = 'I';
        this.initCombobox();
    }

    initIsApproveFunct() {
        this.ultilityService.isApproveFunct(this.getCurrentFunctionId()).subscribe(isApproveFunct => {
            this.isApproveFunct = isApproveFunct;
            this.updateView();
        })
    }

    initCombobox() {
        this.assGroupService.aSS_GROUP_Search(this.getFillterForCombobox()).subscribe(response => {
            this.assgroups = response.items;
            this.updateView();
        })
    }

    search(): void {
        this.showTableLoading();
        if (this.filterInputSearch.searcH_TYPE == null)
            this.filterInputSearch.searcH_TYPE = "I";
        this.setSortingForFilterModel(this.filterInputSearch);
        this.assUpdateReportService.aSS_UPDATE_REPORT_Search(this.filterInputSearch)
            .pipe(finalize(() => this.hideTableLoading()))
            .subscribe(result => {
                if (this.checkAll)
                    result.items.forEach(x => {
                        x.isChecked = this.checkAll;
                    });
                else
                    result.items.forEach(x => {
                        x.isChecked = this.isChecked(x);
                    });
                this.dataTable.records = result.items;
                this.dataTable.totalRecordsCount = result.totalCount;
                this.filterInputSearch.totalCount = result.totalCount;
                this.totalcount = result.totalCount;
                this.updateView();
            });

    }

    saveInput() {
        this.appToolbar.setEnable(false);
        if (this.isApproveFunct == undefined) {
            this.showErrorMessage(this.l('PageLoadUndone'));
            this.appToolbar.setEnable(true);
            this.updateView();
            return;
        }
        if (this.updatelist.length == 0) {
            this.showErrorMessage(this.l('UpdateListEmpty'));
            this.appToolbar.setEnable(true);
            this.updateView();
            return;
        }
        this.message.confirm(
            this.l('UpdateReportWarningMessage'),
            this.l('AreYouSure'),
            (isConfirmed) => {
                if (isConfirmed) {
                    this.saving = true;
                    this.updateinput.checkeR_ID = this.appSession.user.userName;
                    this.updateinput.approvE_DT = moment();
                    this.updateinput.updatE_TYPE = this.filterInput.searcH_TYPE;
                    this.updateinput.updatelist = this.updatelist;
                    this.assUpdateReportService.aSS_UPDATE_REPORT_Upd(this.updateinput)
                        .pipe(finalize(() => { this.saving = false; }))
                        .subscribe((response) => {
                            if (response['Result'] != '0') {
                                this.showErrorMessage(response['ErrorDesc']);
                                this.appToolbar.setEnable(true);
                                // return;
                            }
                            else {
                                this.changePage(0);
                            }
                            this.updateView();
                        });
                }
            }
        );
        this.appToolbar.setEnable(true);
        this.updateView();
    }

    onSelectRow(): void {
    }

    onAdd(): void {
    }

    onUpdate(): void {
    }

    onDelete(): void {
    }

    onApprove(): void {

    }

    onViewDetail(): void {
    }

    onSave(): void {
        // console.log(this.updatelist);
        this.saveInput();
        // this.changePage(0);
    }

    onSearch(): void {
        this.updatelist = [];
        this.checkAll = false;
        super.onSearch();
    }

    onResetSearch(): void {
        this.filterInput = new ASS_UPDATE_REPORT_ENTITY();
        this.updatelist = [];
        this.checkAll = false;
        this.changePage(0);
    }

    onSelectSearchType(st): void {
        if(this.filterInput.searcH_TYPE == st)
            return;
        this.filterInput.searcH_TYPE = st;
        this.checkAll = false;
        this.updatelist = [];
        this.dataTable.records = [];
        this.dataTable.totalRecordsCount = 0;
        this.updateView();
    }

    isexport(): boolean {
        return this.filterInput.searcH_TYPE == 'E';
    }


    isChecked(record: ASS_UPDATE_REPORT_ENTITY): boolean {
        return (this.updatelist.filter(x => x.id == record.id).length > 0);
    }

    setChecked(checked, record: ASS_UPDATE_REPORT_ENTITY) {
        record.isChecked = checked;
        this.checkAll = false;
        if (checked && !this.isChecked(record)) {
            this.updatelist.push(record);
            return;
        }
        this.updatelist = this.updatelist.filter(x => x.id != record.id)
    }

    onCheckAll(checked) {
        if (this.dataTable.records.length > 0) {
            this.checkAll = checked;
            this.dataTable.records.forEach(x => {
                x.isChecked = this.checkAll;
            });
            if (this.checkAll) {
                this.filterInput.maxResultCount = -1;
                this.assUpdateReportService.aSS_UPDATE_REPORT_Search(this.filterInput).subscribe(result => {
                    this.updatelist = result.items;
                    this.updateView();
                });
            }
            else {
                this.updatelist = [];
            }
            this.search();
        }
    }

}
