import { Component, Input, OnInit, Injector, ViewEncapsulation, Output, ViewChild } from "@angular/core";
import { createCustomInputControlValueAccessor, ControlComponent } from "@app/admin/core/controls/control.component";
import { LocationServiceProxy, CM_DISTRICT, CM_WARD, CM_NATION, CM_PROVINCE, CM_LOCATION_ENTITY } from "@shared/service-proxies/service-proxies";
import { Select2CustomComponent } from "../custom-select2/select2-custom.component";


declare var $: JQueryStatic;

@Component({
    selector: "location-control",
    templateUrl: "./location-control.component.html",
    encapsulation: ViewEncapsulation.None,
    providers: [createCustomInputControlValueAccessor(LocationControlComponent)]
})

export class LocationControlComponent extends ControlComponent implements OnInit {
    constructor(injector: Injector,
        private locationService: LocationServiceProxy) {
        super(injector);
    }

    location: CM_LOCATION_ENTITY = new CM_LOCATION_ENTITY();

    nations: CM_NATION[];
    provinces: CM_PROVINCE[];
    districts: CM_DISTRICT[];
    wards: CM_WARD[];

    district: string;
    ward: string;
    nation: string;
    province: string;

    @ViewChild('nationControl') nationControl : Select2CustomComponent;
    @ViewChild('provinceControl') provinceControl : Select2CustomComponent;
    @ViewChild('districtControl') districtControl : Select2CustomComponent;
    @ViewChild('wardControl') wardControl : Select2CustomComponent;

    @Input() disabled: boolean;

    _ngModel: string;


    afterViewInit() {
        // COMMENT: this.stopAutoUpdateView();
    }

    ngOnInit(): void {
        this.locationService.cM_LOCATION_AllData().subscribe(response => {
            this.location = response;
            this.nations = this.location.natioNs;

            this.location.warDs.forEach(w => {
                let district = this.location.districTs.firstOrDefault(x => x.diS_ID == w.diS_ID, {});

                let province = this.location.provincEs.firstOrDefault(x => x.prO_ID == district.prO_ID, {});

                w['prO_ID'] = province.prO_ID;
                w['naT_ID'] = province.naT_ID;
            });

            this.location.districTs.forEach(d => {
                let province = this.location.provincEs.firstOrDefault(x => x.prO_ID == d.prO_ID, {});
                d['naT_ID'] = province.naT_ID;
            })

            if (this.ngModel) {
                this.setValueLocation(this.ngModel);
            }
            this.updateView();
        })
    }

    public get ngModel(): any {
        return this._ngModel;
    }

    @Input() @Output() public set ngModel(value) {
        if (this.location.natioNs) {
            this.setValueLocation(value);
        }
        else {
            this._ngModel = value;
        }
    }

    getFirstOrDefault(list: any[], defaultValue = undefined) {
        if (list.length == 0) {
            return defaultValue;
        }
        return list[0];
    }

    setValueLocation(value) {
        if (!value) {
            return;
        }

        let location = this.location.warDs.firstOrDefault(w => w.waR_ID == value)
            || this.location.districTs.firstOrDefault(w => w.diS_ID == value)
            || this.location.provincEs.firstOrDefault(p => p.prO_ID == value)
            || this.location.natioNs.firstOrDefault(n => n.naT_ID == value);

        if (location['naT_ID']) {
            this.nation = location['naT_ID'];
            this.updateView();
        }
        if (location['prO_ID']) {
            this.province = location['prO_ID'];
            this.updateView();
        }
        if (location['diS_ID']) {
            this.district = location['diS_ID'];
            this.updateView();
        }
        if (location['waR_ID']) {
            this.ward = location['waR_ID'];
            this.updateView();
        }
    }

    setNgModel(value) {
        this._ngModel = value;
        this.sendValueOut(value);
        this.updateView();
    }

    onChangeNation(nation: CM_NATION) {
        if (!nation) {
            return;
        }
        this.provinces = this.location.provincEs.filter(x => x.naT_ID == nation.naT_ID);
        this.districts = [];
        this.wards = [];

        this.setNgModel(nation.naT_ID);

        this.provinceControl.ngModel = '';
        this.districtControl.ngModel = '';
        this.wardControl.ngModel = '';
    }

    onChangeProvince(province: CM_PROVINCE) {
        if (!province) {
            return;
        }
        this.districts = this.location.districTs.filter(x => x.prO_ID == province.prO_ID);
        this.wards = [];
        this.setNgModel(province.prO_ID);
        this.districtControl.ngModel = '';
        this.wardControl.ngModel = '';
    }

    onChangeDistrict(district: CM_DISTRICT) {
        if (!district) {
            return;
        }
        this.wards = this.location.warDs.filter(x => x.diS_ID == district.diS_ID);
        this.setNgModel(district.diS_ID);
        this.wardControl.ngModel = '';
    }

    onChangeWards(ward: CM_WARD) {
        if (!ward) {
            return;
        }
        this.setNgModel(ward.waR_ID);
    }
}