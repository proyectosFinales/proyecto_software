/*input.jsx*/

const FloatInput = ({ text, children }) => (
  <label className="relative block mb-4 text-gray-700">
    <span className="absolute top-[-8px] left-[10px] bg-white px-1 text-sm font-semibold">
      {text}
    </span>
    <div className="border-2 border-gray-300 rounded p-2 focus-within:border-blue-500">
      {children}
    </div>
  </label>
);

export { FloatInput };