import { AppConsts } from "@shared/AppConsts";
import { EditableTableComponent } from "./editable-table.component";

export class EditTableState {
    localizationSourceName = AppConsts.localization.defaultLocalizationSourceName;
    predefinedRecordsCountPerPage = JSON.parse(abp.setting.get("gAMSProCore.PredefinedRecordsCountPerPage"));
    defaultRecordsCountPerPage = abp.setting.getInt("gAMSProCore.DefaultRecordsCountPerPage");
    isResponsive = abp.setting.getBoolean("gAMSProCore.IsResponsive");
    resizableColumns = abp.setting.getBoolean("gAMSProCore.ResizableColumns");
    totalRecordsCount: number;

    editTables: EditableTableComponent<any>[] = [];

    currentPage: number;
    isCheckAll = false;
    currentItem: any = (<any>{});

    reloadPageOnInit = false;

    isInitRequiredField = false;


    showErrorOnPage: boolean = false;

    allData: any[] = [];
    pageData: any[] = [];

}