import {PropertiesHyphen} from 'csstype';

/** Add methods to work with CSS like injecting classes and
 * converting CSS properties to string which looks like css
 */
export class CssInjector {
  /** Inject CSS given an identifier and properties
     * @param {string} identifier CSS identifier, e.g '#some-id' or 'a:hover'
     * @param {PropertiesHyphen} properties CSS properties
     */
  static injectCss(identifier: string, properties: PropertiesHyphen): void {
    if (properties === this.cssRules[identifier]) {
      return;
    }
    this.cssRules[identifier] = properties;
    let css = '';
    Object.keys(this.cssRules).map((key) => {
      const cssTextPropertoes = CssInjector.stringifyCSSProperties(this.cssRules[key]);
      css += `${key} { ${cssTextPropertoes} } \n`;
    });
    this.styleElement.innerHTML = css;
  }

  /** The newly added style element in the DOM
   * where all the injections arehappening
   */
  private static styleElement: HTMLStyleElement;

  private static cssRules: {[identifier: string]: PropertiesHyphen} = {};

  /** The instance is used only to initialize the class once
   * to make sure later on there is a style element which can be edited
   */
  private static instance: CssInjector = new CssInjector();

  /** Deprecated singleton, the class is now static
   * The only remaining part of the singleton is the instance
   * which ensures that the constructor has been called and a new
   * style tag has been injected into the HTML
   */
  private constructor() {
    CssInjector.styleElement = document.createElement('style');
    CssInjector.styleElement.type = 'text/css';
    document
        .getElementsByTagName('head')[0]
        .appendChild(CssInjector.styleElement);
  }

  /** Convert a list of css properties to a string which is valid css
   * @param {PropertiesHyphen} property CSS properties
   * @return {string}
   */
  private static stringifyCSSProperties(property: PropertiesHyphen): string {
    let cssString = '';
    Object.entries(property).forEach(([key, value]: [string, string]) => {
      if (value !== '') {
        cssString += `${key}: ${value}; `;
      }
    });
    return cssString;
  }
}
