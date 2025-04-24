import Image from "next/image";
import Link from "next/link";

const SocialLinks = ({ soldier, handleShare }) => {
  return (
    <div className="max-w-3xl mx-auto mt-8 mb-8">
      <div className="flex flex-wrap item-center justify-center gap-6">
        {soldier.instagram_link && (
          <Link href={soldier.instagram_link} target="_blank">
            <Image
              src={"/instagram.svg"}
              alt="instagram-icon"
              width={42}
              height={42}
              className="invert"
            />
          </Link>
        )}
        {soldier.facebook_link && (
          <Link href={soldier.facebook_link} target="">
            <Image
              src={"/facebook.svg"}
              alt="facebook-icon"
              width={42}
              height={42}
              className="invert"
            />
          </Link>
        )}
        {soldier.whatsapp_link && (
          <Link href={soldier.whatsapp_link} className="mt-0.5" target="_blank">
            <Image
              src={"/whatsapp.svg"}
              alt="whatsapp-icon"
              width={40}
              height={40}
              className="invert"
            />
          </Link>
        )}
        <button onClick={handleShare} className="mt-0.5">
          <Image
            src={"/share.svg"}
            alt="share-icon"
            width={40}
            height={40}
            className="invert"
          />
        </button>
      </div>
    </div>
  );
};

export default SocialLinks;
