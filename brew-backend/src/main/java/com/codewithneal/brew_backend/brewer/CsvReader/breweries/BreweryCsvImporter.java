package com.codewithneal.brew_backend.brewer.CsvReader.breweries;

import com.opencsv.bean.CsvToBeanBuilder;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.FileReader;
import java.io.Reader;
import java.util.List;

@Service
public class BreweryCsvImporter {

    @Autowired
    private BreweryCsvRepository breweryCsvRepository;

    public void importFromCsv(String filePath) {
        try (Reader reader = new FileReader(filePath)) {
            List<BreweryCsv> breweries = new CsvToBeanBuilder<BreweryCsv>(reader)
                    .withType(BreweryCsv.class)
                    .build()
                    .parse();

            System.out.println("Parsed " + breweries.size() + " breweries.");
            breweryCsvRepository.saveAll(breweries);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
