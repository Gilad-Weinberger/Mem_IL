import Link from "next/link";

const Hero = () => {
  return (
    <div className="max-w-3xl mx-auto mt-8 text-center">
      <h1 className="text-4xl mb-6">ברוכים הבאים לאתר שלנו</h1>
      <p className="text-lg mb-6">כאן תוכלו למצוא מידע על כל החיילים</p>
      <Link
        href="/soldiers"
        className="bg-blue-600 px-4 py-2 rounded-lg hover:bg-blue-700"
      >
        לכל החיילים
      </Link>
      <h1 className="text-center text-[30px] mt-11">על הפרוייקט</h1>
      <hr className="w-[50%] mt-1 mb-4 mx-auto" />
      <p className="text-center text-[20px]">Lorem ipsum dolor sit, amet consectetur adipisicing elit. Culpa ut officia suscipit earum exercitationem natus laudantium, non beatae libero modi reprehenderit nihil, numquam dignissimos doloremque nesciunt voluptatum alias et ad.</p>
      <h1 className="text-center text-[30px] mt-8">קצת עלינו</h1>
      <hr className="w-[50%] mt-1 mb-4 mx-auto" />
      <p className="text-center text-[20px]">Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam error nihil labore? Error sunt officia qui tenetur accusantium eos, id eum iure, praesentium ipsam consequuntur ea inventore quia laboriosam sequi.</p>
    </div>
  );
};

export default Hero;
