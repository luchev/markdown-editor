import { MdCssRules } from './MdCssRules';
import { ScrollbarTheme } from './ScrollbarTheme';
import { Theme } from './Theme';
import { Editor } from './Editor';
import { EditorTheme } from './EditorTheme';
import { MdFormatter } from './MdFormatter';

/**
 * Create Markdown Theme
 */
const darkMDFormatterTheme: MdCssRules = {
  '.md-header-1': {
    margin: '24px 0 16px 0',
    'font-weight': 'bold',
    'line-height': '1.25',
    'font-size': '2em',
    'padding-bottom': '.3em',
    'border-bottom': '1px solid #eaecef',
  },
  '.md-header-2': {
    margin: '24px 0 16px 0',
    'font-weight': 'bold',
    'line-height': '1.25',
    'padding-bottom': '.3em',
    'border-bottom': '1px solid #eaecef',
    'font-size': '1.5em',
  },
  '.md-header-3': {
    margin: '24px 0 16px 0',
    'font-weight': 'bold',
    'line-height': '1.25',
    'font-size': '1.25em',
  },
  '.md-header-4': {
    margin: '24px 0 16px 0',
    'font-weight': 'bold',
    'line-height': '1.25',
    'font-size': '1em',
  },
  '.md-header-5': {
    margin: '24px 0 16px 0',
    'font-weight': 'bold',
    'line-height': '1.25',
    'font-size': '.875em',
  },
  '.md-header-6': {
    margin: '24px 0 16px 0',
    'font-weight': 'bold',
    'line-height': '1.25',
    'font-size': '.85em',
  },
  '.md-italics': {
    'font-style': 'italic',
  },
  '.md-bold': {
    'font-weight': 'bold',
  },
  '.md-strikethrough': {
    'text-decoration': 'line-through',
  },
  '.md-ordered-list': {
    'list-style-type': 'decimal',
  },
  '.md-unordered-list': {
    'list-style-type': 'circle',
  },
  '.md-link': {
    'text-decoration': 'none',
    color: 'rgb(77, 172, 253)',
  },
  '.md-image': {
    'max-width': '100%',
  },
  '.md-inline-code': {
    'font-family': 'monospace',
    padding: '.2em .4em',
    'font-size': '85%',
    'border-radius': '3px',
    'background-color': 'rgba(220, 224, 228, 0.1) !important',
  },
  '.md-block-code': {
    'font-family': 'monospace',
    'border-radius': '3px',
    'word-wrap': 'normal',
    padding: '16px',
    background: 'rgba(220, 224, 228, 0.1) !important',
  },
  '.md-table-header': {
    'line-height': '1.5',
    'border-spacing': '0',
    'border-collapse': 'collapse',
    'text-align': 'center',
    'font-weight': 'bold',
    padding: '6px 13px',
    border: '1px solid #dfe2e5',
  },
  '.md-table-cell': {
    'line-height': '1.5',
    'border-spacing': '0',
    'border-collapse': 'collapse',
    'text-align': 'right',
    padding: '6px 13px',
    border: '1px solid #dfe2e5',
  },
  '.md-quote': {
    'border-spacing': '0',
    'border-collapse': 'collapse',
    padding: '6px 13px',
    'border-left': '.25em solid rgb(53, 59, 66)',
  },
  '.md-horizontal-line': {
    'line-height': '1.5',
    overflow: 'hidden',
    height: '.25em',
    padding: '0',
    margin: '24px 0',
    background: 'white',
  },
};

/**
 * Dark theme for the scrollbar
 */
const darkScrollbar: ScrollbarTheme = {
  '-webkit-scrollbar': {
    width: '10px',
  },
  '-webkit-scrollbar-track': {
    background: 'rgb(53, 59, 66)',
    'border-radius': '4px',
  },
  '-webkit-scrollbar-thumb': {
    background: 'rgb(83, 79, 86)',
    'border-radius': '4px',
  },
  '-webkit-scrollbar-thumb:hover': {
    background: 'rgb(93, 99, 106)',
  },
};

const darkEditorTheme: EditorTheme = {
  background: '#202225',
  color: '#dcddde',
  height: '50%',
  'box-shadow':
    '0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)',
};

/**
 * Example usage
 */
const customTheme: Theme = {
  scrollbarTheme: darkScrollbar,
  additionalCssRules: darkMDFormatterTheme,
  editorTheme: darkEditorTheme,
};

const editor = new Editor('editor', new MdFormatter(), customTheme);
