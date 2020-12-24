import { PL_CATEGORYTRADE_ENTITY, CategoryTradeServiceProxy } from "@shared/service-proxies/service-proxies";
import { Component, ViewEncapsulation, OnInit, Injector, AfterViewInit } from "@angular/core";
import { appModuleAnimation } from "@shared/animations/routerTransition";
import { ListComponentBase } from "@app/ultilities/list-component-base";
import { IUiAction } from "@app/ultilities/ui-action";
import { finalize } from "rxjs/operators";

@Component({
    templateUrl: './category-trade-list.component.html',
    encapsulation: ViewEncapsulation.None,
    animations: [appModuleAnimation()]
})

export class CategoryTradeListComponent extends ListComponentBase<PL_CATEGORYTRADE_ENTITY> implements IUiAction<PL_CATEGORYTRADE_ENTITY>, OnInit, AfterViewInit {
    filterInput: PL_CATEGORYTRADE_ENTITY = new PL_CATEGORYTRADE_ENTITY();
    constructor(injector: Injector,
        private categoryTradeService: CategoryTradeServiceProxy
    ) {
        super(injector);
        this.initFilter();
    }
    ngAfterViewInit(): void {
        this.updateView();
    }
    onDelete(item: PL_CATEGORYTRADE_ENTITY): void {
        this.message.confirm(
            this.l('DeleteWarningMessage', item.cgT_NAME),
            this.l('AreYouSure'),
            (isConfirmed) => {
                if (isConfirmed) {
                    this.saving = true;
                    this.categoryTradeService.pL_CATEGORYTRADE_Del(item.cgT_ID)
                        .pipe(finalize(() => { this.saving = false; }))
                        .subscribe((response) => {
                            if (response['Result'] != '0') {
                                this.showErrorMessage(response['ErrorDesc']);
                            }
                            else {
                                this.showSuccessMessage(this.l('SuccessfullyDeleted'));
                                this.filterInputSearch.totalCount = 0;
                                this.reloadPage();
                            }
                        });
                }
            }
        );
    }
    ngOnInit(): void {
        this.appToolbar.setUiAction(this);
        // set role toolbar
        this.appToolbar.setRole('CategoryTrade', true, true, false, true, true, true, false, true);
        this.appToolbar.setEnableForListPage();
    }
    search(): void {
        this.showTableLoading();
        this.setSortingForFilterModel(this.filterInputSearch);
        this.categoryTradeService.pL_CATEGORYTRADE_Search(this.filterInputSearch)
            .pipe(finalize(() => this.hideTableLoading()))
            .subscribe(result => {
                this.dataTable.records = result.items;
                this.dataTable.totalRecordsCount = result.totalCount;
                this.filterInputSearch.totalCount = result.totalCount;
                this.appToolbar.setEnableForListPage();
                this.updateView();
            });
    }
    onAdd(): void {
        this.navigatePassParam('/app/admin/categorytrade-add', null, { filterInput: JSON.stringify(this.filterInputSearch) });
    }
    onUpdate(item: PL_CATEGORYTRADE_ENTITY): void {
        this.navigatePassParam('/app/admin/categorytrade-edit', { id: item.cgT_ID },null);
    }
    onApprove(item: PL_CATEGORYTRADE_ENTITY): void {
    }
    onSave(): void {
    }
    onResetSearch(): void {
    }
    onViewDetail(item: PL_CATEGORYTRADE_ENTITY): void {
        this.navigatePassParam('/app/admin/categorytrade-view', { id: item.cgT_ID }, { filterInput: JSON.stringify(this.filterInputSearch) });
    }

}