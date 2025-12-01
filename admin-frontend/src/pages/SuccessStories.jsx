import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from '../components/Sidebar';
import SuccessStoryModal from '../components/SuccessStoryModal';
import SuccessStoryCard from '../components/SuccessStoryCard';
import SuccessStoryDetailsModal from '../components/SuccessStoryDetailsModal';
import { Plus, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';

const SuccessStories = () => {
  const [stories, setStories] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedStory, setSelectedStory] = useState(null);
  const [editingStory, setEditingStory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null); // 'delete' or 'deleteAll'
  const [confirmStoryId, setConfirmStoryId] = useState(null);

  useEffect(() => {
    fetchStories();
  }, []);

  const fetchStories = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get('http://localhost:8000/api/success-stories/', {
        withCredentials: true,
      });
      console.log('Success stories response:', response.data);
      setStories(Array.isArray(response.data) ? response.data : []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching success stories:', error);
      setError('Failed to load success stories.');
      setLoading(false);
      toast.error('Failed to load success stories.');
    }
  };

  const handleDelete = async (storyId) => {
    setConfirmAction('delete');
    setConfirmStoryId(storyId);
    setShowConfirmModal(true);
  };

  const handleDeleteAll = async () => {
    setConfirmAction('deleteAll');
    setShowConfirmModal(true);
  };

  const handleConfirmAction = async () => {
    if (confirmAction === 'delete') {
      try {
        await axios.delete(`http://localhost:8000/api/success-stories/${confirmStoryId}/delete/`, {
          headers: {
            'X-CSRFToken': await getCsrfToken(),
          },
          withCredentials: true,
        });
        fetchStories();
        toast.success('Success story deleted successfully!');
      } catch (error) {
        console.error('Error deleting success story:', error);
        toast.error('Failed to delete success story.');
      }
    } else if (confirmAction === 'deleteAll') {
      try {
        await axios.delete('http://localhost:8000/api/success-stories/delete-all/', {
          headers: {
            'X-CSRFToken': await getCsrfToken(),
          },
          withCredentials: true,
        });
        fetchStories();
        toast.success('All success stories deleted successfully!');
      } catch (error) {
        console.error('Error deleting all success stories:', error);
        toast.error('Failed to delete all success stories.');
      }
    }
    setShowConfirmModal(false);
    setConfirmAction(null);
    setConfirmStoryId(null);
  };

  const getCsrfToken = async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/get-csrf-token/', {
        withCredentials: true,
      });
      return response.data.csrfToken;
    } catch (error) {
      console.error('Error fetching CSRF token:', error);
      toast.error('Failed to fetch CSRF token.');
      return '';
    }
  };

  if (loading) return <div className="text-center p-8 text-white">Loading...</div>;
  if (error) return <div className="text-center p-8 text-red-500">{error}</div>;

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-purple-900 to-indigo-800 text-white">
      <Sidebar />
      <main className="flex-1 p-8 bg-gray-50 text-gray-900 rounded-tl-3xl overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex justify-between items-center mb-8"
        >
          <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-purple-600">
            <h1 className="text-3xl font-bold text-purple-800">Success Stories</h1>
          </div>
          <div className="flex gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setEditingStory(null);
                setIsModalOpen(true);
              }}
              className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition"
            >
              <Plus size={20} />
              Add Success Story
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleDeleteAll}
              className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
            >
              <Trash2 size={20} />
              Delete All
            </motion.button>
          </div>
        </motion.div>
        {stories.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center text-gray-600 text-lg"
          >
            No success stories found. Add one to get started!
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ staggerChildren: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {stories.map((story) => (
              <SuccessStoryCard
                key={story.id}
                story={story}
                onEdit={(story) => {
                  setEditingStory(story);
                  setIsModalOpen(true);
                }}
                onDelete={handleDelete}
                onCardClick={(story) => {
                  setSelectedStory(story);
                  setIsDetailsModalOpen(true);
                }}
              />
            ))}
          </motion.div>
        )}
        <SuccessStoryModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setEditingStory(null);
          }}
          story={editingStory}
          onSave={() => {
            fetchStories();
            toast.success(editingStory ? 'Success story updated!' : 'Success story created!');
          }}
        />
        <SuccessStoryDetailsModal
          isOpen={isDetailsModalOpen}
          onClose={() => {
            setIsDetailsModalOpen(false);
            setSelectedStory(null);
          }}
          story={selectedStory}
        />
      </main>

      {/* Confirmation Modal */}
      <Transition appear show={showConfirmModal} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={() => setShowConfirmModal(false)}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-50" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-gray-900 mb-4"
                  >
                    Confirm Action
                  </Dialog.Title>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      {confirmAction === 'delete' 
                        ? 'Are you sure you want to delete this success story? This action cannot be undone.'
                        : 'Are you sure you want to delete all success stories? This action cannot be undone.'
                      }
                    </p>
                  </div>

                  <div className="mt-6 flex justify-end space-x-3">
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
                      onClick={() => setShowConfirmModal(false)}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200"
                      onClick={handleConfirmAction}
                    >
                      OK
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
};

export default SuccessStories;