import { ViewEncapsulation, Component, Input, OnInit, Injector } from "@angular/core";
import { ComponentBase } from "@app/ultilities/component-base";
import { WorkflowRejectDetailServiceProxy, CM_WORKFLOW_REJECT_DETAIL_ENTITY } from "@shared/service-proxies/service-proxies";

@Component({
    templateUrl: './reject-message.component.html',
    selector: 'reject-message',
    styleUrls: ["./reject-message.component.css"],
    encapsulation: ViewEncapsulation.None
})
export class RejectMessageComponent extends ComponentBase implements OnInit {
    @Input() transactionId: string;

    messages: CM_WORKFLOW_REJECT_DETAIL_ENTITY[];

    constructor(injector: Injector,
        private workflowRejectDetailService: WorkflowRejectDetailServiceProxy) {
        super(injector);
    }

    ngOnInit(): void {
        this.reloadReject();
    }

    reloadReject() {
        this.workflowRejectDetailService.cM_WORKFLOW_List(this.transactionId).subscribe(response => {
            this.messages = response;
        });
    }
}
