"use client";

import Editor, { type BeforeMount, type OnMount } from "@monaco-editor/react";
import { useEffect, useRef } from "react";

type Props = {
  value: string;
  onChange: (v: string) => void;
  execLine: number;
  errorLine: number | null;
  errorMessage?: string;
  dark: boolean;
  onCook: () => void;
  onStep: () => void;
  readOnly?: boolean;
};

/* eslint-disable @typescript-eslint/no-explicit-any */
export default function CodeEditor({ value, onChange, execLine, errorLine, errorMessage, dark, onCook, onStep, readOnly }: Props) {
  const editorRef = useRef<any>(null);
  const monacoRef = useRef<any>(null);
  const decoRef = useRef<any>(null);
  const handlers = useRef({ onCook, onStep });
  handlers.current = { onCook, onStep };

  const beforeMount: BeforeMount = (monaco) => {
    monaco.editor.defineTheme("pyu-light", {
      base: "vs", inherit: true, rules: [{ token: "comment", foreground: "9a8674", fontStyle: "italic" }],
      colors: { "editor.background": "#fffdf8", "editorLineNumber.foreground": "#c4b5a3", "editorGutter.background": "#fbf4ea" },
    });
    monaco.editor.defineTheme("pyu-dark", {
      base: "vs-dark", inherit: true, rules: [{ token: "comment", foreground: "a18f7d", fontStyle: "italic" }],
      colors: { "editor.background": "#1d1611", "editorLineNumber.foreground": "#6b5a4a", "editorGutter.background": "#221a14" },
    });
  };

  const onMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;
    decoRef.current = editor.createDecorationsCollection([]);
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => handlers.current.onCook());
    editor.addCommand(monaco.KeyCode.F10, () => handlers.current.onStep());
    editor.getModel()?.updateOptions({ tabSize: 4, insertSpaces: true });
  };

  useEffect(() => {
    const editor = editorRef.current, monaco = monacoRef.current;
    if (!editor || !monaco || !decoRef.current) return;
    const model = editor.getModel();
    if (!model) return;
    const lines = model.getLineCount();
    const decos: any[] = [];
    if (execLine > 0 && execLine <= lines) {
      decos.push({ range: new monaco.Range(execLine, 1, execLine, 1), options: { isWholeLine: true, className: "pyu-exec-line", glyphMarginClassName: "pyu-exec-glyph" } });
      editor.revealLineInCenterIfOutsideViewport(execLine);
    }
    if (errorLine && errorLine <= lines) {
      decos.push({ range: new monaco.Range(errorLine, 1, errorLine, 1), options: { isWholeLine: true, className: "pyu-error-line", glyphMarginClassName: "pyu-error-glyph" } });
    }
    decoRef.current.set(decos);
    monaco.editor.setModelMarkers(model, "pyu", errorLine && errorLine <= lines
      ? [{ startLineNumber: errorLine, endLineNumber: errorLine, startColumn: 1, endColumn: model.getLineMaxColumn(errorLine), message: errorMessage || "Error", severity: monaco.MarkerSeverity.Error }]
      : []);
  }, [execLine, errorLine, errorMessage, value]);

  return (
    <div className="overflow-hidden rounded-xl border" style={{ borderColor: "var(--line)" }}>
      <Editor
        height="clamp(220px, 32vh, 340px)"
        defaultLanguage="python"
        value={value}
        onChange={(v) => onChange(v ?? "")}
        theme={dark ? "pyu-dark" : "pyu-light"}
        beforeMount={beforeMount}
        onMount={onMount}
        loading={<div className="p-4 text-sm opacity-70">Unrolling the recipe card…</div>}
        options={{
          fontSize: 15,
          fontFamily: "var(--font-jetbrains), ui-monospace, monospace",
          minimap: { enabled: false },
          lineNumbers: "on",
          glyphMargin: true,
          tabSize: 4,
          insertSpaces: true,
          detectIndentation: false,
          scrollBeyondLastLine: false,
          automaticLayout: true,
          renderLineHighlight: "none",
          wordWrap: "on",
          padding: { top: 10, bottom: 10 },
          readOnly,
          quickSuggestions: false,
          suggestOnTriggerCharacters: false,
          parameterHints: { enabled: false },
          lineNumbersMinChars: 3,
          folding: false,
          contextmenu: false,
          ariaLabel: "Recipe editor: write your Python code here",
        }}
      />
    </div>
  );
}
