import {CssRules} from './CssRules';
import {PropertiesHyphen} from 'csstype';

export enum MdCss {
  global = '*.md',
  paragraph = 'p.md',
  header1 = 'h1.md',
  header2 = 'h2.md',
  header3 = 'h3.md',
  header4 = 'h4.md',
  header5 = 'h5.md',
  header6 = 'h6.md',
  italics = 'em.md',
  bold = 'strong.md',
  strikethrough = 'strike.md',
  orderedList = 'ol.md',
  unorderedList = 'ul.md',
  link = 'a.md',
  image = 'img.md',
  inlineCode = 'code.md',
  blockCode = 'pre.md',
  tableHeader = 'th.md',
  tableCell = 'td.md',
  quote = 'blockquote.md',
  horizontalLine = 'hr.md',
}

/**
 * Markdown theme where the field names represent class names
 * and the values represent CSS class properties
 */
export class MdCssRules extends CssRules {
  rules: Record<MdCss, PropertiesHyphen> = {
    '*.md': {},
    'p.md': {},
    'h1.md': {},
    'h2.md': {},
    'h3.md': {},
    'h4.md': {},
    'h5.md': {},
    'h6.md': {},
    'em.md': {},
    'strong.md': {},
    'strike.md': {},
    'ol.md': {},
    'ul.md': {},
    'a.md': {},
    'img.md': {},
    'code.md': {},
    'pre.md': {},
    'th.md': {},
    'td.md': {},
    'blockquote.md': {},
    'hr.md': {},
  }
}
