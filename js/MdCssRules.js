import { CssRules } from './CssRules';
export var MdCss;
(function (MdCss) {
    MdCss["header1"] = ".md-header-1";
    MdCss["header2"] = ".md-header-2";
    MdCss["header3"] = ".md-header-3";
    MdCss["header4"] = ".md-header-4";
    MdCss["header5"] = ".md-header-5";
    MdCss["header6"] = ".md-header-6";
    MdCss["italics"] = ".md-italics";
    MdCss["bold"] = ".md-bold";
    MdCss["strikethrough"] = ".md-strikethrough";
    MdCss["orderedList"] = ".md-ordered-list";
    MdCss["unorderedList"] = ".md-unordered-list";
    MdCss["link"] = ".md-link";
    MdCss["image"] = ".md-image";
    MdCss["inlineCode"] = ".md-inline-code";
    MdCss["blockCode"] = ".md-block-code";
    MdCss["tableHeader"] = ".md-table-header";
    MdCss["tableCell"] = ".md-table-cell";
    MdCss["quote"] = ".md-quote";
    MdCss["horizontalLine"] = ".md-horizontal-line";
})(MdCss || (MdCss = {}));
export class MdCssRules extends CssRules {
    constructor() {
        super(...arguments);
        this.rules = {
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
        };
    }
}
