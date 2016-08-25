# ctj (CProject to JSON)

A [NodeJS]() program to convert [ContentMine](http://contentmine.org/)'s [CProject](https://github.com/ContentMine/CTree/blob/master/CProject.md)s to JSON.

## Usage

  Usage: ctj [options]

  Options:

    -h, --help                 output usage information
    -V, --version              output the version number
    -p, --project <path>       CProject folder
    -o, --output <path>        where to output results (directory will be created if it doesn't exist, defaults to CProject folder
    -c, --combine-ami <items>  Combine AMI results of all the papers into JSON, sorted by type. Specify types to combine, seperated by ",". Types are found in the title attribute in the root element of the results.xml file
    -s, --save-seperately      Save paper JSON and AMI JSON seperately. Default: false
    -v, --verbosity <level>    amount of information to log (debug, info, log, warn, error)

## Output

Output is JSON, in one or multiple files, depending on the flag `-s`.

### One file

Structure:

```javascript
// data.json

{

  // Papers
  "articles": [
    ...
    {
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
  ],
  
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
        pmc: PMC0000000
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

[
  ...
  {
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
]

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
      pmc: PMC0000000
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
      pmc: PMC0000000
    },
    ...
  ],
  ...
}

// etc.
```