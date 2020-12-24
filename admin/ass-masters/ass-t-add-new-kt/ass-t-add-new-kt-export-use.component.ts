import { ViewEncapsulation, Component, AfterViewInit, Injector, Input, ChangeDetectionStrategy, ViewChild } from "@angular/core";
import { appModuleAnimation } from "@shared/animations/routerTransition";
import { ChangeDetectionComponent } from "@app/admin/core/ultils/change-detection.component";
import { ASS_ADDNEW_ENTITY, CM_BRANCH_ENTITY, CM_DEPARTMENT_ENTITY, CM_DIVISION_ENTITY, CM_EMPLOYEE_ENTITY } from "@shared/service-proxies/service-proxies";
import { BranchModalComponent } from "@app/admin/core/controls/branch-modal/branch-modal.component";
import { DivisionModalComponent } from "@app/admin/core/controls/division-modal/division-modal.component";
import { EmployeeModalComponent } from "@app/admin/core/controls/employee-modal/employee-modal.component";
import * as moment from 'moment';
import { NgForm } from "@angular/forms";

@Component({
    selector: 'ass-t-add-new-kt-export-use',
    templateUrl: './ass-t-add-new-kt-export-use.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    animations: [appModuleAnimation()]
})
export class AssTAddNewKTExportUseComponent extends ChangeDetectionComponent implements AfterViewInit {
    constructor(
        injector: Injector,
    ) {
        super(injector);
    }

    @ViewChild('branchModal') branchModal: BranchModalComponent;
    @ViewChild('divisionModal') divisionModal: DivisionModalComponent;
    @ViewChild('employeeModal') employeeModal: EmployeeModalComponent;

    editForm: NgForm;

    ngAfterViewInit(): void {
        this.isExportUse = this.inputModel.brancH_ID ? true : false;
        this.updateView();
    }

    _disableInput: boolean;

    @Input() set disableInput(value: boolean) {
        this._disableInput = value;
    }

    get disableInput(): boolean {
        return this._disableInput || !(!this.inputModel || this.isExportUse);
    }

    get hiddenDepartment(): boolean {
        return this.inputModel.brancH_TYPE != 'HS'
    }

    @Input() isShowError: boolean;
    @Input() inputModel: ASS_ADDNEW_ENTITY;

    isExportUse: boolean;

    onSelectBranch(branch: CM_BRANCH_ENTITY) {
        this.inputModel.brancH_CODE = branch.brancH_CODE;
        this.inputModel.brancH_NAME = branch.brancH_NAME;
        this.inputModel.brancH_ID = branch.brancH_ID;
        this.divisionModal.filterInput.brancH_ID = branch.brancH_ID;
        this.employeeModal.filterInput.brancH_ID = branch.brancH_ID;
        this.employeeModal.filterInput.pgd = branch.brancH_NAME;

        this.inputModel.diV_CODE = undefined;
        this.inputModel.divisioN_ID = undefined;
        this.inputModel.division = new CM_DIVISION_ENTITY();

        this.inputModel.emP_CODE = undefined;
        this.inputModel.emP_NAME = undefined;
        this.inputModel.emP_ID = undefined;

        this.inputModel.deP_CODE = undefined;
        this.inputModel.depT_ID = undefined;
        this.inputModel.deP_NAME = undefined;
        this.inputModel.brancH_TYPE = branch.brancH_TYPE;

        this.updateView();
    }

    onSelectDep(dep: CM_DEPARTMENT_ENTITY) {
        this.inputModel.deP_CODE = dep.deP_CODE;
        this.inputModel.deP_NAME = dep.deP_NAME;
        this.inputModel.depT_ID = dep.deP_ID;
    }

    onSelectDivision(division: CM_DIVISION_ENTITY) {
        this.inputModel.diV_CODE = division.diV_CODE;
        this.inputModel.divisioN_ID = division.diV_ID;
        this.inputModel.division = division;
    }

    onSelectEmployee(employee: CM_EMPLOYEE_ENTITY) {
        this.inputModel.emP_CODE = employee.emP_CODE;
        this.inputModel.emP_NAME = employee.emP_NAME;
        this.inputModel.emP_ID = employee.emP_ID;
    }

    exportUseChange() {
        if (!this.isExportUse) {
            this.inputModel.brancH_ID = undefined;
            this.inputModel.brancH_NAME = undefined;
            this.inputModel.brancH_CODE = undefined;
            this.inputModel.division = new CM_DIVISION_ENTITY();
            this.inputModel.emP_CODE = undefined;
            this.inputModel.emP_ID = undefined;
            this.inputModel.emP_NAME = undefined;
        }
        this.updateParentView();
    }

    onBranchChange(evt) {
        if (!evt.target.value) {
            this.inputModel.brancH_ID = undefined;
            this.inputModel.brancH_NAME = undefined;
            this.inputModel.brancH_CODE = undefined;
            this.updateView();
        }
    }

    onFocusoutDepCode(evt){
        if(!evt.target.value){
            this.inputModel.depT_ID = undefined;
            this.inputModel.deP_CODE = undefined;
            this.inputModel.deP_NAME = undefined;
            this.updateView();
        }
    }

    onDivisionChange(evt) {
        if (!evt.target.value) {
            this.inputModel.divisioN_ID = undefined;
            this.inputModel.diV_CODE = undefined;
            this.inputModel.division = new CM_DIVISION_ENTITY();
            this.updateView();
        }
    }

    onEmpChange(evt) {
        if (!evt.target.value) {
            this.inputModel.emP_ID = undefined;
            this.inputModel.emP_NAME = undefined;
            this.inputModel.emP_CODE = undefined;
            this.updateView();
        }
    }

    reloadAmortEndDate() {
        if (!this.inputModel.amorT_START_DATE) {
            this.inputModel.amorT_END_DATE = undefined;
            return;
        }
        this.inputModel.amorT_END_DATE = this.inputModel.amorT_START_DATE.clone().startOf('month').add(this.inputModel.amorT_MONTH, 'months').add(-1, 'days');
    }

    onSelectDepartment(item: CM_DEPARTMENT_ENTITY) {
        this.inputModel.deP_CODE = item.deP_CODE;
        this.inputModel.deP_NAME = item.deP_NAME;
        this.inputModel.depT_ID = item.deP_ID;
        this.updateView();
    }

    onAmortStartDateChange() {
        this.reloadAmortEndDate();
        this.updateView();
    }
}