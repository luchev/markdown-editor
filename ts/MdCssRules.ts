import {CssRules} from './CssRules';
import {PropertiesHyphen} from 'csstype';

/**
 * Markdown theme where the field names represent class names
 * and the values represent CSS class properties
 */
export interface MdCssRules extends CssRules {
  '.md-header-1'?: PropertiesHyphen;
  '.md-header-2'?: PropertiesHyphen;
  '.md-header-3'?: PropertiesHyphen;
  '.md-header-4'?: PropertiesHyphen;
  '.md-header-5'?: PropertiesHyphen;
  '.md-header-6'?: PropertiesHyphen;
  '.md-italics'?: PropertiesHyphen;
  '.md-bold'?: PropertiesHyphen;
  '.md-strikethrough'?: PropertiesHyphen;
  '.md-ordered-list'?: PropertiesHyphen;
  '.md-unordered-list'?: PropertiesHyphen;
  '.md-link'?: PropertiesHyphen;
  '.md-image'?: PropertiesHyphen;
  '.md-inline-code'?: PropertiesHyphen;
  '.md-block-code'?: PropertiesHyphen;
  '.md-table-header'?: PropertiesHyphen;
  '.md-table-cell'?: PropertiesHyphen;
  '.md-quote'?: PropertiesHyphen;
  '.md-horizontal-line'?: PropertiesHyphen;
}
