import Title from '../components/Title'
import { Link } from 'react-router-dom'

export default function NoPage() {
  return (
    <div className="bg-[#fff4e6] min-h-screen flex flex-col items-center justify-center text-center">
      <Title />

      <div className="text-3xl text-amber-900 mt-6">
        ERROR 404: No page found
      </div>

      <Link
        to="/login"
        className="mt-4 text-lg font-semibold text-amber-800 hover:underline"
      >
        Back to Login
      </Link>
    </div>
  )
}

