import Header from '../components/Header'

export default function NoPage() {
    return (
        <div>

            < Header />

            <div className='text-center text-3xl'>
                
                 ERROR 404: No page found
                 
            </div>

            <button> Back to Login </button>     
            

        </div>
        
    )
}