import { Input, Component, ViewEncapsulation, Injector, AfterViewInit } from "@angular/core";
import { AuthStatusConsts } from "../../ultils/consts/AuthStatusConsts";
import { ChangeDetectionComponent } from "../../ultils/change-detection.component";
import { ComponentBase } from "@app/ultilities/component-base";

@Component({
    templateUrl: './auth-status-input-page.component.html',
    selector: 'auth-status-input-page',
    styleUrls: ["./auth-status-input-page.css"],
    encapsulation: ViewEncapsulation.None
})
export class AuthStatusInputPageComponent extends ChangeDetectionComponent implements AfterViewInit {
    ngAfterViewInit(): void {
        // COMMENT: this.stopAutoUpdateView();
    }

    _authStatus: string;

    @Input() get authStatus() : string{
        return this._authStatus;
    }

    set authStatus(auth : string){
        this._authStatus = auth;
        this.updateView();
    }

    AuthStatusConsts = AuthStatusConsts;

    constructor(injector: Injector) {
        super(injector);
    }
}