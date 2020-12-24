import { AfterViewInit, Component, Injector, ViewEncapsulation, NgZone, ElementRef, HostBinding, OnInit, ViewChild } from '@angular/core';
import { AppComponentBase } from '@shared/common/app-component-base';
import { UiCustomizationSettingsServiceProxy } from '@shared/service-proxies/service-proxies';

@Component({
    templateUrl: './theme-selection-panel.component.html',
    selector: 'theme-selection-panel',
    styleUrls: ['./theme-selection-panel.less'],
    encapsulation: ViewEncapsulation.None
})
export class ThemeSelectionPanelComponent extends AppComponentBase implements AfterViewInit, OnInit {

    @ViewChild('themeSelectionPanelScrollBar') themeSelectionPanelScrollBar;

    @HostBinding('id') id = 'm_theme_selection_panel';
    @HostBinding('class')
    classes = 'm-quick-sidebar m-quick-sidebar--skin-light';
    @HostBinding('attr.mThemeSelectionPanelOffCanvas')
    @HostBinding('style.overflow') styleOverflow: any = 'hidden';

    mThemeSelectionPanelOffCanvas: any;
    currentThemeName = '';

    constructor(
        private el: ElementRef,
        injector: Injector,
        private _uiCustomizationService: UiCustomizationSettingsServiceProxy) {
        super(injector);
    }

    ngOnInit() {
        this.currentThemeName = this.currentTheme.baseSettings.theme;
    }

    ngAfterViewInit(): void {
        this.mThemeSelectionPanelOffCanvas = new mOffcanvas(this.el.nativeElement, {
            overlay: true,
            baseClass: 'm-quick-sidebar',
            closeBy: 'm_theme_selection_panel_close',
            toggleBy: 'm_theme_selection_panel_toggle'
        });
        this.adjustThemeSelectionPanelScrollbarHeight();
    }

    getLocalizedThemeName(str: string): string {
        return this.l('Theme_' + abp.utils.toPascalCase(str));
    }

    adjustThemeSelectionPanelScrollbarHeight(): void {
        let height = mUtil.getViewPort().height - 20;
        this.themeSelectionPanelScrollBar.directiveRef.elementRef.nativeElement.parentElement.style.height = height + 'px';
    }

    onWindowResize(event): void {
        this.adjustThemeSelectionPanelScrollbarHeight();
    }

    changeTheme(themeName: string) {
        this._uiCustomizationService.changeThemeWithDefaultValues(themeName).subscribe(() => {
            window.location.reload();
        });
    }
}
