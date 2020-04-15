import {PropertiesHyphen} from 'csstype';

/**
 * Add methods to work with CSS like injecting classes and
 * converting CSS properties to string which looks like css
 */
export class CssHelper {
  /**
   * The newly added style element in the DOM
   * where all the injections arehappening
   */
  private static styleElement: HTMLStyleElement;
  /**
   * The instance is used only to initialize the class once
   * to make sure later on there is a style element which can be edited
   */
  private static instance: CssHelper = new CssHelper();

  /**
   * Deprecated singleton, the class is now static
   * The only remaining part of the singleton is the instance
   * which ensures that the constructor has been called and a new
   * style tag has been injected into the HTML
   */
  private constructor() {
    CssHelper.styleElement = document.createElement('style');
    CssHelper.styleElement.type = 'text/css';
    document
        .getElementsByTagName('head')[0]
        .appendChild(CssHelper.styleElement);
  }

  /**
   * Inject CSS given an identifier and properties
   * @param {string} identifier CSS identifier, e.g '#some-id' or 'a:hover'
   * @param {PropertiesHyphen} properties CSS properties
   */
  static injectCss(identifier: string, properties: PropertiesHyphen): void {
    const cssTextPropertoes = CssHelper.stringifyCSSProperties(properties);
    CssHelper.styleElement.innerHTML +=
    `${identifier} { ${cssTextPropertoes} } \n`;
  }

  /**
   * Convert a list of css properties to a string which is valid css
   * @param {PropertiesHyphen} property CSS properties
   * @return {string}
   */
  static stringifyCSSProperties(property: PropertiesHyphen): string {
    let cssString = '';
    Object.entries(property).forEach(([key, value]: [string, string]) => {
      if (value !== '') {
        cssString += `${key}: ${value}; `;
      }
    });
    return cssString;
  }
}
