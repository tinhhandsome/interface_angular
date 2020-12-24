import { Component, ElementRef, Injector, ViewChild, ViewEncapsulation, inject, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { appModuleAnimation } from '@shared/animations/routerTransition';
import { AppComponentBase } from '@shared/common/app-component-base';
import { ApplicationLanguageListDto, LanguageServiceProxy, SetDefaultLanguageInput } from '@shared/service-proxies/service-proxies';
import { Paginator } from 'primeng/components/paginator/paginator';
import { Table } from 'primeng/components/table/table';
import { CreateOrEditLanguageModalComponent } from './create-or-edit-language-modal.component';
import { AbpSessionService } from '@abp/session/abp-session.service';
import { finalize } from 'rxjs/operators';

@Component({
    templateUrl: './languages.component.html',
    encapsulation: ViewEncapsulation.None,
    animations: [appModuleAnimation()]
})
export class LanguagesComponent extends AppComponentBase {
    

    @ViewChild('languagesTable') languagesTable: ElementRef;
    @ViewChild('createOrEditLanguageModal') createOrEditLanguageModal: CreateOrEditLanguageModalComponent;
    @ViewChild('dataTable') dataTable: Table;
    @ViewChild('paginator') paginator: Paginator;

    defaultLanguageName: string;

    constructor(
        injector: Injector,
        private _languageService: LanguageServiceProxy,
        private _sessionService: AbpSessionService,
        private _router: Router
    ) {
        super(injector);
        this.cdr = injector.get(ChangeDetectorRef);
    }

    getLanguages(): void {
        this.primengTableHelper.showLoadingIndicator();

        this._languageService.getLanguages()
            .pipe(finalize(() => this.primengTableHelper.hideLoadingIndicator()))
            .subscribe(result => {
            this.defaultLanguageName = result.defaultLanguageName;
            this.primengTableHelper.records = result.items;
            this.primengTableHelper.totalRecordsCount = result.items.length;
            this.primengTableHelper.isLoading = false;
            this.cdr.detectChanges();
        });
    }

    changeTexts(language: ApplicationLanguageListDto): void {
        this._router.navigate(['app/admin/languages', language.name, 'texts']);
    }

    setAsDefaultLanguage(language: ApplicationLanguageListDto): void {
        const input = new SetDefaultLanguageInput();
        input.name = language.name;
        this._languageService.setDefaultLanguage(input).subscribe(() => {
            this.getLanguages();
            this.showSuccessMessage(this.l('SuccessfullySaved'));
        });
    }

    deleteLanguage(language: ApplicationLanguageListDto): void {
        this.message.confirm(
            this.l('LanguageDeleteWarningMessage', language.displayName),
            this.l('AreYouSure'),
            isConfirmed => {
                if (isConfirmed) {
                    this._languageService.deleteLanguage(language.id).subscribe(() => {
                        this.getLanguages();
                        this.showSuccessMessage(this.l('SuccessfullyDeleted'));
                        //        this.filterInputSearch.totalCount = 0;
                    });
                }
            }
        );
    }

    get multiTenancySideIsHost(): boolean {
        return !this._sessionService.tenantId;
    }
}
