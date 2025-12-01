import React from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

const SuccessStoryDetailsModal = ({ isOpen, onClose, story }) => {
  const [currentImageIndex, setCurrentImageIndex] = React.useState(0);

  const handlePrev = () => {
    setCurrentImageIndex((prevIndex) => 
      prevIndex === 0 ? story.images.length - 1 : prevIndex - 1
    );
  };

  const handleNext = () => {
    setCurrentImageIndex((prevIndex) => 
      prevIndex === story.images.length - 1 ? 0 : prevIndex + 1
    );
  };

  const hasValidImages = story?.images && Array.isArray(story.images) && story.images.length > 0 && story.images.every(img => img.image && typeof img.image === 'string');

  if (!isOpen || !story) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, rotate: -5 }}
        animate={{ scale: 1, opacity: 1, rotate: 0 }}
        exit={{ scale: 0.9, opacity: 0, rotate: 5 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        className="bg-white rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto relative shadow-2xl"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          <X size={28} />
        </button>
        <h2 className="text-3xl font-bold text-purple-800 mb-4">{story.title || 'Untitled'}</h2>
        <div className="mb-6">
          {hasValidImages ? (
            <div className="relative w-full h-64">
              <img
                src={story.images[currentImageIndex].image}
                alt={story.title || 'Success Story Image'}
                className="w-full h-full object-cover rounded-lg"
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/150?text=Image+Not+Found';
                }}
              />
              {story.images.length > 1 && (
                <>
                  <button
                    onClick={handlePrev}
                    className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white rounded-full p-2 hover:bg-opacity-75"
                  >
                    <ChevronLeft size={24} />
                  </button>
                  <button
                    onClick={handleNext}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white rounded-full p-2 hover:bg-opacity-75"
                  >
                    <ChevronRight size={24} />
                  </button>
                  <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex gap-1">
                    {story.images.map((_, index) => (
                      <div
                        key={index}
                        className={`w-3 h-3 rounded-full ${index === currentImageIndex ? 'bg-white' : 'bg-gray-400'}`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="w-full h-64 bg-gray-200 flex items-center justify-center text-gray-500 rounded-lg">
              No Images Available
            </div>
          )}
        </div>
        <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: story.description || 'No description' }} />
        {story.url && (
          <a
            href={story.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-purple-600 hover:underline mt-4 block text-lg"
          >
            Read More
          </a>
        )}
      </motion.div>
    </motion.div>
  );
};

export default SuccessStoryDetailsModal;