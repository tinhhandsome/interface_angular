import { PermissionCheckerService } from '@abp/auth/permission-checker.service';
import { AppSessionService } from '@shared/common/session/app-session.service';

import { ReflectiveInjector, Inject, Injectable, Optional, Injector } from '@angular/core';

import { ReportTable, AppMenuServiceProxy, AppMenuDto, API_BASE_URL, GetRoleForEditOutput, FlatPermissionDto, AsposeServiceProxy as ReportServiceProxy, ReportParameter, ReportTemplateServiceProxy, CM_REPORT_TEMPLATE_ENTITY, ReportInfo } from '@shared/service-proxies/service-proxies';
import { Observable, Subject, BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';
declare var $: JQueryStatic;
import { HttpClient } from '@angular/common/http';
import { AppMenu } from '@app/shared/layout/nav/app-menu';
import { AppMenuItem } from '@app/shared/layout/nav/app-menu-item';
import { DOCUMENT } from '@angular/common';
import { ReportTemplate } from '../report-template/report-template';
import { reduceTicks } from '@swimlane/ngx-charts';
import { ReportKeyConsts } from './ReportKeyConsts';
import { TemplateParseResult } from '@angular/compiler';
import * as moment from 'moment';
import { EvalFunctionComponent } from './eval-function';
import printPagecss from '../../../../assets/common/styles/print-page.css'
import { Encoder, QRByte, QRKanji, ErrorCorrectionLevel } from '@nuintun/qrcode';
import { LocalizationService } from 'abp-ng2-module/dist/src/localization/localization.service';
import { AppConsts } from '@shared/AppConsts';


@Injectable()
export class PreviewTemplateService extends EvalFunctionComponent {

    _permissionCheckerService: PermissionCheckerService;
    baseUrl: string;
    _appSessionService: AppSessionService;
    _http;

    localizationSourceName = AppConsts.localization.defaultLocalizationSourceName;

    localization: LocalizationService;


    constructor(
        injector: Injector,
        private _reportService: ReportServiceProxy,
        private _reportTemplateService: ReportTemplateServiceProxy,
        permissionCheckerService: PermissionCheckerService,
        @Inject(HttpClient) http: HttpClient,
        @Optional() @Inject(API_BASE_URL) baseUrl: string,
        appSessionService: AppSessionService,
        @Inject(DOCUMENT) private document: Document
    ) {
        super(injector);
        this._permissionCheckerService = permissionCheckerService;
        this.baseUrl = baseUrl;
        this._appSessionService = appSessionService;
        this._http = http;
        ;

        this.localization = injector.get(LocalizationService);
    }

    private ProcessGroupByTable(reportTable: ReportTable, groupProperty: string, table: string, groupStartWithTag: string, groupEndWithTag: string, level: string = undefined): string {
        var tableGroupBy = this.GroupbyTableProperty(reportTable, groupProperty);

        var result = "";


        for (var item of tableGroupBy) {


            var groupResult = this.AddDataToTableTemplate(item, table, level);
            result += groupResult;
            result = result.replace(groupStartWithTag, "");
            result = result.replace(groupEndWithTag, "");
            if (!level) {
                result = this.EvalStringTemplate(result, [item], ReportKeyConsts.KeyEvalFirst);
            }


        }
        return result;
    }
    private ProcessGroupByMultiLevelRow(reportTable: ReportTable, groupProperty: string[], table: string, level: number = 0, tableStart: string, tableEnd: string, result: string = ''): string {
        table = this.escapeHtml(table);
        if (level >= groupProperty.length) {
            return table;
        }
        // var result = "";
        var jquery = $('<div></div>');
        jquery.html(table);
        tableStart = ReportKeyConsts.KeyOpen + reportTable.tableName + '.' + level + '.' + ReportKeyConsts.KeyStartTable + ReportKeyConsts.KeyClose;
        tableEnd = ReportKeyConsts.KeyOpen + reportTable.tableName + '.' + level + '.' + ReportKeyConsts.KeyEndTable + ReportKeyConsts.KeyClose;
        var group1Start = this.escapeHtml($('td:contains(' + tableStart + ')', jquery).parent()[0].outerHTML);
        var group1End = this.escapeHtml($('td:contains(' + tableEnd + ')', jquery).parent()[0].outerHTML);
        var templateTable = table.substring(
            table.indexOf(group1Start),
            table.indexOf(group1End) + group1End.length
        );
        var tableGroupBy = this.GroupbyTableProperty(reportTable, groupProperty[level]);

        // VIET BEGIN

        for (var item of tableGroupBy) {
            var addDataToTemplate = this.ProcessGroupByTable(item, groupProperty[level], templateTable, tableStart, tableEnd, level.toString());

            addDataToTemplate = addDataToTemplate.split(tableStart).join('');
            addDataToTemplate = addDataToTemplate.split(tableEnd).join('');

            jquery.html(addDataToTemplate);
            var evalForStartGroup = this.EvalStringTemplate(this.escapeHtml($('tr:first', jquery).html()), [item], ReportKeyConsts.KeyEvalFirst);
            var evalForEndGroup = this.EvalStringTemplate(this.escapeHtml($('tr:last', jquery).html()), [item], ReportKeyConsts.KeyEvalFirst);


            addDataToTemplate = addDataToTemplate.split(this.escapeHtml($('tr:first', jquery).html())).join(evalForStartGroup);
            addDataToTemplate = addDataToTemplate.split(this.escapeHtml($('tr:last', jquery).html())).join(evalForEndGroup);

            result += this.ProcessGroupByMultiLevelRow(item, groupProperty, addDataToTemplate, level + 1, tableStart, tableEnd);


        }

        return table.split(templateTable).join(result);

    }
    private ProcessGroupByRow(reportTable: ReportTable, groupProperty: string, table: string, groupStartWithTag: string, groupEndWithTag: string): string {
        var tableGroupBy = this.GroupbyTableProperty(reportTable, groupProperty);

        var result = "";
        var tableGroupByRow;
        if (tableGroupBy.length > 0) {
            tableGroupByRow = tableGroupBy[0];
        }
        if (tableGroupBy.length > 1) {
            for (var i = 1; i < tableGroupBy.length; i++) {
                for (var row of tableGroupBy[i].rows) {
                    tableGroupByRow.rows.push(row);
                }
            }
        }
        var groupResult = this.AddDataToTableTemplate(tableGroupByRow, table);
        // result = groupResult;
        groupResult = groupResult.replace(groupStartWithTag, "");
        groupResult = groupResult.replace(groupEndWithTag, "");
        groupResult = this.EvalStringTemplate(groupResult, [tableGroupByRow], ReportKeyConsts.KeyEvalFirst);
        return groupResult;
    }


    async ReloadDataFromStoreToPreview(reportContent: string, storeData: ReportTable[]) {
        // var subject = new Subject<string>();

        if (reportContent && storeData) {
            reportContent = this.escapeHtml(reportContent);
            //Thêm data vào các dữ liệu cứng
            for (var c = 0; c < storeData[0].columns.length; c++) {
                var find = storeData[0].columns[c].keyName;
                var regex = new RegExp(find, 'g');

                reportContent = reportContent.replace(regex, storeData[0].rows.length ? storeData[0].rows[0].cells[c] || '' : '');
            }

            if (storeData.length > 1) {
                reportContent = reportContent.replace(/\s\s+/g, ' ').trim();
                for (var i = 1; i < storeData.length; i++) {
                    //Đổ dữ liệu theo TableStart TableEnd
                    var tableStart = ReportKeyConsts.KeyOpen + storeData[i].tableName + '.' + ReportKeyConsts.KeyStartTable + ReportKeyConsts.KeyClose;
                    var tableEnd = ReportKeyConsts.KeyOpen + storeData[i].tableName + '.' + ReportKeyConsts.KeyEndTable + ReportKeyConsts.KeyClose;

                    var regexTableGroup = new RegExp(ReportKeyConsts.KeyOpen + storeData[i].tableName + '.' + ReportKeyConsts.KeyStartTable + '.GroupByTable\\[(.*?)\\]' + ReportKeyConsts.KeyClose, 'g');
                    var regexRowGroup = new RegExp(ReportKeyConsts.KeyOpen + storeData[i].tableName + '.' + ReportKeyConsts.KeyStartTable + '.GroupByRow\\[(.*?)\\]' + ReportKeyConsts.KeyClose, 'g');

                    //Đổ dữ liệu theo group by table
                    if (reportContent.match(regexTableGroup) && reportContent.search(tableEnd) > -1) {
                        while (reportContent.match(regexTableGroup) && reportContent.search(tableEnd) > -1) {

                            var groupStart = reportContent.match(regexTableGroup)[0];


                            var lstReportContent = reportContent.split(/\s*(<[^>]*>)/g);

                            var groupStartIndex = lstReportContent.findIndex(
                                function (s) { return s.indexOf(groupStart) !== -1; }
                            );
                            var groupEndIndex = lstReportContent.findIndex(function (name) {
                                return name.search(tableEnd) > -1;
                            });


                            var groupStartWithTag = lstReportContent[groupStartIndex - 1] + lstReportContent[groupStartIndex] + lstReportContent[groupStartIndex + 1];
                            var groupEndWithTag = lstReportContent[groupEndIndex - 1] + lstReportContent[groupEndIndex] + lstReportContent[groupEndIndex + 1];

                            var table = reportContent.substring(
                                reportContent.indexOf(groupStartWithTag),
                                reportContent.indexOf(groupEndWithTag) + groupEndWithTag.length
                            );


                            var groupProperty = groupStart.match(new RegExp('(?<=\\[).+?(?=\\])', 'g'))[0];

                            // reportContent = reportContent.replace(table, this.ProcessGroupByTable(storeData[i], groupProperty, table, groupStartWithTag, groupEndWithTag));
                            reportContent = reportContent.split(table).join(this.ProcessGroupByTable(storeData[i], groupProperty, table, groupStartWithTag, groupEndWithTag));

                        }

                    }
                    //Đổ dữ liệu theo group by row
                    else if (reportContent.match(regexRowGroup) && reportContent.search(tableEnd) > -1) {
                        while (reportContent.match(regexRowGroup) && reportContent.search(tableEnd) > -1) {

                            var groupStart = reportContent.match(regexRowGroup)[0];
                            //Group by row with multi level
                            reportContent = reportContent.replace(new RegExp(' />', 'g'), '>');

                            var lstReportContent = reportContent.split(/\s*(<[^>]*>)/g);

                            // var groupStartIndex = lstReportContent.indexOf(groupStart);
                            var groupStartIndex = lstReportContent.findIndex(
                                function (s) { return s.indexOf(groupStart) !== -1; }
                            );

                            var groupEndIndex = lstReportContent.findIndex(function (name) {
                                return name.search(tableEnd) > -1;
                            });


                            var groupStartWithTag = lstReportContent[groupStartIndex - 1] + lstReportContent[groupStartIndex] + lstReportContent[groupStartIndex + 1];
                            var groupEndWithTag = lstReportContent[groupEndIndex - 1] + lstReportContent[groupEndIndex] + lstReportContent[groupEndIndex + 1];

                            var table = reportContent.substring(
                                reportContent.indexOf(groupStartWithTag),
                                reportContent.indexOf(groupEndWithTag) + groupEndWithTag.length
                            );

                            var lstGroupProperty = groupStart.match(/\[(.*?)\]/g).map(x => x.substr(1, x.length - 2));


                            var jquery = $('<div></div>');
                            jquery.html(table);
                            var tableStart = ReportKeyConsts.KeyOpen + storeData[i].tableName + '.0' + '.' + ReportKeyConsts.KeyStartTable + ReportKeyConsts.KeyClose;
                            var tableEnd = ReportKeyConsts.KeyOpen + storeData[i].tableName + '.0' + '.' + ReportKeyConsts.KeyEndTable + ReportKeyConsts.KeyClose;

                            // var templateTable = this.escapeHtml($('td:contains(' + tableStart + ')', jquery).parent()[0].outerHTML) + ' ' + this.escapeHtml($('td:contains(' + tableEnd + ')', jquery).parent()[0].outerHTML);
                            var group1Start = this.escapeHtml($('td:contains(' + tableStart + ')', jquery).parent()[0].outerHTML);
                            var group1End = this.escapeHtml($('td:contains(' + tableEnd + ')', jquery).parent()[0].outerHTML);
                            var templateTable = table.substring(
                                table.indexOf(group1Start),
                                table.indexOf(group1End) + group1End.length
                            );


                            var result = table.replace(templateTable, this.ProcessGroupByMultiLevelRow(storeData[i], lstGroupProperty, templateTable, undefined, tableStart, tableEnd));
                            reportContent = reportContent.replace(table, result);

                            reportContent = reportContent.split(groupStartWithTag).join('');
                            reportContent = reportContent.split(groupEndWithTag).join('');



                        }

                    }
                    //Đổ dữ liệu theo start end (không group by)
                    else if (reportContent.search(tableStart) > -1 && reportContent.search(tableEnd) > -1) {
                        while (reportContent.search(tableStart) > -1 && reportContent.search(tableEnd) > -1) {




                            var lstReportContent = reportContent.split(/\s*(<[^>]*>)/g);

                            // var groupStartIndex = lstReportContent.indexOf(groupStart);
                            // var groupEndIndex = lstReportContent.indexOf(groupEnd);

                            var groupStartIndex = lstReportContent.findIndex(function (name) {
                                return name.search(tableStart) > -1;
                            });
                            var groupEndIndex = lstReportContent.findIndex(function (name) {
                                return name.search(tableEnd) > -1;
                            });

                            var groupStartWithTag = lstReportContent[groupStartIndex - 1] + lstReportContent[groupStartIndex] + lstReportContent[groupStartIndex + 1];
                            var groupEndWithTag = lstReportContent[groupEndIndex - 1] + lstReportContent[groupEndIndex] + lstReportContent[groupEndIndex + 1];



                            var table = reportContent.substring(
                                reportContent.indexOf(groupStartWithTag),
                                reportContent.indexOf(groupEndWithTag) + groupEndWithTag.length
                            );

                            var result = this.AddDataToTableTemplate(storeData[i], table);

                            result = result.replace(new RegExp(groupStartWithTag, 'g'), "");
                            result = result.replace(new RegExp(groupEndWithTag, 'g'), "");

                            // var regex = new RegExp(table, 'g');
                            // reportContent = reportContent.replace(regex, result);
                            reportContent = reportContent.split(table).join(result);


                        }
                    }


                    for (var j = 0; j < storeData[i].columns.length; j++) {
                        var flag = false;

                        //Đổ dữ liệu dạng list 
                        while (reportContent.search(storeData[i].columns[j].keyName) > -1) {
                            var content = $('<div></div>');
                            content.html(reportContent);
                            flag = true;
                            if ($('td:contains(' + storeData[i].columns[j].keyName + ')', content).parent()[0]) {

                                var parent = this.escapeHtml($('td:contains(' + storeData[i].columns[j].keyName + ')', content).parent()[0].outerHTML);
                                var template = "";
                                for (var a = 0; a < storeData[i].rows.length; a++) {
                                    var templateData = parent;
                                    for (var b = 0; b < storeData[i].rows[a].cells.length; b++) {
                                        var regex = new RegExp(storeData[i].columns[b].keyName, 'g');

                                        templateData = templateData.replace(regex, storeData[i].rows[a].cells[b]);
                                    }
                                    template += templateData;
                                }
                                // var regex = new RegExp(parent, 'g');
                                reportContent = reportContent.replace(new RegExp(' />', 'g'), '>');
                                reportContent = reportContent.split(parent).join(template);
                            }
                            else {
                                var regex = new RegExp(storeData[i].columns[j].keyName, 'g');
                                reportContent = reportContent.replace(regex, storeData[i].rows.length ? storeData[i].rows[0].cells[j] || '' : '');
                            }

                        }
                    }
                    if (flag) {
                        break;
                    }
                }

                //Eval cho template
                // var regexEval = new RegExp(ReportKeyConsts.KeyEval + '\\((.*?)\\)\\)', 'g');
                // while (reportContent.match(regexEval)) {
                //     var evalString = reportContent.match(regexEval)[0];
                //     var evalContent = "this." + evalString.match(/\(([^)]*\))\)/)[1];
                //     // reportContent = reportContent.replace(new RegExp(evalString, 'g'), eval(evalContent));
                //     reportContent = reportContent.split(evalString).join(eval(evalContent));
                // }
                reportContent = this.EvalStringTemplate(reportContent, storeData);
                reportContent = this.QRCodeGenerator(reportContent);
                //Pivot Table
                var pivotStart = ReportKeyConsts.KeyOpen + ReportKeyConsts.KeyPivotStart + ReportKeyConsts.KeyClose;
                var pivotEnd = ReportKeyConsts.KeyOpen + ReportKeyConsts.KeyPivotEnd + ReportKeyConsts.KeyClose;
                while (reportContent.search(pivotStart) > -1 && reportContent.search(pivotEnd) > -1) {

                    var lstReportContent = reportContent.split(/\s*(<[^>]*>)/g);


                    var pivotStartWithTag = lstReportContent[lstReportContent.indexOf(pivotStart) - 1] + lstReportContent[lstReportContent.indexOf(pivotStart)];
                    var pivotEndWithTag = lstReportContent[lstReportContent.indexOf(pivotEnd)] + lstReportContent[lstReportContent.indexOf(pivotEnd) + 1];

                    var table = reportContent.substring(
                        reportContent.indexOf(pivotStartWithTag),
                        reportContent.indexOf(pivotEndWithTag) + pivotEndWithTag.length
                    );
                    var result = this.TransposeTable(table);

                    result = result.split(pivotStart).join('');
                    result = result.split(pivotEnd).join('');
                    reportContent = reportContent.split(table).join(result);
                }
            }

        }
        // subject.next(reportContent);

        return reportContent;
    }

    private EvalStringTemplate(template: string, item: ReportTable[], evalKey = ReportKeyConsts.KeyEval): string {
        // Eval cho template\
        let funct = this;
        let evalArray;
        var regexEval = new RegExp(evalKey + '\\{(.*?)\\}', 'g');
        // var flag1 = false;
        // var flag2 = false;

        if (template.match(regexEval)) {

            let evalStringArray = "evalArray = { "
            let arrayEvalTemplate = Array.from(template.match(regexEval));


            for (var i of arrayEvalTemplate) {
                var evalContent = this.escapeHtml(i.match(/\{(.*?)\}/)[1].replace(/&nbsp;/g, ' ').replace(/\s\s+/g, ' ').trim());
                evalStringArray += '"' + i + '"' + ":" + evalContent + ",";
            }
            evalStringArray += "}"
            eval(evalStringArray);
            // flag1 = true;
            Object.keys(evalArray).forEach(function (key, index) {
                template = template.split(key).join(evalArray[key]);
                // flag2 = true;
            });

        }

        // return template;
        // Eval cho template
        // var t0 = performance.now();


        // var regexEval = new RegExp(evalKey + '\\{(.*?)\\}', 'g');
        // while (template.match(regexEval)) {
        //     var evalString = template.match(regexEval)[0];
        //     var evalContent = this.escapeHtml(evalString.match(/\{(.*?)\}/)[1].replace(/&nbsp;/g, ' ').replace(/\s\s+/g, ' ').trim());

        //     let funct = this;
        //     template = template.split(evalString).join(eval(evalContent));


        // }
        // var t1 = performance.now();
        // console.log("Eval took " + (t1 - t0) + " milliseconds.");
        return template;
    }
    private QRCodeGenerator(template: string): string {


        var regexEval = new RegExp(ReportKeyConsts.KeyQRCode + '\\{(.*?)\\}', 'g');
        while (template.match(regexEval)) {
            var qrString = template.match(regexEval)[0];
            var qrContent = this.escapeHtml(qrString.match(/\{(.*?)\}/)[1].replace(/&nbsp;/g, ' ').replace(/\s\s+/g, ' ').trim());
            var image = this.genQRCode(qrContent)
            if (image) {
                var qrImage = "<img style='width:90px; height: 90px;' class='qrcode' alt='QR Code' src='" + image + "'/>"
                template = template.split(qrString).join(qrImage);
            }
            else {
                template = template.split(qrString).join("");
            }


        }
        return template;
    }

    private TransposeTable(htmlString: string): string {


        // var content = $(htmlString);
        var result = "";
        var content = $('<div></div>');
        content.html(htmlString);
        var i = 1;
        $("table", content).each(function (tbIndex, tbValue) {
            const transpose = m => m[0].map((x, i) => m.map(x => x[i]));
            var wrapper = document.createElement('div');
            wrapper.innerHTML = htmlString;

            var table = tbValue;
            const rows = Array.from(table.querySelectorAll("tr"));
            const totalRowCount = rows.length;

            // First, create an array of the rows and within each element, 
            // an array of the cells; easier to deal with than NodeLists.

            // This could be done more cleverly with map or reduce, but
            // I like good old fashioned for loops.

            const m = new Array(totalRowCount);
            for (let r = 0; r < rows.length; r++) {
                const row = rows[r] as any;
                const cells = Array.from(row.querySelectorAll("td"));
                m[r] = [];
                for (let c = 0; c < cells.length; c++) {
                    const cell = cells[c] as any;
                    let rowspan: any = cell.getAttribute("rowspan");
                    let colspan: any = cell.getAttribute("colspan");
                    rowspan = rowspan && parseInt(rowspan, 10);
                    colspan = colspan && parseInt(colspan, 10);

                    // Note that I'm swapping colspan and rowspan here in the
                    // cells of my array. I could do this after transposition,
                    // but felt like doing it here.

                    // Note also that unlike in the duplicate question, I
                    // default the attribute to 1 rather than 0. I found that
                    // some browsers get messed up with spanning 0 rows/columns.

                    cell.setAttribute("colspan", rowspan || 1);
                    cell.setAttribute("rowspan", colspan || 1);

                    // I'm using a temporary object here to make it easier to
                    // access information about the cell later on, without adding
                    // that information to the DOM.

                    m[r].push({
                        element: cell,
                        index: c,
                        rowspan: rowspan || 0,
                        colspan: colspan || 0
                    });
                }
            }

            // Now m contains an array of arrays. Each of the 4 elements
            // in the topmost array contains a different number of elements.
            // The elements are objects containing the <td>, its index in 
            // the row and the rowspan and colspan for that cell.

            // So, we'll build another array of arrays, this time with 
            // objects to represent the cells that are spanned.

            let rowsToSpan = 0;
            let colsToSpan = 0;
            let cellsToInject = new Array(m.length);
            for (let r = 0; r < m.length; r++) {
                let colSpannedCells = m[r].filter(c => c.colspan && c.colspan > 1);
                cellsToInject[r] = new Array(colSpannedCells.length);
                for (let c = 0; c < colSpannedCells.length; c++) {
                    let cell = colSpannedCells[c];
                    cellsToInject[r].push({
                        index: cell.index,
                        cells: new Array(cell.colspan - 1)
                    });
                }
            }

            // Now we have an array of arrays of the cells we want to inject, so we iterate 
            // over them, splicing the "empty" cells into the array.
            var r = 0;

            // One might wonder why I'm using for..of here, where I didn't previously; good 
            // question. :) I was playing around with performance (hence the console.time() and
            // console.timeEnd()) and wanted to see the effect. This would work just as well
            // with a normal for loop. 

            for (let row of cellsToInject) {
                if (row && row.length) {
                    var injectIndex = 0;
                    var injectCount = 0;
                    for (let col of row) {
                        if (col && col.cells.length) {
                            col.cells.fill({
                                element: null,
                                rowspan: null,
                                colspan: null
                            });

                            // The trick here is to ensure we're taking account of previously
                            // injected cells to ensure the new set of cells are injected in
                            // the correct place.

                            injectIndex = col.index + injectCount + 1;
                            Array.prototype.splice.apply(m[r], [injectIndex, 0, ...col.cells])

                            // Keeping a running tally of the number of cells injected helps.
                            injectCount += col.cells.length;
                        }
                    }
                }
                r++;
            }

            // Now m is an array of arrays, with each element in the topmost
            // array having an equal number of elements. This makes the transposition
            // work better.

            const transposed = transpose(m);

            // Now we remove the tbody and inject our own.

            table.removeChild(table.querySelector("tbody"));
            let tbody = document.createElement("tbody");

            // Just iterate over the transposed array, creating a row for each
            // element, and iterate over the nested array, adding the element
            // for each (where present) back in.

            for (let rw of transposed) {
                const row = document.createElement("tr");
                for (let ce of rw) {
                    if (ce && ce.element) {
                        row.appendChild(ce.element);
                    }
                }
                tbody.appendChild(row);
            }
            table.appendChild(tbody);
            result += $(table).html();
        });
        return content.html();


    }
    private GetKeyName(tableName: string, propertyName: string, groupLevel: string = undefined) {
        if (groupLevel) {
            return ReportKeyConsts.KeyOpen + tableName + '.' + groupLevel + '.' + propertyName + ReportKeyConsts.KeyClose;
        }
        return ReportKeyConsts.KeyOpen + tableName + '.' + propertyName + ReportKeyConsts.KeyClose;
    }
    private AddDataToTableTemplate(storeData: ReportTable, reportContent: string, groupLevel: string = undefined): string {
        // template= '<p>' +template + "</p>";
        reportContent = this.escapeHtml(reportContent);
        for (var j = 0; j < storeData.columns.length; j++) {
            var flag = false;
            var properTyKeyName = this.GetKeyName(storeData.tableName, storeData.columns[j].colName, groupLevel)
            //Đổ dữ liệu dạng list 
            while (reportContent.search(properTyKeyName) > -1) {
                var content = $('<div></div>');
                content.html(reportContent);
                flag = true;
                if ($('td:contains(' + properTyKeyName + ')', content).parent()[0]) {

                    var parent = this.escapeHtml($('td:contains(' + properTyKeyName + ')', content).parent()[0].outerHTML);
                    var template = "";
                    for (var a = 0; a < storeData.rows.length; a++) {
                        var templateData = parent;
                        for (var b = 0; b < storeData.rows[a].cells.length; b++) {
                            var regex = new RegExp(this.GetKeyName(storeData.tableName, storeData.columns[b].colName, groupLevel), 'g');

                            templateData = templateData.replace(regex, storeData.rows[a].cells[b]);
                        }
                        template += templateData;
                    }
                    // var regex = new RegExp(parent, 'g');
                    reportContent = reportContent.replace(new RegExp(' />', 'g'), '>');
                    reportContent = reportContent.split(parent).join(template);
                }
                else {
                    var regex = new RegExp(properTyKeyName, 'g');
                    reportContent = reportContent.replace(regex, storeData.rows.length ? storeData.rows[0].cells[j] || '' : '');
                }

            }
        }

        return reportContent;
    }

    GetReportContentForPrint(reportInfo: ReportTemplate): Observable<string> {
        var subject = new Subject<string>();

        // this._reportService.getDataFromStore(reportInfo.storeInfo).subscribe(response => {
        //     subject.next(this.ReloadDataFromStoreToPreview(reportInfo.templateContent, response));

        // });
        this._reportService.getDataFromStore(reportInfo.storeInfo).subscribe(response => {
            this.ReloadDataFromStoreToPreview(reportInfo.templateContent, response).then(result => {
                subject.next(result);
            });

            // subject.next(this.ReloadDataFromStoreToPreview(reportInfo.templateContent, response));

        });
        return subject;
    }
    private escapeHtml(text) {
        return text
            .replace(/&#39;/g, "'")
            .replace(/&quot;/g, '"')
            .replace(/\*/g, '&ast;')
            .replace(/\#/g, '&num;')
            .replace(/\$/g, '&dollar;')
            .replace(/&quest;/g, '?')
            .replace(/&ast;/g, '*')
            // .replace(/\(/g, '&lpar;')
            // .replace(/\)/g, '&rpar;')
            // .replace(/\+/g, '&plus;')
            // .replace(/\./g, '&period;')
            // .replace(/\?/g, '&quest;')
            .replace(/\@/g, '&commat;')
            .replace(/\\/g, '&bsol;')
            .replace(/\|/g, '&verbar;')
            // .replace(/\[/g, '&lsqb;')
            // .replace(/\]/g, '&rsqb;')
            .replace(/\^/g, '&Hat;')
            // .replace(/&oacute;/g, 'ó')
            .replace(/\"/g, "'")

            .replace(/á/g, '&aacute;')

            .replace(/à/g, '&agrave;')
            .replace(/ã/g, '&atilde;')
            .replace(/ú/g, '&uacute;')
            .replace(/ù/g, '&ugrave;')
            .replace(/ó/g, '&oacute;')
            .replace(/ò/g, '&ograve;')
            .replace(/õ/g, '&otilde;')
            .replace(/ý/g, '&yacute;')
            .replace(/é/g, '&eacute;')
            .replace(/è/g, '&egrave;')
            .replace(/í/g, '&iacute;')
            .replace(/ì/g, '&igrave;')
            .replace(/Á/g, '&Aacute;')
            .replace(/À/g, '&Agrave;')
            .replace(/Ã/g, '&Atilde;')
            .replace(/Ú/g, '&Uacute;')
            .replace(/Ù/g, '&Ugrave;')
            .replace(/Ó/g, '&Oacute;')
            .replace(/Ò/g, '&Ograve;')
            .replace(/Õ/g, '&Otilde;')
            .replace(/Ý/g, '&Yacute;')
            .replace(/É/g, '&Eacute;')
            .replace(/È/g, '&Egrave;')
            .replace(/Í/g, '&Iacute;')
            .replace(/Ì/g, '&Igrave;')
            .replace(/Ê/g, '&Ecirc;')
            .replace(/ê/g, '&ecirc;')

        // .replace(/&laquo;/g, ReportKeyConsts.KeyOpen)
        // .replace(/&raquo;/g, ReportKeyConsts.KeyClose);
    }
    myWindow: Window;
    print(data: string) {
        // $('.previewContent').printThis();
        // data = '<style type="text/css">' + printPagecss + '</style>' + data;
        // data = '<link type="text/css" rel="stylesheet" href="/assets/common/styles/print-page.css">' + data;
        // //   let content = data;

        // $(data).printThis({
        //     importCSS: false,
        //     loadCSS: "/assets/common/styles/print-page.css",
        //     printDelay: 1000,
        // });
        // $(data).printThis();

        // $("#previewTemplate").printPreview();

        // var newWin=window.open('','Print-Window');
        // newWin.document.open();
        // newWin.document.write('<html><body onload="window.print()">'+data+'</body></html>');
        // newWin.document.close();
        // newWin.close();
        // setTimeout(function(){newWin.close();},1000);
        // if (this.myWindow) {
        //     this.myWindow.close();
        // }
        // this.myWindow = window.open('', 'myWindow', 'height=1200,width=1000');

        // this.myWindow.document.write('<html><head><title></title><style>' + printPagecss + `</style></head><body>`);
        // this.myWindow.document.write(data);
        // this.myWindow.document.write(`
        // <script>

        // </script>
        // </body></html>`);
        var frame = document.getElementById("print_frame");
        if (frame) {
            frame.parentNode.removeChild(frame);
        }
        var printDivCSS = "<style> " + printPagecss + "</style>";
        var ifrm = document.createElement('iframe');
        ifrm.name = "print_frame"
        ifrm.id = "print_frame"
        // visibility: hidden;
        ifrm.setAttribute("style", "visibility: hidden");
        // ifrm.setAttribute("style", "display: none");
        // ifrm.innerHTML = printDivCSS + data;
        document.body.appendChild(ifrm);


        window.frames["print_frame"].document.body.innerHTML = printDivCSS + data;
        window.frames["print_frame"].window.focus();

        setTimeout(function () {
            window.frames["print_frame"].window.print();
            document.getElementById("print_frame").parentNode.removeChild(document.getElementById("print_frame"));
        }, 1000);


        // mywindow.document.close();
        // mywindow.close();

        // mywindow.document.close();
        // mywindow.focus();
        // mywindow.print();
        // mywindow.close();


        // $.print(data, {
        //     // stylesheet: '/assets/common/styles/print-page.css',
        // });



        // $(data).print({
        //     stylesheet : '/assets/common/styles/print-page.css',
        // });

        // setTimeout(() => { $(".printFrame").remove(), 1000 });

    }

    printContent(content: string, data: ReportTable[], done = undefined) {

        this.ReloadDataFromStoreToPreview(content, data).then(result => {
            if (done) {
                done();
            }

            this.print(result);
        });
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

    printReportTemplate(reportTemplateCode: string, params: ReportParameter[], values: ReportParameter[]) {
        abp.ui.setBusy(null, this.l('SavingWithThreeDot'));
        this._reportTemplateService.cM_REPORT_TEMPLATE_ByCode(reportTemplateCode).subscribe(response => {
            var defaultTemplate = response.reporT_TEMPLATE_DETAILs.find(x => x.isDefault == true);
            var reportInfo = new ReportInfo();
            reportInfo.storeName = response.reporT_TEMPLATE_STORE;
            reportInfo.parameters = params;
            reportInfo.values = values;
            this._reportService.getDataFromStore(reportInfo).subscribe(storeData => {
                this.printContent(defaultTemplate.reporT_TEMPLATE_DETAIL_CONTENT, storeData, () => { 
                    abp.ui.clearBusy(); 
                });
            });
        });
    }

    private GroupbyTableProperty(table: ReportTable, groupByProperty: string): ReportTable[] {
        if (!groupByProperty) {
            return [table];
        }
        var myMap = new Map();
        var index = table.columns.findIndex(x => x.colName == groupByProperty);
        for (var item of table.rows) {

            if (myMap.get(item.cells[index])) {
                myMap.get(item.cells[index]).rows.push(item);
            } else {
                var newTable = new ReportTable();
                newTable.columns = table.columns;
                newTable.rows = [];
                newTable.rows.push(item);
                newTable.tableName = table.tableName;
                myMap.set(item.cells[index], newTable);
            }
        }
        return Array.from(myMap.values());

    }


}
