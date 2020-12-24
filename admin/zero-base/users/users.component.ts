import { Component, Injector, ViewChild, ViewEncapsulation, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AppConsts } from '@shared/AppConsts';
import { appModuleAnimation } from '@shared/animations/routerTransition';
import { AppComponentBase } from '@shared/common/app-component-base';
import { EntityDtoOfInt64, UserListDto, UserServiceProxy, CM_BRANCH_ENTITY, BranchServiceProxy, GetUsersInput, ReportInfo, AsposeServiceProxy } from '@shared/service-proxies/service-proxies';
import { FileDownloadService } from '@shared/utils/file-download.service';
import { LazyLoadEvent } from 'primeng/components/common/lazyloadevent';
import { Paginator } from 'primeng/components/paginator/paginator';
import { Table } from 'primeng/components/table/table';
import { CreateOrEditUserModalComponent } from './create-or-edit-user-modal.component';
import { EditUserPermissionsModalComponent } from './edit-user-permissions-modal.component';
import { ImpersonationService } from './impersonation.service';
import { HttpClient } from '@angular/common/http';
import { FileUpload } from 'primeng/fileupload';
import { finalize } from 'rxjs/operators';
import { LoginMethod } from '@app/ultilities/enum/login-method';
import { WebConsts } from '@app/ultilities/enum/consts';
import { RecordStatusConsts } from '@app/admin/core/ultils/consts/RecordStatusConsts';
import { AuthStatusConsts } from '@app/admin/core/ultils/consts/AuthStatusConsts';
import { ReportTypeConsts } from '@app/admin/core/ultils/consts/ReportTypeConsts';

@Component({
    templateUrl: './users.component.html',
    encapsulation: ViewEncapsulation.None,
    styleUrls: ['./users.component.less'],
    animations: [appModuleAnimation()]
})
export class UsersComponent extends AppComponentBase implements OnInit {

    @ViewChild('createOrEditUserModal') createOrEditUserModal: CreateOrEditUserModalComponent;
    @ViewChild('editUserPermissionsModal') editUserPermissionsModal: EditUserPermissionsModalComponent;
    @ViewChild('dataTable') dataTable: Table;
    @ViewChild('paginator') paginator: Paginator;
    @ViewChild('ExcelFileUpload') excelFileUpload: FileUpload;

    uploadUrl: string;

    branchs: CM_BRANCH_ENTITY[];

    filterInput: GetUsersInput = new GetUsersInput();

    //Filters
    advancedFiltersAreShown = false;


    isNormalLoginMethod: boolean;

    constructor(
        injector: Injector,
        public _impersonationService: ImpersonationService,
        private _userServiceProxy: UserServiceProxy,
        private fileDownloadService: FileDownloadService,
        private _activatedRoute: ActivatedRoute,
        private _branchService: BranchServiceProxy,
        private asposeService: AsposeServiceProxy,
        private _httpClient: HttpClient
    ) {
        super(injector);
        this.filterInput.filter = this._activatedRoute.snapshot.queryParams['filterText'] || '';
        this.filterInput.permission = '';
        this.filterInput.role = undefined;
        this.uploadUrl = AppConsts.remoteServiceBaseUrl + '/Users/ImportFromExcel';
        this.cdr = injector.get(ChangeDetectorRef);
    }

    ngOnInit(): void {
        this.isNormalLoginMethod = this.setting.get(WebConsts.LoginMethodConsts) == LoginMethod.normal;

        var filterCombobox: any = {
            maxResultCount: -1,
            recorD_STATUS: RecordStatusConsts.Active,
            autH_STATUS: AuthStatusConsts.Approve
        };

        this._branchService.cM_BRANCH_Search(filterCombobox).subscribe(response => {
            this.branchs = response.items;
        })
    }

    getUsers(event?: LazyLoadEvent) {
        if (this.primengTableHelper.shouldResetPaging(event)) {
            this.paginator.changePage(0);

            return;
        }

        abp.ui.setBusy();

        this.filterInput.skipCount = this.primengTableHelper.getSkipCount(this.paginator, event);
        this.filterInput.maxResultCount = this.primengTableHelper.getMaxResultCount(this.paginator, event);
        this.filterInput.sorting = this.primengTableHelper.getSorting(this.dataTable);

        if (!this.filterInput.permission) {
            this.filterInput.permission = undefined;
        }

        this._userServiceProxy.getUsers(
            this.filterInput
        ).pipe(finalize(() => abp.ui.clearBusy())).subscribe(result => {
            this.primengTableHelper.totalRecordsCount = result.totalCount;
            this.primengTableHelper.records = result.items;
            abp.ui.clearBusy();
            this.cdr.detectChanges();
        });
    }

    unlockUser(record): void {
        let input = new EntityDtoOfInt64();
        input.id = record.id;
        this._userServiceProxy.unlockUser(input).subscribe(() => {
            this.reloadPage();
            this.showSuccessMessage(this.l('UnlockedTheUser', record.userName));
        });
    }

    getRolesAsString(roles): string {
        let roleNames = '';

        for (let j = 0; j < roles.length; j++) {
            if (roleNames.length) {
                roleNames = roleNames + ', ';
            }
            roleNames = roleNames + roles[j].roleName;
        }

        return roleNames;
    }

    reloadPage(): void {
        this.paginator.changePage(this.paginator.getPage());
    }


    exportToExcel() {
        let reportInfo = new ReportInfo();
        reportInfo.typeExport = ReportTypeConsts.Excel;

        let reportFilter = { ...this.filterInput };

        reportFilter.maxResultCount = -1;
        reportFilter.top = 0;

        reportInfo.parameters = this.GetParamsFromFilter(reportFilter)

        reportInfo.values = this.GetParamsFromFilter({
            A1: this.l('CompanyReportHeader')
        });

        reportInfo.pathName = "/COMMON/BC_USER.xlsx";
        reportInfo.storeName = "TL_USER_Search";

        this.asposeService.getReport(reportInfo).subscribe(x => {
            this.fileDownloadService.downloadTempFile(x);
        });
    }

    // exportToExcel(): void {
    //     this._userServiceProxy.getUsersToExcel(this.filterInput)
    //         .subscribe(result => {
    //             this._fileDownloadService.downloadTempFile(result);
    //         });
    // }

    createUser(): void {
        this.createOrEditUserModal.show();
        this.cdr.detectChanges();
    }

    uploadExcel(data: { files: File }): void {
        const formData: FormData = new FormData();
        const file = data.files[0];
        formData.append('file', file, file.name);

        this._httpClient
            .post<any>(this.uploadUrl, formData)
            .pipe(finalize(() => this.excelFileUpload.clear()))
            .subscribe(response => {
                if (response.success) {
                    this.showSuccessMessage(this.l('ImportUsersProcessStart'));
                } else if (response.error != null) {
                    this.showErrorMessage(this.l('ImportUsersUploadFailed'));
                }
            });
    }

    onUploadExcelError(): void {
        this.showErrorMessage(this.l('ImportUsersUploadFailed'));
    }

    deleteUser(user: UserListDto): void {
        if (user.userName === AppConsts.userManagement.defaultAdminUserName) {
            this.message.warn(this.l('{0}UserCannotBeDeleted', AppConsts.userManagement.defaultAdminUserName));
            return;
        }

        this.message.confirm(
            this.l('UserDeleteWarningMessage', user.userName),
            this.l('AreYouSure'),
            (isConfirmed) => {
                if (isConfirmed) {
                    this._userServiceProxy.deleteUser(user.id)
                        .subscribe(() => {
                            this.reloadPage();
                            this.showSuccessMessage(this.l('SuccessfullyDeleted'));
                            //    this.filterInputSearch.totalCount = 0;
                        });
                }
            }
        );
    }

    approveUser(user: UserListDto): void {
        if (this.appSession.user.userName == user.markerId) {
            this.showErrorMessage(this.l('ApproveFailed'));
            return;
        }
        this.message.confirm(
            this.l('ApproveWarningMessage', user.userName),
            this.l('AreYouSure'),
            (isConfirmed) => {
                if (isConfirmed) {
                    this._userServiceProxy.approveUser(user.id)
                        .subscribe(() => {
                            this.reloadPage();
                            this.showSuccessMessage(this.l('SuccessfullyApprove'));
                        });
                }
            }
        );
    }
}
