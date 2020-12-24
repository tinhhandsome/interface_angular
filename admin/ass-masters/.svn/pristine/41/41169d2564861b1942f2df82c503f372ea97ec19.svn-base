import { ViewEncapsulation, Component, AfterViewInit, Injector, Input, ViewChild, ChangeDetectionStrategy } from "@angular/core";
import { appModuleAnimation } from "@shared/animations/routerTransition";
import { ChangeDetectionComponent } from "@app/admin/core/ultils/change-detection.component";
import { ASS_ADDNEW_WAR_ENTITY } from "@shared/service-proxies/service-proxies";
import { EditableTableComponent } from "@app/admin/core/controls/editable-table/editable-table.component";

@Component({
    selector: 'ass-waranty',
    templateUrl: './ass-waranty.component.html',
    encapsulation: ViewEncapsulation.None,
    animations: [appModuleAnimation()]
})
export class AssWarantyComponent extends ChangeDetectionComponent implements AfterViewInit {
    constructor(
        injector: Injector,
    ) {
        super(injector);
        // COMMENT: this.stopAutoUpdateView();
        this.warrantyMonths = 0;
    }

    ngAfterViewInit(): void {
        this.updateView();
    }

    @ViewChild('editTableWar') editTableWar: EditableTableComponent<ASS_ADDNEW_WAR_ENTITY>;

    @Input() disableInput: boolean;
    @Input() isShowError: boolean;

    @Input() warrantyMonths: number;

    @Input() isWarMonthDisabled: boolean;


    @Input() get assWars(): ASS_ADDNEW_WAR_ENTITY[] {
        return this.editTableWar.allData;
    }

    set assWars(assAddNewWars: ASS_ADDNEW_WAR_ENTITY[]) {
        if (!assAddNewWars) {
            assAddNewWars = [];
        }
        this.editTableWar.allData = assAddNewWars;
        this.editTableWar.resetNoAndPage();
        this.editTableWar.changePage(0);
    }


}