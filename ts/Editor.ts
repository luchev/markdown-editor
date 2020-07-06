import {Theme} from './Theme';
import {PropertiesHyphen} from 'csstype';
import {CssInjector} from './CssInjector';
import {Formatter} from './Formatter';
import {htmlElementFromString} from './HtmlGeneration';

/**
 * Abstraction of the editor as a collection of
 * wrapper, formatter, settings and themes
 */
export class Editor {
  // The wrapper for the menu and the editor
  private wrapper: HTMLElement = document.createElement('div');

  // The actual editor which holds the text content
  private editor: HTMLElement = document.createElement('div');

  // The menu next to the editor
  private menu: HTMLElement = document.createElement('div');

  // The Id of the original element which is used as a prefix
  // for the Ids of the wrapper, menu and editor
  private idPrefix: string;

  /**
   * @param {string} wrapperId HTML element id which
   * will become an ediable div
   * @param {Formatter} formatter Formatter
   * which determines how the content is stylized
   * @param {Theme} theme Collection of theme objects
   */
  constructor(
      wrapperId: string,
      private formatter: Formatter,
      private theme: Theme,
  ) {
    this.idPrefix = wrapperId;
    this.initializeWrapper(this.idPrefix);
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

  /** Initialize the wrapper Id
   */
  private createWrapperId(): void {
    this.wrapper.id = this.idPrefix;
    this.wrapper.id = this.getWrapperId();
  }

  /**
   * Create the wrapper
   * @param {string} futureWrapperId Id of the html element
   * to convert to wrapper for the editor
   */
  private createWrapper(futureWrapperId: string): void {
    const futureWrapper = document.getElementById(futureWrapperId);
    if (!futureWrapper) {
      throw new Error('Cannot find element with id ' + futureWrapperId);
    }

    const futureWrapperParent = futureWrapper.parentElement;
    if (!futureWrapperParent) {
      throw new Error(
          'Cannot find parent of element with id ' + futureWrapperId,
      );
    }

    this.createWrapperId();

    futureWrapperParent.replaceChild(this.wrapper, futureWrapper);
  }

  /**
   * Create the menu and add it to the wrapper
   */
  private createMenu(): void {
    this.createMenuBase();
    this.createMenuSettingsItems();
  }

  /**
   * Create the menu div and add the open/close button
   */
  private createMenuBase(): void {
    this.wrapper.appendChild(this.menu);
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
    const settingsWrapper = document.createElement('div');
    this.menu.appendChild(settingsWrapper);
    settingsWrapper.style.display = 'none';
    settingsWrapper.style.flexDirection = 'column';
    this.formatter
        .getSettings()
        .forEach((element) => settingsWrapper.appendChild(element));
  }

  /**
   * Create the editor element and add it to the wrapper
   */
  private createEditor(): void {
    this.wrapper.appendChild(this.editor);
    this.editor.id = this.getEditorId();
    this.editor.contentEditable = 'true';
  }

  /**
   * Create the editor content wrapper as an editable div
   * @param {string} futureWrapperId Id of html element
   * to convert to wrapper for the editor
   */
  private initializeWrapper(futureWrapperId: string): void {
    this.createWrapper(futureWrapperId);
    this.createMenu();
    this.createEditor();
  }

  /**
   * Event handler function for settings clicking
   * @param {MouseEvent} event click on a setting
   * @param {HTMLElement} menu the menu wrapper as html element
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
    this.injectWrapperTheme();
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
   * Inject wrapper CSS class into the HTML
   */
  private injectWrapperTheme(): void {
    const wrapperCss = this.getWrapperCssProperties();
    CssInjector.injectCss(this.getWrapperIdentifier(), wrapperCss);
  }

  /**
   * @return {PropertiesHyphen} The combined hardcoded wrapper CSS
   * with the wrapper css provided in the Theme
   */
  private getWrapperCssProperties(): PropertiesHyphen {
    if (this.theme.editorTheme) {
      return {
        ...this.getWrapperBaseCssProperties(),
        ...this.theme.editorTheme,
      };
    }
    return this.getWrapperBaseCssProperties();
  }

  /**
   * Hardcoded CSS for the wrapper
   * @return {PropertiesHyphen}
   */
  private getWrapperBaseCssProperties(): PropertiesHyphen {
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
   * @return {string} Main wrapper Id prepended with #
   */
  private getWrapperIdentifier(): string {
    return '#' + this.getWrapperId();
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
   * @return {string} Id of the whole wrapper
   */
  private getWrapperId(): string {
    return this.idPrefix + '-wrapper';
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
