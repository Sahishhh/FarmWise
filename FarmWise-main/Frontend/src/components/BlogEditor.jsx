import React, { useRef, useEffect } from 'react';
import { FaBold, FaItalic, FaUnderline, FaAlignLeft, FaAlignCenter, FaAlignRight } from 'react-icons/fa';

const BlogEditor = ({ content, onChange }) => {
  const editorRef = useRef(null);

  useEffect(() => {
    if (editorRef.current && !editorRef.current.innerHTML && content) {
      editorRef.current.innerHTML = content;
    }
  }, [content]);

  const handleCommand = (command, value = null) => {
    document.execCommand(command, false, value);
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const handleChange = () => {
    if (editorRef.current) {
      // Save the current cursor position
      const selection = window.getSelection();
      const range = selection.getRangeAt(0);
      const start = range.startOffset;
      const end = range.endOffset;

      onChange(editorRef.current.innerHTML);

      // Restore the cursor position
      if (editorRef.current.firstChild) {
        range.setStart(editorRef.current.firstChild, start);
        range.setEnd(editorRef.current.firstChild, end);
        selection.removeAllRanges();
        selection.addRange(range);
      }
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text/plain');
    document.execCommand('insertText', false, text);
  };

  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="border-b border-gray-200 p-4 flex gap-2 flex-wrap">
        <button
          onClick={() => handleCommand('bold')}
          className="p-2 rounded hover:bg-gray-100"
          type="button"
        >
          <FaBold />
        </button>
        <button
          onClick={() => handleCommand('italic')}
          className="p-2 rounded hover:bg-gray-100"
          type="button"
        >
          <FaItalic />
        </button>
        <button
          onClick={() => handleCommand('underline')}
          className="p-2 rounded hover:bg-gray-100"
          type="button"
        >
          <FaUnderline />
        </button>
        <button
          onClick={() => handleCommand('justifyLeft')}
          className="p-2 rounded hover:bg-gray-100"
          type="button"
        >
          <FaAlignLeft />
        </button>
        <button
          onClick={() => handleCommand('justifyCenter')}
          className="p-2 rounded hover:bg-gray-100"
          type="button"
        >
          <FaAlignCenter />
        </button>
        <button
          onClick={() => handleCommand('justifyRight')}
          className="p-2 rounded hover:bg-gray-100"
          type="button"
        >
          <FaAlignRight />
        </button>
      </div>
      <div
        ref={editorRef}
        contentEditable
        className="p-4 min-h-[200px] focus:outline-none"
        onInput={handleChange}
        onPaste={handlePaste}
        placeholder="Write your blog content here..."
        style={{ 
          minHeight: '200px',
          cursor: 'text',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word'
        }}
      />
    </div>
  );
};

export default BlogEditor;
