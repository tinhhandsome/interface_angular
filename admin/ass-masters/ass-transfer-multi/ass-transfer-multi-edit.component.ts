
import { Component, Injector, ViewChild, OnInit, ViewEncapsulation, ElementRef, AfterViewInit, AfterViewChecked } from '@angular/core';
import { appModuleAnimation } from '@shared/animations/routerTransition';
import * as _ from 'lodash';
import { AssTransferMultiServiceProxy, ASS_TRANSFER_MULTI_MASTER_ENTITY, UltilityServiceProxy, ASS_TRANSFER_MULTI_DT_ENTITY, ASS_MASTER_ENTITY, CM_EMPLOYEE_ENTITY, CM_BRANCH_ENTITY, CM_DEPARTMENT_ENTITY, BranchServiceProxy, DepartmentServiceProxy, AssMasterServiceProxy, ASS_MASTER_ID_AND_CODE } from '@shared/service-proxies/service-proxies';
import { EditPageState } from '@app/ultilities/enum/edit-page-state';
import { finalize } from 'rxjs/operators';
import { DefaultComponentBase } from '@app/ultilities/default-component-base';
import { IUiAction } from '@app/ultilities/ui-action';
import { AuthStatusConsts } from '@app/admin/core/ultils/consts/AuthStatusConsts';
import { RecordStatusConsts } from '@app/admin/core/ultils/consts/RecordStatusConsts';
import { EditableTableComponent } from '@app/admin/core/controls/editable-table/editable-table.component';
import * as moment from 'moment';
import { PreviewTemplateService } from '@app/admin/common/preview-template/preview-template.service';
import { AssetModalComponent } from '@app/admin/core/controls/asset-modal/asset-modal.component';
import { EmployeeModalComponent } from '@app/admin/core/controls/employee-modal/employee-modal.component';

@Component({
    templateUrl: './ass-transfer-multi-edit.component.html',
    encapsulation: ViewEncapsulation.None,
    animations: [appModuleAnimation()]
})

export class AssTransferMultiEditComponent extends DefaultComponentBase implements AfterViewInit, OnInit, IUiAction<ASS_TRANSFER_MULTI_MASTER_ENTITY> {
    ngAfterViewInit(): void {
        this.setupValidationMessage();
        this.updateView();
    }

    constructor(
        injector: Injector,
        private ultilityService: UltilityServiceProxy,
        private assTransferMultiService: AssTransferMultiServiceProxy,
        private _previewTemplateService: PreviewTemplateService,
        private _branchService: BranchServiceProxy,
        private _departmentService: DepartmentServiceProxy,
        private _assettService: AssMasterServiceProxy

    ) {
        super(injector);
        this.editPageState = this.getRouteData('editPageState');
        this.inputModel.tranS_MULTI_MASTER_ID = this.getRouteParam('id');

        this.initFilter();
        this.initCombobox();
        this.initIsApproveFunct();
        this._branchService.cM_BRANCH_Search(this.getFillterForCombobox1()).subscribe(result => {
            this.lstBranch = result.items;
        });
        this._departmentService.cM_DEPARTMENT_Search(this.getFillterForCombobox1()).subscribe(result => {
            this.lstDepartment = result.items;
        });
        this._assettService.aSS_MASTER_IdAndCode().subscribe(result => {
            this.lstAsset = result;
        });
        // console.log(this);
        // COMMENT: this.stopAutoUpdateView();

    }
    @ViewChild('editTableAsset') editTableAsset: EditableTableComponent<ASS_TRANSFER_MULTI_DT_ENTITY>
    @ViewChild('assetMasterModal') assetMasterModal: AssetModalComponent
    @ViewChild('employeeModal') employeeModal: EmployeeModalComponent

    @ViewChild('editForm') editForm: ElementRef;
    excelRowProperties: any = {
        '0': 'no',
        '1': 'asseT_CODE',
        '2': 'asseT_NAME',
        '3': 'asseT_SERIAL_NO',
        '4': 'brancH_CODE',
        '5': 'deP_CODE',
        '6': 'buY_PRICE',
        '7': 'remaiN_VALUE',
        '8': 'creatE_DT_ASS',
        '9': 'usE_DATE',
        '10': 'description',
    }
    xlsStructure = ['no', 'asseT_CODE', 'asseT_NAME', 'asseT_SERIAL_NO', 'brancH_CODE', 'deP_CODE', 'buY_PRICE', 'remaiN_VALUE', 'creatE_DT_ASS',
        'usE_DATE', 'description'
    ]
    hiddenButtonDept: boolean = true;
    EditPageState = EditPageState;
    editPageState: EditPageState;

    lstDepartment: CM_DEPARTMENT_ENTITY[];
    lstBranch: CM_BRANCH_ENTITY[];
    lstAsset: ASS_MASTER_ID_AND_CODE[];


    inputModel: ASS_TRANSFER_MULTI_MASTER_ENTITY = new ASS_TRANSFER_MULTI_MASTER_ENTITY();
    filterInput: ASS_TRANSFER_MULTI_MASTER_ENTITY;
    isApproveFunct: boolean;
    isApprove: boolean = false;
    get disableInput(): boolean {
        return this.editPageState == EditPageState.viewDetail;
    }

    isShowError = false;
    getFillterForCombobox1(): any {
        return {
            maxResultCount: -1

        };
    }
    setupEditableValidation() {
        // this.editTableAsset.validations.push({
        //     message: this.l(`${this.l('NotLessThan')} ${this.l('BidInputDt').toLowerCase()}`),
        //     field: "senD_DT",
        //     checkValid: (context) => {
        //         if (!this.validationSendDt_inpuT_DT(context)) {
        //             return false;
        //         }
        //         return true;
        //     }
        // });

    }
    ngOnInit(): void {
        this.inputModel.brancH_ID = this.appSession.user.subbrId;
        this.inputModel.brancH_CREATE = this.appSession.user.subbrId;
        
        switch (this.editPageState) {
            case EditPageState.add:
                this.inputModel.recorD_STATUS = RecordStatusConsts.Active;
                this.inputModel.useR_TRANSFER = this.appSession.user.name;
                this.inputModel.transfeR_DT = moment().startOf('day');
                this.appToolbar.setRole('AssTransferMulti', false, false, true, false, false, false, false, false);
                this.appToolbar.setEnableForEditPage();
                break;
            case EditPageState.edit:
                this.appToolbar.setRole('AssTransferMulti', false, false, true, false, false, false, false, false);
                this.appToolbar.setEnableForEditPage();
                this.getAssTransferMulti();
                break;
            case EditPageState.viewDetail:
                this.appToolbar.setRole('AssTransferMulti', false, false, false, false, false, false, true, false);
                this.appToolbar.setEnableForViewDetailPage();
                this.getAssTransferMulti();
                break;
        }

        this.appToolbar.setUiAction(this);
    }

    initIsApproveFunct() {
        this.ultilityService.isApproveFunct(this.getCurrentFunctionId()).subscribe(isApproveFunct => {
            this.isApproveFunct = isApproveFunct;
        })
    }

    initCombobox() {

    }

    getAssTransferMulti() {
        this.assTransferMultiService.aSS_TRANSFER_MULTI_MASTER_ById(this.inputModel.tranS_MULTI_MASTER_ID).subscribe(response => {
            this.inputModel = response;
            this.editTableAsset.setList(response.assTransferMultiDT);
            if (this.inputModel.autH_STATUS == AuthStatusConsts.Approve) {
                this.appToolbar.setButtonApproveEnable(false);
                this.appToolbar.setButtonSaveEnable(false);

                this.isApprove = true;
            }
            if (this.inputModel.tranS_MULTI_MASTER_ID) {
                // CM_ATTACH_FILE
                this.getFile(this.inputModel.tranS_MULTI_MASTER_ID, this.inputModel);
            }
        });
    }

    addNew() {
        this.assTransferMultiService.aSS_TRANSFER_MULTI_MASTER_Ins(this.inputModel).pipe(finalize(() => { this.saving = false; }))
            .subscribe((response) => {
                if (response['Result'] != '0') {
                    this.showErrorMessage(response['ErrorDesc']);
                }
                else {
                    // CM_ATTACH_FILE
                    this.addFile(this.inputModel, 'ASS_TRANSFER_MULTI_MASTER', undefined, response['TRANS_MULTI_MASTER_ID']);
                    this.addNewSuccess();
                    this.inputModel.tranS_MULTI_MASTER_ID = response['TRANS_MULTI_MASTER_ID'];
                    if (!this.isApproveFunct) {
                        this.assTransferMultiService.aSS_TRANSFER_MULTI_MASTER_App(response.id, this.appSession.user.userName)
                            .pipe(finalize(() => { this.saving = false; }))
                            .subscribe((response) => {
                                if (response['Result'] != '0') {
                                    this.showErrorMessage(response['ErrorDesc']);
                                }
                            });
                    }
                }
            });
    }

    update() {
        this.assTransferMultiService.aSS_TRANSFER_MULTI_MASTER_Upd(this.inputModel).pipe(finalize(() => { this.saving = false; }))
            .subscribe((response) => {
                if (response['Result'] != '0') {
                    this.showErrorMessage(response['ErrorDesc']);
                }
                else {
                    // CM_ATTACH_FILE
                    this.updateFile(this.inputModel, 'ASS_TRANSFER_MULTI_MASTER', undefined, response['TRANS_MULTI_MASTER_ID']);
                    this.updateSuccess();
                    if (!this.isApproveFunct) {
                        this.assTransferMultiService.aSS_TRANSFER_MULTI_MASTER_App(this.inputModel.tranS_MULTI_MASTER_ID, this.appSession.user.userName)
                            .pipe(finalize(() => { this.saving = false; }))
                            .subscribe((response) => {
                                if (response['Result'] != '0') {
                                    this.showErrorMessage(response['ErrorDesc']);
                                }
                                else {
                                    this.inputModel.autH_STATUS = AuthStatusConsts.Approve;
                                }
                            });
                    }
                    else {
                        this.inputModel.autH_STATUS = AuthStatusConsts.NotApprove;
                    }
                }
            });
    }

    saveInput() {
        if (this.isApproveFunct == undefined) {
            this.showErrorMessage(this.l('PageLoadUndone'));
            return;
        }
        if (this.editTableAsset.allData.length == 0) {
            this.showErrorMessage(this.l('AssetListCannotBeNull'));
            return;
        }
        if ((this.editForm as any).form.invalid) {
            this.isShowError = true;
            this.showErrorMessage(this.l('FormInvalid'));
            this.updateView();
            return;
        }
        let editTableError = this.editTableAsset.getValidationMessage();
        if (editTableError) {
            this.showErrorMessage(this.l('AssTransferMulti') + ': ' + editTableError);
            return;
        }
        if (this.editPageState != EditPageState.viewDetail) {
            this.saving = true;
            this.inputModel.assTransferMultiDT = this.editTableAsset.allData;
            if (!this.inputModel.tranS_MULTI_MASTER_ID) {
                this.inputModel.makeR_ID = this.appSession.user.userName;
                this.inputModel.recorD_STATUS = '1';
                this.inputModel.autH_STATUS = AuthStatusConsts.NotApprove;
                this.addNew();
            }
            else {
                this.inputModel.makeR_ID_KT = this.appSession.user.userName;
                this.update();
            }
        }
    }

    goBack() {
        this.navigatePassParam('/app/admin/ass-transfer-multi', null, { filterInput: JSON.stringify(this.filterInput) });
    }

    onAdd(): void {
    }

    onUpdate(item: ASS_TRANSFER_MULTI_MASTER_ENTITY): void {
    }

    onDelete(item: ASS_TRANSFER_MULTI_MASTER_ENTITY): void {
    }

    onApprove(item: ASS_TRANSFER_MULTI_MASTER_ENTITY): void {
        if (!this.inputModel.tranS_MULTI_MASTER_ID) {
            return;
        }
        var currentUserName = this.appSession.user.userName;
        if (currentUserName == this.inputModel.makeR_ID || currentUserName == this.inputModel.makeR_ID_KT) {
            this.showErrorMessage(this.l('ApproveFailed'));
            return;
        }
        this.message.confirm(
            this.l('ApproveWarningMessage', this.l(this.inputModel.tranS_MULTI_MASTER_ID)),
            this.l('AreYouSure'),
            (isConfirmed) => {
                if (isConfirmed) {
                    this.saving = true;
                    this.assTransferMultiService.aSS_TRANSFER_MULTI_MASTER_App(this.inputModel.tranS_MULTI_MASTER_ID, currentUserName)
                        .pipe(finalize(() => { this.saving = false; }))
                        .subscribe((response) => {
                            if (response['Result'] != '0') {
                                this.showErrorMessage(response['ErrorDesc']);
                            }
                            else {
                                this.approveSuccess();
                            }
                            this.updateView();
                        });
                }
            }
        );
    }

    onViewDetail(item: ASS_TRANSFER_MULTI_MASTER_ENTITY): void {
    }

    onSave(): void {
        this.saveInput();
    }

    onSearch(): void {
    }

    onResetSearch(): void {
    }

    currentDetail: ASS_TRANSFER_MULTI_DT_ENTITY;

    onSelectAsset(event: ASS_MASTER_ENTITY[]) {
        // var items = [];
        var warningMessage = "";
        for (var item of event) {
            if (this.editTableAsset.allData.filter(x => x.asseT_ID == item.asseT_ID).length == 0) {

                var detail = new ASS_TRANSFER_MULTI_DT_ENTITY();
                detail.asseT_CODE = item.asseT_CODE;
                detail.asseT_ID = item.asseT_ID;
                detail.asseT_NAME = item.asseT_NAME;
                detail.asseT_SERIAL_NO = item.asseT_SERIAL_NO;
                detail.brancH_CREATE_NAME = item.brancH_CREATE_NAME;
                detail.buY_PRICE = item.buY_PRICE;
                detail.remaiN_VALUE = item.remaiN_AMORTIZED_AMT;
                detail.creatE_DT_ASS = item.buY_DATE;
                detail.usE_DATE = item.usE_DATE;
                //Thêm phòng ban và đơn vị dựa trên dòng dữ liệu trước
                if (this.editTableAsset.allData.length > 0) {
                    var lastItemInEditTable = this.editTableAsset.allData[this.editTableAsset.allData.length - 1];
                    detail.brancH_CODE = lastItemInEditTable.brancH_CODE;
                    detail.brancH_ID = lastItemInEditTable.brancH_ID;
                    detail.brancH_NAME = lastItemInEditTable.brancH_NAME;
                    detail.fatheR_ID = lastItemInEditTable.fatheR_ID;
                    detail.deP_CODE = lastItemInEditTable.deP_CODE;;
                    detail.deP_ID = lastItemInEditTable.deP_ID;;
                    detail.deP_NAME = lastItemInEditTable.deP_NAME;;
                }
                this.editTableAsset.pushItem(detail);

            }
            else {
                warningMessage += item.asseT_CODE + " ";
            }
            // items.push(detail);
        }
        if (warningMessage) {
            warningMessage = warningMessage.split(' ').join(', ');
            warningMessage += ". " + this.l("DuplicatedData");
            this.showWarningMessage(warningMessage);
        }
        // this.editTableAsset.setList(items);

        this.updateView();
    }
    employeeModalShow() {
        this.employeeModal.filterInput.pgd = undefined;
        this.employeeModal.show();
    }
    onSelectEmployee(event: CM_EMPLOYEE_ENTITY) {
        this.editTableAsset.allData.forEach(x => {
            if (x.asseT_ID == this.currentDetail.asseT_ID) {
                x.emP_CODE = event.emP_CODE;
                x.emP_ID = event.emP_ID;
                x.emP_NAME = event.emP_NAME;
            }
        });
        this.updateView();
    }
    onSelectBranch(event: CM_BRANCH_ENTITY) {
        // Cờ kiểm tra duyệt qua row dữ liệu đã thay đổi branch để cập nhật cho các row phía dưới
        var flag = false;
        this.editTableAsset.allData.forEach(x => {
            if (x.asseT_CODE == this.currentDetail.asseT_CODE || flag) {
                x.brancH_CODE = event.brancH_CODE;
                x.brancH_ID = event.brancH_ID;
                x.brancH_NAME = event.brancH_NAME;
                x.fatheR_ID = event.fatheR_ID;
                if (event.fatheR_ID) {
                    x.deP_CODE = null;
                    x.deP_ID = null;
                    x.deP_NAME = null;
                }
                flag = true;
            }
        });
        this.updateView();

    }
    onSelectDep(event: CM_DEPARTMENT_ENTITY) {
        // Cờ kiểm tra duyệt qua row dữ liệu đã thay đổi dept để cập nhật cho các row phía dưới
        var flag = false;
        this.editTableAsset.allData.forEach(x => {
            if ((x.asseT_CODE == this.currentDetail.asseT_CODE || flag) && !x.fatheR_ID) {
                x.deP_CODE = event.deP_CODE;
                x.deP_ID = event.deP_ID;
                x.deP_NAME = event.deP_NAME;
                flag = true;
            }
        });
        this.updateView();
    }
    exportReportPreview() {
        var parameters = [];
        parameters.push(this.GetParamNameAndValue("TRANS_MULTI_MASTER_ID", this.inputModel.tranS_MULTI_MASTER_ID));

        var values = [];
        values.push(this.GetParamNameAndValue("BRANCH_ID", this.appSession.user.branchCode));

        values.push(this.GetParamNameAndValue("BRANCH_NAME", this.appSession.user.branchName));
        values.push(this.GetParamNameAndValue("PRINT_ID", this.appSession.user.userName));
        values.push(this.GetParamNameAndValue("PRINT_DATE", moment().format("DD/MM/YYYY")));

        this._previewTemplateService.printReportTemplate("TS_PDC", parameters, values);
    }
    onImportAssLiquidation(rows: any) {
        var $scope = this;
        var checkDuplicate = [];
        let curItems = !this.inputModel.assTransferMultiDT ? [] : this.inputModel.assTransferMultiDT;
        let arr = this.xlsRowsToArr(rows, this.xlsStructure, function (obj: ASS_TRANSFER_MULTI_DT_ENTITY) {
            if (!obj.creatE_DT_ASS) {
                obj.creatE_DT_ASS = undefined;
            } else {
                obj.creatE_DT_ASS = moment(obj.creatE_DT_ASS, 'DD/MM/YYYY');
            }
            if (!obj.usE_DATE) {
                obj.usE_DATE = undefined;
            }
            else {
                obj.usE_DATE = moment(obj.usE_DATE, 'DD/MM/YYYY');
            }
            if (!obj.asseT_CODE) {
                return null;
            }
            if (!obj.brancH_CODE) {
                return null;
            }
            // curItems.forEach(item => {
            //     if (item.asseT_CODE == obj.asseT_CODE) {
            //         return null;
            //     }
            // })
            if (curItems.firstOrDefault(x => x.asseT_CODE == obj.asseT_CODE)) {
                return null;
            }
            if (checkDuplicate.firstOrDefault(x => x.asseT_CODE == obj.asseT_CODE)) {
                return null;
            }
            var branchFind = $scope.lstBranch.firstOrDefault(x => x.brancH_CODE == obj.brancH_CODE);
            if (branchFind) {
                obj.brancH_ID = branchFind.brancH_ID;
                obj.brancH_NAME = branchFind.brancH_NAME;
                obj.fatheR_ID = branchFind.fatheR_ID;
                if (branchFind.fatheR_ID) {
                    obj.deP_CODE = null;
                    obj.deP_ID = null;
                    obj.deP_NAME = null;
                }
                else {
                    var depFind = $scope.lstDepartment.firstOrDefault(x => x.deP_CODE == obj.deP_CODE);
                    if (depFind) {
                        obj.deP_ID = depFind.deP_ID;
                        obj.deP_NAME = depFind.deP_NAME;
                    }
                }
            }
            var assetFind = $scope.lstAsset.firstOrDefault(x => x.asseT_CODE == obj.asseT_CODE);
            if (assetFind) {
                obj.asseT_ID = assetFind.asseT_ID;
            }
            checkDuplicate.push(obj);

            return obj;
        })

        this.inputModel.assTransferMultiDT = arr
        this.editTableAsset.setList(this.inputModel.assTransferMultiDT);
        this.updateView()
    }
    getDataFromFile(rows: any) {
        var $scope = this;
        let curItems = !this.editTableAsset.allData ? [] : this.editTableAsset.allData;
        let arr = this.convertImportExcelRowsToObjArr(rows, this.excelRowProperties, 0, function (obj: ASS_TRANSFER_MULTI_DT_ENTITY) {

            if (!obj.creatE_DT_ASS) {
                obj.creatE_DT_ASS = undefined;
            } else {
                obj.creatE_DT_ASS = moment(obj.creatE_DT_ASS, 'DD/MM/YYYY');
            }
            if (!obj.usE_DATE) {
                obj.usE_DATE = undefined;
            }
            else {
                obj.usE_DATE = moment(obj.usE_DATE, 'DD/MM/YYYY');
            }
            if (!obj.asseT_CODE) {
                return null;
            }
            if (!obj.brancH_CODE) {
                return null;
            }
            // curItems.forEach(item => {
            //     if (item.asseT_CODE == obj.asseT_CODE) {
            //         return null;
            //     }
            // })
            if (curItems.firstOrDefault(x => x.asseT_CODE == obj.asseT_CODE)) {
                return null;
            }
            var branchFind = $scope.lstBranch.firstOrDefault(x => x.brancH_CODE == obj.brancH_CODE);
            if (branchFind) {
                obj.brancH_ID = branchFind.brancH_ID;
                obj.brancH_NAME = branchFind.brancH_NAME;
                obj.fatheR_ID = branchFind.fatheR_ID;
            }


            var depFind = $scope.lstDepartment.firstOrDefault(x => x.deP_CODE == obj.deP_CODE);
            if (depFind) {
                obj.deP_ID = depFind.deP_ID;
                obj.deP_NAME = depFind.deP_NAME;
            }
            if (branchFind.fatheR_ID) {
                obj.deP_CODE = null;
                obj.deP_ID = null;
                obj.deP_NAME = null;
            }
            $scope.editTableAsset.pushItem(obj);

            return obj;
        })
        this.updateView();

        // this.inputModel.assLiqRequestDetails = arr
        // this.editTableAsset.setList(arr);
    }
    showAssetModal() {
        this.assetMasterModal.filterInput.brancH_ID = this.appSession.user.subbrId;
        this.assetMasterModal.filterInput.amorT_STATUS = 'CKH,DKH,DPB,KHX,KKH,NKH,';
        this.assetMasterModal.filterInput.brancH_LOGIN = this.appSession.user.subbrId;
        this.assetMasterModal.filterInput.brancH_NAME = this.appSession.user.branchName;
        this.assetMasterModal.filterInput.level = "ALL";

        this.assetMasterModal.show();
    }
}
