import "../index.css"

export default function SearchBar() {
    return (
        <input
          type="text"
          placeholder="Search"
          className="w-3/5 p-2 rounded-md bg-red-50 text-amber-900 placeholder:text-amber-800"
        />
    )
}