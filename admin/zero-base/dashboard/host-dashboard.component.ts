import { AfterViewInit, Component, Injector, ViewEncapsulation, ViewChild } from '@angular/core';
import { appModuleAnimation } from '@shared/animations/routerTransition';
import { AppComponentBase } from '@shared/common/app-component-base';
import { TenantDashboardServiceProxy, SalesSummaryDatePeriod, AssDashboardServiceProxy, ChartCustomColor, SCHEDULE_REPARE_Result, SCHEDULE_REPARE_COUNT_Result, CM_BRANCH_ENTITY, AssMasterServiceProxy } from '@shared/service-proxies/service-proxies';
import { curveBasis } from 'd3-shape';

import * as _ from 'lodash';
// import { AppPieChartComponent } from './app-pie-charts.component';
// import { AppStackVerticalChartComponent } from './app-stack-vertical-charts.component';
import { ChartType } from 'chart.js';
import { ListComponentBase } from '@app/ultilities/list-component-base';
import { finalize } from 'rxjs/operators';
import { PrimengTableHelper } from '@shared/helpers/PrimengTableHelper';
import { MaintainanceStatisticPopupComponent } from './maintainance-statistic-popup.component';

enum ReportType {
    Week,
    Month,
    NextWeek
}

@Component({
    templateUrl: './host-dashboard.component.html',
    styleUrls: ['./host-dashboard.component.less'],
    encapsulation: ViewEncapsulation.None,
    animations: [appModuleAnimation()]
})
export class HostDashboardComponent extends ListComponentBase<SCHEDULE_REPARE_Result> implements AfterViewInit {

    // @ViewChild("assTypeChart") assTypeChart: AppPieChartComponent;
    // @ViewChild("stackVerticalChart") stackVerticalChart: AppStackVerticalChartComponent;

    customColors: ChartCustomColor[];


    @ViewChild("maintainanceModal") maintainanceModal: MaintainanceStatisticPopupComponent;

    scheduleCount: SCHEDULE_REPARE_COUNT_Result = new SCHEDULE_REPARE_COUNT_Result();

    primengTableHelperAssetNormal: PrimengTableHelper;
    primengTableHelperAssetDamage: PrimengTableHelper;

    ReportType = ReportType;

    reportType: ReportType;

    constructor(
        injector: Injector,
        private assDashboardService: AssDashboardServiceProxy,
        private assMasterService: AssMasterServiceProxy
    ) {
        super(injector);
        this.reportType = ReportType.Week;

        this.primengTableHelperAssetNormal = new PrimengTableHelper();
        this.primengTableHelperAssetDamage = new PrimengTableHelper();

        // setInterval(() => {
        //     this.assDashboardService.shouldReload().subscribe(response => {
        //         if (response) {
        //             this.initStackVerticalChart();
        //             this.initAssTypeChart();
        //             switch (this.reportType) {
        //                 case ReportType.Week:
        //                     this.weekStatistic();
        //                     break;
        //                 case ReportType.Month:
        //                     this.monthStatistic();
        //                     break;
        //                 case ReportType.NextWeek:
        //                     this.nextWeekStatistic();
        //                     break;
        //             }
        //             this.notify.success('Tài sản được cập nhật');
        //             this.assDashboardService.setShouldReload('0').subscribe(x => {
        //             });
        //         }
        //     })
        // }, 1000)
    }

    reloadAssetNormal() {
        // this.assMasterService.getAllAssMastersNormal()
        //     .pipe(finalize(() => this.hideTableLoading())).subscribe(result => {
        //         this.primengTableHelperAssetNormal.records = result;
        //     });

        // this.assMasterService.getAllAssMastersDamage()
        //     .pipe(finalize(() => this.hideTableLoading())).subscribe(result => {
        //         this.primengTableHelperAssetDamage.records = result;
        //     });
    }

    reloadAssetDamage() {

    }


    reloadStatistic() {

    }

    ngAfterViewInit(): void {
        this.getDashboardStatisticsData();
        this.assDashboardService.getScheduleRepareCount().subscribe(response => {
            this.scheduleCount = response;
            this.maintainanceModal.init(response.week, response.nexT_WEEK, response.month);
            this.maintainanceModal.show();
            this.weekStatistic();
        })
    }

    initAssTypeChart() {
        this.assDashboardService.getAssStatistic().subscribe(response => {
            // this.assTypeChart.setModels(response);
        });
    }

    initStackVerticalChart() {
        // this.stackVerticalChart.enableLoading();
        this.assDashboardService.getStackVerticalChartSeries().subscribe(response => {
            // this.stackVerticalChart.setModels(response, this.customColors);
            // this.stackVerticalChart.disableLoading();
        });
    }

    weekStatistic() {
        this.reportType = ReportType.Week;

        this.showTableLoading();

        this.assDashboardService.getScheduleRepareWeek()
            .pipe(finalize(() => this.hideTableLoading())).subscribe(result => {
                // this.primengTableHelper.records = result;
                this.hideTableLoading();
            });
    }
    monthStatistic() {
        this.reportType = ReportType.Month;

        this.showTableLoading();

        this.assDashboardService.getScheduleRepareMonth()
            .pipe(finalize(() => this.hideTableLoading())).subscribe(result => {
                // this.primengTableHelper.records = result;
                this.hideTableLoading();
            });
    }
    nextWeekStatistic() {
        this.reportType = ReportType.NextWeek;

        this.showTableLoading();

        this.assDashboardService.getScheduleRepareNextWeek()
            .pipe(finalize(() => this.hideTableLoading())).subscribe(result => {
                // this.primengTableHelper.records = result;
                this.hideTableLoading();
            });
    }


    getDashboardStatisticsData(): void {
        this.initAssTypeChart();

        this.assDashboardService.getChartColors().subscribe(colors => {
            this.customColors = colors;
            this.initStackVerticalChart();
        });
    }


}
