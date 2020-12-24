import { Component, Injector, ViewChild, OnInit, ViewEncapsulation, ElementRef, AfterViewInit } from '@angular/core';
import { appModuleAnimation } from '@shared/animations/routerTransition';
import * as _ from 'lodash';
import { AssCollectMultiServiceProxy, ASS_COLLECT_MULTI_MASTER_ENTITY, UltilityServiceProxy, ASS_COLLECT_MULTI_DT_ENTITY, ASS_MASTER_ENTITY, CM_EMPLOYEE_ENTITY, CM_BRANCH_ENTITY, CM_DEPARTMENT_ENTITY, BranchServiceProxy, DepartmentServiceProxy, ASS_TRANSFER_MULTI_DT_ENTITY, AssMasterServiceProxy, ASS_MASTER_ID_AND_CODE } from '@shared/service-proxies/service-proxies';
import { EditPageState } from '@app/ultilities/enum/edit-page-state';
import { finalize } from 'rxjs/operators';
import { DefaultComponentBase } from '@app/ultilities/default-component-base';
import { IUiAction } from '@app/ultilities/ui-action';
import { AuthStatusConsts } from '@app/admin/core/ultils/consts/AuthStatusConsts';
import { RecordStatusConsts } from '@app/admin/core/ultils/consts/RecordStatusConsts';
import { EditableTableComponent } from '@app/admin/core/controls/editable-table/editable-table.component';
import * as moment from 'moment';
import { PreviewTemplateService } from '@app/admin/common/preview-template/preview-template.service';
import { BranchModalComponent } from '@app/admin/core/controls/branch-modal/branch-modal.component';
import { AssetModalComponent } from '@app/admin/core/controls/asset-modal/asset-modal.component';

@Component({
    templateUrl: './ass-collect-multi-edit.component.html',
    encapsulation: ViewEncapsulation.None,
    animations: [appModuleAnimation()]
})

export class AssCollectMultiEditComponent extends DefaultComponentBase implements AfterViewInit, OnInit, IUiAction<ASS_COLLECT_MULTI_MASTER_ENTITY> {
    ngAfterViewInit(): void {
        this.setupValidationMessage();
        // this.updateView();
    }
    @ViewChild('assetMasterModal') assetMasterModal: AssetModalComponent

    constructor(
        injector: Injector,
        private ultilityService: UltilityServiceProxy,
        private assCollectMultiService: AssCollectMultiServiceProxy,
        private _previewTemplateService: PreviewTemplateService,
        private _branchService: BranchServiceProxy,
        private _departmentService: DepartmentServiceProxy,
        private _assettService: AssMasterServiceProxy,

    ) {
        super(injector);
        this.editPageState = this.getRouteData('editPageState');
        this.inputModel.coL_MULTI_MASTER_ID = this.getRouteParam('id');

        this.initFilter();
        this.initCombobox();
        this.initIsApproveFunct();
        this._branchService.cM_BRANCH_Search(this.getFillterForCombobox1()).subscribe(result => {
            this.lstBranch = result.items;
        });
        this._assettService.aSS_MASTER_IdAndCode().subscribe(result => {
            this.lstAsset = result;
        });
        this._departmentService.cM_DEPARTMENT_Search(this.getFillterForCombobox1()).subscribe(result => {
            this.lstDepartment = result.items;
        });
        // console.log(this);
        // COMMENT: this.stopAutoUpdateView();

    }
    lstDepartment: CM_DEPARTMENT_ENTITY[];
    lstBranch: CM_BRANCH_ENTITY[];
    lstAsset: ASS_MASTER_ID_AND_CODE[];

    excelRowProperties: any = {
        '0': 'no',
        '1': 'asseT_CODE',
        '2': 'asseT_NAME',
        '3': 'asseT_SERIAL_NO',
        '4': 'brancH_CODE_RECEIVE',
        '5': 'depT_CODE_RECEIVE',
        '6': 'buY_PRICE',
        '7': 'asremaiN_AMT',
        '8': 'location',
        '9': 'purposE_ID',
        '10': 'collecT_NOTE',
    }

    xlsStructure = ['no', 'asseT_CODE', 'asseT_NAME', 'asseT_SERIAL_NO', 'brancH_CODE_RECEIVE', 'depT_CODE_RECEIVE', 'buY_PRICE', 'asremaiN_AMT', 'location',
        'purposE_ID', 'collecT_NOTE'
    ]
    @ViewChild('editTableAsset') editTableAsset: EditableTableComponent<ASS_COLLECT_MULTI_DT_ENTITY>
    @ViewChild('branchModal') branchModal: BranchModalComponent

    @ViewChild('editForm') editForm: ElementRef;

    hiddenButtonDept: boolean = true;
    EditPageState = EditPageState;
    editPageState: EditPageState;

    inputModel: ASS_COLLECT_MULTI_MASTER_ENTITY = new ASS_COLLECT_MULTI_MASTER_ENTITY();
    filterInput: ASS_COLLECT_MULTI_MASTER_ENTITY;
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
    ngOnInit(): void {
        this.inputModel.brancH_ID = this.appSession.user.subbrId;
        this.inputModel.brancH_CREATE = this.appSession.user.subbrId;
        
        switch (this.editPageState) {
            case EditPageState.add:
                this.inputModel.recorD_STATUS = RecordStatusConsts.Active;
                this.inputModel.useR_COLLECT = this.appSession.user.name;
                this.inputModel.collecT_DT = moment().startOf('day');
                this.appToolbar.setRole('AssCollectMulti', false, false, true, false, false, false, false, false);
                this.appToolbar.setEnableForEditPage();

                break;
            case EditPageState.edit:
                this.appToolbar.setRole('AssCollectMulti', false, false, true, false, false, false, false, false);
                this.appToolbar.setEnableForEditPage();
                this.getAssCollectMulti();
                break;
            case EditPageState.viewDetail:
                this.appToolbar.setRole('AssCollectMulti', false, false, false, false, false, false, true, false);
                this.appToolbar.setEnableForViewDetailPage();
                this.getAssCollectMulti();
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

    getAssCollectMulti() {
        this.assCollectMultiService.aSS_COLLECT_MULTI_MASTER_ById(this.inputModel.coL_MULTI_MASTER_ID).subscribe(response => {
            this.inputModel = response;
            this.editTableAsset.setList(response.assCollectMultiDT);
            if (this.inputModel.autH_STATUS == AuthStatusConsts.Approve) {
                this.appToolbar.setButtonApproveEnable(false);
                this.appToolbar.setButtonSaveEnable(false);

                this.isApprove = true;
            }
            if (this.inputModel.coL_MULTI_MASTER_ID) {
                // CM_ATTACH_FILE
                this.getFile(this.inputModel.coL_MULTI_MASTER_ID, this.inputModel);
            }

            this.inputModel.brancH_NAME_RECEIVE = this.inputModel.assCollectMultiDT[0].brancH_NAME_RECEIVE;
            this.inputModel.depT_NAME_RECEIVE = this.inputModel.assCollectMultiDT[0].depT_NAME_RECEIVE;

        });
    }

    addNew() {
        this.assCollectMultiService.aSS_COLLECT_MULTI_MASTER_Ins(this.inputModel).pipe(finalize(() => { this.saving = false; }))
            .subscribe((response) => {
                if (response['Result'] != '0') {
                    this.showErrorMessage(response['ErrorDesc']);
                }
                else {
                    // CM_ATTACH_FILE
                    this.addFile(this.inputModel, 'ASS_COLLECT_MULTI_MASTER', undefined, response['COL_MULTI_MASTER_ID']);
                    this.addNewSuccess();
                    this.inputModel.coL_MULTI_MASTER_ID = response['COL_MULTI_MASTER_ID'];
                    // this.updateView();
                    if (!this.isApproveFunct) {
                        this.assCollectMultiService.aSS_COLLECT_MULTI_MASTER_App(response.id, this.appSession.user.userName)
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
        this.assCollectMultiService.aSS_COLLECT_MULTI_MASTER_Upd(this.inputModel).pipe(finalize(() => { this.saving = false; }))
            .subscribe((response) => {
                if (response['Result'] != '0') {
                    this.showErrorMessage(response['ErrorDesc']);
                }
                else {
                    // CM_ATTACH_FILE
                    this.updateFile(this.inputModel, 'ASS_COLLECT_MULTI_MASTER', undefined, response['COL_MULTI_MASTER_ID']);
                    this.updateSuccess();
                    if (!this.isApproveFunct) {
                        this.assCollectMultiService.aSS_COLLECT_MULTI_MASTER_App(this.inputModel.coL_MULTI_MASTER_ID, this.appSession.user.userName)
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
            this.showErrorMessage(this.l('AssCollectMulti') + ': ' + editTableError);
            return;
        }
        if (this.editPageState != EditPageState.viewDetail) {
            this.saving = true;
            this.inputModel.assCollectMultiDT = this.editTableAsset.allData;
            if (!this.inputModel.coL_MULTI_MASTER_ID) {
                this.inputModel.makeR_ID = this.appSession.user.userName;

                this.addNew();
            }
            else {
                this.inputModel.makeR_ID_KT = this.appSession.user.userName;
                this.update();
            }
        }
    }

    goBack() {
        this.navigatePassParam('/app/admin/ass-collect-multi', null, { filterInput: JSON.stringify(this.filterInput) });
    }

    onAdd(): void {
    }

    onUpdate(item: ASS_COLLECT_MULTI_MASTER_ENTITY): void {
    }

    onDelete(item: ASS_COLLECT_MULTI_MASTER_ENTITY): void {
    }

    onApprove(item: ASS_COLLECT_MULTI_MASTER_ENTITY): void {
        if (!this.inputModel.coL_MULTI_MASTER_ID) {
            return;
        }
        var currentUserName = this.appSession.user.userName;
        if (currentUserName == this.inputModel.makeR_ID || currentUserName == this.inputModel.makeR_ID_KT) {
            this.showErrorMessage(this.l('ApproveFailed'));
            return;
        }
        this.message.confirm(
            this.l('ApproveWarningMessage', this.l(this.inputModel.coL_MULTI_MASTER_ID)),
            this.l('AreYouSure'),
            (isConfirmed) => {
                if (isConfirmed) {
                    this.saving = true;
                    this.assCollectMultiService.aSS_COLLECT_MULTI_MASTER_App(this.inputModel.coL_MULTI_MASTER_ID, currentUserName)
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

    onViewDetail(item: ASS_COLLECT_MULTI_MASTER_ENTITY): void {
    }

    onSave(): void {
        this.saveInput();
    }

    onSearch(): void {
    }

    onResetSearch(): void {
    }

    currentDetail: ASS_COLLECT_MULTI_DT_ENTITY;

    onSelectAsset(event: ASS_MASTER_ENTITY[]) {
        // var items = [];

        for (var item of event) {
            if (this.editTableAsset.allData.filter(x => x.asseT_ID == item.asseT_ID).length == 0) {
                var detail = new ASS_COLLECT_MULTI_DT_ENTITY();
                detail.asseT_CODE = item.asseT_CODE;
                detail.asseT_ID = item.asseT_ID;
                detail.asseT_NAME = item.asseT_NAME;
                detail.asseT_SERIAL_NO = item.asseT_SERIAL_NO;
                detail.brancH_CREATE_NAME = item.brancH_CREATE_NAME;
                detail.buY_PRICE = item.buY_PRICE;
                detail.asremaiN_AMT = item.remaiN_AMORTIZED_AMT;
                detail.creatE_DT_ASS = item.creatE_DT;
                detail.usE_DATE = item.usE_DATE;
                detail.brancH_ID = item.brancH_ID;
                detail.brancH_CODE = item.brancH_CODE;
                detail.brancH_NAME = item.brancH_NAME;
                detail.deP_NAME_USE = item.deP_NAME;
                if (this.editTableAsset.allData.length > 0) {
                    var lastItemInEditTable = this.editTableAsset.allData[this.editTableAsset.allData.length - 1];
                    detail.brancH_CODE_RECEIVE = lastItemInEditTable.brancH_CODE_RECEIVE;
                    detail.brancH_ID_RECEIVE = lastItemInEditTable.brancH_ID_RECEIVE;
                    detail.brancH_NAME_RECEIVE = lastItemInEditTable.brancH_NAME_RECEIVE;
                    detail.fatheR_ID = lastItemInEditTable.fatheR_ID;
                    detail.depT_CODE_RECEIVE = lastItemInEditTable.depT_CODE_RECEIVE;
                    detail.depT_ID_RECEIVE = lastItemInEditTable.depT_ID_RECEIVE;
                    detail.depT_NAME_RECEIVE = lastItemInEditTable.depT_NAME_RECEIVE;
                }
                // detail.brancH_CODE_RECEIVE = this.inputModel.brancH_CODE_RECEIVE;
                // detail.brancH_ID_RECEIVE = this.inputModel.brancH_ID_RECEIVE;
                // detail.brancH_NAME_RECEIVE = this.inputModel.brancH_NAME_RECEIVE;
                // detail.fatheR_ID = this.inputModel.fatheR_ID;
                // detail.depT_CODE_RECEIVE =  this.inputModel.depT_CODE_RECEIVE;
                // detail.depT_ID_RECEIVE =  this.inputModel.depT_ID_RECEIVE;
                // detail.depT_NAME_RECEIVE =  this.inputModel.depT_NAME_RECEIVE;

                this.editTableAsset.pushItem(detail);

            }

            // items.push(detail);
        }
        // this.editTableAsset.setList(items);
        // this.updateView();
    }

    onSelectBranch(event: CM_BRANCH_ENTITY) {
        // this.inputModel.brancH_CODE_RECEIVE = event.brancH_CODE;
        // this.inputModel.brancH_ID_RECEIVE = event.brancH_ID;
        // this.inputModel.brancH_NAME_RECEIVE = event.brancH_NAME;
        // this.inputModel.fatheR_ID = event.fatheR_ID;
        // if (event.fatheR_ID) {
        //     this.inputModel.depT_CODE_RECEIVE = null;
        //     this.inputModel.depT_ID_RECEIVE = null;
        //     this.inputModel.depT_NAME_RECEIVE = null;
        // }
        var flag = false;
        this.editTableAsset.allData.forEach(x => {
            if (x.asseT_CODE == this.currentDetail.asseT_CODE || flag) {
                x.brancH_CODE_RECEIVE = event.brancH_CODE;
                x.brancH_ID_RECEIVE = event.brancH_ID;
                x.brancH_NAME_RECEIVE = event.brancH_NAME;
                x.fatheR_ID = event.fatheR_ID;
                if (event.fatheR_ID) {
                    x.depT_CODE_RECEIVE = null;
                    x.depT_ID_RECEIVE = null;
                    x.depT_NAME_RECEIVE = null;
                }
                flag = true;
            }

        });
        // this.updateView();

    }
    onSelectDep(event: CM_DEPARTMENT_ENTITY) {
        // this.inputModel.depT_CODE_RECEIVE = event.deP_CODE;
        // this.inputModel.depT_ID_RECEIVE = event.deP_ID;
        // this.inputModel.depT_NAME_RECEIVE = event.deP_NAME;
        var flag = false;

        this.editTableAsset.allData.forEach(x => {
            if ((x.asseT_CODE == this.currentDetail.asseT_CODE || flag) && !x.fatheR_ID) {
                x.depT_CODE_RECEIVE = event.deP_CODE;
                x.depT_ID_RECEIVE = event.deP_ID;
                x.depT_NAME_RECEIVE = event.deP_NAME;
                flag = true;

            }

        });
        // this.updateView();
    }
    exportReportPreview() {
        var parameters = [];
        parameters.push(this.GetParamNameAndValue("COL_MULTI_MASTER_ID", this.inputModel.coL_MULTI_MASTER_ID));

        var values = [];
        values.push(this.GetParamNameAndValue("BRANCH_CODE", this.appSession.user.branchCode));

        values.push(this.GetParamNameAndValue("BRANCH_NAME", this.appSession.user.branchName));
        values.push(this.GetParamNameAndValue("PRINT_NAME", this.appSession.user.name));
        values.push(this.GetParamNameAndValue("CODE", "BM. PĐNGH.01"));

        values.push(this.GetParamNameAndValue("PRINT_DATE", moment().format("DD/MM/YYYY")));

        this._previewTemplateService.printReportTemplate("TS_PTH", parameters, values);
    }
    branchModalShow() {
        this.branchModal.filterInput.brancH_LOGIN = this.appSession.user.subbrId;
        this.branchModal.show();

    }
    onImportAssLiquidation(rows: any) {
        var $scope = this;
        var checkDuplicate = [];
        let curItems = !this.inputModel.assCollectMultiDT ? [] : this.inputModel.assCollectMultiDT;
        let arr = this.xlsRowsToArr(rows, this.xlsStructure, function (obj: ASS_COLLECT_MULTI_DT_ENTITY) {
            if (!obj.asseT_CODE) {
                return null;
            }
            if (!obj.brancH_CODE_RECEIVE) {
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
            var branchFind = $scope.lstBranch.firstOrDefault(x => x.brancH_CODE == obj.brancH_CODE_RECEIVE);
            if (branchFind) {
                obj.brancH_ID_RECEIVE = branchFind.brancH_ID;
                obj.brancH_NAME_RECEIVE = branchFind.brancH_NAME;
                obj.fatheR_ID = branchFind.fatheR_ID;
                if (branchFind.fatheR_ID) {
                    obj.depT_ID_RECEIVE = null;
                    obj.depT_NAME_RECEIVE = null;
                    obj.depT_CODE_RECEIVE = null;
                } else {
                    var depFind = $scope.lstDepartment.firstOrDefault(x => x.deP_CODE == obj.depT_CODE_RECEIVE);
                    if (depFind) {
                        obj.depT_ID_RECEIVE = depFind.deP_ID;
                        obj.depT_NAME_RECEIVE = depFind.deP_NAME;
                    }
                }
            }
            var assetFind = $scope.lstAsset.firstOrDefault(x => x.asseT_CODE == obj.asseT_CODE);
            if(assetFind){
                obj.asseT_ID = assetFind.asseT_ID;
            }
            checkDuplicate.push(obj);


            return obj;
        })

        this.inputModel.assCollectMultiDT = arr
        this.editTableAsset.setList(this.inputModel.assCollectMultiDT);
        // this.updateView()
    }
    getDataFromFile(rows: any) {
        var $scope = this;
        let curItems = !this.editTableAsset.allData ? [] : this.editTableAsset.allData;
        let arr = this.convertImportExcelRowsToObjArr(rows, this.excelRowProperties, 0, function (obj: ASS_COLLECT_MULTI_DT_ENTITY) {
            if (!obj.asseT_CODE) {
                return null;
            }
            if (!obj.brancH_CODE_RECEIVE) {
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
            var branchFind = $scope.lstBranch.firstOrDefault(x => x.brancH_CODE == obj.brancH_CODE_RECEIVE);
            if (branchFind) {
                obj.brancH_ID_RECEIVE = branchFind.brancH_ID;
                obj.brancH_NAME_RECEIVE = branchFind.brancH_NAME;
                obj.fatheR_ID = branchFind.fatheR_ID;
            }


            var depFind = $scope.lstDepartment.firstOrDefault(x => x.deP_CODE == obj.depT_CODE_RECEIVE);
            if (depFind) {
                obj.depT_ID_RECEIVE = depFind.deP_ID;
                obj.depT_NAME_RECEIVE = depFind.deP_NAME;
            }
            if (branchFind.fatheR_ID) {
                obj.depT_ID_RECEIVE = null;
                obj.depT_NAME_RECEIVE = null;
                obj.depT_CODE_RECEIVE = null;
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
