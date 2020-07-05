import { MdCssRules, MdCss } from './MdCssRules';
const darkMDFormatterTheme = new MdCssRules();
darkMDFormatterTheme.rules[MdCss.header1] = {
    'margin': '24px 0 16px 0',
    'font-weight': 'bold',
    'line-height': '1.25',
    'font-size': '2em',
    'padding-bottom': '.3em',
    'border-bottom': '1px solid #eaecef',
};
darkMDFormatterTheme.rules[MdCss.header2] = {
    'margin': '24px 0 16px 0',
    'font-weight': 'bold',
    'line-height': '1.25',
    'padding-bottom': '.3em',
    'border-bottom': '1px solid #eaecef',
    'font-size': '1.5em',
};
darkMDFormatterTheme.rules[MdCss.header3] = {
    'margin': '24px 0 16px 0',
    'font-weight': 'bold',
    'line-height': '1.25',
    'font-size': '1.25em',
};
darkMDFormatterTheme.rules[MdCss.header4] = {
    'margin': '24px 0 16px 0',
    'font-weight': 'bold',
    'line-height': '1.25',
    'font-size': '1em',
};
darkMDFormatterTheme.rules[MdCss.header5] = {
    'margin': '24px 0 16px 0',
    'font-weight': 'bold',
    'line-height': '1.25',
    'font-size': '.875em',
};
darkMDFormatterTheme.rules[MdCss.header6] = {
    'margin': '24px 0 16px 0',
    'font-weight': 'bold',
    'line-height': '1.25',
    'font-size': '.85em',
};
darkMDFormatterTheme.rules[MdCss.italics] = {
    'font-style': 'italic',
};
darkMDFormatterTheme.rules[MdCss.bold] = {
    'font-weight': 'bold',
};
darkMDFormatterTheme.rules[MdCss.strikethrough] = {
    'text-decoration': 'line-through',
};
darkMDFormatterTheme.rules[MdCss.orderedList] = {
    'list-style-type': 'decimal',
};
darkMDFormatterTheme.rules[MdCss.unorderedList] = {
    'list-style-type': 'circle',
};
darkMDFormatterTheme.rules[MdCss.link] = {
    'text-decoration': 'none',
    'color': 'rgb(77, 172, 253)',
};
darkMDFormatterTheme.rules[MdCss.image] = {
    'max-width': '100%',
};
darkMDFormatterTheme.rules[MdCss.inlineCode] = {
    'font-family': 'monospace',
    'padding': '.2em .4em',
    'font-size': '85%',
    'border-radius': '3px',
    'background-color': 'rgba(220, 224, 228, 0.1) !important',
};
darkMDFormatterTheme.rules[MdCss.blockCode] = {
    'font-family': 'monospace',
    'border-radius': '3px',
    'word-wrap': 'normal',
    'padding': '16px',
    'background': 'rgba(220, 224, 228, 0.1) !important',
};
darkMDFormatterTheme.rules[MdCss.tableHeader] = {
    'line-height': '1.5',
    'border-spacing': '0',
    'border-collapse': 'collapse',
    'text-align': 'center',
    'font-weight': 'bold',
    'padding': '6px 13px',
    'border': '1px solid #dfe2e5',
};
darkMDFormatterTheme.rules[MdCss.tableCell] = {
    'line-height': '1.5',
    'border-spacing': '0',
    'border-collapse': 'collapse',
    'text-align': 'right',
    'padding': '6px 13px',
    'border': '1px solid #dfe2e5',
};
darkMDFormatterTheme.rules[MdCss.quote] = {
    'border-spacing': '0',
    'border-collapse': 'collapse',
    'padding': '6px 13px',
    'border-left': '.25em solid rgb(53, 59, 66)',
};
darkMDFormatterTheme.rules[MdCss.horizontalLine] = {
    'line-height': '1.5',
    'overflow': 'hidden',
    'height': '.25em',
    'padding': '0',
    'margin': '24px 0',
    'background': 'white',
};
const darkScrollbar = {
    '-webkit-scrollbar': {
        width: '10px',
    },
    '-webkit-scrollbar-track': {
        'background': 'rgb(53, 59, 66)',
        'border-radius': '4px',
    },
    '-webkit-scrollbar-thumb': {
        'background': 'rgb(83, 79, 86)',
        'border-radius': '4px',
    },
    '-webkit-scrollbar-thumb:hover': {
        background: 'rgb(93, 99, 106)',
    },
};
const darkEditorTheme = {
    'background': '#202225',
    'color': '#dcddde',
    'height': '50%',
    'box-shadow': '0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)',
};
const customTheme = {
    scrollbarTheme: darkScrollbar,
    additionalCssRules: darkMDFormatterTheme,
    editorTheme: darkEditorTheme,
};
