import React, { useState, useRef, useEffect } from 'react';
import api from '../services/api';
import toast, { Toaster } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { Bold, Italic, Underline, Image, X, Clock, CheckCircle } from 'lucide-react';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import UnderlineExtension from '@tiptap/extension-underline';
import ImageExtension from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import { Sortable, MultiDrag } from 'sortablejs';
import { useSortable } from 'react-sortablejs';

const ToolbarPlugin = ({ editor, onImageInsert }) => {
  return (
    <div className="flex gap-2 p-3 bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-gray-300">
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={`p-2.5 rounded-lg transition-all ${
          editor.isActive('bold')
            ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md'
            : 'text-gray-700 hover:bg-white hover:shadow-sm'
        }`}
        title="Bold (Ctrl+B)"
      >
        <Bold size={16} />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={`p-2.5 rounded-lg transition-all ${
          editor.isActive('italic')
            ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md'
            : 'text-gray-700 hover:bg-white hover:shadow-sm'
        }`}
        title="Italic (Ctrl+I)"
      >
        <Italic size={16} />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        className={`p-2.5 rounded-lg transition-all ${
          editor.isActive('underline')
            ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md'
            : 'text-gray-700 hover:bg-white hover:shadow-sm'
        }`}
        title="Underline (Ctrl+U)"
      >
        <Underline size={16} />
      </button>
      <label className="p-2.5 text-gray-700 hover:bg-white hover:shadow-sm rounded-lg cursor-pointer transition-all" title="Insert Image">
        <Image size={16} />
        <input type="file" accept="image/*" multiple onChange={onImageInsert} hidden />
      </label>
    </div>
  );
};

const NewsletterEditor = ({ initialData = {}, isEditing = false, onSave }) => {
  const [formData, setFormData] = useState({
    title: initialData.title || '',
    subtitle: initialData.subtitle || '',
    description: initialData.description || '',
    url: initialData.url || '',
    uploaded_images: [],
  });
  const [imagePreviews, setImagePreviews] = useState(
    initialData.images?.map((img) => ({ url: img.image, id: img.id })) || []
  );
  const fileInputRef = useRef(null);
  const navigate = useNavigate();
  const sortableRef = useRef(null);

  const editor = useEditor({
    extensions: [
      StarterKit,
      UnderlineExtension,
      ImageExtension.configure({ inline: true, allowBase64: true }),
      Placeholder.configure({ placeholder: 'Enter your content here...', emptyEditorClass: 'text-gray-400' }),
    ],
    content: initialData.description || '',
    onUpdate: ({ editor }) => {
      setFormData((prev) => ({ ...prev, description: editor.getHTML() }));
    },
    editorProps: { attributes: { class: 'prose max-w-none focus:outline-none text-gray-800' } },
  });

  useEffect(() => {
    if (editor && initialData.description) {
      editor.commands.setContent(initialData.description);
    }
  }, [editor, initialData.description]);

  useEffect(() => {
    setFormData({
      title: initialData.title || '',
      subtitle: initialData.subtitle || '',
      description: initialData.description || '',
      url: initialData.url || '',
      uploaded_images: [],
    });
    setImagePreviews(initialData.images?.map((img) => ({ url: img.image, id: img.id })) || []);
  }, [initialData]);

  useEffect(() => {
    if (sortableRef.current) {
      Sortable.create(sortableRef.current, {
        animation: 150,
        handle: '.drag-handle',
        onEnd: (evt) => {
          const newPreviews = [...imagePreviews];
          const [movedItem] = newPreviews.splice(evt.oldIndex, 1);
          newPreviews.splice(evt.newIndex, 0, movedItem);
          setImagePreviews(newPreviews);
          setFormData((prev) => ({
            ...prev,
            uploaded_images: newPreviews
              .filter((preview) => !preview.id)
              .map((preview) => preview.file),
          }));
        },
      });
    }
  }, [imagePreviews]);

  const resetForm = () => {
    setFormData({
      title: '',
      subtitle: '',
      description: '',
      url: '',
      uploaded_images: [],
    });
    setImagePreviews([]);
    if (editor) {
      editor.commands.setContent('');
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + imagePreviews.length > 5) {
      toast.error('Maximum 5 images allowed');
      return;
    }
    const validFiles = files.filter((file) => {
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} is too large. Max size is 5MB`);
        return false;
      }
      return true;
    });
    setFormData((prev) => ({
      ...prev,
      uploaded_images: [...prev.uploaded_images, ...validFiles],
    }));
    setImagePreviews((prev) => [
      ...prev,
      ...validFiles.map((file) => ({ url: URL.createObjectURL(file), file })),
    ]);
  };

  const handleRemoveImage = (index) => {
    const newPreviews = [...imagePreviews];
    const removed = newPreviews.splice(index, 1)[0];
    setImagePreviews(newPreviews);
    setFormData((prev) => ({
      ...prev,
      uploaded_images: prev.uploaded_images.filter(
        (img) => img !== removed.file
      ),
    }));
    if (removed.id && isEditing) {
      // Optionally send API request to delete image
      api.delete(`newsletters/${initialData.id}/images/${removed.id}/`).catch((error) => {
        console.error('Error deleting image:', error);
        toast.error('Failed to delete image');
      });
    }
  };

  const handleImageInsert = (e) => {
    const files = Array.from(e.target.files);
    files.forEach((file) => {
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} is too large. Max size is 5MB`);
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        editor.chain().focus().setImage({ src: reader.result }).run();
      };
      reader.readAsDataURL(file);
    });
  };

  const handleSubmit = async (status) => {
    if (!formData.title) {
      toast.error('Title is required');
      return;
    }
    if (!formData.description) {
      toast.error('Description is required');
      return;
    }

    const data = new FormData();
    data.append('title', formData.title);
    data.append('subtitle', formData.subtitle || '');
    data.append('description', formData.description);
    data.append('url', formData.url || '');
    data.append('status', status);
    formData.uploaded_images.forEach((image) => {
      data.append('uploaded_images', image);
    });

    try {
      let response;
      if (isEditing) {
        response = await api.put(`newsletters/${initialData.id}/`, data);
      } else {
        response = await api.post('newsletters/', data);
      }
      toast.success(status === 'draft' ? 'Draft saved!' : 'Newsletter published!');
      onSave();
      resetForm();
      
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save newsletter');
      console.error('Save error:', error);
    }
  };

  return (
    <div className="font-inter">
      <Toaster position="top-right" toastOptions={{ className: 'bg-white/90 text-gray-800 backdrop-blur-md shadow-xl' }} />
      <form
        className="space-y-6"
        onSubmit={(e) => e.preventDefault()}
      >
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
            <span className="w-2 h-2 bg-purple-600 rounded-full"></span>
            Newsletter Title *
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="w-full px-4 py-2.5 bg-white border-2 border-gray-300 rounded-lg text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all hover:border-gray-400"
            placeholder="Enter newsletter title"
            required
          />
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
            <span className="w-2 h-2 bg-purple-600 rounded-full"></span>
            Subtitle
          </label>
          <input
            type="text"
            name="subtitle"
            value={formData.subtitle}
            onChange={handleChange}
            className="w-full px-4 py-2.5 bg-white border-2 border-gray-300 rounded-lg text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all hover:border-gray-400"
            placeholder="Add a subtitle (optional)"
          />
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
            <span className="w-2 h-2 bg-purple-600 rounded-full"></span>
            Content *
          </label>
          <div className="border-2 border-gray-300 rounded-lg overflow-hidden bg-white hover:border-gray-400 transition-colors">
            {editor && <ToolbarPlugin editor={editor} onImageInsert={handleImageInsert} />}
            <EditorContent
              editor={editor}
              className="p-4 min-h-[250px] prose max-w-none prose-headings:text-gray-800 prose-p:text-gray-700 prose-ul:list-disc prose-ol:list-decimal prose-li:text-gray-700"
            />
          </div>
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
            <span className="w-2 h-2 bg-purple-600 rounded-full"></span>
            Images <span className="text-xs text-gray-500 font-normal">(Maximum 5)</span>
          </label>
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            multiple
            onChange={handleImageChange}
            className="w-full p-3 bg-white border-2 border-dashed border-gray-300 rounded-lg text-gray-800 text-sm file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-gradient-to-r file:from-purple-600 file:to-indigo-600 file:text-white file:text-sm file:font-semibold file:hover:from-purple-700 file:hover:to-indigo-700 file:cursor-pointer file:shadow-md cursor-pointer hover:border-gray-400 transition-colors"
          />
          {imagePreviews.length > 0 && (
            <div
              ref={sortableRef}
              className="mt-3 grid grid-cols-2 gap-3"
            >
              {imagePreviews.map((preview, index) => (
                <div
                  key={index}
                  className="relative group rounded-lg overflow-hidden border border-gray-300"
                >
                  <img
                    src={preview.url}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-28 object-cover"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(index)}
                      className="bg-red-600 text-white p-2 rounded hover:bg-red-700 transition-colors"
                      title="Remove Image"
                    >
                      <X size={14} />
                    </button>
                    <div
                      className="drag-handle bg-purple-600 text-white p-2 rounded cursor-move hover:bg-purple-700 transition-colors"
                      title="Drag to Reorder"
                    >
                      <Image size={14} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
            <span className="w-2 h-2 bg-purple-600 rounded-full"></span>
            Link URL
          </label>
          <input
            type="url"
            name="url"
            value={formData.url}
            onChange={handleChange}
            className="w-full px-4 py-2.5 bg-white border-2 border-gray-300 rounded-lg text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all hover:border-gray-400"
            placeholder="https://example.com (optional)"
          />
        </div>
        <div className="flex gap-3 pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={() => handleSubmit('draft')}
            className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg transform hover:scale-[1.02]"
          >
            <Clock className="w-4 h-4" />
            Save as Draft
          </button>
          <button
            type="button"
            onClick={() => handleSubmit('published')}
            className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-4 py-3 rounded-lg font-semibold hover:from-green-700 hover:to-emerald-700 transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg transform hover:scale-[1.02]"
          >
            <CheckCircle className="w-4 h-4" />
            Publish Now
          </button>
        </div>
      </form>
    </div>
  );
};

export default NewsletterEditor;