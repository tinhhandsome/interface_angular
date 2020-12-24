import { Component, Injector, OnInit, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { appModuleAnimation } from '@shared/animations/routerTransition';
import { AppComponentBase } from '@shared/common/app-component-base';
import { ComboboxItemDto, CommonLookupServiceProxy, SettingScopes, HostSettingsEditDto, HostSettingsServiceProxy, SendTestEmailInput, CM_ALLCODE_ENTITY, AllCodeServiceProxy, UpdateProfilePictureInput, UltilityServiceProxy } from '@shared/service-proxies/service-proxies';
import { AllCodes } from '@app/ultilities/enum/all-codes';
import { LoginMethod } from '@app/ultilities/enum/login-method';
import { AppAuthService } from '@app/shared/common/auth/app-auth.service';
import { FileUploader, FileUploaderOptions, FileItem } from 'ng2-file-upload';
import { AppConsts } from '@shared/AppConsts';
import { TokenService } from 'abp-ng2-module/dist/src/auth/token.service';
import { IAjaxResponse } from 'abp-ng2-module/dist/src/abpHttpInterceptor';
import { HttpClient, HttpHeaders, HttpRequest, HttpEventType, HttpResponse } from '@angular/common/http';

@Component({
    templateUrl: './host-settings.component.html',
    animations: [appModuleAnimation()]
})
export class HostSettingsComponent extends AppComponentBase implements OnInit {

    loading = false;
    hostSettings: HostSettingsEditDto;
    editions: ComboboxItemDto[] = undefined;
    testEmailAddress: string = undefined;
    showTimezoneSelection = abp.clock.provider.supportsMultipleTimezone;
    defaultTimezoneScope: SettingScopes = SettingScopes.Application;

    usingDefaultTimeZone = false;
    initialTimeZone: string = undefined;
    remoteServiceBaseUrl: string;

    loginMethods: CM_ALLCODE_ENTITY[];

    LoginMethod = LoginMethod;

    isShowError = false;
    @ViewChild('settingForm') settingForm: ElementRef;
    @ViewChild('fileLogo') fileLogo: ElementRef;
    @ViewChild('fileLoginLogo') fileLoginLogo: ElementRef;
    fileControl: ElementRef;

    constructor(
        injector: Injector,
        private _hostSettingService: HostSettingsServiceProxy,
        private _commonLookupService: CommonLookupServiceProxy,
        private _authService: AppAuthService,
        private _allCodeService: AllCodeServiceProxy,
        private httpClient: HttpClient,
        private ultilitiesService: UltilityServiceProxy,
        private _tokenService: TokenService
    ) {
        super(injector);
        this.remoteServiceBaseUrl = AppConsts.remoteServiceBaseUrl;
        this.cdr = injector.get(ChangeDetectorRef);
    }

    loadHostSettings(): void {
        const self = this;
        self._hostSettingService.getAllSettings()
            .subscribe(setting => {
                self.hostSettings = setting;
                self.initialTimeZone = setting.general.timezone;
                self.usingDefaultTimeZone = setting.general.timezoneForComparison === self.setting.get('Abp.Timing.TimeZone');
                this.cdr.detectChanges();
            });
    }

    loadEditions(): void {
        const self = this;
        self._commonLookupService.getEditionsForCombobox(false).subscribe((result) => {
            self.editions = result.items;

            const notAssignedEdition = new ComboboxItemDto();
            notAssignedEdition.value = null;
            notAssignedEdition.displayText = self.l('NotAssigned');

            self.editions.unshift(notAssignedEdition);
            this.cdr.detectChanges();
        });
    }

    init(): void {
        const self = this;
        self.testEmailAddress = self.appSession.user.emailAddress;
        self.showTimezoneSelection = abp.clock.provider.supportsMultipleTimezone;
        self.loadHostSettings();
        self.loadEditions();

        this._allCodeService.cM_ALLCODE_GetByCDNAME(AllCodes.LOGIN_METHOD, '').subscribe(response => {
            this.loginMethods = response;
            this.cdr.detectChanges();
        })
    }

    ngOnInit(): void {
        const self = this;
        self.init();
    }

    sendTestEmail(): void {
        const self = this;
        const input = new SendTestEmailInput();
        input.emailAddress = self.testEmailAddress;
        self._hostSettingService.sendTestEmail(input).subscribe(result => {
            self.showSuccessMessage(self.l('TestEmailSentSuccessfully'));
        });
    }

    imageChangedEvent: any = '';
    fileChangeEvent(event: any): void {
        if (!event.target.files[0].name.match(/.(jpg|jpeg|png|gif)$/i)) {
            this.showErrorMessage(this.l('ProfilePicture_Warn_FormatInvalid'));
            return;
        }
        this.imageChangedEvent = event;
    }

    getCookie(name) {
        var value = "; " + document.cookie;
        var parts = value.split("; " + name + "=");
        if (parts.length == 2) return parts.pop().split(";").shift();
    }

    fileName: string;
    filePath: string;
    settingName: string;
    async uploadLogo(evt) {
        if (!evt.target.value) {
            return;
        }
        this.settingName = 'gAMSProCore.WebLogo';
        this.fileControl = this.fileLogo;
        await this.fileUpload(undefined);
    }

    async uploadLoginLogo(evt) {
        if (!evt.target.value) {
            return;
        }
        this.settingName = 'gAMSProCore.LogoLogin';
        this.fileControl = this.fileLoginLogo;
        await this.fileUpload(undefined);
    }

    async fileUpload(i) {

        let logoFile = this.s(this.settingName);
        this.fileName = logoFile.substr(logoFile.lastIndexOf('/') + 1);
        this.filePath = logoFile.substr(0, logoFile.lastIndexOf('/'));

        let scope = this;

        let el = this.fileControl.nativeElement;

        let tokenAuth = scope.getCookie('Abp.AuthToken');

        let headers = { 'Authorization': 'Bearer ' + tokenAuth, 'Accept': 'application/json, text/plain, */*', 'Access-Encoding': 'gzip, deflate', 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET, POST, PATCH, PUT, DELETE, OPTIONS', 'Access-Control-Allow-Headers': 'Origin, Content-Type, X-Auth-Token' };


        const endpoint = this.remoteServiceBaseUrl + '/api/Ultility/UploadLogo';

        let fData = new FormData();
        fData.append("action", 'upload');
        fData.append("method", 'ajax');
        fData.append("d", this.filePath);
        fData.append("fileName", this.fileName);
        fData.append("settingName", this.settingName);

        for (var inn = 0; inn < el.files.length; inn++) {
            fData.append("files[]", el.files[inn]);
        }

        let h = new HttpHeaders();

        Object.keys(headers).forEach(k => {
            h.append(k, headers[k]);
        })

        try {

            const req = new HttpRequest('POST', endpoint, fData, { headers: h, reportProgress: true, });

            this.httpClient.request(req).subscribe(event => {
                if (event.type === HttpEventType.UploadProgress) {
                    console.log(event);
                    const percentDone = Math.round(event.loaded * 10 / event.total) / 10;
                    console.log(`File is ${percentDone}% uploaded.`);
                } else if (event instanceof HttpResponse) {
                    let img = $(this.fileControl.nativeElement).closest('.logo-group').find('img');
                    let src = img.attr('src');
                    img.attr('src', src.substr(0, src.lastIndexOf('?')) + '?v=' + this.generateUUID());
                }
            })

        } catch (err) {
            console.log(err);
        }
    }


    saveAll(): void {
        if ((this.settingForm as any).form.invalid) {
            this.isShowError = true;
            this.message.error(this.l('FormInvalid'), this.l('ErrorTitle'));
            return;
        }

        const self = this;
        self._hostSettingService.updateAllSettings(self.hostSettings).subscribe(result => {
            self.showSuccessMessage(self.l('SavedSuccessfully'));

            if (result.requiredLogout) {
                this.message.warn(
                    this.l('SystemRequiredLogout'),
                    this.l('Notification')
                );

                setTimeout(() => {
                    this._authService.logout(true);
                }, 2000);
            }

            if (result.requiredRefresh || (abp.clock.provider.supportsMultipleTimezone && self.usingDefaultTimeZone && self.initialTimeZone !== self.hostSettings.general.timezone)) {
                self.message.info(self.l('TimeZoneSettingChangedRefreshPageNotification')).then(() => {
                    window.location.reload();
                });
            }
        });
    }
}
