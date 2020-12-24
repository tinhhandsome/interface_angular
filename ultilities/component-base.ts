import { PermissionCheckerService } from '@abp/auth/permission-checker.service';
import { FeatureCheckerService } from '@abp/features/feature-checker.service';
import { LocalizationService } from '@abp/localization/localization.service';
import { MessageService } from '@abp/message/message.service';
import { NotifyService } from '@abp/notify/notify.service';
import { SettingService } from '@abp/settings/setting.service';
import { Injector, ChangeDetectorRef } from '@angular/core';
import { AppConsts } from '@shared/AppConsts';
import { AppUrlService } from '@shared/common/nav/app-url.service';
import { AppSessionService } from '@shared/common/session/app-session.service';
import { AppUiCustomizationService } from '@shared/common/ui/app-ui-customization.service';
import { UiCustomizationSettingsDto, HostSettingsServiceProxy, ReportParameter } from '@shared/service-proxies/service-proxies';
import { Router, ActivatedRoute } from '@angular/router';
import { RecordStatusConsts } from '@app/admin/core/ultils/consts/RecordStatusConsts';
import { AuthStatusConsts } from '@app/admin/core/ultils/consts/AuthStatusConsts';
import * as moment from 'moment';
import { EditPageState } from './enum/edit-page-state';
import * as _ from 'lodash';


export abstract class ComponentBase {

    localizationSourceName = AppConsts.localization.defaultLocalizationSourceName;

    localization: LocalizationService;
    permission: PermissionCheckerService;
    feature: FeatureCheckerService;
    notify: NotifyService;
    setting: SettingService;
    message: MessageService;
    appSession: AppSessionService;
    ui: AppUiCustomizationService;
    appUrlService: AppUrlService;
    hostSettingService: HostSettingsServiceProxy;
    router: Router;
    activeRoute: ActivatedRoute;

    phoneRex: RegExp;

    timeShowSuccessMessage: number;
    timeShowWarningMessage: number;
    timeShowErrorMessage: number;

    cdr: ChangeDetectorRef;

    tojsonf : any;


    constructor(injector: Injector) {
        this.localization = injector.get(LocalizationService);
        this.permission = injector.get(PermissionCheckerService);
        this.feature = injector.get(FeatureCheckerService);
        this.notify = injector.get(NotifyService);
        this.setting = injector.get(SettingService);
        this.message = injector.get(MessageService);
        this.appSession = injector.get(AppSessionService);
        this.ui = injector.get(AppUiCustomizationService);
        this.appUrlService = injector.get(AppUrlService);
        this.hostSettingService = injector.get(HostSettingsServiceProxy);
        this.router = injector.get(Router);
        this.activeRoute = injector.get(ActivatedRoute);

        this.phoneRex = new RegExp(this.s('gAMSProCore.PhoneNumberRegexValidation'));

        this.timeShowSuccessMessage = parseInt(this.s('gAMSProCore.TimeShowSuccessMessage'));
        this.timeShowWarningMessage = parseInt(this.s('gAMSProCore.TimeShowWarningMessage'));
        this.timeShowErrorMessage = parseInt(this.s('gAMSProCore.TimeShowErrorMessage'));

        let scope = this;
        this.message.error = function (message, title, isHtml) {
            scope.showErrorMessage(message);
        }


        this.tojsonf = function () {
            let data = {};
            let scope = this;
            Object.keys(this).filter(x => x != "toJSON").forEach(function (k) {
                if (k) {
                    data[k] = scope[k];
                }
            })
            return data;
        }

    }

    loadHostSettings(): void {
        const self = this;
    }

    l(key: string, ...args: any[]): string {
        args.unshift(key);
        args.unshift(this.localizationSourceName);
        return this.ls.apply(this, args);
    }

    ls(sourcename: string, key: string, ...args: any[]): string {
        let localizedText = this.localization.localize(key, sourcename);

        if (!localizedText) {
            localizedText = key;
        }

        if (!args || !args.length) {
            return localizedText;
        }

        args.unshift(localizedText);
        return abp.utils.formatString.apply(this, args);
    }

    isGranted(permissionName: string): boolean {
        return this.permission.isGranted(permissionName);
    }

    getLevelsCombobox() {
        return [
            {
                value: 'UNIT',
                display: this.l('LevelUnit')
            },
            {
                value: 'ALL',
                display: this.l('LevelAll')
            },
        ]
    }

    decodedHtml(html) {
        var txt = document.createElement('textarea');
        txt.innerHTML = html;
        return txt.value;
    };

    isGrantedAny(...permissions: string[]): boolean {
        if (!permissions) {
            return false;
        }

        for (const permission of permissions) {
            if (this.isGranted(permission)) {
                return true;
            }
        }
        return false;
    }

    getRouteData(key: string): any {
        return (this.activeRoute.data as any).value[key];
    }

    getRouteParam(key: string): any {
        return (this.activeRoute.params as any).value[key];
    }

    navigate(obj) {
        this.router.navigate(obj);
    }

    scrollTop() {
        document.body.scrollTop = document.documentElement.scrollTop = 0;
    }

    navigatePassParam(url: string, params: any, deepParams: any, skipLocationChange: boolean = true) {
        var array = [url];
        if (params) {
            array.push(params);
        }
        this.router.navigate(array, { queryParams: deepParams, skipLocationChange: skipLocationChange });
        if (params) {
            url = url + ';' + $.map(params, (v, k) => { return k.toString() + '=' + (v || '').toString(); }).join(';')
        }
        window.history.pushState('', '', url);
    }

    s(key: string): string {
        return abp.setting.get(key);
    }

    appRootUrl(): string {
        return this.appUrlService.appRootUrl;
    }

    get currentTheme(): UiCustomizationSettingsDto {
        return this.appSession.theme;
    }

    formatMoney(num) {
        if (num == 0) {
            return "0";
        }
        if (!num) {
            return '';
        }
        return num.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')
    }

    round(num: number) {
        if (!num) {
            return undefined;
        }
        return Math.round(num * 100) / 100;
    }

    moneyTextToNumber(moneyText) {
        if (moneyText == '' || moneyText == null || moneyText === undefined) {
            return undefined;
        }

        return parseInt(moneyText.replace(/,/g, ''));
    }

    moneyTextToNumberF(moneyText) {
        if (moneyText == '' || moneyText == null || moneyText === undefined) {
            return undefined;
        }

        return parseFloat(moneyText.replace(/,/g, ''));
    }

    toNumber(text) {
        return parseInt(text);
    }

    getFillterForCombobox(): any {
        return {
            maxResultCount: -1,
            recorD_STATUS: RecordStatusConsts.Active,
            autH_STATUS: AuthStatusConsts.Approve
        };
    }

    valueInRange(item: any, propName: string, maxValue: number, minValue: number = 0) {
        if (!item || item && !item[propName])
            item[propName] = minValue

        if (item[propName] > maxValue) {
            item[propName] = maxValue;
        } else if (item[propName] < minValue) {
            item[propName] = minValue;
        }
    }

    valueInRange2(item: any, propName: string, target) {
        let minValue = parseInt(target.min);
        let maxValue = parseInt(target.max);
        this.valueInRange(item, propName, maxValue, minValue);
    }

    onChangeValueGreaterThan(item, propName, valueGreater, $event) {
        item[propName] = (!$event.target.value || parseInt($event.target.value) < valueGreater) ? valueGreater : $event.target.value;
        $event.target.value = item[propName];
    }

    onChangeMoney(item, propName, $event) {
        var moneyValue = this.moneyTextToNumber($event.target.value);
        item[propName] = (!$event.target.value || moneyValue < 0) ? 0 : moneyValue;
        $event.target.value = this.formatMoney(item[propName]);
    }

    isNull(value) {
        if (value === 0 || value === '0') {
            return false;
        }
        return !value;
    }

    removeMessage() {
        $('#alert-message').remove();
    }

    showMessage(alertClass: string, message: string) {
        this.removeMessage();
        if ($('#content-priority').length && $('#content-priority').height() > 0) {
            $('#content-priority').prepend('<div id="alert-message" class="alert ' + alertClass + '" role="alert"><div class="alert-text">' + message + '.</div></div>')
        }
        else {
            $('#content').prepend('<div id="alert-message" class="alert ' + alertClass + '" role="alert"><div class="alert-text">' + message + '.</div></div>')
        }
    }

    showErrorMessage(message: string) {
        this.scrollTop();
        if (!$('#content').length) {
            this.notify.error(message + '.');
        }
        this.showMessage('alert-danger', message);
        if (this.timeShowErrorMessage > 0) {
            setTimeout(() => {
                this.removeMessage();
            }, this.timeShowErrorMessage);
        }
    }

    showWarningMessage(message: string) {
        if (!$('#content').length) {
            this.notify.warn(message + '.');
        }
        this.showMessage('alert-warning', message);
        if (this.timeShowWarningMessage > 0) {
            setTimeout(() => {
                this.removeMessage();
            }, this.timeShowWarningMessage);
        }
    }

    showSuccessMessage(message: string) {
        this.scrollTop();
        if (!$('#content').length) {
            this.notify.success(message + '.');
        }
        this.showMessage('alert-success', message);
        if (this.timeShowSuccessMessage > 0) {
            setTimeout(() => {
                this.removeMessage();
            }, this.timeShowSuccessMessage);
        }
    }

    sumFunct(a, b) {
        return a + b;
    }


    GetParamNameAndValue(name: string, value: any): ReportParameter {
        var param = new ReportParameter();
        param.name = name;
        param.value = value;
        return param;
    }

    /** Tạo random id */
    generateUUID() { // Public Domain/MIT
        var d = new Date().getTime();
        if (typeof performance !== 'undefined' && typeof performance.now === 'function') {
            d += performance.now(); //use high-precision timer if available
        }
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = (d + Math.random() * 16) % 16 | 0;
            d = Math.floor(d / 16);
            return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
        });
    }

    GetParamsFromFilter(filterInput: any) {

        let parameters = Object.keys(filterInput).map((key, index) => {
            return this.GetParamNameAndValue(key, filterInput[key])
        });

        return parameters
    }

    /** So sánh ngày */
    compareDate(less: moment.Moment, greater: moment.Moment, equals = false) {
        if (!less || !greater) {
            return true;
        }
        if (equals) {
            return less.diff(greater) <= 0
        }
        return less.diff(greater) < 0
    }

    clearFilter() {
        var filterInput = this['filterInput'];
        if (filterInput) {
            for (var k in filterInput) {
                if (k == 'init' || k == 'toJSON') {
                    continue;
                }
                filterInput[k] = undefined;

                // $(`*[name=${k}]`).val('');
            }
        }
    }

    setPageStateToApprove() {
        this['editPageState'] = EditPageState.viewDetail;
        this['appToolbar'].setButtonApproveEnable(false);
        this['appToolbar'].setButtonSaveEnable(false);
    }

    convertImportExcelRowsToObjArr(rows: any, excelRowProperties: Object, limitIndex: number, getObject = function (obj) { return obj; }) {
        let arr: any = []
        if (rows) {
            for (let i = 0; i < rows.length - limitIndex; i++) {
                let row = rows[i];
                if (row && row != []) {
                    let tmpRowObj = {};
                    tmpRowObj['toJSON'] = function () {
                        let data = {};
                        let scope = this;
                        Object.keys(this).filter(x => x != "toJSON").forEach(function (k) {
                            if (k) {
                                data[k] = scope[k];
                            }
                        })
                        return data;
                    }

                    Object.keys(excelRowProperties).forEach(k => {
                        if (row[k]) {
                            let value: any = Object.values(row[k]);
                            if (value.length > 0) {
                                value = value[0];
                            }
                            else {
                                value = undefined;
                            }
                            var key = excelRowProperties[k];
                            tmpRowObj[key] = value;
                        }
                    })
                    tmpRowObj = getObject(tmpRowObj);
                    if (tmpRowObj) {
                        arr.push(tmpRowObj)
                    }
                }
            }
            return arr
        }
    }
    getCurrentRoles(){
        return ['DVCM']
    }
    getMonthsCombobox() {
        var result = [];
        for (var i = 1; i <= 12; i++) {
            result.push({
                value: i,
                display: this.l("Month") + " " + i
            })
        }
        return result;
    }

    getYearsCombobox() {
        var result = [];
        for (var i = 1950; i <= 2067; i++) {
            result.push({
                value: i,
                display: this.l("Year") + " " + i
            })
        }
        return result;
    }

    xlsRowsToArr(rows: IterableIterator<Array<Object>>, xlsStructure: Array<string>, getObject = function (obj) { return obj; }, sliceNum: number = 0) {
        let arr: any = []
        let curRow = rows.next()
        let i = 0
        if (!curRow.value || xlsStructure.length != curRow.value.length) { // cau truc file import khong dung voi xlsStructure
            console.log('xlsStructure length: ' + xlsStructure.length);
            console.log('curRow.value length: ' + curRow.value.length);
            this.showErrorMessage(this.l('ExcelColNotMatchStructure'));
            return [];
        }

        while (!curRow.done) {
            // if(i< rows.size() - limitIndex){}
            let row = curRow.value
            if (row && row != []) {
                let tmpRowObj = {};
                tmpRowObj['toJSON'] = function () {
                    let data = {};
                    let scope = this;
                    Object.keys(this).filter(x => x != "toJSON").forEach(function (k) {
                        if (k) {
                            data[k] = scope[k];
                        }
                    })
                    return data;
                }

                _.each(xlsStructure, (colName, index) => {
                    let value: any = Object.values(row[index]);
                    if (value.length > 0) {
                        value = value[0];
                    }
                    else {
                        value = undefined;
                    }
                    tmpRowObj[colName] = value;
                })
                tmpRowObj = getObject(tmpRowObj);
                if (tmpRowObj) {
                    arr.push(tmpRowObj)
                }
            }
            curRow = rows.next()
        }
        return arr.length > 0 && sliceNum > 0 ? arr.slice(0, arr.length - sliceNum) : arr
    }

    getMonthAndYearCombobox() {
        var result = [];
        var numYear = 1990;
        while (numYear <= 2100) {
            for (var i = 1; i <= 12; i++) {
                result.push({
                    value: i + '/' + numYear,
                    display: i + '/' + numYear
                })
                // var object = {};
                // object['date'] = i + '/' + numYear;
            }

            numYear += 1;
        }
        return result;
    }

    toJSON: any = function () {
        let data = {};
        let scope = this;
        Object.keys(this).filter(x => x != "toJSON").forEach(function (k) {
            if (k) {
                data[k] = scope[k];
            }
        })
        return data;
    }
}
