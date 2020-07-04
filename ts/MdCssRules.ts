import {CssRules} from './CssRules';
import {PropertiesHyphen} from 'csstype';

export enum MdCss {
  header1 = '.md-header-1',
  header2 = '.md-header-2',
  header3= '.md-header-3',
  header4= '.md-header-4',
  header5= '.md-header-5',
  header6= '.md-header-6',
  italics= '.md-italics',
  bold= '.md-bold',
  strikethrough= '.md-strikethrough',
  orderedList= '.md-ordered-list',
  unorderedList= '.md-unordered-list',
  link= '.md-link',
  image= '.md-image',
  inlineCode= '.md-inline-code',
  blockCode= '.md-block-code',
  tableHeader= '.md-table-header',
  tableCell= '.md-table-cell',
  quote= '.md-quote',
  horizontalLine= '.md-horizontal-line',
}

/**
 * Markdown theme where the field names represent class names
 * and the values represent CSS class properties
 */
export class MdCssRules extends CssRules {
  rules: Record<MdCss, PropertiesHyphen> = {
    '.md-header-1': {},
    '.md-header-2': {},
    '.md-header-3': {},
    '.md-header-4': {},
    '.md-header-5': {},
    '.md-header-6': {},
    '.md-italics': {},
    '.md-bold': {},
    '.md-strikethrough': {},
    '.md-ordered-list': {},
    '.md-unordered-list': {},
    '.md-link': {},
    '.md-image': {},
    '.md-inline-code': {},
    '.md-block-code': {},
    '.md-table-header': {},
    '.md-table-cell': {},
    '.md-quote': {},
    '.md-horizontal-line': {},
  }
}
