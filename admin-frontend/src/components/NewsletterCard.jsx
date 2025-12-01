import React from 'react';
import { Carousel } from 'react-responsive-carousel';
import 'react-responsive-carousel/lib/styles/carousel.min.css';
import { Calendar, Edit3, Eye, Trash2, ExternalLink, CheckCircle, Clock } from 'lucide-react';

const NewsletterCard = ({ newsletter, onEdit, onView, onDelete }) => {
  const isDraft = newsletter.status === 'draft';

  return (
    <div className="relative h-full group">
      {/* Status Badge */}
      <div className="absolute -top-2 -right-2 z-20">
        {isDraft ? (
          <div className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-3 py-1 rounded-lg shadow-lg flex items-center gap-1.5 transform hover:scale-105 transition-transform">
            <Clock className="w-3.5 h-3.5" />
            <span className="text-xs font-semibold">Draft</span>
          </div>
        ) : (
          <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-3 py-1 rounded-lg shadow-lg flex items-center gap-1.5 transform hover:scale-105 transition-transform">
            <CheckCircle className="w-3.5 h-3.5" />
            <span className="text-xs font-semibold">Published</span>
          </div>
        )}
      </div>

      {/* Main Card */}
      <div className={`relative h-full rounded-lg overflow-hidden ${
        isDraft 
          ? 'bg-gradient-to-br from-blue-50 to-indigo-50' 
          : 'bg-gradient-to-br from-green-50 to-emerald-50'
      } shadow-md hover:shadow-xl transition-all duration-300 border-2 ${
        isDraft ? 'border-blue-200 hover:border-blue-300' : 'border-green-200 hover:border-green-300'
      } group-hover:-translate-y-1`}>
        
        <div className="p-5 flex flex-col h-full">
          {/* Title Section */}
          <div className="mb-3">
            <h3 className="text-lg font-semibold text-gray-900 leading-tight mb-1 line-clamp-2">
              {newsletter.title}
            </h3>
            {newsletter.subtitle && (
              <p className="text-sm text-gray-600 line-clamp-2">{newsletter.subtitle}</p>
            )}
          </div>

          {/* Image Carousel */}
          {newsletter.images && newsletter.images.length > 0 && (
            <div className="mb-3 rounded-lg overflow-hidden border border-gray-200">
              <Carousel 
                showThumbs={false} 
                autoPlay 
                infiniteLoop 
                interval={3000}
                showStatus={false}
                showArrows={false}
              >
                {newsletter.images.map((image, index) => (
                  <div key={index}>
                    <img
                      src={image.image}
                      alt={`Newsletter image ${index + 1}`}
                      className="w-full h-48 object-cover"
                      onError={(e) => {
                        console.error(`Image failed to load:`, image.image);
                        e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTUwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlIE5vdCBGb3VuZDwvdGV4dD48L3N2Zz4=';
                      }}
                    />
                  </div>
                ))}
              </Carousel>
            </div>
          )}

          {/* Description */}
          <div
            className="text-sm text-gray-700 mb-3 line-clamp-3 flex-grow"
            dangerouslySetInnerHTML={{ __html: newsletter.description }}
          />

          {/* URL Link */}
          {newsletter.url && (
            <a
              href={newsletter.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="inline-flex items-center gap-1.5 text-purple-600 hover:text-purple-700 mb-3 text-sm font-medium"
            >
              <ExternalLink className="w-4 h-4" />
              <span className="underline">View Link</span>
            </a>
          )}

          {/* Footer with Date */}
          <div className="flex items-center gap-2 text-gray-500 text-xs mb-3 pt-3 border-t border-gray-200">
            <Calendar className="w-3.5 h-3.5" />
            <span>
              {new Date(newsletter.created_at).toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'short', 
                day: 'numeric' 
              })}
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            {isDraft ? (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(newsletter);
                }}
                className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-3 py-2.5 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all font-medium text-sm shadow-md hover:shadow-lg"
              >
                <Edit3 className="w-4 h-4" />
                Edit Draft
              </button>
            ) : (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onView(newsletter);
                }}
                className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-3 py-2.5 rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all font-medium text-sm shadow-md hover:shadow-lg"
              >
                <Eye className="w-4 h-4" />
                View
              </button>
            )}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(newsletter.id);
              }}
              className="flex items-center justify-center gap-2 bg-red-600 text-white px-3 py-2.5 rounded-lg hover:bg-red-700 transition-all font-medium text-sm shadow-md hover:shadow-lg"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewsletterCard;