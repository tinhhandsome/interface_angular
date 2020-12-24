import { DateTimeService } from './../../../shared/common/timing/date-time.service';
import { ListComponentBase } from "@app/ultilities/list-component-base";
import { Injector, Component, OnInit, ViewEncapsulation, ViewChild, AfterViewInit } from "@angular/core";
import { AssAmortCCLDServiceProxy, ASS_AMORT_CCLD_ENTITY, AsposeServiceProxy, ReportInfo } from "@shared/service-proxies/service-proxies";
import { IUiAction } from "@app/ultilities/ui-action";
import { appModuleAnimation } from "@shared/animations/routerTransition";
import { ReportTypeConsts } from "@app/admin/core/ultils/consts/ReportTypeConsts";
import { EditableTableComponent } from "@app/admin/core/controls/editable-table/editable-table.component";
import * as moment from 'moment';
import { FileDownloadService } from "@shared/utils/file-download.service";
import { AuthStatusConsts } from "@app/admin/core/ultils/consts/AuthStatusConsts";
import { TermFormatPipe } from "@app/admin/core/pipes/term-format.pipe";
import { DateTimeFormatPipe } from "@app/admin/core/pipes/date-time-format.pipe"
import { finalize } from "rxjs/operators";
import { NgForm } from "@angular/forms";

@Component({
    templateUrl: './ass-amort-ccld.component.html',
    encapsulation: ViewEncapsulation.None,
    animations: [appModuleAnimation()]
})
export class AssAmortCCLDComponent extends ListComponentBase<ASS_AMORT_CCLD_ENTITY> implements IUiAction<ASS_AMORT_CCLD_ENTITY>, OnInit, AfterViewInit {

    @ViewChild('editTable') editTable: EditableTableComponent<ASS_AMORT_CCLD_ENTITY>;
    @ViewChild('amortListTable') amortListTable: EditableTableComponent<ASS_AMORT_CCLD_ENTITY>;
    @ViewChild('editForm') editForm: NgForm

    input: ASS_AMORT_CCLD_ENTITY = new ASS_AMORT_CCLD_ENTITY();
    output: ASS_AMORT_CCLD_ENTITY;
    created: boolean = false;
    existedPendingItems: boolean = false
    started: boolean = false;
    isShowError: boolean = false;



    constructor(injector: Injector,
        private dateTimeService: DateTimeService,
        private _assAmortCCLDService: AssAmortCCLDServiceProxy,
        private fileDownloadService: FileDownloadService,
        private asposeService: AsposeServiceProxy) {
        super(injector);
        this.initFilter();
        console.log(this)
    }
    ngOnInit(): void {
        // set ui action
        this.appToolbar.setUiAction(this);
        // set role toolbar
        this.appToolbar.setRole('ASSAmortCCLD', false, false, false, false, false, false, false, false);
        this.appToolbar.setEnableForListPage();
        this.initCombobox()
        this.getAssAmortPending();
    }
    ngAfterViewInit(): void {
        // COMMENT: this.stopAutoUpdateView();
        this.setupValidationMessage()
    }

    initDefaultFilter() {
        this.input.amorT_TERM = moment().format("M") + "/" + moment().format("Y")
    }
    initCombobox(): void {

    }

    CreateAmortCCLD() {
        if (this.created) {
            this.showWarningMessage(this.l('AmortHasBeenCreated'));
            return;
        }

        this.message.confirm(this.l("Warning"), this.l("CreateASSAmortCCLD"), (isConfirmed) => {
            if (isConfirmed) {
                this.input.makeR_ID = this.appSession.user.userName;
                this.input.checkeR_ID = this.input.makeR_ID;
                this.input.autH_STATUS = AuthStatusConsts.NotApprove;
                this.input.brancH_CREATE = this.appSession.user.subbrId;
                this.input.asseT_TYPE = 'CCLD';
                this.input.executE_DATE = moment();
                this._assAmortCCLDService.aSS_AMORT_Do(this.input).subscribe(response => {
                    if (response.result != '0') {
                        this.getAssPendingItem();
                        this.showErrorMessage(response.errorDesc);
                    }
                    else {
                        this.setOutputView(response);
                        this.showSuccessMessage(this.l('CreateAmortCCLDSuccessfully'));
                    }
                    this.updateView()
                });
            }
        });
    }
    getAssPendingItem() {
        this._assAmortCCLDService.aSS_PENDING_ITEM_Search(this.input)
            .subscribe(result => {
                let res = result || []
                if (res && res.length > 0) {
                    this.existedPendingItems = true
                    this.editTable.setList(res);
                    this.updateView()
                }

                //this.appToolbar.setEnableForListPage();

            });
    }
    getAssAmortLst(id: string) {
        this._assAmortCCLDService.aSS_AMORT_Lst(id)
            .subscribe(result => {
                if (result != null)
                    this.amortListTable.setList(result);
                this.updateView()
            });
    }
    getAssAmortPending() {
        // if(!this.input.amorT_TERM) this.input.amorT_TERM = (new TermFormatPipe()).transform(moment());
        this.input.brancH_ID = this.appSession.user.subbrId;
        this.input.asseT_TYPE = 'CCLD';
        this._assAmortCCLDService.aSS_AMORT_Pending(this.input).subscribe(response => {
            if (response.result == '0') {
                this.setOutputView(response);
            }
        });
    }
    setOutputView(response: ASS_AMORT_CCLD_ENTITY) {
        this.created = true;
        this.output = response;
        this.getAssAmortLst(response.amorT_ID);
        this.updateView()
    }
    StartAmortCCLD() {
        if (this.started) {
            this.showWarningMessage(this.l('AmortHasBeenStarted'));
            return;
        }
        this.message.confirm(
            this.l('Execute') + ' ' + this.l('AmortCCLDTerm'),
            this.l('AreYouSure'),
            (isConfirmed) => {
                if (isConfirmed) {
                    this._assAmortCCLDService.aSS_AMORT_Start(this.output.amorT_ID).subscribe(result => {
                        if (result.result != '0') {
                            this.showErrorMessage(result.errorDesc);
                        }
                        else {
                            this.started = true;
                            this.output.statuS_NAME = this.l('AlreadyExec');
                            this.showSuccessMessage(this.l('StartAmortCCLDSuccessfully'));
                        }
                        this.updateView()
                    });
                }
            }
        );

    }

    getTermValue(value: string) {
        this.editForm.controls["amorT_TERM"].setValue(this.dateTimeService.getTermValue(value))
    }

    exportToExcel() {
        let reportInfo = new ReportInfo();
        reportInfo.typeExport = ReportTypeConsts.Excel;


        reportInfo.parameters = this.GetParamsFromFilter(this.output);


        reportInfo.pathName = "/ASS_MASTER/ass_amort_ccld.xlsx";
        reportInfo.storeName = "ASS_AMORT_Lst";
        this.asposeService.getReport(reportInfo).subscribe(x => {
            this.fileDownloadService.downloadTempFile(x);
        });
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

    }

    onSearch(): void {

    }

    onResetSearch(): void {
        this.reloadPage();
    }
    deleteAssAmortDo() {
        if ((this.editForm as any).form.invalid) {
            this.isShowError = true;
            this.showErrorMessage(this.l('FormInvalid'));
            this.updateView()
            return;
        }

        this.message.confirm(
            this.l('Delete') + ' ' + this.l('AmortTerm'),
            this.l('AreYouSure'),
            (isConfirmed) => {
                if (isConfirmed) {



                    this._assAmortCCLDService.aSS_AMORT_Delete(this.input.amorT_TERM).pipe(finalize(() => { this.saving = false; }))
                        .subscribe((response) => {
                            if (response["Result"] != '0') {
                                if (response["Result"] === 'ASS-AMR-0009') {
                                    this.showErrorMessage(this.l("CannotDeleteExecutedAllocatedTerm"));
                                } else {
                                    this.showErrorMessage(response["ErrorDesc"]);
                                }

                            } else {
                                this.showSuccessMessage(this.l('Delete') + ' ' + this.l('Success').toLowerCase());
                                this.started = false;
                                this.created = false;
                                // this.filterInputSearch.totalCount = 0;
                                this.getAssAmortPending();

                            }
                            this.updateView()
                        });
                }
            }
        );
    }

}
