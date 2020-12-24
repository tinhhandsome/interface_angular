export class ThemeHelper {
    public static getThemeColor(): string {
        let theme = abp.setting.get('App.UiManagement.Theme');
        if (theme === 'default') {
            return abp.setting.get(theme + '.' + 'App.UiManagement.ThemeColor');
        }

        return theme;
    }

    public static getTheme(): string {
        return abp.setting.get('App.UiManagement.Theme');
    }
}
