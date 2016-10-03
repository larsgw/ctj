# ctj (CProject to JSON)

A [node.js](https://nodejs.org/) program to convert [ContentMine](http://contentmine.org/)'s [CProject](https://github.com/ContentMine/CTree/blob/master/CProject.md)s to JSON.

## Usage

    Usage: ctj [options]

    Options:

      -h, --help                 output usage information
      -V, --version              output the version number
      -p, --project <path>       CProject folder
      -o, --output <path>        where to output results (directory will be created if it doesn't exist, defaults to CProject folder
      -c, --combine-ami <items>  combine AMI results of all the papers into JSON, grouped by type.
                                 specify types to combine, seperated by ",". Types are found in the title attribute in the root element of the results.xml file
      -s, --save-seperately      save paper JSON and AMI JSON seperately
      -M, --no-minify            do not minify JSON output
      -v, --verbosity <level>    amount of information to log (debug, info, log, warn, error)

## `-c, --combine-ami`

The `-c, --combine-ami` flag collects ami results and sorts by topic. This is an example of how it would work:

### Input

    CProject/
    ├── PMC1
    │   └── results
    │       └── word
    │           └── frequencies
    │               └── results.xml
    └── PMC2
        └── results
            └── word
                └── frequencies
                    └── results.xml

Files not necessary for this example are omitted.

### Output

```javascript
{
  // Words
  "foo": [
    {
      "count": 31
      "word": "foo"
      "pmcid": "PMC1"
    },
    {
      "count": 18
      "word": "foo"
      "pmcid": "PMC2"
    }
  ],
  "bar": [
    {
      "count": 25
      "word": "bar"
      "pmcid": "PMC2"
    }
  ]
}
```

There are two articles, **PMC1** and **PMC2**. In their respective `results/word/frequencies/results.xml` files, it says what words are found how many times.
**PMC1** has the word "foo" `31` times. **PMC2** has the word "foo" `18` times, and the word "bar" `25` times. The word "foo" occurs in `2` articles, which is the length of the array in the "foo" entry.
The word "bar" occurs in `1` article, which is the length of the array in the "bar" entry. The total number of occurrences is `31 + 18 = 49` for "foo" and `25` for "bar".

## Output

Output is JSON, in one or multiple files, depending on the flag `-s`.

### One file

```javascript
// data.json

{

  // Papers
  "articles": {
    ...
    "PMC0000000": {
      "metadata": {
        // JSON from eupmc_result.json
      },
      "AMIResults": {
        // AMI results of this article, sorted by their type
        ...
        "binomial": [
          // Instances of a <result> object in the corresponding <results> object
          ...
          {
            // Attributes of corresponding <result> object
          },
          ...
        ],
        ...
      }
    },
    ...
  },
  
  // AMI results of all articles, sorted by their type
  ...
  "binomial": {
    ...
    "Picea glauca": [
      // Instances of a <result> object with "Picea glauca" as match attribute
      ...
      {
        // Attributes of corresponding <result> object
        ...
        // PubMed Central ID of the paper where the <result> object comes from
        "pmc": "PMC0000000"
      },
      ...
    ],
    ...
  },
  ...
}
```

### Multiple files (`-s`)

```javascript
// articles.json

{
  ...
  "PMC0000000": {
    "metadata": {
      // JSON from eupmc_result.json
    },
    "AMIResults": {
      // AMI results of this article, sorted by their type
      ...
      "binomial": [
        // Instances of a <result> object in the corresponding <results> object
        ...
        {
          // Attributes of corresponding <result> object
        },
        ...
      ],
      ...
    }
  },
  ...
}

// AMI results of all articles, sorted by their type

// binomial.json

{
  ...
  "Picea glauca": [
    // Instances of a <result> object with "Picea glauca" as match attribute
    ...
    {
      // Attributes of corresponding <result> object
      ...
      // PubMed Central ID of the paper where the <result> object comes from
      "pmc": "PMC0000000"
    },
    ...
  ],
  ...
}

// genus.json

{
  ...
  "Pinus": [
    // Instances of a <result> object with "Pinus" as match attribute
    ...
    {
      // Attributes of corresponding <result> object
      ...
      // PubMed Central ID of the paper where the <result> object comes from
      "pmc": "PMC0000000"
    },
    ...
  ],
  ...
}

// etc.
```

## Dependencies

 * commander
 * fs
 * xmldoc
 * progress
 * colors