import { Component, ElementRef, EventEmitter, Injector, Output, ViewChild, ChangeDetectorRef } from '@angular/core';
import { AppComponentBase } from '@shared/common/app-component-base';
import { ApplicationLanguageEditDto, ComboboxItemDto, CreateOrUpdateLanguageInput, LanguageServiceProxy } from '@shared/service-proxies/service-proxies';
import { ModalDirective } from 'ngx-bootstrap';
import { finalize } from 'rxjs/operators';

@Component({
    selector: 'createOrEditLanguageModal',
    templateUrl: './create-or-edit-language-modal.component.html'
})
export class CreateOrEditLanguageModalComponent extends AppComponentBase {

    @ViewChild('createOrEditModal') modal: ModalDirective;
    @ViewChild('languageCombobox') languageCombobox: ElementRef;
    @ViewChild('iconCombobox') iconCombobox: ElementRef;

    @Output() modalSave: EventEmitter<any> = new EventEmitter<any>();

    active = false;
    saving = false;
    emptyText: string = "";

    language: ApplicationLanguageEditDto = new ApplicationLanguageEditDto();

    languageNames: ComboboxItemDto[] = [];
    flags: ComboboxItemDto[] = [];

    constructor(
        injector: Injector,
        private _languageService: LanguageServiceProxy
    ) {
        super(injector);
        this.cdr = injector.get(ChangeDetectorRef);
    }

    show(languageId?: number): void {
        this.active = true;

        this._languageService.getLanguageForEdit(languageId).subscribe(result => {
            this.language = result.language;
            this.languageNames = result.languageNames;
            this.flags = result.flags;

            if (!languageId) {
                this.language.isEnabled = true;
            }

            this.modal.show();
            this.cdr.detectChanges();
        });
    }

    save(): void {
        let input = new CreateOrUpdateLanguageInput();
        input.language = this.language;

        this.saving = true;
        this._languageService.createOrUpdateLanguage(input)
            .pipe(finalize(() => this.saving = false))
            .subscribe(() => {
                this.showSuccessMessage(this.l('SavedSuccessfully'));
                this.close();
                this.modalSave.emit(null);
            });
    }

    close(): void {
        this.active = false;
        this.modal.hide();
    }
}
