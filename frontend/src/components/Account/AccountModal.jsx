import React from "react";
import { X } from "lucide-react";

const AccountModal = ({ open, onClose, title, children }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-2xl font-bold text-gray-900">{title}</h3>
          <button
            onClick={onClose}
            aria-label="Đóng"
            className="text-gray-500 hover:text-gray-800 rounded-full p-2 hover:bg-gray-100 transition"
          >
            <X size={20} />
          </button>
        </div>
        <div className="mt-2">{children}</div>
      </div>
    </div>
  );
};

export default AccountModal;
