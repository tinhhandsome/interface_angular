import { Component, Injector, Input } from '@angular/core';
import { appModuleAnimation } from '@shared/animations/routerTransition';
import { AppComponentBase } from '@shared/common/app-component-base';
import { ThemeSettingsDto, UiCustomizationSettingsServiceProxy } from '@shared/service-proxies/service-proxies';

@Component({
    templateUrl: './theme12-theme-ui-settings.component.html',
    animations: [appModuleAnimation()],
    selector: 'theme12-theme-ui-settings'
})
export class Theme12ThemeUiSettingsComponent extends AppComponentBase {
    @Input() settings: ThemeSettingsDto;

    constructor(
        injector: Injector,
        private _uiCustomizationService: UiCustomizationSettingsServiceProxy
    ) {
        super(injector);
    }

    getCustomizedSetting(settings: ThemeSettingsDto) {
        settings.theme = 'theme12';

        return settings;
    }

    updateDefaultUiManagementSettings(): void {
        this._uiCustomizationService.updateDefaultUiManagementSettings(this.getCustomizedSetting(this.settings)).subscribe(() => {
            window.location.reload();
        });
    }

    updateUiManagementSettings(): void {
        this._uiCustomizationService.updateUiManagementSettings(this.getCustomizedSetting(this.settings)).subscribe(() => {
            window.location.reload();
        });
    }

    useSystemDefaultSettings(): void {
        this._uiCustomizationService.useSystemDefaultSettings().subscribe(() => {
            window.location.reload();
        });
    }

    allowAsideMinimizingChange(val): void {
        if (val) {
            this.settings.menu.allowAsideHiding = false;
            this.settings.menu.defaultHiddenAside = false;
        } else {
            this.settings.menu.defaultMinimizedAside = false;
        }
    }

    allowAsideHidingChange(val): void {
        if (!val) {
            this.settings.menu.defaultHiddenAside = false;
        }
    }
}
