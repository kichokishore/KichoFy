import React, { useState, useEffect } from 'react';
import { X, Upload, Plus, Minus, Image as ImageIcon, Trash2, AlertCircle, CheckCircle } from 'lucide-react';
import { Product } from '../../../types';
import { productsService } from '../../../utils/databaseService';
import { supabase } from '../../../utils/supabaseClient';

interface ProductFormProps {
  product?: Product | null;
  onClose: () => void;
  onSave: () => void;
}

interface FormErrors {
  name?: string;
  price?: string;
  stock?: string;
  image_url?: string;
  category_id?: string;
}

export const ProductForm: React.FC<ProductFormProps> = ({ product, onClose, onSave }) => {
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    original_price: '',
    category_id: '',
    subcategory: '',
    stock: '',
    image_url: '',
    images: [] as string[],
    sizes: [] as string[],
    colors: [] as string[],
    tags: [] as string[],
    rating: '',
    reviews: '',
    is_new: false,
    is_best_seller: false,
  });

  const [newSize, setNewSize] = useState('');
  const [newColor, setNewColor] = useState('');
  const [newTag, setNewTag] = useState('');
  const [newImage, setNewImage] = useState('');

  // Predefined options
  const categories = [
    { value: 'traditional', label: 'Traditional' },
    { value: 'western', label: 'Western' },
    { value: 'accessories', label: 'Accessories' },
    { value: 'footwear', label: 'Footwear' },
    { value: 'handmade', label: 'Hand Made' },
    { value: 'kids', label: 'Kids' },
    { value: 'mens', label: 'Mens' },
    { value: 'womens', label: 'Womens' },
  ];

  const predefinedSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'];
  const predefinedColors = [
    'Red', 'Blue', 'Green', 'Black', 'White', 'Yellow', 'Pink', 
    'Purple', 'Orange', 'Brown', 'Gray', 'Navy', 'Maroon', 'Teal'
  ];

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        description: product.description || '',
        price: product.price.toString(),
        original_price: product.original_price?.toString() || '',
        category_id: product.category_id || '',
        subcategory: product.subcategory || '',
        stock: product.stock.toString(),
        image_url: product.image_url || '',
        images: product.images || [],
        sizes: product.sizes || [],
        colors: product.colors || [],
        tags: product.tags || [],
        rating: product.rating?.toString() || '',
        reviews: product.reviews.toString(),
        is_new: product.is_new,
        is_best_seller: product.is_best_seller,
      });
    }
  }, [product]);

  // Validation function
  const validateField = (name: string, value: string) => {
    const newErrors: FormErrors = { ...errors };

    switch (name) {
      case 'name':
        if (!value.trim()) {
          newErrors.name = 'Product name is required';
        } else if (value.trim().length < 2) {
          newErrors.name = 'Product name must be at least 2 characters';
        } else {
          delete newErrors.name;
        }
        break;

      case 'price':
        if (!value) {
          newErrors.price = 'Price is required';
        } else if (parseFloat(value) <= 0) {
          newErrors.price = 'Price must be greater than 0';
        } else {
          delete newErrors.price;
        }
        break;

      case 'stock':
        if (!value) {
          newErrors.stock = 'Stock is required';
        } else if (parseInt(value) < 0) {
          newErrors.stock = 'Stock cannot be negative';
        } else {
          delete newErrors.stock;
        }
        break;

      case 'image_url':
        if (value && !isValidUrl(value)) {
          newErrors.image_url = 'Please enter a valid URL';
        } else {
          delete newErrors.image_url;
        }
        break;

      case 'category_id':
        if (!value) {
          newErrors.category_id = 'Category is required';
        } else {
          delete newErrors.category_id;
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidUrl = (string: string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  const handleBlur = (field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    validateField(field, formData[field as keyof typeof formData] as string);
  };

  const handleChange = (field: string, value: string | boolean | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    if (touched[field] && typeof value === 'string') {
      validateField(field, value);
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size must be less than 5MB');
      return;
    }

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
      const filePath = `products/${fileName}`;

      // Upload image to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath);

      // Set as main image
      setFormData(prev => ({ ...prev, image_url: publicUrl }));
      
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Failed to upload image. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const addImage = () => {
    if (newImage && !formData.images.includes(newImage)) {
      if (isValidUrl(newImage)) {
        setFormData(prev => ({ ...prev, images: [...prev.images, newImage] }));
        setNewImage('');
      } else {
        alert('Please enter a valid image URL');
      }
    }
  };

  const removeImage = (image: string) => {
    setFormData(prev => ({ ...prev, images: prev.images.filter(img => img !== image) }));
  };

  const setMainImage = (image: string) => {
    setFormData(prev => ({ ...prev, image_url: image }));
  };

  const addSize = () => {
    if (newSize && !formData.sizes.includes(newSize)) {
      setFormData(prev => ({ ...prev, sizes: [...prev.sizes, newSize] }));
      setNewSize('');
    }
  };

  const removeSize = (size: string) => {
    setFormData(prev => ({ ...prev, sizes: prev.sizes.filter(s => s !== size) }));
  };

  const addColor = () => {
    if (newColor && !formData.colors.includes(newColor)) {
      setFormData(prev => ({ ...prev, colors: [...prev.colors, newColor] }));
      setNewColor('');
    }
  };

  const removeColor = (color: string) => {
    setFormData(prev => ({ ...prev, colors: prev.colors.filter(c => c !== color) }));
  };

  const addTag = () => {
    if (newTag && !formData.tags.includes(newTag)) {
      setFormData(prev => ({ ...prev, tags: [...prev.tags, newTag] }));
      setNewTag('');
    }
  };

  const removeTag = (tag: string) => {
    setFormData(prev => ({ ...prev, tags: prev.tags.filter(t => t !== tag) }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Mark all fields as touched
    const allTouched = {
      name: true,
      price: true,
      stock: true,
      image_url: true,
      category_id: true,
    };
    setTouched(allTouched);

    // Validate required fields
    const isValid = validateField('name', formData.name) &&
                   validateField('price', formData.price) &&
                   validateField('stock', formData.stock) &&
                   validateField('category_id', formData.category_id);

    if (!isValid) {
      alert('Please fix the validation errors before submitting.');
      return;
    }

    setLoading(true);

    try {
      const productData = {
        name: formData.name.trim(),
        description: formData.description.trim() || null,
        price: parseFloat(formData.price),
        original_price: formData.original_price ? parseFloat(formData.original_price) : null,
        category_id: formData.category_id || null,
        subcategory: formData.subcategory.trim() || null,
        stock: parseInt(formData.stock),
        image_url: formData.image_url.trim() || null,
        images: formData.images,
        sizes: formData.sizes,
        colors: formData.colors,
        tags: formData.tags,
        rating: formData.rating ? parseFloat(formData.rating) : null,
        reviews: parseInt(formData.reviews) || 0,
        is_new: formData.is_new,
        is_best_seller: formData.is_best_seller,
      };

      if (product) {
        await productsService.updateProduct(product.id, productData);
      } else {
        await productsService.createProduct(productData);
      }

      onSave();
      onClose();
    } catch (error) {
      console.error('Error saving product:', error);
      alert('Failed to save product. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const hasErrors = Object.keys(errors).length > 0;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-6xl max-h-[95vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 md:p-6 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800 z-10">
          <h2 className="text-lg md:text-xl font-heading font-bold text-gray-900 dark:text-white">
            {product ? 'Edit Product' : 'Add New Product'}
          </h2>
          <button
            onClick={onClose}
            className="p-1 md:p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 md:p-6 space-y-6">
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Basic Information */}
            <div className="xl:col-span-2 space-y-6">
              <div className="bg-gray-50 dark:bg-gray-700 rounded-2xl p-4 md:p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <CheckCircle className="mr-2 text-green-500" size={20} />
                  Basic Information
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Product Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => handleChange('name', e.target.value)}
                      onBlur={() => handleBlur('name')}
                      className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-primary ${
                        errors.name ? 'border-red-500' : 'border-gray-300 dark:border-gray-500'
                      }`}
                      placeholder="Enter product name"
                    />
                    {errors.name && (
                      <p className="mt-1 text-sm text-red-500 flex items-center">
                        <AlertCircle size={14} className="mr-1" />
                        {errors.name}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Description
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => handleChange('description', e.target.value)}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-500 rounded-lg bg-white dark:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="Enter product description"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Price (₹) *
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        required
                        value={formData.price}
                        onChange={(e) => handleChange('price', e.target.value)}
                        onBlur={() => handleBlur('price')}
                        className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-primary ${
                          errors.price ? 'border-red-500' : 'border-gray-300 dark:border-gray-500'
                        }`}
                        placeholder="0.00"
                      />
                      {errors.price && (
                        <p className="mt-1 text-sm text-red-500 flex items-center">
                          <AlertCircle size={14} className="mr-1" />
                          {errors.price}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Original Price (₹)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.original_price}
                        onChange={(e) => handleChange('original_price', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-500 rounded-lg bg-white dark:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="0.00"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Stock *
                      </label>
                      <input
                        type="number"
                        min="0"
                        required
                        value={formData.stock}
                        onChange={(e) => handleChange('stock', e.target.value)}
                        onBlur={() => handleBlur('stock')}
                        className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-primary ${
                          errors.stock ? 'border-red-500' : 'border-gray-300 dark:border-gray-500'
                        }`}
                        placeholder="0"
                      />
                      {errors.stock && (
                        <p className="mt-1 text-sm text-red-500 flex items-center">
                          <AlertCircle size={14} className="mr-1" />
                          {errors.stock}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Category *
                      </label>
                      <select
                        value={formData.category_id}
                        onChange={(e) => handleChange('category_id', e.target.value)}
                        onBlur={() => handleBlur('category_id')}
                        className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-primary ${
                          errors.category_id ? 'border-red-500' : 'border-gray-300 dark:border-gray-500'
                        }`}
                      >
                        <option value="">Select Category</option>
                        {categories.map(category => (
                          <option key={category.value} value={category.value}>
                            {category.label}
                          </option>
                        ))}
                      </select>
                      {errors.category_id && (
                        <p className="mt-1 text-sm text-red-500 flex items-center">
                          <AlertCircle size={14} className="mr-1" />
                          {errors.category_id}
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Subcategory
                    </label>
                    <input
                      type="text"
                      value={formData.subcategory}
                      onChange={(e) => handleChange('subcategory', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-500 rounded-lg bg-white dark:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="Enter subcategory"
                    />
                  </div>
                </div>
              </div>

              {/* Media & Images */}
              <div className="bg-gray-50 dark:bg-gray-700 rounded-2xl p-4 md:p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <ImageIcon className="mr-2 text-blue-500" size={20} />
                  Media & Images
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Main Image *
                    </label>
                    <div className="space-y-3">
                      <div className="flex flex-col sm:flex-row gap-3">
                        <input
                          type="url"
                          value={formData.image_url}
                          onChange={(e) => handleChange('image_url', e.target.value)}
                          onBlur={() => handleBlur('image_url')}
                          className={`flex-1 px-3 py-2 border rounded-lg bg-white dark:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-primary ${
                            errors.image_url ? 'border-red-500' : 'border-gray-300 dark:border-gray-500'
                          }`}
                          placeholder="Enter image URL or upload file"
                        />
                        <label className="flex items-center justify-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-light transition-colors cursor-pointer">
                          <Upload size={16} className="mr-2" />
                          Upload
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="hidden"
                          />
                        </label>
                      </div>
                      {errors.image_url && (
                        <p className="text-sm text-red-500 flex items-center">
                          <AlertCircle size={14} className="mr-1" />
                          {errors.image_url}
                        </p>
                      )}
                      {uploading && (
                        <p className="text-sm text-blue-500">Uploading image...</p>
                      )}
                      {formData.image_url && (
                        <div className="mt-2">
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Preview:</p>
                          <img
                            src={formData.image_url}
                            alt="Main product"
                            className="w-24 h-24 sm:w-32 sm:h-32 object-cover rounded-lg border border-gray-300 dark:border-gray-600"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none';
                            }}
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Additional Images */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Additional Images
                    </label>
                    <div className="flex flex-col sm:flex-row gap-2 mb-3">
                      <input
                        type="url"
                        value={newImage}
                        onChange={(e) => setNewImage(e.target.value)}
                        placeholder="Add image URL"
                        className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-500 rounded-lg bg-white dark:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                      <button
                        type="button"
                        onClick={addImage}
                        className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-light transition-colors flex items-center justify-center"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                      {formData.images.map((image, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={image}
                            alt={`Product ${index + 1}`}
                            className="w-full h-20 sm:h-24 object-cover rounded-lg border border-gray-300 dark:border-gray-600"
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-lg">
                            <div className="flex space-x-2">
                              <button
                                type="button"
                                onClick={() => setMainImage(image)}
                                className="p-1 bg-blue-500 text-white rounded"
                                title="Set as main"
                              >
                                <CheckCircle size={14} />
                              </button>
                              <button
                                type="button"
                                onClick={() => removeImage(image)}
                                className="p-1 bg-red-500 text-white rounded"
                                title="Remove"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar - Attributes & Settings */}
            <div className="space-y-6">
              {/* Attributes */}
              <div className="bg-gray-50 dark:bg-gray-700 rounded-2xl p-4 md:p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Attributes
                </h3>

                {/* Sizes */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Sizes
                  </label>
                  <div className="space-y-2">
                    <div className="flex flex-wrap gap-1 mb-2">
                      {predefinedSizes.map(size => (
                        <button
                          key={size}
                          type="button"
                          onClick={() => {
                            if (!formData.sizes.includes(size)) {
                              setFormData(prev => ({ ...prev, sizes: [...prev.sizes, size] }));
                            }
                          }}
                          className={`px-2 py-1 text-xs rounded border transition-colors ${
                            formData.sizes.includes(size)
                              ? 'bg-primary text-white border-primary'
                              : 'bg-white dark:bg-gray-600 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-500'
                          }`}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <input
                        type="text"
                        value={newSize}
                        onChange={(e) => setNewSize(e.target.value)}
                        placeholder="Custom size"
                        className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-500 rounded-lg bg-white dark:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                      />
                      <button
                        type="button"
                        onClick={addSize}
                        className="px-3 py-2 bg-primary text-white rounded-lg hover:bg-primary-light transition-colors flex items-center justify-center"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {formData.sizes.map((size) => (
                        <span
                          key={size}
                          className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-primary/10 text-primary"
                        >
                          {size}
                          <button
                            type="button"
                            onClick={() => removeSize(size)}
                            className="ml-1 hover:text-primary-dark transition-colors"
                          >
                            <Minus size={12} />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Colors */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Colors
                  </label>
                  <div className="space-y-2">
                    <div className="flex flex-wrap gap-1 mb-2">
                      {predefinedColors.map(color => (
                        <button
                          key={color}
                          type="button"
                          onClick={() => {
                            if (!formData.colors.includes(color)) {
                              setFormData(prev => ({ ...prev, colors: [...prev.colors, color] }));
                            }
                          }}
                          className={`px-2 py-1 text-xs rounded border transition-colors ${
                            formData.colors.includes(color)
                              ? 'bg-primary text-white border-primary'
                              : 'bg-white dark:bg-gray-600 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-500'
                          }`}
                        >
                          {color}
                        </button>
                      ))}
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <input
                        type="text"
                        value={newColor}
                        onChange={(e) => setNewColor(e.target.value)}
                        placeholder="Custom color"
                        className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-500 rounded-lg bg-white dark:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                      />
                      <button
                        type="button"
                        onClick={addColor}
                        className="px-3 py-2 bg-primary text-white rounded-lg hover:bg-primary-light transition-colors flex items-center justify-center"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {formData.colors.map((color) => (
                        <span
                          key={color}
                          className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-primary/10 text-primary"
                        >
                          {color}
                          <button
                            type="button"
                            onClick={() => removeColor(color)}
                            className="ml-1 hover:text-primary-dark transition-colors"
                          >
                            <Minus size={12} />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Tags */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Tags
                  </label>
                  <div className="flex flex-col sm:flex-row gap-2 mb-2">
                    <input
                      type="text"
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      placeholder="Add tag"
                      className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-500 rounded-lg bg-white dark:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                    />
                    <button
                      type="button"
                      onClick={addTag}
                      className="px-3 py-2 bg-primary text-white rounded-lg hover:bg-primary-light transition-colors flex items-center justify-center"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-primary/10 text-primary"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="ml-1 hover:text-primary-dark transition-colors"
                        >
                          <Minus size={12} />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Settings */}
              <div className="bg-gray-50 dark:bg-gray-700 rounded-2xl p-4 md:p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Settings
                </h3>
                <div className="space-y-4">
                  <label className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                    <span className="text-gray-700 dark:text-gray-300">New Arrival</span>
                    <input
                      type="checkbox"
                      checked={formData.is_new}
                      onChange={(e) => handleChange('is_new', e.target.checked)}
                      className="w-4 h-4 text-primary focus:ring-primary rounded"
                    />
                  </label>
                  <label className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                    <span className="text-gray-700 dark:text-gray-300">Best Seller</span>
                    <input
                      type="checkbox"
                      checked={formData.is_best_seller}
                      onChange={(e) => handleChange('is_best_seller', e.target.checked)}
                      className="w-4 h-4 text-primary focus:ring-primary rounded"
                    />
                  </label>
                </div>
              </div>

              {/* Quick Stats */}
              {product && (
                <div className="bg-gray-50 dark:bg-gray-700 rounded-2xl p-4 md:p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Product Stats
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Rating:</span>
                      <span className="font-medium">{product.rating || 'No ratings'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Reviews:</span>
                      <span className="font-medium">{product.reviews}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Created:</span>
                      <span className="font-medium">
                        {new Date(product.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row justify-end gap-3 pt-6 border-t border-gray-200 dark:border-gray-700 sticky bottom-0 bg-white dark:bg-gray-800 z-10 p-4 -mx-4 -mb-4 md:p-6 md:-mx-6 md:-mb-6">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium order-2 sm:order-1"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || hasErrors}
              className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-light disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium order-1 sm:order-2"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  {product ? 'Updating...' : 'Creating...'}
                </span>
              ) : (
                product ? 'Update Product' : 'Create Product'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};