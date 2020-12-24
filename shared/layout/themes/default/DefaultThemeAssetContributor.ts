import { IThemeAssetContributor } from '../ThemeAssetContributor';

export class DefaultThemeAssetContributor implements IThemeAssetContributor {
    getAssetUrls(): string[] {
        return [''];
    }
}
