import { AfterViewInit, Component, Injector, OnInit, ViewChild, ViewEncapsulation, ApplicationRef, OnDestroy, HostListener, Optional, Inject } from '@angular/core';
import { AppConsts } from '@shared/AppConsts';
import { UrlHelper } from '@shared/helpers/UrlHelper';
import { SubscriptionStartType, AttachFileServiceProxy, API_BASE_URL } from '@shared/service-proxies/service-proxies';
import { ChatSignalrService } from 'app/shared/layout/chat/chat-signalr.service';
import * as moment from 'moment';
import { AppComponentBase } from 'shared/common/app-component-base';
import { SignalRHelper } from 'shared/helpers/SignalRHelper';
import { LinkedAccountsModalComponent } from '@app/shared/layout/linked-accounts-modal.component';
import { LoginAttemptsModalComponent } from '@app/shared/layout/login-attempts-modal.component';
import { ChangePasswordModalComponent } from '@app/shared/layout/profile/change-password-modal.component';
import { ChangeProfilePictureModalComponent } from '@app/shared/layout/profile/change-profile-picture-modal.component';
import { MySettingsModalComponent } from '@app/shared/layout/profile/my-settings-modal.component';
import { NotificationSettingsModalComponent } from '@app/shared/layout/notifications/notification-settings-modal.component';
import { UserNotificationHelper } from '@app/shared/layout/notifications/UserNotificationHelper';
import { Dropdown } from 'primeng/primeng';
import { NavigationStart, Router } from '@angular/router';
import { FileUploaderComponent } from './admin/core/controls/file-uploader/file-uploader.component';
import { AbstractControl, FormGroup, FormControl } from '@angular/forms';
// import { VersionCheckService } from 'version-checker-service';
import { environment } from 'environments/environment';

@Component({
    templateUrl: './app.component.html',
    encapsulation: ViewEncapsulation.None
})
export class AppComponent extends AppComponentBase implements OnInit, AfterViewInit {


    subscriptionStartType = SubscriptionStartType;
    theme: string;
    installationMode = true;

    private routeSub: any;  // subscription to route observer

    @ViewChild('loginAttemptsModal') loginAttemptsModal: LoginAttemptsModalComponent;
    @ViewChild('linkedAccountsModal') linkedAccountsModal: LinkedAccountsModalComponent;
    @ViewChild('changePasswordModal') changePasswordModal: ChangePasswordModalComponent;
    @ViewChild('changeProfilePictureModal') changeProfilePictureModal: ChangeProfilePictureModalComponent;
    @ViewChild('mySettingsModal') mySettingsModal: MySettingsModalComponent;
    @ViewChild('notificationSettingsModal') notificationSettingsModal: NotificationSettingsModalComponent;
    @ViewChild('chatBarComponent') chatBarComponent;

    public constructor(
        injector: Injector,
        private _chatSignalrService: ChatSignalrService,
        private _userNotificationHelper: UserNotificationHelper,
        private attachFileService: AttachFileServiceProxy,
        private appRef: ApplicationRef,
        @Optional() @Inject(API_BASE_URL) baseUrl?: string
    ) {
        super(injector);
        // this.appRef = injector.get(ApplicationRef);


        // console.log(this);
        let scope = this;
        // window.parent['api-route'] = baseUrl;
    }

    parseStringToMoment(str) {
        return moment(str);
    }

    ngOnInit(): void {

        // console.log = function () { }
        // console.count = function () { }
        // console.time = function () { }
        // console.info = function () { }
        // console.warn = function () { }

        let url = location.href.substr(8);
        url = location.href.substr(0, 8) + url.substr(0, url.indexOf('/'))

        this._userNotificationHelper.settingsModal = this.notificationSettingsModal;
        this.theme = abp.setting.get('App.UiManagement.Theme').toLocaleLowerCase();
        this.installationMode = UrlHelper.isInstallUrl(location.href);

        this.registerModalOpenEvents();

        if (this.appSession.application) {
            SignalRHelper.initSignalR(() => { this._chatSignalrService.init(); });
        }

        var scope = this;

        let oldSetBusy = abp.ui.setBusy;
        abp.ui.setBusy = function (elm?: any, text?: any, optionsOrPromise?: any) {
            return oldSetBusy(elm, text, optionsOrPromise || 100);
        }

        let oldClearBusy = abp.ui.clearBusy as any;
        abp.ui.clearBusy = function (elm?: any, optionsOrPromise?: any) {
            return oldClearBusy(elm, optionsOrPromise || 100);
        }

        Date.prototype['toISOString_old'] = Date.prototype.toISOString;

        Date.prototype.toISOString = function () {
            return moment(this).format(scope.s('gAMSProCore.DateTimeFormatClient'));
        }

        String.prototype['toMoment'] = function () {
            return scope.parseStringToMoment(this);
        }

        String.prototype['clone'] = function () {
            return scope.parseStringToMoment(this).clone();
        }

        String.prototype['format'] = function (opt) {
            return scope.parseStringToMoment(this).format(opt);
        }


        moment.prototype['toISOString_old'] = moment.prototype.toISOString;

        moment.prototype.toISOString = function () {
            return moment(this).format(scope.s('gAMSProCore.DateTimeFormatClient'));
        }

        Array.prototype.firstOrDefault = function (callbackfn: (value: any, index: number, array: any[]) => boolean, option1?: any) {
            let result = undefined;
            if (!callbackfn) {
                result = this;
            }
            else {
                result = this.filter(callbackfn);
            }
            if (result.length == 0) {
                return option1;
            }
            return result[0];
        };

        Array.prototype.sum = function (callbackfn?: (value: any, index: number, array: any[]) => number) {
            let result = undefined;
            let sum = 0;
            if (!callbackfn) {
                this.forEach(item => {
                    sum += item;
                });
            }
            else {
                let index = 0;
                this.forEach(item => {
                    let value = callbackfn(item, index, this);
                    sum += value || 0;
                    index++;
                });
            }

            return sum;
        };

        Array.prototype.sumWDefault = function (callbackfn?: (value: any, index: number, array: any[]) => number, valDefault?: any) {
            if (!this) {
                return undefined;
            }
            let result = undefined;
            let sum = 0;
            if (!callbackfn) {
                this.forEach(item => {
                    sum += item;
                });
            }
            else {
                let index = 0;
                this.forEach(item => {
                    let value = callbackfn(item, index, this);
                    if (value == null || value == undefined) {
                        value = valDefault;
                    }
                    sum += value || 0;
                    index++;
                });
            }

            return sum;
        };

        const unique = (value, index, self) => {
            return self.indexOf(value) === index
        }

        Array.prototype.distinct = function () {
            return this.filter(unique);
        }

        var stringPrototype: any = String.prototype;
        stringPrototype.toISOString = function () {
            return this;
        }

        var css = `<style>
    button.swal2-confirm:before {
        white-space: pre!important;
        content: '${this.l('Yes')} \\A'!important;
        color: white;
    }
    
    button.swal2-cancel:before {
        white-space: pre!important;
        content: '${this.l('Cancel')} \\A'!important;
        color: white;
    }</style>
    `

        $('body').prepend(css);



        //document.body.appendChild(document.createTextNode(css));

    }

    ngAfterViewInit(): void {
        abp.signalr.autoConnect = false;
    }

    subscriptionStatusBarVisible(): boolean {
        return this.appSession.tenantId > 0 &&
            (this.appSession.tenant.isInTrialPeriod ||
                this.subscriptionIsExpiringSoon());
    }

    subscriptionIsExpiringSoon(): boolean {
        if (this.appSession.tenant.subscriptionEndDateUtc) {
            return moment().utc().add(AppConsts.subscriptionExpireNootifyDayCount, 'days') >= moment(this.appSession.tenant.subscriptionEndDateUtc);
        }

        return false;
    }

    registerModalOpenEvents(): void {
        abp.event.on('app.show.loginAttemptsModal', () => {
            this.loginAttemptsModal.show();
        });

        abp.event.on('app.show.linkedAccountsModal', () => {
            this.linkedAccountsModal.show();
        });

        abp.event.on('app.show.changePasswordModal', () => {
            this.changePasswordModal.show();
        });

        abp.event.on('app.show.changeProfilePictureModal', () => {
            this.changeProfilePictureModal.show();
        });

        abp.event.on('app.show.mySettingsModal', () => {
            this.mySettingsModal.show();
        });
    }

    getRecentlyLinkedUsers(): void {
        abp.event.trigger('app.getRecentlyLinkedUsers');
    }

    onMySettingsModalSaved(): void {
        abp.event.trigger('app.onMySettingsModalSaved');
    }
}
