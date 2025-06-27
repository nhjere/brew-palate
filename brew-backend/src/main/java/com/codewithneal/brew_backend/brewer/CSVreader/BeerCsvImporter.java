package com.codewithneal.brew_backend.brewer.CSVreader;

import com.codewithneal.brew_backend.brewer.repository.BeerCsvRepository;
import com.opencsv.bean.CsvToBeanBuilder;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.FileReader;
import java.io.Reader;
import java.util.ArrayList;
import java.util.List;

@Service
public class BeerCsvImporter {

    @Autowired
    private BeerCsvRepository beerCsvRepository;

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

        if (csv.getAbv() != null) {
            if (csv.getAbv() >= 7.0) tags.add("strong");
            if (csv.getAbv() <= 4.5) tags.add("light");
        }

        if (csv.getIbu() != null) {
            if (csv.getIbu() > 60) tags.add("bitter");
            if (csv.getIbu() <= 20) tags.add("smooth");
        }

        if (style.contains("ipa")) tags.add("hoppy");
        if (style.contains("stout") || style.contains("porter")) tags.add("malty");
        if (style.contains("lager")) tags.add("crisp");
        if (style.contains("wheat") || style.contains("weiss")) tags.add("refreshing");
        if (style.contains("sour") || style.contains("gose") || style.contains("berliner")) tags.add("sour");
        if (style.contains("pilsner")) tags.add("clean");
        if (style.contains("fruit") || style.contains("berry")) tags.add("fruity");
        if (style.contains("belgian")) tags.add("spicy");

        return tags;
    }
}
