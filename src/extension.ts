import * as vscode from 'vscode'

export const activate = (context: vscode.ExtensionContext) => {
  const disposable = vscode.commands.registerCommand(
    'extension.convertObjectToJsx',
    () => {
      vscode.window.showInformationMessage('Hello world!')
    }
  )

  context.subscriptions.push(disposable)
}
