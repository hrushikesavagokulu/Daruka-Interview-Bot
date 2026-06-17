import { useEffect, useState } from 'react'
import { loader } from '@monaco-editor/react'
import { C } from '../config/colors'

export function useMonacoTheme() {
  const [isThemeLoaded, setIsThemeLoaded] = useState(false)

  useEffect(() => {
    loader.init().then((monaco) => {
      monaco.editor.defineTheme('daruka-theme', {
        base: 'vs-dark',
        inherit: true,
        rules: [
          { token: 'comment', foreground: '7F8C8D', fontStyle: 'italic' },
          { token: 'keyword', foreground: '85C1E9', fontStyle: 'bold' }, // C.mid
          { token: 'string', foreground: '2ECC71' },
          { token: 'number', foreground: 'F1C40F' },
        ],
        colors: {
          'editor.background': C.primary, // Dark Navy (#1A3A5C)
          'editor.foreground': '#F8F9F9',
          'editorCursor.foreground': C.accent, // Blue Accent (#2980B9)
          'editor.selectionBackground': `${C.accent}33`, // Accent with transparency
          'editor.inactiveSelectionBackground': `${C.accent}1A`,
          'editor.lineHighlightBackground': '#1A3A5C4D',
          'editorLineNumber.foreground': '#85C1E9', // C.mid
          'editorLineNumber.activeForeground': '#FFFFFF',
          'editorWidget.background': C.primary,
          'editorWidget.border': C.border,
        }
      })
      setIsThemeLoaded(true)
    })
  }, [])

  return { isThemeLoaded, themeName: 'daruka-theme' }
}
