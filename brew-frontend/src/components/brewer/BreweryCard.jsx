export default function BreweryCard({ brewery }) {
  // brewery matches your BreweryDTO (name, city, state, postal_code, website_url, etc.)
  
  
  return (
    <div className="flex flex-col gap-1">
      <div className="text-xl font-semibold">{brewery.name}</div>
      <div className="text-sm text-amber-900">
        {brewery.city}{brewery.state ? `, ${brewery.state}` : ''}{' '}
        {brewery.postal_code || ''}
      </div>
      {brewery.website_url && (
        <a
          href={brewery.website_url}
          target="_blank"
          rel="noreferrer"
          className="text-blue-700 underline text-sm"
        >
          {brewery.website_url}
        </a>
      )}
      {brewery.phone && <div className="text-sm text-amber-900">{brewery.phone}</div>}
    </div>
  );
}
