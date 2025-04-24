import Image from "next/image";

const StatusButton = ({ status, currentStatus, onClick, icon }) => {
  return (
    <button
      className="bg-white text-black p-2 rounded-full relative"
      onClick={onClick}
    >
      <Image src={icon} alt={status} width={25} height={25} />
      {currentStatus === status && (
        <>
          <span className="absolute -top-0.5 -right-0.5 bg-black w-3.5 h-3.5 rounded-full border border-white shadow-sm"></span>
        </>
      )}
    </button>
  );
};

export default StatusButton;
