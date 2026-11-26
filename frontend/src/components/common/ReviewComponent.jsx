import React, { useRef, useState, useEffect, useMemo } from "react";
import ReviewCard from "./Review";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { flower_Image } from "../../assets";
import { fetchPublicReviewsApi, likePublicReviewApi } from "../../apis/api";

const ReviewComponent = () => {
  const scrollRef = useRef(null);

  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    fetchPublicReviewsApi()
      .then((apiReviews) => {
        if (active && Array.isArray(apiReviews)) {
          const mapped = apiReviews.map((r) => ({
            id: r.id,
            guestName: r.guestName,
            avatar: null,
            location: r.location || "Nagpur, Maharashtra",
            verified: Boolean(r.verified),
            rating: Number(r.rating || 5),
            date: r.createdAt || new Date().toISOString().split("T")[0],
            comment: r.comment,
            images: [],
            likesCount: Number(r.likesCount || 0),
            isLiked: false,
            hotelName: "Hotel Athitya",
          }));
          setReviews(mapped);
        }
      })
      .catch(() => {
        if (active) setReviews([]);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const averageRating = useMemo(() => {
    if (reviews.length === 0) return "0.0";
    const sum = reviews.reduce((acc, r) => acc + Number(r.rating || 5), 0);
    return (sum / reviews.length).toFixed(1);
  }, [reviews]);

  const scroll = (direction) => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({
        left: direction === "left" ? -450 : 450,
        behavior: "smooth",
      });
    }
  };

  const handleToggleLike = async (review) => {
    const alreadyLiked = review.isLiked;
    setReviews((prev) =>
      prev.map((item) =>
        item.id === review.id
          ? {
              ...item,
              isLiked: !alreadyLiked,
              likesCount: alreadyLiked
                ? Math.max(0, item.likesCount - 1)
                : item.likesCount + 1,
            }
          : item
      )
    );

    if (!alreadyLiked && typeof review.id === "number") {
      likePublicReviewApi(review.id).catch(() => {});
    }
  };

  if (!loading && reviews.length === 0) {
    return null;
  }

  return (
    <div className="relative max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 mb-[7em]">
      <div className="flex flex-col items-center mb-8 relative">
        <div className="relative">
          <img
            src={flower_Image}
            alt="flower"
            className="w-24 h-12 sm:w-32 sm:h-16 md:w-40 md:h-20 object-contain opacity-90"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-white/20 to-transparent" />
        </div>

        <div className="text-center space-y-2">
          <p className="text-sm font-medium uppercase tracking-[0.3em] text-amber-600 bg-amber-50 px-4 py-1 rounded-full inline-block">
            Guest Experience
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mt-2 tracking-tight">
            Guest <span className="text-amber-600">Reviews</span>
          </h2>
          <div className="flex items-center justify-center gap-2 mt-1">
            <div className="w-12 h-0.5 bg-amber-400" />
            <div className="w-3 h-3 rounded-full bg-amber-500" />
            <div className="w-12 h-0.5 bg-amber-400" />
          </div>
          <p className="text-gray-500 text-sm mt-2 flex items-center justify-center gap-2">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-400" />
            Verified reviews from guests at Hotel Athitya
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-400" />
          </p>
        </div>
      </div>

      <div className="relative">
        {reviews.length > 1 && (
          <>
            <button
              type="button"
              onClick={() => scroll("left")}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-11 h-11 rounded-full bg-gradient-to-r from-amber-600 to-amber-500 flex items-center justify-center text-white shadow-lg shadow-amber-500/30 hover:from-amber-700 hover:to-amber-600 hover:scale-105 transition-all duration-300 border-2 border-white/20 cursor-pointer"
              aria-label="Previous reviews"
            >
              <FaChevronLeft className="text-sm" />
            </button>

            <button
              type="button"
              onClick={() => scroll("right")}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-11 h-11 rounded-full bg-gradient-to-r from-amber-600 to-amber-500 flex items-center justify-center text-white shadow-lg shadow-amber-500/30 hover:from-amber-700 hover:to-amber-600 hover:scale-105 transition-all duration-300 border-2 border-white/20 cursor-pointer"
              aria-label="Next reviews"
            >
              <FaChevronRight className="text-sm" />
            </button>
          </>
        )}

        <div
          ref={scrollRef}
          className="flex gap-6 overflow-x-auto pb-6 snap-x snap-mandatory scrollbar-hide scroll-smooth px-8 [&::-webkit-scrollbar]:hidden"
        >
          {reviews.map((review, index) => (
            <div
              key={review.id}
              className={`min-w-[320px] sm:min-w-[380px] lg:min-w-[420px] snap-start transition-all duration-300 hover:scale-[1.02] ${
                index === 0 ? "pl-4" : ""
              } ${index === reviews.length - 1 ? "pr-4" : ""}`}
            >
              <ReviewCard
                name={review.guestName}
                avatar={review.avatar}
                location={review.location}
                isVerified={review.verified}
                rating={review.rating}
                date={review.date}
                review={review.comment}
                images={review.images}
                isLiked={review.isLiked}
                likesCount={review.likesCount}
                onLikeToggle={() => handleToggleLike(review)}
                hotelName="Hotel Athitya"
              />
            </div>
          ))}
        </div>

        <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-white to-transparent pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-white to-transparent pointer-events-none" />
      </div>

      <div className="flex justify-center mt-6 gap-2">
        <div className="w-2 h-2 rounded-full bg-amber-400" />
        <div className="w-8 h-0.5 bg-amber-300 self-center" />
        <div className="w-2 h-2 rounded-full bg-amber-400" />
        <div className="w-8 h-0.5 bg-amber-300 self-center" />
        <div className="w-2 h-2 rounded-full bg-amber-400" />
      </div>

      {reviews.length > 0 && (
        <div className="mt-4 lg:mt-0 lg:absolute lg:bottom-4 lg:right-8 bg-white/95 backdrop-blur-sm rounded-full px-4 py-2 shadow-lg border border-amber-100 flex items-center justify-center gap-2 w-fit mx-auto">
          <div className="flex items-center gap-1">
            <span className="text-amber-500">★</span>
            <span className="font-bold text-gray-800">{averageRating}</span>
          </div>
          <div className="w-px h-4 bg-gray-200" />
          <span className="text-xs text-gray-500">
            {reviews.length} {reviews.length === 1 ? "Review" : "Reviews"}
          </span>
        </div>
      )}
    </div>
  );
};

export default ReviewComponent;