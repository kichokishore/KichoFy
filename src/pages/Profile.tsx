import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  FiEdit3 as Edit3,
  FiSave as Save,
  FiX as X,
  FiMapPin as MapPin,
  FiPhone as Phone,
  FiMail as Mail,
  FiUser as User,
  FiGlobe as Globe,
  FiHash as Hash,
  FiUpload as UploadIcon
} from 'react-icons/fi';
import { useApp } from '../contexts/AppContext';
import { supabase } from '../utils/supabaseClient';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.5,
      ease: "easeOut",
    },
  },
};

const inputVariants = {
  focus: {
    scale: 1.02,
    boxShadow: "0 0 0 3px rgba(168, 85, 247, 0.3)",
    transition: { duration: 0.2 },
  },
  blur: {
    scale: 1,
    boxShadow: "none",
  },
};

export const Profile: React.FC = () => {
  const { state, dispatch } = useApp();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    mobile_number: '',
    address_line1: '',
    address_line2: '',
    city: '',
    state: '',
    country: '',
    pincode: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize form with user data
  useEffect(() => {
    if (state.user) {
      setFormData({
        name: state.user.name || '',
        email: state.user.email || '',
        phone: state.user.phone || '',
        mobile_number: state.user.mobile_number || '',
        address_line1: state.user.address_line1 || '',
        address_line2: state.user.address_line2 || '',
        city: state.user.city || '',
        state: state.user.state || '',
        country: state.user.country || '',
        pincode: state.user.pincode || '',
      });
      setAvatarUrl(state.user.avatar_url || null);
    }
  }, [state.user]);

  // Fetch full profile from Supabase (on mount or ID change)
  useEffect(() => {
    const fetchProfile = async () => {
      if (!state.user?.id) return;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', state.user.id)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        return;
      }

      setFormData(prev => ({
        ...prev,
        name: data.name || prev.name,
        email: data.email || prev.email,
        phone: data.phone || prev.phone,
        mobile_number: data.mobile_number || prev.mobile_number,
        address_line1: data.address_line1 || prev.address_line1,
        address_line2: data.address_line2 || prev.address_line2,
        city: data.city || prev.city,
        state: data.state || prev.state,
        country: data.country || prev.country,
        pincode: data.pincode || prev.pincode,
      }));
      setAvatarUrl(data.avatar_url || null);
    };

    fetchProfile();
  }, [state.user?.id]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    if (!state.user?.id) return;
    
    setIsLoading(true);
    setError(null);

    // Update auth email if changed
    if (formData.email !== state.user.email) {
      const { error: emailError } = await supabase.auth.updateUser({ 
        email: formData.email 
      });
      
      if (emailError) {
        setError('Failed to update email: ' + emailError.message);
        setIsLoading(false);
        return;
      }
    }

    // Update profile in database
    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        name: formData.name || null,
        email: formData.email || null,
        phone: formData.phone || null,
        mobile_number: formData.mobile_number || null,
        address_line1: formData.address_line1 || null,
        address_line2: formData.address_line2 || null,
        city: formData.city || null,
        state: formData.state || null,
        country: formData.country || null,
        pincode: formData.pincode || null,
        avatar_url: avatarUrl || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', state.user.id);

    if (profileError) {
      setError('Failed to save profile: ' + profileError.message);
      setIsLoading(false);
      return;
    }

    // Update context
    dispatch({
      type: 'SET_USER',
      payload: {
        ...state.user,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        mobile_number: formData.mobile_number,
        address_line1: formData.address_line1,
        address_line2: formData.address_line2,
        city: formData.city,
        state: formData.state,
        country: formData.country,
        pincode: formData.pincode,
        avatar_url: avatarUrl,
      },
    });

    setIsEditing(false);
    setIsLoading(false);
  };

  const handleCancel = () => {
    if (state.user) {
      setFormData({
        name: state.user.name || '',
        email: state.user.email || '',
        phone: state.user.phone || '',
        mobile_number: state.user.mobile_number || '',
        address_line1: state.user.address_line1 || '',
        address_line2: state.user.address_line2 || '',
        city: state.user.city || '',
        state: state.user.state || '',
        country: state.user.country || '',
        pincode: state.user.pincode || '',
      });
      setAvatarUrl(state.user.avatar_url || null);
    }
    setIsEditing(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    dispatch({ type: 'SET_USER', payload: null });
    navigate('/login');
  };

  const uploadAvatar = async (file: File) => {
    if (!state.user?.id) return;
    
    setUploading(true);
    try {
      // Upload to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${state.user.id}/${Math.random()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      setAvatarUrl(publicUrl);
      return publicUrl;
    } catch (error: any) {
      setError('Failed to upload avatar: ' + error.message);
      return null;
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const file = e.target.files[0];
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }
    
    await uploadAvatar(file);
  };

  const handleAvatarClick = () => {
    if (isEditing && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  if (!state.user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="w-16 h-16 border-4 border-t-primary border-gray-300 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading profile...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl overflow-hidden"
        >
          {/* Header */}
          <div className="relative h-48 bg-gradient-to-r from-primary to-purple-600">
            <div className="absolute -bottom-16 left-8">
              <motion.div
                whileHover={isEditing ? { scale: 1.1 } : {}}
                whileTap={isEditing ? { scale: 0.95 } : {}}
                onClick={handleAvatarClick}
                className={`w-32 h-32 rounded-full bg-white border-4 border-white shadow-xl overflow-hidden ${
                  isEditing ? 'cursor-pointer' : ''
                }`}
              >
                {avatarUrl ? (
                  <img 
                    src={avatarUrl} 
                    alt="Profile" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-pink-400 to-purple-600 flex items-center justify-center text-white text-2xl font-bold">
                    {state.user.name?.charAt(0).toUpperCase() || '?'}
                  </div>
                )}
                {isEditing && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                    <UploadIcon className="text-white" size={24} />
                  </div>
                )}
              </motion.div>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
              />
            </div>
            <div className="absolute top-6 right-6 flex space-x-3">
              {!isEditing ? (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsEditing(true)}
                  className="flex items-center px-4 py-2 bg-white/20 backdrop-blur-sm text-white rounded-full hover:bg-white/30 transition-all"
                >
                  <Edit3 className="mr-2" size={18} />
                  Edit Profile
                </motion.button>
              ) : (
                <div className="flex space-x-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleSave}
                    disabled={isLoading || uploading}
                    className="flex items-center px-4 py-2 bg-green-500 text-white rounded-full hover:bg-green-600 disabled:opacity-50"
                  >
                    {isLoading || uploading ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <>
                        <Save className="mr-2" size={18} />
                        Save
                      </>
                    )}
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleCancel}
                    className="flex items-center px-4 py-2 bg-gray-700 text-white rounded-full hover:bg-gray-800"
                  >
                    <X className="mr-2" size={18} />
                    Cancel
                  </motion.button>
                </div>
              )}
            </div>
          </div>

          {/* Profile Content */}
          <div className="pt-20 pb-8 px-8">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  {isEditing ? (
                    <motion.input
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="bg-transparent border-b-2 border-primary outline-none text-3xl font-bold text-gray-900 dark:text-white w-64"
                      whileFocus={inputVariants.focus}
                      whileBlur={inputVariants.blur}
                    />
                  ) : (
                    state.user.name || 'User'
                  )}
                </h1>
                <p className="text-gray-500 dark:text-gray-400 mt-1">
                  Customer since {new Date(state.user.created_at).getFullYear()}
                </p>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleLogout}
                className="px-4 py-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
              >
                Logout
              </motion.button>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 p-3 bg-red-100 text-red-700 rounded-lg"
              >
                {error}
              </motion.div>
            )}

            <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Personal Information */}
              <motion.div variants={itemVariants} className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
                  <User className="mr-2 text-primary" /> Personal Information
                </h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                    {isEditing ? (
                      <motion.input
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full p-3 bg-gray-50 dark:bg-gray-700 rounded-xl border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary"
                        whileFocus={inputVariants.focus}
                        whileBlur={inputVariants.blur}
                      />
                    ) : (
                      <div className="flex items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-xl">
                        <Mail className="text-gray-400 mr-2" size={18} />
                        <span>{formData.email}</span>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone</label>
                    {isEditing ? (
                      <motion.input
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="w-full p-3 bg-gray-50 dark:bg-gray-700 rounded-xl border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary"
                        whileFocus={inputVariants.focus}
                        whileBlur={inputVariants.blur}
                        placeholder="Landline"
                      />
                    ) : (
                      <div className="flex items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-xl">
                        <Phone className="text-gray-400 mr-2" size={18} />
                        <span>{formData.phone || 'Not provided'}</span>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Mobile</label>
                    {isEditing ? (
                      <motion.input
                        name="mobile_number"
                        value={formData.mobile_number}
                        onChange={handleInputChange}
                        className="w-full p-3 bg-gray-50 dark:bg-gray-700 rounded-xl border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary"
                        whileFocus={inputVariants.focus}
                        whileBlur={inputVariants.blur}
                        placeholder="Mobile number"
                      />
                    ) : (
                      <div className="flex items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-xl">
                        <Phone className="text-gray-400 mr-2" size={18} />
                        <span>{formData.mobile_number || 'Not provided'}</span>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>

              {/* Address Information */}
              <motion.div variants={itemVariants} className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
                  <MapPin className="mr-2 text-primary" /> Address
                </h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Address Line 1</label>
                    {isEditing ? (
                      <motion.input
                        name="address_line1"
                        value={formData.address_line1}
                        onChange={handleInputChange}
                        className="w-full p-3 bg-gray-50 dark:bg-gray-700 rounded-xl border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary"
                        whileFocus={inputVariants.focus}
                        whileBlur={inputVariants.blur}
                      />
                    ) : (
                      <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-xl">
                        {formData.address_line1 || 'Not provided'}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Address Line 2</label>
                    {isEditing ? (
                      <motion.input
                        name="address_line2"
                        value={formData.address_line2}
                        onChange={handleInputChange}
                        className="w-full p-3 bg-gray-50 dark:bg-gray-700 rounded-xl border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary"
                        whileFocus={inputVariants.focus}
                        whileBlur={inputVariants.blur}
                      />
                    ) : (
                      <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-xl">
                        {formData.address_line2 || 'Not provided'}
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">City</label>
                      {isEditing ? (
                        <motion.input
                          name="city"
                          value={formData.city}
                          onChange={handleInputChange}
                          className="w-full p-3 bg-gray-50 dark:bg-gray-700 rounded-xl border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary"
                          whileFocus={inputVariants.focus}
                          whileBlur={inputVariants.blur}
                        />
                      ) : (
                        <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-xl">
                          {formData.city || 'Not provided'}
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">State</label>
                      {isEditing ? (
                        <motion.input
                          name="state"
                          value={formData.state}
                          onChange={handleInputChange}
                          className="w-full p-3 bg-gray-50 dark:bg-gray-700 rounded-xl border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary"
                          whileFocus={inputVariants.focus}
                          whileBlur={inputVariants.blur}
                        />
                      ) : (
                        <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-xl">
                          {formData.state || 'Not provided'}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Country</label>
                      {isEditing ? (
                        <motion.input
                          name="country"
                          value={formData.country}
                          onChange={handleInputChange}
                          className="w-full p-3 bg-gray-50 dark:bg-gray-700 rounded-xl border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary"
                          whileFocus={inputVariants.focus}
                          whileBlur={inputVariants.blur}
                        />
                      ) : (
                        <div className="flex items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-xl">
                          <Globe className="text-gray-400 mr-2" size={18} />
                          <span>{formData.country || 'Not provided'}</span>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Pincode</label>
                      {isEditing ? (
                        <motion.input
                          name="pincode"
                          value={formData.pincode}
                          onChange={handleInputChange}
                          className="w-full p-3 bg-gray-50 dark:bg-gray-700 rounded-xl border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary"
                          whileFocus={inputVariants.focus}
                          whileBlur={inputVariants.blur}
                        />
                      ) : (
                        <div className="flex items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-xl">
                          <Hash className="text-gray-400 mr-2" size={18} />
                          <span>{formData.pincode || 'Not provided'}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};