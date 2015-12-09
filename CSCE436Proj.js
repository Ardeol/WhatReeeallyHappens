(function (console) { "use strict";
function $extend(from, fields) {
	function Inherit() {} Inherit.prototype = from; var proto = new Inherit();
	for (var name in fields) proto[name] = fields[name];
	if( fields.toString !== Object.prototype.toString ) proto.toString = fields.toString;
	return proto;
}
var Assets = function() { };
Assets.__name__ = true;
Assets.getAssertUrl = function(name) {
	return "" + "assets" + "/" + name + ".json";
};
Assets.getLevelUrl = function(level) {
	var s;
	if(level == null) s = "null"; else s = "" + level;
	return "" + "assets" + "/levels/" + s + ".json";
};
Assets.getSpriteURL = function(sprite) {
	return "" + "assets" + "/sprites/" + sprite;
};
Assets.getTexture = function(url) {
	return PIXI.Texture.fromImage("" + "assets" + "/sprites/" + url);
};
Assets.getTextures = function(urls) {
	return urls.map(Assets.getTexture);
};
Assets.getClip = function(urls) {
	return new PIXI.extras.MovieClip(urls.map(Assets.getTexture));
};
var AudioManager = function() { };
AudioManager.__name__ = true;
AudioManager.init = function() {
	if(!AudioManager.initialized) {
		AudioManager.initialized = true;
		AudioManager.sounds = new haxe_ds_StringMap();
		AudioManager.initSound("audio-menu");
		AudioManager.initSound("audio-level");
		AudioManager.initSound("audio-credits");
		AudioManager.initSound("audio-door");
		AudioManager.initSound("audio-drop");
		AudioManager.initSound("audio-santa");
		AudioManager.initSound("audio-win");
	}
};
AudioManager.play = function(sound) {
	AudioManager.sounds.get(sound).loop = false;
	AudioManager.sounds.get(sound).load();
	AudioManager.sounds.get(sound).play();
};
AudioManager.loop = function(sound) {
	AudioManager.sounds.get(sound).loop = true;
	AudioManager.sounds.get(sound).play();
};
AudioManager.stop = function(sound) {
	AudioManager.sounds.get(sound).pause();
};
AudioManager.stopAll = function() {
	var $it0 = AudioManager.sounds.iterator();
	while( $it0.hasNext() ) {
		var sound = $it0.next();
		sound.pause();
	}
};
AudioManager.initSound = function(sound) {
	var v;
	v = js_Boot.__cast(window.document.getElementById(sound) , HTMLAudioElement);
	AudioManager.sounds.set(sound,v);
	v;
};
var Bag = function(numPresents,baseX,baseY) {
	PIXI.Sprite.call(this,PIXI.Texture.fromImage("" + "assets" + "/sprites/" + "presentBagRedSmall.png"));
	this.dragging = false;
	this.basePos = new PIXI.Point(baseX,baseY);
	this.posBeforeDrag = new PIXI.Point(0,0);
	this.position.set(baseX,baseY);
	ExtEventEmitter.onMove(this,$bind(this,this.doDrag));
	this.capacity = numPresents;
	this.presents = new TypedSpriteGroup();
	var _g = 0;
	while(_g < numPresents) {
		var i1 = _g++;
		this.presents.add(new Present());
	}
	var i = 0;
	var $it0 = this.presents.iterator();
	while( $it0.hasNext() ) {
		var present = $it0.next();
		present.position.set(15 * Math.cos(2 * i * Math.PI / this.presents.children.length),15 * Math.sin(2 * i * Math.PI / this.presents.children.length));
		++i;
	}
	this.addChild(this.presents);
	if(this.texture.baseTexture.hasLoaded) this.center(); else this.texture.baseTexture.once("loaded",$bind(this,this.center));
};
Bag.__name__ = true;
Bag.__super__ = PIXI.Sprite;
Bag.prototype = $extend(PIXI.Sprite.prototype,{
	activate: function() {
		this.interactive = true;
	}
	,deactivate: function() {
		this.interactive = false;
	}
	,startDrag: function() {
		this.dragging = true;
		this.posBeforeDrag.set(this.x,this.y);
	}
	,stopDrag: function() {
		this.dragging = false;
	}
	,undoDrag: function() {
		this.position.set(this.posBeforeDrag.x,this.posBeforeDrag.y);
	}
	,returnToToolbox: function() {
		this.position.set(this.basePos.x,this.basePos.y);
		this.resetVisibility();
		if(this.currentJunction != null) {
			this.currentJunction.removeBag();
			this.currentJunction = null;
		}
	}
	,apply: function(network) {
		var p = this.getGlobalPosition(null);
		var junc = network.junctionAt(new PIXI.Point(p.x,p.y));
		if(junc != null) {
			if(!this.addToJunction(junc)) this.undoDrag();
		} else this.returnToToolbox();
	}
	,addToJunction: function(junction) {
		if(junction != this.currentJunction && junction.canAttachBag(this)) {
			junction.attachBag(this);
			this.currentJunction = junction;
			this.openOntoJunction();
			return true;
		}
		return false;
	}
	,doDrag: function(e) {
		if(this.dragging) {
			var newPosition = e.data.getLocalPosition(this.parent);
			this.position.set(newPosition.x,newPosition.y);
		}
	}
	,center: function(e) {
		this.pivot.set(this.texture.width / 2,this.texture.height / 2);
		this.presents.position.set(this.texture.width / 2,this.texture.height / 2 + 5);
	}
	,openOntoJunction: function() {
		this.alpha = 0.5;
		this.presents.visible = false;
		var gp = this.getGlobalPosition(null);
		var offset = new PIXI.Point(gp.x - this.x + this.currentJunction.pivot.x,gp.y - this.y - this.currentJunction.pivot.y);
		this.position.set(this.currentJunction.x - offset.x,this.currentJunction.y - offset.y);
	}
	,resetVisibility: function() {
		this.alpha = 1;
		this.presents.visible = true;
	}
	,__class__: Bag
});
var Debug = function() { };
Debug.__name__ = true;
Debug.log = function(obj) {
	var msg = Std.string(obj);
	var div = window.document.getElementById("debug");
	if(div == null) {
		var _this = window.document;
		div = _this.createElement("div");
		div.id = "debug";
		div.style.position = "absolute";
		div.style.top = "800px";
		div.style.width = "100%";
		div.style.minHeight = "500px";
		div.style.maxHeight = "500px";
		div.style.overflow = "scroll";
		window.document.body.appendChild(div);
	}
	div.innerHTML = "<p>" + msg + "</p>" + div.innerHTML;
	Debug.history.push(msg);
};
Debug.alert = function(obj) {
	js_Browser.alert(Std.string(obj));
};
var Dim = function() { };
Dim.__name__ = true;
var _$Error_Error_$Impl_$ = {};
_$Error_Error_$Impl_$.__name__ = true;
_$Error_Error_$Impl_$._new = function(msg,cls,method) {
	if(method == null) method = "";
	if(cls == null) cls = "";
	var this1;
	this1 = "ERROR";
	if(cls.length + method.length > 0) {
		this1 += " in";
		if(cls.length > 0) this1 += " " + cls;
		if(method.length > 0) this1 += " " + method;
	}
	this1 += ": " + msg;
	return this1;
};
_$Error_Error_$Impl_$.report = function(err) {
	js_Browser.alert(Std.string(err));
};
var ExtEventEmitter = function() { };
ExtEventEmitter.__name__ = true;
ExtEventEmitter.onClick = function(s,cb) {
	s.on("mousedown",cb);
	s.on("touchstart",cb);
};
ExtEventEmitter.onMove = function(s,cb) {
	s.on("mousemove",cb);
	s.on("touchmove",cb);
};
ExtEventEmitter.onReleaseInside = function(s,cb) {
	s.on("mouseup",cb);
	s.on("touchend",cb);
};
ExtEventEmitter.onReleaseOutside = function(s,cb) {
	s.on("mouseupoutside",cb);
	s.on("touchendoutside",cb);
};
ExtEventEmitter.onRelease = function(s,cb) {
	s.on("mouseup",cb);
	s.on("touchend",cb);
	s.on("mouseupoutside",cb);
	s.on("touchendoutside",cb);
};
ExtEventEmitter.onOver = function(s,cb) {
	s.on("mouseover",cb);
};
ExtEventEmitter.onOut = function(s,cb) {
	s.on("mouseout",cb);
	s.on("touchout",cb);
};
ExtEventEmitter.onReleaseOrOut = function(s,cb) {
	s.on("mouseup",cb);
	s.on("touchend",cb);
	s.on("mouseupoutside",cb);
	s.on("touchendoutside",cb);
	s.on("mouseout",cb);
	s.on("touchout",cb);
};
var Game = function() {
	PIXI.Container.call(this);
	this.paused = false;
	if(Game.instance == null) Game.instance = this; else throw new js__$Boot_HaxeError((function($this) {
		var $r;
		var this1;
		this1 = "ERROR";
		if("Game".length + "constructor".length > 0) {
			this1 += " in";
			if("Game".length > 0) this1 += " " + "Game";
			if("constructor".length > 0) this1 += " " + "constructor";
		}
		this1 += ": " + "Game instance already exists";
		$r = this1;
		return $r;
	}(this)));
	this.level = 1;
	this.startState = new states_StartState();
	this.selectState = new states_LevelSelectState();
	this.state = this.startState;
	this.addChild(this.state);
};
Game.__name__ = true;
Game.getStoredLevel = function() {
	if(Game.storage == null) Game.storage = js_Browser.getLocalStorage();
	var item = Game.storage.getItem("StoredLevel");
	if(item == null) {
		Game.setStoredLevel(1);
		return 1;
	} else return Std.parseInt(item);
};
Game.setStoredLevel = function(lv) {
	if(Game.storage == null) Game.storage = js_Browser.getLocalStorage();
	Game.storage.setItem("StoredLevel",lv == null?"null":"" + lv);
};
Game.clearStoredLevel = function() {
	if(Game.storage == null) Game.storage = js_Browser.getLocalStorage();
	Game.storage.clear();
};
Game.verifyStorage = function() {
	if(Game.storage == null) Game.storage = js_Browser.getLocalStorage();
};
Game.__super__ = PIXI.Container;
Game.prototype = $extend(PIXI.Container.prototype,{
	update: function(elapsedTime) {
		if(!this.paused) this.state.update();
	}
	,switchState: function(newState) {
		if(this.state != this.startState && this.state != this.selectState) this.state.resetState();
		this.removeChild(this.state);
		this.state = newState;
		this.addChild(this.state);
	}
	,getLevel: function() {
		return this.level;
	}
	,incrementLevel: function() {
		this.level++;
	}
	,__class__: Game
});
var GameState = function() {
	PIXI.Container.call(this);
};
GameState.__name__ = true;
GameState.toLevel = function(level) {
	var loader = new PIXI.loaders.Loader();
	loader.add("network",Assets.getLevelUrl(level),null,function(resource) {
		Debug.log("Loading succeeded");
		GameState.to(new states_LevelState(level,resource.data));
	});
	loader.load();
};
GameState.to = function(state) {
	Game.instance.switchState(state);
};
GameState.makeButton = function(texture,trans) {
	var b = new PIXI.Sprite(PIXI.Texture.fromImage("" + "assets" + "/sprites/" + texture));
	b.interactive = true;
	b.on("mousedown",function(e) {
		trans();
	});
	b.on("touchstart",function(e) {
		trans();
	});
	return b;
};
GameState.makeFancyButton = function(texture,textureOn,trans) {
	var b = new TwoStateSprite(PIXI.Texture.fromImage("" + "assets" + "/sprites/" + texture),PIXI.Texture.fromImage("" + "assets" + "/sprites/" + textureOn));
	b.interactive = true;
	b.defaultTextureChanges();
	b.on("mouseup",function(e) {
		if(b.clicked) {
			b.setOff();
			trans();
		}
	});
	b.on("touchend",function(e) {
		if(b.clicked) {
			b.setOff();
			trans();
		}
	});
	return b;
};
GameState.__super__ = PIXI.Container;
GameState.prototype = $extend(PIXI.Container.prototype,{
	update: function() {
	}
	,resetState: function() {
		this.destroy();
	}
	,__class__: GameState
});
var HxOverrides = function() { };
HxOverrides.__name__ = true;
HxOverrides.cca = function(s,index) {
	var x = s.charCodeAt(index);
	if(x != x) return undefined;
	return x;
};
HxOverrides.iter = function(a) {
	return { cur : 0, arr : a, hasNext : function() {
		return this.cur < this.arr.length;
	}, next : function() {
		return this.arr[this.cur++];
	}};
};
var Junction = function(textures) {
	PIXI.extras.MovieClip.call(this,textures);
	this.inPipes = [];
	this.outPipes = [];
	this.presents = [];
	this.presentsAtStart = [];
	if(this.texture.baseTexture.hasLoaded) this.center(); else this.texture.baseTexture.once("loaded",$bind(this,this.center));
};
Junction.__name__ = true;
Junction.fromJson = function(data) {
	var junction;
	var type = data.type;
	if(type == "standard") junction = new junctions_StandardJunction(data.value); else if(type == "goal") junction = new junctions_GoalJunction(data.goal); else throw new js__$Boot_HaxeError((function($this) {
		var $r;
		var this1;
		this1 = "ERROR";
		if("Junction".length + "fromJson".length > 0) {
			this1 += " in";
			if("Junction".length > 0) this1 += " " + "Junction";
			if("fromJson".length > 0) this1 += " " + "fromJson";
		}
		this1 += ": " + ("Invalid junction type <" + type + "> detected");
		$r = this1;
		return $r;
	}(this)));
	junction.position.set(data.x,data.y);
	if(junction.texture.baseTexture.hasLoaded) junction.positionPresents(); else junction.texture.baseTexture.on("loaded",function(e) {
		junction.positionPresents();
	});
	return junction;
};
Junction.__super__ = PIXI.extras.MovieClip;
Junction.prototype = $extend(PIXI.extras.MovieClip.prototype,{
	preflow: function() {
	}
	,predispatch: function() {
	}
	,dispatch: function() {
	}
	,receive: function() {
	}
	,postreceive: function() {
	}
	,postflow: function() {
	}
	,satisfied: function() {
		return true;
	}
	,reset: function() {
	}
	,canAttachBag: function(b) {
		return false;
	}
	,attachBag: function(b) {
	}
	,removeBag: function() {
		return null;
	}
	,positionPresents: function(tween) {
		if(tween == null) tween = false;
		var i = 0;
		var dur;
		if(tween) dur = 10; else dur = 0;
		var _g = 0;
		var _g1 = this.presents;
		while(_g < _g1.length) {
			var present = _g1[_g];
			++_g;
			present.moveTo(new PIXI.Point(this.x + 20 * Math.cos(2 * i * Math.PI / this.presents.length),this.y + 20 * Math.sin(2 * i * Math.PI / this.presents.length)),dur);
			++i;
		}
	}
	,addPresentsToGroup: function(group) {
		var _g = 0;
		var _g1 = this.presents;
		while(_g < _g1.length) {
			var present = _g1[_g];
			++_g;
			group.addChild(present);
		}
	}
	,connectTo: function(dest,pipeType,args) {
		var pipeArgs = [this,dest];
		if(args != null) pipeArgs = pipeArgs.concat(args);
		var pipe = Type.createInstance(pipeType,pipeArgs);
		this.outPipes.push(pipe);
		dest.inPipes.push(pipe);
		return pipe;
	}
	,get_value: function() {
		return this.presents.length;
	}
	,center: function(e) {
		this.pivot.set(this.texture.width / 2,this.texture.height / 2);
	}
	,refillPresents: function() {
		if(this.presents.length > 0) throw new js__$Boot_HaxeError((function($this) {
			var $r;
			var this1;
			this1 = "ERROR";
			if("Junction".length + "refillPresents".length > 0) {
				this1 += " in";
				if("Junction".length > 0) this1 += " " + "Junction";
				if("refillPresents".length > 0) this1 += " " + "refillPresents";
			}
			this1 += ": " + "Presents vector is non-empty";
			$r = this1;
			return $r;
		}(this)));
		var _g = 0;
		var _g1 = this.presentsAtStart;
		while(_g < _g1.length) {
			var p = _g1[_g];
			++_g;
			this.presents.push(p);
		}
	}
	,swapBagsWith: function(other) {
		var toThis = other.removeBag();
		var toOther = this.removeBag();
		toThis.returnToToolbox();
		toOther.returnToToolbox();
		toOther.addToJunction(other);
		toThis.addToJunction(this);
	}
	,__class__: Junction
});
var Lambda = function() { };
Lambda.__name__ = true;
Lambda.filter = function(it,f) {
	var l = new List();
	var $it0 = $iterator(it)();
	while( $it0.hasNext() ) {
		var x = $it0.next();
		if(f(x)) l.add(x);
	}
	return l;
};
Lambda.fold = function(it,f,first) {
	var $it0 = $iterator(it)();
	while( $it0.hasNext() ) {
		var x = $it0.next();
		first = f(x,first);
	}
	return first;
};
var LevelSprite = function(num,sprite) {
	var _g = this;
	PIXI.Sprite.call(this,PIXI.Texture.fromImage("" + "assets" + "/sprites/" + sprite));
	this.number = num;
	this.interactive = true;
	this.on("mousedown",function(e) {
		GameState.toLevel(_g.number);
	});
	this.on("touchstart",function(e) {
		GameState.toLevel(_g.number);
	});
	if(this.texture.baseTexture.hasLoaded) this.center(); else this.texture.baseTexture.on("loaded",$bind(this,this.center));
};
LevelSprite.__name__ = true;
LevelSprite.__super__ = PIXI.Sprite;
LevelSprite.prototype = $extend(PIXI.Sprite.prototype,{
	destroy: function() {
		this.parent.removeChild(this);
	}
	,num: function() {
		return this.number;
	}
	,center: function() {
		this.pivot.set(this.texture.width / 2,this.texture.height / 2);
	}
	,__class__: LevelSprite
});
var List = function() {
	this.length = 0;
};
List.__name__ = true;
List.prototype = {
	add: function(item) {
		var x = [item];
		if(this.h == null) this.h = x; else this.q[1] = x;
		this.q = x;
		this.length++;
	}
	,__class__: List
};
var pixi_plugins_app_Application = function() {
	this._lastTime = new Date();
	this.pixelRatio = 1;
	this.set_skipFrame(false);
	this.autoResize = true;
	this.transparent = false;
	this.antialias = false;
	this.forceFXAA = false;
	this.roundPixels = false;
	this.backgroundColor = 16777215;
	this.width = window.innerWidth;
	this.height = window.innerHeight;
	this.set_fps(60);
};
pixi_plugins_app_Application.__name__ = true;
pixi_plugins_app_Application.prototype = {
	set_fps: function(val) {
		this._frameCount = 0;
		return val >= 1 && val < 60?this.fps = val | 0:this.fps = 60;
	}
	,set_skipFrame: function(val) {
		if(val) {
			console.log("pixi.plugins.app.Application > Deprecated: skipFrame - use fps property and set it to 30 instead");
			this.set_fps(30);
		}
		return this.skipFrame = val;
	}
	,_setDefaultValues: function() {
		this.pixelRatio = 1;
		this.set_skipFrame(false);
		this.autoResize = true;
		this.transparent = false;
		this.antialias = false;
		this.forceFXAA = false;
		this.roundPixels = false;
		this.backgroundColor = 16777215;
		this.width = window.innerWidth;
		this.height = window.innerHeight;
		this.set_fps(60);
	}
	,start: function(rendererType,parentDom) {
		if(rendererType == null) rendererType = "auto";
		var _this = window.document;
		this.canvas = _this.createElement("canvas");
		this.canvas.style.width = this.width + "px";
		this.canvas.style.height = this.height + "px";
		this.canvas.style.position = "absolute";
		if(parentDom == null) window.document.body.appendChild(this.canvas); else parentDom.appendChild(this.canvas);
		this.stage = new PIXI.Container();
		var renderingOptions = { };
		renderingOptions.view = this.canvas;
		renderingOptions.backgroundColor = this.backgroundColor;
		renderingOptions.resolution = this.pixelRatio;
		renderingOptions.antialias = this.antialias;
		renderingOptions.forceFXAA = this.forceFXAA;
		renderingOptions.autoResize = this.autoResize;
		renderingOptions.transparent = this.transparent;
		if(rendererType == "auto") this.renderer = PIXI.autoDetectRenderer(this.width,this.height,renderingOptions); else if(rendererType == "canvas") this.renderer = new PIXI.CanvasRenderer(this.width,this.height,renderingOptions); else this.renderer = new PIXI.WebGLRenderer(this.width,this.height,renderingOptions);
		if(this.roundPixels) this.renderer.roundPixels = true;
		window.document.body.appendChild(this.renderer.view);
		if(this.autoResize) window.onresize = $bind(this,this._onWindowResize);
		window.requestAnimationFrame($bind(this,this._onRequestAnimationFrame));
		this._lastTime = new Date();
		this._addStats();
	}
	,_onWindowResize: function(event) {
		this.width = window.innerWidth;
		this.height = window.innerHeight;
		this.renderer.resize(this.width,this.height);
		this.canvas.style.width = this.width + "px";
		this.canvas.style.height = this.height + "px";
		if(this.onResize != null) this.onResize();
	}
	,_onRequestAnimationFrame: function() {
		this._frameCount++;
		if(this._frameCount == (60 / this.fps | 0)) {
			this._frameCount = 0;
			this._calculateElapsedTime();
			if(this.onUpdate != null) this.onUpdate(this._elapsedTime);
			this.renderer.render(this.stage);
		}
		window.requestAnimationFrame($bind(this,this._onRequestAnimationFrame));
	}
	,_calculateElapsedTime: function() {
		this._currentTime = new Date();
		this._elapsedTime = this._currentTime.getTime() - this._lastTime.getTime();
		this._lastTime = this._currentTime;
	}
	,_addStats: function() {
	}
	,_addRenderStats: function(top) {
		if(top == null) top = 0;
		var ren;
		var _this = window.document;
		ren = _this.createElement("div");
		ren.style.position = "absolute";
		ren.style.width = "76px";
		ren.style.right = "0px";
		ren.style.background = "#CCCCC";
		ren.style.backgroundColor = "#105CB6";
		ren.style.fontFamily = "Helvetica,Arial";
		ren.style.padding = "2px";
		ren.style.color = "#0FF";
		ren.style.fontSize = "9px";
		ren.style.fontWeight = "bold";
		ren.style.textAlign = "center";
		window.document.body.appendChild(ren);
		ren.innerHTML = ["UNKNOWN","WEBGL","CANVAS"][this.renderer.type] + " - " + this.pixelRatio;
	}
	,__class__: pixi_plugins_app_Application
};
var Main = function() {
	pixi_plugins_app_Application.call(this);
	this.autoResize = false;
	this.width = 1200;
	this.height = 900;
	pixi_plugins_app_Application.prototype.start.call(this);
	this.resize();
	window.onresize = $bind(this,this.resize);
	AudioManager.init();
	var game = new Game();
	this.stage.addChild(game);
	this.onUpdate = $bind(game,game.update);
};
Main.__name__ = true;
Main.main = function() {
	try {
		new Main();
	} catch( e ) {
		if (e instanceof js__$Boot_HaxeError) e = e.val;
		_$Error_Error_$Impl_$.report("" + Std.string(e) + "\nProgram must abort.");
	}
};
Main.__super__ = pixi_plugins_app_Application;
Main.prototype = $extend(pixi_plugins_app_Application.prototype,{
	resize: function() {
		var w = window.innerWidth;
		var h = window.innerHeight;
		var ratio = Math.max(1200 / w,900 / h);
		if(w > 1200 && h > 900) ratio = 1;
		w = Math.floor(1200 * ratio);
		h = Math.floor(900 * ratio);
		this.renderer.resize(w,h);
	}
	,__class__: Main
});
Math.__name__ = true;
var Network = function() {
	PIXI.Container.call(this);
	this.pipes = new TypedSpriteGroup();
	this.junctions = new TypedSpriteGroup();
	this.presents = new TypedSpriteGroup();
	this.addChild(this.pipes);
	this.addChild(this.junctions);
	this.addChild(this.presents);
	this.tick = 0;
};
Network.__name__ = true;
Network.fromJson = function(data) {
	var network = new Network();
	try {
		var d = data;
		network.maxCycles = d.maxCycles;
		var j = [];
		var _g = 0;
		var _g1 = d.junctions;
		while(_g < _g1.length) {
			var junction = _g1[_g];
			++_g;
			var junc = Junction.fromJson(junction);
			network.junctions.addChild(junc);
			j.push(junc);
		}
		var _g2 = 0;
		var _g11 = d.pipes;
		while(_g2 < _g11.length) {
			var pipe = _g11[_g2];
			++_g2;
			network.pipes.add(Pipe.fromJson(pipe,j));
		}
	} catch( err ) {
		if (err instanceof js__$Boot_HaxeError) err = err.val;
		_$Error_Error_$Impl_$.report("Failed to load level " + Std.string(data.name) + "\n" + Std.string(err));
		_$Error_Error_$Impl_$.report(err.stack);
	}
	var $it0 = network.junctions.iterator();
	while( $it0.hasNext() ) {
		var junction1 = $it0.next();
		junction1.addPresentsToGroup(network.presents);
	}
	return network;
};
Network.__super__ = PIXI.Container;
Network.prototype = $extend(PIXI.Container.prototype,{
	startFlow: function() {
		this.currentlyFlowing = true;
		var $it0 = this.junctions.iterator();
		while( $it0.hasNext() ) {
			var junction = $it0.next();
			junction.preflow();
		}
		var $it1 = this.pipes.iterator();
		while( $it1.hasNext() ) {
			var pipe = $it1.next();
			pipe.preflow();
		}
		this.tick = 0;
		this.cycle = 0;
	}
	,stopFlow: function() {
		this.currentlyFlowing = false;
		var $it0 = this.junctions.iterator();
		while( $it0.hasNext() ) {
			var junction = $it0.next();
			junction.postflow();
		}
		var $it1 = this.pipes.iterator();
		while( $it1.hasNext() ) {
			var pipe = $it1.next();
			pipe.postflow();
		}
	}
	,reset: function() {
		var $it0 = this.junctions.iterator();
		while( $it0.hasNext() ) {
			var junction = $it0.next();
			junction.reset();
		}
		var $it1 = this.pipes.iterator();
		while( $it1.hasNext() ) {
			var pipe = $it1.next();
			pipe.reset();
		}
	}
	,nextFlowTick: function() {
		++this.tick;
		var _g = this.tick;
		switch(_g) {
		case 1:
			var $it0 = this.junctions.iterator();
			while( $it0.hasNext() ) {
				var junction = $it0.next();
				junction.predispatch();
			}
			break;
		case 2:
			var $it1 = this.junctions.iterator();
			while( $it1.hasNext() ) {
				var junction1 = $it1.next();
				junction1.dispatch();
			}
			break;
		case 3:
			var $it2 = this.pipes.iterator();
			while( $it2.hasNext() ) {
				var pipe = $it2.next();
				pipe.transfer();
			}
			break;
		case 90:
			var $it3 = this.junctions.iterator();
			while( $it3.hasNext() ) {
				var junction2 = $it3.next();
				junction2.receive();
			}
			break;
		case 91:
			var $it4 = this.junctions.iterator();
			while( $it4.hasNext() ) {
				var junction3 = $it4.next();
				junction3.postreceive();
			}
			break;
		case 120:
			++this.cycle;
			if(!this.allSatisfied()) this.tick = 0;
			break;
		case 160:
			Debug.log("WINNNNNNN");
			this.stopFlow();
			this.won = true;
			break;
		default:
		}
	}
	,resetTicks: function() {
		this.tick = 0;
	}
	,hasWon: function() {
		return this.won;
	}
	,allSatisfied: function() {
		var $it0 = this.junctions.iterator();
		while( $it0.hasNext() ) {
			var junction = $it0.next();
			if(!junction.satisfied()) return false;
		}
		Debug.log("Cycle: " + this.cycle + "; Max: " + this.maxCycles);
		return this.cycle <= this.maxCycles;
	}
	,junctionAt: function(pos) {
		var $it0 = this.junctions.iterator();
		while( $it0.hasNext() ) {
			var junction = $it0.next();
			if(junction.getBounds().contains(pos.x + junction.pivot.x,pos.y + junction.pivot.y)) return junction;
		}
		return null;
	}
	,addPresentsFor: function(j) {
		j.addPresentsToGroup(this.presents);
	}
	,__class__: Network
});
var TypedSpriteGroup = function() {
	PIXI.Container.call(this);
};
TypedSpriteGroup.__name__ = true;
TypedSpriteGroup.__super__ = PIXI.Container;
TypedSpriteGroup.prototype = $extend(PIXI.Container.prototype,{
	add: function(obj) {
		this.addChild(obj);
	}
	,remove: function(obj) {
		this.removeChild(obj);
	}
	,iterator: function() {
		return HxOverrides.iter(this.children);
	}
	,__class__: TypedSpriteGroup
});
var Pipe = function(source,destination,texture) {
	var _g = this;
	TypedSpriteGroup.call(this);
	this.source = source;
	this.destination = destination;
	this.presents = [];
	this.texture = texture;
	this.directionSign = new PIXI.Sprite(PIXI.Texture.fromImage("" + "assets" + "/sprites/" + "right-small.png"));
	this.addChild(this.directionSign);
	if(texture.baseTexture.hasLoaded) {
		if(this.directionSign.texture.baseTexture.hasLoaded) this.drawPath(); else this.directionSign.texture.baseTexture.once("loaded",function(e) {
			_g.drawPath();
		});
	} else texture.baseTexture.once("loaded",function(e1) {
		if(_g.directionSign.texture.baseTexture.hasLoaded) _g.drawPath(); else _g.directionSign.texture.baseTexture.once("loaded",function(e2) {
			_g.drawPath();
		});
	});
};
Pipe.__name__ = true;
Pipe.fromJson = function(data,junctions) {
	var pipe;
	var type = data.type;
	if(type == "standard") pipe = junctions[data.source].connectTo(junctions[data.dest],pipes_StandardPipe); else if(type == "flippable") pipe = junctions[data.source].connectTo(junctions[data.dest],pipes_FlippablePipe); else throw new js__$Boot_HaxeError((function($this) {
		var $r;
		var this1;
		this1 = "ERROR";
		if("Pipe".length + "fromJson".length > 0) {
			this1 += " in";
			if("Pipe".length > 0) this1 += " " + "Pipe";
			if("fromJson".length > 0) this1 += " " + "fromJson";
		}
		this1 += ": " + ("Invalid pipe type <" + type + "> detected");
		$r = this1;
		return $r;
	}(this)));
	return pipe;
};
Pipe.__super__ = TypedSpriteGroup;
Pipe.prototype = $extend(TypedSpriteGroup.prototype,{
	preflow: function() {
	}
	,postflow: function() {
		this.presents.splice(0,this.presents.length);
	}
	,receive: function(present) {
		this.presents.push(present);
	}
	,transfer: function() {
		var _g = 0;
		var _g1 = this.presents;
		while(_g < _g1.length) {
			var present = _g1[_g];
			++_g;
			present.moveTo(this.destination.position,90);
		}
	}
	,dispatch: function() {
		return this.presents.splice(0,this.presents.length);
	}
	,valid: function() {
		return true;
	}
	,reset: function() {
	}
	,drawPath: function() {
		if(this.source.x == this.destination.x) {
			this.drawVerticalPath();
			return;
		}
		var angle = Math.atan((this.destination.y - this.source.y) / (this.destination.x - this.source.x));
		if(this.source.x > this.destination.x) angle = Math.PI + angle;
		var incX = this.texture.width * Math.cos(angle);
		var incY = (this.destination.y - this.source.y) / ((this.destination.x - this.source.x) / incX);
		var curX = this.source.x;
		var curY = this.source.y;
		var sgn;
		if(Math.cos(angle) < 0) sgn = -1; else sgn = 1;
		while(sgn * curX < sgn * this.destination.x) {
			var s = new PIXI.Sprite(this.texture);
			s.pivot.set(this.texture.width / 2,this.texture.height / 2);
			s.rotation = angle;
			s.position.set(curX,curY);
			this.addChild(s);
			curX += incX;
			curY += incY;
		}
		this.drawSign(angle);
	}
	,drawVerticalPath: function() {
		var incY = this.texture.width;
		if(this.destination.y < this.source.y) incY *= -1; else incY *= 1;
		var curY = this.source.y;
		var sgn;
		if(incY < 0) sgn = -1; else sgn = 1;
		while(sgn * curY < sgn * this.destination.y) {
			var s = new PIXI.Sprite(this.texture);
			s.pivot.set(this.texture.width / 2,this.texture.height / 2);
			s.rotation = sgn * Math.PI / 2;
			s.position.set(this.source.x,curY);
			this.addChild(s);
			curY += incY;
		}
		if(this.destination.y > this.source.y) this.drawSign(Math.PI / 2); else this.drawSign(-Math.PI / 2);
	}
	,drawSign: function(angle) {
		this.directionSign.pivot.set(this.directionSign.texture.width / 2,this.directionSign.texture.height / 2);
		var midX = (this.destination.x + this.source.x) / 2;
		var midY = (this.destination.y + this.source.y) / 2;
		var offset = 25;
		midX += offset * Math.cos(angle - Math.PI / 2);
		midY += offset * Math.sin(angle - Math.PI / 2);
		this.directionSign.rotation = angle;
		this.directionSign.position.set(midX,midY);
	}
	,__class__: Pipe
});
var Present = function(tex) {
	if(tex == null) PIXI.Sprite.call(this,PIXI.Texture.fromImage(Assets.getSpriteURL(Present.randomPresentImage()))); else PIXI.Sprite.call(this,tex);
	this.width = 30;
	this.height = 30;
	if(this.texture.baseTexture.hasLoaded) this.center(); else this.texture.baseTexture.on("loaded",$bind(this,this.center));
};
Present.__name__ = true;
Present.randomPresentImage = function() {
	return Present.SPRITES[Std.random(Present.SPRITES.length)];
};
Present.__super__ = PIXI.Sprite;
Present.prototype = $extend(PIXI.Sprite.prototype,{
	moveTo: function(dest,duration) {
		if(this.curTweener != null && this.curTweener.started) this.curTweener.stop();
		if(duration > 0) {
			this.curTweener = new Tweener(this,dest,duration);
			this.curTweener.start();
		} else this.position.set(dest.x,dest.y);
	}
	,destroy: function() {
		this.parent.removeChild(this);
	}
	,center: function() {
		this.pivot.set(this.texture.width / 2,this.texture.height / 2);
	}
	,__class__: Present
});
var StartStopButton = function(network,toolbox) {
	PIXI.Container.call(this);
	this.network = network;
	this.toolbox = toolbox;
	this.startButton = new PIXI.Sprite(PIXI.Texture.fromImage("" + "assets" + "/sprites/" + "ph_start.png"));
	ExtEventEmitter.onReleaseInside(this.startButton,$bind(this,this.start));
	this.startButton.interactive = true;
	this.stopButton = new PIXI.Sprite(PIXI.Texture.fromImage("" + "assets" + "/sprites/" + "ph_stop.png"));
	ExtEventEmitter.onReleaseInside(this.stopButton,$bind(this,this.stop));
	this.stopButton.interactive = true;
	this.stopButton.visible = false;
	this.addChild(this.startButton);
	this.addChild(this.stopButton);
};
StartStopButton.__name__ = true;
StartStopButton.__super__ = PIXI.Container;
StartStopButton.prototype = $extend(PIXI.Container.prototype,{
	start: function(e) {
		this.network.startFlow();
		this.toolbox.deactivate();
		this.startButton.visible = false;
		this.stopButton.visible = true;
	}
	,stop: function(e) {
		this.network.stopFlow();
		this.toolbox.activate();
		this.startButton.visible = true;
		this.stopButton.visible = false;
	}
	,__class__: StartStopButton
});
var Std = function() { };
Std.__name__ = true;
Std.string = function(s) {
	return js_Boot.__string_rec(s,"");
};
Std.parseInt = function(x) {
	var v = parseInt(x,10);
	if(v == 0 && (HxOverrides.cca(x,1) == 120 || HxOverrides.cca(x,1) == 88)) v = parseInt(x);
	if(isNaN(v)) return null;
	return v;
};
Std.random = function(x) {
	if(x <= 0) return 0; else return Math.floor(Math.random() * x);
};
var Toolbox = function() {
	PIXI.Container.call(this);
	this.bags = [];
};
Toolbox.__name__ = true;
Toolbox.fromJson = function(data) {
	var toolbox = new Toolbox();
	var d = data.toolbox;
	try {
		var _g = 0;
		while(_g < d.length) {
			var bdata = d[_g];
			++_g;
			Debug.log(bdata);
			var bag = new Bag(bdata,toolbox.bags.length % 5 * 100,Math.floor(toolbox.bags.length / 5) * 100);
			ExtEventEmitter.onClick(bag,(function(f,a1) {
				return function(e) {
					f(a1,e);
				};
			})($bind(toolbox,toolbox.onSelectItem),bag));
			ExtEventEmitter.onRelease(bag,(function(f1,a11) {
				return function(e1) {
					f1(a11,e1);
				};
			})($bind(toolbox,toolbox.onUnselectItem),bag));
			toolbox.bags.push(bag);
			toolbox.addChild(bag);
		}
	} catch( err ) {
		if (err instanceof js__$Boot_HaxeError) err = err.val;
		_$Error_Error_$Impl_$.report("Failed to load toolbox " + Std.string(data.name) + "\n" + Std.string(err));
		_$Error_Error_$Impl_$.report(err.stack);
	}
	toolbox.activate();
	return toolbox;
};
Toolbox.__super__ = PIXI.Container;
Toolbox.prototype = $extend(PIXI.Container.prototype,{
	activate: function() {
		var _g = 0;
		var _g1 = this.bags;
		while(_g < _g1.length) {
			var bag = _g1[_g];
			++_g;
			bag.activate();
		}
	}
	,deactivate: function() {
		var _g = 0;
		var _g1 = this.bags;
		while(_g < _g1.length) {
			var bag = _g1[_g];
			++_g;
			bag.deactivate();
		}
	}
	,reset: function() {
		var _g = 0;
		var _g1 = this.bags;
		while(_g < _g1.length) {
			var bag = _g1[_g];
			++_g;
			bag.returnToToolbox();
		}
	}
	,onSelectItem: function(bag,e) {
		bag.startDrag();
		AudioManager.play("audio-drop");
	}
	,onUnselectItem: function(bag,e) {
		bag.stopDrag();
		bag.apply((js_Boot.__cast(Game.instance.state , states_LevelState)).network);
		AudioManager.play("audio-drop");
	}
	,__class__: Toolbox
});
var Tweener = function(obj,to,duration) {
	PIXI.ticker.Ticker.call(this);
	this.obj = obj;
	this.to = to;
	this.duration = duration;
	this.nextTweener = null;
	this.add($bind(this,this.tick));
};
Tweener.__name__ = true;
Tweener.__super__ = PIXI.ticker.Ticker;
Tweener.prototype = $extend(PIXI.ticker.Ticker.prototype,{
	isMoving: function() {
		if(this.nextTweener != null) return this.started || this.nextTweener.isMoving();
		return this.started;
	}
	,succeededBy: function(t) {
		this.nextTweener = t;
		return t;
	}
	,start: function() {
		this.xInc = (this.to.x - this.obj.x) / this.duration;
		this.yInc = (this.to.y - this.obj.y) / this.duration;
		this.curTick = 0;
		Debug.log("started, going from " + Std.string(this.obj.position) + " -> " + Std.string(this.to));
		PIXI.ticker.Ticker.prototype.start.call(this);
	}
	,tick: function() {
		this.obj.x += this.xInc;
		this.obj.y += this.yInc;
		++this.curTick;
		if(this.curTick >= this.duration) {
			this.stop();
			if(this.nextTweener != null) this.nextTweener.start();
		}
	}
	,__class__: Tweener
});
var TwoStateSprite = function(off,on) {
	PIXI.Sprite.call(this,off);
	this.onTexture = on;
	this.offTexture = off;
};
TwoStateSprite.__name__ = true;
TwoStateSprite.__super__ = PIXI.Sprite;
TwoStateSprite.prototype = $extend(PIXI.Sprite.prototype,{
	defaultTextureChanges: function() {
		var _g = this;
		this.on("mousedown",function(e) {
			_g.setOn();
		});
		this.on("touchstart",function(e) {
			_g.setOn();
		});
		this.on("mouseout",function(e1) {
			_g.setOff();
		});
		this.on("touchout",function(e1) {
			_g.setOff();
		});
		this.on("mouseupoutside",function(e2) {
			_g.setOff();
		});
		this.on("touchendoutside",function(e2) {
			_g.setOff();
		});
	}
	,setOff: function() {
		this.clicked = false;
		this.texture = this.offTexture;
	}
	,setOn: function() {
		this.clicked = true;
		this.texture = this.onTexture;
	}
	,__class__: TwoStateSprite
});
var Type = function() { };
Type.__name__ = true;
Type.createInstance = function(cl,args) {
	var _g = args.length;
	switch(_g) {
	case 0:
		return new cl();
	case 1:
		return new cl(args[0]);
	case 2:
		return new cl(args[0],args[1]);
	case 3:
		return new cl(args[0],args[1],args[2]);
	case 4:
		return new cl(args[0],args[1],args[2],args[3]);
	case 5:
		return new cl(args[0],args[1],args[2],args[3],args[4]);
	case 6:
		return new cl(args[0],args[1],args[2],args[3],args[4],args[5]);
	case 7:
		return new cl(args[0],args[1],args[2],args[3],args[4],args[5],args[6]);
	case 8:
		return new cl(args[0],args[1],args[2],args[3],args[4],args[5],args[6],args[7]);
	default:
		throw new js__$Boot_HaxeError("Too many arguments");
	}
	return null;
};
var haxe_IMap = function() { };
haxe_IMap.__name__ = true;
var haxe_ds__$StringMap_StringMapIterator = function(map,keys) {
	this.map = map;
	this.keys = keys;
	this.index = 0;
	this.count = keys.length;
};
haxe_ds__$StringMap_StringMapIterator.__name__ = true;
haxe_ds__$StringMap_StringMapIterator.prototype = {
	hasNext: function() {
		return this.index < this.count;
	}
	,next: function() {
		return this.map.get(this.keys[this.index++]);
	}
	,__class__: haxe_ds__$StringMap_StringMapIterator
};
var haxe_ds_StringMap = function() {
	this.h = { };
};
haxe_ds_StringMap.__name__ = true;
haxe_ds_StringMap.__interfaces__ = [haxe_IMap];
haxe_ds_StringMap.prototype = {
	set: function(key,value) {
		if(__map_reserved[key] != null) this.setReserved(key,value); else this.h[key] = value;
	}
	,get: function(key) {
		if(__map_reserved[key] != null) return this.getReserved(key);
		return this.h[key];
	}
	,setReserved: function(key,value) {
		if(this.rh == null) this.rh = { };
		this.rh["$" + key] = value;
	}
	,getReserved: function(key) {
		if(this.rh == null) return null; else return this.rh["$" + key];
	}
	,arrayKeys: function() {
		var out = [];
		for( var key in this.h ) {
		if(this.h.hasOwnProperty(key)) out.push(key);
		}
		if(this.rh != null) {
			for( var key in this.rh ) {
			if(key.charCodeAt(0) == 36) out.push(key.substr(1));
			}
		}
		return out;
	}
	,iterator: function() {
		return new haxe_ds__$StringMap_StringMapIterator(this,this.arrayKeys());
	}
	,__class__: haxe_ds_StringMap
};
var js__$Boot_HaxeError = function(val) {
	Error.call(this);
	this.val = val;
	this.message = String(val);
	if(Error.captureStackTrace) Error.captureStackTrace(this,js__$Boot_HaxeError);
};
js__$Boot_HaxeError.__name__ = true;
js__$Boot_HaxeError.__super__ = Error;
js__$Boot_HaxeError.prototype = $extend(Error.prototype,{
	__class__: js__$Boot_HaxeError
});
var js_Boot = function() { };
js_Boot.__name__ = true;
js_Boot.getClass = function(o) {
	if((o instanceof Array) && o.__enum__ == null) return Array; else {
		var cl = o.__class__;
		if(cl != null) return cl;
		var name = js_Boot.__nativeClassName(o);
		if(name != null) return js_Boot.__resolveNativeClass(name);
		return null;
	}
};
js_Boot.__string_rec = function(o,s) {
	if(o == null) return "null";
	if(s.length >= 5) return "<...>";
	var t = typeof(o);
	if(t == "function" && (o.__name__ || o.__ename__)) t = "object";
	switch(t) {
	case "object":
		if(o instanceof Array) {
			if(o.__enum__) {
				if(o.length == 2) return o[0];
				var str2 = o[0] + "(";
				s += "\t";
				var _g1 = 2;
				var _g = o.length;
				while(_g1 < _g) {
					var i1 = _g1++;
					if(i1 != 2) str2 += "," + js_Boot.__string_rec(o[i1],s); else str2 += js_Boot.__string_rec(o[i1],s);
				}
				return str2 + ")";
			}
			var l = o.length;
			var i;
			var str1 = "[";
			s += "\t";
			var _g2 = 0;
			while(_g2 < l) {
				var i2 = _g2++;
				str1 += (i2 > 0?",":"") + js_Boot.__string_rec(o[i2],s);
			}
			str1 += "]";
			return str1;
		}
		var tostr;
		try {
			tostr = o.toString;
		} catch( e ) {
			if (e instanceof js__$Boot_HaxeError) e = e.val;
			return "???";
		}
		if(tostr != null && tostr != Object.toString && typeof(tostr) == "function") {
			var s2 = o.toString();
			if(s2 != "[object Object]") return s2;
		}
		var k = null;
		var str = "{\n";
		s += "\t";
		var hasp = o.hasOwnProperty != null;
		for( var k in o ) {
		if(hasp && !o.hasOwnProperty(k)) {
			continue;
		}
		if(k == "prototype" || k == "__class__" || k == "__super__" || k == "__interfaces__" || k == "__properties__") {
			continue;
		}
		if(str.length != 2) str += ", \n";
		str += s + k + " : " + js_Boot.__string_rec(o[k],s);
		}
		s = s.substring(1);
		str += "\n" + s + "}";
		return str;
	case "function":
		return "<function>";
	case "string":
		return o;
	default:
		return String(o);
	}
};
js_Boot.__interfLoop = function(cc,cl) {
	if(cc == null) return false;
	if(cc == cl) return true;
	var intf = cc.__interfaces__;
	if(intf != null) {
		var _g1 = 0;
		var _g = intf.length;
		while(_g1 < _g) {
			var i = _g1++;
			var i1 = intf[i];
			if(i1 == cl || js_Boot.__interfLoop(i1,cl)) return true;
		}
	}
	return js_Boot.__interfLoop(cc.__super__,cl);
};
js_Boot.__instanceof = function(o,cl) {
	if(cl == null) return false;
	switch(cl) {
	case Int:
		return (o|0) === o;
	case Float:
		return typeof(o) == "number";
	case Bool:
		return typeof(o) == "boolean";
	case String:
		return typeof(o) == "string";
	case Array:
		return (o instanceof Array) && o.__enum__ == null;
	case Dynamic:
		return true;
	default:
		if(o != null) {
			if(typeof(cl) == "function") {
				if(o instanceof cl) return true;
				if(js_Boot.__interfLoop(js_Boot.getClass(o),cl)) return true;
			} else if(typeof(cl) == "object" && js_Boot.__isNativeObj(cl)) {
				if(o instanceof cl) return true;
			}
		} else return false;
		if(cl == Class && o.__name__ != null) return true;
		if(cl == Enum && o.__ename__ != null) return true;
		return o.__enum__ == cl;
	}
};
js_Boot.__cast = function(o,t) {
	if(js_Boot.__instanceof(o,t)) return o; else throw new js__$Boot_HaxeError("Cannot cast " + Std.string(o) + " to " + Std.string(t));
};
js_Boot.__nativeClassName = function(o) {
	var name = js_Boot.__toStr.call(o).slice(8,-1);
	if(name == "Object" || name == "Function" || name == "Math" || name == "JSON") return null;
	return name;
};
js_Boot.__isNativeObj = function(o) {
	return js_Boot.__nativeClassName(o) != null;
};
js_Boot.__resolveNativeClass = function(name) {
	return (Function("return typeof " + name + " != \"undefined\" ? " + name + " : null"))();
};
var js_Browser = function() { };
js_Browser.__name__ = true;
js_Browser.getLocalStorage = function() {
	try {
		var s = window.localStorage;
		s.getItem("");
		return s;
	} catch( e ) {
		if (e instanceof js__$Boot_HaxeError) e = e.val;
		return null;
	}
};
js_Browser.alert = function(v) {
	window.alert(js_Boot.__string_rec(v,""));
};
var junctions_StandardJunction = function(value,textures) {
	if(textures != null) Junction.call(this,textures); else {
		Junction.call(this,["intPointa.png","intPointb.png"].map(Assets.getTexture));
		this.play();
		this.animationSpeed = .015;
	}
	var _g = 0;
	while(_g < value) {
		var i = _g++;
		this.presentsAtStart.push(new Present());
	}
	this.refillPresents();
};
junctions_StandardJunction.__name__ = true;
junctions_StandardJunction.__super__ = Junction;
junctions_StandardJunction.prototype = $extend(Junction.prototype,{
	dispatch: function() {
		var validPipes = Lambda.filter(this.outPipes,function(pipe) {
			return pipe.valid();
		});
		if(validPipes.length > 0) {
			var toSend = Math.floor(this.get_value() / validPipes.length);
			var _g_head = validPipes.h;
			var _g_val = null;
			while(_g_head != null) {
				var pipe1;
				pipe1 = (function($this) {
					var $r;
					_g_val = _g_head[0];
					_g_head = _g_head[1];
					$r = _g_val;
					return $r;
				}(this));
				var _g = 0;
				while(_g < toSend) {
					var i = _g++;
					pipe1.receive(this.presents.pop());
				}
			}
		}
	}
	,receive: function() {
		var _g = 0;
		var _g1 = this.inPipes;
		while(_g < _g1.length) {
			var pipe = _g1[_g];
			++_g;
			this.presents = this.presents.concat(pipe.dispatch());
		}
	}
	,postreceive: function() {
		this.positionPresents(true);
	}
	,canAttachBag: function(b) {
		return !(this.bag == null && this.get_value() > 0);
	}
	,attachBag: function(b) {
		if(this.canAttachBag(b)) {
			if(b.currentJunction != null && this.bag != null) this.swapBagsWith(b.currentJunction); else {
				if(b.currentJunction != null) b.currentJunction.removeBag();
				var prevBag = this.removeBag();
				if(prevBag != null) prevBag.returnToToolbox();
				this.bag = b;
				var $it0 = b.presents.iterator();
				while( $it0.hasNext() ) {
					var p = $it0.next();
					this.presentsAtStart.push(new Present(p.texture));
				}
				this.refillPresents();
				(js_Boot.__cast(Game.instance.state , states_LevelState)).network.addPresentsFor(this);
				this.positionPresents();
			}
			this.gotoAndStop(1);
		}
	}
	,removeBag: function() {
		var b = this.bag;
		if(this.bag != null) while(this.presents.length > 0) {
			this.presents.pop().destroy();
			this.presentsAtStart.pop();
		}
		this.bag = null;
		this.play();
		return b;
	}
	,postflow: function() {
		while(this.presents.length > 0) this.presents.pop();
		this.refillPresents();
		this.positionPresents();
	}
	,__class__: junctions_StandardJunction
});
var junctions_GoalJunction = function(goal) {
	junctions_StandardJunction.call(this,0,Assets.getTextures((function($this) {
		var $r;
		var _g = [];
		{
			var _g1 = 0;
			while(_g1 < 6) {
				var i = _g1++;
				_g.push("h1-" + (6 - i) + ".png");
			}
		}
		$r = _g;
		return $r;
	}(this))));
	this.scale = new PIXI.Point(0.1854,0.1854);
	this.goalPresents = [];
	this.goal = goal;
	this.textWrapper = new PIXI.Sprite(PIXI.Texture.fromImage("" + "assets" + "/sprites/" + "callout.png"));
	this.textWrapper.position.set(810,0);
	this.textWrapper.scale = new PIXI.Point(5.3937432578209279,5.3937432578209279);
	this.goalText = new PIXI.Text(Std.string(this.goal));
	this.goalText.position.set(72 - this.goalText.width * 5.3937432578209279 / 2,6);
	this.textWrapper.addChild(this.goalText);
	this.addChild(this.textWrapper);
	if(this.texture.baseTexture.hasLoaded) this.center(); else this.texture.baseTexture.on("loaded",$bind(this,this.center));
};
junctions_GoalJunction.__name__ = true;
junctions_GoalJunction.__super__ = junctions_StandardJunction;
junctions_GoalJunction.prototype = $extend(junctions_StandardJunction.prototype,{
	satisfied: function() {
		return this.goalPresents.length == this.goal && this.presents.length == 0;
	}
	,receive: function() {
		junctions_StandardJunction.prototype.receive.call(this);
		var satisfiedBefore = this.goalPresents.length == this.goal;
		while(this.presents.length > 0 && this.goalPresents.length != this.goal) {
			var present = this.presents.pop();
			this.goalPresents.push(present);
			present.position.set(-1000.0,-1000.0);
		}
		if(!satisfiedBefore && this.goalPresents.length == this.goal) {
			AudioManager.play("audio-door");
			this.loop = false;
			this.animationSpeed = .09;
			this.play();
		}
		this.goalText.text = Std.string(this.goal - this.goalPresents.length);
		this.goalText.position.set(72 - this.goalText.width * 5.3937432578209279 / 2,6);
	}
	,canAttachBag: function(b) {
		return false;
	}
	,postflow: function() {
		junctions_StandardJunction.prototype.postflow.call(this);
		while(this.goalPresents.length > 0) this.goalPresents.pop();
		this.goalText.text = Std.string(this.goal - this.goalPresents.length);
		this.goalText.position.set(72 - this.goalText.width * 5.3937432578209279 / 2,6);
		this.gotoAndStop(0);
	}
	,setGoalText: function() {
		this.goalText.text = Std.string(this.goal - this.goalPresents.length);
		this.goalText.position.set(72 - this.goalText.width * 5.3937432578209279 / 2,6);
	}
	,centerGoalText: function() {
		this.goalText.position.set(72 - this.goalText.width * 5.3937432578209279 / 2,6);
	}
	,__class__: junctions_GoalJunction
});
var pipes_FlippablePipe = function(source,destination,partner) {
	Pipe.call(this,source,destination,PIXI.Texture.fromImage("" + "assets" + "/sprites/" + "pipe-flippable.png"));
	if(partner == null) {
		this.partner = destination.connectTo(source,pipes_FlippablePipe,[this]);
		this.showPipe();
		this.primary = true;
	} else {
		this.partner = partner;
		this.hidePipe();
		this.primary = false;
	}
	this.directionSign.texture = PIXI.Texture.fromImage("" + "assets" + "/sprites/" + "right-small-no-snow.png");
	if(!this.primary) {
		this.partner.directionSign.position = this.directionSign.position.clone();
		this.partner.directionSign.scale.set(1,-1);
	}
	ExtEventEmitter.onReleaseInside(this,$bind(this,this.toggle));
};
pipes_FlippablePipe.__name__ = true;
pipes_FlippablePipe.__super__ = Pipe;
pipes_FlippablePipe.prototype = $extend(Pipe.prototype,{
	valid: function() {
		return this.currentPipe;
	}
	,reset: function() {
		if(this.primary) this.showPipe(); else this.hidePipe();
	}
	,toggle: function(e) {
		if(this.valid()) {
			this.hidePipe();
			this.partner.showPipe();
		} else {
			this.showPipe();
			this.partner.hidePipe();
		}
	}
	,hidePipe: function() {
		this.currentPipe = false;
		this.visible = false;
		this.interactive = false;
	}
	,showPipe: function() {
		if(this.parent == null && this.partner.parent != null) this.partner.parent.addChild(this);
		this.currentPipe = true;
		this.visible = true;
		this.interactive = true;
	}
	,__class__: pipes_FlippablePipe
});
var pipes_StandardPipe = function(source,destination) {
	Pipe.call(this,source,destination,PIXI.Texture.fromImage("" + "assets" + "/sprites/" + "pipe.png"));
};
pipes_StandardPipe.__name__ = true;
pipes_StandardPipe.__super__ = Pipe;
pipes_StandardPipe.prototype = $extend(Pipe.prototype,{
	__class__: pipes_StandardPipe
});
var states_LevelSelectState = function() {
	var _g = this;
	GameState.call(this);
	this.mapMask = new PIXI.Graphics();
	this.mapMask.beginFill();
	this.mapMask.drawRect(0,0,1000,1000);
	this.mapMask.endFill();
	this.addChild(this.mapMask);
	this.map = new PIXI.Container();
	ExtEventEmitter.onClick(this.map,$bind(this,this.startDrag));
	ExtEventEmitter.onRelease(this.map,$bind(this,this.stopDrag));
	ExtEventEmitter.onMove(this.map,$bind(this,this.mouseMove));
	this.map.interactive = true;
	this.addChild(this.map);
	this.map.mask = this.mapMask;
	this.background = new PIXI.Sprite(PIXI.Texture.fromImage("" + "assets" + "/sprites/" + "ph_background.png"));
	this.background.width = 1400;
	this.background.height = 1400;
	this.map.addChild(this.background);
	var back = GameState.makeButton("ph_back.png",function() {
		Game.instance.switchState(Game.instance.startState);
	});
	this.addChild(back);
	this.santa = new PIXI.Sprite(PIXI.Texture.fromImage("" + "assets" + "/sprites/" + "Santa.png"));
	this.santa.width = 100;
	this.santa.height = 100;
	this.santa.texture.on("loaded",function(e) {
		_g.placeSantaAt(Game.instance.getLevel());
		_g.santa.pivot.set(_g.santa.width / 2,_g.santa.height / 2);
	});
	var loader = new PIXI.loaders.Loader();
	loader.add("levels","" + "assets" + "/" + "level_layout" + ".json",null,$bind(this,this.addLevels));
	loader.load();
	this.moving = false;
	this.tweener = null;
	this.dragging = false;
	this.dragPoint = new PIXI.Point(0,0);
};
states_LevelSelectState.__name__ = true;
states_LevelSelectState.__super__ = GameState;
states_LevelSelectState.prototype = $extend(GameState.prototype,{
	update: function() {
		GameState.prototype.update.call(this);
		if(this.tweener != null) {
			if(!this.moving) {
				this.moving = true;
				this.tweener.start();
			} else if(!this.tweener.isMoving()) {
				if(this.tweener != null) this.tweener.stop();
				this.tweener = null;
				this.moving = false;
				this.dragging = false;
				Debug.log("end at " + this.santa.x + ", " + this.santa.y + " pos=" + this.santa.position.x + " " + this.santa.position.y);
			}
		}
	}
	,resetState: function() {
		if(this.tweener != null) this.tweener.stop();
		this.tweener = null;
		this.moving = false;
		this.dragging = false;
	}
	,from: function(level,won) {
		this.dragging = false;
		if(won && level == Game.instance.getLevel() && level < this.levels.length) {
			this.placeSantaAt(Game.instance.getLevel());
			Game.instance.incrementLevel();
			this.moveSantaTo(Game.instance.getLevel());
			this.levels[level].interactive = true;
		}
	}
	,addLevels: function(resource) {
		this.levels = [];
		this.path = [];
		try {
			var array = resource.data;
			var _g = 0;
			var _g1 = array.levels;
			while(_g < _g1.length) {
				var level = _g1[_g];
				++_g;
				var sprite = new LevelSprite(level.number,level.image);
				sprite.position.set(level.x,level.y);
				if(level.number <= Game.instance.getLevel()) sprite.interactive = true; else sprite.interactive = false;
				this.levels.push(sprite);
				this.path.push(level.path);
				this.map.addChild(sprite);
			}
			this.map.addChild(this.santa);
			this.placeSantaAt(Game.instance.getLevel());
		} catch( err ) {
			if (err instanceof js__$Boot_HaxeError) err = err.val;
			_$Error_Error_$Impl_$.report("Failed to load level selection screen data from " + Std.string(resource.data.name) + "\n" + Std.string(err));
			Debug.alert(err.stack);
			return;
		}
	}
	,placeSantaAt: function(level) {
		this.santa.position = this.path[level - 1][this.path[level - 1].length - 1];
		Debug.log("Placed santa at level " + level + " @" + Std.string(this.santa.position));
		Debug.log("Relative to " + Std.string(this.levels[level - 1].position));
	}
	,moveSantaTo: function(level) {
		if(this.tweener != null) this.tweener.stop();
		this.tweener = null;
		this.moving = false;
		this.dragging = false;
		Debug.log("moving santa to level " + level);
		var ts = this.path[level - 1].map((function(f,a1,a3) {
			return function(a2) {
				return f(a1,a2,a3);
			};
		})(function(obj,to,duration) {
			return new Tweener(obj,to,duration);
		},this.santa,50));
		this.tweener = ts.shift();
		Lambda.fold(ts,function(l,r) {
			return r.succeededBy(l);
		},this.tweener);
		AudioManager.play("audio-santa");
	}
	,startDrag: function(e) {
		this.dragging = true;
		this.dragPoint = e.data.getLocalPosition(this.map.parent);
	}
	,stopDrag: function(e) {
		this.dragging = false;
	}
	,mouseMove: function(e) {
		var p = e.data.getLocalPosition(this.map.parent.parent);
		if(this.dragging) {
			this.map.position.x += p.x - this.dragPoint.x;
			this.map.position.y += p.y - this.dragPoint.y;
			if(this.map.position.x > 0) this.map.position.x = 0; else if(this.map.position.x < -1400) this.map.position.x = -1400;
			if(this.map.position.y > 0) this.map.position.y = 0; else if(this.map.position.y < -1400) this.map.position.y = -1400;
			this.dragPoint = p;
		} else {
		}
	}
	,__class__: states_LevelSelectState
});
var states_LevelState = function(number,levelData) {
	GameState.call(this);
	this.titleText = new PIXI.Text(levelData.name,{ font : "36px " + "Mountains of Christmas", fill : "0", align : "center"});
	this.level = number;
	this.network = Network.fromJson(levelData);
	this.network.position.set(0,75);
	this.toolbox = Toolbox.fromJson(levelData);
	this.toolbox.position.set(50,this.network.y + 600);
	this.initMenu();
	this.addChild(this.titleText);
	this.addChild(this.network);
	this.addChild(this.toolbox);
	this.addChild(this.menu);
	AudioManager.stopAll();
	AudioManager.loop("audio-level");
};
states_LevelState.__name__ = true;
states_LevelState.__super__ = GameState;
states_LevelState.prototype = $extend(GameState.prototype,{
	update: function() {
		GameState.prototype.update.call(this);
		if(this.network.currentlyFlowing) this.network.nextFlowTick(); else if(this.network.won) {
			Debug.log("Going to level select from " + this.level);
			var levelSelect = Game.instance.selectState;
			levelSelect.from(this.level,true);
			Game.instance.switchState(levelSelect);
		}
	}
	,initMenu: function() {
		this.menu = new TypedSpriteGroup();
		var buttonXStart = 600;
		this.startStop = new StartStopButton(this.network,this.toolbox);
		this.startStop.position.set(buttonXStart,this.toolbox.y);
		this.back = GameState.makeButton("ph_back-sign.png",function() {
			Game.instance.switchState(Game.instance.startState);
		});
		this.resetButton = new PIXI.Sprite(PIXI.Texture.fromImage("" + "assets" + "/sprites/" + "ph_reset.png"));
		this.resetButton.position.set(this.startStop.x + 200,this.toolbox.y);
		this.resetButton.interactive = true;
		ExtEventEmitter.onReleaseInside(this.resetButton,$bind(this,this.reset));
		this.back.position.set(this.resetButton.x + 200,this.toolbox.y);
		this.menu.addChild(this.startStop);
		this.menu.addChild(this.resetButton);
		this.menu.addChild(this.back);
	}
	,reset: function(e) {
		this.network.reset();
		this.toolbox.reset();
	}
	,__class__: states_LevelState
});
var states_StartState = function() {
	GameState.call(this);
	var background = new PIXI.extras.MovieClip(["title1.png","title2.png","title3.png","title4.png"].map(Assets.getTexture));
	background.animationSpeed = .05;
	this.addChild(background);
	background.play();
	var start = GameState.makeFancyButton("sb1.png","sb2.png",$bind(this,this.toLastLevel));
	start.position.set(150,730);
	this.addChild(start);
	var select = GameState.makeFancyButton("selB1.png","selB2.png",$bind(this,this.toSelectScreen));
	select.position.set(770,730);
	this.addChild(select);
	AudioManager.stopAll();
	AudioManager.loop("audio-menu");
};
states_StartState.__name__ = true;
states_StartState.buttonTo = function(name) {
	return GameState.makeButton(name,function() {
		Game.instance.switchState(Game.instance.startState);
	});
};
states_StartState.__super__ = GameState;
states_StartState.prototype = $extend(GameState.prototype,{
	update: function() {
		GameState.prototype.update.call(this);
	}
	,resetState: function() {
	}
	,toLastLevel: function() {
		GameState.toLevel(Game.instance.getLevel());
	}
	,toSelectScreen: function() {
		Game.instance.switchState(Game.instance.selectState);
	}
	,__class__: states_StartState
});
function $iterator(o) { if( o instanceof Array ) return function() { return HxOverrides.iter(o); }; return typeof(o.iterator) == 'function' ? $bind(o,o.iterator) : o.iterator; }
var $_, $fid = 0;
function $bind(o,m) { if( m == null ) return null; if( m.__id__ == null ) m.__id__ = $fid++; var f; if( o.hx__closures__ == null ) o.hx__closures__ = {}; else f = o.hx__closures__[m.__id__]; if( f == null ) { f = function(){ return f.method.apply(f.scope, arguments); }; f.scope = o; f.method = m; o.hx__closures__[m.__id__] = f; } return f; }
String.prototype.__class__ = String;
String.__name__ = true;
Array.__name__ = true;
Date.prototype.__class__ = Date;
Date.__name__ = ["Date"];
var Int = { __name__ : ["Int"]};
var Dynamic = { __name__ : ["Dynamic"]};
var Float = Number;
Float.__name__ = ["Float"];
var Bool = Boolean;
Bool.__ename__ = ["Bool"];
var Class = { __name__ : ["Class"]};
var Enum = { };
if(Array.prototype.map == null) Array.prototype.map = function(f) {
	var a = [];
	var _g1 = 0;
	var _g = this.length;
	while(_g1 < _g) {
		var i = _g1++;
		a[i] = f(this[i]);
	}
	return a;
};
var __map_reserved = {}
Assets.ASSET_DIR = "assets";
Assets.FONT = "Mountains of Christmas";
AudioManager.MENU = "audio-menu";
AudioManager.LEVEL = "audio-level";
AudioManager.CREDITS = "audio-credits";
AudioManager.DOOR = "audio-door";
AudioManager.DROP = "audio-drop";
AudioManager.SANTA = "audio-santa";
AudioManager.WIN = "audio-win";
AudioManager.initialized = false;
Debug.history = [];
Debug.DEBUG_MODE = true;
Dim.TOTAL_WIDTH = 800;
Dim.LEVEL_TITLE_HEIGHT = 75;
Dim.NETWORK_HEIGHT = 600;
Dim.SIGN_WIDTH = 200;
Dim.MENU_WIDTH = 200;
Dim.MENU_PADDING = 10;
Game.OFFSCREEN = -1000.0;
Game.STORAGE_NAME = "StoredLevel";
pixi_plugins_app_Application.AUTO = "auto";
pixi_plugins_app_Application.RECOMMENDED = "recommended";
pixi_plugins_app_Application.CANVAS = "canvas";
pixi_plugins_app_Application.WEBGL = "webgl";
Main.STAGE_WIDTH = 1200;
Main.STAGE_HEIGHT = 900;
Present.SPRITES = ["gift1b.png","gift1g.png","gift1r.png"];
js_Boot.__toStr = {}.toString;
junctions_GoalJunction.SCALE = 0.1854;
states_LevelSelectState.LEVEL_LAYOUT = "level_layout";
states_StartState.BACK_TO_SPRITE = "ph_backToStart.png";
Main.main();
})(typeof console != "undefined" ? console : {log:function(){}});
