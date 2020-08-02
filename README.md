# Markdown editor

Dynamic Markdown editor written in Typescript, compiled to a single JavaScript file. Example of how this editor works can be found [here](https://luchev.github.io/markdown-editor/).

## Getting started

The most basic setup using the theme that comes bundled up with the editor:

```html
    <div id="editor"></div> <!-- Element that will become the editor, id is important -->
    <script src="editor.js"></script> <!-- Include the editor -->
    <script src="lib/prism.js"></script> <!-- Include Prism for code highlight -->
    <script>
        // Initialize the editor with
        // id='editor' (the same id as our <div> above)
        // new MDFormatter() is the Markdown renderer
        // customTheme is the style theme to use for the editor, see ts/init.ts on how to create your own
        const editor = new Editor( 'editor', new MdFormatter(), customTheme );
        // Set the editor content to a test string, which comes with the editor
        editor.setContent( sampleMarkdownText ); // sampleMarkdownText is defined in ts/init.ts
    </script>
```

## Compiling the project

The easiest way to compile the whole project to JavaScript `editor.js` is to run `npm start`. This will start a local server, will check all the TS files for changes and compile them to JS, after which it will combine the JS files into a single file `editor.js`

If you want to run the compilation manually, here's what you have to do:

1. Run `tsc`, which will compile all TS files under `ts/` to JS files in `js/`
2. Run `./compileJs.sh`, which will compile the separate JS files into a single file - `editor.js`, which contains the editor class and its configs
3. Exit the `compileJs` script by interrupting it `Ctrl + C`, because by default the script enter listening mode and waits for changes in the JS files and when a change occurs it recompiles the `editor.js` again.

## How to create your own theme

### Option 1:

Change the file `ts/init.ts` and recompile the `editor.js`. `ts/init.ts` contains code which only creates a theme for the editor, some sample text and initializes said editor.

### Option 2:

Create your own theme from scratch. For a full list of available fields check out `ts/Theme.ts` and the interfaces it uses.

Here's a basic example of what a theme object may look like:

```javascript
const theme = {
  scrollbarTheme: {
      '-webkit-scrollbar': {
        width: '10px',
      },
      '-webkit-scrollbar-track': {
        'background': 'rgb(53, 59, 66)',
      },
  },
  additionalCssRules: {
	rules: {
		'em.md': {
			'font-style': 'italic',
		},
		'h1.md': {
			'border-bottom': '1px solid #eaecef',
            'font-size': '2em',
		},
	}
  },
  editorTheme: {
      'background': '#202225',
      'color': '#dcddde',
      'height': '50%',
  },
};
```

## Working with the content of the editor

You can manually set or retrieve the content of the editor by using `setContent("New content")` and `getContent()`.  An example of how you can the editor with its methods can be found [here](https://github.com/luchev/uni-markdown-editor-website) - this is a website which allows the users to create their own collection of Markdown files/notes using this editor and a simple database. 

**Example with getContent()/setContent()**

```html
    <script>
        const editor = new Editor( 'editor', new MdFormatter(), customTheme );
        editor.setContent( "# This text will appear in the editor and will be formatted as a Markdown Title" );
        let content = editor.getContent(); // content will now contain the text above
    </script>
```



