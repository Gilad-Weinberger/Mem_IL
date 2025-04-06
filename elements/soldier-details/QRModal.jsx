import Image from "next/image";
import dynamic from "next/dynamic";

const QRCodeCanvas = dynamic(
  () => import("qrcode.react").then((mod) => mod.QRCodeCanvas),
  { ssr: false }
);

const QRModal = ({ showModal, onClose, url }) => {
  if (!showModal) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-[rgb(25,25,25)] p-6 rounded-lg relative">
        <button
          onClick={onClose}
          className="absolute top-2 left-2 text-white text-2xl hover:text-gray-400"
        >
          ×
        </button>
        <h3 className="text-white text-xl mb-4 text-center">סרוק לשיתוף</h3>
        <div className="bg-[rgb(25,25,25)] p-4">
          <QRCodeCanvas
            value={url}
            size={256}
            level="H"
            includeMargin={true}
            fgColor="#FFFFFF"
            bgColor="rgb(25,25,25)"
          />
        </div>
      </div>
    </div>
  );
};

export default QRModal;
