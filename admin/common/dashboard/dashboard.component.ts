import { ViewEncapsulation, Component } from "@angular/core";
import { appModuleAnimation } from "@shared/animations/routerTransition";

@Component({
    templateUrl: './dashboard.component.html',
    encapsulation: ViewEncapsulation.None,
    animations: [appModuleAnimation()]
})
export class DashboardComponent{

}