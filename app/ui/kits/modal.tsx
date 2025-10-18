import React from 'react';

interface ModalProps {
  children: React.ReactNode;
  onClose: () => void;
}

const Modal: React.FC<ModalProps> = ({ children, onClose }) => {
  const handleBackgroundClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm transition-opacity duration-300"
      onClick={handleBackgroundClick}
    >
      <div
        className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-2xl p-8 w-full max-w-lg relative transform scale-95 transition-transform duration-300 hover:scale-100"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white text-xl font-bold hover:text-gray-300"
        >
          &times;
        </button>
        <div className="text-white text-center">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;