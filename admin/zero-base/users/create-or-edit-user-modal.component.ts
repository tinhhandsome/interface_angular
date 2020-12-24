import { Component, EventEmitter, Injector, Output, ViewChild, OnInit, ChangeDetectorRef, ElementRef, AfterViewInit } from '@angular/core';
import { AppConsts } from '@shared/AppConsts';
import { AppComponentBase } from '@shared/common/app-component-base';
import { CreateOrUpdateUserInput, OrganizationUnitDto, PasswordComplexitySetting, ProfileServiceProxy, UserEditDto, UserRoleDto, UserServiceProxy, DepartmentServiceProxy, CM_DEPARTMENT_ENTITY, TokenAuthServiceProxy, CM_BRANCH_ENTITY, BranchServiceProxy } from '@shared/service-proxies/service-proxies';
import { ModalDirective } from 'ngx-bootstrap';
import * as _ from 'lodash';
import { finalize } from 'rxjs/operators';
import { LoginMethod } from '@app/ultilities/enum/login-method';
import { WebConsts } from '@app/ultilities/enum/consts';
import { NgForm } from '@angular/forms';
import { LdapResultStatusConsts } from '@app/ultilities/enum/ldap-result-status-consts';
import { RecordStatusConsts } from '@app/admin/core/ultils/consts/RecordStatusConsts';
import { AuthStatusConsts } from '@app/admin/core/ultils/consts/AuthStatusConsts';

@Component({
    selector: 'createOrEditUserModal',
    templateUrl: './create-or-edit-user-modal.component.html',
    styles: [`.user-edit-dialog-profile-image {
             margin-bottom: 20px;
        }`
    ]
})
export class CreateOrEditUserModalComponent extends AppComponentBase implements OnInit, AfterViewInit {

    @ViewChild('createOrEditModal') modal: ModalDirective;
    @ViewChild('userForm') userForm: NgForm;

    departments: CM_DEPARTMENT_ENTITY[];
    branchs: CM_BRANCH_ENTITY[];

    @Output() modalSave: EventEmitter<any> = new EventEmitter<any>();

    active = false;
    saving = false;
    canChangeUserName = true;
    isTwoFactorEnabled: boolean = this.setting.getBoolean('Abp.Zero.UserManagement.TwoFactorLogin.IsEnabled');
    isLockoutEnabled: boolean = this.setting.getBoolean('Abp.Zero.UserManagement.UserLockOut.IsEnabled');
    passwordComplexitySetting: PasswordComplexitySetting = new PasswordComplexitySetting();

    isShowError = false;

    user: UserEditDto = new UserEditDto();
    roles: UserRoleDto[];
    sendActivationEmail = true;
    setRandomPassword = true;
    passwordComplexityInfo = '';
    profilePicture: string;
    enableUserName = true;

    allOrganizationUnits: OrganizationUnitDto[];
    memberedOrganizationUnits: string[];

    isChangePassword: boolean = true;

    isNormalLoginMethod = this.setting.get(WebConsts.LoginMethodConsts) == LoginMethod.normal;
    isLdapLoginMethod = this.setting.get(WebConsts.LoginMethodConsts) == LoginMethod.ldap;
    isAdfsLoginMethod = this.setting.get(WebConsts.LoginMethodConsts) == LoginMethod.adfs;

    userNameValid: string;

    constructor(
        injector: Injector,
        private _userService: UserServiceProxy,
        private _tokenAuthServiceProxy: TokenAuthServiceProxy,
        private _departmentService: DepartmentServiceProxy,
        private _branchService: BranchServiceProxy,
        private ref: ElementRef,
        private _profileService: ProfileServiceProxy
    ) {
        super(injector);
        this.cdr = injector.get(ChangeDetectorRef);
        console.log(this);
    }

    ngOnInit(): void {
        this._branchService.cM_BRANCH_Search(this.getFillterForCombobox()).subscribe(response => {
            this.branchs = response.items;
        });
    }

    ngAfterViewInit(): void {
        this.setupValidationMessage();
    }

    setupValidationMessage() {

        var self = this;
        this.ref.nativeElement.querySelectorAll('input[required], textarea[required],input[pattern],money-input[required]>input,date-control>input, input[hidden][required]~input').forEach(x => {
            x['focusout'] = function () {
                if (self.isShowError) {
                    self.updateView();
                }
            }
        });

        this.ref.nativeElement.querySelectorAll('select2-custom[required],all-code-select[required]').forEach(x => {
            $(x).on('select2:select', function (e) {
                if (self.isShowError) {
                    self.updateView();
                }
            });
        });
    }

    show(userId?: number): void {
        this.isShowError = false;
        if (!userId) {
            this.active = true;
            this.setRandomPassword = false;
            this.sendActivationEmail = true;
            this.user.deP_ID = '';
            this.user.subbrId = '';
            this.isChangePassword = true;
        }
        else {
            this.isChangePassword = false;
        }

        this._userService.getUserForEdit(userId).subscribe(userResult => {
            this.user = userResult.user;
            this.roles = userResult.roles;
            // this.canChangeUserName = this.user.userName !== AppConsts.userManagement.defaultAdminUserName;
            this.canChangeUserName = true;


            this.allOrganizationUnits = userResult.allOrganizationUnits;
            this.memberedOrganizationUnits = userResult.memberedOrganizationUnits;

            this.getProfilePicture(userResult.profilePictureId);
            this.enableUserName = true;
            this.sendActivationEmail = false;
            this.isLockoutEnabled = true;

            if (userId) {
                this.active = true;
                this.enableUserName = false;

                setTimeout(() => {
                    this.setRandomPassword = false;
                }, 0);

            }

            this._profileService.getPasswordComplexitySetting().subscribe(passwordComplexityResult => {
                this.passwordComplexitySetting = passwordComplexityResult.setting;
                this.setPasswordComplexityInfo();
                this.modal.show();
            });

            this.setRandomPasswordChange();
            this.cdr.detectChanges();
        });
    }

    setRandomPasswordChange() {
        if (this.setRandomPassword) {
            this.user.shouldChangePasswordOnNextLogin = true;
            this.sendActivationEmail = true;
            if (!this.user.id) {
                this.user.isActive = false;
            }
        }
        this.updateView();
    }

    sendActivationEmailChange() {
        if (this.sendActivationEmail) {
            if (!this.user.id) {
                this.user.isActive = false;
            }
        }
    }

    setPasswordComplexityInfo(): void {

        this.passwordComplexityInfo = '<ul>';

        if (this.passwordComplexitySetting.requireDigit) {
            this.passwordComplexityInfo += '<li>' + this.l('PasswordComplexity_RequireDigit_Hint') + '</li>';
        }

        if (this.passwordComplexitySetting.requireLowercase) {
            this.passwordComplexityInfo += '<li>' + this.l('PasswordComplexity_RequireLowercase_Hint') + '</li>';
        }

        if (this.passwordComplexitySetting.requireUppercase) {
            this.passwordComplexityInfo += '<li>' + this.l('PasswordComplexity_RequireUppercase_Hint') + '</li>';
        }

        if (this.passwordComplexitySetting.requireNonAlphanumeric) {
            this.passwordComplexityInfo += '<li>' + this.l('PasswordComplexity_RequireNonAlphanumeric_Hint') + '</li>';
        }

        if (this.passwordComplexitySetting.requiredLength) {
            this.passwordComplexityInfo += '<li>' + this.l('PasswordComplexity_RequiredLength_Hint', this.passwordComplexitySetting.requiredLength) + '</li>';
        }

        this.passwordComplexityInfo += '</ul>';
    }

    getProfilePicture(profilePictureId: string): void {
        if (!profilePictureId) {
            this.profilePicture = this.appRootUrl() + 'assets/common/images/default-profile-picture.png';
        } else {
            this._profileService.getProfilePictureById(profilePictureId).subscribe(result => {

                if (result && result.profilePicture) {
                    this.profilePicture = 'data:image/jpeg;base64,' + result.profilePicture;
                } else {
                    this.profilePicture = this.appRootUrl() + 'assets/common/images/default-profile-picture.png';
                }
            });
        }
    }

    onChangeBranch(branch) {
        var filterCombobox: any = {
            maxResultCount: -1,
            recorD_STATUS: RecordStatusConsts.Active,
            autH_STATUS: AuthStatusConsts.Approve,
            brancH_ID: branch ? branch.brancH_ID : '-'
        };

        this._departmentService.cM_DEPARTMENT_Search(filterCombobox).subscribe(response => {
            this.departments = response.items;
            this.updateView();
        });
    }

    onShown(): void {
        // document.getElementById('Name').focus();
    }

    getUserInfo() {
        // this._tokenAuthServiceProxy.getUserInfomation(this.user.userName).subscribe(response => {
        //     switch (response.result) {
        //         case LdapResultStatusConsts.Success:
        //             this.user.name = response.tlFullName;
        //             this.user.emailAddress = response.email;
        //             this.user.phoneNumber = response.phone;
        //             this.userNameValid = 'valid';
        //             this.removeMessage();
        //             // this.notify.error(this.l('LdapResultStatusConstsSuccess'));
        //             break;
        //         case LdapResultStatusConsts.AlreadyHas:
        //             this.userNameValid = 'invalid';
        //             this.showErrorMessage(this.l('LdapResultStatusConstsAlreadyHas'));
        //             break;
        //         default:
        //             this.userNameValid = 'invalid';
        //             this.showErrorMessage(this.l('LdapResultStatusConstsFailed'));
        //             break;
        //     }
        // })
    }

    save(): void {
        if ((this.userForm as any).form.invalid) {
            this.isShowError = true;
            this.showErrorMessage(this.l('FormInvalid'));
            this.updateView();
            return;
        }

        let input = new CreateOrUpdateUserInput();

        this.user.markerId = this.appSession.user.userName;


        if (this.isLdapLoginMethod) {
            input.user = this.user;
            input.setRandomPassword = true;
            input.sendActivationEmail = false;
            input.user.isActive = true;
            input.assignedRoleNames =
                _.map(
                    _.filter(this.roles, { isAssigned: true }), role => role.roleName
                );
        }
        else {
            input.user = this.user;
            input.setRandomPassword = this.setRandomPassword;
            input.sendActivationEmail = this.sendActivationEmail;
            input.assignedRoleNames =
                _.map(
                    _.filter(this.roles, { isAssigned: true }), role => role.roleName
                );
        }

        if (!this.isChangePassword) {
            this.user.password = null;
            this.user.passwordRepeat = null;
        }

        if (input.assignedRoleNames.length == 0) {
            this.showErrorMessage(this.l('PleaseSelectRole'));
            return;
        }

        abp.ui.setBusy();
        this.saving = true;
        this._userService.createOrUpdateUser(input)
            .pipe(finalize(() => { this.saving = false; abp.ui.clearBusy() }))
            .subscribe(() => {
                this.close();
                this.modalSave.emit(null);
                setTimeout(() => {
                    this.showSuccessMessage(this.l('SavedSuccessfully'));
                }, 500)
            });
    }

    close(): void {
        this.active = false;
        this.modal.hide();
    }

    getAssignedRoleCount(): number {
        return _.filter(this.roles, { isAssigned: true }).length;
    }
}
