export class CssHelper {
    constructor() {
        CssHelper.styleElement = document.createElement('style');
        CssHelper.styleElement.type = 'text/css';
        document
            .getElementsByTagName('head')[0]
            .appendChild(CssHelper.styleElement);
    }
    static injectCss(identifier, properties) {
        const cssTextPropertoes = CssHelper.stringifyCSSProperties(properties);
        CssHelper.styleElement.innerHTML +=
            `${identifier} { ${cssTextPropertoes} } \n`;
    }
    static stringifyCSSProperties(property) {
        let cssString = '';
        Object.entries(property).forEach(([key, value]) => {
            if (value !== '') {
                cssString += `${key}: ${value}; `;
            }
        });
        return cssString;
    }
}
CssHelper.instance = new CssHelper();
