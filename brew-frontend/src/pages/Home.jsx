import Header from '../components/header'
import "../App.css"

export default function Home() {
    return (
        <>
            <div>
                < Header />
                 <h2> 
                    The place for beer lovers! 
                 </h2>

                <section>
                    <p> 
                        Discover, review, and get recommended beers from microbreweries in your area! 
                    </p>
                    <p>                            
                        Please log in or create an account!
                    </p>
                </section>
            </div>
        </>
    )
}