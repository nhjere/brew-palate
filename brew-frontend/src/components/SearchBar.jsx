import "../index.css"

export default function SearchBar() {
    return (
        <input
          type="text"
          placeholder="Search"
          className="w-4/5 p-2 rounded-md bg-orange-100 text-amber-900 placeholder:text-amber-800"
        />
    )
}