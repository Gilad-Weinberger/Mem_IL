const NotificationModal = ({ showModal, onClose, title, message }) => {
  if (!showModal) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-[rgb(25,25,25)] p-6 rounded-lg relative max-w-sm mx-4">
        <button
          onClick={onClose}
          className="absolute top-2 left-2 text-white text-2xl hover:text-gray-400"
        >
          ×
        </button>
        <h3 className="text-white text-xl mb-4 text-center">{title}</h3>
        <p className="text-white text-center mb-4">{message}</p>
        <button
          onClick={onClose}
          className="w-full mt-2 rounded-lg hover:text-black hover:bg-white border border-white py-2 text-lg transition-all duration-200"
        >
          אישור
        </button>
      </div>
    </div>
  );
};

export default NotificationModal;
