import { Component, Input, ViewEncapsulation, Output, Injector, Optional, Inject } from "@angular/core";
import * as XLSX from 'xlsx';
import { EventEmitter } from '@angular/core';
import * as moment from "moment";
import { HttpClient, HttpHandler } from "@angular/common/http";
import * as _ from "lodash";
import { FileUploaderComponent } from "../file-uploader/file-uploader.component";
import { API_BASE_URL } from "@shared/service-proxies/service-proxies";
import { ComponentBase } from "@app/ultilities/component-base";

@Component({
    selector: "import-excel",
    templateUrl: "./import-excel.component.html",
    encapsulation: ViewEncapsulation.None
})

export class ImportExcelComponent extends ComponentBase {

    // XLSX = require('xlsx');
    // request = require('request');

    constructor(
        injector: Injector,
        @Optional() @Inject(API_BASE_URL) baseUrl?: string
    ) {
        super(injector);
        console.log(this);
    }
    handler: HttpHandler;
    http: HttpClient;
    arrayBuffer: any;
    file: File;
    @Input() inputCss: string;
    @Input() customStyle: string;
    @Input() hidden: boolean = false;
    @Input() disable: boolean = false;
    @Input() id: string = 'file';
    @Input() startPosition: string = '';
    // @Input() endPosition: string = '';
    @Input() workSheetName: string = '';
    @Input() fileExtension: string = '.xlsx,.xls';


    @Output() toObjects: EventEmitter<any> = new EventEmitter<any>();
    @Output() toArrayObject: EventEmitter<any> = new EventEmitter<any>();

    async onUploadFile(fileInput: any) {
        if (fileInput.target.files && fileInput.target.files[0]) {
            if (this.checkUploadedFile(fileInput)) {
                this.file = fileInput.target.files[0];
                await this.readUploadedFile();
            }
            else {
                this.showErrorMessage(this.l('FileNotCorrect'));
            }
        }
    }

    checkUploadedFile(fileInput: any): boolean {
        var ext: string[] = fileInput.target.files[0].name.split('.');
        return !!this.fileExtension.split(',').find(x => x == '.' + ext[ext.length-1]);
    }

    async readUploadedFile() {
        this.setLoadingUI(true, this.l('Loading'));
        setTimeout(() => {
            try {
                let fileReader = new FileReader();
                fileReader.readAsArrayBuffer(this.file);
                fileReader.onload = () => {
                    this.arrayBuffer = fileReader.result;
                    var data = new Uint8Array(this.arrayBuffer);
                    let arr = new Array();
                    for (let i = 0; i != data.length; ++i)
                        arr[i] = String.fromCharCode(data[i]);
                    let bstr = arr.join("");
                    console.time('reading');
                    let workbook = XLSX.read(bstr, { type: 'binary', cellFormula: false, cellHTML: false, cellText: false });
                    console.timeEnd('reading');
                    //workSheetName has value
                    let sheetName = this.workSheetName ? this.workSheetName : workbook.SheetNames[0];
                    let worksheet = workbook.Sheets[sheetName];

                    //khangth 1/11/2019, datas -> iterableItarator
                    // -- let datas = this.createNewObjectWithStartPosition(this.getObjectKey(worksheet), worksheet, this.startPosition);
                    let datas: IterableIterator<Object> = this.iiCreateIteratorWithStartPosition(this.getObjectKey(worksheet), worksheet, this.startPosition);

                    // this.toObjects.emit(this.createNewObjectWithStartPosition(this.getObjectKey(worksheet), worksheet, this.startPosition));
                    //khangth -4.12 ---> this.toArrayObject.emit(this._toArrayObject(datas));
                    this.toArrayObject.emit(this._toIterableArrObject(datas));
                };
            }
            catch (err) {
                this.showErrorMessage(err);
            }
            finally {
                this.setLoadingUI(false);
                this.clearInputFile();
            }
        }, 1000);
    }

    getObjectKey(obj: Object): string[] {
        // try {
            let arr = Object.keys(obj).filter(x => !x.startsWith('!'));
            if(arr.length == 0) {
                this.showErrorMessage(this.l('ExcelFileEmpty'));
                return [];
            }
            let rowsLast = this.splitRowIndex(arr[arr.length - 1]); //Math.max.apply(null, arr.map(x => this.splitRowIndex(x)));
            let rowsFirst = this.splitRowIndex(arr[0]); // Math.min.apply(null, arr.map(x => this.splitRowIndex(x)));
            let columns = arr.map(x => x.replace(this.splitRowIndex(x).toString(), '')).filter((value, index, self) => self.indexOf(value) === index);

            columns = columns.sort(function (x, y) {
                if (x.length > y.length) {
                    return 1;
                }

                if (x.length < y.length) {
                    return -1;
                }

                return x > y ? 1 : -1;
            });

            var result: string[] = [];
            for (let rowI: any = rowsFirst; rowI <= rowsLast; rowI++) {
                for (let column of columns) {
                    result.push(column + rowI);
                }
            }
            this.setLoadingUI(false);
            return result;
        // } catch (error) {
        //     this.showErrorMessage(error);
            
        // }

    }

    // _toArrayObject(datas: Object[]): Object[][] {
    //     if (!datas)
    //         return null;

    //     let __obj: Object[][] = [];
    //     let _obj: Object[] = [];

    //     let oldInt: Number = 0;
    //     oldInt = this.splitRowIndex(Object.keys(datas[0])[0]);; // old value of row index
    //     //  _obj.push(datas[0]);

    //     let newInt: Number = 0;
    //     for (let i = 0; i < datas.length; i++) {
    //         newInt = this.splitRowIndex(Object.keys(datas[i])[0]);
    //         if (newInt == oldInt) {
    //             _obj.push(datas[i]);
    //         }
    //         else {
    //             oldInt = newInt; // update oldInt
    //             __obj.push(_obj);
    //             _obj = [datas[i]]; // reset _obj array for pushing new object
    //         }
    //     }

    //     return __obj;
    // }


    *_toIterableArrObject(datas: IterableIterator<Object>): IterableIterator<Array<Object>> {
        if (!datas)
            return null;

        let curIterator = datas.next();
        if (curIterator.done)
            return null

        let _obj: Object[] = [];

        let oldInt: Number = 0;
        oldInt = this.splitRowIndex(Object.keys(curIterator.value)[0]);; // old value of row index


        let newInt: Number = 0;

        while (!curIterator.done) {
            newInt = this.splitRowIndex(Object.keys(curIterator.value)[0]);

            if (newInt == oldInt) {
                _obj.push(curIterator.value);
            }
            else {
                oldInt = newInt; // update oldInt      
                yield _obj
                _obj = [curIterator.value]; // reset _obj array for pushing new object
            }
            curIterator = datas.next();

            if (curIterator.done) {
                yield _obj
                break;
            }

        }
    }

    _toArrayObject(datas: IterableIterator<Object>): Object[][] {
        if (!datas)
            return null;

        let curIterator = datas.next();
        if (curIterator.done)
            return null

        let __obj: Object[][] = [];
        let _obj: Object[] = [];



        let oldInt: Number = 0;
        oldInt = this.splitRowIndex(Object.keys(curIterator.value)[0]);; // old value of row index


        let newInt: Number = 0;

        while (true) {
            newInt = this.splitRowIndex(Object.keys(curIterator.value)[0]);

            if (newInt == oldInt) {
                _obj.push(curIterator.value);
            }
            else {
                oldInt = newInt; // update oldInt
                __obj.push(_obj);
                _obj = [curIterator.value]; // reset _obj array for pushing new object
            }
            curIterator = datas.next();

            if (curIterator.done) {
                __obj.push(_obj);
                break;
            }

        }

        return __obj;
    }

    private splitRowIndex(key: string): Number {
        return Number.parseInt((key.length == 2) ? key[1] : key.match(/(\d+)/)[0]);
        // if (key.length == 2)
        //     return Number.parseInt(key.slice(1));
        // return Number.parseInt(key.match(/(\d+)/)[0]);
    }

    //khangth,1/11/2019, replace generator function for createNewObject
    // createNewObject(keys: string[], obj: Object): Object {
    //     let _obj: Object[] = [];
    //     let o: Object;
    //     keys.forEach(key => {
    //         o = new Object();
    //         o[key] = obj[key] ? obj[key]["v"] : undefined;
    //         _obj.push(o);
    //     });
    //     return _obj;
    // }

    //khangth,1/11/2019, replace generator function for createNewObject BEGIN
    *iiCreateNewObject(keys: string[], obj: Object): IterableIterator<Object> {
        for (let key of keys) {
            let o: Object = {};
            o[key] = obj[key] ? obj[key]["v"] : undefined;
            yield o
        }
    }
    createNewObject(keys: string[], obj: Object): Object[] {

        let _obj: Object[] = []
        let iterable = this.iiCreateNewObject(keys, obj)
        let it = iterable.next()
        while (!it.done) {
            _obj.push(it.value)
            it = iterable.next()
        }
        //this.testCreateNewObject(keys, obj)
        //let iterator = this.testCreateNewObject(keys, obj);

        return _obj;
    }
    //khangth,1/11/2019, replace generator function for createNewObject END

    // createNewObjectWithStartPosition(keys: string[], obj: Object, startPosition: string): Object[] {
    //     if (!startPosition)
    //         return this.createNewObject(keys, obj)[0];

    //     let indexOfStartPos = keys.findIndex(key => key == startPosition);
    //     if (indexOfStartPos < 0) // start position not found in keys list
    //         return this.createNewObject(keys, obj)[0];

    //     let _obj: Object[] = [];
    //     let o: Object;
    //     for (let i = indexOfStartPos; i < keys.length; i++) {
    //         o = new Object();
    //         let value = obj[keys[i]] ? obj[keys[i]]["v"] : undefined;
    //         if (value instanceof Date) {
    //             value = moment(value);
    //         }
    //         o[keys[i]] = value;
    //         _obj.push(o);
    //     }
    //     return _obj;
    // }


    //khangth,1/11/2019, replace generator function for createNewObject BEGIN
    *iiCreateIteratorWithStartPosition(keys: string[], obj: Object, startPosition: string): IterableIterator<Object> {
        if(keys.length == 0)
            return null;
        if (!startPosition)
            return this.createNewObject(keys, obj)[0];

        let indexOfStartPos = keys.findIndex(key => key == startPosition);
        if (indexOfStartPos < 0) // start position not found in keys list
            return this.createNewObject(keys, obj)[0];


        for (let i = indexOfStartPos; i < keys.length; i++) {
            let o: Object = {};
            let value = obj[keys[i]] ? obj[keys[i]]["v"] : undefined;
            if (value instanceof Date) {
                value = moment(value);
            }
            o[keys[i]] = value;
            yield o
        }
    }

    createNewObjectWithStartPosition(keys: string[], obj: Object, startPosition: string): Object[] {
        let _obj: Object[] = []
        let iterable = this.iiCreateIteratorWithStartPosition(keys, obj, startPosition)
        let it = iterable.next()
        while (!it.done) {
            _obj.push(it.value)
            it = iterable.next()
        }
        return _obj;
    }
    //khangth,1/11/2019, replace generator function for createNewObject END


    clearInputFile(): void {
        if ((<HTMLInputElement>document.getElementById('file-upload')) == null)
            return;
        (<HTMLInputElement>document.getElementById('file-upload')).value = '';
    }

    setLoadingUI(bool: boolean = true, loadingText: string = ''): void {
        if (bool)
            abp.ui.setBusy(undefined, loadingText, undefined);
        else
            abp.ui.clearBusy();
    }

}