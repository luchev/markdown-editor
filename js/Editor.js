import { CssHelper } from './CssHelper';
import { DOMHelper } from './DOMHelper';
export class Editor {
    constructor(containerId, formatter, theme) {
        this.formatter = formatter;
        this.theme = theme;
        this.container = document.createElement('div');
        this.editor = document.createElement('div');
        this.menu = document.createElement('div');
        this.idPrefix = containerId;
        this.initializeContainer(this.idPrefix);
        this.applyTheme();
        this.formatter.init(this.editor);
    }
    injectAdditionalCssRules() {
        if (this.theme.additionalCssRules) {
            Object.entries(this.theme.additionalCssRules).forEach(([identifier, properties]) => {
                CssHelper.injectCss(identifier, properties);
            });
        }
    }
    injectScrollbarTheme() {
        if (this.theme.scrollbarTheme) {
            Object.entries(this.theme.scrollbarTheme).forEach(([identifier, properties]) => {
                CssHelper.injectCss('#' + this.getEditorId() + '::' + identifier, properties);
            });
        }
    }
    createContainerId() {
        this.container.id = this.idPrefix;
        this.container.id = this.getContainerId();
    }
    createContainer(futureContainerId) {
        const futureContainer = document.getElementById(futureContainerId);
        if (!futureContainer) {
            throw new Error('Cannot find element with id ' + futureContainerId);
        }
        const futureContainerParent = futureContainer.parentElement;
        if (!futureContainerParent) {
            throw new Error('Cannot find parent of element with id ' + futureContainerId);
        }
        this.createContainerId();
        futureContainerParent.replaceChild(this.container, futureContainer);
    }
    createMenu() {
        this.createMenuBase();
        this.createMenuSettingsItems();
    }
    createMenuBase() {
        this.container.appendChild(this.menu);
        this.menu.id = this.getMenuId();
        const settingsSvg = DOMHelper.htmlElementFromString(`
        <div style='display: flex; justify-content: flex-end;'>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" stroke-width="2"
          stroke-linecap="round" stroke-linejoin="round">
              <polyline points="9 18 15 12 9 6" />
          </svg>
          <svg display='none' width="24" height="24" viewBox="0 0 24 24"
          fill="none" stroke="currentColor" stroke-width="2"
          stroke-linecap="round" stroke-linejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </div>`);
        this.menu.appendChild(settingsSvg);
        settingsSvg.addEventListener('click', (event) => {
            this.settingsClick(event, this.menu);
        });
    }
    createMenuSettingsItems() {
        const settingsContainer = document.createElement('div');
        this.menu.appendChild(settingsContainer);
        settingsContainer.style.display = 'none';
        settingsContainer.style.flexDirection = 'column';
        this.formatter
            .getSettings()
            .forEach((element) => settingsContainer.appendChild(element));
    }
    createEditor() {
        this.container.appendChild(this.editor);
        this.editor.id = this.getEditorId();
        this.editor.contentEditable = 'true';
    }
    initializeContainer(futureContainerId) {
        this.createContainer(futureContainerId);
        this.createMenu();
        this.createEditor();
    }
    settingsClick(event, menu) {
        const target = event.currentTarget;
        if (target.parentElement) {
            const svgs = target.children;
            for (const svg of svgs) {
                if (svg.hasAttribute('display')) {
                    svg.removeAttribute('display');
                }
                else {
                    svg.setAttribute('display', 'none');
                }
            }
            if (target.parentElement.style.width === '') {
                target.parentElement.style.width = '250px';
                menu.children[1].style.display = 'flex';
            }
            else {
                target.parentElement.style.width = '';
                menu.children[1].style.display = 'none';
            }
        }
    }
    applyTheme() {
        this.injectContainerTheme();
        this.injectMenuCss();
        this.injectEditorCss();
        this.injectScrollbarTheme();
        this.injectAdditionalCssRules();
    }
    injectEditorCss() {
        CssHelper.injectCss(this.getEditorIdentifier(), this.getEditorBaseCssProperties());
    }
    injectMenuCss() {
        CssHelper.injectCss(this.getMenuIdentifier(), this.getMenuBaseCssProperties());
    }
    injectContainerTheme() {
        const containerCss = this.getContainerCssProperties();
        CssHelper.injectCss(this.getContainerIdentifier(), containerCss);
    }
    getContainerCssProperties() {
        if (this.theme.editorTheme) {
            return {
                ...this.getContainerBaseCssProperties(),
                ...this.theme.editorTheme,
            };
        }
        return this.getContainerBaseCssProperties();
    }
    getContainerBaseCssProperties() {
        return {
            'cursor': 'default',
            'display': 'flex',
            'flex-direction': 'row',
            'resize': 'both',
            'overflow': 'auto',
        };
    }
    getMenuBaseCssProperties() {
        return {
            'border-right': '1px solid rgb(83, 79, 86)',
            'margin': '20px 0px 20px 0px',
            'padding': '15px 20px 15px 20px',
            'display': 'flex',
            'flex-direction': 'column',
        };
    }
    getEditorBaseCssProperties() {
        return {
            'flex': '1',
            'outline': 'none',
            'overflow': 'auto',
            'scrollbar-color': 'red',
            'padding': '20px 30px 20px 30px',
            'margin': '10px 10px 10px 10px',
        };
    }
    getContainerIdentifier() {
        return '#' + this.getContainerId();
    }
    getMenuIdentifier() {
        return '#' + this.getMenuId();
    }
    getEditorIdentifier() {
        return '#' + this.getEditorId();
    }
    getContainerId() {
        return this.idPrefix + '-container';
    }
    getMenuId() {
        return this.idPrefix + '-menu';
    }
    getEditorId() {
        return this.idPrefix + '-editor';
    }
}
