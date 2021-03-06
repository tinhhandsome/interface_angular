import { Component, Injector, ViewChild, OnInit, ViewEncapsulation, ElementRef, AfterViewInit } from '@angular/core';
import { appModuleAnimation } from '@shared/animations/routerTransition';
import * as _ from 'lodash';
import { CarOfferServiceProxy, UltilityServiceProxy, ReportInfo, AsposeServiceProxy, CarMasterServiceProxy, EmployeeServiceProxy } from '@shared/service-proxies/service-proxies';
import { FileDownloadService } from "@shared/utils/file-download.service";
import { EditPageState } from '@app/ultilities/enum/edit-page-state';
import { AllCodes } from '@app/ultilities/enum/all-codes';
import { finalize } from 'rxjs/operators';
import { DefaultComponentBase } from '@app/ultilities/default-component-base';
import { IUiAction } from '@app/ultilities/ui-action';
import { AuthStatusConsts } from '@app/admin/core/ultils/consts/AuthStatusConsts';
import { RecordStatusConsts } from '@app/admin/core/ultils/consts/RecordStatusConsts';
import { CarMasterModalComponent } from "@app/admin/core/controls/car-modal/car-master-modal.component";
import { CAR_MASTER_ENTITY, CAR_OFFER_ENTITY, CM_EMPLOYEE_ENTITY } from "@shared/service-proxies/service-proxies";
import { ReportTypeConsts } from "@app/admin/core/ultils/consts/ReportTypeConsts";
import { EmployeeModalComponent } from "@app/admin/core/controls/employee-modal/employee-modal.component";
import { ReportTemplateModalComponent } from '@app/admin/core/controls/report-template-modal/report-template-modal.component';
import { DateFormatPipe } from '@app/admin/core/pipes/date-format.pipe';
import * as moment from 'moment';

enum resetStatus {
    inputModel = 1,
    lr_inputModel = 2,
    carInput = 3,
    all = 0
}

@Component({
    templateUrl: './car-offer-edit.component.html',
    encapsulation: ViewEncapsulation.None,
    animations: [appModuleAnimation()]
})

export class CarOfferEditComponent extends DefaultComponentBase implements OnInit, AfterViewInit, IUiAction<CAR_OFFER_ENTITY> {

    constructor(
        injector: Injector,
        private carOfferService: CarOfferServiceProxy,
        private ultilityService: UltilityServiceProxy,
        private asposeService: AsposeServiceProxy,
        private carMasterService: CarMasterServiceProxy,
        private fileDownloadService: FileDownloadService,
        private employeeService: EmployeeServiceProxy
    ) {
        super(injector);
        this.editPageState = this.getRouteData('editPageState');
        this.inputModel.caR_OFF_ID = this.getRouteParam('id');
        this.initFilter();
        this.initIsApproveFunct();
    }

    @ViewChild('editForm') editForm: ElementRef;
    @ViewChild('carMasterModal') carMasterModal: CarMasterModalComponent;
    @ViewChild('employeeModal') employeeModalComponent: EmployeeModalComponent;
    @ViewChild('reportTemplate') reportTemplate: ReportTemplateModalComponent;

    EditPageState = EditPageState;
    AllCodes = AllCodes;
    editPageState: EditPageState;

    inputModel: CAR_OFFER_ENTITY = new CAR_OFFER_ENTITY();
    lr_inputModel: CAR_OFFER_ENTITY = new CAR_OFFER_ENTITY(); // last repair content
    filterInput: CAR_OFFER_ENTITY;

    carInput: CAR_MASTER_ENTITY = new CAR_MASTER_ENTITY();
    empInput: CM_EMPLOYEE_ENTITY = new CM_EMPLOYEE_ENTITY();



    isApproveFunct: boolean;
    enablePrintBtnPDN: boolean; // hiện btn PDN khi có thông tin sc gần nhất & thông tin sc thực tế
    isBrokenAgain: boolean = false; //flag kiểm tra xe bị hư tiếp

    get disableInput(): boolean {
        return this.editPageState == EditPageState.viewDetail;
    }

    get disableInputRealRepair(): boolean {
        if (!this.inputModel)
            return true;
        return this.inputModel.autH_STATUS == AuthStatusConsts.Approve ? true : false;
    }

    get userCanApprove(): boolean {
        if (!this.inputModel.repaiR_DT) // chưa có thông tin sửa chữa
            return false;
        return true;
    }

    isShowError = false;

    ngOnInit(): void {
        this.inputModel.offeR_AMT = this.inputModel.repaiR_AMT = 0; // khởi tạo
        if (this.editPageState != EditPageState.add) {
            this.getCarOffer();
        }
    }

    ngAfterViewInit() : void {
        this.stopAutoUpdateView();
    }

    setPageRole(): void {
        switch (this.editPageState) {
            case EditPageState.add:
                this.inputModel.recorD_STATUS = RecordStatusConsts.Active;
                this.appToolbar.setRole('CarOffer', false, false, true, false, false, false, false, false);
                this.appToolbar.setEnableForEditPage();
                this.initInfo();
                break;
            case EditPageState.edit:
                this.appToolbar.setRole('CarOffer', false, false, true, false, false, false, false, false);
                this.appToolbar.setEnableForEditPage();
                break;
            case EditPageState.viewDetail:
                if (this.isApproveFunct) // tắt chức năng duyệt thì tất cả button disable
                    this.appToolbar.setRole('CarOffer', false, false, false, false, false, false, true, false);
                this.appToolbar.setEnableForViewDetailPage();
                break;
        }
        this.appToolbar.setUiAction(this);
        this.updateView();
    }


    //lấy thông tin xe từ value
    getCarInfoFromValue(value: CAR_MASTER_ENTITY) {
        if (!value || value.n_PLATE == undefined)
            return;
        this.inputModel.n_PLATE = value.n_PLATE;
        this.inputModel.asseT_ID = value.asseT_ID;
        this.inputModel.asseT_NAME = value.asseT_NAME;
        this.inputModel.caR_ID = value.caR_ID;
        this.inputModel.caR_TYPE_NAME = value.caR_TYPE_NAME;
        this.inputModel.caR_COLOR = value.caR_COLOR;
        this.inputModel.machineS_ID = value.machineS_ID;
        this.inputModel.slopeS_ID = value.slopeS_ID;
        this.updateView();
    }

    initInfo() {
        this.inputModel.makeR_ID = this.appSession.user.userName;
        this.inputModel.offeR_BRANCH = this.appSession.user.subbrId;
        this.inputModel.brancH_NAME = this.appSession.user.branchName;
        this.updateView();
    }

    isAddPage(): boolean {
        if (this.editPageState == EditPageState.add) // nếu trang hiện tại là add
            return true;
        return false;
    }

    initIsApproveFunct() {
        this.ultilityService.isApproveFunct(this.getCurrentFunctionId()).subscribe(isApproveFunct => {
            this.isApproveFunct = isApproveFunct;
        })
    }

    // lấy last repair từ value
    retrieveLRFromValue(value?: CAR_OFFER_ENTITY): void {
        if (value && value.autH_STATUS == AuthStatusConsts.Approve) {
            this.lr_inputModel = value;
        }
        if (this.isBrokenAgain) {
            this.getCarInfoFromValue(this.carInput);
            this.initInfo();
        }
        this.updateView();
    }

    // reset inputModel if inp == true, else reset lr_inputmodel
    resetInputModels(inp: number): void {
        switch (inp) {
            case resetStatus.inputModel:
                this.inputModel = new CAR_OFFER_ENTITY();
                break;
            case resetStatus.lr_inputModel: {
                this.lr_inputModel = new CAR_OFFER_ENTITY();
                this.lr_inputModel.repaiR_AMT = 0;
                break;
            }
            case resetStatus.carInput:
                this.carInput = new CAR_MASTER_ENTITY();
                break;
            default: {
                this.inputModel = new CAR_OFFER_ENTITY();
                this.lr_inputModel = new CAR_OFFER_ENTITY();
                this.carInput = new CAR_MASTER_ENTITY();
                break;
            }
        }
        this.updateView();
    }

    // lấy lastrepair từ nplate hoặc items
    getLastRepair(nplate?: string, items?: CAR_OFFER_ENTITY[]): void {

        if (!nplate && !items)
            return null;
        this.lr_inputModel = new CAR_OFFER_ENTITY();
        if (!items) {
            this.lr_inputModel.n_PLATE = nplate;
            this.lr_inputModel.searcH_TYPE = 'A';
            this.carOfferService.cAR_Offer_Search(this.lr_inputModel).subscribe(result => {

                this.lr_inputModel = this.chooseLastAuthCar(result.items) || new CAR_OFFER_ENTITY();
                if (this.lr_inputModel == null || this.lr_inputModel == undefined || this.lr_inputModel.repaiR_DT == null || this.lr_inputModel.repaiR_DT == undefined)
                    this.enablePrintBtnPDN = false;
                    this.updateView();
            });

        }
        else {
            this.lr_inputModel = this.chooseLastAuthCar(items) || new CAR_OFFER_ENTITY();
        }
    }

    // lặp các items từ dưới lên, chọn item có auth = A
    chooseLastAuthCar(items?: CAR_OFFER_ENTITY[]): CAR_OFFER_ENTITY {
        var numlength = items.length - 1;
        for (var i = numlength; i >= 0; i--) {
            if (items[i]['autH_STATUS'] == AuthStatusConsts.Approve) //auth = 'A'thì lấy kq
                return items[i];
        }
        return null;
    }

    getCarOfferByN_Plate(): void {
        this.resetInputModels(resetStatus.lr_inputModel);
        this.resetInputModels(resetStatus.carInput);
        var tempInputModel: CAR_OFFER_ENTITY = new CAR_OFFER_ENTITY();
        this.carInput.n_PLATE = tempInputModel.n_PLATE = this.inputModel.n_PLATE;
        tempInputModel.searcH_TYPE = 'N';

        this.carOfferService.cAR_Offer_Search(tempInputModel).subscribe(response => {
            this.setPageRole();
            if (response.items.length != 0) { // có kq trả về
                var nplate = this.inputModel.n_PLATE;

                this.resetInputModels(resetStatus.inputModel);
                this.inputModel.n_PLATE = nplate;
                this.isBrokenAgain = true;

                this.initInfo();
                this.retrieveLRFromValue();

                this.getLastRepair(null, response.items)
                this.getCarMaster();
                 // CM_ATTACH_FILE
                this.getFile(this.inputModel.caR_OFF_ID, this.inputModel);

            }
            else {
                this.getCarMaster(this.inputModel.n_PLATE);
            }
            this.updateView();
        });
    }

    clearOfferForAdd() {
        if (this.inputModel == null || this.inputModel == undefined || !this.isAddPage())
            return;
        this.inputModel.offeR_DT = this.inputModel.finisH_DT = this.inputModel.caR_OFF_ID = null;

        this.inputModel.repaiR_DIVISION = this.inputModel.offeR_REP_DIVISION
            = this.inputModel.offeR_PERSON = this.inputModel.offeR_REASON
            = this.inputModel.offeR_CONTENT = this.inputModel.offeR_NOTE = '';

        this.inputModel.offeR_AMT = 0;
        this.updateView();
    }

    getCarOffer(): void {
        this.carOfferService.cAR_Offer_ById(this.inputModel.caR_OFF_ID).subscribe(response => {
            this.setPageRole();
            this.inputModel = response;
            if (!this.inputModel.repaiR_DIVISION && this.inputModel.offeR_REP_DIVISION) // gán đv sc đề xuất cho đv sc thực tế
                this.inputModel.repaiR_DIVISION = this.inputModel.offeR_REP_DIVISION; // khi chưa nhập thông tin sc thực tế
            this.getCarMaster(this.inputModel.n_PLATE); // lấy carmaster để in phiếu + tờ trình

            this.enablePrintBtnPDN = !!response['repaiR_DT'];
            this.retrieveLRFromValue();
            if (this.inputModel.autH_STATUS == AuthStatusConsts.Approve) {
                this.appToolbar.setButtonApproveEnable(false);
                this.appToolbar.setButtonSaveEnable(false);
                this.lr_inputModel = this.inputModel;
            }
            else {
                this.getLastRepair(this.inputModel.n_PLATE, null);
                if (this.editPageState == EditPageState.viewDetail)
                    this.appToolbar.setButtonApproveEnable(true);
            }
            // CM_ATTACH_FILE
            this.getFile(this.inputModel.caR_OFF_ID, this.inputModel);
            this.getEmployeeById(response.offeR_PERSON);
            this.updateView();
        });
    }

    findExactNPlate(car: CAR_MASTER_ENTITY[], nplate: string): boolean {
        if (nplate == null)
            return true;
        return car.find(x => x.n_PLATE === nplate) ? true : false;
    }

    getCarMaster(nplate?: string) {
        if (nplate)
            this.carInput.n_PLATE = nplate;
        this.appToolbar.setButtonSaveEnable(false);
        this.carMasterService.cAR_MASTER_Search(this.carInput).subscribe(result => {
            if ((this.inputModel.autH_STATUS == AuthStatusConsts.NotApprove || this.isAddPage()) && this.editPageState != EditPageState.viewDetail)
                this.appToolbar.setButtonSaveEnable(true);
            if (!result || result.items.length == 0 || !this.findExactNPlate(result.items, nplate)) {
                this.carInput = new CAR_MASTER_ENTITY();

                this.inputModel.caR_ID = ''; // gán '' cho carid để checkinput
                this.getCarInfoFromValue(new CAR_MASTER_ENTITY());
                return;
            } // nếu không search ra thì reset carinput

            this.getCarInfoFromValue(result.items[0]);
            if (nplate)
                this.carInput = result.items[0];
                this.updateView();
        });
    }

    exportDocuments(pathName: string, storeName: string) {
        let reportInfo = new ReportInfo();
        reportInfo.typeExport = ReportTypeConsts.Word;

        let filterReport = {
            CAR_OFF_ID: this.inputModel.caR_OFF_ID,
            CAR_ID: this.inputModel.caR_ID,
            PARENT_ID: this.inputModel.parenT_ID,
            USER_LOGIN: this.appSession.user.name,
            maxResultCount: -1
        }

        reportInfo.parameters = this.GetParamsFromFilter(filterReport);

        reportInfo.values = [];
        var currentDate: Date = new Date();
        let _param = this.GetParamsFromFilter({
            ngay: currentDate.getDate(),
            thang: currentDate.getMonth() + 1,
            nam: currentDate.getFullYear(),
            PGD: this.inputModel.pgd,
            CAR_TYPE_NAME: this.inputModel.caR_TYPE_NAME,
            Manufacturer: this.carInput.manufacturer,
            manufacture_year: this.carInput.manufacturE_YEAR,
            branchCode: this.appSession.user.branchCode,
            branchName: this.appSession.user.branchName,
            username: this.appSession.user.name
        })

        _param.forEach(p => {
            reportInfo.values.push(p);
        });

        reportInfo.pathName = pathName;
        reportInfo.storeName = storeName;
        this.asposeService.getReport(reportInfo).subscribe(x => {
            this.fileDownloadService.downloadTempFile(x);
        });
    }

    checkInput(): boolean { // kiểm tra input user nhập
        var errMess = '';
        if (!this.inputModel.caR_ID) // không tìm thấy xe
        {
            errMess = this.l('CannotFind') + ' ' + this.l('N_Plate').toLowerCase();
        }
        else if (this.inputModel.offeR_DT > this.inputModel.finisH_DT) {
            errMess = this.l('FinishDate') + ' ' + this.l('Must').toLowerCase() + ' ' + this.l('GreaterThanOrEqualTo').toLowerCase() + ' ' + this.l("OfferDate").toLowerCase();
        }
        else if ((this.inputModel.offeR_AMT == 0 || !this.inputModel.offeR_AMT) && this.isAddPage()) // nếu trang thêm thì kt đk
        {
            errMess = this.l('OfferAMT') + ' ' + this.l('ValidationRequired').toLowerCase();
        }
        else if ((this.inputModel.repaiR_AMT == 0 || !this.inputModel.repaiR_AMT) && !this.isAddPage()) // nếu k phải trang thêm
        {
            errMess = this.l('RepairAMT') + ' ' + this.l('ValidationRequired').toLowerCase();
        }

        if (errMess)
            this.showErrorMessage(errMess);
        this.updateView();
        return (errMess == '');
    }

    saveInput() {
        this.inputModel.offeR_PERSON = this.empInput.emP_ID;
        if ((this.editForm as any).form.invalid) {
            this.isShowError = true;
            this.showErrorMessage(this.l('FormInvalid'));
            this.updateView();
            return;
        }
        if (!this.checkInput()) {
            return;
        }
        if (this.editPageState != EditPageState.viewDetail) {
            this.saving = true;
            if (!this.inputModel.caR_OFF_ID) {
                this.inputModel.recorD_STATUS = RecordStatusConsts.Active;
                this.carOfferService.cAR_Offer_Ins(this.inputModel).pipe(finalize(() => { this.saving = false; }))
                    .subscribe((response) => {
                        if (response['Result'] != '0') {
                            this.showErrorMessage(response['ErrorDesc']);
                        }
                        else {
                            this.showSuccessMessage(this.l('InsertSuccessful'));
                            this.enablePrintBtnPDN = false;
                            //không duyệt khi tắt chức năng duyệt
                        }
                        this.updateView();
                    });
            }
            else {
                this.inputModel.makeR_ID = this.appSession.user.userName;
                this.inputModel.checkeR_ID = '';
                this.carOfferService.cAR_Offer_Upd(this.inputModel).pipe(finalize(() => { this.saving = false; }))
                    .subscribe((response) => {
                        if (response['Result'] != '0') {
                            this.showErrorMessage(response['ErrorDesc']);
                        }
                        else {
                            
                        }
                        this.updateView();
                    });
            }
        }
    }

    goBack() {
        this.navigatePassParam('/app/admin/car-offer', null, { filterInput: JSON.stringify(this.filterInput) });
    }

    onAdd(): void {
    }

    onUpdate(item: CAR_OFFER_ENTITY): void {
    }

    onDelete(item: CAR_OFFER_ENTITY): void {
    }

    onApprove(item: CAR_OFFER_ENTITY): void {
        if (!this.inputModel || this.inputModel.n_PLATE === undefined)
        {
            this.showErrorMessage(this.l("PageLoadUndone"));
            this.updateView();
            return;
        }
        var currentUserName = this.appSession.user.userName;
        if (currentUserName == this.inputModel.makeR_ID) {
            this.showErrorMessage(this.l('ApproveFailed'));
            this.updateView();
            return;
        }
        if (!this.userCanApprove) {
            this.showErrorMessage(this.l("UpdateRealRepairFirst"));
            this.updateView();
            return;
        }
        this.message.confirm(
            this.l('ApproveWarningMessage', this.l(this.inputModel.n_PLATE)),
            this.l('AreYouSure'),
            (isConfirmed) => {
                if (isConfirmed) {
                    this.saving = true;
                    this.carOfferService.cAR_Offer_App(this.inputModel.caR_OFF_ID, currentUserName)
                        .pipe(finalize(() => { this.saving = false; }))
                        .subscribe((response) => {
                            if (response['Result'] != '0') {
                                this.showErrorMessage(response['ErrorDesc']);
                            }
                            else {
                                this.showSuccessMessage(this.l('SuccessfullyApprove'));
                                this.inputModel.autH_STATUS = AuthStatusConsts.Approve;
                                this.appToolbar.setButtonApproveEnable(false);
                                this.getLastRepair(null, [this.inputModel]);
                            }
                            this.updateView();
                        });
                }
            }
        );
    }

    onSelectCar(event?: any): void {
        if (event == null || event == undefined)
            return;
        this.carInput = event;
        this.getCarInfoFromValue(event as CAR_MASTER_ENTITY);
        this.getCarOfferByN_Plate();
        this.inputModel.caR_ID = event.caR_ID;
        this.inputModel.asseT_ID = event.asseT_ID;
        this.updateView();
    }

    onSelectEmp(event?: any): void {
        if (event == null || event == undefined)
            return;
        this.empInput = event;
        this.inputModel.offeR_PERSON = this.empInput.emP_ID;
        this.updateView();
    }

    getEmployeeById(id: string) {
        if (!id)
            return;
        this.employeeService.cM_EMPLOYEE_ById(id).subscribe(result => {
            this.empInput = result;
            this.updateView();
        });
    }

    showReportTemplate(){
        let filterReport = {
            CAR_OFF_ID: this.inputModel.caR_OFF_ID,
            USER_LOGIN: this.appSession.user.name,
        }
        let parameters = this.GetParamsFromFilter(filterReport);
        let values = this.GetParamsFromFilter({
            branchCode: this.appSession.user.branchCode,
            branchName: this.appSession.user.branchName,
            datePrint: (new DateFormatPipe()).transform(moment()),
            fullName: this.appSession.user.name
        });
        this.reportTemplate.show('CarOfferPDN_report', parameters, values);
        // this.previewTemplateService.printReportTemplate('AssetListOverViewAsset_report', parameters, values); 
    }

    onSelectedChanged(): void {
    }

    onViewDetail(item: CAR_OFFER_ENTITY): void {
    }

    onSave(): void {
        this.saveInput();
    }

    onSearch(): void {
    }

    onResetSearch(): void {
    }
}

