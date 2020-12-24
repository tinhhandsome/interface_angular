import { Component, Injector, ViewChild, OnInit, ViewEncapsulation, ElementRef, AfterViewInit } from '@angular/core';
import { appModuleAnimation } from '@shared/animations/routerTransition';
import * as _ from 'lodash';
import { AssInventoryServiceProxy, ASS_INVENTORY_MASTER_ENTITY, UltilityServiceProxy, CM_BRANCH_ENTITY, ASS_INVENTORY_DT_ENTITY, CM_TERM_ENTITY, TermServiceProxy, ASS_MASTER_ENTITY, AssStatusServiceProxy, ASS_STATUS_ENTITY, AssMasterServiceProxy, ReportInfo, AsposeServiceProxy, ASS_MASTER_SK_ENTITY } from '@shared/service-proxies/service-proxies';
import { EditPageState } from '@app/ultilities/enum/edit-page-state';
import { AllCodes } from '@app/ultilities/enum/all-codes';
import { finalize } from 'rxjs/operators';
import { DefaultComponentBase } from '@app/ultilities/default-component-base';
import { IUiAction } from '@app/ultilities/ui-action';
import { AuthStatusConsts } from '@app/admin/core/ultils/consts/AuthStatusConsts';
import { RecordStatusConsts } from '@app/admin/core/ultils/consts/RecordStatusConsts';
import { EditableTableComponent } from '@app/admin/core/controls/editable-table/editable-table.component';
import { BranchModalComponent } from '@app/admin/core/controls/branch-modal/branch-modal.component';
import { Moment } from 'moment';
import * as moment from 'moment';

import { ReportTypeConsts } from '@app/admin/core/ultils/consts/ReportTypeConsts';
import { FileDownloadService } from '@shared/utils/file-download.service';
import { FileUploader } from 'ng2-file-upload';
import { AssetSkModalComponent } from '@app/admin/core/controls/asset-modal/asset-modal-sk.component';
import { AccordionPanelComponent } from 'ngx-bootstrap/accordion/accordion-group.component';
import { NgForm } from '@angular/forms';
enum CONST {
    ASS_CODE = 'C',
    ASS_NAME = 'D',
    ASS_STATUS = 'M',
    INVENT_DESC = 'N',
    NOTES = 'Q',
    START_ROW = 3
}

@Component({
    templateUrl: './ass-inventory-edit.component.html',
    encapsulation: ViewEncapsulation.None,
    animations: [appModuleAnimation()]
})

export class AssInventoryEditComponent extends DefaultComponentBase implements OnInit, IUiAction<ASS_INVENTORY_MASTER_ENTITY>, AfterViewInit {
    ngAfterViewInit(): void {
        this.stopAutoUpdateView();
        this.assInventListEditTable.ngForm = this.tableForm;
        this.redundantListEditTable.ngForm = this.ngForm;
    }
    constructor(
        injector: Injector,
        private ultilityService: UltilityServiceProxy,
        private assInventoryService: AssInventoryServiceProxy,
        private CMTermService: TermServiceProxy,
        private assStatusService: AssStatusServiceProxy,
        private assMasterService: AssMasterServiceProxy,
        private fileDownloadService: FileDownloadService,
        private asposeService: AsposeServiceProxy
    ) {
        super(injector);
        this.editPageState = this.getRouteData('editPageState');
        this.inputModel.invenT_ID = this.getRouteParam('id');
        this.initFilter();
        this.initTerms();
        this.getAssStatus();
        this.initIsApproveFunct();
    }
    // Init variables
    @ViewChild('editForm') editForm: ElementRef;
    @ViewChild('branchModal') branchModal: BranchModalComponent;
    @ViewChild('assInventModal') assInventModal: AssetSkModalComponent;
    @ViewChild('assInventListEditTable') assInventListEditTable: EditableTableComponent<ASS_INVENTORY_DT_ENTITY>;
    @ViewChild('redundantListEditTable') redundantListEditTable: EditableTableComponent<ASS_INVENTORY_DT_ENTITY>;
    @ViewChild('ngForm') ngForm: NgForm;
    @ViewChild('tableForm') tableForm : NgForm;
    
    EditPageState = EditPageState;
    AllCodes = AllCodes;
    editPageState: EditPageState;
    public isCollapsed: boolean = false;

    filterInput: ASS_INVENTORY_MASTER_ENTITY;
    inputModel: ASS_INVENTORY_MASTER_ENTITY = new ASS_INVENTORY_MASTER_ENTITY();
    detailFilterInput: ASS_INVENTORY_DT_ENTITY = new ASS_INVENTORY_DT_ENTITY();
    oldInventDT: ASS_INVENTORY_DT_ENTITY[]; // lưu inventdt gốc

    terms: CM_TERM_ENTITY[] = [];
    assStatus: ASS_STATUS_ENTITY[] = [];
    isApproveFunct: boolean;
    showPrintBtn: boolean = true;
    makerId: string;
    excelUploader: FileUploader;

    //--------------------------------------------------------------

    get disableInput(): boolean {
        return this.editPageState == EditPageState.viewDetail;
    }
    isShowError = false;

    ngOnInit(): void {
        switch (this.editPageState) {
            case EditPageState.add:
                this.inputModel.recorD_STATUS = RecordStatusConsts.Active;
                this.appToolbar.setRole('AssInventory', false, false, true, false, false, false, false, false);
                this.appToolbar.setEnableForEditPage();
                this.showPrintBtn = false;
                break;
            case EditPageState.edit:
                this.appToolbar.setRole('AssInventory', false, false, true, false, false, false, false, false);
                this.appToolbar.setEnableForEditPage();
                this.getAssInventoryDetails();
                break;
            case EditPageState.viewDetail:
                this.appToolbar.setRole('AssInventory', false, false, false, false, false, false, true, false);
                this.appToolbar.setEnableForViewDetailPage();
                this.getAssInventoryDetails();
                break;
        }
        this.appToolbar.setUiAction(this);
        this.changeAccordionHeaderIcon();
    }

    showAssModal(): void{
        this.assInventModal.filterInput.brancH_ID = this.inputModel.brancH_ID;
        this.assInventModal.filterInput.usE_DATE = this.inputModel.inventorY_DT;
        this.assInventModal.filterInput.brancH_LOGIN = this.appSession.user.subbrId;
        this.assInventModal.show();
    }

    initIsApproveFunct() {
        this.ultilityService.isApproveFunct(this.getCurrentFunctionId()).subscribe(isApproveFunct => {
            this.isApproveFunct = isApproveFunct;
        })
    }

    setBranchName_DepName(list: ASS_INVENTORY_DT_ENTITY[]) {
        list.forEach(item => {
            item.brancH_NAME = item.brancH_USE_NAME;
            item.depT_NAME = item.depT_USE_NAME;
        });
        return list;
    }

    onBranchInputFocusOut(): void {
        this.inputModel.brancH_CODE = this.inputModel.brancH_ID = '';
    }

    getAssInventoryDetails() {
        this.saving = true;
        this.getAssInventory();
        this.assInventoryService.aSS_Inventory_ById(this.inputModel.invenT_ID).pipe(finalize(() => { this.saving = false; }))
            .subscribe(response => {
                if (!response)
                    return;

                this.assInventListEditTable.setList(this.setBranchName_DepName(response.invenT_LIST));
                this.redundantListEditTable.setList(this.setBranchName_DepName(response.redundanT_LIST));

                this.oldInventDT = this.assInventListEditTable.allData;

                this.inputModel.makeR_ID = this.appSession.user.userName;
                if (this.inputModel.autH_STATUS == AuthStatusConsts.Approve) {
                    this.appToolbar.setButtonApproveEnable(false);
                }
                this.updateView();
            });
    }

    onSelectAssInvent(selectedInvent: ASS_MASTER_ENTITY[]): void {
        var temp = this.assInventListEditTable.allData;

        selectedInvent.forEach(x => {
            var dt = new ASS_INVENTORY_DT_ENTITY();
            dt.asseT_ID = x.asseT_ID;
            dt.asseT_CODE = x.asseT_CODE;
            dt.asseT_NAME = x.asseT_NAME;
            dt.asseT_SERIAL_NO = x.asseT_SERIAL_NO;
            dt.usE_DATE = x.usE_DATE;
            dt.brancH_NAME = x.brancH_NAME;
            dt.brancH_USE = x.brancH_ID;
            dt.depT_NAME = x.deP_NAME;
            dt.depT_USE = x.depT_ID;
            dt.buY_PRICE = x.buY_PRICE;
            dt.remaiN_VALUE = x.remaiN_AMORTIZED_AMT;
            dt.asseT_STATUS = Number.parseInt(x.asS_STATUS);
            dt.invenT_DESC = '';
            dt.notes = x.notes;
            temp.push(dt);
        });
        this.assInventListEditTable.setList(temp);
        this.oldInventDT = temp;
        this.updateView();
    }

    // xoa item trong listA neu item da ton tai trong listB
    removeDuplicateAssetId(listA: ASS_INVENTORY_DT_ENTITY[], listB: ASS_INVENTORY_DT_ENTITY[]): ASS_INVENTORY_DT_ENTITY[] {
        return _.differenceBy(listB, listA, 'asseT_ID');
    }

    _convertAssMasterIntoAssInvent(assMaster: ASS_MASTER_SK_ENTITY): ASS_INVENTORY_DT_ENTITY {
        if (this.isNull(assMaster))
            return null;
        return {
            asseT_ID: assMaster.asseT_ID,
            asseT_CODE: assMaster.asseT_CODE,
            asseT_NAME: assMaster.asseT_NAME,
            asseT_SERIAL_NO: assMaster.asseT_SERIAL_NO,
            usE_DATE:  moment(assMaster.usE_DATE),
            brancH_NAME: assMaster.brancH_NAME,
            brancH_USE: assMaster.brancH_ID,
            depT_NAME: assMaster.deP_NAME,
            depT_USE: assMaster.depT_ID,
            buY_PRICE: assMaster.buY_PRICE,
            remaiN_VALUE: assMaster.remaiN_AMORTIZED_AMT,
            asseT_STATUS: Number.parseInt(assMaster.asS_STATUS),
            invenT_DESC: assMaster.asseT_DESC,
            notes: assMaster.notes,
            toJSON: this.toJSON
        } as any;
    }

    onSelectBranch(selectedBranch: CM_BRANCH_ENTITY): void {
        this.inputModel.brancH_ID = selectedBranch.brancH_ID;
        this.inputModel.brancH_CODE = selectedBranch.brancH_CODE;
        this.inputModel.brancH_NAME = selectedBranch.brancH_NAME;

    }

    convertData(items: any): ASS_INVENTORY_DT_ENTITY[] {
        var result: ASS_INVENTORY_DT_ENTITY[] = [];
        if (items.length == 0 || !items)
            return null;
        items.forEach(item => {
            result.push(item as ASS_INVENTORY_DT_ENTITY);
        });
        return result;
    }

    saveInput() {
        this.inputModel.redundanT_LIST = this.removeEmptyRows(this.redundantListEditTable.allData);
        this.inputModel.invenT_LIST = this.assInventListEditTable.allData;
        if ((this.editForm as any).form.invalid) {
            this.isShowError = true;
            this.showErrorMessage(this.l('FormInvalid'));
            this.updateView();
            return;
        }
        if (this.oldInventDT.length == 0) {
            this.showErrorMessage(this.l('InventAssetMustHaveValue'));
            this.updateView();
            return;
        }
        if (this.inputModel.brancH_ID == '' || !this.inputModel.brancH_ID) {
            this.showErrorMessage(this.l('Branch') + ' ' + this.l('Invalid').toLowerCase());
            this.updateView();
            return;
        }
        if (this.inputModel.autH_STATUS == AuthStatusConsts.Approve) {
            this.showErrorMessage(this.l('NotAllowToModifyApprovedAsset'));
            this.updateView();
            return;
        }
        var duplicateRow = this.checkDuplicateRows(this.inputModel.invenT_LIST);
        if (duplicateRow) {
            this.showErrorMessage(
                this.l('NotAllowToSaveDuplicateAsset') + '<br/>' +
                this.l('AssetCode') + ' ' + duplicateRow['value'].asseT_CODE + ' '
                + this.l('Repeat').toLowerCase() + ' ' + duplicateRow['count'] + ' ' + this.l('Times').toLowerCase()
            );
            this.updateView();
            return;
        }

        this.inputModel.brancH_CREATE = this.appSession.user.subbrId;

        if (this.editPageState != EditPageState.viewDetail) {
            this.saving = true;
            if (!this.inputModel.invenT_ID) {
                this.inputModel.makeR_ID = this.appSession.user.userName
                this.assInventoryService.aSS_Inventory_Ins(this.inputModel).pipe(finalize(() => { this.saving = false; }))
                    .subscribe((response) => {
                        if (response['Result'] != '0') {
                            this.showErrorMessage(response['errorDesc']);
                        }
                        else {
                            this.addNewSuccess()
                            this.showPrintBtn = true;
                            if (!this.isApproveFunct) {
                                this.assInventoryService.aSS_Inventory_App(response.id, this.appSession.user.userName)
                                    .pipe(finalize(() => { this.saving = false; }))
                                    .subscribe((response) => {
                                        if (response['Result'] != '0') {
                                            this.showErrorMessage(response['errorDesc']);
                                        }
                                    });
                            }
                        }
                        this.updateView();
                    });
            }
            else {
                this.assInventoryService.aSS_Inventory_Upd(this.inputModel).pipe(finalize(() => { this.saving = false; }))
                    .subscribe((response) => {
                        if (response['Result'] != '0') {
                            this.showErrorMessage(response['errorDesc']);
                        }
                        else {
                            this.updateSuccess();
                            if (!this.isApproveFunct) {
                                this.assInventoryService.aSS_Inventory_App(this.inputModel.invenT_ID, this.appSession.user.userName)
                                    .pipe(finalize(() => { this.saving = false; }))
                                    .subscribe((response) => {
                                        if (response['Result'] != '0') {
                                            this.showErrorMessage(response['errorDesc']);
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
        }
    }

    removeAllCheckItem_Custom() {
        this.assInventListEditTable.removeAllCheckedItem();
        this.oldInventDT = this.assInventListEditTable.allData; // set list tìm kiếm
    }

    checkDuplicateRows(table: any[]): any {
        // make a copy of the input array
        var copy = table.slice(0);

        // first loop goes over every element
        for (var i = 0; i < table.length; i++) {

            var myCount = 0;
            // loop over every element in the copy and see if it's the same
            for (var w = 0; w < copy.length; w++) {
                if (copy[w]) {
                    if (table[i].asseT_CODE == copy[w].asseT_CODE) {
                        // increase amount of times duplicate is found
                        myCount++;
                        // sets item to undefined
                        delete copy[w];
                    }
                }
            }

            if (myCount > 1) {
                var a = new Object();
                a['value'] = table[i];
                a['count'] = myCount;
                return a;
            }
        }
        return null;
    }


    removeEmptyRows(rows: ASS_INVENTORY_DT_ENTITY[]): ASS_INVENTORY_DT_ENTITY[] {
        var newRows: ASS_INVENTORY_DT_ENTITY[] = [];
        rows.forEach(row => {
            if (row.asseT_ID)
                newRows.push(row);
        });
        return newRows;
    }

    updateRedundantTableByAssCode(ass: ASS_INVENTORY_DT_ENTITY): void {
        if (!ass)
            return;
        this.redundantListEditTable.allData.forEach(x => {
            if (ass.asseT_CODE.endsWith(x.asseT_CODE)) {
                x.asseT_ID = ass.asseT_ID;
                x.asseT_NAME = ass.asseT_NAME;
                x.asseT_CODE = ass.asseT_CODE;
                x.asseT_SERIAL_NO = ass.asseT_SERIAL_NO;
                x.usE_DATE = ass.usE_DATE;
                x.brancH_USE = ass.brancH_USE;
                x.brancH_NAME = ass.brancH_USE_NAME;
                x.buY_PRICE = ass.buY_PRICE;
                x.depT_ID = ass.depT_ID;
                x.depT_USE = ass.depT_USE_CODE;
                x.depT_NAME = ass.depT_USE_NAME;
                x.remaiN_VALUE = ass.remaiN_AMORTIZED_AMT;
            }
        });
    }

    addItemIntoRedundantList(): void {
        var item = new ASS_INVENTORY_DT_ENTITY();
        var oldList = this.redundantListEditTable.allData;
        item.usE_DATE = this.inputModel.inventorY_DT;
        item.asseT_STATUS = 6;
        item.asS_STATUS_NAME = 'Thừa so với sao kê';
        oldList.push(item);
        this.redundantListEditTable.setList(oldList);
        this.updateView();
    }

    onAssIdChange(assCode: string): void {
        if (!assCode)
            return;
        var ass: ASS_MASTER_ENTITY = new ASS_MASTER_ENTITY();

        //prepare to search
        ass.asseT_CODE = assCode;
        ass.usE_DATE = this.inputModel.inventorY_DT;
        ass.amorT_STATUS = '!DTL';
        ass.level = 'UNIT';

        this.saving = true;
        this.assMasterService.aSS_MASTER_Search_SK(ass)
            .pipe(finalize(() => { this.saving = false; }))
            .subscribe(result => {
                if (result.items.length == 0)
                    return;
                this.updateRedundantTableByAssCode(this.convertAssMasterIntoAssInvent(result.items[0]));
                this.updateView();
            });
    }

    convertAssMasterIntoAssInvent(src: ASS_MASTER_ENTITY): ASS_INVENTORY_DT_ENTITY {
        var des: ASS_INVENTORY_DT_ENTITY = new ASS_INVENTORY_DT_ENTITY();
        des.asseT_ID = src.asseT_ID;
        des.asseT_CODE = src.asseT_CODE;
        des.asseT_NAME = src.asseT_NAME;
        des.asseT_SERIAL_NO = src.asseT_SERIAL_NO;
        des.usE_DATE = src.usE_DATE;
        des.brancH_USE = src.brancH_ID;
        des.brancH_USE_NAME = src.brancH_NAME;
        des.buY_PRICE = src.buY_PRICE;
        des.remaiN_VALUE = src.remaiN_AMORTIZED_AMT;
        return des;
    }

    getAssInventory(): void {
        var temp: ASS_INVENTORY_MASTER_ENTITY = new ASS_INVENTORY_MASTER_ENTITY();
        temp.invenT_ID = this.inputModel.invenT_ID;
        this.assInventoryService.aSS_Inventory_Search(temp).subscribe(Result => {
            this.inputModel = Result.items[0];
            this.makerId = Result.items[0].makeR_ID;
            this.updateView();
        });
    }

    initTerms(): void {
        this.CMTermService.cM_TERM_Search(this.getFillterForCombobox()).subscribe(Result => {
            this.terms = Result.items;
            this.updateView();
        });
    }
    setEditableTableList(inventDetails: ASS_INVENTORY_DT_ENTITY[]): void {
        this.assInventListEditTable.setList(inventDetails);
        this.redundantListEditTable.setList(inventDetails);
        this.updateView();
    }

    getAssStatus(): void {
        this.assStatusService.aSS_STATUS_Lst().subscribe(Result => {
            this.assStatus = Result;
            this.updateView();
        });
    }

    compareDays(day1: Moment, day2: Moment): boolean {
        if (!day1 || !day2)
            return false;
        return day1.format("DD/MM/YYYY") == day2.format("DD/MM/YYYY");
    }

    filterDetails(): void {

        var newInventDT = this.oldInventDT.filter(invent =>
            ((invent.asseT_CODE == this.detailFilterInput.asseT_CODE) || !this.detailFilterInput.asseT_CODE)
            && ((invent.asseT_NAME == this.detailFilterInput.asseT_NAME) || !this.detailFilterInput.asseT_NAME)
            && ((invent.asseT_SERIAL_NO == this.detailFilterInput.asseT_SERIAL_NO) || !this.detailFilterInput.asseT_SERIAL_NO)
            && (this.compareDays(invent.usE_DATE, this.detailFilterInput.usE_DATE) || !this.detailFilterInput.usE_DATE)
            && ((invent.brancH_USE_NAME == this.detailFilterInput.brancH_USE_NAME) || !this.detailFilterInput.brancH_USE_NAME)
            && ((invent.depT_USE_NAME == this.detailFilterInput.depT_USE_NAME) || !this.detailFilterInput.depT_USE_NAME)
            && ((invent.buY_PRICE == this.detailFilterInput.buY_PRICE) || !this.detailFilterInput.buY_PRICE)
            && ((invent.remaiN_VALUE == this.detailFilterInput.remaiN_VALUE) || !this.detailFilterInput.remaiN_VALUE)
            && ((invent.asseT_STATUS == this.detailFilterInput.asseT_STATUS) || !this.detailFilterInput.asseT_STATUS)
            && ((invent.invenT_DESC == this.detailFilterInput.invenT_DESC) || !this.detailFilterInput.invenT_DESC)
            && ((invent.notes == this.detailFilterInput.notes) || !this.detailFilterInput.notes)
        );
        this.assInventListEditTable.setList(newInventDT);
        this.updateView();

    }

    goBack() {
        this.navigatePassParam('/app/admin/ass-inventory', null, { filterInput: JSON.stringify(this.filterInput) });
    }

    onAdd(): void {
    }

    onUpdate(item: ASS_INVENTORY_MASTER_ENTITY): void {
    }

    onDelete(item: ASS_INVENTORY_MASTER_ENTITY): void {
    }

    onApprove(item: ASS_INVENTORY_MASTER_ENTITY): void {
        var currentUserName = this.appSession.user.userName;
        if (currentUserName == this.makerId) {
            this.showErrorMessage(this.l('ApproveFailed'));
            this.updateView();
            return;
        }
        if (this.inputModel.autH_STATUS == AuthStatusConsts.Approve) {
            this.showErrorMessage(this.l('NotAllowToModifyApprovedAsset'));
            this.updateView();
            return;
        }
        this.message.confirm(
            this.l('ApproveWarningMessage', this.l(this.inputModel.terM_NAME)),
            this.l('AreYouSure'),
            (isConfirmed) => {
                if (isConfirmed) {
                    this.saving = true;
                    this.assInventoryService.aSS_Inventory_App(this.inputModel.invenT_ID, currentUserName)
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

    onViewDetail(item: ASS_INVENTORY_MASTER_ENTITY): void {
    }

    onSave(): void {
        this.saveInput();
    }

    onSearch(): void {
    }

    onResetSearch(): void {
    }

    exportToExcel() {
        this.saving = true;
        let reportInfo = new ReportInfo();
        reportInfo.typeExport = ReportTypeConsts.Excel;
        reportInfo.parameters = this.GetParamsFromFilter({
            sp_BRANCH_ID: this.inputModel.brancH_ID,
            sp_BRANCH_LOGIN: this.appSession.user.subbrId,
            sp_INVENT_ID: this.inputModel.invenT_ID
        });
        reportInfo.values = this.GetParamsFromFilter({
            p_BRANCH_NAME: "Đơn vị: " + this.appSession.user.branchName,
            p_INVENTORY_DATE: "DANH SÁCH TÀI SẢN TẠI HỘI SỞ ĐẾN " + this.inputModel.inventorY_DT.format("DD/MM/YYYY")
        });

        reportInfo.pathName = "/ASS_MASTER/rpt-ass-inventory.xlsx";
        reportInfo.storeName = "rpt_INVENTORY_BYID";


        this.asposeService.getReport(reportInfo).pipe(finalize(() => { this.saving = false; })).subscribe(x => {
            this.fileDownloadService.downloadTempFile(x);
        });
    }

    getCell(col: string, row: number): string {
        return col + row;
    }

    getDataFromFile(datas: object[][]): void {
        var filteredRows: any[] = this.getAssetRows(datas);


        if (this.checkImportFile(filteredRows)) {
            var rowIndex: Number = 0;
            var temp: any;
            filteredRows.forEach(row => {
                rowIndex = this.splitRowIndex(Object.keys(Object.values(row)[0]).toString());
                temp = this.convertToObject(row);
                this.updateAsset(temp[CONST.ASS_CODE + rowIndex], temp[CONST.ASS_STATUS + rowIndex],
                    temp[CONST.INVENT_DESC + rowIndex], temp[CONST.NOTES + rowIndex]);
            });
            this.showSuccessMessage(this.l('ImportSuccessfully'));
            this.updateView();
        }
    }

    convertToObject(arr: any[]): Object {
        var o: Object = new Object();
        arr.forEach(x => {
            o[Object.keys(x).toString()] = x[Object.keys(x).toString()];
        });
        return o;
    }

    splitRowIndex(key: string): Number {
        if (key.length == 2)
            return Number.parseInt(key.slice(1));
        return Number.parseInt(key.match(/(\d+)/)[0]);
    }

    getAssetRows(datas: Object[][]): Object[] {
        if (datas.length == 0)
            return null;
        var obj: Object[] = [];

        datas.forEach(data => {
            data.forEach(x => {
                if (Object.keys(x)[0].startsWith(CONST.ASS_NAME) && Object.values(x)[0]) { // if asset has ass name 
                    obj.push(data);
                    return;
                }
            })
        });
        return obj.slice(0, -2); // return objects that have value
    }

    validateAssStatus(datas: any[]): boolean {
        datas.forEach(data => {
            if (!this.assStatus.find(x => x.statuS_NAME == data[CONST.ASS_STATUS])) // không tìm thấy ass status name
                return false;
        });
        return true;
    }

    updateAsset(assCode: string, _assStatus: string, inventDesc: string, notes: string): void {
        this.oldInventDT.forEach(inv => {
            if (inv.asseT_CODE == assCode) {
                inv.asseT_STATUS = this.toNumber(this.assStatus.find(x => x.statuS_NAME == _assStatus).statuS_ID);
                inv.invenT_DESC = inventDesc;
                inv.notes = notes;
            }
        });
        this.assInventListEditTable.setList(this.oldInventDT);
    }

    checkImportFile(filteredRows: object[]): boolean {

        if (!filteredRows) {
            this.showErrorMessage(this.l('ExcelFileIsEmpty'));
            this.updateView();
            return false;
        }
        if (!this.checkRows(filteredRows)) {
            this.showErrorMessage(this.l('DifferentRowsFound'));
            this.updateView();
            return false;
        }
        if (!this.checkDuplicateRowsInExcelFile(filteredRows)) {
            this.showErrorMessage(this.l('DuplicateRowsFound'));
            this.updateView();
            return false;
        }

        for (var data of filteredRows) {
            var temp = (Object)(Object.values(data));
            if (!this.assStatus.find(x => x.statuS_NAME == Object.values(temp.find(temp =>
                Object.keys(temp)[0].startsWith(CONST.ASS_STATUS))).toString())) { // không tìm thấy ass status name
                this.showErrorMessage(this.l('AssStatusInvalid'));
                this.updateView();
                return false;
            }

            if (!this.oldInventDT.find(inv => inv.asseT_CODE == Object.values(temp.find(temp =>
                Object.keys(temp)[0].startsWith(CONST.ASS_CODE))).toString())) {
                this.showErrorMessage(this.l('AssCodeNotFound'));
                this.updateView();
                return false;
            }
        }
        return true;
    }

    checkRows(data: Object[]): boolean {
        return data.length == this.oldInventDT.length;
    }

    checkDuplicateRowsInExcelFile(datas: Object[]): boolean {
        if (datas.length == 1)
            return true;
        var tempArr: any[] = [];

        var _datas: any[] = datas;
        var i: number = 10; // start position
        var obj: object;
        _datas.forEach(data => {
            data = this.convertToObject(data);
            obj = new Object();
            obj['asseT_CODE'] = data[CONST.ASS_CODE + i];
            tempArr.push(obj);
            i++;
        });
        return this.checkDuplicateRows(tempArr) == null; // tempArr has no duplicate rows
    }

    changeAccordionHeaderIcon(){
        $(document).ready(function(){
            // Add minus icon for collapse element which is open by default
            $(".collapse.show").each(function(){
                $(this).prev(".card-header").find(".fas").addClass("fa-angle-down").removeClass("fa-angle-right");
            });
            
            // Toggle plus minus icon on show hide of collapse element
            $(".collapse").on('show.bs.collapse', function(){
                $(this).prev(".card-header").find(".fas").removeClass("fa-angle-right").addClass("fa-angle-down");
            }).on('hide.bs.collapse', function(){
                $(this).prev(".card-header").find(".fas").removeClass("fa-angle-down").addClass("fa-angle-right");
            });
        });
    }
}
