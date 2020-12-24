import { Injector, ViewChild, OnDestroy } from '@angular/core';
import { ToolbarComponent } from '../admin/core/controls/toolbar/toolbar.component';
import { ComponentBase } from './component-base';
import { WebConst } from '@app/admin/core/ultils/consts/WebConsts';
import { ChangeDetectionComponent } from '@app/admin/core/ultils/change-detection.component';
import { AttachFileServiceProxy, CM_ATTACH_FILE_MODEL, CM_ATTACH_FILE_INPUT, CM_ATTACH_FILE_ENTITY } from '@shared/service-proxies/service-proxies';
import { AttachFileChildren, GetFileMultiModel } from './attach-file-dto';
import { CacheRouteReuseStrategy } from '@app/admin/core/ultils/cache-route-reuse.strategy';
import { RouteReuseStrategy } from '@angular/router';
import { AuthStatusConsts } from '@app/admin/core/ultils/consts/AuthStatusConsts';
import { FileUploaderComponent } from '@app/admin/core/controls/file-uploader/file-uploader.component';

export abstract class DefaultComponentBase extends ChangeDetectionComponent {

    @ViewChild('appToolbar') appToolbar: ToolbarComponent;
    private attachFileService: AttachFileServiceProxy;
    private cacheRouteReuseStrategy: CacheRouteReuseStrategy;

    constructor(injector: Injector) {
        super(injector);
        $(".ui-tooltip").remove();
        $("div.ui-helper-hidden-accessible[role='log']").remove();
        this.attachFileService = injector.get(AttachFileServiceProxy);
        this.cacheRouteReuseStrategy = injector.get(RouteReuseStrategy);
    }

    onGetFilter(filterInput) {
    }

    rootPage() {
        return '/app/admin/dashboard';
    }

    getFilterInputInRoute(getFilterInput): any {
        this.activeRoute.queryParams.subscribe(response => {
            var str = response['filterInput'];
            if (getFilterInput) {
                getFilterInput(str);
            }
        })
    }

    initFilter() {
        this.getFilterInputInRoute((filterJson) => {
            if (filterJson) {
                (this as any).filterInput = JSON.parse(filterJson);
                this.onGetFilter((this as any).filterInput);
            }
        });
    }

    getCurrentFunctionId() {
        var currentFunctionId = window.location.href;
        var currentFunctionId = currentFunctionId.substr(currentFunctionId.indexOf(WebConst.UrlPrefix));
        if (currentFunctionId.endsWith('-add')) {
            currentFunctionId = currentFunctionId.substr(0, currentFunctionId.length - 4);
        }
        else if (currentFunctionId.indexOf('-edit;') > 0) {
            currentFunctionId = currentFunctionId.substr(0, currentFunctionId.indexOf('-edit;'));
        }
        else if (currentFunctionId.indexOf('-view;') > 0) {
            currentFunctionId = currentFunctionId.substr(0, currentFunctionId.indexOf('-view;'));
        }
        return currentFunctionId;
    }


    createFileModel(response: any[], typeToList: any): CM_ATTACH_FILE_ENTITY[] {
        let childs: CM_ATTACH_FILE_ENTITY[] = [];
        Object.keys(typeToList).forEach(fileType => {
            let items = response.filter(x => x['TYPE'] == fileType);
            let details = typeToList[fileType];
            for (let i = 0; i < items.length; i++) {

                let file = details[i]['filE_ATTACHMENT'];
                if (!file) {
                    file = new CM_ATTACH_FILE_ENTITY();
                    file.patH_OLD = '';
                    file.filE_NAME_OLD = '';
                    file.patH_NEW = '';
                    file.filE_NAME_NEW = '';
                }

                file.attacH_ID = details[i]['attacH_ID'];
                file.type = fileType;
                file.reF_ID = items[i].REF_ID;
                childs.push(file);
            }
        })

        return childs;
    }

    getFileMultiChildren(refMasterId: string, master: any, childs: GetFileMultiModel[], onGetFileSuccess = undefined) {
        setTimeout(() => {
            this.attachFileService.cM_ATTACH_FILE_By_RefMaster(refMasterId).subscribe(response => {
                var fileMaster = response.filter(x => x.reF_ID == refMasterId);
                if (fileMaster.length) {
                    master['filE_ATTACHMENT'] = fileMaster[0];
                    master['attacH_ID'] = fileMaster[0].attacH_ID;
                }
    
                if (childs) {
    
                    let idToChild = {};
                    childs.forEach(x => {
                        x.childs.forEach(y => {
                            idToChild[y[x.childIdName]] = y;
                        })
                    })
    
                    response.forEach(file => {
                        var child = idToChild[file.reF_ID];
                        if (child) {
                            child['filE_ATTACHMENT'] = file;
                            child['attacH_ID'] = child.attacH_ID;
                        }
                    })
                }
    
    
                if (onGetFileSuccess) {
                    onGetFileSuccess(response);
                }
    
                this.updateView();
            })
        })
    }

    getAllFiles(attFile: CM_ATTACH_FILE_ENTITY): string[] {
        if (!attFile) {
            return [];
        }
        let results = [];

        let names = (attFile.filE_NAME_NEW || '').split('|');
        let paths = (attFile.patH_NEW || '').split('|');

        let m = Math.min(names.length, paths.length);

        for (let i = 0; i < m; i++) {
            results.push(paths[i] + '/' + names[i]);
        }

        return results;
    }

    getFile(refMasterId: string, master: any, childs: any[] = undefined, childIdName = undefined, onGetFileSuccess = undefined, masterFileAttachmentName = 'filE_ATTACHMENT', detailFileAttachmentName = 'filE_ATTACHMENT') {
        this.attachFileService.cM_ATTACH_FILE_By_RefMaster(refMasterId).subscribe(response => {

            master['olD_FILE_PATHS'] = [];
            // init old file
            response.forEach(x => {
                master['olD_FILE_PATHS'].push(...this.getAllFiles(x));
            })

            var fileMaster = response.filter(x => x.reF_ID == refMasterId);
            if (fileMaster.length) {
                master['filE_ATTACHMENT'] = fileMaster[0];
                master['attacH_ID'] = fileMaster[0].attacH_ID;
            }

            if (childs) {
                response.forEach(file => {
                    var child = childs.filter(x => x[childIdName] == file.reF_ID);
                    if (child.length > 0) {
                        child[0]['filE_ATTACHMENT'] = child[0][detailFileAttachmentName] = file;
                        child[0]['attacH_ID'] = child[0].attacH_ID;
                    }
                })
            }

            if (onGetFileSuccess) {
                onGetFileSuccess(response);
            }

            this.updateView();
        });
    }

    getFileByRefIds(items: any[], itemIdName, onGetFileSuccess: any = undefined) {
        if (items.length == 0) {
            return;
        }
        var refIds = items.map(x => x['itemIdName']);
        this.attachFileService.cM_ATTACH_FILE_By_RefId(refIds).subscribe(response => {
            response.forEach(file => {
                var child = items.filter(x => x[itemIdName] == file.reF_ID);
                if (child.length > 0) {
                    child[0]['filE_ATTACHMENT_OLD'] = child[0]['filE_ATTACHMENT'] = file.filE_NAME;
                    child[0]['attacH_ID'] = child[0].attacH_ID;
                }
            });

            if (onGetFileSuccess) {
                onGetFileSuccess(response);
            }
        });
    }

    //addFileMultiChildren(input: any, refMaster: string, type: string, childs: AttachFileChildren[]) {
    // let files = [];
    // var master = new CM_ATTACH_FILE();
    // master.type = type;
    // master.filE_ATTACHMENT = input['filE_ATTACHMENT'];
    // master.filE_ATTACHMENT_OLD = input['filE_ATTACHMENT_OLD'];
    // files.push(...(master.filE_ATTACHMENT || '').split('|'));

    // var file = new CM_ATTACH_FILE_INPUT();
    // file.attachFile = master;
    // file.childs = [];
    // file.ids = refMaster + ',' + childs.map(x => x.ref_id).join(',');

    // if (childs) {
    //     childs.forEach(x => {
    //         var item = new CM_ATTACH_FILE();
    //         item.filE_ATTACHMENT = x.filE_ATTACHMENT;
    //         item.filE_ATTACHMENT_OLD = x.filE_ATTACHMENT_OLD;
    //         item.type = x.type;
    //         file.childs.push(item);
    //         files.push(...(item.filE_ATTACHMENT || '').split('|'));
    //     })
    // }

    // this.attachFileService.moveTmpFile(files).subscribe(response => {
    //     this.attachFileService.cM_ATTACH_FILE_Ins(file).subscribe(response => {
    //     });
    // })
    //}


    updateFileMultiChildren(input: any, refMaster: string, type: string, childs: CM_ATTACH_FILE_ENTITY[]) {

        let file = new CM_ATTACH_FILE_INPUT();
        file.attachFile = input['filE_ATTACHMENT'];

        let newFilePaths = [];

        if (!file.attachFile) {
            file.attachFile = new CM_ATTACH_FILE_ENTITY();

            file.attachFile.filE_NAME_NEW = '';
            file.attachFile.patH_NEW = '';
            file.attachFile.filE_NAME_OLD = '';
            file.attachFile.patH_OLD = '';
        }

        newFilePaths.push(...this.getAllFiles(input['filE_ATTACHMENT']));
        file.attachFile.type = type;
        file.attachFile.attacH_ID = input['attacH_ID'];

        if (childs) {
            childs.forEach(x => {
                newFilePaths.push(...this.getAllFiles(x));
            })
        }

        file.childs = [];
        if (childs) {
            file.ids = refMaster + ',' + childs.map(x => x.reF_ID).join(',');;
        }
        else {
            file.ids = refMaster;
        }

        file.oldFiles = input['olD_FILE_PATHS'];
        file.newFiles = newFilePaths;
        file.childs = childs;

        this.attachFileService.moveTmpFile(file).subscribe(attachFile => {
            this.attachFileService.cM_ATTACH_FILE_Upd(attachFile).subscribe(response => {
                input['olD_FILE_PATHS'] = [];
                // init old file
                input['olD_FILE_PATHS'].push(...this.getAllFiles(attachFile.attachFile));
                input['filE_ATTACHMENT'] = attachFile.attachFile;

                if (childs) {
                    childs.forEach(x => {
                        x['filE_ATTACHMENT'] = attachFile.childs.firstOrDefault(a => a.attacH_ID == x['attacH_ID']);
                    })
                }
            });
        });


        // let files = [];
        // let filesOld = [];
        // var master = new CM_ATTACH_FILE();
        // master.type = type;
        // master.filE_ATTACHMENT = input['filE_ATTACHMENT'];
        // master.filE_ATTACHMENT_OLD = input['filE_ATTACHMENT_OLD'];
        // master.attacH_ID = input['attacH_ID'];

        // var file = new CM_ATTACH_FILE_INPUT();
        // file.attachFile = master;
        // file.childs = [];
        // file.ids = refMaster + ',' + childs.map(x => x.ref_id).join(',');

        // files.push(...(master.filE_ATTACHMENT || '').split('|'));
        // filesOld.push(...(master.filE_ATTACHMENT_OLD || '').split('|'));

        // if (childs) {
        //     childs.forEach(x => {
        //         var item = new CM_ATTACH_FILE();
        //         item.filE_ATTACHMENT = x.filE_ATTACHMENT;
        //         item.filE_ATTACHMENT_OLD = x.filE_ATTACHMENT_OLD;
        //         item.attacH_ID = x['attacH_ID'];
        //         item.type = x.type;
        //         files.push(...(item.filE_ATTACHMENT || '').split('|'));
        //         filesOld.push(...(item.filE_ATTACHMENT_OLD || '').split('|'));
        //         file.childs.push(item);
        //     })
        // }

        // this.attachFileService.moveTmpFile(files).subscribe(response => {
        //     this.attachFileService.cM_ATTACH_FILE_Upd(file).subscribe(response => {
        //         input['filE_ATTACHMENT_OLD'] = input['filE_ATTACHMENT'];
        //         if (childs) {
        //             childs.forEach(c => {
        //                 c['filE_ATTACHMENT_OLD'] = c['filE_ATTACHMENT'];
        //             })
        //         }
        //     });

        //     this.attachFileService.deleteMultTmpFile(filesOld).subscribe(response => {

        //     });
        // })
    }

    addFileMultiChildren(input: any, refMaster: string, type: string, childs: CM_ATTACH_FILE_ENTITY[]) {
        let file = new CM_ATTACH_FILE_INPUT();
        file.attachFile = input['filE_ATTACHMENT'];
        let newFilePaths = [];
        newFilePaths.push(...this.getAllFiles(input['filE_ATTACHMENT']));

        if (!file.attachFile) {
            file.attachFile = new CM_ATTACH_FILE_ENTITY();

            file.attachFile.filE_NAME_NEW = '';
            file.attachFile.patH_NEW = '';
            file.attachFile.filE_NAME_OLD = '';
            file.attachFile.patH_OLD = '';
        }

        childs.forEach(x => {
            newFilePaths.push(...this.getAllFiles(x));
        })

        file.attachFile.type = type;
        file.childs = childs;
        file.ids = refMaster + ',' + childs.map(x => x.reF_ID).join(',');
        this.attachFileService.moveTmpFile(file).subscribe(fileNew => {
            this.attachFileService.cM_ATTACH_FILE_Ins(fileNew).subscribe(response => {
            });
        })
    }

    addFile(input: any, type: string, childs: any[], refIds, childType: string = undefined) {

        let file = new CM_ATTACH_FILE_INPUT();
        file.attachFile = input['filE_ATTACHMENT'];

        if (!file.attachFile) {
            file.attachFile = new CM_ATTACH_FILE_ENTITY();

            file.attachFile.filE_NAME_NEW = '';
            file.attachFile.patH_NEW = '';
            file.attachFile.filE_NAME_OLD = '';
            file.attachFile.patH_OLD = '';
        }

        file.attachFile.type = type;
        file.childs = [];
        file.ids = refIds;

        if (childs) {
            childs.forEach(x => {
                let child = x['filE_ATTACHMENT'];
                if (!child) {
                    child = new CM_ATTACH_FILE_ENTITY();
                    child.filE_NAME_NEW = '';
                    child.patH_NEW = '';
                    child.filE_NAME_OLD = '';
                    child.patH_OLD = '';
                }
                child.attacH_ID = x['attacH_ID'];
                child.type = childType;
                file.childs.push(child);
            })
        }

        this.attachFileService.moveTmpFile(file).subscribe(fileNew => {
            this.attachFileService.cM_ATTACH_FILE_Ins(fileNew).subscribe(response => {
            });
        })
    }

    updateFile(input: any, type: string, childs: any[], refIds, childType: string = undefined) {

        let file = new CM_ATTACH_FILE_INPUT();
        file.attachFile = input['filE_ATTACHMENT'];

        let newFilePaths = [];

        if (!file.attachFile) {
            file.attachFile = new CM_ATTACH_FILE_ENTITY();

            file.attachFile.filE_NAME_NEW = '';
            file.attachFile.patH_NEW = '';
            file.attachFile.filE_NAME_OLD = '';
            file.attachFile.patH_OLD = '';
        }

        newFilePaths.push(...this.getAllFiles(input['filE_ATTACHMENT']));
        file.attachFile.type = type;
        file.attachFile.attacH_ID = input['attacH_ID'];

        if (childs) {
            childs.forEach(x => {
                newFilePaths.push(...this.getAllFiles(x['filE_ATTACHMENT']));
            })
        }

        file.childs = [];
        file.ids = refIds;

        file.oldFiles = input['olD_FILE_PATHS'];
        file.newFiles = newFilePaths;

        if (childs) {
            childs.forEach(x => {
                let child = x['filE_ATTACHMENT'];
                if (!child) {
                    child = new CM_ATTACH_FILE_ENTITY();
                    child.filE_NAME_NEW = '';
                    child.patH_NEW = '';
                    child.filE_NAME_OLD = '';
                    child.patH_OLD = '';
                }
                child.attacH_ID = x['attacH_ID'];
                child.type = childType;
                file.childs.push(child);
            })
        }

        this.attachFileService.moveTmpFile(file).subscribe(attachFile => {
            this.attachFileService.cM_ATTACH_FILE_Upd(attachFile).subscribe(response => {
                input['olD_FILE_PATHS'] = [];
                // init old file
                input['olD_FILE_PATHS'].push(...this.getAllFiles(attachFile.attachFile));
                input['filE_ATTACHMENT'] = attachFile.attachFile;

                if (childs) {
                    childs.forEach(x => {
                        x['filE_ATTACHMENT'] = attachFile.childs.firstOrDefault(a => a.attacH_ID == x['attacH_ID']);
                    })
                }
            });

            // if (FileUploaderComponent.g) {
            //     this.attachFileService.delete_g_path(FileUploaderComponent.g).subscribe(response => {
            //         FileUploaderComponent.g = undefined;
            //     });
            // }
        })
    }


    addFile_o(input: any, type: string, childs: any[], refIds, childType: string = undefined) {

        // let files = [];

        // var master = new CM_ATTACH_FILE();
        // master.type = type;
        // master.filE_ATTACHMENT = input['filE_ATTACHMENT'];
        // master.filE_ATTACHMENT_OLD = input['filE_ATTACHMENT_OLD'];

        // files.push(...(master.filE_ATTACHMENT || '').split('|'));

        // var file = new CM_ATTACH_FILE_INPUT();
        // file.attachFile = master;
        // file.childs = [];
        // file.ids = refIds;

        // if (childs) {
        //     childs.forEach(x => {
        //         var item = new CM_ATTACH_FILE();
        //         item.filE_ATTACHMENT = x['filE_ATTACHMENT'];
        //         item.filE_ATTACHMENT_OLD = x['filE_ATTACHMENT_OLD'];
        //         item.attacH_ID = x['attacH_ID'];
        //         item.type = childType;
        //         file.childs.push(item);
        //         files.push(...(item.filE_ATTACHMENT || '').split('|'));
        //     })
        // }

        // this.attachFileService.moveTmpFile(files).subscribe(response => {
        //     this.attachFileService.cM_ATTACH_FILE_Ins(file).subscribe(response => {
        //     });
        // })
    }

    //updateFile(input: any, type: string, childs: any[], refIds, childType: string = undefined) {
    // let files = [];
    // let filesOld = [];
    // var master = new CM_ATTACH_FILE();
    // master.type = type;
    // master.filE_ATTACHMENT = input['filE_ATTACHMENT'];
    // master.filE_ATTACHMENT_OLD = input['filE_ATTACHMENT_OLD'];
    // master.attacH_ID = input['attacH_ID'];
    // files.push(...(master.filE_ATTACHMENT || '').split('|'));
    // filesOld.push(...(master.filE_ATTACHMENT_OLD || '').split('|'));

    // var file = new CM_ATTACH_FILE_INPUT();
    // file.attachFile = master;
    // file.childs = [];
    // file.ids = refIds;

    // if (childs) {
    //     childs.forEach(x => {
    //         var item = new CM_ATTACH_FILE();
    //         item.filE_ATTACHMENT = x['filE_ATTACHMENT'];
    //         item.filE_ATTACHMENT_OLD = x['filE_ATTACHMENT_OLD'];
    //         item.attacH_ID = x['attacH_ID'];
    //         item.type = childType;
    //         files.push(...(item.filE_ATTACHMENT || '').split('|'));
    //         filesOld.push(...(item.filE_ATTACHMENT_OLD || '').split('|'));
    //         file.childs.push(item);
    //     })
    // }

    // this.attachFileService.moveTmpFile(files).subscribe(response => {
    //     this.attachFileService.cM_ATTACH_FILE_Upd(file).subscribe(response => {
    //         input['filE_ATTACHMENT_OLD'] = input['filE_ATTACHMENT'];
    //         if (childs) {
    //             childs.forEach(c => {
    //                 c['filE_ATTACHMENT_OLD'] = c['filE_ATTACHMENT'];
    //             })
    //         }
    //     });

    //     // if (FileUploaderComponent.g) {
    //     //     this.attachFileService.delete_g_path(FileUploaderComponent.g).subscribe(response => {
    //     //         FileUploaderComponent.g = undefined;
    //     //     });
    //     // }
    // })
    //}


    addNewSuccess() {
        let routerKey = this.activeRoute['_routerState'].snapshot.url;
        routerKey = routerKey.substr(0, routerKey.indexOf('-add'))
        if (this.cacheRouteReuseStrategy.storedRouteHandles.get(routerKey)) {
            this.cacheRouteReuseStrategy.storedRouteHandles.get(routerKey)['componentRef'].instance['shouldResetTable'] = true;
        }
        this.showSuccessMessage(this.l('InsertSuccessful'));
        if (this['filterInput']) {
            this['filterInput'].totalCount = 0;
        }
    }

    updateSuccess() {
        let routerKey = this.activeRoute['_routerState'].snapshot.url;
        routerKey = routerKey.substr(0, routerKey.indexOf('-edit;'))
        if (this.cacheRouteReuseStrategy.storedRouteHandles.get(routerKey)) {
            this.cacheRouteReuseStrategy.storedRouteHandles.get(routerKey)['componentRef'].instance['shouldResetTable'] = true;
        }
        this.showSuccessMessage(this.l('UpdateSuccessful'));
    }

    approveSuccess() {
        this.showSuccessMessage(this.l('SuccessfullyApprove'));
        let routerKey = this.activeRoute['_routerState'].snapshot.url;
        routerKey = routerKey.substr(0, routerKey.indexOf('-view;'));
        if (this.cacheRouteReuseStrategy.storedRouteHandles.get(routerKey)) {
            this.cacheRouteReuseStrategy.storedRouteHandles.get(routerKey)['componentRef'].instance['shouldResetTable'] = true;
        }
        if (this['inputModel']) {
            this['inputModel'].autH_STATUS = AuthStatusConsts.Approve;
        }
        this.appToolbar.setButtonApproveEnable(false);
        this.updateView();
    }

    onChangeProperty(propertyName) {
        this['editForm'].controls[propertyName].setValue(this['inputModel'][propertyName]);
    }

    set saving(value: boolean) {
        this.appToolbar.setEnable(!value);
        this.updateView();
    }
}
