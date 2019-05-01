# [Convert Object <-> JSX for VS Code](https://marketplace.visualstudio.com/items?itemName=zachgawlik.convert-object-to-jsx)

Adds a command and keyboard shortcut to convert between JS object and JSX prop formats.

One common usecase is for establishing shared props for component tests:

![Animated demonstration moving default props in and out of a test helper and using the extension to switch between JSX props syntax and Object entries syntax](./demo.gif)

## Use

- Select a block of object entries (without the braces) or JSX props (without the component name)
- Either
  - bring up the command palette (`cmd+shift+p` on Mac) and select "Convert Object <-> JSX"
  - use the `ctrl+,` shortcut

## Configuration

You can change the keyboard shortcut by opening the Keyboard Shortcuts option in the command palette and modifying the entry for `extension.convertObjectToJsx`.

Settings:

- `convert-object-to-jsx.useJsxShorthand`: For a true object entry, format to `prop` rather than `prop={true}`

## Limitations

The text selection is interpreted using straight-forward string parsing, which ensures the extension minimally reshapes code during conversion. However, the simplicity of this approach comes with a few accepted limitations:

- It is expected that your code is formatted by Prettier, as the string parsing relies on consistent indentation
- Multiline strings using backticks are not supported
- Comments in the text selection are not supported

Given the narrowness of usecases for this extension, I expect it would be rare to hit either of these constraints. Feel free to file an issue if they frequently obstruct your use of this tool.

For more insight on the reasoning behind this choice, see the [release post](https://zachgawlik.com/blog/2019-05-01-vscode-convert-object-to-jsx-release).
