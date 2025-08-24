export default function BreweryCard({ brewery }) {

    console.log(brewery.breweryId)

  return (
    <div className="flex flex-col">
      <h3 className="text-3xl md:text-4xl font-extrabold text-amber-900 leading-tight">
        {brewery.name}
      </h3>

      <p className="text-base md:text-lg text-amber-900 mt-1">
        {brewery.street ? `${brewery.street}, ` : ''}
        {brewery.city}
        {brewery.state ? `, ${brewery.state}` : ''}{' '}
        {brewery.postal_code || ''}
      </p>

              {brewery.phone && (
          <span className="text-sm md:text-base text-amber-900">
            {brewery.phone}
          </span>
        )}

      <div className="flex flex-wrap items-center gap-4 mt-2">
        {brewery.website_url && (
          <a
            href={brewery.website_url}
            target="_blank"
            rel="noreferrer"
            className="underline text-sm md:text-base text-blue-700 break-all"
          >
            {brewery.website_url}
          </a>
        )}


      </div>
    </div>
  );
}
