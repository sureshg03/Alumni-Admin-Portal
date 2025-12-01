import React, { useEffect, useState } from 'react';
import { Carousel } from 'react-responsive-carousel';
import 'react-responsive-carousel/lib/styles/carousel.min.css';
import { Transition, Dialog } from '@headlessui/react';
import { Fragment } from 'react';
import Confetti from 'react-confetti';

const NewsletterModal = ({ newsletter, isOpen, onClose }) => {
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (isOpen && newsletter?.status === 'published') {
      setShowConfetti(true);
      const timer = setTimeout(() => setShowConfetti(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [isOpen, newsletter]);

  if (!isOpen || !newsletter) return null;

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
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
          {showConfetti && (
            <Confetti
              width={window.innerWidth}
              height={window.innerHeight}
              recycle={false}
              numberOfPieces={200}
              gravity={0.1}
              colors={['#ff6b6b', '#4bcffa', '#feca57', '#ff9ff3', '#1dd1a1']}
            />
          )}
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
              <Dialog.Panel className="w-full max-w-3xl transform overflow-hidden rounded-3xl bg-white/95 backdrop-blur-xl p-10 text-left align-middle shadow-2xl transition-all border border-purple-200/50">
                <div className="relative">
                  <div className="absolute -top-10 -left-10 w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full opacity-50 blur-2xl animate-pulse"></div>
                  <div className="absolute -bottom-10 -right-10 w-20 h-20 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full opacity-50 blur-2xl animate-pulse"></div>
                  <Dialog.Title
                    as="h3"
                    className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-700 to-blue-700 mb-6"
                  >
                    {newsletter.title}
                  </Dialog.Title>
                  {newsletter.subtitle && (
                    <p className="text-xl text-gray-600 mb-2 font-medium">{newsletter.subtitle}</p>
                  )}
                  <div className="flex items-center text-sm text-gray-500 mb-6">
                    <span>Published: {new Date(newsletter.created_at).toLocaleDateString()}</span>
                    <span className="mx-2">•</span>
                    <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                      {newsletter.status.charAt(0).toUpperCase() + newsletter.status.slice(1)}
                    </span>
                  </div>
                  {newsletter.images && newsletter.images.length > 0 && (
                    <Carousel
                      showThumbs={false}
                      autoPlay
                      infiniteLoop
                      interval={3000}
                      transitionTime={600}
                      className="mb-8 rounded-2xl overflow-hidden shadow-lg"
                    >
                      {newsletter.images.map((image, index) => (
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
                    dangerouslySetInnerHTML={{ __html: newsletter.description }}
                  />
                  {newsletter.url && (
                    <a
                      href={newsletter.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 font-medium underline decoration-2 decoration-blue-300 hover:decoration-blue-500 transition-all duration-200"
                    >
                      {newsletter.url}
                    </a>
                  )}
                  <div className="mt-10 flex justify-end">
                    <button
                      type="button"
                      className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 py-3 rounded-full font-semibold hover:from-purple-700 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                      onClick={onClose}
                    >
                      Close Preview
                    </button>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default NewsletterModal;