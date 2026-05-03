import React, { useState } from "react";
import { Star, X, Image as ImageIcon, Loader2 } from "lucide-react";
import API_URL from "../config/config";

export default function ReviewModal({ booking, onClose, onSuccess }) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [images, setImages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  React.useEffect(() => {
    const fetchExistingReview = async () => {
      try {
        const response = await fetch(`${API_URL}/reviews/my-review/${booking.room.propertyId}`, {
          credentials: "include",
        });
        if (response.ok) {
          const data = await response.json();
          if (data) {
            setRating(data.rating);
            setComment(data.comment);
            setImages(data.images || []);
          }
        }
      } catch (err) {
        console.error("Error fetching existing review:", err);
      }
    };
    fetchExistingReview();
  }, [booking.room.propertyId]);

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploading(true);
    setError("");

    try {
      const formData = new FormData();
      files.forEach((file) => {
        formData.append("files", file);
      });

      const response = await fetch(`${API_URL}/reviews/upload-images`, {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Không thể tải ảnh lên server.");
      }

      const data = await response.json();
      setImages([...images, ...data.urls]);
    } catch (err) {
      console.error("Error uploading images:", err);
      setError("Lỗi tải ảnh lên. Vui lòng thử lại.");
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!comment.trim()) {
      setError("Vui lòng nhập nội dung đánh giá.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const response = await fetch(`${API_URL}/reviews/${booking.room.propertyId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          rating,
          comment,
          images,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Lỗi gửi đánh giá");
      }

      onSuccess();
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 antialiased">
      <div className="bg-white rounded-[40px] w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300">
        <div className="px-8 pt-8 pb-6 border-b border-gray-50 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {images.length > 0 || comment ? "Chỉnh sửa đánh giá" : "Đánh giá chuyến đi"}
            </h2>
            <p className="text-sm text-gray-500 font-medium mt-1">{booking.room?.property?.title}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X size={24} className="text-gray-400" />
          </button>
        </div>

        <div className="p-8 space-y-8 max-h-[70vh] overflow-y-auto">
          {/* Rating */}
          <div className="text-center space-y-4">
            <p className="font-bold text-gray-900">Bạn thấy thế nào về trải nghiệm này?</p>
            <div className="flex items-center justify-center gap-3">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  className={`p-1 transition-all transform hover:scale-110 ${star <= rating ? "text-rose-500" : "text-gray-200"
                    }`}
                >
                  <Star size={40} fill={star <= rating ? "currentColor" : "none"} />
                </button>
              ))}
            </div>
            <p className="text-sm font-bold text-rose-500 uppercase tracking-widest">
              {rating === 1 && "Rất tệ"}
              {rating === 2 && "Tệ"}
              {rating === 3 && "Bình thường"}
              {rating === 4 && "Tốt"}
              {rating === 5 && "Tuyệt vời"}
            </p>
          </div>

          {/* Comment */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-900 ml-1">Cảm nhận của bạn</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Chia sẻ chi tiết về chuyến đi của bạn để giúp đỡ những người khác..."
              className="w-full h-32 px-6 py-4 bg-gray-50 rounded-3xl border-none focus:ring-2 focus:ring-rose-500/20 outline-none resize-none transition-all placeholder:text-gray-400 text-sm"
            />
          </div>

          {/* Images */}
          <div className="space-y-4">
            <label className="text-sm font-bold text-gray-900 ml-1">Thêm hình ảnh</label>
            <div className="grid grid-cols-3 gap-4">
              {images.map((url, i) => (
                <div key={i} className="relative aspect-square rounded-2xl overflow-hidden group border border-gray-100">
                  <img src={url} alt="" className="w-full h-full object-cover" />
                  <button
                    onClick={() => removeImage(i)}
                    className="absolute top-2 right-2 p-1 bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
              {images.length < 6 && (
                <label className="aspect-square rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-gray-50 hover:border-rose-500/50 transition-all group">
                  <input type="file" multiple accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploading} />
                  {uploading ? (
                    <Loader2 size={24} className="text-rose-500 animate-spin" />
                  ) : (
                    <>
                      <ImageIcon size={24} className="text-gray-400 group-hover:text-rose-500 transition-colors" />
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest group-hover:text-rose-500">Tải ảnh</span>
                    </>
                  )}
                </label>
              )}
            </div>
          </div>

          {error && <p className="text-sm font-medium text-rose-500 bg-rose-50 px-4 py-3 rounded-2xl border border-rose-100">{error}</p>}
        </div>

        <div className="p-8 pt-0">
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full py-4 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-2xl transition-all shadow-xl shadow-rose-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 active:scale-95"
          >
            {submitting ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                Đang gửi...
              </>
            ) : (
              "Gửi đánh giá"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
