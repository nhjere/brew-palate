package com.codewithneal.brew_backend.CsvReader.beers;

import com.opencsv.bean.CsvToBeanBuilder;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.FileReader;
import java.io.Reader;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
public class BeerCsvImporter {

    @Autowired
    private BeerCsvRepository beerCsvRepository;

    // find a beer by provided id
    public BeerCsv getBeerById(UUID beerId) {
        return beerCsvRepository.findById(beerId)
        .orElseThrow(() -> new RuntimeException("Beer not found"));
    }

    // imports data from reading csv (beers.csv)
    public void importFromCsv(String filePath) {
        try (Reader reader = new FileReader(filePath)) {
            System.out.println(" Reading from file: " + filePath);

            List<BeerCsv> csvBeers = new CsvToBeanBuilder<BeerCsv>(reader)
                    .withType(BeerCsv.class)
                    .build()
                    .parse();

            System.out.println(" Parsed beers: " + csvBeers.size());

            for (BeerCsv csv : csvBeers) {
                System.out.println(" Parsed: " + csv.getName() + " | style: " + csv.getStyle());
                List<String> tags = generateBasicTags(csv);
                csv.setFlavorTags(tags);
            }

            if (csvBeers.isEmpty()) {
                System.out.println("ALERT No data parsed. Check the file format and column names.");
            } else {
                beerCsvRepository.saveAll(csvBeers);
                System.out.println(" Saved " + csvBeers.size() + " beers to imported_beers table.");
            }

        } catch (Exception e) {
            e.printStackTrace();
        }

}

    private List<String> generateBasicTags(BeerCsv csv) {
        List<String> tags = new ArrayList<>();
        String style = csv.getStyle() != null ? csv.getStyle().toLowerCase() : "";

        // ABV-driven
        if (csv.getAbv() != null) {
            if (csv.getAbv() >= 0.07) {
                tags.add("strong");
            } else if (csv.getAbv() > 0.04) {
                tags.add("sessionable");
            } else if (csv.getAbv() <= 0.04) {
                tags.add("light");
            }
        }
        // IBU-driven
        if (csv.getIbu() != null) {
            if (csv.getIbu() > 60) tags.add("bitter");
            if (csv.getIbu() <= 20) tags.add("smooth");
        }

        // Style-based
        if (style.contains("ipa")) tags.add("hoppy");
        if (style.contains("stout") || style.contains("porter")) tags.add("malty");
        if (style.contains("lager")) tags.add("crisp");
        if (style.contains("wheat") || style.contains("weiss")) tags.add("refreshing");
        if (style.contains("sour") || style.contains("gose") || style.contains("berliner")) tags.add("sour");
        if (style.contains("pilsner")) tags.add("clean");
        if (style.contains("fruit") || style.contains("berry")) tags.add("fruity");
        if (style.contains("belgian")) tags.add("spicy");
        if (style.contains("cream")) tags.add("sweet");
        if (style.contains("tripel") || style.contains("quad")) tags.add("sweet");
        if (style.contains("dry")) tags.add("dry");
        if (style.contains("dubbel")) tags.add("roasty");
        if (style.contains("imperial") || style.contains("barrel")) tags.add("boozy");
        if (style.contains("winter") || style.contains("christmas")) tags.add("winter");
        if (style.contains("summer") || style.contains("radler") || style.contains("shandy")) tags.add("summer");
        if (style.contains("coffee")) tags.add("coffee");
        if (style.contains("chocolate")) tags.add("chocolatey");
        if (style.contains("pine")) tags.add("piney");
        if (style.contains("citrus") || style.contains("grapefruit") || style.contains("lemon")) tags.add("citrusy");
        if (style.contains("floral")) tags.add("floral");
        if (style.contains("earthy")) tags.add("earthy");
        if (style.contains("funk") || style.contains("brett")) tags.add("funky");

        return tags;
    }

}
