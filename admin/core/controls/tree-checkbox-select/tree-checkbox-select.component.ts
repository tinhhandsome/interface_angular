import { Component, Injector, ViewChild, EventEmitter, Input, Output } from '@angular/core';
import { AppComponentBase } from '@shared/common/app-component-base';
import { ArrayToTreeConverterService } from '@shared/utils/array-to-tree-converter.service';
import { TreeDataHelperService } from '@shared/utils/tree-data-helper.service';
import { FlatPermissionDto } from '@shared/service-proxies/service-proxies';
import { TreeNode } from 'primeng/api';
import * as _ from 'lodash';
import { ModalDirective } from 'ngx-bootstrap';
import { PermissionTreeEditModel } from '@app/admin/zero-base/shared/permission-tree-edit.model';

@Component({
    selector: 'app-tree-checkbox',
    templateUrl: './tree-checkbox-select.component.html'
})

export class TreeCheckboxSelectComponent extends AppComponentBase {

    @ViewChild('treeModal') modal: ModalDirective;

    @Output() modalSelect: EventEmitter<any> = new EventEmitter<any>();;

    set editData(val: PermissionTreeEditModel) {
        this.setTreeData(val.permissions);
        this.setSelectedNodes(val.grantedPermissionNames);
    }

    treeData: any;
    selectedPermissions: TreeNode[] = [];
    filter = '';

    active = false;

    constructor(
        private _arrayToTreeConverterService: ArrayToTreeConverterService,
        private _treeDataHelperService: TreeDataHelperService,
        injector: Injector
    ) {
        super(injector);
    }

    setTreeData(permissions: FlatPermissionDto[]) {
        this.treeData = this._arrayToTreeConverterService.createTree(permissions, 'parentName', 'name', null, 'children',
            [{
                target: 'label',
                source: 'displayName'
            }, {
                target: 'expandedIcon',
                value: 'fa fa-folder-open m--font-warning'
            },
            {
                target: 'collapsedIcon',
                value: 'fa fa-folder m--font-warning'
            },
            {
                target: 'expanded',
                value: true
            }]);
    }

    show() {
        this.active = true;
        this.modal.show();
    }

    close() {
        this.modal.hide();
        this.active = false;
    }

    setSelectedNodes(grantedPermissionNames: string[]) {

    }

    getGrantedPermissionNames(): string[] {
        if (!this.selectedPermissions || !this.selectedPermissions.length) {
            return [];
        }

        let permissionNames = [];

        for (let i = 0; i < this.selectedPermissions.length; i++) {
            permissionNames.push(this.selectedPermissions[i].data.name);
        }

        return permissionNames;
    }

    nodeSelect(event) {

    }

    filterPermissions(event): void {
        this.filterPermission(this.treeData, this.filter);
    }

    onSelectNode($event) {
        this.close();
        this.modalSelect.emit($event.node.data.name);
    }

    filterPermission(nodes, filterText): any {
        _.forEach(nodes, node => {
            if (node.data.displayName.toLowerCase().indexOf(filterText.toLowerCase()) >= 0) {
                node.styleClass =
                    this.showParentNodes(node);
            } else {
                node.styleClass = 'hidden-tree-node';
            }

            if (node.children) {
                this.filterPermission(node.children, filterText);
            }
        });
    }

    showParentNodes(node): void {
        if (!node.parent) {
            return;
        }

        node.parent.styleClass = '';
        this.showParentNodes(node.parent);
    }
}
