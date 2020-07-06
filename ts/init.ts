import {MdCssRules, MdCss} from './MdCssRules';
import {ScrollbarTheme} from './ScrollbarTheme';
import {Theme} from './Theme';
import {Editor} from './Editor';
import {EditorTheme} from './EditorTheme';
import {MdFormatter} from './MdFormatter';

/**
 * Create Markdown Theme
 */
const darkMDFormatterTheme: MdCssRules = new MdCssRules();
darkMDFormatterTheme.rules[MdCss.global] = {
  'font-family': 'sans-serif',
};
darkMDFormatterTheme.rules[MdCss.paragraph] = {
  'font-size': '1em',
};
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

/**
 * Dark theme for the scrollbar
 */
const darkScrollbar: ScrollbarTheme = {
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

const darkEditorTheme: EditorTheme = {
  'background': '#202225',
  'color': '#dcddde',
  'height': '50%',
  'box-shadow':
    '0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)',
};

const sampleMarkdownText =
  `
# Title 1
## Title 2
### Title 3
#### Title 4
##### Title 5
###### Title 6
Paragraph under a title.

Paragraph separated by a new line.
Which spans multiple lines.
To remind us that a parahraph is separated from other paragraphs by an empty line.

> quote
[anchor]: https://google.com

Text above line.
---
Text between lines.
****
## Title 2 between lines
_____
Text under the last line.

Paragraph with **bold text** and __more bold text__

And this is some *italics with asterisk* and _italics with underscores_

How about combined ***italics* and bold** or **_italics_ and bold using _underscores_**

Then some ~~strikethrough text~~

Here's how \`inline code\` looks like.

[I'm an inline-style link](https://www.google.com)

[I'm an inline-style link with title](https://www.google.com "Google's Homepage")

Links can also be inline: [I'm a reference-style link][anchor]

Or leave it empty and use the [anchor with text].

[anchor with text]: https://youtube.com "YouTube"

Inline-style image: ![alt text](https://github.com/adam-p/markdown-here/raw/master/src/common/images/icon48.png "Logo Title Text 1")

Reference-style image:
![alt text][logo]

[logo]: https://github.com/adam-p/markdown-here/raw/master/src/common/images/icon48.png "Logo Title Text 2"

### Here's multiline code block with specified language
\`\`\`javascript
    var s = "JavaScript syntax highlighting";
    alert( s );
\`\`\`

### Here's multiline code block without language specification

\`\`\`
    No language indicated, so no syntax highlighting.
    But let's throw in a <b>tag</b>.
\`\`\`

Next is an unordered list
* Unordered list can use asterisks
- Or minuses
+ Or pluses

And unordered list with sub lists
* Unordered list with
 - subitem
 + and another subitem
* and we can continue the original list

Next we have ordered lists
1. First item
2. Second item (number doesn't matter)
1. Last ordered item

And mixed lists
23. Ordered list
 - unordered sublist item 1
 - unordered sublist item 2
12. and then continue the ordered list
 1. with an ordered sublist

At the end there's tables

| Tables        | Are           | Cool  |
| ------------- |:-------------:| -----:|
| col 3 is      | right-aligned | $1600 |
| col 2 is      | centered      |   $12 |
| zebra stripes | are neat      |    $1 |

And tables with wonky syntax
Markdown | Less | Pretty
--- | --- | ---
*Still* | \`renders\` | **nicely**
1 | 2 | 3

And | tables
without | headers

        `;

/**
 * Example usage
 */
const customTheme: Theme = {
  scrollbarTheme: darkScrollbar,
  additionalCssRules: darkMDFormatterTheme,
  editorTheme: darkEditorTheme,
};


const editor = new Editor('editor', new MdFormatter(), customTheme);
editor.setContent(sampleMarkdownText);
