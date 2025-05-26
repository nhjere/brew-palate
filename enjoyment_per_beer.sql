
SELECT 
a.brewery_id, 
a.brewery_name,
a.name,
b.overall_enjoyment,
b.comment
FROM 
brewer_beers a
inner join user_reviews b on a.id=b.beer_id