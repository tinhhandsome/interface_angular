import { ViewEncapsulation, Component, AfterViewInit, Injector, Input, ViewChild, ChangeDetectionStrategy, Output, EventEmitter } from "@angular/core";
import { appModuleAnimation } from "@shared/animations/routerTransition";
import { ChangeDetectionComponent } from "@app/admin/core/ultils/change-detection.component";
import { ASS_ADDNEW_PO_ENTITY, TR_PO_MASTER_ENTITY, TR_PO_DETAIL_ENTITY, ASS_ADDNEW_GOODS_ENTITY } from "@shared/service-proxies/service-proxies";
import { EditableTableComponent } from "@app/admin/core/controls/editable-table/editable-table.component";
import { stringify } from "@angular/compiler/src/util";
import { DepartmentModalComponent } from "@app/admin/core/controls/dep-modal/department-modal.component";
import { TrPoGoodsModalComponent } from "@app/admin/core/controls/tr-po-goods-modal/tr-po-goods-modal.component";

@Component({
    selector: 'ass-t-add-new-kt-table-edit-po',
    templateUrl: './ass-t-add-new-kt-table-edit-po.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    animations: [appModuleAnimation()]
})
export class AssTAddNewKTTableEditPoComponent extends ChangeDetectionComponent implements AfterViewInit {
    constructor(
        injector: Injector,
    ) {
        super(injector);
        
    }

    ngAfterViewInit(): void {
        this.updateView();
    }

    @Input() disableInput: boolean;
    @Input() isShowError: boolean;

    @Output() onSelectGood : EventEmitter<any> = new EventEmitter<any>();

    @Input() set poList(value: ASS_ADDNEW_PO_ENTITY[]) {
        this.editTablePo.setList(value);
    }

    get poList(): ASS_ADDNEW_PO_ENTITY[] {
        return this.editTablePo.allData;
    }

    get poIds(): string {
        return this.editTablePo.allData.map(x => x.pO_ID).join(';');
    }

    @ViewChild('editTablePo') editTablePo: EditableTableComponent<ASS_ADDNEW_PO_ENTITY>
    @ViewChild('editablePoGoods') editablePoGoods: EditableTableComponent<ASS_ADDNEW_GOODS_ENTITY>


    onSelectPo(poList: TR_PO_MASTER_ENTITY[]) {
        var list = this.editTablePo.allData;

        poList.forEach(po => {
            if (!list.find(x => x.pO_ID == po.pO_ID)) {
                var item = new ASS_ADDNEW_PO_ENTITY();
                Object.assign(item, po);
                item['isChecked'] = false;
                item['editableIsSelected'] = false;
                this.editTablePo.pushItem(item);
            }
        });
    }

    removePo() {

        let allGoods = this.editablePoGoods.allData;

        let selectedPos = this.editTablePo.getAllCheckedItem();

        let selectedGoods: ASS_ADDNEW_GOODS_ENTITY[] = [];

        selectedPos.forEach(po => {
            selectedGoods.push(...allGoods.filter(good => good.pO_ID === po.pO_ID));
        });

        // xoa tat ca hang hoa trong po duoc chon de xoa
        this.editablePoGoods.allData = this.editablePoGoods.allData.filter(good => selectedGoods.indexOf(good) == -1);

        this.editTablePo.removeAllCheckedItem();
        this.editablePoGoods.resetNoAndPage();
        this.editablePoGoods.changePage(0);
    }

    onSelectGoodsPo(goods: TR_PO_DETAIL_ENTITY[]) {
        goods.forEach(gd => {
            var item = new ASS_ADDNEW_GOODS_ENTITY();
            Object.assign(item, gd);
            item['isChecked'] = false;
            item['editableIsSelected'] = false;
            this.editablePoGoods.pushItem(item);
        });
        this.editablePoGoods.changePage(0);
    }

}