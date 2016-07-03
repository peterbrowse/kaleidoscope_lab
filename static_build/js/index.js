var DragDrop,
	Kaleidoscope,
	c,
	dragger,
	gui,
	i,
	image,
	kaleidoscope,
	len,
	onChange,
	onMouseMoved,
	options,
	ref,
	tr,
	tx,
	ty,
	update,
	hand_position = false,
	idleTime = 0,
	fakeMouseMove,
	bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
	
//Settings

	//General
	var debug_on = true;
	
	//Time Out Settings
	var idle_timeout = 2000; //2 seconds (in ms)
	var idle_tick = 100; //Move kaleidoscope every tick of timeout timer
	var idle_step_size = 0.5; //Pixels moved every tick
	
	//Leap Motion Settings
	var in_out_zoom = false;
	
	//Images	
	var images = [
		'art/billy.png',
		'art/ben.png',
		'art/jim.png',
		'art/kanye.png',
		'art/tyrese.png',
		'art/stain.png',
		'art/1.jpg',
		'art/2.jpg',
		'art/3.jpg',
		'art/4.jpg'
	];

$(document).ready(function() {
	
	var idleInterval = setInterval(timerIncrement, idle_timeout); // 2 Seconds
	
	$(window).keypress(function(e) {
	
		if(e.which === 102) {
			
			var element = document.getElementById("kaleidoscope");
			if (element.requestFullScreen) {
		        element.requestFullScreen();
		    }
		    if (element.webkitRequestFullScreen) {
		        element.webkitRequestFullScreen();
		    }
		    if (element.mozRequestFullScreen) {
		        element.mozRequestFullScreen();
		    }
		}
	});
	
	DragDrop = (function() {
	    function DragDrop(callback, context, filter) {
	      var disable;
	      this.callback = callback;
	      this.context = context != null ? context : document;
	      this.filter = filter != null ? filter : /^image/i;
	      this.onDrop = bind(this.onDrop, this);
	      disable = function(event) {
	        event.stopPropagation();
	        return event.preventDefault();
	      };
	      this.context.addEventListener('dragleave', disable);
	      this.context.addEventListener('dragenter', disable);
	      this.context.addEventListener('dragover', disable);
	      this.context.addEventListener('drop', this.onDrop, false);
	    }
	
	    DragDrop.prototype.onDrop = function(event) {
	      var file, reader;
	      event.stopPropagation();
	      event.preventDefault();
	      file = event.dataTransfer.files[0];
	      if (this.filter.test(file.type)) {
	        reader = new FileReader;
	        reader.onload = (function(_this) {
	          return function(event) {
	            return typeof _this.callback === "function" ? _this.callback(event.target.result) : void 0;
	          };
	        })(this);
	        return reader.readAsDataURL(file);
	      }
	    };
	
	    return DragDrop;
	
	})();
	
	image = new Image;
	
	image.onload = (function(_this) {
	    return function() {
	    	return kaleidoscope.draw();
	    };
	})(this);
	
	image.src = images[Math.floor(Math.random()*images.length)];
	
	kaleidoscope = new Kaleidoscope({
		image: image,
		slices: 20
	});
	
	kaleidoscope.domElement.style.position = 'absolute';
	
	kaleidoscope.domElement.style.marginLeft = -kaleidoscope.radius + 'px';
	
	kaleidoscope.domElement.style.marginTop = -kaleidoscope.radius + 'px';
	
	kaleidoscope.domElement.style.left = '50%';
	
	kaleidoscope.domElement.style.top = '50%';
	
	document.body.appendChild(kaleidoscope.domElement);
	
	dragger = new DragDrop(function(data) {
		return kaleidoscope.image.src = data;
	});
	
	tx = kaleidoscope.offsetX;
	
	ty = kaleidoscope.offsetY;
	
	tr = kaleidoscope.offsetRotation;
	
	onMouseMoved = (function(_this) {
		return function(event) {
			pause_move();
			
			var cx, cy, dx, dy, hx, hy;
			cx = window.innerWidth / 2;
			cy = window.innerHeight / 2;
			dx = event.pageX / window.innerWidth;
			dy = event.pageY / window.innerHeight;
			hx = dx - 0.5;
			hy = dy - 0.5;
			tx = hx * kaleidoscope.radius * -2;
			ty = hy * kaleidoscope.radius * 2;
			return tr = Math.atan2(hy, hx);
		};
	})(this);
	
	window.addEventListener('mousemove', onMouseMoved, false);
	
	options = {
		interactive: true,
		ease: 0.2
	};
	
	(update = (function(_this) {
		return function() {
			var delta, theta;
			if (options.interactive) {
				delta = tr - kaleidoscope.offsetRotation;
				theta = Math.atan2(Math.sin(delta), Math.cos(delta));
				kaleidoscope.offsetX += (tx - kaleidoscope.offsetX) * options.ease;
				kaleidoscope.offsetY += (ty - kaleidoscope.offsetY) * options.ease;
				kaleidoscope.offsetRotation += (theta - kaleidoscope.offsetRotation) * options.ease;
				kaleidoscope.draw();
			}
			return setTimeout(update, 1000 / 60);
		};
	})(this))();
	
	gui = new dat.GUI;
	
	gui.add(kaleidoscope, 'zoom').min(0.25).max(2.0);
	
	gui.add(kaleidoscope, 'slices').min(6).max(32).step(2);
	
	gui.add(kaleidoscope, 'radius').min(200).max(1000);
	
	gui.add(kaleidoscope, 'offsetX').min(-kaleidoscope.radius).max(kaleidoscope.radius).listen();
	
	gui.add(kaleidoscope, 'offsetY').min(-kaleidoscope.radius).max(kaleidoscope.radius).listen();
	
	gui.add(kaleidoscope, 'offsetRotation').min(-Math.PI).max(Math.PI).listen();
	
	gui.add(kaleidoscope, 'offsetScale').min(0.5).max(4.0);
	
	gui.add(options, 'interactive').listen();
	
	gui.close();
	
	onChange = (function(_this) {
		return function() {
			kaleidoscope.domElement.style.marginLeft = -kaleidoscope.radius + 'px';
			kaleidoscope.domElement.style.marginTop = -kaleidoscope.radius + 'px';
			options.interactive = true;
			return kaleidoscope.draw();
		};
	})(this);
	
	$('body').on('click', function() {
		change_image();
	});
	
	Leap.loop({

		hand: function(hand){
			pause_move();
			
			var cx, cy, dx, dy, hx, hy;
			cx = window.innerWidth / 2;
			cy = window.innerHeight / 2;
			dx = hand.screenPosition()[0] / window.innerWidth;
			dy = hand.screenPosition()[2] / window.innerHeight;
			hx = dx - 0.5;
			hy = dy - 0.5;
			tx = hx * kaleidoscope.radius * -2;
			ty = hy * kaleidoscope.radius * 2;
			tr = Math.atan2(hy, hx);
			
			if(in_out_zoom)
				kaleidoscope.radius = Math.min(Math.max(parseInt(hand.screenPosition()[1]+600), 200), 3000);
			
			if(hand.grabStrength == 1 && !hand_position) {
				hand_position = true;
				if(debug_on)
					console.log("Hand Closed");
				change_image();
			} else if (hand.grabStrength == 0 && hand_position) {
				hand_position = false;
				if(debug_on)
					console.log("Hand Opened");
			} 
			
			kaleidoscope.domElement.style.marginLeft = -kaleidoscope.radius + 'px';
			kaleidoscope.domElement.style.marginTop = -kaleidoscope.radius + 'px';
			options.interactive = true;
			kaleidoscope.draw();
		}
		
	}).use('screenPosition');
	
	ref = gui.__controllers;
	for (i = 0, len = ref.length; i < len; i++) {
		c = ref[i];
		if (c.property !== 'interactive') {
			c.onChange(onChange);
		}
	}
	
	function change_image() {
		if(debug_on)
			console.log('New Image Loaded');
			
		image = new Image;
	
		image.onload = (function(_this) {
	    	return function() {
	    		return kaleidoscope.draw();
	    	};
		})(this);
	
		image.src = images[Math.floor(Math.random()*images.length)];
		
		kaleidoscope.image = image;
	};
});

Kaleidoscope = (function() {
    Kaleidoscope.prototype.HALF_PI = Math.PI / 2;

    Kaleidoscope.prototype.TWO_PI = Math.PI * 2;

    function Kaleidoscope(options1) {
		var key, ref, ref1, val;
		this.options = options1 != null ? options1 : {};
		
		this.defaults = {
			offsetRotation: 0.0,
			offsetScale: 1.0,
			offsetX: 0.0,
			offsetY: 0.0,
			radius: 700,
			slices: 4,
			zoom: 1.0
		};
		
		ref = this.defaults;
		
		for (key in ref) {
			val = ref[key];
			this[key] = val;
		}
		ref1 = this.options;
		for (key in ref1) {
			val = ref1[key];
			this[key] = val;
		}
		if (this.domElement == null) {
			this.domElement = document.createElement('canvas');
			this.domElement.setAttribute("id", "kaleidoscope");
		}
		if (this.context == null) {
			this.context = this.domElement.getContext('2d');
		}
		if (this.image == null) {
			this.image = document.createElement('img');
		}
    }

    Kaleidoscope.prototype.draw = function() {
		var cx, i, index, ref, results, scale, step;
		this.domElement.width = this.domElement.height = this.radius * 2;
		this.context.fillStyle = this.context.createPattern(this.image, 'repeat');
		scale = this.zoom * (this.radius / Math.min(this.image.width, this.image.height));
		step = this.TWO_PI / this.slices;
		cx = this.image.width / 2;
		results = [];
		for (index = i = 0, ref = this.slices; 0 <= ref ? i <= ref : i >= ref; index = 0 <= ref ? ++i : --i) {
			this.context.save();
			this.context.translate(this.radius, this.radius);
			this.context.rotate(index * step);
			this.context.beginPath();
			this.context.moveTo(-0.5, -0.5);
			this.context.arc(0, 0, this.radius, step * -0.51, step * 0.51);
			this.context.lineTo(0.5, 0.5);
			this.context.closePath();
			this.context.rotate(this.HALF_PI);
			this.context.scale(scale, scale);
			this.context.scale([-1, 1][index % 2], 1);
			this.context.translate(this.offsetX - cx, this.offsetY);
			this.context.rotate(this.offsetRotation);
			this.context.scale(this.offsetScale, this.offsetScale);
			this.context.fill();
			results.push(this.context.restore());
		}
		return results;
    };

    return Kaleidoscope;
})();

function timerIncrement() {
    idleTime = idleTime + 1;
    if (idleTime > 1 && idleTime < 3) {
	    if(debug_on)
        	console.log("No movement detected, starting idle timer");
        
        var step = 0;
        
        fakeMouseMove = setInterval(function() {
	        var cx, cy, dx, dy, hx, hy;
			cx = window.innerWidth / 2;
			cy = window.innerHeight / 2;
			dx = step += idle_step_size / window.innerWidth;
			dy = step += idle_step_size / window.innerHeight;
			hx = dx - 0.5;
			hy = dy - 0.5;
			tx = hx * kaleidoscope.radius * -2;
			ty = hy * kaleidoscope.radius * 2;
			tr = Math.atan2(hy, hx);
			
			kaleidoscope.domElement.style.marginLeft = -kaleidoscope.radius + 'px';
			kaleidoscope.domElement.style.marginTop = -kaleidoscope.radius + 'px';
			options.interactive = true;
			kaleidoscope.draw();
	    }, idle_tick);
    }
}

function pause_move() {
	idleTime = 0;
	clearInterval(fakeMouseMove);
}