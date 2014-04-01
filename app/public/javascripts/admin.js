var Admin = function (options){

	var socket;
	var lightsocket;

	var init = function (){
		console.log("init");

		initSocket();
		initLightSocket();

		addHandlers();
	};

	var initSocket = function (){
		if(socket) return; // already initialized

		socket = io.connect(window.location.hostname);

		// some debugging statements concerning socket.io
		socket.on('reconnecting', function(seconds){
			console.log('reconnecting in ' + seconds + ' seconds');
		});
		socket.on('reconnect', function(){
			console.log('reconnected');
		});
		socket.on('reconnect_failed', function(){
			console.log('failed to reconnect');
		});
		socket.on('connect', function() {
			console.log('connected');
		});

		socket.on('somecrazyevent', onSomecrazyevent);
	};

	var initLightSocket = function (){
		if(lightsocket) return; // already initialized

		lightsocket = io.connect('http://hacklights.mixapp.be:9000');

		// some debugging statements concerning socket.io
		lightsocket.on('reconnecting', function(seconds){
			console.log('reconnecting in ' + seconds + ' seconds');
		});
		lightsocket.on('reconnect', function(){
			console.log('reconnected');
		});
		lightsocket.on('reconnect_failed', function(){
			console.log('failed to reconnect');
		});
		lightsocket.on('connect', function() {
			console.log('connected');
		});
	};

	var onSomecrazyevent = function (data) {
		console.log(data);
	};

	var addHandlers = function () {
		$('.colorbutton').click(function (event) {
			var color = $(this).css('background-color');
			color = rgb2hex(color);
			socket.emit('color',  { my: color } );

			if(lightsocket){
				var hackevent = $(this).attr('data-hackevent');
				lightsocket.emit('hackevent', hackevent);
			}

		});
	};

	var rgb2hex = function (rgb) {
	    rgb = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
	    function hex(x) {
	        return ("0" + parseInt(x).toString(16)).slice(-2);
	    }
	    return "#" + hex(rgb[1]) + hex(rgb[2]) + hex(rgb[3]);
	};

	return {
		init: init
	};
};



$(function(){
	var admin = new Admin();
	admin.init();
});

