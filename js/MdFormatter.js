import { Formatter } from "./Formatter";
import { DOMHelper } from "./DOMHelper";
export class MdFormatter extends Formatter {
    constructor() {
        super(...arguments);
        this.editor = document.createElement("invalid");
        this.dynamicRender = true;
        this.hideSyntax = true;
        this.caretDiv = null;
    }
    init(editor) {
        this.editor = editor;
        this.initRegex();
        this.initMutationListeners();
        this.initKeyboardEventListeners();
        this.initMouseEventListeners();
    }
    initMutationListeners() {
        const observerConfig = {
            childList: true,
            subtree: true,
            characterData: true,
        };
        const observer = new MutationObserver((mutations) => this.handleMutations(mutations));
        observer.observe(this.editor, observerConfig);
    }
    initKeyboardEventListeners() {
        this.editor.addEventListener("keydown", () => this.handleKeyDown());
        this.editor.addEventListener("keyup", () => this.handleKeyUp());
    }
    initMouseEventListeners() {
        this.editor.addEventListener("click", () => this.handleClick());
    }
    handleKeyDown() {
        this.caretMoved();
    }
    handleKeyUp() {
        this.caretMoved();
    }
    getCaretDiv() {
        let element = document.getSelection()?.anchorNode
            ?.parentElement;
        if (element) {
            while (element.parentElement && element.parentElement !== this.editor) {
                element = element.parentElement;
            }
        }
        if (element.parentElement === this.editor) {
            return element;
        }
        else {
            return null;
        }
    }
    caretMoved() {
        const caretDiv = this.getCaretDiv();
        if (this.caretDiv !== caretDiv) {
            if (this.caretDiv) {
                this.caretDiv.setAttribute("data-active", "false");
                if (this.hideSyntax) {
                    this.hideMdTokens(this.caretDiv);
                }
            }
            this.caretDiv = caretDiv;
            if (this.caretDiv) {
                this.caretDiv.setAttribute("data-active", "true");
                if (this.hideSyntax) {
                    this.showMdTokens(this.caretDiv);
                }
            }
        }
    }
    getFirstRegexMatch(text, regex) {
        const matches = text.match(regex);
        if (matches && matches.length === 1) {
            return matches[0];
        }
        return "";
    }
    showMdTokens(div) {
        for (const child of div.children) {
            if (child instanceof HTMLElement && child.tagName === "SPAN") {
                const span = child;
                if (span.style.display === "none") {
                    const spanText = span.innerText;
                    span.replaceWith(spanText);
                }
            }
        }
        div.normalize();
    }
    hideMdTokens(div) {
        for (const [, regex] of MdFormatter.lineStartRules) {
            if (regex.test(div.innerText)) {
                const lineStart = this.getFirstRegexMatch(div.innerText, regex);
                div.innerText = div.innerText.replace(lineStart, "");
                const span = document.createElement("span");
                span.style.display = "none";
                span.innerText = lineStart;
                div.prepend(span);
                break;
            }
        }
    }
    handleClick() {
        this.caretMoved();
    }
    getSettings() {
        const settingsHtml = [
            `
      <div data-setting="dynamic-render" style='display: flex; flex-direction: row; justify-items: center; justify-content: space-between; margin-top: 20px;'>
        <div style='display: flex;'>
          Dynamic render
        </div>
        <div style='display: flex;'>
          <svg display="none" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
          </svg>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"
            stroke-linecap="round" stroke-linejoin="round">
            <polyline points="9 11 12 14 22 4" />
            <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
          </svg>
        </div>
      </div>
      `,
            `
      <div data-setting="hide-syntax" style='display: flex; flex-direction: row; justify-items: center; justify-content: space-between; margin-top: 20px;'>
        <div style='display: flex;'>
          Hide syntax
        </div>
        <div style='display: flex;'>
          <svg display="none" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
          </svg>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"
            stroke-linecap="round" stroke-linejoin="round">
            <polyline points="9 11 12 14 22 4" />
            <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
          </svg>
        </div>
      </div>
      `,
        ];
        const settingsElements = settingsHtml.map((setting) => DOMHelper.htmlElementFromString(setting));
        settingsElements.forEach((element) => {
            if (element.hasAttribute("data-setting")) {
                if (element.getAttribute("data-setting") === "dynamic-render") {
                    element.addEventListener("click", (event) => this.toggleDynamicRender(event));
                }
                else if (element.getAttribute("data-setting") === "hide-syntax") {
                    element.addEventListener("click", (event) => this.toggleHideSyntax(event));
                }
            }
        });
        return settingsElements;
    }
    toggleDynamicRender(event) {
        const settingsItem = event.currentTarget;
        const svgs = settingsItem?.children[1].children;
        for (const svg of svgs) {
            if (svg.hasAttribute("display")) {
                svg.removeAttribute("display");
            }
            else {
                svg.setAttribute("display", "none");
            }
        }
        this.dynamicRender = !this.dynamicRender;
        if (this.dynamicRender) {
            this.enableRendering();
        }
        else {
            this.disableRendering();
        }
    }
    toggleHideSyntax(event) {
        const settingsItem = event.currentTarget;
        const svgs = settingsItem?.children[1].children;
        for (const svg of svgs) {
            if (svg.hasAttribute("display")) {
                svg.removeAttribute("display");
            }
            else {
                svg.setAttribute("display", "none");
            }
        }
        this.hideSyntax = !this.hideSyntax;
        if (this.hideSyntax) {
            this.enableHideSyntax();
        }
        else {
            this.disableHideSyntax();
        }
    }
    enableHideSyntax() {
        for (const element of this.editor.children) {
            if (element instanceof HTMLElement) {
                this.hideMdTokens(element);
            }
        }
    }
    disableHideSyntax() {
        for (const element of this.editor.children) {
            if (element instanceof HTMLElement) {
                this.showMdTokens(element);
            }
        }
    }
    initRegex() {
        if (MdFormatter.lineStartRules.length === 0) {
            MdFormatter.lineStartRules.push(["md-header-1", RegExp("^#{1}\\s")]);
            MdFormatter.lineStartRules.push(["md-header-2", RegExp("^#{2}\\s")]);
            MdFormatter.lineStartRules.push(["md-header-3", RegExp("^#{3}\\s")]);
            MdFormatter.lineStartRules.push(["md-header-4", RegExp("^#{4}\\s")]);
            MdFormatter.lineStartRules.push(["md-header-5", RegExp("^#{5}\\s")]);
            MdFormatter.lineStartRules.push(["md-header-6", RegExp("^#{6}\\s")]);
            MdFormatter.lineStartRules.push(["md-quote", RegExp("^>\\s")]);
        }
    }
    initInlineRules() {
        if (MdFormatter.inlineRules.length === 0) {
            MdFormatter.inlineRules.push(["md-bold", "**"]);
            MdFormatter.inlineRules.push(["md-bold", "__"]);
            MdFormatter.inlineRules.push(["md-italics", "*"]);
            MdFormatter.inlineRules.push(["md-italics", "_"]);
            MdFormatter.inlineRules.push(["md-strikethrough", "--"]);
        }
    }
    handleMutations(mutations) {
        if (this.dynamicRender) {
            for (const mutation of mutations) {
                this.handleMutation(mutation);
            }
        }
    }
    handleMutation(mutation) {
        if (mutation.type === "childList") {
            this.handleChildListMutation(mutation);
        }
        if (mutation.type === "characterData") {
            this.handleCharacterDataMutation(mutation);
        }
    }
    handleChildListMutation(mutation) {
        if (mutation.addedNodes.length > 0) {
            const addedNode = mutation.addedNodes[0];
            if (addedNode.nodeName === "#text" &&
                addedNode.parentElement === this.editor) {
                const newDiv = document.createElement("div");
                this.editor.insertBefore(newDiv, addedNode.nextSibling);
                newDiv.appendChild(addedNode);
                const range = document.createRange();
                const sel = window.getSelection();
                range.setStart(this.editor.childNodes[0], newDiv.innerText.length);
                range.collapse(true);
                if (sel) {
                    sel.removeAllRanges();
                    sel.addRange(range);
                }
            }
            if (addedNode.nodeName === "DIV" && mutation.target !== this.editor) {
                if (addedNode.nodeType === Node.ELEMENT_NODE) {
                    const elementFromNode = addedNode;
                    while (elementFromNode.hasAttributes()) {
                        elementFromNode.removeAttribute(elementFromNode.attributes[0].name);
                    }
                }
            }
        }
        if (mutation.target.nodeType === Node.ELEMENT_NODE &&
            mutation.target !== this.editor) {
            const elementFromNode = mutation.target;
            if (elementFromNode) {
                const spacesRegex = RegExp("^\\s*$");
                if (spacesRegex.test(elementFromNode.innerText)) {
                    this.clearDivFormatting(elementFromNode);
                }
            }
        }
    }
    handleCharacterDataMutation(mutation) {
        const div = mutation.target.parentElement;
        if (div && this.dynamicRender) {
            this.clearDivFormatting(div);
            this.applyDivFormatting(div);
        }
    }
    disableRendering() {
        for (const child of this.editor.children) {
            if (child instanceof HTMLElement) {
                const div = child;
                this.clearDivFormatting(div);
            }
        }
    }
    enableRendering() {
        for (const child of this.editor.children) {
            if (child instanceof HTMLElement) {
                const div = child;
                this.applyDivFormatting(div);
            }
        }
    }
    applyDivFormatting(div) {
        for (const [className, regex] of MdFormatter.lineStartRules) {
            if (regex.test(div.innerText)) {
                div.className = className;
            }
        }
    }
    clearDivFormatting(div) {
        div.className = "";
    }
}
MdFormatter.lineStartRules = [];
MdFormatter.inlineRules = [];
