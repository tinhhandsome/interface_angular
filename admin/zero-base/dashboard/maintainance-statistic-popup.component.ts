import { ViewEncapsulation, Component, ViewChild, Injector } from "@angular/core";
import { appModuleAnimation } from "@shared/animations/routerTransition";
import { ModalDirective } from "ngx-bootstrap";
import { AppComponentBase } from "@shared/common/app-component-base";

@Component({
    selector: "maintainanceStatistic",
    templateUrl: './maintainance-statistic-popup.component.html',
    encapsulation: ViewEncapsulation.None,
    animations: [appModuleAnimation()]
})
export class MaintainanceStatisticPopupComponent extends AppComponentBase {

    @ViewChild('statisticModal') modal: ModalDirective;

    week: number;
    nextWeek: number;
    month: number;

    constructor(
        injector: Injector
    ) {
        super(injector);
    }

    init(week: number, nextWeek: number, month: number){
        this.week = week;
        this.nextWeek = nextWeek;
        this.month = month;
    }

    show() {
        this.modal.show();
    }

    close() {
        this.modal.hide();
    }
}