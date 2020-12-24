import { Injector } from '@angular/core';
import { AppConsts } from '@shared/AppConsts';
import { AppComponentBase } from '@shared/common/app-component-base';
import { TenantLoginInfoDto, EditionPaymentType, SubscriptionStartType } from '@shared/service-proxies/service-proxies';
import * as moment from 'moment';

export class ThemesLayoutBaseComponent extends AppComponentBase {

    tenant: TenantLoginInfoDto = new TenantLoginInfoDto();
    subscriptionStartType = SubscriptionStartType;
    editionPaymentType: typeof EditionPaymentType = EditionPaymentType;
    installationMode = true;

    constructor(
        injector: Injector
    ) {
        super(injector);
    }

    subscriptionStatusBarVisible(): boolean {
        return this.appSession.tenantId > 0 && (this.appSession.tenant.isInTrialPeriod || this.subscriptionIsExpiringSoon());
    }

    subscriptionIsExpiringSoon(): boolean {
        if (this.appSession.tenant.subscriptionEndDateUtc) {
            return moment().utc().add(AppConsts.subscriptionExpireNootifyDayCount, 'days') >= moment(this.appSession.tenant.subscriptionEndDateUtc);
        }

        return false;
    }

    getSubscriptionExpiringDayCount(): number {
        if (!this.appSession.tenant.subscriptionEndDateUtc) {
            return 0;
        }

        return Math.round(moment.utc(this.appSession.tenant.subscriptionEndDateUtc).diff(moment().utc(), 'days', true));
    }

    getTrialSubscriptionNotification(): string {
        return this.l(
            'TrialSubscriptionNotification',
            `<strong>${this.appSession.tenant.edition.displayName}</strong>`,
            `<a href="/account/buy?editionPaymentType=${this.editionPaymentType.BuyNow}&editionId=${this.appSession.tenant.edition.id}&tenantId=${this.appSession.tenant.id}">${this.l('ClickHere')}</a>`
        );
    }

    getExpireNotification(localizationKey: string): string {
        return this.l(localizationKey, this.getSubscriptionExpiringDayCount());
    }
}
