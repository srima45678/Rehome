import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import API from '../../utils/api';

function EditProduct() {
  const navigate = useNavigate();
  const { id } = useParams();
  const user = JSON.parse(localStorage.getItem('user') || 'null');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    originalPrice: '',
    category: '',
    condition: '',
    city: '',
    address: '',
    allowOffers: true
  });

  const [existingImages, setExistingImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchProduct();
    // eslint-disable-next-line
  }, []);

  const fetchProduct = async () => {
    try {
      const res = await API.get(`/products/${id}`);
      const p = res.data.product;

      // Only the owner should be editing
      if (!user || p.seller?._id !== user.id) {
        alert('You can only edit your own listings');
        navigate('/seller/dashboard');
        return;
      }

      setFormData({
        title: p.title,
        description: p.description,
        price: p.price,
        originalPrice: p.originalPrice || '',
        category: p.category,
        condition: p.condition,
        city: p.city,
        address: p.address || '',
        allowOffers: p.allowOffers !== false
      });
      setExistingImages(p.images || []);
    } catch (err) {
      setError('Could not load product');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      // Note: images are not editable here — only text/price/category fields.
      // Editing images would need a separate upload flow with multipart/form-data.
      await API.put(`/products/${id}`, {
        title: formData.title,
        description: formData.description,
        price: Number(formData.price),
        originalPrice: Number(formData.originalPrice) || 0,
        category: formData.category,
        condition: formData.condition,
        city: formData.city,
        address: formData.address,
        allowOffers: formData.allowOffers
      });

      alert('✅ Listing updated!');
      navigate('/seller/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update listing');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary">
        <p className="text-5xl animate-bounce">✏️</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary py-10 px-4">
      <div className="max-w-3xl mx-auto">

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">✏️ Edit Listing</h1>
          <p className="text-gray-500 mt-2">Update your listing details below</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-8">
          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Existing images preview (read-only) */}
            {existingImages.length > 0 && (
              <div>
                <label className="block text-gray-700 font-semibold mb-2">Current Images</label>
                <div className="flex gap-3 flex-wrap">
                  {existingImages.map((img, i) => (
                    <img key={i} src={img} alt="" className="w-20 h-20 object-cover rounded-xl border-2 border-gray-200" />
                  ))}
                </div>
                <p className="text-gray-400 text-xs mt-2">Image editing isn't supported here yet — delete and re-list to change photos.</p>
              </div>
            )}

            <div>
              <label className="block text-gray-700 font-semibold mb-2">Product Title *</label>
              <input
                type="text" name="title" value={formData.title} onChange={handleChange} required
                className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-primary focus:ring-2 focus:ring-orange-100 transition-all"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 font-semibold mb-2">Category *</label>
                <select name="category" value={formData.category} onChange={handleChange} required
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-primary focus:ring-2 focus:ring-orange-100 transition-all bg-white">
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
                <label className="block text-gray-700 font-semibold mb-2">Condition *</label>
                <select name="condition" value={formData.condition} onChange={handleChange} required
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-primary focus:ring-2 focus:ring-orange-100 transition-all bg-white">
                  <option value="like_new">✨ Like New</option>
                  <option value="good">👍 Good</option>
                  <option value="fair">👌 Fair</option>
                  <option value="poor">⚠️ Poor</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 font-semibold mb-2">Selling Price (Rs.) *</label>
                <input
                  type="number" name="price" value={formData.price} onChange={handleChange} required min="0"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-primary focus:ring-2 focus:ring-orange-100 transition-all"
                />
              </div>
              <div>
                <label className="block text-gray-700 font-semibold mb-2">Original Price (Rs.)</label>
                <input
                  type="number" name="originalPrice" value={formData.originalPrice} onChange={handleChange} min="0"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-primary focus:ring-2 focus:ring-orange-100 transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 font-semibold mb-2">City *</label>
                <select name="city" value={formData.city} onChange={handleChange} required
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-primary focus:ring-2 focus:ring-orange-100 transition-all bg-white">
                  {["Kathmandu","Lalitpur","Bhaktapur","Pokhara","Chitwan","Biratnagar","Butwal","Dharan"].map(city => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-gray-700 font-semibold mb-2">Area / Address</label>
                <input
                  type="text" name="address" value={formData.address} onChange={handleChange}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-primary focus:ring-2 focus:ring-orange-100 transition-all"
                />
              </div>
            </div>

            {/* Allow Offers Toggle */}
            <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl p-4">
              <input
                type="checkbox"
                id="allowOffersEdit"
                checked={formData.allowOffers}
                onChange={e => setFormData({ ...formData, allowOffers: e.target.checked })}
                className="w-5 h-5 accent-green-600"
              />
              <label htmlFor="allowOffersEdit" className="cursor-pointer">
                <p className="font-semibold text-green-800">💰 Allow buyers to make offers</p>
                <p className="text-green-600 text-xs mt-0.5">If unchecked, buyers can only Buy Now at your listed price</p>
              </label>
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-2">Description *</label>
              <textarea
                name="description" value={formData.description} onChange={handleChange} required rows={5}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-primary focus:ring-2 focus:ring-orange-100 transition-all resize-none"
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl">⚠️ {error}</div>
            )}

            <div className="flex gap-4 pt-2">
              <button type="button" onClick={() => navigate(-1)}
                className="flex-1 border-2 border-gray-200 text-gray-600 font-bold py-3 rounded-xl hover:bg-gray-50 transition-all">
                Cancel
              </button>
              <button type="submit" disabled={saving}
                className="flex-1 bg-primary hover:bg-accent text-white font-bold py-3 rounded-xl transition-all disabled:opacity-50">
                {saving ? '⏳ Saving...' : '💾 Save Changes'}
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}

export default EditProduct;