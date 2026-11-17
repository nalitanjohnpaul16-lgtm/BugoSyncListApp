import React, { useState } from 'react';
import { 
  KeyRound, 
  Lock, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw,
  Check
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { evaluatePasswordStrength } from '../../utils/passwordStrength';

interface ChangePasswordSectionProps {
  onSuccess?: () => void;
  className?: string;
}

export const ChangePasswordSection: React.FC<ChangePasswordSectionProps> = ({ 
  onSuccess, 
  className = '' 
}) => {
  const { changePassword } = useApp();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const strength = evaluatePasswordStrength(newPassword);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!currentPassword) {
      setErrorMsg('Please enter your current password.');
      return;
    }

    if (!newPassword) {
      setErrorMsg('Please enter a new password.');
      return;
    }

    if (!strength.isValid) {
      setErrorMsg(strength.errorMessage || 'New password must meet all 5 strong security requirements.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg('New passwords do not match.');
      return;
    }

    if (currentPassword === newPassword) {
      setErrorMsg('New password must be different from your current password.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await changePassword({
        currentPassword,
        newPassword
      });

      if (res.success) {
        setSuccessMsg('Password updated successfully.');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        if (onSuccess) onSuccess();
      } else {
        setErrorMsg(res.message || 'Incorrect current password or failed to update.');
      }
    } catch {
      setErrorMsg('Network error while updating password.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`bg-white rounded-2xl p-5 sm:p-6 border border-gray-200 shadow-xs space-y-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
        <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#0c532b] flex items-center justify-center border border-emerald-100 shrink-0">
          <KeyRound className="w-5 h-5" />
        </div>
        <h2 className="text-base font-bold text-gray-900">Change Password</h2>
      </div>

      {/* Feedback Alerts */}
      {successMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-3.5">
        {/* Current Password */}
        <div>
          <label className="block text-xs font-bold text-gray-700 mb-1">
            Current Password <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type={showCurrent ? 'text' : 'password'}
              value={currentPassword}
              onChange={(e) => {
                setCurrentPassword(e.target.value);
                setErrorMsg('');
              }}
              placeholder="Enter current password"
              className="w-full bg-gray-50 border border-gray-300 text-gray-900 rounded-xl pl-9 pr-10 py-2.5 text-xs font-medium outline-none focus:ring-2 focus:ring-[#0c532b] focus:border-transparent transition"
            />
            <button
              type="button"
              onClick={() => setShowCurrent(!showCurrent)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
              title={showCurrent ? 'Hide password' : 'Show password'}
            >
              {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* New Password */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              New Password <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type={showNew ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  setErrorMsg('');
                }}
                placeholder="Min 8 chars, A-z, 0-9, symbol"
                className="w-full bg-gray-50 border border-gray-300 text-gray-900 rounded-xl pl-9 pr-10 py-2.5 text-xs font-medium outline-none focus:ring-2 focus:ring-[#0c532b] focus:border-transparent transition"
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                title={showNew ? 'Hide password' : 'Show password'}
              >
                {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {newPassword && (
              <div className="mt-2 space-y-1.5">
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${strength.strengthColor}`}
                      style={{ width: strength.strengthWidth }}
                    />
                  </div>
                  <span className="text-[10px] font-bold text-gray-600">{strength.strengthLabel}</span>
                </div>
                <ul className="space-y-0.5 text-[10px]">
                  {strength.requirements.map(req => (
                    <li
                      key={req.id}
                      className={`flex items-center gap-1 ${req.met ? 'text-emerald-700 font-semibold' : 'text-gray-400'}`}
                    >
                      <Check className={`w-3 h-3 ${req.met ? 'text-emerald-600' : 'text-gray-300'}`} />
                      <span>{req.label}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              Confirm New Password <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type={showConfirm ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  setErrorMsg('');
                }}
                placeholder="Repeat new password"
                className="w-full bg-gray-50 border border-gray-300 text-gray-900 rounded-xl pl-9 pr-10 py-2.5 text-xs font-medium outline-none focus:ring-2 focus:ring-[#0c532b] focus:border-transparent transition"
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                title={showConfirm ? 'Hide password' : 'Show password'}
              >
                {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {confirmPassword && newPassword !== confirmPassword && (
              <p className="text-[11px] text-rose-600 font-medium mt-1">Passwords do not match</p>
            )}
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            disabled={
              isSubmitting ||
              !currentPassword ||
              !newPassword ||
              !confirmPassword ||
              newPassword !== confirmPassword ||
              !strength.isValid
            }
            className="px-5 py-2.5 bg-[#0c532b] hover:bg-[#094222] disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold rounded-xl transition shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            {isSubmitting ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <CheckCircle2 className="w-3.5 h-3.5" />
            )}
            <span>Update Password</span>
          </button>
        </div>
      </form>
    </div>
  );
};
