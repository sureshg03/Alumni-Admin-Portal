import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import NewsletterEditor from '../components/NewsletterEditor';
import api from '../services/api';
import toast, { Toaster } from 'react-hot-toast';
import Tilt from 'react-parallax-tilt';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { RefreshCw, Trash2, Mail, TrendingUp, Users, Eye, Edit3, Sparkles, Calendar } from 'lucide-react';
import NewsletterCard from '../components/NewsletterCard';
import { Carousel } from 'react-responsive-carousel';
import 'react-responsive-carousel/lib/styles/carousel.min.css';

const Newsletter = () => {
  const [newsletters, setNewsletters] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedNewsletter, setSelectedNewsletter] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNewsletter, setEditingNewsletter] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null); // 'delete' or 'deleteAll'
  const [confirmNewsletterId, setConfirmNewsletterId] = useState(null);

  const fetchNewsletters = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('newsletters/');
      setNewsletters(response.data);
    } catch (error) {
      toast.error('Failed to load newsletters. Please log in.');
      console.error('Fetch error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNewsletters();
  }, []);

  const handleSave = () => {
    fetchNewsletters();
    setEditingNewsletter(null);
  };

  const handleCardClick = (newsletter) => {
    if (newsletter.status === 'draft') {
      setEditingNewsletter({
        id: newsletter.id,
        title: newsletter.title,
        subtitle: newsletter.subtitle || '',
        description: newsletter.description || '',
        url: newsletter.url || '',
        status: newsletter.status,
        images: newsletter.images || [],
      });
    } else {
      setSelectedNewsletter(newsletter);
      setIsModalOpen(true);
    }
  };

  const handleDelete = async (newsletterId) => {
    setConfirmAction('delete');
    setConfirmNewsletterId(newsletterId);
    setShowConfirmModal(true);
  };

  const handleDeleteAll = async () => {
    setConfirmAction('deleteAll');
    setShowConfirmModal(true);
  };

  const handleConfirmAction = async () => {
    if (confirmAction === 'delete') {
      try {
        await api.delete(`newsletters/${confirmNewsletterId}/`);
        setNewsletters(newsletters.filter((n) => n.id !== confirmNewsletterId));
        toast.success('Newsletter deleted successfully!');
      } catch (error) {
        console.error('Error deleting newsletter:', error);
        toast.error('Failed to delete newsletter');
      }
    } else if (confirmAction === 'deleteAll') {
      try {
        await api.delete('newsletters/delete-all/');
        setNewsletters([]);
        toast.success('All newsletters deleted successfully!');
      } catch (error) {
        console.error('Error deleting all newsletters:', error);
        toast.error('Failed to delete all newsletters');
      }
    }
    setShowConfirmModal(false);
    setConfirmAction(null);
    setConfirmNewsletterId(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-inter flex">
      <Sidebar />
      <main className="flex-1 p-6 md:p-8 overflow-y-auto max-h-screen">
        <Toaster position="top-right" toastOptions={{ 
          className: 'bg-white text-gray-800 shadow-lg border border-gray-200',
          duration: 4000,
          style: {
            borderRadius: '8px',
            padding: '12px',
          }
        }} />

        <div>
          {/* Header Section */}
          <div className="mb-8">
            <div className="bg-gradient-to-r from-purple-800 to-purple-800 rounded-lg shadow-lg p-6">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="bg-white/20 backdrop-blur-sm p-3 rounded-lg border border-white/30">
                    <Mail className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                      Newsletter Management
                      <Sparkles className="w-5 h-5 text-yellow-300" />
                    </h1>
                    <p className="text-purple-100 text-sm mt-1">
                      Create and manage engaging newsletters
                    </p>
                  </div>
                </div>

                {/* Stats Cards */}
                <div className="flex gap-4">
                  <div className="bg-white/90 backdrop-blur-sm p-3 rounded-lg text-center shadow-md min-w-[80px] hover:bg-white transition-all">
                    <TrendingUp className="w-5 h-5 text-purple-800 mx-auto mb-1" />
                    <p className="text-xl font-bold text-purple-700">{newsletters.length}</p>
                    <p className="text-xs text-gray-600 font-medium">Total</p>
                  </div>
                  <div className="bg-white/90 backdrop-blur-sm p-3 rounded-lg text-center shadow-md min-w-[80px] hover:bg-white transition-all">
                    <Eye className="w-5 h-5 text-green-600 mx-auto mb-1" />
                    <p className="text-xl font-bold text-green-700">{newsletters.filter(n => n.status === 'published').length}</p>
                    <p className="text-xs text-gray-600 font-medium">Published</p>
                  </div>
                  <div className="bg-white/90 backdrop-blur-sm p-3 rounded-lg text-center shadow-md min-w-[80px] hover:bg-white transition-all">
                    <Edit3 className="w-5 h-5 text-blue-600 mx-auto mb-1" />
                    <p className="text-xl font-bold text-blue-700">{newsletters.filter(n => n.status === 'draft').length}</p>
                    <p className="text-xs text-gray-600 font-medium">Drafts</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* Newsletter Editor Section */}
          <div className="mb-8">
            <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-shadow">
              <div className="bg-gradient-to-r from-purple-800 to-purple-800 p-4">
                <div className="flex items-center gap-3">
                  <div className="bg-white/20 p-2 rounded">
                    <Edit3 className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">
                      {editingNewsletter ? 'Edit Newsletter' : 'Create New Newsletter'}
                    </h3>
                    <p className="text-purple-100 text-xs">Fill in the details below</p>
                  </div>
                </div>
              </div>
              <div className="p-6 bg-gradient-to-b from-purple-50/30 to-white">
                <NewsletterEditor
                  initialData={editingNewsletter || {}}
                  isEditing={!!editingNewsletter}
                  onSave={handleSave}
                />
              </div>
            </div>
          </div>

          {/* Previous Newsletters Section */}
          <div className="mt-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-3">
                  <div className="w-1.5 h-7 bg-gradient-to-b from-purple-800 to-purple-800 rounded-full"></div>
                  Your Newsletters
                  <span className="text-sm font-normal text-gray-500">({newsletters.length})</span>
                </h2>
                <p className="text-gray-600 text-sm mt-1 ml-5 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  Manage your published and draft newsletters
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={fetchNewsletters}
                  className="flex items-center gap-2 bg-purple-700 text-white px-4 py-2 rounded-lg font-medium hover:bg-purple-800 transition-all text-sm shadow-md hover:shadow-lg"
                >
                  <RefreshCw size={16} />
                  Refresh
                </button>
                <button
                  onClick={handleDeleteAll}
                  className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700 transition-all text-sm shadow-md hover:shadow-lg"
                >
                  <Trash2 size={16} />
                  Delete All
                </button>
              </div>
            </div>

            {isLoading ? (
              <div className="text-center py-16">
                <div className="relative inline-flex items-center justify-center">
                  <div className="h-16 w-16 animate-spin rounded-full border-4 border-purple-200 border-t-purple-800"></div>
                  <div className="absolute h-12 w-12 animate-spin rounded-full border-4 border-transparent border-t-pink-400" style={{ animationDirection: 'reverse', animationDuration: '1s' }}></div>
                  <div className="absolute">
                    <Mail className="w-6 h-6 text-purple-800 animate-pulse" />
                  </div>
                </div>
                <p className="text-gray-700 mt-4 text-sm font-medium">Loading your newsletters...</p>
                <p className="text-gray-500 text-xs mt-1">Please wait</p>
              </div>
            ) : newsletters.length === 0 ? (
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-12 text-center border-2 border-dashed border-purple-200">
                <div className="bg-white w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-5 shadow-lg border-4 border-purple-100">
                  <Mail className="w-12 h-12 text-purple-800" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-3">No Newsletters Yet</h3>
                <p className="text-gray-600 text-sm max-w-md mx-auto mb-4">
                  Start creating engaging newsletters to connect with your alumni community
                </p>
                <div className="inline-flex items-center gap-2 text-purple-800 text-xs font-medium bg-white px-4 py-2 rounded-full shadow-sm">
                  <Sparkles className="w-4 h-4" />
                  Use the editor above to get started
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {newsletters.map((newsletter) => (
                  <div key={newsletter.id}>
                    <NewsletterCard
                      newsletter={newsletter}
                      onEdit={() => handleCardClick(newsletter)}
                      onView={() => handleCardClick(newsletter)}
                      onDelete={handleDelete}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <Transition appear show={isModalOpen} as={Fragment}>
          <Dialog as="div" className="relative z-50" onClose={() => setIsModalOpen(false)}>
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="fixed inset-0 bg-gradient-to-br from-purple-900/80 to-blue-900/80 backdrop-blur-sm" />
            </Transition.Child>

            <div className="fixed inset-0 overflow-y-auto">
              <div className="flex min-h-full items-center justify-center p-4 text-center">
                {/* Left Ribbon */}
                <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-purple-800 to-pink-600 transform -rotate-45 -translate-x-16 translate-y-8 shadow-lg animate-ribbon-slide-left pointer-events-none">
                  <span className="absolute inset-0 flex items-center justify-center text-white font-serif text-lg">Celebrate!</span>
                </div>
                {/* Right Ribbon */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-blue-600 to-cyan-600 transform rotate-45 translate-x-16 translate-y-8 shadow-lg animate-ribbon-slide-right pointer-events-none">
                  <span className="absolute inset-0 flex items-center justify-center text-white font-serif text-lg">Success!</span>
                </div>
                <Transition.Child
                  as={Fragment}
                  enter="ease-out duration-300"
                  enterFrom="opacity-0 scale-95"
                  enterTo="opacity-100 scale-100"
                  leave="ease-in duration-200"
                  leaveFrom="opacity-100 scale-100"
                  leaveTo="opacity-0 scale-95"
                >
                  <Dialog.Panel className="w-full max-w-3xl transform overflow-hidden rounded-3xl bg-white/95 backdrop-blur-xl p-10 text-left align-middle shadow-2xl transition-all border border-purple-200/50">
                    <div className="relative">
                      <div className="absolute -top-10 -left-10 w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full opacity-50 blur-2xl animate-pulse"></div>
                      <div className="absolute -bottom-10 -right-10 w-20 h-20 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full opacity-50 blur-2xl animate-pulse"></div>
                      {selectedNewsletter && (
                        <>
                          <Dialog.Title
                            as="h3"
                            className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-700 to-blue-700 mb-6"
                          >
                            {selectedNewsletter.title}
                          </Dialog.Title>
                          {selectedNewsletter.subtitle && (
                            <p className="text-xl text-gray-600 mb-2 font-medium">{selectedNewsletter.subtitle}</p>
                          )}
                          <div className="flex items-center text-sm text-gray-500 mb-6">
                            <span>Published: {new Date(selectedNewsletter.created_at).toLocaleDateString()}</span>
                            <span className="mx-2">•</span>
                            <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                              {selectedNewsletter.status.charAt(0).toUpperCase() + selectedNewsletter.status.slice(1)}
                            </span>
                          </div>
                          {selectedNewsletter.images && selectedNewsletter.images.length > 0 && (
                            <Carousel
                              showThumbs={false}
                              autoPlay
                              infiniteLoop
                              interval={3000}
                              transitionTime={600}
                              className="mb-8 rounded-2xl overflow-hidden shadow-lg"
                            >
                              {selectedNewsletter.images.map((image, index) => (
                                <div key={index}>
                                  <img
                                    src={image.image}
                                    alt={`Image ${index + 1}`}
                                    className="w-full h-80 object-cover"
                                    onError={(e) => (e.target.src = '/placeholder.jpg')}
                                  />
                                </div>
                              ))}
                            </Carousel>
                          )}
                          <div
                            className="text-gray-700 mb-8 prose prose-lg max-w-none"
                            dangerouslySetInnerHTML={{ __html: selectedNewsletter.description }}
                          />
                          {selectedNewsletter.url && (
                            <a
                              href={selectedNewsletter.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 font-medium underline decoration-2 decoration-blue-300 hover:decoration-blue-500 transition-all duration-200"
                            >
                              {selectedNewsletter.url}
                            </a>
                          )}
                          <div className="mt-10 flex justify-end">
                            <button
                              type="button"
                              className="bg-gradient-to-r from-purple-800 to-blue-600 text-white px-8 py-3 rounded-full font-semibold hover:from-purple-700 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                              onClick={() => setIsModalOpen(false)}
                            >
                              Close Preview
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </Dialog.Panel>
                </Transition.Child>
              </div>
            </div>
          </Dialog>
        </Transition>
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
                        ? 'Are you sure you want to delete this newsletter? This action cannot be undone.'
                        : 'Are you sure you want to delete all newsletters? This action cannot be undone.'
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

export default Newsletter;