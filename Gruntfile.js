module.exports = function(grunt) {

	var FILE_ENCODING = 'utf-8',
	    fs = require('fs');

	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		uglify: {
			my_target: {
		      files: {
		        "bin/release/src/js/external/external.min.js": ["bower_components/jquery/jquery.js", "src/js/external/jquery.etc.js", "src/js/external/jquery.dataTables.js", "src/js/external/jquery.dataTables.scroller.js", "src/js/external/jquery.template.js", "src/js/external/jquery.bindable.js", "src/js/external/jquery.xml2json.js", "src/js/external/jclass.js", "bower_components/requirejs/require.js"]
		      }
		    }
		},
		copy: {
		  main: {
		    files: [
		      {expand: true, flatten: true, src: ['src/css/fonts/*'], dest: 'bin/release/src/css/fonts/', filter: 'isFile'},
		      {expand: true, flatten: true, src: ['src/xml/*'], dest: 'bin/release/src/xml/', filter: 'isFile'}
		     ]
		   }
		},
		requirejs: {
			compile: {
				options: {
					name: "main",
					baseUrl: "src/js",
					mainConfigFile: "require.config.js",
					out: "bin/release/src/js/main.js"
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
			      "bin/release/src/css/main.css": "src/css/main.less"
			    }
  			}
		}
	});

	grunt.loadNpmTasks('grunt-contrib-less');
	grunt.loadNpmTasks('grunt-contrib-requirejs');
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	//grunt.loadNpmTasks('grunt-contrib-jshint');
	//grunt.loadNpmTasks('grunt-contrib-watch');
	//grunt.loadNpmTasks('grunt-contrib-concat');

	grunt.registerTask("tpllib", "Create a template library file from the individual template files", function() {

		//set output path and also check for -dev param
		var outputPath = "bin/release/src/xml/";
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
		                //console.log("getting "+opts.src+"/"+filePath);

		                var retVal = '<tpl id="'+filePath+'">\n<![CDATA[\n';
		                retVal += fs.readFileSync(opts.srcTwo+"/"+filePath, FILE_ENCODING);
		                retVal +='\n]]>\n</tpl>';
		                return retVal;
		            }
		        }
		    });
		    //put the result string together
		    resultStr = fileHeader + out.join('\n') + outTwo.join('\n') + fileFooter;

		  if (!fs.existsSync(outputPath)) {
		      mkdirp(outputPath, function (err) {
		        if (err) console.error(err);
		      });
		  }

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

	grunt.registerTask('default', ['uglify', 'copy', 'requirejs', 'less', 'tpllib']);
};