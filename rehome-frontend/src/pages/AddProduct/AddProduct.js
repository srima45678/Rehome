import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../utils/api';

function AddProduct() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || 'null');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    originalPrice: '',
    category: '',
    condition: '',
    city: '',
    address: ''
  });

  const [images, setImages] = useState([]);
  const [imagePreview, setImagePreview] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 5) {
      setError('Maximum 5 images allowed');
      return;
    }
    setImages(files);
    const previews = files.map(file => URL.createObjectURL(file));
    setImagePreview(previews);
    setError('');
  };

  const removeImage = (index) => {
    const newImages = images.filter((_, i) => i !== index);
    const newPreviews = imagePreview.filter((_, i) => i !== index);
    setImages(newImages);
    setImagePreview(newPreviews);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const data = new FormData();
      data.append('title', formData.title);
      data.append('description', formData.description);
      data.append('price', formData.price);
      data.append('originalPrice', formData.originalPrice || 0);
      data.append('category', formData.category);
      data.append('condition', formData.condition);
      data.append('city', formData.city);
      data.append('address', formData.address);
      images.forEach(image => {
        data.append('images', image);
      });

      await API.post('/products', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      alert('✅ Product listed successfully!');
      navigate('/seller/dashboard');

    } catch (error) {
      setError(error.response?.data?.message || 'Failed to list product. Try again.');
    } finally {
      setLoading(false);
    }
  };

  // ── NOT LOGGED IN ──
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary">
        <div className="text-center bg-white rounded-2xl p-10 shadow-sm">
          <p className="text-5xl mb-4">🔒</p>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Please Login First
          </h2>
          <p className="text-gray-500 mb-6">
            You need to be logged in to list furniture
          </p>
          <button
            onClick={() => navigate('/login')}
            className="bg-primary text-white px-6 py-3 rounded-xl hover:bg-accent transition-colors">
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  // ── BUYER TRYING TO SELL ──
  if (user.role === 'buyer') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary px-4">
        <div className="text-center bg-white rounded-2xl p-10 shadow-sm max-w-md w-full">
          <p className="text-6xl mb-4">🚫</p>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Seller Account Required
          </h2>
          <p className="text-gray-500 mb-2">
            You have a Buyer account. Only registered Sellers can list furniture on ReHome.
          </p>
          <p className="text-gray-400 text-sm mb-6">
            This is like Flipkart — buyers and sellers are separate accounts.
            Register a new seller account to start selling!
          </p>
          <div className="space-y-3">
            <button
              onClick={() => navigate('/products')}
              className="w-full bg-primary text-white px-6 py-3 rounded-xl hover:bg-accent transition-colors font-bold">
              🔍 Browse Furniture Instead
            </button>
            <button
              onClick={() => navigate('/register')}
              className="w-full border-2 border-primary text-primary px-6 py-3 rounded-xl hover:bg-orange-50 transition-colors font-bold">
              📝 Register a Seller Account
            </button>
            <button
              onClick={() => navigate(-1)}
              className="w-full border-2 border-gray-200 text-gray-600 px-6 py-3 rounded-xl hover:bg-gray-50 transition-colors">
              ← Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── SELLER FORM ──
  return (
    <div className="min-h-screen bg-secondary py-10 px-4">
      <div className="max-w-3xl mx-auto">

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">
            📦 List Your Furniture
          </h1>
          <p className="text-gray-500 mt-2">
            Fill in the details below to list your furniture for sale
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-8">
          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Title */}
            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                Product Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g. Wooden Sofa Set - 3 Seater"
                required
                className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-primary focus:ring-2 focus:ring-orange-100 transition-all"
              />
            </div>

            {/* Category + Condition */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  Category *
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-primary focus:ring-2 focus:ring-orange-100 transition-all bg-white">
                  <option value="">Select category</option>
                  <option value="sofa">🛋️ Sofa</option>
                  <option value="chair">🪑 Chair</option>
                  <option value="table">🪵 Table</option>
                  <option value="bed">🛏️ Bed</option>
                  <option value="wardrobe">🚪 Wardrobe</option>
                  <option value="shelf">📚 Shelf</option>
                  <option value="desk">🖥️ Desk</option>
                  <option value="other">📦 Other</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  Condition *
                </label>
                <select
                  name="condition"
                  value={formData.condition}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-primary focus:ring-2 focus:ring-orange-100 transition-all bg-white">
                  <option value="">Select condition</option>
                  <option value="like_new">✨ Like New</option>
                  <option value="good">👍 Good</option>
                  <option value="fair">👌 Fair</option>
                  <option value="poor">⚠️ Poor</option>
                </select>
              </div>
            </div>

            {/* Price + Original Price */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  Selling Price (Rs.) *
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  placeholder="e.g. 15000"
                  required
                  min="0"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-primary focus:ring-2 focus:ring-orange-100 transition-all"
                />
              </div>
              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  Original Price (Rs.)
                  <span className="text-gray-400 font-normal text-sm ml-1">
                    (shows savings)
                  </span>
                </label>
                <input
                  type="number"
                  name="originalPrice"
                  value={formData.originalPrice}
                  onChange={handleChange}
                  placeholder="e.g. 45000"
                  min="0"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-primary focus:ring-2 focus:ring-orange-100 transition-all"
                />
              </div>
            </div>

            {/* City + Address */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  City *
                </label>
                <select
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-primary focus:ring-2 focus:ring-orange-100 transition-all bg-white">
                  <option value="">Select city</option>
                  {["Kathmandu","Lalitpur","Bhaktapur","Pokhara",
                    "Chitwan","Biratnagar","Butwal","Dharan"].map(city => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  Area / Address
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="e.g. Thamel, near clock tower"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-primary focus:ring-2 focus:ring-orange-100 transition-all"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                Description *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe your furniture — size, color, material, any defects, reason for selling..."
                required
                rows={5}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-primary focus:ring-2 focus:ring-orange-100 transition-all resize-none"
              />
              <p className="text-gray-400 text-sm mt-1">
                {formData.description.length} characters
              </p>
            </div>

            {/* Image Upload */}
            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                📸 Product Images
                <span className="text-gray-400 font-normal text-sm ml-1">
                  (max 5 photos)
                </span>
              </label>

              <label className="block border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:border-primary hover:bg-orange-50 transition-all">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageChange}
                  className="hidden"
                />
                <p className="text-4xl mb-2">📷</p>
                <p className="text-gray-600 font-medium">
                  Click to select images
                </p>
                <p className="text-gray-400 text-sm mt-1">
                  JPG, PNG, WEBP — Max 5MB each
                </p>
              </label>

              {imagePreview.length > 0 && (
                <div className="mt-4">
                  <p className="text-gray-600 font-medium mb-3">
                    Selected {imagePreview.length} image(s):
                  </p>
                  <div className="flex gap-3 flex-wrap">
                    {imagePreview.map((preview, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={preview}
                          alt={`Preview ${index + 1}`}
                          className="w-24 h-24 object-cover rounded-xl border-2 border-gray-200"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600">
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <p className="text-gray-400 text-sm mt-2">
                💡 Tip: Clear, bright photos get 3x more views!
              </p>
            </div>

            {/* Error */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl">
                ⚠️ {error}
              </div>
            )}

            {/* Buttons */}
            <div className="flex gap-4 pt-2">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="flex-1 border-2 border-gray-200 text-gray-600 font-bold py-3 rounded-xl hover:bg-gray-50 transition-all">
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-primary hover:bg-accent text-white font-bold py-3 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="animate-spin">⏳</span>
                    Uploading...
                  </span>
                ) : (
                  '🚀 List Product'
                )}
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}

export default AddProduct;