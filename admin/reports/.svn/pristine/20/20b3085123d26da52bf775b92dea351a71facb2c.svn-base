import { Injector, Component, OnInit, ViewEncapsulation, AfterViewInit, ElementRef, ViewChild } from "@angular/core";
import { ReportInfo, AsposeServiceProxy, CM_DEPARTMENT_ENTITY, BranchServiceProxy, CM_BRANCH_ENTITY, CM_DIVISION_ENTITY, DepartmentServiceProxy, TR_PO_MASTER_ENTITY, TradePoMasterServiceProxy } from "@shared/service-proxies/service-proxies";
import { appModuleAnimation } from "@shared/animations/routerTransition";
import { FileDownloadService } from "@shared/utils/file-download.service";
import { ReportTypeConsts } from "@app/admin/core/ultils/consts/ReportTypeConsts";
import { DefaultComponentBase } from "@app/ultilities/default-component-base";
import { PreviewTemplateService } from "@app/admin/common/preview-template/preview-template.service";
import * as moment from 'moment';
import { Select2CustomComponent } from "@app/admin/core/controls/custom-select2/select2-custom.component";
import { BranchModalComponent } from "@app/admin/core/controls/branch-modal/branch-modal.component";
import { TradePoMasterModalComponent } from "@app/admin/core/controls/trade-po-master-modal/trade-po-master-modal.component";
import { DateFormatPipe } from "@app/admin/core/pipes/date-format.pipe";

@Component({
    templateUrl: './pl-kh-bc-07.component.html',
    encapsulation: ViewEncapsulation.None,
    animations: [appModuleAnimation()]
})

export class PlKHBC07Component extends DefaultComponentBase implements OnInit, AfterViewInit {

    filterInput: any = {};

    @ViewChild('editForm') editForm: ElementRef;
    @ViewChild('poMasterModal') poMasterModal: TradePoMasterModalComponent;
    isShowError = false;
    po: TR_PO_MASTER_ENTITY = new TR_PO_MASTER_ENTITY();

    totalAmtReport: number;
    branchPaymentReport: string;
    addressReport: string[];

    constructor(injector: Injector,
        private tradePoMasterService: TradePoMasterServiceProxy,
        private previewTemplateService: PreviewTemplateService) {
        super(injector);
        // COMMENT: this.stopAutoUpdateView();
    }

    ngAfterViewInit(): void {
        this.updateView();
    }


    ngOnInit(): void {
        this.filterInput.BRANCH_LOGIN = this.appSession.user.subbrId;
    }

    previewTemplate() {

        if ((this.editForm as any).form.invalid) {
            this.isShowError = true;
            this.showErrorMessage(this.l('FormInvalid'));
            this.updateView();
            return;
        }

        let reportInfo = new ReportInfo();

        let parameters = this.GetParamsFromFilter(this.filterInput);


        let values = this.GetParamsFromFilter({
            PrintDate: (new DateFormatPipe()).transform(moment()),
            PoCode: this.po.pO_CODE,
            SupName: this.po.suP_NAME,
            FullName: this.appSession.user.name,
            CreatedUser: this.po.makeR_FULLNAME,
            TotalAmt: this.formatMoney(this.totalAmtReport),
            CreatedDt: (new DateFormatPipe()).transform(this.po.creatE_DT),
            BranchPayment: this.branchPaymentReport,
            NOI_NHAN_HANG: '<ul>' + this.addressReport.map(x => '<li>' + x + '</li>').join('') + '</ul>',
            ContractDescription: (this.po.contracT_ID ? this.l('KH_BC_07_ContractDescription', this.po.contracT_NAME, this.po.contracT_CODE, (new DateFormatPipe()).transform(this.po.contracT_DT)) : '') + `<br>Đề nghị quý Công ty giao hàng cho Sacombank với thông tin như sau:`
        });

        // let values = this.GetParamsFromFilter({
        //     branchName: this.appSession.user.branchName,
        //     DatePrint: moment().format(this.s('gAMSProCore.DateReportDisplayFormat')),
        //     PoCode: this.po.pO_CODE,
        //     SupName: this.po.s_SUP_NAME,
        //     NOI_NHAN_HANG: this.po.suP_ADDR,
        //     fullName: this.appSession.user.name
        // });

        this.previewTemplateService.printReportTemplate('rpt_KH_BC07', parameters, values);
    }

    showPoMasterModal() {
        this.poMasterModal.filterInput.autH_STATUS = undefined;
        this.poMasterModal.show();
    }

    onSelectPo(po: TR_PO_MASTER_ENTITY) {
        this.po = po;

        this.tradePoMasterService.tR_PO_MASTER_ById(po.pO_ID).subscribe(response => {
            this.po = response;
        })

        this.filterInput.PO_ID = po.pO_ID;

        this.tradePoMasterService.tR_PO_DETAIL_ById(this.filterInput).subscribe(response => {
            response.forEach(x => {
                x.goodstypE_REAL = undefined;
                x.goodstypE_REAL_NAME = x.gdreaL_TYPE_NAME;
                x.remaiN_AMT = x.totaL_AMT - x.amounT_PAID;
                x.receivE_BRANCH_NAME = x.r_BRANCH_NAME;
                x.amt = x.amt || 0;
            })

            this.po.tR_PO_DETAILs = response;
            this.initPoDetailForReport();

        });

        this.updateView();
    }


    initPoDetailForReport() {
        this.totalAmtReport = this.po.tR_PO_DETAILs.sum(x => x.totaL_AMT);
        let hsPayCount = this.po.tR_PO_DETAILs.filter(x => x.iS_HQ_PAY == '1').length;
        let poDetailCount = this.po.tR_PO_DETAILs.length;
        this.branchPaymentReport = hsPayCount == poDetailCount ? 'Hội sở' : (hsPayCount == 0 ? 'CN/PGD' : 'CN/PGD/Hội sở');
        this.addressReport = this.po.tR_PO_DETAILs.filter(x => x.receivE_ADDR || x.receivE_TEL || x.receivE_PERSON).map(x => [x.receivE_ADDR.trim(), x.receivE_PERSON.trim(), x.receivE_TEL.trim()].filter(a => a).join(', ')).distinct();
    }
}
