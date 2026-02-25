"use client"

import React, { useEffect, useRef } from "react"
import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Image from "@tiptap/extension-image"
import Link from "@tiptap/extension-link"
import Placeholder from "@tiptap/extension-placeholder"
import TextAlign from "@tiptap/extension-text-align"
import Underline from "@tiptap/extension-underline"
import { Divider } from "antd"
import {
  BoldOutlined, ItalicOutlined, UnderlineOutlined, OrderedListOutlined,
  UnorderedListOutlined, LinkOutlined, AlignLeftOutlined, AlignCenterOutlined,
  AlignRightOutlined, PictureOutlined, ClearOutlined
} from "@ant-design/icons"
import "./RichEditor.css"

type RichEditorProps = {
  value: any
  onChange: (content: any) => void
  uploadImage: (file: File) => Promise<{ id?: string; url?: string }>
}

const RichEditor: React.FC<RichEditorProps> = ({ value, onChange, uploadImage }) => {
  const inputRef = useRef<HTMLInputElement | null>(null)

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2]
        }
      }),
      Image.configure({
        inline: false,
        allowBase64: true,
      }),
      Underline,
      TextAlign.configure({ 
        types: ['heading', 'paragraph'],
        alignments: ['left', 'center', 'right']
      }),
      Link.configure({ 
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-500 underline cursor-pointer'
        }
      }),
      Placeholder.configure({ 
        placeholder: 'Start writing your article content here...',
        emptyEditorClass: 'is-editor-empty'
      })
    ],
    content: value || "",
    onUpdate: ({ editor }) => {
      const json = editor.getJSON()
      onChange(json)
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none focus:outline-none'
      }
    }
  })

  useEffect(() => {
    if (!editor || !value) return
    
    // Only update if content is different
    const currentContent = editor.getJSON()
    const newContent = typeof value === 'string' ? value : value
    
    if (JSON.stringify(currentContent) !== JSON.stringify(newContent)) {
      editor.commands.setContent(value, false)
    }
  }, [value, editor])

  const handleImagePick = async (file?: File) => {
    const chosen = file || (inputRef.current?.files && inputRef.current.files[0])
    if (!chosen || !editor) return
    
    // Validate file type
    if (!chosen.type.startsWith('image/')) {
      alert('Please select an image file')
      return
    }
    
    // Validate file size (max 5MB)
    if (chosen.size > 5 * 1024 * 1024) {
      alert('Image size must be less than 5MB')
      return
    }
    
    try {
      const result = await uploadImage(chosen)
      const imageUrl = result?.url || (result as any)?.data?.url
      
      if (imageUrl) {
        editor.chain().focus().setImage({ 
          src: imageUrl, 
          alt: chosen.name 
        }).run()
      } else {
        throw new Error('No URL returned from upload')
      }
    } catch (error) {
      console.error("Image upload failed:", error)
      alert('Failed to upload image. Please try again.')
    } finally {
      // Reset file input
      if (inputRef.current) {
        inputRef.current.value = ''
      }
    }
  }

  const insertImageByUrl = () => {
    if (!editor) return
    const url = window.prompt("Enter image URL:")
    if (!url) return
    
    // Basic URL validation
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      alert('Please enter a valid URL starting with http:// or https://')
      return
    }
    
    editor.chain().focus().setImage({ src: url }).run()
  }

  const clearContent = () => {
    if (!editor) return
    if (window.confirm('Are you sure you want to clear all content?')) {
      editor.commands.clearContent()
    }
  }

  const addSpacing = () => {
    if (!editor) return
    editor.chain().focus().insertContent('<p></p>').run()
  }

  const btnClass = "inline-flex items-center justify-center min-w-[36px] h-[36px] px-2 text-gray-700 hover:bg-gray-100 hover:text-gray-900 rounded transition-colors duration-150 active:bg-gray-200"
  const btnActiveClass = (isActive: boolean) => isActive ? "bg-blue-50 text-blue-600 hover:bg-blue-100" : ""

  return (
    <div className="rich-editor w-full max-w-full">
      <div className="editor-toolbar mb-3 flex flex-wrap items-center gap-1 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 w-full shadow-sm">
        {/* Text formatting */}
        <button 
          type="button"
          title="Bold" 
          onClick={() => editor?.chain().focus().toggleBold().run()} 
          className={`${btnClass} ${btnActiveClass(editor?.isActive('bold') || false)}`}
        >
          <BoldOutlined />
        </button>
        <button 
          type="button"
          title="Italic" 
          onClick={() => editor?.chain().focus().toggleItalic().run()} 
          className={`${btnClass} ${btnActiveClass(editor?.isActive('italic') || false)}`}
        >
          <ItalicOutlined />
        </button>
        <button 
          type="button"
          title="Underline" 
          onClick={() => editor?.chain().focus().toggleUnderline().run()} 
          className={`${btnClass} ${btnActiveClass(editor?.isActive('underline') || false)}`}
        >
          <UnderlineOutlined />
        </button>

        <Divider type="vertical" className="h-6 mx-1" />

        {/* Lists */}
        <button 
          type="button"
          title="Bullet List" 
          onClick={() => editor?.chain().focus().toggleBulletList().run()} 
          className={`${btnClass} ${btnActiveClass(editor?.isActive('bulletList') || false)}`}
        >
          <UnorderedListOutlined />
        </button>
        <button 
          type="button"
          title="Numbered List" 
          onClick={() => editor?.chain().focus().toggleOrderedList().run()} 
          className={`${btnClass} ${btnActiveClass(editor?.isActive('orderedList') || false)}`}
        >
          <OrderedListOutlined />
        </button>
        <button 
          type="button"
          title="Link" 
          onClick={() => {
            const url = window.prompt('Enter link URL:')
            if (url) editor?.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
          }} 
          className={`${btnClass} ${btnActiveClass(editor?.isActive('link') || false)}`}
        >
          <LinkOutlined />
        </button>

        <Divider type="vertical" className="h-6 mx-1" />

        {/* Alignment */}
        <button 
          type="button"
          title="Align Left" 
          onClick={() => editor?.chain().focus().setTextAlign('left').run()} 
          className={`${btnClass} ${btnActiveClass(editor?.isActive({ textAlign: 'left' }) || false)}`}
        >
          <AlignLeftOutlined />
        </button>
        <button 
          type="button"
          title="Align Center" 
          onClick={() => editor?.chain().focus().setTextAlign('center').run()} 
          className={`${btnClass} ${btnActiveClass(editor?.isActive({ textAlign: 'center' }) || false)}`}
        >
          <AlignCenterOutlined />
        </button>
        <button 
          type="button"
          title="Align Right" 
          onClick={() => editor?.chain().focus().setTextAlign('right').run()} 
          className={`${btnClass} ${btnActiveClass(editor?.isActive({ textAlign: 'right' }) || false)}`}
        >
          <AlignRightOutlined />
        </button>

        <Divider type="vertical" className="h-6 mx-1" />

        {/* Headings */}
        <button 
          type="button"
          title="Heading 1" 
          onClick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()} 
          className={`${btnClass} font-semibold ${btnActiveClass(editor?.isActive('heading', { level: 1 }) || false)}`}
        >
          H1
        </button>
        <button 
          type="button"
          title="Heading 2" 
          onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()} 
          className={`${btnClass} font-semibold ${btnActiveClass(editor?.isActive('heading', { level: 2 }) || false)}`}
        >
          H2
        </button>

        <Divider type="vertical" className="h-6 mx-1" />

        {/* Insert & Actions */}
        <button 
          type="button"
          title="Insert Image from File" 
          onClick={() => { if (inputRef.current) inputRef.current.click() }} 
          className={btnClass}
        >
          <PictureOutlined />
        </button>
        <button 
          type="button"
          title="Insert Image from URL" 
          onClick={insertImageByUrl} 
          className={`${btnClass} text-sm font-medium`}
        >
          URL
        </button>
        <button 
          type="button"
          title="Add Spacing" 
          onClick={addSpacing} 
          className={`${btnClass} text-xs font-medium`}
        >
          Space
        </button>

        <div className="flex-1" />

        <button 
          type="button"
          title="Clear Content" 
          onClick={clearContent} 
          className={`${btnClass} text-red-600 hover:bg-red-50 hover:text-red-700`}
        >
          <ClearOutlined />
        </button>

        <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleImagePick(e.target.files?.[0])} />
      </div>

      <div 
        className="editor-content border border-gray-200 rounded-lg p-6 bg-white text-gray-900 min-h-[420px] max-h-[600px] w-full overflow-y-auto shadow-sm prose prose-sm max-w-none" 
        data-testid="editor-root"
      >
        <EditorContent editor={editor} />
      </div>
    </div>
  )
}

export default RichEditor
