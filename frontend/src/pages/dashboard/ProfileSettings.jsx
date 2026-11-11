import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { authService } from '../../services/authService';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import { User, Key, Save, CheckCircle2, ShieldAlert, Crop } from 'lucide-react';

const ProfileSettings = () => {
  const { user, refreshUser, updateLocalAvatar } = useAuth();
  
  const [formData, setFormData] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    password: '',
    confirm_password: '',
  });

  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Cropper states
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [rawImage, setRawImage] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [imageSize, setImageSize] = useState({ width: 300, height: 300 });

  const handleImageLoad = (e) => {
    const img = e.target;
    const containerSize = 300;
    let fitWidth = containerSize;
    let fitHeight = containerSize;
    const aspect = img.naturalWidth / img.naturalHeight;
    if (aspect > 1) {
      fitHeight = containerSize / aspect;
    } else {
      fitWidth = containerSize * aspect;
    }
    setImageSize({ width: fitWidth, height: fitHeight });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setRawImage(reader.result);
        setZoom(1);
        setPosition({ x: 0, y: 0 });
        setCropModalOpen(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemovePicture = async () => {
    localStorage.removeItem('local_avatar');
    updateLocalAvatar(null);
    try {
      const updated = await authService.updateProfile({ profile_picture: null });
      refreshUser(updated);
    } catch (err) {
      console.error("Failed to sync profile picture deletion on server:", err);
    }
  };

  // Drag handlers
  const handleMouseDown = (e) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleTouchStart = (e) => {
    setIsDragging(true);
    const touch = e.touches[0];
    setDragStart({ x: touch.clientX - position.x, y: touch.clientY - position.y });
  };

  const handleTouchMove = (e) => {
    if (!isDragging) return;
    const touch = e.touches[0];
    setPosition({
      x: touch.clientX - dragStart.x,
      y: touch.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleApplyCrop = () => {
    const img = new Image();
    img.src = rawImage;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 160;
      canvas.height = 160;
      const ctx = canvas.getContext('2d');

      const visualWidth = imageSize.width * zoom;
      const visualHeight = imageSize.height * zoom;
      const scaleX = img.naturalWidth / visualWidth;
      const scaleY = img.naturalHeight / visualHeight;

      // Crop frame relative to container center
      const cropLeftVisual = visualWidth / 2 - position.x - 80;
      const cropTopVisual = visualHeight / 2 - position.y - 80;

      // Crop box natural source dimensions
      const sx = cropLeftVisual * scaleX;
      const sy = cropTopVisual * scaleY;
      const sWidth = 160 * scaleX;
      const sHeight = 160 * scaleY;

      // Draw onto 160x160 output
      ctx.drawImage(img, sx, sy, sWidth, sHeight, 0, 0, 160, 160);

      const croppedBase64 = canvas.toDataURL('image/jpeg', 0.9);
      updateLocalAvatar(croppedBase64);
      setCropModalOpen(false);
      setRawImage(null);
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(false);
    setMessage('');
    setError('');

    const nameRegex = /^[a-zA-Z]+(?:\s[a-zA-Z]+)*$/;
    const cleanFn = formData.first_name.trim().replace(/\s+/g, ' ');
    const cleanLn = formData.last_name.trim().replace(/\s+/g, ' ');

    if (!cleanFn || !nameRegex.test(cleanFn)) {
      setError("First Name must contain alphabetic letters only. Numbers, special characters, and extra spaces are blocked.");
      return;
    }
    if (!cleanLn || !nameRegex.test(cleanLn)) {
      setError("Last Name must contain alphabetic letters only. Numbers, special characters, and extra spaces are blocked.");
      return;
    }

    if (formData.phone) {
      const cleanPhone = formData.phone.replace(/[^0-9]/g, '');
      const phoneRegex = /^[6-9][0-9]{9}$/;
      if (!phoneRegex.test(cleanPhone)) {
        setError("Contact phone must be a valid 10-digit mobile number starting with 6, 7, 8, or 9 (e.g. 9876543210).");
        return;
      }
    }

    if (formData.password) {
      if (formData.password.length < 8) {
        setError("New password must be at least 8 characters long.");
        return;
      }
      if (formData.password !== formData.confirm_password) {
        setError("New passwords do not match. Please verify.");
        return;
      }
    }

    setSubmitting(true);
    try {
      const payload = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        phone: formData.phone,
      };


      if (formData.password) {
        payload.password = formData.password;
      }

      const updated = await authService.updateProfile(payload);
      refreshUser(updated);
      setMessage("Profile and security settings saved successfully!");
      setFormData((prev) => ({
        ...prev,
        password: '',
        confirm_password: '',
      }));
    } catch (err) {
      console.error("Failed to update profile settings:", err);
      if (err.response && err.response.data) {
        const errorData = err.response.data;
        if (errorData.email) {
          setError(Array.isArray(errorData.email) ? errorData.email.join(' ') : errorData.email);
        } else if (errorData.phone) {
          setError(Array.isArray(errorData.phone) ? errorData.phone.join(' ') : errorData.phone);
        } else if (errorData.password) {
          setError(Array.isArray(errorData.password) ? errorData.password.join(' ') : errorData.password);
        } else {
          setError("Failed to update settings. Please verify details.");
        }
      } else {
        setError("Failed to update settings. Please check your network connection.");
      }
    } finally {
      setSubmitting(false);
    }
  };


  return (
    <div className="space-y-6 font-['Inter'] text-slate-900 max-w-4xl">
      
      {/* Category Pill Indicator */}
      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-200/80 text-[11px] font-semibold text-indigo-700 uppercase tracking-wider">
        <User className="w-3.5 h-3.5 text-indigo-600" />
        <span>Personal Profile Manager</span>
      </div>

      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-xl sm:text-2xl font-semibold text-slate-900 tracking-tight">Profile & Security Settings</h1>
        <p className="text-xs text-slate-500 mt-1">Configure your personal contact details, workspace fields, and authentication passwords.</p>
      </div>

      {message && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> {message}
        </div>
      )}

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold rounded-xl flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" /> {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left column: Overview Info (Read only) */}
        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200/80 flex flex-col justify-between space-y-6">
          <div className="space-y-5 flex flex-col items-center md:items-start text-center md:text-left">
            
            {/* Avatar block with choice button */}
            <div className="flex flex-col items-center gap-3">
              <div className="relative w-20 h-20 group">
                {user?.profile_picture ? (
                  <img
                    src={user.profile_picture}
                    alt="Profile"
                    className="w-20 h-20 rounded-2xl object-cover border border-slate-200 shadow-xs"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-2xl bg-indigo-600 text-white flex items-center justify-center text-2xl font-semibold shadow-xs shadow-indigo-600/20">
                    {user?.first_name?.[0]?.toUpperCase() || 'U'}
                  </div>
                )}
              </div>
              <div className="flex flex-col gap-1 w-full text-center">
                <label 
                  htmlFor="profile-pic-input" 
                  className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer shadow-xs text-center inline-block select-none"
                >
                  Choose Picture
                </label>
                {user?.profile_picture && (
                  <button
                    type="button"
                    onClick={handleRemovePicture}
                    className="text-rose-600 hover:underline text-[11px] font-semibold mt-1 cursor-pointer"
                  >
                    Remove Picture
                  </button>
                )}
                <input
                  type="file"
                  id="profile-pic-input"
                  className="hidden"
                  accept="image/*"
                  onChange={handleFileChange}
                />
              </div>
            </div>

            <div className="space-y-1 w-full pt-2">
              <h3 className="text-sm font-semibold text-slate-900">{user?.first_name} {user?.last_name}</h3>
              <p className="text-xs text-slate-500 truncate w-full max-w-50">{user?.email}</p>
            </div>
            
            <div className="flex flex-wrap gap-2 pt-2 justify-center md:justify-start">
              <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200/80 text-[10px] font-bold uppercase tracking-wider">
                {user?.role === 'SUPER_ADMIN' ? 'Super Admin' :
                 user?.role === 'SCHOOL_ADMIN' ? 'School Admin' :
                 user?.role === 'TEACHER' ? 'Class Teacher' :
                 user?.role === 'ACCOUNTANT' ? 'Accountant' :
                 user?.role === 'STUDENT' ? 'Student' :
                 user?.role === 'PARENT' ? 'Parent' : user?.role}
              </span>
              {user?.school?.name && (
                <span className="px-2.5 py-0.5 rounded-full bg-slate-200 text-slate-700 border border-slate-300 text-[10px] font-bold uppercase tracking-wider">
                  {user.school.name}
                </span>
              )}
            </div>
          </div>
          
          <div className="text-[11px] text-slate-500 font-medium leading-relaxed pt-4 border-t border-slate-200">
            For changing your account role authorizations, please contact your workspace School Administrator.
          </div>
        </div>

        {/* Right Columns: Edit inputs */}
        <div className="md:col-span-2 bg-white p-6 sm:p-7 rounded-2xl border border-slate-200/80 space-y-6 shadow-xs">
          
          {/* Section 1: Profile Details */}
          <div className="space-y-4">
            <h4 className="text-xs font-semibold text-indigo-700 uppercase tracking-wider border-b border-slate-100 pb-2">
              Personal Information
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="First Name"
                value={formData.first_name}
                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                required
              />
              <Input
                label="Last Name"
                value={formData.last_name}
                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                required
              />
            </div>
            <div>
              <Input
                label="Official Email Address"
                type="email"
                value={formData.email}
                disabled
                required
              />
              <p className="text-[11px] text-slate-400 mt-1 font-medium">Official Email is locked for security. Contact school admin to change your email.</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Contact Phone
              </label>
              <input
                type="text"
                maxLength={10}
                placeholder="9876543210 (starts with 6-9)"
                value={formData.phone}
                onChange={(e) => {
                  const raw = e.target.value.replace(/[^0-9]/g, '');
                  if (raw.length > 0 && !['6', '7', '8', '9'].includes(raw[0])) {
                    return;
                  }
                  setFormData({ ...formData, phone: raw.slice(0, 10) });
                }}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-medium focus:outline-none focus:border-indigo-600 focus:bg-white transition-colors"
              />
              <p className="text-[11px] text-slate-400 mt-1 font-medium">10-digit mobile number starting with 6, 7, 8, or 9.</p>
            </div>

          </div>

          {/* Section 2: Password Details */}
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <div className="flex items-center gap-2 text-xs font-semibold text-indigo-700 uppercase tracking-wider border-b border-slate-100 pb-2">
              <Key className="w-4 h-4 text-indigo-600" />
              <span>Change Security Password</span>
            </div>
            <p className="text-xs text-slate-500">
              Fill these fields only if you wish to reset your account password. Otherwise, leave them blank to keep your current password.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="New Password"
                type="password"
                placeholder="Minimum 8 characters"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
              <Input
                label="Confirm New Password"
                type="password"
                placeholder="Confirm password"
                value={formData.confirm_password}
                onChange={(e) => setFormData({ ...formData, confirm_password: e.target.value })}
              />
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <Button
              type="submit"
              variant="primary"
              className="gap-2 shadow-xs px-6 py-2.5"
              loading={submitting}
            >
              <Save className="w-4 h-4" /> Save Profile Settings
            </Button>
          </div>

        </div>

      </form>

      {/* Picture Crop Adjustment Modal */}
      <Modal isOpen={cropModalOpen} onClose={() => setCropModalOpen(false)} title="Adjust & Crop Profile Picture">
        <div className="space-y-5">
          <p className="text-xs text-slate-500">
            Drag the image inside the circular boundary frame to reposition, and use the slider below to zoom.
          </p>

          {/* Visual Crop Container */}
          <div 
            className="w-75 h-75 bg-slate-950 overflow-hidden relative rounded-2xl mx-auto cursor-move select-none border border-slate-200 shadow-inner"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleMouseUp}
          >
            {rawImage && (
              <img
                src={rawImage}
                alt="Raw Preview"
                onLoad={handleImageLoad}
                draggable={false}
                className="absolute origin-center max-w-none pointer-events-none select-none"
                style={{
                  width: `${imageSize.width}px`,
                  height: `${imageSize.height}px`,
                  transform: `translate(calc(-50% + ${position.x}px), calc(-50% + ${position.y}px)) scale(${zoom})`,
                  top: '50%',
                  left: '50%',
                  transition: isDragging ? 'none' : 'transform 0.1s ease-out',
                }}
              />
            )}
            
            {/* Visual Mask Overlay */}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              <div className="w-40 h-40 rounded-full border-2 border-white shadow-[0_0_0_9999px_rgba(15,23,42,0.65)]" />
            </div>
          </div>

          {/* Scale Control */}
          <div className="space-y-2 max-w-75 mx-auto">

            <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
              <span>Zoom Scale</span>
              <span>{Math.round(zoom * 100)}%</span>
            </div>
            <input
              type="range"
              min="1"
              max="3"
              step="0.05"
              value={zoom}
              onChange={(e) => setZoom(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => {
                setCropModalOpen(false);
                setRawImage(null);
              }}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleApplyCrop}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-700 transition-colors shadow-xs shadow-indigo-600/20 flex items-center gap-1.5 cursor-pointer"
            >
              <Crop className="w-3.5 h-3.5" /> Apply Crop
            </button>
          </div>

        </div>
      </Modal>

    </div>
  );
};

export default ProfileSettings;
