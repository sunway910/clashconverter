// preview-editor.tsx

'use client';

import * as React from 'react';
import { EditorState, Compartment, StateEffect } from '@codemirror/state';
import {
  EditorView,
  keymap,
  drawSelection,
  dropCursor,
  placeholder as placeholderExt,
  lineNumbers,
} from '@codemirror/view';
import { defaultKeymap, history, historyKeymap } from '@codemirror/commands';
import {
  bracketMatching,
  indentOnInput,
  foldGutter,
  syntaxHighlighting,
  defaultHighlightStyle,
  HighlightStyle,
} from '@codemirror/language';
import { searchKeymap, highlightSelectionMatches } from '@codemirror/search';
import { json } from '@codemirror/lang-json';
import { yaml } from '@codemirror/lang-yaml';
import { tags as t } from '@lezer/highlight';
import { useTheme } from 'next-themes';
import { toast } from 'sonner';

// ============================================================================
// Type Definitions
// ============================================================================

interface PreviewEditorProps {
  value: string;
  language: LanguageType;
  height?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  debounceMs?: number;
}

type LanguageType = 'json' | 'yaml' | 'plaintext';
type ThemeMode = 'light' | 'dark';

interface EditorCompartments {
  readOnly: Compartment;
  placeholder: Compartment;
  theme: Compartment;
  highlightStyle: Compartment;
  language: Compartment;
}

// ============================================================================
// Constants - Theme Styles
// ============================================================================

const DARK_HIGHLIGHT_COLORS = {
  keyword: '#ff7b72',
  string: '#a5d6ff',
  number: '#79c0ff',
  propertyName: '#d2a8ff',
  comment: '#8b949e',
  punctuation: '#c9d1d9',
  selectionBg: '#264f78',
  selectionBgFocused: '#264f78',
  bg: '#09090b',
  gutter: '#09090b',
  gutterText: '#8b949e',
  foldPlaceholder: '#264f78',
  foldPlaceholderText: '#a5d6ff',
} as const;

const LIGHT_HIGHLIGHT_COLORS = {
  keyword: '#cf222e',
  string: '#0a3069',
  number: '#0550ae',
  propertyName: '#8250df',
  comment: '#6e7781',
  punctuation: '#24292f',
  selectionBg: '#b4d5fe',
  selectionBgFocused: '#d7d4f0',
  bg: '#ffffff',
  gutter: '#ffffff',
  gutterText: '#6e7781',
  foldPlaceholder: '#d7d4f0',
  foldPlaceholderText: '#0a3069',
} as const;

// ============================================================================
// LRU Cache Implementation
// ============================================================================

interface LRUCacheNode<K, V> {
  key: K;
  value: V;
  prev: LRUCacheNode<K, V> | null;
  next: LRUCacheNode<K, V> | null;
}

class LRUCache<K, V> {
  private capacity: number;
  private cache: Map<K, LRUCacheNode<K, V>>;
  private head: LRUCacheNode<K, V> | null;
  private tail: LRUCacheNode<K, V> | null;

  constructor(capacity: number) {
    this.capacity = capacity;
    this.cache = new Map();
    this.head = null;
    this.tail = null;
  }

  get(key: K): V | undefined {
    const node = this.cache.get(key);
    if (!node) return undefined;

    // Move to head (most recently used)
    this.moveToHead(node);
    return node.value;
  }

  set(key: K, value: V): void {
    const existingNode = this.cache.get(key);

    if (existingNode) {
      existingNode.value = value;
      this.moveToHead(existingNode);
    } else {
      const newNode: LRUCacheNode<K, V> = {
        key,
        value,
        prev: null,
        next: null,
      };

      if (this.cache.size >= this.capacity) {
        // Remove least recently used (tail)
        if (this.tail) {
          this.cache.delete(this.tail.key);
          this.removeNode(this.tail);
        }
      }

      this.cache.set(key, newNode);
      this.addToHead(newNode);
    }
  }

  private moveToHead(node: LRUCacheNode<K, V>): void {
    this.removeNode(node);
    this.addToHead(node);
  }

  private addToHead(node: LRUCacheNode<K, V>): void {
    node.prev = null;
    node.next = this.head;

    if (this.head) {
      this.head.prev = node;
    }

    this.head = node;

    if (!this.tail) {
      this.tail = node;
    }
  }

  private removeNode(node: LRUCacheNode<K, V>): void {
    if (node.prev) {
      node.prev.next = node.next;
    } else {
      this.head = node.next;
    }

    if (node.next) {
      node.next.prev = node.prev;
    } else {
      this.tail = node.prev;
    }
  }

  clear(): void {
    this.cache.clear();
    this.head = null;
    this.tail = null;
  }
}

// ============================================================================
// Memoized Style Creators with LRU Cache
// ============================================================================

const HIGHLIGHT_CACHE_CAPACITY = 4;
const THEME_CACHE_CAPACITY = 16;

const highlightStyleCache = new LRUCache<ThemeMode, ReturnType<typeof HighlightStyle.define>>(
  HIGHLIGHT_CACHE_CAPACITY
);

function getHighlightStyle(isDark: boolean): ReturnType<typeof HighlightStyle.define> {
  const themeMode: ThemeMode = isDark ? 'dark' : 'light';

  let highlightStyle = highlightStyleCache.get(themeMode);
  if (!highlightStyle) {
    const colors = isDark ? DARK_HIGHLIGHT_COLORS : LIGHT_HIGHLIGHT_COLORS;

    highlightStyle = HighlightStyle.define([
      { tag: t.keyword, color: colors.keyword, fontWeight: 'bold' },
      { tag: t.string, color: colors.string },
      { tag: t.number, color: colors.number },
      { tag: t.bool, color: colors.number },
      { tag: t.null, color: colors.number },
      { tag: t.propertyName, color: colors.propertyName },
      { tag: t.comment, color: colors.comment, fontStyle: 'italic' },
      { tag: t.variableName, color: colors.number },
      { tag: t.typeName, color: colors.propertyName },
      { tag: t.operator, color: colors.keyword },
      { tag: t.punctuation, color: colors.punctuation },
      { tag: t.bracket, color: colors.punctuation },
    ]);

    highlightStyleCache.set(themeMode, highlightStyle);
  }

  return highlightStyle;
}

const themeExtensionCache = new LRUCache<ThemeMode, ReturnType<typeof EditorView.theme>>(
  THEME_CACHE_CAPACITY
);

function getThemeExtension(isDark: boolean): ReturnType<typeof EditorView.theme> {
  const themeMode: ThemeMode = isDark ? 'dark' : 'light';

  let themeExtension = themeExtensionCache.get(themeMode);
  if (!themeExtension) {
    const colors = isDark ? DARK_HIGHLIGHT_COLORS : LIGHT_HIGHLIGHT_COLORS;

    themeExtension = EditorView.theme({
      '&': {
        fontSize: '12px',
        fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', Consolas, monospace",
        backgroundColor: colors.bg,
        height: '100%',
      },
      '&.cm-focused': { outline: 'none' },
      '.cm-scroller': {
        overflow: 'auto',
        fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', Consolas, monospace",
        height: '100%',
        // Firefox scrollbar styling
        scrollbarWidth: 'thin',
        scrollbarColor: isDark ? '#444 transparent' : '#ccc transparent',
      },
      // WebKit scrollbar styling (Chrome, Safari, Edge)
      '.cm-scroller::-webkit-scrollbar': {
        width: '10px',
        height: '10px',
      },
      '.cm-scroller::-webkit-scrollbar-track': {
        background: 'transparent',
      },
      '.cm-scroller::-webkit-scrollbar-thumb': {
        background: isDark ? '#444' : '#ccc',
        borderRadius: '5px',
        border: '2px solid transparent',
        backgroundClip: 'padding-box',
      },
      '.cm-scroller::-webkit-scrollbar-thumb:hover': {
        background: isDark ? '#555' : '#999',
      },
      '.cm-content': {
        padding: '12px 0',
        minHeight: '100%',
      },
      '.cm-line': { padding: '0 4px', lineHeight: '18px' },
      '.cm-selectionBackground': { background: colors.selectionBg },
      '&.cm-focused .cm-selectionBackground': { background: colors.selectionBgFocused },
      '.cm-gutters': {
        backgroundColor: colors.gutter,
        color: colors.gutterText,
        border: 'none',
        minHeight: '100%',
      },
      '.cm-gutterElement': {
        padding: '0 4px',
        minWidth: '20px',
        textAlign: 'right',
        fontSize: '11px',
        lineHeight: '18px',
      },
      '.cm-foldGutter': {
        width: '20px',
      },
      '.cm-foldPlaceholder': {
        backgroundColor: colors.foldPlaceholder,
        border: 'none',
        color: colors.foldPlaceholderText,
        padding: '0 4px',
        margin: '0 2px',
        borderRadius: '2px',
        fontSize: '11px',
      },
    });

    themeExtensionCache.set(themeMode, themeExtension);
  }

  return themeExtension;
}

// ============================================================================
// Language Extensions
// ============================================================================

const languageExtensions = {
  json: json(),
  yaml: yaml(),
  plaintext: [],
} as const;

function getLanguageExtension(lang: LanguageType) {
  return languageExtensions[lang];
}

// ============================================================================
// Compartment Factory
// ============================================================================

function createEditorCompartments(): EditorCompartments {
  return {
    readOnly: new Compartment(),
    placeholder: new Compartment(),
    theme: new Compartment(),
    highlightStyle: new Compartment(),
    language: new Compartment(),
  };
}

// ============================================================================
// Debounce Hook
// ============================================================================

function useDebounceCallback<T extends (...args: never[]) => unknown>(
  callback: T,
  delay: number
): T {
  const timeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const callbackRef = React.useRef(callback);

  React.useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  React.useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return React.useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        callbackRef.current(...args);
      }, delay);
    },
    [delay]
  ) as T;
}

// ============================================================================
// Error Boundary Component
// ============================================================================

interface EditorErrorBoundaryProps {
  children: React.ReactNode;
  height?: string;
  onError?: (error: Error) => void;
}

interface EditorErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class EditorErrorBoundary extends React.Component<
  EditorErrorBoundaryProps,
  EditorErrorBoundaryState
> {
  constructor(props: EditorErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): EditorErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error) {
    this.props.onError?.(error);
    toast.error('Editor initialization failed');
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          className="flex items-center justify-center rounded-md border border-red-300 bg-red-50 dark:border-red-900 dark:bg-red-950"
          style={{ height: this.props.height || '400px' }}
        >
          <div className="text-center">
            <p className="text-sm font-medium text-red-900 dark:text-red-100">
              Editor failed to initialize
            </p>
            {this.state.error && (
              <p className="mt-1 text-xs text-red-700 dark:text-red-300">
                {this.state.error.message}
              </p>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// ============================================================================
// Main Component
// ============================================================================

export function PreviewEditor({
  value,
  language,
  height = '400px',
  onChange,
  placeholder,
  debounceMs = 150,
}: PreviewEditorProps) {
  const { theme, systemTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  // Refs
  const compartmentsRef = React.useRef<EditorCompartments>(createEditorCompartments());
  const editorRef = React.useRef<HTMLDivElement>(null);
  const viewRef = React.useRef<EditorView | null>(null);
  const onChangeRef = React.useRef(onChange);
  const isUserChangeRef = React.useRef(false);

  // Memoized theme state with proper type narrowing
  const themeState = React.useMemo(() => {
    const currentTheme = theme === 'system' ? systemTheme : theme;
    // Ensure we always have a valid theme
    const resolvedTheme: ThemeMode =
      currentTheme === 'dark' ? 'dark' : currentTheme === 'light' ? 'light' : 'light';

    return {
      isDark: resolvedTheme === 'dark',
      resolvedTheme,
    };
  }, [theme, systemTheme]);

  // Debounced onChange callback
  const debouncedOnChange = useDebounceCallback(
    React.useCallback((val: string) => {
      onChangeRef.current?.(val);
    }, []),
    debounceMs
  );

  // Memoized base extensions that don't change
  const baseExtensions = React.useMemo(
    () => [
      keymap.of([...defaultKeymap, ...historyKeymap, ...searchKeymap]),
      history(),
      drawSelection(),
      dropCursor(),
      lineNumbers(),
      highlightSelectionMatches(),
    ],
    []
  );

  // Memoized fold gutter config
  const foldGutterExt = React.useMemo(
    () =>
      foldGutter({
        openText: '▼',
        closedText: '▶',
      }),
    []
  );

  // Memoized bracket matching and indent extensions
  const structuralExtensions = React.useMemo(
    () => (language !== 'plaintext' ? [bracketMatching(), indentOnInput()] : []),
    [language]
  );

  // Update onChange ref without causing re-renders
  React.useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  // Handle hydration
  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Initialize CodeMirror editor
  React.useEffect(() => {
    if (!mounted || !editorRef.current) return;

    const { isDark } = themeState;
    const themeExtension = getThemeExtension(isDark);
    const highlightStyle = getHighlightStyle(isDark);
    const languageExtension = getLanguageExtension(language);

    const compartments = compartmentsRef.current;

    const extensions = [
      ...baseExtensions,
      foldGutterExt,
      ...structuralExtensions,
      // Language-specific extensions
      compartments.language.of(languageExtension),
      // Syntax highlighting
      compartments.highlightStyle.of(syntaxHighlighting(highlightStyle)),
      // Theme
      compartments.theme.of(themeExtension),
      // Read-only state
      compartments.readOnly.of(EditorState.readOnly.of(!onChange)),
      // Placeholder
      compartments.placeholder.of(placeholderExt(placeholder || '')),
      // Update listener for onChange
      EditorView.updateListener.of((update) => {
        if (update.docChanged) {
          isUserChangeRef.current = true;
          if (onChangeRef.current) {
            debouncedOnChange(update.state.doc.toString());
          }
        }
      }),
    ];

    const startState = EditorState.create({
      doc: value || '',
      extensions,
    });

    let view: EditorView | null = null;

    try {
      view = new EditorView({
        state: startState,
        parent: editorRef.current,
      });
      viewRef.current = view;
    } catch (error) {
      throw new Error(
        `Failed to initialize CodeMirror: ${error instanceof Error ? error.message : String(error)}`
      );
    }

    return () => {
      if (view) {
        view.destroy();
        viewRef.current = null;
      }
    };
    // Only re-initialize on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted]);

  // Combined update effect for language, theme, readOnly, placeholder
  // This reduces multiple dispatch calls into a single batch
  React.useEffect(() => {
    if (!viewRef.current || !mounted) return;

    const { isDark } = themeState;
    const themeExtension = getThemeExtension(isDark);
    const highlightStyle = getHighlightStyle(isDark);
    const languageExtension = getLanguageExtension(language);

    const effects: StateEffect<unknown>[] = [];

    // Language update
    effects.push(compartmentsRef.current.language.reconfigure(languageExtension));

    // Theme and highlight style update
    effects.push(compartmentsRef.current.theme.reconfigure(themeExtension));
    effects.push(
      compartmentsRef.current.highlightStyle.reconfigure(syntaxHighlighting(highlightStyle))
    );

    // Read-only state update
    effects.push(
      compartmentsRef.current.readOnly.reconfigure(EditorState.readOnly.of(!onChange))
    );

    // Placeholder update
    effects.push(compartmentsRef.current.placeholder.reconfigure(placeholderExt(placeholder || '')));

    viewRef.current.dispatch({
      effects,
    });
  }, [language, themeState.isDark, onChange, placeholder, mounted]);

  // Update document value from outside changes
  // Only update if the change didn't come from the user
  React.useEffect(() => {
    if (!viewRef.current) return;

    const currentValue = viewRef.current.state.doc.toString();

    // Skip update if this was a user-triggered change
    if (isUserChangeRef.current) {
      isUserChangeRef.current = false;
      return;
    }

    if (currentValue !== value) {
      viewRef.current.dispatch({
        changes: {
          from: 0,
          to: currentValue.length,
          insert: value || '',
        },
      });
    }
  }, [value]);

  return (
    <EditorErrorBoundary height={height}>
      <div
        className={`rounded-md border ${
          themeState.isDark ? 'border-stone-800 bg-stone-950' : 'border-stone-200 bg-white'
        }`}
        style={{ height, overflow: 'hidden' }}
      >
        {!mounted && (
          <div className="flex h-full items-center justify-center py-20">
            <div className="text-sm text-stone-500">Loading editor...</div>
          </div>
        )}
        <div ref={editorRef} className="h-full overflow-auto" />
      </div>
    </EditorErrorBoundary>
  );
}
