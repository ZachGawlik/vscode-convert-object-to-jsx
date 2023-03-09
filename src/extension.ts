import * as vscode from 'vscode'
import convert from './convert'

export const activate = (context: vscode.ExtensionContext) => {
  const disposable = vscode.commands.registerCommand(
    'extension.convertObjectToJsx',
    () => {
      const editor = vscode.window.activeTextEditor

      // return if there's no editor or it's not a javascript file
      if (
        !editor ||
        !/javascript|typescript/.test(editor.document.languageId)
      ) {
        return
      }

      const fullLineSelection = new vscode.Range(
        new vscode.Position(editor.selection.start.line, 0),
        new vscode.Position(
          editor.selection.end.line,
          vscode.window.activeTextEditor!.document.lineAt(
            editor.selection.end.line
          ).text.length
        )
      )

      try {
        const converted = convert(editor.document.getText(fullLineSelection), {
          useJsxShorthand: vscode.workspace
            .getConfiguration()
            .get('convert-object-to-jsx.useJsxShorthand'),
        })
        editor.edit(builder => builder.replace(fullLineSelection, converted))
      } catch (e) {
        if (e instanceof Error) {
          vscode.window.showErrorMessage(e.message)
        } else {
          throw e
        }
      }
    }
  )

  context.subscriptions.push(disposable)
}
