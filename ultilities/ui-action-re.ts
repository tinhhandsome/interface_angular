import { IUiAction } from "./ui-action";

export interface IUiActionRejectExt<TList> extends IUiAction<TList>
{
    onReject(item : TList) : void;
}