import * as vscode from 'vscode'
import convertObjectToJsx from './convertObjectToJsx'

// Editor selection code credited to https://github.com/ansumanshah/css-in-js

const positionFactory = (positionObj: any) => {
  return new vscode.Position(positionObj._line, positionObj._character)
}

const rangeFactory = (selection: any, length: any) => {
  selection.start._character = 0

  if (length === 0) {
    selection.end._character = vscode.window.activeTextEditor!.document.lineAt(
      selection.start.line
    ).text.length
  }

  return new vscode.Range(
    positionFactory(selection.start),
    positionFactory(selection.end)
  )
}

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

      const selection = editor.selection
      const lineText = editor.document.lineAt(selection.start.line).text
      const selectedText = editor.document.getText(selection)
      const convertableText = selectedText || lineText
      const range = rangeFactory(selection, selectedText.length)

      editor.edit(builder =>
        builder.replace(range, convertObjectToJsx(convertableText))
      )
    }
  )

  context.subscriptions.push(disposable)
}
