module.exports = function(grunt) {

	var FILE_ENCODING = 'utf-8',
	    fs = require('fs'),
	    path = require('path'),
	    version = grunt.file.readJSON('package.json').version,
		configObject = {
			pkg: grunt.file.readJSON('package.json'),
			uglify: {
				my_target: {
			      files: {}
			    }
			},
			copy: {
			  main: {
			    files: [
			      {expand: true, flatten: true, src: ['src/css/fonts/*'], dest: 'app-build/'+version+'/src/css/fonts/', filter: 'isFile'},
			      {expand: true, flatten: true, src: ['src/xml/*'], dest: 'app-build/'+version+'/src/xml/', filter: 'isFile'},
			      {expand: true, flatten: true, src: ['src/json/*'], dest: 'app-build/'+version+'/src/json/', filter: 'isFile'},
			      {expand: true, flatten: true, src: ['src/images/*'], dest: 'app-build/'+version+'/src/images/', filter: 'isFile'}
			     ]
			   }
			},
			requirejs: {
				compile: {
					options: {
						name: "main",
						baseUrl: "src/js",
						out: "app-build/"+version+"/src/js/main.js"
					}
				}
			},
			less: {
			    production: {
				    options: {
				      paths: ["src/css"],
				      cleancss: true
				    },
				    files: {}
	  			}
			}
		};
		
	//dynamically set output path for uglify and less
	configObject.uglify.my_target.files["app-build/"+version+"/src/js/external/external.min.js"] = ["src/js/external/jquery.etc.js", "src/js/external/jquery.dataTables.js", "src/js/external/jquery.dataTables.scroller.js", "src/js/external/jquery.template.js", "src/js/external/jquery.timer.js", "src/js/external/jquery.bindable.js", "src/js/external/jquery.xml2json.js", "src/js/external/jclass.js", "src/js/external/strophe.js", "src/js/external/strophe.xdomain.js", "src/js/external/strophe.muc.js"];
	configObject.less.production.files["app-build/"+version+"/src/css/main.css"] = "src/css/main.less";

	//KICK OFF!
	grunt.config.init(configObject);

	grunt.loadNpmTasks('grunt-contrib-less');
	grunt.loadNpmTasks('grunt-contrib-requirejs');
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-rsync');

	grunt.registerTask("markup", "Copy over the main html page", function() {
		var originalMarkup = fs.readFileSync("fantasydraft.html", FILE_ENCODING);
		var modifiedMarkup = "";
		var preCSS = originalMarkup.substr(0, originalMarkup.indexOf("<!-- CSS START -->"));
		var preScripts = originalMarkup.substr(originalMarkup.indexOf("<!-- CSS END -->")+16, originalMarkup.indexOf("<!-- SCRIPTS START -->") - (originalMarkup.indexOf("<!-- CSS END -->")+16));
		var postScripts = originalMarkup.substr(originalMarkup.indexOf("<!-- SCRIPTS END -->")+20);

		modifiedMarkup = preCSS;
		modifiedMarkup += '<link type="text/css" rel="stylesheet" href="/mlb/components/fantasy/fb/draft/'+version+'/src/css/main.css" />';
		modifiedMarkup += preScripts;
		modifiedMarkup += ('<script type="text/javascript" src="/mlb/components/fantasy/fb/draft/'+version+'/src/js/external/jquery-1.11.0.js"></script><script type="text/javascript" src="/mlb/components/fantasy/fb/draft/'+version+'/src/js/external/external.min.js"></script><script type="text/javascript" src="/mlb/components/fantasy/fb/draft/'+version+'/src/js/external/requirejs-2.1.9.js"></script><script>var appVersion="'+version+'";var requireBaseUrl="/mlb/components/fantasy/fb/draft/'+version+'/src/js";'+fs.readFileSync("require.config.js", FILE_ENCODING)+"</script>");
		modifiedMarkup += postScripts;

		fs.writeFileSync("app-build/fantasydraft.html", modifiedMarkup, FILE_ENCODING);
	});

	grunt.registerTask("tpllib", "Create a template library file from the individual template files", function() {

		//set output path and also check for -dev param
		var outputPath = "app-build/"+version+"/src/xml/";
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

	grunt.registerTask('default', ['uglify', 'copy', 'requirejs', 'less', 'tpllib', 'markup']);
};