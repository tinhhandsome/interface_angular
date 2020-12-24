import { ListComponentBase } from "@app/ultilities/list-component-base";
import { Injector, Component, OnInit, ViewChild, ViewEncapsulation, ElementRef, AfterViewInit } from "@angular/core";
import { AssEntriesPostServiceProxy, ASS_ENTRIES_POST_ENTITY, CM_BRANCH_ENTITY, BranchServiceProxy, EODLogServiceProxy, EOD_LOG_ENTITY, ReportInfo, AsposeServiceProxy } from "@shared/service-proxies/service-proxies";
import { IUiAction } from "@app/ultilities/ui-action";
import { appModuleAnimation } from "@shared/animations/routerTransition";
import { FileDownloadService } from "@shared/utils/file-download.service";
import * as moment from "moment";
import { EditableTableComponent } from "@app/admin/core/controls/editable-table/editable-table.component";
import { ReportTypeConsts } from "@app/admin/core/ultils/consts/ReportTypeConsts";
import { NgForm } from "@angular/forms";

@Component({
    templateUrl: './EOD.component.html',
    encapsulation: ViewEncapsulation.None,
    animations: [appModuleAnimation()]
})

export class EODComponent extends ListComponentBase<ASS_ENTRIES_POST_ENTITY> implements IUiAction<ASS_ENTRIES_POST_ENTITY>, OnInit, AfterViewInit {


    @ViewChild('editForm') editForm: NgForm;
    @ViewChild('editTable') editTable: EditableTableComponent<ASS_ENTRIES_POST_ENTITY>;
    @ViewChild('EODLogTable') EODLogTable: EditableTableComponent<EOD_LOG_ENTITY>;

    filterInput: ASS_ENTRIES_POST_ENTITY = new ASS_ENTRIES_POST_ENTITY();
    eodInputSearch: EOD_LOG_ENTITY = new EOD_LOG_ENTITY();
    eodInputExport: EOD_LOG_ENTITY = new EOD_LOG_ENTITY();
    branchs: CM_BRANCH_ENTITY[];
    isGetData: boolean = false;
    isShowError = false;

    constructor(injector: Injector,
        private fileDownloadService: FileDownloadService,
        private asposeService: AsposeServiceProxy,
        private _assEntriesPostService: AssEntriesPostServiceProxy,
        private _branchService: BranchServiceProxy,
        private _eodService: EODLogServiceProxy) {
        super(injector);
        this.initFilter();
        this.stopAutoUpdateView()
    }

    initFilter() {
        this.eodInputSearch.top = 1000
        this.filterInput.date = moment();
        this.eodInputExport.eoD_DT = this.filterInput.date;
        //this.filterInput.brancH_ID = this.appSession.user.subbrId;
        this.filterInput['checkHS'] = 'HS'
        this.filterInput.makeR_ID = this.appSession.user.userName;
    }

    updateSearchFilterInput(filterInput: ASS_ENTRIES_POST_ENTITY) {
        if (filterInput['checkHS']) {
            filterInput.brancH_ID = this.filterInput['checkHS']
        }
    }

    ngOnInit(): void {
        this.appToolbar.setUiAction(this);
        this.appToolbar.setRole('EOD', false, false, false, false, false, false, false, true);
        this.appToolbar.setEnableForListPage();
        var filterCombobox = this.getFillterForCombobox();
        this._branchService.cM_BRANCH_Search(filterCombobox).subscribe(response => {
            this.branchs = response.items;
            this.updateView()
        });
    }

    ngAfterViewInit(): void {
        this.updateView()
        this.setupValidationMessage()
    }

    getAssEntriesPost() {
        if ((this.editForm as any).form.invalid) {
            this.isShowError = true;
            this.showErrorMessage(this.l('FormInvalid'));
            this.updateView();
            return;
        }

        const validMessage = this.isValid()
        if (validMessage) {
            this.isShowError = true;
            this.showErrorMessage(validMessage);
            this.updateView();
            return;
        }

        this.removeMessage()


        let filter = { ...this.filterInput } as ASS_ENTRIES_POST_ENTITY
        this.updateSearchFilterInput(filter)

        this._assEntriesPostService.aSS_ENTRIES_POST_Lst(filter).subscribe(result => {
            this.editTable.setList(result);
            this.isGetData = true;
            this.updateView()
        });
    }
    getEODLog() {
        this._eodService.eOD_LOG_Search(this.eodInputSearch).subscribe(result => {
            this.EODLogTable.setList(result);
            this.updateView()
        });
    }
    exportEOD() {
        let reportInfo = new ReportInfo();
        reportInfo.typeExport = ReportTypeConsts.Excel;
        reportInfo.parameters = this.GetParamsFromFilter({
            BRANCH_ID: this.appSession.user.subbrId,
            MAKER_ID: this.appSession.user.userName,
            DATE: this.filterInput.date//moment().format("DD/MM/YYYY hh:mm:ss")
        });
        reportInfo.pathName = "/ASS_MASTER/rpt_eod.xlsx";
        reportInfo.storeName = "ASS_ENTRIES_POST_Lst_EOD";
        this.asposeService.getReport(reportInfo).subscribe(x => {
            this.fileDownloadService.downloadTempFile(x);
        });
    }
    exportFTP() {
        this.eodInputExport.makeR_ID = this.appSession.user.userName;
        this.eodInputExport.brancH_ID = this.appSession.user.subbrId;
        this.eodInputExport.brancH_CODE = this.appSession.user.branchCode;
        this.eodInputExport.exporT_DT = moment();
        this.eodInputExport.eoD_DT = this.filterInput.date;

        this._eodService.exportFTP(this.eodInputExport).subscribe(response => {
            if (response["Result"] != '0') {
                this.showErrorMessage(response["ErrorDesc"]);
            }
            else {
                this.showSuccessMessage(this.l('ExportFTPSuccessfully'));
            }
        })
    }
    exportToExcel() {
        let reportInfo = new ReportInfo();
        reportInfo.typeExport = ReportTypeConsts.Excel;


        reportInfo.parameters = this.GetParamsFromFilter({
            BRANCH_ID: this.filterInput.brancH_ID,
            MAKER_ID: this.filterInput.makeR_ID,
            DATE: this.filterInput.date
        });
        reportInfo.pathName = "/ASS_MASTER/rpt_ass_entries_post_lst.xlsx";
        reportInfo.storeName = "ASS_ENTRIES_POST_Lst";
        this.asposeService.getReport(reportInfo).subscribe(x => {
            this.fileDownloadService.downloadTempFile(x);
        });
    }



    onSelectRow(): void { }

    onAdd(): void { }

    onUpdate(): void { }

    onDelete(): void { }

    onApprove(): void { }

    onViewDetail(): void { }

    onSave(): void { }

    onSearch(): void { }

    onResetSearch(): void {
        this.filterInput = new ASS_ENTRIES_POST_ENTITY();
        this.eodInputSearch = new EOD_LOG_ENTITY();
        this.initFilter();
    }

    isValid() {
        let errorMessage = null
        if (!this.filterInput['checkHS'] && !this.filterInput.brancH_ID) {
            errorMessage = this.l('PleaseSelectAccountingBranch')
        }
        return errorMessage
    }
}
