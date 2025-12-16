import Title from '../components/Title'
import { Link } from 'react-router-dom'

export default function NoPage() {
  return (
    <div className="bg-white min-h-screen flex flex-col items-center justify-center px-6 text-center">
      <Title />

      <div className="mt-6 text-3xl text-[#3C547A]">
        Error 404: Page Not Found
      </div>


      <Link
        to="/login"
        className="
          mt-6 inline-flex items-center justify-center
          px-6 py-2.5 rounded-full
          bg-[#3C547A] hover:bg-[#314466]
          !text-white font-semibold transition-colors
        "
      >
        Back to Login
      </Link>
    </div>
  );
}
