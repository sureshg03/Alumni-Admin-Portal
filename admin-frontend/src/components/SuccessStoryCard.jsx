import React, { useState, useEffect } from 'react';
import { Edit, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

const SuccessStoryCard = ({ story, onEdit, onDelete, onCardClick }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    console.log('Story images:', story.images);
    if (story.images && Array.isArray(story.images) && story.images.length > 1) {
      const interval = setInterval(() => {
        setCurrentImageIndex((prevIndex) => 
          prevIndex === story.images.length - 1 ? 0 : prevIndex + 1
        );
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [story.images]);

  const handlePrev = (e) => {
    e.stopPropagation();
    setCurrentImageIndex((prevIndex) => 
      prevIndex === 0 ? story.images.length - 1 : prevIndex - 1
    );
  };

  const handleNext = (e) => {
    e.stopPropagation();
    setCurrentImageIndex((prevIndex) => 
      prevIndex === story.images.length - 1 ? 0 : prevIndex + 1
    );
  };

  const hasValidImages = story.images && Array.isArray(story.images) && story.images.length > 0 && story.images.every(img => img.image && typeof img.image === 'string');

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white rounded-lg shadow-lg overflow-hidden cursor-pointer hover:shadow-xl transition-shadow"
      onClick={() => onCardClick(story)}
    >
      <div className="relative h-48">
        {hasValidImages ? (
          <div className="relative w-full h-full">
            <img
              src={story.images[currentImageIndex].image}
              alt={story.title || 'Success Story Image'}
              className="w-full h-full object-cover"
              style={{ aspectRatio: '4/3' }}
              onError={(e) => {
                console.error(`Image failed to load for story ${story.id}:`, story.images[currentImageIndex].image);
                // Remove the broken image and show a placeholder
                e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTUwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlIE5vdCBGb3VuZDwvdGV4dD48L3N2Zz4=';
              }}
            />
            {story.images.length > 1 && (
              <>
                <button
                  onClick={handlePrev}
                  className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white rounded-full p-2 hover:bg-opacity-75"
                >
                  <ChevronLeft size={20} />
                </button>
                <button
                  onClick={handleNext}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white rounded-full p-2 hover:bg-opacity-75"
                >
                  <ChevronRight size={20} />
                </button>
                <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex gap-1">
                  {story.images.map((_, index) => (
                    <div
                      key={index}
                      className={`w-2 h-2 rounded-full ${index === currentImageIndex ? 'bg-white' : 'bg-gray-400'}`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-500">
            No Images Available
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="text-xl font-bold text-purple-800">{story.title || 'Untitled'}</h3>
        <div
          className="text-gray-600 mt-2 line-clamp-3"
          dangerouslySetInnerHTML={{ __html: story.description || 'No description' }}
        />
        {story.url && (
          <a
            href={story.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-purple-600 hover:underline mt-2 block"
            onClick={(e) => e.stopPropagation()}
          >
            Read More
          </a>
        )}
        <div className="flex justify-end gap-2 mt-4" onClick={(e) => e.stopPropagation()}>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onEdit(story)}
            className="flex items-center gap-2 px-3 py-1 bg-purple-600 text-white rounded hover:bg-purple-700"
          >
            <Edit size={16} />
            Edit
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onDelete(story.id)}
            className="flex items-center gap-2 px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
          >
            <Trash2 size={16} />
            Delete
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

export default SuccessStoryCard;