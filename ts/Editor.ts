import {Theme} from './Theme';
import {PropertiesHyphen} from 'csstype';
import {CssInjector} from './CssInjector';
import {Formatter} from './Formatter';
import {htmlElementFromString} from './HtmlGeneration';

/**
 * Abstraction of the editor as a collection of
 * container, formatter, settings and themes
 */
export class Editor {
  // The container for the menu and the editor
  private container: HTMLElement = document.createElement('div');

  // The actual editor which holds the text content
  private editor: HTMLElement = document.createElement('div');

  // The menu next to the editor
  private menu: HTMLElement = document.createElement('div');

  // The Id of the original element which is used as a prefix
  // for the Ids of the container, menu and editor
  private idPrefix: string;

  /**
   * @param {string} containerId HTML element id which
   * will become an ediable div
   * @param {Formatter} formatter Formatter
   * which determines how the content is stylized
   * @param {Theme} theme Collection of theme objects
   */
  constructor(
      containerId: string,
      private formatter: Formatter,
      private theme: Theme,
  ) {
    this.idPrefix = containerId;
    this.initializeContainer(this.idPrefix);
    this.applyTheme();
    this.formatter.init(this.editor); // TODO uncomment
  }

  /** Set the content of the editor
   * @param {string} content
   */
  setContent(content: string): void {
    this.formatter.setContent(content);
  }

  /** Get the content of the editor as text
   * @return {string}
   */
  getContent(): string {
    return this.formatter.getContent();
  }

  /**
   * Inject the Css classes/IDs into the HTML so the formatter can
   * use them when stylizing the content
   */
  private injectAdditionalCssRules(): void {
    if (this.theme.additionalCssRules) {
      Object.entries(this.theme.additionalCssRules.rules).forEach(
          ([identifier, properties]) => {
            CssInjector.injectCss(identifier, properties);
          },
      );
    }
  }

  /** Inject the scrollbar classes into the HTML
   */
  private injectScrollbarTheme(): void {
    if (this.theme.scrollbarTheme) {
      Object.entries(this.theme.scrollbarTheme).forEach(
          ([identifier, properties]) => {
            const cssIdentifier = '#' + this.getEditorId() + '::' + identifier;
            CssInjector.injectCss(cssIdentifier, properties);
          },
      );
    }
  }

  /** Initialize the container Id
   */
  private createContainerId(): void {
    this.container.id = this.idPrefix;
    this.container.id = this.getContainerId();
  }

  /**
   * Create the container
   * @param {string} futureContainerId Id of the html element
   * to convert to container for the editor
   */
  private createContainer(futureContainerId: string): void {
    const futureContainer = document.getElementById(futureContainerId);
    if (!futureContainer) {
      throw new Error('Cannot find element with id ' + futureContainerId);
    }

    const futureContainerParent = futureContainer.parentElement;
    if (!futureContainerParent) {
      throw new Error(
          'Cannot find parent of element with id ' + futureContainerId,
      );
    }

    this.createContainerId();

    futureContainerParent.replaceChild(this.container, futureContainer);
  }

  /**
   * Create the menu and add it to the container
   */
  private createMenu(): void {
    this.createMenuBase();
    this.createMenuSettingsItems();
  }

  /**
   * Create the menu div and add the open/close button
   */
  private createMenuBase(): void {
    this.container.appendChild(this.menu);
    this.menu.id = this.getMenuId();

    // Add settings button
    const settingsSvg = htmlElementFromString(`
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
    settingsSvg.addEventListener('click', (event: MouseEvent) => {
      this.settingsClick(event, this.menu);
    });
  }

  /**
   * Create the settings elements in the HTML
   */
  private createMenuSettingsItems(): void {
    const settingsContainer = document.createElement('div');
    this.menu.appendChild(settingsContainer);
    settingsContainer.style.display = 'none';
    settingsContainer.style.flexDirection = 'column';
    this.formatter
        .getSettings()
        .forEach((element) => settingsContainer.appendChild(element));
  }

  /**
   * Create the editor element and add it to the container
   */
  private createEditor(): void {
    this.container.appendChild(this.editor);
    this.editor.id = this.getEditorId();
    this.editor.contentEditable = 'true';
  }

  /**
   * Create the editor content container as an editable div
   * @param {string} futureContainerId Id of html element
   * to convert to container for the editor
   */
  private initializeContainer(futureContainerId: string): void {
    this.createContainer(futureContainerId);
    this.createMenu();
    this.createEditor();
  }

  /**
   * Event handler function for settings clicking
   * @param {MouseEvent} event click on a setting
   * @param {HTMLElement} menu the menu container as html element
   */
  private settingsClick(event: MouseEvent, menu: HTMLElement): void {
    const target = event.currentTarget as Element;
    if (target.parentElement) {
      // Switch arrow direction
      const svgs = target.children;
      for (const svg of svgs) {
        if (svg.hasAttribute('display')) {
          svg.removeAttribute('display');
        } else {
          svg.setAttribute('display', 'none');
        }
      }

      // Resize menu
      if (target.parentElement.style.width === '') {
        target.parentElement.style.width = '250px';
        (menu.children[1] as HTMLElement).style.display = 'flex';
      } else {
        target.parentElement.style.width = '';
        (menu.children[1] as HTMLElement).style.display = 'none';
      }
    }
  }

  /**
   * Change the editor theme by changint its style property
   */
  private applyTheme(): void {
    this.injectContainerTheme();
    this.injectMenuCss();
    this.injectEditorCss();
    this.injectScrollbarTheme();
    this.injectAdditionalCssRules();
  }

  /**
   * Inject editor Css class into the HTML
   */
  private injectEditorCss(): void {
    CssInjector.injectCss(
        this.getEditorIdentifier(),
        this.getEditorBaseCssProperties(),
    );
  }

  /**
   * Inject menu CSS class into the HTML
   */
  private injectMenuCss(): void {
    CssInjector.injectCss(
        this.getMenuIdentifier(),
        this.getMenuBaseCssProperties(),
    );
  }

  /**
   * Inject container CSS class into the HTML
   */
  private injectContainerTheme(): void {
    const containerCss = this.getContainerCssProperties();
    CssInjector.injectCss(this.getContainerIdentifier(), containerCss);
  }

  /**
   * @return {PropertiesHyphen} The combined hardcoded container CSS
   * with the container css provided in the Theme
   */
  private getContainerCssProperties(): PropertiesHyphen {
    if (this.theme.editorTheme) {
      return {
        ...this.getContainerBaseCssProperties(),
        ...this.theme.editorTheme,
      };
    }
    return this.getContainerBaseCssProperties();
  }

  /**
   * Hardcoded CSS for the Container
   * @return {PropertiesHyphen}
   */
  private getContainerBaseCssProperties(): PropertiesHyphen {
    return {
      'cursor': 'default',
      'display': 'flex',
      'flex-direction': 'row',
      'resize': 'both',
      'overflow': 'auto',
    };
  }

  /**
   * Hardcoded Css for the menu
   * @return {PropertiesHyphen}
   */
  private getMenuBaseCssProperties(): PropertiesHyphen {
    return {
      'border-right': '1px solid rgb(83, 79, 86)',
      'margin': '20px 0px 20px 0px',
      'padding': '15px 20px 15px 20px',
      'display': 'flex',
      'flex-direction': 'column',
    };
  }

  /**
   * Hardcoded Css for the editor
   * @return {PropertiesHyphen}
   */
  private getEditorBaseCssProperties(): PropertiesHyphen {
    return {
      'flex': '1',
      'outline': 'none',
      'overflow': 'auto',
      'scrollbar-color': 'red',
      'padding': '20px 30px 20px 30px',
      'margin': '10px 10px 10px 10px',
    };
  }

  /**
   * @return {string} Main container Id prepended with #
   */
  private getContainerIdentifier(): string {
    return '#' + this.getContainerId();
  }

  /**
   * @return {string} Menu Id prepended with #
   */
  private getMenuIdentifier(): string {
    return '#' + this.getMenuId();
  }

  /**
   * @return {string} Editor Id prepended with #
   */
  private getEditorIdentifier(): string {
    return '#' + this.getEditorId();
  }

  /**
   * @return {string} Id of the whole container
   */
  private getContainerId(): string {
    return this.idPrefix + '-container';
  }

  /**
   * @return {string} Id of the menu window
   */
  private getMenuId(): string {
    return this.idPrefix + '-menu';
  }

  /**
   * @return {string} Id of the editor window
   */
  private getEditorId(): string {
    return this.idPrefix + '-editor';
  }
}
