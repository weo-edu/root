
IFrame.prototype.subapp_prefix = __meteor_runtime_config__.METEOR_SUBAPP_PREFIX;
IFrame.prototype.iframe_prefix = 'iframe-';

function IFrame(app){
	var self = this,
		frame = create(500, 500),
		frame_window = $(frame)[0].document || $(frame)[0].contentWindow;

	
	function create(width, height ){
		var frame = $('<iframe width="' + width + '" height="' + height + '" src="' + getAppUrl(app) + '"></iframe>');
		$('body').append(frame);
		return frame;
	}

	function getAppUrl(){
		return '/' + self.subapp_prefix + self.iframe_prefix + app;
	}

	function destroy(){
		if(typeof frame_window.destroy === 'function'){
			frame_window.destroy();
		}

		$(frame).remove();
	}

	return {
		destroy: destroy
	};
}