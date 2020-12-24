import { ViewEncapsulation, Injector, Component, ViewChild, Input, AfterViewInit } from "@angular/core";
import { appModuleAnimation } from "@shared/animations/routerTransition";
import { UserListDto, TL_ROLE_NOTIFICATION_ENTITY, TradePoMasterServiceProxy, TR_PO_MASTER_ENTITY, TLUSER_GETBY_BRANCHID_ENTITY } from "@shared/service-proxies/service-proxies";
import { EditableTableComponent } from "@app/admin/core/controls/editable-table/editable-table.component";
import { EditPageState } from "@app/ultilities/enum/edit-page-state";
import { NgForm } from "@angular/forms";
import { ChangeDetectionComponent } from "@app/admin/core/ultils/change-detection.component";
import * as moment from 'moment'; 

@Component({
    selector: 'role-notification-editable',
    templateUrl: './role-notification-editable.component.html',
    encapsulation: ViewEncapsulation.None,
    animations: [appModuleAnimation()]
})
export class RoleNotificationEditableComponent extends ChangeDetectionComponent implements AfterViewInit {

    constructor(
        injector: Injector,
        private tradePoMasterService: TradePoMasterServiceProxy,
    ) {
        super(injector);        
    }

    @ViewChild('editTableRoleNotification') editTableRoleNotification: EditableTableComponent<TL_ROLE_NOTIFICATION_ENTITY>;
    @Input() inputModel : TR_PO_MASTER_ENTITY;

    reloadList(){

    }

    ngAfterViewInit(): void {
        // COMMENT: this.stopAutoUpdateView();
    }

    @Input() disableInput: boolean;
    @Input() isShowError: boolean;
    @Input() editPageState: EditPageState;

    @Input() editForm: NgForm;

    /* #region Bảng con: danh sách user nhận thông báo  */


    onSelectUser(users: TLUSER_GETBY_BRANCHID_ENTITY[]) {
        var datas = [...this.editTableRoleNotification.allData];
        users.forEach(x => {
            if (datas.filter(d => d.tL_NAME == x.tlnanme).length == 0) {
                var model = new TL_ROLE_NOTIFICATION_ENTITY();
                model.tlFullName = x.tlFullName;
                model.tL_NAME = x.tlnanme;
                model.editoR_DT = moment().startOf('day');
                model.editoR_ID = x.tlnanme;
                model.isChecked = false;
                datas.push(model);
            }
        });
        this.editTableRoleNotification.allData = datas;
        this.editTableRoleNotification.resetNoAndPage();
        this.editTableRoleNotification.changePage(0);
    }


    /* #endregion */

}


    