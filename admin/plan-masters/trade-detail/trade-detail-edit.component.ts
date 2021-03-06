import { Component, Injector, ViewChild, OnInit, ViewEncapsulation, ElementRef, AfterViewInit } from '@angular/core';
import { appModuleAnimation } from '@shared/animations/routerTransition';
import * as _ from 'lodash';
import { PL_MASTER_ENTITY, TRADE_DETAIL_PLAN, TradeDetailServiceProxy,PlMasterServiceProxy, TRADE_DETAIL_ENTITY, 
    CM_GOODS_ENTITY, CM_DEPARTMENT_ENTITY, DepartmentServiceProxy, UltilityServiceProxy, WorkflowServiceProxy,
     CM_WORKFLOW_REJECT_MODEL, PL_CATEGORYTRADE_DT_ENTITY } from '@shared/service-proxies/service-proxies';
    //  M_REJECT_LOG_ENTITY,RejectServiceProxy 
import { EditPageState } from '@app/ultilities/enum/edit-page-state';
import { AllCodes } from '@app/ultilities/enum/all-codes';
import { finalize } from 'rxjs/operators';
import { DefaultComponentBase } from '@app/ultilities/default-component-base';
import { AuthStatusConsts } from '@app/admin/core/ultils/consts/AuthStatusConsts';
import { RecordStatusConsts } from '@app/admin/core/ultils/consts/RecordStatusConsts';
import * as moment from 'moment';
import { GoodsModalComponent } from '@app/admin/core/controls/goods-modal/goods-modal.component';
import { EditableTableComponent } from '@app/admin/core/controls/editable-table/editable-table.component';
import { RejectMessageComponent } from '@app/admin/core/controls/reject-messages/reject-message.component';
import { IUiAction } from '@app/ultilities/ui-action';
import { NgForm } from '@angular/forms';
import { RejectNotesComponent } from '@app/admin/core/controls/reject-notes/reject-notes.component';
import { CategorytradeModalComponent } from '@app/admin/core/controls/goods-modal/categorytrade-modal.component';

@Component({
    templateUrl: './trade-detail-edit.component.html',
    encapsulation: ViewEncapsulation.None,
    animations: [appModuleAnimation()]
})
export class TradeDetailEditComponent extends DefaultComponentBase implements OnInit, IUiAction<PL_MASTER_ENTITY>, AfterViewInit {


    constructor(
        injector: Injector,
        private ultilityService: UltilityServiceProxy,
        private departmentService: DepartmentServiceProxy,
        private workflowService: WorkflowServiceProxy,
        private tradeDetailService: TradeDetailServiceProxy,
        private plMasterService: PlMasterServiceProxy,
        // private rejectService : RejectServiceProxy
    ) {
        super(injector);
        this.editPageState = this.getRouteData('editPageState');
        this.inputModel.plaN_ID = this.getRouteParam('id');
        this.inputModel.tradE_DETAILs = [];
        this.initFilter();
        this.initIsApproveFunct();
        // console.log(this);
    }

    @ViewChild('editForm') editForm: NgForm;
    @ViewChild('categorytradeModal') categorytradeModal: CategorytradeModalComponent;
    @ViewChild('rejectModal') rejectModal: RejectNotesComponent;
    @ViewChild('editTable') editTable: EditableTableComponent<TRADE_DETAIL_ENTITY>;
    @ViewChild('rejectMessage') rejectMessage: RejectMessageComponent;

    EditPageState = EditPageState;
    AllCodes = AllCodes;
    editPageState: EditPageState;

    inputModel: TRADE_DETAIL_PLAN = new TRADE_DETAIL_PLAN();
    filterInput: TRADE_DETAIL_ENTITY;
    // reject :CM_REJECT_LOG_ENTITY= new CM_REJECT_LOG_ENTITY();
    isApproveFunct: boolean;


    get disableInput(): boolean {
        return this.editPageState == EditPageState.viewDetail;
    }

    ngAfterViewInit(): void {
        this.setupValidationMessage();
    }

    departments: CM_DEPARTMENT_ENTITY[];

    isShowError = false;
    IS_SHOW_REJECT=false;
    totalAmt: number = 0;
    processValue: number = 0;

    dataInTables: TRADE_DETAIL_ENTITY[] = [];
    isApp = false;
    isSendApp=false;
    isReject=false;
    isDisable=false;
    IS_REJECT=false;


    ngOnInit(): void {
        switch (this.editPageState) {
            case EditPageState.add:
                this.inputModel.recorD_STATUS = RecordStatusConsts.Active;
                this.appToolbar.setRole('TradeDetail', false, false, true, false, false, false, false, false);
                this.appToolbar.setEnableForEditPage();
            
                this.inputModel.tradE_DETAILs = [];
                this.inputModel.year = (moment().year() + 1).toString();
                this.inputModel.brancH_ID = this.appSession.user.subbrId;
                this.inputModel.brancH_CODE = this.appSession.user.branchCode;
                this.inputModel.brancH_NAME = this.appSession.user.branchName;
              //  this.inputModel.depT_ID= this.appSession.user.;
                this.isApp=false;
              
                this.isSendApp=false;
                this.isReject=false;
                break;
            case EditPageState.edit:
                this.isApp=false;
              
                this.isSendApp=false;
                this.isReject=false;
                this.appToolbar.setRole('TradeDetail', false, false, true, false, false, false, false, false);
                this.appToolbar.setEnableForEditPage();
                this.getTradeDetail();
                this.getRejectDetail();
                break;
            case EditPageState.viewDetail:
                this.isApp=false;
              
                this.isSendApp=false;
                this.isReject=false;
                this.appToolbar.setRole('TradeDetail', false, false, false, false, false, false, true, false);
                this.appToolbar.setEnableForViewDetailPage();
                this.getTradeDetail();
                this.getRejectDetail();
                break;
        }

        this.appToolbar.setUiAction(this);
        this.initCombobox();
    }

    initIsApproveFunct() {
        this.ultilityService.isApproveFunct(this.getCurrentFunctionId()).subscribe(isApproveFunct => {
            this.isApproveFunct = isApproveFunct;
        })
    }

    initCombobox() {
        var filterCombobox = this.getFillterForCombobox();
        filterCombobox.brancH_ID = this.appSession.user.subbrId;

        // this.departmentService.cM_DEPARTMENT_Search(filterCombobox).subscribe(response => {
        //     this.departments = response.items;
        //     this.updateView();
        // });
        
    }

    getTradeDetail() {
        this.tradeDetailService.pL_TRADE_DETAIL_ById(this.inputModel.plaN_ID).subscribe(response => {
            this.inputModel = response;
            this.editTable.setList(this.inputModel.tradE_DETAILs);
            if (this.inputModel.autH_STATUS == AuthStatusConsts.Approve) {
                this.appToolbar.setButtonApproveEnable(false);
                this.appToolbar.setButtonSaveEnable(false);
                this.editPageState = EditPageState.viewDetail;
                this.isApp=true;
            }

            if(this.inputModel.status=="N" ||this.inputModel.status=="R")
            {

                if(this.inputModel.status=="R")
                {
                    this.IS_REJECT=true;
                }
                else
                {
                    this.IS_REJECT=false;
                }

                if(this.inputModel.iS_APP=="Y")
                {
                    this.appToolbar.setButtonApproveEnable(false);                 
                }
                else
                {
                    this.appToolbar.setButtonApproveEnable(false); 
                    if( this.permission.isGranted('Pages.Administration.TradeDetail.Approve')) 
                        this.isSendApp=true;
                }
            }      
            else
            if(this.inputModel.status=="P" )
            {

                this.editPageState = EditPageState.viewDetail;
                this.appToolbar.setButtonApproveEnable(false);
                this.appToolbar.setButtonSaveEnable(false);
                if(this.inputModel.iS_APP=="Y")
                    this.isReject=true;
            }

            
            this.refreshPrice(null);
            this.updateView();
            
        });
    }
    getRejectDetail()
    {
        // this.rejectService.cM_REGION_ById(this.inputModel.plaN_ID,"APP").subscribe(response => {

        //     this.reject=response;

        // });
        // this.updateView();
    }

    saveInput() {
        if (this.isApproveFunct == undefined) {
            this.showErrorMessage(this.l('PageLoadUndone'));
            return;
        }

        if ((this.editForm as any).form.invalid) {
            this.isShowError = true;
            this.showErrorMessage(this.l('FormInvalid'));
            this.updateView();
            return;
        }

        if ((this.editTable.allData.length == 0)) {
            this.showErrorMessage(this.l('GoodsListCannotBeNull'));
            return;
        }

        let editTableError = this.editTable.getValidationMessage();
        if (editTableError) {
            this.showErrorMessage(this.l('GoodsList') + ': ' + editTableError);
            return;
        }

        if (this.editPageState != EditPageState.viewDetail) {
            this.saving = true;
            this.inputModel.makeR_ID = this.appSession.user.userName;
            this.inputModel.status = 'N';
            this.inputModel.autH_STATUS='N';
            if (!this.inputModel.plaN_ID) {
                this.tradeDetailService.pL_TRADE_DETAIL_Ins(this.inputModel).pipe(finalize(() => { this.saving = false; }))
                    .subscribe((response) => {
                        if (response.result != '0') {
                            this.showErrorMessage(response.errorDesc);
                        }
                        else {
                            this.addNewSuccess();
                            if (!this.isApproveFunct) {
                                this.tradeDetailService.pL_TRADE_DETAIL_App(response.id, this.appSession.user.userName, this.appSession.user.subbrId)
                                    .pipe(finalize(() => { this.saving = false; }))
                                    .subscribe((response) => {
                                        if (response.result != '0') {
                                            this.showErrorMessage(response.errorDesc);
                                        }
                                    });
                            }

                        }
                    });
            }
            else {
                this.tradeDetailService.pL_TRADE_DETAIL_Upd(this.inputModel).pipe(finalize(() => { this.saving = false; }))
                    .subscribe((response) => {
                        if (response.result != '0') {
                            this.showErrorMessage(response.errorDesc);
                        }
                        else {
                            this.updateSuccess();
                            if (!this.isApproveFunct) {
                                this.tradeDetailService.pL_TRADE_DETAIL_App(this.inputModel.plaN_ID, this.appSession.user.userName, this.appSession.user.subbrId)
                                    .pipe(finalize(() => { this.saving = false; }))
                                    .subscribe((response) => {
                                        if (response.result != '0') {
                                            this.showErrorMessage(response.errorDesc);
                                        }
                                        else {
                                            this.inputModel.autH_STATUS = AuthStatusConsts.Approve;
                                            this.updateView();
                                        }
                                    });
                            }
                            else {
                                this.inputModel.autH_STATUS = AuthStatusConsts.NotApprove;
                                this.updateView();
                            }
                        }
                    });
            }
        }
    }

    goBack() {
        this.navigatePassParam('/app/admin/trade-detail', null, undefined);
    }

    onAdd(): void {
    }

    onUpdate(item: PL_MASTER_ENTITY): void {
    }

    onDelete(item: PL_MASTER_ENTITY): void {
    }

    onApprove(item: PL_MASTER_ENTITY): void {
        if (!this.inputModel.plaN_ID) {
            return;
        }
        var currentUserName = this.appSession.user.userName;
        if (currentUserName == this.inputModel.makeR_ID) {
            this.showErrorMessage(this.l('ApproveFailed'));
            return;
        }
        


        this.message.confirm(
            this.l('ApproveWarningMessage', this.l(this.inputModel.plaN_NAME)),
            this.l('AreYouSure'),
            (isConfirmed) => {
                if (isConfirmed) {
                    this.saving = true;
                    this.plMasterService.pL_MASTER_UpdStatus(this.inputModel.plaN_ID,this.appSession.user.userName,this.appSession.user.subbrId,"A","A")
                        .pipe(finalize(() => { this.saving = false; }))
                        .subscribe((response) => {
                            if (response.result != '0') {
                                this.showErrorMessage(response.errorDesc);
                            }
                            else {
                                this.approveSuccess();
                            }
                        });
                }
            }
        );
    }

    onViewDetail(item: PL_MASTER_ENTITY): void {
    }

    onSave(): void {
        this.saveInput();
    }

    onSearch(): void {
    }

    onResetSearch(): void {
    }

    onAddNewGoodsItem(): void {
        this.categorytradeModal.cgtyear=this.inputModel.year;
        this.categorytradeModal.show();
    }

    onRemoveGoodsItem(): void {
        this.inputModel.tradE_DETAILs = this.inputModel.tradE_DETAILs.filter(x => !x.isChecked);
        this.editTable.setList(this.inputModel.tradE_DETAILs);
        this.refreshPrice(null);
    }

    SendApp(){
        // " " + this.inputModel.plaN_NAME
        this.message.confirm(
            this.l('SendAppQuestion') ,
            this.l('SendApp'),
            (isConfirmed) => {
                if (isConfirmed) {
                    this.isDisable=true;
                    this.saving = true;
                    this.plMasterService.pL_MASTER_UpdStatus(this.inputModel.plaN_ID,this.appSession.user.userName,this.appSession.user.subbrId,"U","P")
                        .pipe(finalize(() => { this.saving = false; }))
                        .subscribe((response) => {
                            if (response.result != '0') {
                                this.showErrorMessage(response.errorDesc);
                            }
                            else {
                                this.showSuccessMessage(this.l('SendAppComplete'))
                                this.isSendApp=false;
                                this.appToolbar.setButtonApproveEnable(false);
                                this.appToolbar.setButtonSaveEnable(false);
                                this.editPageState = EditPageState.viewDetail;
                                this.updateView();
                               
                            }
                        });
                }
            }
        );
    }

    Reject(){
        var currentUserName = this.appSession.user.userName;
        if (currentUserName == this.inputModel.makeR_ID) {
            this.showErrorMessage(this.l('RejectFailed'));
            return;
        }
        this.rejectModal.show();
    }


    refresh_totaL_AMT(item: TRADE_DETAIL_ENTITY) {
        item.totaL_AMT = item.quantity * item.price;
    }

    refresh_quantitY_REMAIN(item: TRADE_DETAIL_ENTITY) {
        item.quantitY_REMAIN = item.quantity - item.quantitY_EXE;
    }

    refresh_valuE_EXE(item: TRADE_DETAIL_ENTITY) {
        item.valuE_EXE = item.quantitY_EXE * item.price;
    }

    refresh_valuE_REMAIN(item: TRADE_DETAIL_ENTITY) {
        item.valuE_REMAIN = item.totaL_AMT - item.valuE_EXE;
    }

    refresh_totalAmt() {
        this.totalAmt = this.inputModel.tradE_DETAILs.sumWDefault(x => x.totaL_AMT, 0);
    }

    refresh_processValue() {
        this.processValue = this.inputModel.tradE_DETAILs.sumWDefault(x => x.valuE_EXE, 0);
    }

    price_change(item: TRADE_DETAIL_ENTITY) {
        this.refreshPrice(item);
        this.updateView();
    }

    quantity_change(item: TRADE_DETAIL_ENTITY) {
        this.refreshPrice(item);
        this.updateView();
    }

    refreshPriceItem(item: TRADE_DETAIL_ENTITY) {
        this.refresh_totaL_AMT(item);
        this.refresh_quantitY_REMAIN(item);
        this.refresh_valuE_EXE(item);
        this.refresh_valuE_REMAIN(item);
    }

    refreshPrice(item: TRADE_DETAIL_ENTITY) {
        if (item) {
            this.refreshPriceItem(item);
        }

        this.refresh_totalAmt();
        this.refresh_processValue();
    }

    onSelectGoods(selectedGoods: PL_CATEGORYTRADE_DT_ENTITY[]) {
        selectedGoods.forEach(x => {
           // if (this.inputModel.tradE_DETAILs.filter(t => t.goodS_ID == x.gD_ID).length == 0) {
                var item = new TRADE_DETAIL_ENTITY();
                Object.assign(item, x);
                item.goodS_ID = x.goodS_ID;
                item.goodS_CODE = x.goodS_CODE;
                item.goodS_NAME = x.goodS_NAME;
                item.no = this.inputModel.tradE_DETAILs.length + 1;
            
                item.quantitY_EXE = 0;
                item.valuE_EXE = 0;
                item.quantity = 1;
                item.isChecked = false;
                this.refreshPriceItem(item);
                this.inputModel.tradE_DETAILs.push(item);
           // }
        });
        this.refreshPrice(null);
        this.editTable.setList(this.inputModel.tradE_DETAILs);
    }
  

    onReturn(notes: string) {
        if(notes != "")
        {
            this.isDisable=true;
            this.tradeDetailService.pL_TRADE_DETAIL_Reject(this.inputModel.plaN_ID,"R",this.appSession.user.userName, notes,this.appSession.user.subbrId).subscribe((response) => {
                if (response.result != '0') {
                    this.showErrorMessage(response.errorDesc);
                }
                else {
                    this.showSuccessMessage(this.l('RejectSuccess'));
                    this.isReject=false;
                    this.updateView();
                }
            })
        }
    }
    showReject(){
       this.IS_SHOW_REJECT =!this.IS_SHOW_REJECT;
       this.updateView();
    }
}
