
export class AppRoleItem {
    name = '';
    displayName = '';
    items: AppRoleItem[];
    parentId :string;
    parent: AppRoleItem;
    checked: boolean = false;
    isDisplay: boolean= true;
    isRootAction: boolean = false;
    isLeaf: boolean = false;
    description:string ='';
    isGrantedByDefault!: boolean | undefined;

    constructor(name: string, displayName: string, items?: AppRoleItem[]) {
        this.name = name;
        this.displayName = displayName;
        this.items = items;
    }
}
