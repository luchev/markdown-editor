/**
 * Mock interface
 */
interface EditorTheme { };
/**
 *
 */

/**
 * Initiailize list with themes
 */
let EditorThemes: { [name: string]: EditorTheme } = {};
EditorThemes.dark = {
    "background": "#202225",
    "width": "826px",
    "height": "300px",
    "padding": "20px 30px 20px 30px",
    "border-radius": "5px",
    "cursor": "default",
    "overflow": "auto",
    "box-shadow": "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)",
    "color": "#dcddde",
    "outline": "none",
};
EditorThemes.light = {
    "background": "white",
    "width": "826px",
    "height": "300px",
    "padding": "20px 30px 20px 30px",
    "border-radius": "5px",
    "cursor": "default",
    "overflow": "auto",
    "box-shadow": "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)",
    "color": "black",
    "outline": "none",
};
