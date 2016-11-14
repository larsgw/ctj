// Include
var program = require( 'commander' )
  , fs      = require( 'fs'        )
  , xmldoc  = require( 'xmldoc'    )
  , progress= require( 'progress'  )

              require( 'colors'    )

// BEGIN Utilities

Array.prototype.removeEmptyValues = function () {
  for ( var i = 0; i < this.length; i++ ) {
    if ( this[ i ] === undefined ) {
      this.splice( i--, 1 );
    }
  }
  return this;
};

if (!String.prototype.repeat) {
  String.prototype.repeat = function ( n ) {
    var n = parseInt( n )
    
    if ( isNaN( n ) ) 
      throw new TypeError('can\'t convert ' + this + ' to object');
    
    if ( n >= 0 )
      return ( new Array( n + 1 ) ).join ( this.toString() )
  }
}

// END

function getColumns ( columns ) {
  var columnsDict= {
    genus: 'genus',
    binomial: 'binomial',
    frequencies: 'frequencies',
    
    c: 'genus',
    b: 'binomial',
    w: 'frequencies'
  }
  return columns
    .split( ',' )
    .filter( function ( v ) { return columnsDict.hasOwnProperty( v ) } )
    .map( function ( v ) { return columnsDict[ v ] } )
}

function cleanDirectoryName ( directory ) {
  return directory.replace( /\/$/, '' )
}

program
  .version('0.0.1')
  .usage ('[options]')
  .option('-p, --project <path>',
          'CProject folder',
          cleanDirectoryName)
  .option('-o, --output <path>',
          'where to output results ' +
          '(directory will be created if it doesn\'t exist, defaults to CProject folder',
          cleanDirectoryName)
  .option('-c, --combine-ami <items>',
          'combine AMI results of all the papers into JSON, grouped by type.\n                           '+
          'specify types to combine, seperated by ",". Types are found in the title attribute in the root element of the results.xml file',
          getColumns,
          [])
  .option('-s, --save-seperately',
          'save paper JSON and AMI JSON seperately')
  .option('-M, --no-minify',
          'do not minify JSON output')
  .option('-v, --verbosity <level>',
          'amount of information to log ' +
          '(debug, info, log, warn, error)',
          function ( a ) { return a.toUpperCase() },
          'INFO')
  .parse(process.argv);

if ( !process.argv.slice(2).length )
  program.help();

// Set up custom.console
var custom  = {
      getErrorObject: function () { try { throw Error( '' ) } catch ( e ) { return e; } },
      v_level: {},
      console: {},
      custom: function ( name, level, colour, prefix ) {
        var name   = typeof name   === 'string' ? name   :  name  + '' ,
            level  = typeof level  === 'number' ? level  :  level * 0  ,
            colour = typeof colour === 'string'
      && String.prototype[colour.toLowerCase()] ? colour : 'white'     ;
      
        if ( name.length > 5 ) name = name.slice(0,5);
        
        this.v_level[name.toUpperCase()] = level;
        this.console[name.toLowerCase()] = function () {
          var caller_line = custom.getErrorObject().stack.split( '\n' )[ 4 ]
            , index = caller_line.indexOf( 'at ' ) + 2
            , clean = caller_line.slice( index, caller_line.length )
            , ln    = clean.replace( /^.*?(\d+):\d+\)$/, '$1' ).slice(0,4)
          
          if ( custom.v_level[ program.verbosity ] <= custom.v_level[ name.toUpperCase() ]  )
            console.log(
              ' '.repeat( 4 - ln.length ) + ln + ': ' +
              ( prefix || '[' + name.toUpperCase()[ colour ] + ' '.repeat( 5 - name.length ) ) + '] ' +
              Array.prototype.slice.call( arguments ).map( function ( v ) {
                return typeof v === 'string' ? v : JSON.stringify( v, null, 2 )
              } ).join( ' ' )
            )
        }
      },
      logs: [
        [ 'debug', 00, 'cyan'               ],
        [ 'info' , 10, 'green'              ],
        [ 'log'  , 20, 'white' , '        ' ],
        [ 'warn' , 30, 'yellow'             ],
        [ 'error', 40, 'red'                ],
      ]
    }

for ( var i = 0; i < custom.logs.length; i++ ) {
  custom.custom.apply( custom, custom.logs[ i ] );
}

// Set arguments as global variables
var project = program.project
  , output  = program.output
  , outfile = program.outfile
  , AMITypes= program.combineAmi
  , saveSeperately= program.saveSeperately
  , minify  = program.minify

custom.console.info( 'Parsing CProject in folder: ' + project )
custom.console.info( 'Result will be saved in folder: ' + output )
custom.console.info( 'AMI results of types: ' +
                      AMITypes.join( ', ' ) +
                    ' will be saved' +
                    ( saveSeperately ? ' seperately' : '' ) + '.' )

// Validate arguments
if ( !project ) {
  custom.console.error( 'You must provide a project directory' );
  process.exit( 1 ) }

if ( !fs.existsSync( project ) ) {
  custom.console.error( 'Project directory does not exist: ' + project );
  process.exit( 1 ); }

if ( !output ) {
  output = project }

// Make output directory if non-existent
if ( !fs.existsSync( output ) ) {
  custom.console.info( 'Creating output directory: ' + program.output );
  fs.mkdirSync( program.output ); }

// Initiate output data
var outputData = {
  articles: {}
}

// Get PMC* directories in project folder
var directories = fs.readdirSync( project )
                    .map( function ( v ) { return /PMC\d+/.test( v ) ? v : undefined } )
                    .removeEmptyValues()

  // Make progress bar
  , dirProgress = new progress( '      [:bar] Parsing directory :current/:total: :dir (eta :etas)', {
      complete: '='.green,
      width: 30,
      total: directories.length
    } )

// For every directory...
for ( var dirIndex = 0; dirIndex < directories.length; dirIndex++ ) {
  
  var directory = directories[ dirIndex ];
  
      // ...get JSON...
  var metadata = JSON.parse( fs.readFileSync(
        [ project, directory, 'eupmc_result.json' ].join('/'),
        'utf8' ) )
      // ...and get AMI results (XML) as JSON...
    , AMIResults = getAMIResults( directory );
  
  // ...and append to articles
  outputData.articles[ directory ] = {
    metadata: metadata,
    AMIResults: AMIResults
  }
  
  dirProgress.tick( {
    dir: directory
  } )
}


// Function to turn 'results' folder into JSON
function getAMIResults ( directory ) {
  
  // Get sequencesfiles.xml
  var data = {}
    , file = [ project, directory, 'sequencesfiles.xml' ].join('/')
  
  if ( !fs.existsSync( file ) )
    return data
  
  var doc = new xmldoc.XmlDocument( fs.readFileSync( file, 'utf8' ) )
    , files = doc.children
  
  // For every file in sequencesfiles.xml...
  for ( var fileIndex = 0; fileIndex < files.length; fileIndex++ ) {
    
    // ...get the file...
    var file = files[fileIndex]
      , fileDoc = new xmldoc.XmlDocument( fs.readFileSync(
          /^\.\//.test( file.attr.name ) ?
            [ project, file.attr.name ].join('/')
          :
            [          file.attr.name ].join('/'),
          'utf8' ) )
      , children = fileDoc.children.map( function ( v, i ) {
            return v.attr;
          } )
    
    // ...and return XML as JSON
    data[ fileDoc.attr.title ] = children
    
    // If data is of a type specified in -c flag...
    if ( AMITypes.indexOf( fileDoc.attr.title ) > -1 ) {
      
      // ...for every child...
      for ( var childIndex = 0; childIndex < children.length; childIndex++ ) {
        
        // (if this is the first time to use a type, e.g. 'genus' or 'binomial', initiate it)
        if ( !outputData.hasOwnProperty( fileDoc.attr.title ) )
          outputData[ fileDoc.attr.title ] = {}
        
        var obj   = outputData[ fileDoc.attr.title ]
          , child = children[ childIndex ]
          , prop  = child.match || child.word
        
        // (if this is the first time to append a prop to type, e.g. 'Pinus' for 'genus' or any word for 'frequencies', initiate it)
        if ( obj[ prop ] === undefined )
          obj[ prop ] = [];
        
        child.pmc = directory;
        
        // ...append to resp. arrays as well
        obj[ prop ].push( child )
        
      }
      
    }
  }
  
  return data;
}

function getJSON ( string ) {
  if ( minify )
    return JSON.stringify( string )
  else
    return JSON.stringify( string, null, 2 )
}

try {
  custom.console.info( 'Saving output...' )
  
  if ( !saveSeperately )
    fs.writeFileSync( [ output, 'data.json' ].join( '/' ), getJSON( outputData ) );
  
  else { for ( var dataIndex in outputData ) {
    fs.writeFileSync( [ output, dataIndex + '.json' ].join( '/' ), getJSON( outputData[ dataIndex ] ) )}}
  
  custom.console.info( 'Saving output succeeded!' )
} catch ( e ) {
  custom.console.error( 'Saving output failed!', e.toString() )
}