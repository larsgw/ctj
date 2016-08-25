# Example #1

This directory contains a sample input (CProject) and sample output (JSON).

## Input

Use the following commands to get this CProject.

    > getpapers -q PMCID:PMC3543189 -o CProject -x
    
    > norma --project CProject/ -i fulltext.xml -o scholarly.html --transform nlm2html
    
    > ami2-species --project CProject/ -i scholarly.html --sp.species --sp.type genus
    
    > ami2-species --project CProject/ -i scholarly.html --sp.species --sp.type binomial
    
    > ami2-species --project CProject/ -i scholarly.html --sp.species --sp.type genussp
    
    > ami2-word --project CProject/ --w.words wordFrequencies --w.stopwords stopwords.txt
    
    // Insert as many AMI plugins as you like, but note that it is only tested with these yet
    
    > ami2-sequence --project CProject/ --filter file\(\*\*/results.xml\) -o sequencesfiles.xml
    
    // Necessary for current version (0.0.1); breaks otherwise

`CProject/` now looks like this:

    CProject/
    ├── eupmc_fulltext_html_urls.txt
    ├── eupmc_results.json
    ├── PMC3543189
    │   ├── eupmc_result.json
    │   ├── fulltext.xml
    │   ├── results
    │   │   ├── species
    │   │   │   ├── binomial
    │   │   │   │   └── results.xml
    │   │   │   ├── genus
    │   │   │   │   └── results.xml
    │   │   │   └── genussp
    │   │   │       └── empty.xml
    │   │   └── word
    │   │       └── frequencies
    │   │           ├── results.html
    │   │           └── results.xml
    │   ├── scholarly.html
    │   └── sequencesfiles.xml
    └── sequencesfiles.xml

## Output

To get the output, use the following command.

    > node path/to/ctj.js -p CProject -o JSON -s -c genus,genussp,binomial,frequencies

`JSON/` now looks like this:

    JSON
    ├── articles.json
    ├── binomial.json
    ├── frequencies.json
    └── genus.json

Perhaps you noticed that `genussp.json` does not exist, while we did pass it to the `-c` flag. This is because `CProject/PMC3543189/results/species/genussp/` has `empty.xml` and not `results.xml`, and is therefore not mentioned in `CProject/PMC3543189/sequencesfiles.xml`.

If you want everything in one file, omit the `-s` flag:

    > node path/to/ctj.js -p CProject -o JSON -c genus,genussp,binomial,frequencies

`JSON/` now looks like this:

    JSON
    ├── articles.json
    ├── binomial.json
    ├── data.json
    ├── frequencies.json
    └── genus.json