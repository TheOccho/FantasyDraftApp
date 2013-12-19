define("model/TemplateLibrary", function( require, exports, module ) {

	var _controller,
		_data,
		_templateHash = {},
		eventEnums = require("enums/EventEnums"),
		dataPathManager = require("data/DataPathManager");

	function loadTemplates() {
		$.ajax({
			url: dataPathManager.getDataPath("templates"),
			dataType: "xml",
			success: function(resp) {
				setData($.xml2json(resp));
				_controller.dispatchEvent(eventEnums.TEMPLATE_DATA_LOADED);
			},
			error: function(error) {
				_controller.dispatchEvent(eventEnums.TEMPLATE_DATA_ERROR, error);
			}
		});
	}

	function setData(data) {
		_data = data;
		for(var i=0,l=_data.tpl.length;i<l;i++) {
			_templateHash[_data.tpl[i].id] = _data.tpl[i].text;
		}
	}

	exports.loadTemplates = function(controller) {
		_controller = controller;
		loadTemplates();
	};

	exports.getTemplateByID = function(templateID) {
		return _templateHash[templateID];
	};
});