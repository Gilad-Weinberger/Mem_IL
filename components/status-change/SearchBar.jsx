import Image from "next/image";

const SearchBar = ({ searchQuery, setSearchQuery }) => {
  return (
    <div className="relative flex w-full md:w-1/2">
      <input
        type="text"
        dir="rtl"
        placeholder="חפש אימייל של משתמש"
        className="w-full rounded-lg py-2 pr-4 pl-10 text-black"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
      <Image
        src="/search.svg"
        alt="search"
        width={22}
        height={22}
        className="absolute left-3 top-1/2 transform -translate-y-1/2"
      />
    </div>
  );
};

export default SearchBar;
