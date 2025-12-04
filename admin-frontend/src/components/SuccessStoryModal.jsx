import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { X, Upload } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

const SuccessStoryModal = ({ isOpen, onClose, story, onSave }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    url: '',
    images: [],
  });
  const [existingImages, setExistingImages] = useState([]);
  const [previewImages, setPreviewImages] = useState([]);
  const [imagesToDelete, setImagesToDelete] = useState([]);
  const [csrfToken, setCsrfToken] = useState('');
  const [error, setError] = useState(null);
  const [wordCount, setWordCount] = useState(0);
  const MAX_WORDS = 500;

  useEffect(() => {
    console.log('SuccessStoryModal useEffect triggered. Story:', story);
    const getCsrfToken = async () => {
      try {
        const response = await axios.get('/api/get-csrf-token/', {
          withCredentials: true,
        });
        setCsrfToken(response.data.csrfToken);
        console.log('CSRF token fetched:', response.data.csrfToken);
      } catch (error) {
        console.error('Error fetching CSRF token:', error);
        setError('Failed to fetch CSRF token. Please try again.');
        toast.error('Failed to fetch CSRF token.');
      }
    };
    getCsrfToken();

    if (story) {
      try {
        console.log('Editing story:', story);
        setFormData({
          title: story.title || '',
          description: story.description || '',
          url: story.url || '',
          images: [],
        });
        const validImages = Array.isArray(story.images)
          ? story.images.filter(
              (img) =>
                img &&
                typeof img === 'object' &&
                img.id &&
                img.image &&
                typeof img.image === 'string'
            )
          : [];
        setExistingImages(validImages);
        setPreviewImages([]);
        setImagesToDelete([]);
        const descriptionText = story.description || '';
        const words = descriptionText
          .trim()
          .split(/\s+/)
          .filter((word) => word.length > 0);
        setWordCount(words.length);
        console.log('Existing images:', validImages);
      } catch (err) {
        console.error('Error processing story data:', err);
        setError('Invalid story data. Please try again.');
        toast.error('Invalid story data.');
      }
    } else {
      console.log('Adding new story');
      setFormData({ title: '', description: '', url: '', images: [] });
      setExistingImages([]);
      setPreviewImages([]);
      setImagesToDelete([]);
      setWordCount(0);
    }
  }, [story]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleDescriptionChange = (e) => {
    const value = e.target.value;
    console.log('Textarea onChange triggered. Value:', value);
    try {
      const words = value.trim().split(/\s+/).filter((word) => word.length > 0);
      if (words.length <= MAX_WORDS) {
        setFormData({ ...formData, description: value });
        setWordCount(words.length);
      } else {
        toast.error(`Description cannot exceed ${MAX_WORDS} words.`);
      }
    } catch (err) {
      console.error('Error handling description change:', err);
      setError('Error updating description. Please try again.');
    }
  };

  const handleImageChange = (e) => {
    try {
      const files = Array.from(e.target.files);
      setFormData({ ...formData, images: [...formData.images, ...files] });
      const previews = files.map((file) => URL.createObjectURL(file));
      setPreviewImages([...previewImages, ...previews]);
      console.log('New images added:', files);
    } catch (err) {
      console.error('Error handling image change:', err);
      setError('Error uploading images. Please try again.');
      toast.error('Error uploading images.');
    }
  };

  const handleRemoveNewImage = (index) => {
    try {
      const newImages = [...formData.images];
      const newPreviews = [...previewImages];
      newImages.splice(index, 1);
      newPreviews.splice(index, 1);
      setFormData({ ...formData, images: newImages });
      setPreviewImages(newPreviews);
      console.log('Removed new image at index:', index);
    } catch (err) {
      console.error('Error removing new image:', err);
      setError('Error removing image. Please try again.');
    }
  };

  const handleRemoveExistingImage = (index, imageId) => {
    try {
      const newExistingImages = [...existingImages];
      newExistingImages.splice(index, 1);
      setExistingImages(newExistingImages);
      setImagesToDelete([...imagesToDelete, imageId]);
      console.log('Removed existing image with ID:', imageId);
    } catch (err) {
      console.error('Error removing existing image:', err);
      setError('Error removing existing image. Please try again.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!csrfToken) {
      setError('CSRF token is missing. Please try again.');
      toast.error('CSRF token is missing.');
      return;
    }

    try {
      const form = new FormData();
      form.append('title', formData.title);
      form.append('description', formData.description);
      if (formData.url) form.append('url', formData.url);
      formData.images.forEach((image) => form.append('images', image));
      imagesToDelete.forEach((id) => form.append('images_to_delete', id));
      console.log('Submitting form data:', formData, 'Images to delete:', imagesToDelete);

      if (story) {
        await axios.put(`/api/success-stories/${story.id}/`, form, {
          headers: {
            'Content-Type': 'multipart/form-data',
            'X-CSRFToken': csrfToken,
          },
          withCredentials: true,
        });
        console.log('Story updated successfully');
      } else {
        await axios.post('/api/success-stories/', form, {
          headers: {
            'Content-Type': 'multipart/form-data',
            'X-CSRFToken': csrfToken,
          },
          withCredentials: true,
        });
        console.log('Story created successfully');
      }
      onSave();
      onClose();
    } catch (error) {
      console.error('Error saving success story:', error);
      const errorMessage = error.response?.data?.message || 'Failed to save success story.';
      setError(errorMessage);
      toast.error(errorMessage);
    }
  };

  if (!isOpen) {
    console.log('Modal is closed');
    return null;
  }

  console.log('Rendering SuccessStoryModal');
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        className="bg-white rounded-lg p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl"
      >
        {error && <div className="text-red-500 mb-4">{error}</div>}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-purple-800">
            {story ? 'Edit Success Story' : 'Add Success Story'}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">Title</label>
            <input
              type="text"
              name="title"
              value={formData.title || ''}
              onChange={handleInputChange}
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-purple-600 focus:ring-2 focus:ring-purple-200 transition"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">Description</label>
            <div className="relative">
              <textarea
                name="description"
                value={formData.description || ''}
                onChange={handleDescriptionChange}
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-purple-600 focus:ring-2 focus:ring-purple-200 transition h-40"
              />
              <div className="absolute -bottom-6 right-0 text-sm flex items-center gap-2">
                <span className={`font-medium ${wordCount > MAX_WORDS ? 'text-red-500' : 'text-gray-500'}`}>
                  {wordCount}/{MAX_WORDS}
                </span>
                <span className="text-gray-400">Words</span>
              </div>
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">URL (Optional)</label>
            <input
              type="url"
              name="url"
              value={formData.url || ''}
              onChange={handleInputChange}
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-purple-600 focus:ring-2 focus:ring-purple-200 transition"
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">Images</label>
            <div className="relative flex items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageChange}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
              <div className="flex flex-col items-center text-gray-500">
                <Upload size={24} />
                <span>Upload Images</span>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {existingImages.map((img, index) => (
                <div key={img.id || `existing-${index}`} className="relative">
                  <img
                    src={img.image}
                    alt="Existing"
                    className="w-24 h-24 object-cover rounded shadow-sm"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/150?text=Image+Not+Found';
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveExistingImage(index, img.id)}
                    className="absolute top-0 right-0 bg-red-600 text-white rounded-full p-1 transform translate-x-1/2 -translate-y-1/2 hover:bg-red-700 transition"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
              {previewImages.map((img, index) => (
                <div key={`preview-${index}`} className="relative">
                  <img src={img} alt="Preview" className="w-24 h-24 object-cover rounded shadow-sm" />
                  <button
                    type="button"
                    onClick={() => handleRemoveNewImage(index)}
                    className="absolute top-0 right-0 bg-red-600 text-white rounded-full p-1 transform translate-x-1/2 -translate-y-1/2 hover:bg-red-700 transition"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition"
            >
              Cancel
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition"
            >
              {story ? 'Update' : 'Create'}
            </motion.button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default SuccessStoryModal;