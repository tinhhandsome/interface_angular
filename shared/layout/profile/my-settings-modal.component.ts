import { Component, EventEmitter, Injector, Output, ViewChild, ElementRef } from '@angular/core';
import { AppConsts } from '@shared/AppConsts';
import { AppComponentBase } from '@shared/common/app-component-base';
import { CurrentUserProfileEditDto, SettingScopes, ProfileServiceProxy, UpdateGoogleAuthenticatorKeyOutput, CM_DEPARTMENT_ENTITY, CM_BRANCH_ENTITY, DepartmentServiceProxy, BranchServiceProxy } from '@shared/service-proxies/service-proxies';
import { ModalDirective } from 'ngx-bootstrap';
import { SmsVerificationModalComponent } from './sms-verification-modal.component';
import { finalize } from 'rxjs/operators';
import { WebConsts } from '@app/ultilities/enum/consts';
import { LoginMethod } from '@app/ultilities/enum/login-method';
import { NgForm } from '@angular/forms';
import { RecordStatusConsts } from '@app/admin/core/ultils/consts/RecordStatusConsts';
import { AuthStatusConsts } from '@app/admin/core/ultils/consts/AuthStatusConsts';

@Component({
    selector: 'mySettingsModal',
    templateUrl: './my-settings-modal.component.html'
})
export class MySettingsModalComponent extends AppComponentBase {

    @ViewChild('mySettingsModal') modal: ModalDirective;
    @ViewChild('smsVerificationModal') smsVerificationModal: SmsVerificationModalComponent;
    @Output() modalSave: EventEmitter<any> = new EventEmitter<any>();

    public active = false;
    public saving = false;
    public isGoogleAuthenticatorEnabled = false;
    public isPhoneNumberConfirmed: boolean;
    public isPhoneNumberEmpty = false;
    public smsEnabled: boolean;
    public user: CurrentUserProfileEditDto;
    public showTimezoneSelection: boolean = abp.clock.provider.supportsMultipleTimezone;
    public canChangeUserName: boolean;
    public defaultTimezoneScope: SettingScopes = SettingScopes.User;
    private _initialTimezone: string = undefined;
    public roles: string;

    departments: CM_DEPARTMENT_ENTITY[];
    branchs: CM_BRANCH_ENTITY[];

    isNormalLoginMethod = this.setting.get(WebConsts.LoginMethodConsts) == LoginMethod.normal;
    isLdapLoginMethod = this.setting.get(WebConsts.LoginMethodConsts) == LoginMethod.ldap;
    isAdfsLoginMethod = this.setting.get(WebConsts.LoginMethodConsts) == LoginMethod.adfs;

    @ViewChild('DepIdInput') debtSelect: ElementRef;
    @ViewChild('mySettingsModalForm') mySettingsModalForm: NgForm;

    public isShowError = false;

    // isTwofactorLoginEnable = abp.setting.getBoolean('Abp.Zero.UserManagement.TwoFactorLogin.IsEnabled')
    isTwofactorLoginEnable = abp.setting.getBoolean('App.UserManagement.TwoFactorLogin.IsGoogleAuthenticatorEnabled')

    constructor(
        injector: Injector,
        private _departmentService: DepartmentServiceProxy,
        private _branchService: BranchServiceProxy,
        private _profileService: ProfileServiceProxy
    ) {
        super(injector);

        var filterCombobox: any = {
            maxResultCount: -1,
            recorD_STATUS: RecordStatusConsts.Active,
            autH_STATUS: AuthStatusConsts.Approve
        };

        this._branchService.cM_BRANCH_Search(filterCombobox).subscribe(response => {
            this.branchs = response.items;
        })
    }

    show(): void {
        this.active = true;
        this._profileService.getCurrentUserProfileForEdit().subscribe((result) => {
            this.smsEnabled = this.setting.getBoolean('App.UserManagement.SmsVerificationEnabled');
            this.user = result;
            this._initialTimezone = result.timezone;
            this.canChangeUserName = this.user.userName !== AppConsts.userManagement.defaultAdminUserName;
            this.modal.show();
            this.isGoogleAuthenticatorEnabled = result.isGoogleAuthenticatorEnabled;
            this.isPhoneNumberConfirmed = result.isPhoneNumberConfirmed;
            this.isPhoneNumberEmpty = result.phoneNumber === '';
            this.roles = result.roles.map((x) => { return x.roleName }).join(',');
        });
    }

    onChangeBranch(brancH_ID) {
        var filterCombobox: any = {
            maxResultCount: -1,
            recorD_STATUS: RecordStatusConsts.Active,
            autH_STATUS: AuthStatusConsts.Approve,
            brancH_ID: brancH_ID ? brancH_ID : '-'
        };

        this._departmentService.cM_DEPARTMENT_Search(filterCombobox).subscribe(response => {
            this.departments = response.items;
        });
    }

    updateQrCodeSetupImageUrl(): void {
        this._profileService.updateGoogleAuthenticatorKey().subscribe((result: UpdateGoogleAuthenticatorKeyOutput) => {
            this.user.qrCodeSetupImageUrl = result.qrCodeSetupImageUrl;
            this.isGoogleAuthenticatorEnabled = true;
        });
    }

    smsVerify(): void {
        this._profileService.sendVerificationSms()
            .subscribe(() => {
                this.smsVerificationModal.show();
            });
    }

    changePhoneNumberToVerified(): void {
        this.isPhoneNumberConfirmed = true;
    }

    onShown(): void {
        //document.getElementById('Name').focus();
    }

    close(): void {
        this.active = false;
        this.modal.hide();
    }

    save(): void {
        if ((this.mySettingsModalForm as any).form.invalid) {
            this.isShowError = true;
            this.message.error(this.l('FormInvalid'), this.l('ErrorTitle'));
            return;
        }

        this.saving = true;
        this._profileService.updateCurrentUserProfile(this.user)
            .pipe(finalize(() => { this.saving = false; }))
            .subscribe(() => {
                this.appSession.user.name = this.user.name;
                this.appSession.user.surname = this.user.surname;
                this.appSession.user.userName = this.user.userName;
                this.appSession.user.emailAddress = this.user.emailAddress;

                this.close();
                this.modalSave.emit(null);

                setTimeout(() => {
                    this.showSuccessMessage(this.l('SavedSuccessfully'));
                }, 500);

                if (abp.clock.provider.supportsMultipleTimezone && this._initialTimezone !== this.user.timezone) {
                    this.message.info(this.l('TimeZoneSettingChangedRefreshPageNotification')).then(() => {
                        window.location.reload();
                    });
                }
            });
    }
}
