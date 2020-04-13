import { ScrollbarTheme } from "./ScrollbarTheme";
import { EditorTheme } from "./EditorTheme";
import { CssRules } from "./CssRules";

/**
 * A collection of theme objects
 */
export interface Theme {
  editorTheme?: EditorTheme;
  scrollbarTheme?: ScrollbarTheme;
  additionalCssRules?: CssRules;
}
