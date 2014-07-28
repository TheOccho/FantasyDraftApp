define("view/preloader/AppPreloader", function(require, exports, module) {

	var dataPathManager = require("data/DataPathManager");

	var _components = [],
		_index = 0,
		_numloaded = 0,
		_preloaded = false,
		_percentage = 0,
		_diff = 0,
		_overlay,_percentText,_progressBar,
		_bgLoadedCallback;
	
	function _createPreloader(){
		_overlay = $("<div id='appPreloaderContainer'></div>").css({
            width: 1044,
            height: 788,
            position: "absolute",
            zIndex: 999,
            top: 0,
            left: 0
        }).insertBefore("#fantasyDraft");

        $('<img/>').attr('src', dataPathManager.getImagePath("2014draft_curtain.png")).load(function() {
		   $(this).remove();
		   $('#appPreloaderContainer').css('background-image', 'url('+dataPathManager.getImagePath("2014draft_curtain.png")+')');

		   _percenText = $("<div id='appPreloaderPercentage'></div>").text("0%").css({
	            height: "40px",
	            width: "100px",
	            position: "absolute",
	            fontSize: "15px",
	            fontFamily: 'Arial, Helvetica, Sans-serif',
	            top: "53%",
	            left: "50%",
	            textAlign: "center",
	            marginLeft: "-50px",
	            color: '#999',
	        }).appendTo(_overlay);
	        
	        _progressBar = $("<div id='appPreloaderBar'></div>").css({
		        position: "absolute",
		        height: "20px",
		        width: "200px",
		        backgroundColor: '#ccc',
		        top: "57%",
		        left: "50%",
		        marginLeft : "-100px"
	        }).appendTo( _overlay );
	        
	        _progressIndicator = $("<div id='appPreloaderIndicator'></div>").css({
		        position: "absolute",
		        height: "20px",
		        width: "10px",
		        backgroundColor: '#990000',
		        top: "0",
		        left: "0",
	        }).appendTo( _progressBar );

	        _bgLoadedCallback();
		});
	}
	
	function _removePreloader(){
		_overlay.fadeOut(1000, function () {
			$(this).remove();
		});
	}

	exports.init = function(bgLoadedCallback) {
		_bgLoadedCallback = bgLoadedCallback;
		_createPreloader();
	};

	exports.add = function( num ) {
		_index += num;
	};
	
	exports.slowRemove = function( num, milliseconds ) {
		var loadCount = num, loadIndex = 0;
		var loadTimeout = function(){
			if( loadIndex < loadCount ) {
				exports.remove( 1 );
				loadIndex++;
				setTimeout(loadTimeout, milliseconds );
			}else {
				//done with dependency fake preloading
			}
		}
		setTimeout(loadTimeout, milliseconds );
	};

	exports.remove = function( num ) {
		_diff = 100 / _index;
		var barDiff = _progressBar.width() / _index;
		_numloaded += num;
		_percentage = Math.round( _numloaded * _diff );
		var barWidth = Math.round( _numloaded * barDiff )
		
		_percenText.text(_percentage + "%");
		_progressIndicator.animate({width:barWidth}, function() {
			if( _numloaded == _index && !_preloaded) {
				exports.complete();
			}
		});
	};

	exports.complete = function() {
		_preloaded = true;
		_removePreloader();
	};
	
});