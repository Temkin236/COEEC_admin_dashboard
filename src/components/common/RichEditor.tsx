"use client"

import React, { useEffect, useMemo, useRef } from "react"
import { useEditor, EditorContent, NodeViewWrapper, ReactNodeViewRenderer } from "@tiptap/react"
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
  onUploadingChange?: (isUploading: boolean) => void
}

const DEFAULT_IMAGE_WIDTH_PX = 280

const ResizableImageView = (props: any) => {
  const { node, selected, updateAttributes } = props
  const startXRef = useRef(0)
  const startWidthRef = useRef<number>(Number(node?.attrs?.width) || DEFAULT_IMAGE_WIDTH_PX)
  const startHeightRef = useRef<number | null>(node?.attrs?.height ? Number(node.attrs.height) : null)

  const onHandleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    startXRef.current = e.clientX
    startWidthRef.current = Number(node?.attrs?.width) || DEFAULT_IMAGE_WIDTH_PX

    const onMove = (ev: MouseEvent) => {
      const delta = ev.clientX - startXRef.current
      const next = Math.max(120, Math.min(2000, startWidthRef.current + delta))
      updateAttributes({ width: Math.round(next) })
    }

    const onUp = () => {
      window.removeEventListener("mousemove", onMove)
      window.removeEventListener("mouseup", onUp)
    }

    window.addEventListener("mousemove", onMove)
    window.addEventListener("mouseup", onUp)
  }

  const width = Number(node?.attrs?.width) || DEFAULT_IMAGE_WIDTH_PX
  const height = node?.attrs?.height ? Number(node.attrs.height) : null
  const align: string = node?.attrs?.align || "left"

  const computedWidth = align === "justify" ? "100%" : width
  const marginStyle =
    align === "center" ? { marginLeft: "auto", marginRight: "auto" } :
      align === "right" ? { marginLeft: "auto" } :
        { }

  return (
    <NodeViewWrapper className={`resizable-image ${selected ? "is-selected" : ""}`.trim()}>
      <div className="resizable-image__inner" style={{ width: computedWidth, ...marginStyle }} contentEditable={false}>
        <img src={node.attrs.src} alt={node.attrs.alt || ""} draggable={false} style={{ width: computedWidth, height: height ? `${height}px` : 'auto' }} />
        {selected && (
          <div className="resizable-image__controls" contentEditable={false}>
            {align !== "justify" && <div className="resizable-image__handle" onMouseDown={onHandleMouseDown} />}
            <div className="resizable-image__inputs" contentEditable={false}>
              <input
                type="number"
                min={50}
                max={2000}
                value={Number(node?.attrs?.width) || DEFAULT_IMAGE_WIDTH_PX}
                onChange={(e) => {
                  const v = Number(e.target.value) || DEFAULT_IMAGE_WIDTH_PX
                  updateAttributes({ width: Math.round(v) })
                }}
                className="resizable-image__input"
                title="Width (px)"
              />
              <input
                type="number"
                min={0}
                max={2000}
                value={height || ''}
                onChange={(e) => {
                  const raw = e.target.value
                  const v = raw === '' ? null : Number(raw)
                  updateAttributes({ height: v })
                }}
                className="resizable-image__input"
                title="Height (px) (leave blank for auto)"
              />
            </div>
          </div>
        )}
      </div>
    </NodeViewWrapper>
  )
}

const RichEditor: React.FC<RichEditorProps> = ({ value, onChange, uploadImage, onUploadingChange }) => {
  const inputRef = useRef<HTMLInputElement | null>(null)

  const pendingUploadsRef = useRef(0)
  const lastUploadingRef = useRef(false)

  const bumpUploading = (delta: number) => {
    pendingUploadsRef.current = Math.max(0, pendingUploadsRef.current + delta)
    const nextUploading = pendingUploadsRef.current > 0
    if (nextUploading !== lastUploadingRef.current) {
      lastUploadingRef.current = nextUploading
      onUploadingChange?.(nextUploading)
    }
  }

  const ResizableImage = useMemo(
    () =>
      Image.extend({
        addAttributes() {
          return {
            ...this.parent?.(),
            width: {
              default: DEFAULT_IMAGE_WIDTH_PX,
              parseHTML: (element) => {
                const widthAttr = element.getAttribute("width")
                const parsed = widthAttr ? Number(widthAttr) : DEFAULT_IMAGE_WIDTH_PX
                return Number.isFinite(parsed) ? parsed : DEFAULT_IMAGE_WIDTH_PX
              },
              renderHTML: (attributes) => {
                const width = Number(attributes.width) || DEFAULT_IMAGE_WIDTH_PX
                return { width: String(width) }
              },
            },
            height: {
              default: null,
              parseHTML: (element) => {
                const val = element.getAttribute("height")
                const parsed = val ? Number(val) : null
                return Number.isFinite(parsed) ? parsed : null
              },
              renderHTML: (attributes) => {
                return attributes.height ? { height: String(attributes.height) } : {}
              },
            },
            uploadId: {
              default: null,
              parseHTML: (element) => element.getAttribute("data-upload-id"),
              renderHTML: (attributes) =>
                attributes.uploadId ? { "data-upload-id": String(attributes.uploadId) } : {},
            },
            align: {
              default: "left",
              parseHTML: (element) => element.getAttribute("data-align") || "left",
              renderHTML: (attributes) =>
                attributes.align ? { "data-align": String(attributes.align) } : {},
            },
          }
        },
        addNodeView() {
          return ReactNodeViewRenderer(ResizableImageView)
        },
      }).configure({
        inline: false,
        allowBase64: true,
      }),
    [],
  )

  const normalizeMediaUrl = (rawUrl: string) => {
    if (!rawUrl) return rawUrl
    const cleaned = rawUrl.replace(/\\/g, "/")
    if (cleaned.startsWith('blob:') || cleaned.startsWith('data:')) return cleaned
    if (cleaned.startsWith('http://') || cleaned.startsWith('https://')) return cleaned

    // Media is typically served from the backend root, not the `/api` path.
    const backendRoot = (import.meta as any)?.env?.VITE_API_BASE_URL?.replace(/\/api\/?$/, '') || ''
    if (!backendRoot) return cleaned

    if (cleaned.startsWith('/')) return `${backendRoot}${cleaned}`
    return `${backendRoot}/${cleaned}`
  }

  const isLikelyImageUrl = (url: string) => /\.(png|jpe?g|gif|webp|svg)(\?|#|$)/i.test(url)

  const getMediaUrlCandidates = (result: any) => {
    const raw = [
      result?.path,
      result?.url,
      result?.data?.path,
      result?.data?.url,
    ].filter(Boolean) as string[]

    const normalized = raw.map(normalizeMediaUrl)
    // De-dupe while preserving order
    const unique: string[] = []
    for (const u of normalized) {
      if (!unique.includes(u)) unique.push(u)
    }

    // Prefer URLs that look like actual image files
    const likely = unique.filter(isLikelyImageUrl)
    const other = unique.filter((u) => !isLikelyImageUrl(u))
    return [...likely, ...other]
  }

  const waitForImageLoad = (src: string) =>
    new Promise<void>((resolve, reject) => {
      const img = new window.Image()
      img.onload = () => resolve()
      img.onerror = () => reject(new Error(`Failed to load image: ${src}`))
      img.src = src
    })

  const replaceImageSrcByUploadId = (uploadId: string, newSrc: string) => {
    if (!editor) return false

    let foundPos: number | null = null
    editor.state.doc.descendants((node, pos) => {
      if (node.type.name === 'image' && node.attrs?.uploadId === uploadId) {
        foundPos = pos
        return false
      }
      return true
    })

    if (foundPos == null) return false

    const { tr } = editor.state
    tr.setNodeMarkup(foundPos, undefined, {
      ...editor.state.doc.nodeAt(foundPos)?.attrs,
      src: newSrc,
      uploadId: null,
    })
    editor.view.dispatch(tr)
    return true
  }

  const deleteImageByUploadId = (uploadId: string) => {
    if (!editor) return false

    let foundPos: number | null = null
    let nodeSize: number | null = null
    editor.state.doc.descendants((node, pos) => {
      if (node.type.name === 'image' && node.attrs?.uploadId === uploadId) {
        foundPos = pos
        nodeSize = node.nodeSize
        return false
      }
      return true
    })

    if (foundPos == null || nodeSize == null) return false
    const { tr } = editor.state
    tr.delete(foundPos, foundPos + nodeSize)
    editor.view.dispatch(tr)
    return true
  }

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3, 4]
        }
      }),
      ResizableImage,
      Underline,
      TextAlign.configure({ 
        types: ['heading', 'paragraph'],
        alignments: ['left', 'center', 'right', 'justify']
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
    if (!editor) return

    // Keep editor synchronized with external value, including empty values.
    if (value === undefined || value === null || value === "") {
      if (!editor.isEmpty) {
        editor.commands.clearContent(false)
      }
      return
    }

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

    // Capture the current selection so we can insert the image where the cursor was
    // when the user picked the file (async upload may complete after selection changes).
    const selectionFrom = editor.state.selection.from
    const selectionTo = editor.state.selection.to
    
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
    
    let previewUrl: string | null = null
    let uploadId: string | null = null

    try {
      bumpUploading(1)

      // 1) Insert immediate local preview (like Profile upload)
      previewUrl = URL.createObjectURL(chosen)
      uploadId = `${Date.now()}-${Math.random().toString(16).slice(2)}`
      const docSize = editor.state.doc.content.size
      const from = Math.max(0, Math.min(selectionFrom, docSize))
      const to = Math.max(0, Math.min(selectionTo, docSize))

      editor
        .chain()
        .focus()
        .setTextSelection({ from, to })
        .setImage({ src: previewUrl, alt: chosen.name, width: DEFAULT_IMAGE_WIDTH_PX, uploadId } as any)
        .run()

      // 2) Upload, then replace preview src without moving cursor
      const result = await uploadImage(chosen)
      const candidates = getMediaUrlCandidates(result)
      if (candidates.length === 0) {
        if (uploadId) deleteImageByUploadId(uploadId)
        if (previewUrl) URL.revokeObjectURL(previewUrl)
        throw new Error('No URL returned from upload')
      }

      // Choose the first candidate that actually loads.
      // IMPORTANT: even if none load, we still replace blob: with the first persistent candidate
      // so content doesn't end up saving a blob URL.
      let chosenFinalUrl = candidates[0]
      for (const candidate of candidates) {
        try {
          await waitForImageLoad(candidate)
          chosenFinalUrl = candidate
          break
        } catch {
          // try next
        }
      }

      const replaced = replaceImageSrcByUploadId(uploadId, chosenFinalUrl)
      if (previewUrl) URL.revokeObjectURL(previewUrl)

      // If we couldn't find the preview image node, it was likely deleted; avoid inserting duplicates.
      if (!replaced) return
    } catch (error) {
      console.error("Image upload failed:", error)

      // Don't leave blob: images in the document.
      if (uploadId) {
        deleteImageByUploadId(uploadId)
      }

      if (previewUrl) {
        try {
          URL.revokeObjectURL(previewUrl)
        } catch {
          // ignore
        }
      }

      alert('Failed to upload image. Please try again.')
    } finally {
      bumpUploading(-1)
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
    
    editor.chain().focus().setImage({ src: url, width: DEFAULT_IMAGE_WIDTH_PX } as any).run()
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

  const setAlign = (align: 'left' | 'center' | 'right' | 'justify') => {
    if (!editor) return
    editor.chain().focus().setTextAlign(align).run()

    // Also apply alignment to the currently selected image (if any)
    if (editor.isActive('image')) {
      editor.commands.updateAttributes('image', { align })
    }
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
          onClick={() => setAlign('left')} 
          className={`${btnClass} ${btnActiveClass(editor?.isActive({ textAlign: 'left' }) || false)}`}
        >
          <AlignLeftOutlined />
        </button>
        <button 
          type="button"
          title="Align Center" 
          onClick={() => setAlign('center')} 
          className={`${btnClass} ${btnActiveClass(editor?.isActive({ textAlign: 'center' }) || false)}`}
        >
          <AlignCenterOutlined />
        </button>
        <button 
          type="button"
          title="Align Right" 
          onClick={() => setAlign('right')} 
          className={`${btnClass} ${btnActiveClass(editor?.isActive({ textAlign: 'right' }) || false)}`}
        >
          <AlignRightOutlined />
        </button>
        <button 
          type="button"
          title="Justify" 
          onClick={() => setAlign('justify')} 
          className={`${btnClass} ${btnActiveClass(editor?.isActive({ textAlign: 'justify' }) || false)}`}
        >
          J
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
        <button 
          type="button"
          title="Heading 3" 
          onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()} 
          className={`${btnClass} font-semibold ${btnActiveClass(editor?.isActive('heading', { level: 3 }) || false)}`}
        >
          H3
        </button>
        <button 
          type="button"
          title="Heading 4" 
          onClick={() => editor?.chain().focus().toggleHeading({ level: 4 }).run()} 
          className={`${btnClass} font-semibold ${btnActiveClass(editor?.isActive('heading', { level: 4 }) || false)}`}
        >
          H4
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
