module.exports = function(grunt) {

	var FILE_ENCODING = 'utf-8',
	    fs = require('fs'),
	    path = require('path');

	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		uglify: {
			my_target: {
		      files: {
		        "builds-temp/src/js/external/external.min.js": ["bower_components/jquery/jquery.js", "src/js/external/jquery.etc.js", "src/js/external/jquery.dataTables.js", "src/js/external/jquery.dataTables.scroller.js", "src/js/external/jquery.template.js", "src/js/external/jquery.bindable.js", "src/js/external/jquery.xml2json.js", "src/js/external/jclass.js", "bower_components/requirejs/require.js"]
		      }
		    }
		},
		copy: {
		  main: {
		    files: [
		      {expand: true, flatten: true, src: ['src/css/fonts/*'], dest: 'builds-temp/src/css/fonts/', filter: 'isFile'},
		      {expand: true, flatten: true, src: ['src/xml/*'], dest: 'builds-temp/src/xml/', filter: 'isFile'}
		     ]
		   }
		},
		requirejs: {
			compile: {
				options: {
					name: "main",
					baseUrl: "src/js",
					mainConfigFile: "require.config.js",
					out: "builds-temp/src/js/main.js"
				}
			}
		},
		less: {
		    production: {
			    options: {
			      paths: ["src/css"],
			      cleancss: true
			    },
			    files: {
			      "builds-temp/src/css/main.css": "src/css/main.less"
			    }
  			}
		}
	});

	/*var config = require('load-grunt-config')(grunt, {
        configPath: path.join(process.cwd(), 'grunt'), //path to task.js files, defaults to grunt dir
        init: false, //auto grunt.initConfig
        config: { //additional config vars
            test: false
        },
        loadGruntTasks: { //can optionally pass options to load-grunt-tasks.  If you set to false, it will disable auto loading tasks.
            pattern: 'grunt-',
            config: require('./package.json'),
            scope: 'devDependencies'
        }
    });*/

	grunt.loadNpmTasks('grunt-contrib-less');
	grunt.loadNpmTasks('grunt-contrib-requirejs');
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-clean');

	grunt.registerTask("markup", "Copy over the main html page", function() {
		var originalMarkup = fs.readFileSync("fantasydraft.html", FILE_ENCODING);
		var modifiedMarkup = "";
		var preCSS = originalMarkup.substr(0, originalMarkup.indexOf("<!-- CSS START -->"));
		var preScripts = originalMarkup.substr(originalMarkup.indexOf("<!-- CSS END -->")+16, originalMarkup.indexOf("<!-- SCRIPTS START -->") - (originalMarkup.indexOf("<!-- CSS END -->")+16));
		var postScripts = originalMarkup.substr(originalMarkup.indexOf("<!-- SCRIPTS END -->")+20);

		modifiedMarkup = preCSS;
		modifiedMarkup += '<link type="text/css" rel="stylesheet" href="src/css/main.css" />';
		modifiedMarkup += preScripts;
		modifiedMarkup += ('<script type="text/javascript" src="src/js/external/external.min.js"></script><script>'+fs.readFileSync("require.config.js", FILE_ENCODING)+"</script>");
		modifiedMarkup += postScripts;

		fs.writeFileSync("builds-temp/fantasydraft.html", modifiedMarkup, FILE_ENCODING);
	});

	grunt.registerTask("tpllib", "Create a template library file from the individual template files", function() {

		//set output path and also check for -dev param
		var outputPath = "builds-temp/src/xml/";
			if (typeof grunt.option('dev') !== 'undefined') {
				outputPath = "src/xml/";
			}

		var wrench = require('wrench'),
		    mkdirp = require('mkdirp'),
		    xml2js = require('xml2js'),
		    opts = {
		        src : "src/tpl",
		        srcTwo: "src/tpl/components",
		        includeTypes : ".tpl"
		    },
		    includeTypes = (typeof opts.includeTypes === "undefined") ? ["*"] : opts.includeTypes,
		    excludeFiles = (typeof opts.excludeFiles === "undefined") ? [] : opts.excludeFiles ,
		    numTypes = includeTypes.length,
		    numExcludes = excludeFiles.length,
		    i,
		    j,
		    type,
		    fileList = fs.readdirSync(opts.src),
		    fileListTwo = fs.readdirSync(opts.srcTwo),
		    fileHeader = '<?xml version="1.0"?>\n<tpls>',
		    fileFooter = '</tpls>',
		    resultStr = fileHeader,
		    out = fileList.map(function(filePath) {
		        for (i = 0; i < numTypes; i++) {
		            type = includeTypes[i];
		            //check that this file type is supposed to be included in the build
		            if (type === "*" || filePath.substring(filePath.length - type.length,filePath.length) === type){
		                //check that this specific file isn't excluded from the build
		                for (j = 0; j < numExcludes; j++){
		                    if (filePath.indexOf(excludeFiles[j]) != -1){
		                        return;
		                    }
		                }
		                //if we get here, it's time to read the file
		                //console.log("getting "+opts.src+"/"+filePath);

		                var retVal = '<tpl id="'+filePath+'">\n<![CDATA[\n';
		                retVal += fs.readFileSync(opts.src+"/"+filePath, FILE_ENCODING);
		                retVal +='\n]]>\n</tpl>';
		                return retVal;
		            }
		        }
		    }),
		    outTwo = fileListTwo.map(function(filePath) {
		        for (i = 0; i < numTypes; i++) {
		            type = includeTypes[i];
		            //check that this file type is supposed to be included in the build
		            if (type === "*" || filePath.substring(filePath.length - type.length,filePath.length) === type){
		                //check that this specific file isn't excluded from the build
		                for (j = 0; j < numExcludes; j++){
		                    if (filePath.indexOf(excludeFiles[j]) != -1){
		                        return;
		                    }
		                }
		                //if we get here, it's time to read the file
		                var retVal = '<tpl id="'+filePath+'">\n<![CDATA[\n';
		                retVal += fs.readFileSync(opts.srcTwo+"/"+filePath, FILE_ENCODING);
		                retVal +='\n]]>\n</tpl>';
		                return retVal;
		            }
		        }
		    });
		    //put the result string together
		    resultStr = fileHeader + out.join('\n') + outTwo.join('\n') + fileFooter;

		  //now, convert the xml structure to json using xml2js and store the output in memory
		  console.log("about to write tpl lib...");
		  //write the output files
		  var parser = new xml2js.Parser(
		        {
		            trim: true,
		            normalize: true
		        }
		      );
		    parser.parseString(resultStr, function (err, result) {
		        tplLibTempStore = JSON.stringify(result);
		        //console.dir(result);
		        console.log('Done parsing tplLib');
		    });
		  fs.writeFileSync(outputPath + "tplLib.xml", resultStr, FILE_ENCODING);
	});

	grunt.loadTasks('./node_modules/bam-grunt-tasks/tasks/common');

	//grunt.initConfig(config);

	grunt.registerTask('default', ['uglify', 'copy', 'requirejs', 'less', 'tpllib', 'markup']);
};