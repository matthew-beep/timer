import { Editor } from '@tiptap/react'
import { EditorContent, useEditor, useEditorState } from '@tiptap/react'
import { get } from 'http';
import { Button } from '@/components/Button';
import { BsTypeBold, BsTypeItalic, BsTypeStrikethrough, BsCodeSlash, BsListUl } from "react-icons/bs";
import { LuHeading1, LuHeading2, LuHeading3 } from "react-icons/lu";
import { Tooltip } from '@mui/material';

interface MenuBarProps {
  editor: Editor;
}

type MenuOption = {
  name: string
  action: (editor: Editor) => void
  isActive?: (editor: Editor) => boolean
  canRun?: (editor: Editor) => boolean
  icon?: React.ReactNode
}

const options: MenuOption[] = [{
    name: 'bold',
    action: (editor: Editor) => editor.chain().focus().toggleBold().run(),
    isActive: editor => editor.isActive('bold'),
    canRun: editor => editor.can().chain().toggleBold().run(),
    icon: <BsTypeBold />
  }, {
    name: 'italic',
    action: (editor: Editor) => editor.chain().focus().toggleItalic().run(),
    isActive: editor => editor.isActive('italic'),
    canRun: editor => editor.can().chain().toggleItalic().run(),
    icon: <BsTypeItalic />
  }, {
    name: 'strike',
    action: (editor: Editor) => editor.chain().focus().toggleStrike().run(),
    isActive: editor => editor.isActive('strike'),
    canRun: editor => editor.can().chain().toggleStrike().run(),
    icon: <BsTypeStrikethrough />
  }, {
    name: 'code',
    action: (editor: Editor) => editor.chain().focus().toggleCode().run(),  
    isActive: editor => editor.isActive('code'),
    canRun: editor => editor.can().chain().toggleCode().run(),
    icon: <BsCodeSlash />
  },
  {
    name: 'heading1',
    action: (editor: Editor) => editor.chain().focus().toggleHeading({ level: 1 }).run(),
    isActive: editor => editor.isActive('heading', { level: 1 }),
    icon: <LuHeading1 />
  },
  {
    name: 'list',
    action: (editor: Editor) => editor.chain().focus().toggleBulletList().run(),
    isActive: editor => editor.isActive('bulletList'),
    icon: <BsListUl />
  }
];

export default function MenuBar({ editor }: MenuBarProps) {
  // Read the current editor's state, and re-render the component when it changes


  const editorState = useEditorState({
    editor,
    selector: ctx => {
      return {
        isBold: ctx.editor.isActive('bold') ?? false,
        canBold: ctx.editor.can().chain().toggleBold().run() ?? false,
        isItalic: ctx.editor.isActive('italic') ?? false,
        canItalic: ctx.editor.can().chain().toggleItalic().run() ?? false,
        isStrike: ctx.editor.isActive('strike') ?? false,
        canStrike: ctx.editor.can().chain().toggleStrike().run() ?? false,
        isCode: ctx.editor.isActive('code') ?? false,
        canCode: ctx.editor.can().chain().toggleCode().run() ?? false,
        canClearMarks: ctx.editor.can().chain().unsetAllMarks().run() ?? false,
        isParagraph: ctx.editor.isActive('paragraph') ?? false,
        isHeading1: ctx.editor.isActive('heading', { level: 1 }) ?? false,
        isHeading2: ctx.editor.isActive('heading', { level: 2 }) ?? false,
        isHeading3: ctx.editor.isActive('heading', { level: 3 }) ?? false,
        isHeading4: ctx.editor.isActive('heading', { level: 4 }) ?? false,
        isHeading5: ctx.editor.isActive('heading', { level: 5 }) ?? false,
        isHeading6: ctx.editor.isActive('heading', { level: 6 }) ?? false,
        isBulletList: ctx.editor.isActive('bulletList') ?? false,
        isOrderedList: ctx.editor.isActive('orderedList') ?? false,
        isCodeBlock: ctx.editor.isActive('codeBlock') ?? false,
        isBlockquote: ctx.editor.isActive('blockquote') ?? false,
        canUndo: ctx.editor.can().chain().undo().run() ?? false,
        canRedo: ctx.editor.can().chain().redo().run() ?? false,
      }
    },
  })

  return (
    <div className="control-group">
      <div className="button-group flex flex-wrap justify-start gap-1 bg-[#0a1929]/80 p-1">
        {options.map((option) => (
          <Tooltip key={option.name} title={option.name.charAt(0).toUpperCase() + option.name.slice(1)}>
            <Button
              onClick={() => option.action(editor)}
              className={`${option.isActive?.(editor) ? 'bg-white/10 text-white' : ''} w-10 h-10 flex items-center justify-center rounded-full`}
              disabled={option.canRun ? !option.canRun(editor) : false}
              variant='plain'
            >
              {option.icon ? option.icon : option.name}
            </Button>
          </Tooltip>
        ))}

        {/*
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          disabled={!editorState.canBold}
          className={editorState.isBold ? 'is-active' : ''}
        >
          Bold
        </button>
        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          disabled={!editorState.canItalic}
          className={editorState.isItalic ? 'is-active' : ''}
        >
          Italic
        </button>
        <button
          onClick={() => editor.chain().focus().toggleStrike().run()}
          disabled={!editorState.canStrike}
          className={editorState.isStrike ? 'is-active' : ''}
        >
          Strike
        </button>
        <button
          onClick={() => editor.chain().focus().toggleCode().run()}
          disabled={!editorState.canCode}
          className={editorState.isCode ? 'is-active' : ''}
        >
          Code
        </button>
        <button onClick={() => editor.chain().focus().unsetAllMarks().run()}>Clear marks</button>
        <button onClick={() => editor.chain().focus().clearNodes().run()}>Clear nodes</button>
        <button
          onClick={() => editor.chain().focus().setParagraph().run()}
          className={editorState.isParagraph ? 'is-active' : ''}
        >
          Paragraph
        </button>
        <button
          onClick={() => {editor.chain().focus().toggleHeading({ level: 1 }).run(); console.log("Toggled H1")}}
          className={editorState.isHeading1 ? 'is-active' : ''}
        >
          H1
        </button>
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={editorState.isHeading2 ? 'is-active' : ''}
        >
          H2
        </button>
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={editorState.isHeading3 ? 'is-active' : ''}
        >
          H3
        </button>
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 4 }).run()}
          className={editorState.isHeading4 ? 'is-active' : ''}
        >
          H4
        </button>
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 5 }).run()}
          className={editorState.isHeading5 ? 'is-active' : ''}
        >
          H5
        </button>
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 6 }).run()}
          className={editorState.isHeading6 ? 'is-active' : ''}
        >
          H6
        </button>
        <button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={editorState.isBulletList ? 'is-active' : ''}
        >
          Bullet list
        </button>
        <button
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={editorState.isOrderedList ? 'is-active' : ''}
        >
          Ordered list
        </button>
        <button
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          className={editorState.isCodeBlock ? 'is-active' : ''}
        >
          Code block
        </button>
        <button
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={editorState.isBlockquote ? 'is-active' : ''}
        >
          Blockquote
        </button>
        <button onClick={() => editor.chain().focus().setHorizontalRule().run()}>Horizontal rule</button>
        <button onClick={() => editor.chain().focus().undo().run()} disabled={!editorState.canUndo}>
          Undo
        </button>
        <button onClick={() => editor.chain().focus().redo().run()} disabled={!editorState.canRedo}>
          Redo
        </button>
        <button onClick={() => getJSON()}>
          Save
        </button>
        */}
      </div>
    </div>
  )
}