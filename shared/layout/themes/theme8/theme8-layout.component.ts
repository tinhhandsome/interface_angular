import { Injector, ElementRef, Component, ViewChild, OnInit, AfterViewInit } from '@angular/core';
import { appModuleAnimation } from '@shared/animations/routerTransition';
import { LayoutRefService } from '@metronic/app/core/services/layout/layout-ref.service';
import { UrlHelper } from '@shared/helpers/UrlHelper';
import { ThemesLayoutBaseComponent } from '@app/shared/layout/themes/themes-layout-base.component';

@Component({
    templateUrl: './theme8-layout.component.html',
    selector: 'theme8-layout',
    animations: [appModuleAnimation()]
})
export class Theme8LayoutComponent extends ThemesLayoutBaseComponent implements OnInit, AfterViewInit {

    @ViewChild('mHeader') mHeader: ElementRef;

    constructor(
        injector: Injector,
        private layoutRefService: LayoutRefService
    ) {
        super(injector);
    }

    ngOnInit() {
        this.installationMode = UrlHelper.isInstallUrl(location.href);
    }

    ngAfterViewInit(): void {
        this.layoutRefService.addElement('header', this.mHeader.nativeElement);
        this.initStickyHeader();
    }

    initStickyHeader(): any {
        let headerEl = mUtil.get('m_header');
        let options = {
            offset: {
                desktop: null,
                mobile: null
            },
            minimize: {
                mobile: null,
                desktop: null
            },
            classic: {
                mobile: true,
                desktop: true
            }
        };

        if (mUtil.attr(headerEl, 'm-minimize-mobile') === 'minimize') {
            options.minimize.mobile = {};
            options.minimize.mobile.on = 'm-header--minimize-on';
            options.minimize.mobile.off = 'm-header--minimize-off';
        } else {
            options.minimize.mobile = false;
        }

        if (mUtil.attr(headerEl, 'm-minimize') === 'minimize') {
            options.minimize.desktop = {};
            options.minimize.desktop.on = 'm-header--minimize-on';
            options.minimize.desktop.off = 'm-header--minimize-off';
        } else {
            options.minimize.desktop = false;
        }

        if (mUtil.attr(headerEl, 'm-minimize-offset')) {
            options.offset.desktop = mUtil.attr(headerEl, 'm-minimize-offset');
        }

        if (mUtil.attr(headerEl, 'm-minimize-mobile-offset')) {
            options.offset.mobile = mUtil.attr(headerEl, 'm-minimize-mobile-offset');
        }

        return new mHeader('m_header', options);
    }
}
