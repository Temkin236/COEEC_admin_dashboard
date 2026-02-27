"use client"

import React, { useEffect, useMemo } from "react"
import { EditorContent, useEditor } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Image from "@tiptap/extension-image"
import Link from "@tiptap/extension-link"
import TextAlign from "@tiptap/extension-text-align"
import Underline from "@tiptap/extension-underline"
import "./RichEditor.css"

type RichViewerProps = {
  content: any
  className?: string
}

const coerceToTiptapDoc = (content: any) => {
  if (!content) return { type: "doc", content: [] }

  // Backend may store the doc as a full TipTap JSON object OR as an array of nodes.
  if (Array.isArray(content)) {
    return { type: "doc", content }
  }

  if (typeof content === "object") {
    // If it's a node (e.g., { type: 'paragraph', ... }) wrap it.
    if ((content as any).type && (content as any).type !== "doc") {
      return { type: "doc", content: [content] }
    }

    // If it's missing type but looks like a doc (content array), wrap it.
    if (!(content as any).type && Array.isArray((content as any).content)) {
      return { type: "doc", content: (content as any).content }
    }

    return content
  }

  if (typeof content === "string") {
    const trimmed = content.trim()

    // JSON string
    if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
      try {
        return JSON.parse(trimmed)
      } catch {
        // fall through to plain text
      }
    }

    // Plain text
    return {
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [{ type: "text", text: content }],
        },
      ],
    }
  }

  return { type: "doc", content: [] }
}

const RichViewer: React.FC<RichViewerProps> = ({ content, className }) => {
  const resolvedContent = useMemo(() => coerceToTiptapDoc(content), [content])

  const ResolvedImage = useMemo(
    () =>
      Image.extend({
        addAttributes() {
          return {
            ...this.parent?.(),
            width: {
              default: null,
              parseHTML: (element) => {
                const widthAttr = element.getAttribute("width")
                const parsed = widthAttr ? Number(widthAttr) : null
                return Number.isFinite(parsed) ? parsed : null
              },
              renderHTML: () => ({}),
            },
            align: {
              default: "left",
              parseHTML: (element) => element.getAttribute("data-align") || "left",
              renderHTML: (attributes) => {
                const align = (attributes.align as string) || "left"
                const styleParts: string[] = []

                if (align === "center") styleParts.push("margin-left: auto", "margin-right: auto")
                if (align === "right") styleParts.push("margin-left: auto")
                if (align === "justify") styleParts.push("width: 100%")

                // Keep width px (if provided) unless justify overrides it.
                const width = attributes.width ? Number(attributes.width) : null
                if (width && align !== "justify") {
                  styleParts.push(`width: ${width}px`)
                }
                styleParts.push("max-width: 100%", "height: auto")

                return {
                  "data-align": align,
                  style: styleParts.join("; "),
                }
              },
            },
          }
        },
      }).configure({ inline: false, allowBase64: true }),
    [],
  )

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3, 4] } }),
      ResolvedImage,
      Underline,
      TextAlign.configure({ types: ["heading", "paragraph"], alignments: ["left", "center", "right", "justify"] }),
      Link.configure({
        openOnClick: true,
        HTMLAttributes: { class: "text-blue-500 underline cursor-pointer" },
      }),
    ],
    content: resolvedContent,
    editable: false,
    editorProps: {
      attributes: {
        class: `focus:outline-none ${className || ""}`.trim(),
      },
    },
  })

  useEffect(() => {
    if (!editor) return

    const current = editor.getJSON()
    if (JSON.stringify(current) !== JSON.stringify(resolvedContent)) {
      editor.commands.setContent(resolvedContent, false)
    }
  }, [editor, resolvedContent])

  if (!editor) return null

  return (
    <div className="editor-content rich-viewer">
      <EditorContent editor={editor} />
    </div>
  )
}

export default RichViewer
