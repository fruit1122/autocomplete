var AutoComplete = function (selector, opt){
	/*
        1. select query 가져오기 
    */ 
	// 기본 파라미터 
	this.input = document.querySelector(selector);
	this.id = (new Date()).getTime();        
	this.suggetion = null;
	this.selectedIdx = -1;
	this.pre = ''; 
	this.keys = {
		UP : 38,
		DOWN : 40,
		LEFT : 8,
		RIGHT : 39,
		ENTER : 13
	}; 
	this.scroll = {
		parentHeight : 0,
		offset : 0,
	};
	this.opt = opt;
	this.timer = null; // debounce 위한 작업
	if(!this.input) throw new Exception('No have '+selector);
	this.init();
	this.attachEvent();
};

// init
AutoComplete.prototype.init = function (){
	this.suggetion = document.createElement('div');
	this.suggetion.className = 'autocomplete-suggetions';
	this.suggetion.id = this.id;

	this.suggetion.appendChild(document.createElement('div'));
	this.suggetion.style.width = this.input.offsetWidth + 'px';
	this.suggetion.style.left = this.input.offsetLeft + 'px';
	this.suggetion.style.top = (this.input.offsetTop + this.input.offsetHeight)  + 'px';

	document.body.appendChild(this.suggetion);
};

// init event
AutoComplete.prototype.attachEvent = function (){
	if(document.addEventListener) {
		this.input.addEventListener('keydown',this._keyDownEvent.bind(this));
		this.input.addEventListener('keyup',this._keyUpEvent.bind(this));
		this.input.addEventListener('blur',this._suggetionBlurEvent.bind(this));
		document.addEventListener('click',this._suggetionClickEvent.bind(this));
	}else if(document.attachEvent) {
		this.input.attachEvent('keydown',this._keyDownEvent.bind(this));
		this.input.attachEvent('keyup',this._keyUpEvent.bind(this));
		this.input.attachEvent('blur',this._suggetionBlurEvent.bind(this));
		document.attachEvent('click',this._suggetionClickEvent.bind(this));
	}
};

AutoComplete.prototype._suggetionBlurEvent = function(){
	if(this.suggetion.className.indexOf('hide') === -1){
		this.suggetion.className = 'autocomplete-suggetions hide';
	}
};

AutoComplete.prototype._suggetionClickEvent = function(event){
	var target = event.target;
	// 선택
	if(target.className.indexOf('autocomplete-suggetion') > -1){
		this._selectValue(parseInt(target.dataset.idx));
        
		event.stopPropagation();
		event.preventDefault();
	}
};

// keydown event 
AutoComplete.prototype._keyDownEvent = function(event){
	this.pre = event.target.value;
	var keycode = (event.keyCode ? event.keyCode : event.which);
	if(this.suggetion.className.indexOf('hide') === -1){
		this.timer && clearTimeout(this.timer);
		this.timer = setTimeout((function(){
			this._arrowHandler(keycode);
		}).bind(this),0);
		if(this.keys.UP === keycode || this.keys.down === keycode) event.preventDefault();
	}
};


// keydown event 
AutoComplete.prototype._keyUpEvent = function(event){
	// var keycode = (event.keyCode ? event.keyCode : event.which);
	var cur = event.target.value;
	if(this.pre !== cur &&  /[a-zA-Z가-힣0-9]$/.test(cur)){
		// ajax property가 있을 시, ajax 통신 수행 후, 값 셋팅
		if(this.opt.ajax && this.opt.ajax instanceof Function){
			this.opt.ajax.call(null,cur, (function(datas){
				this.opt.datas = datas;
				this._createSuggetion(cur);
			}).bind(this));
		} else {
			this._createSuggetion(cur);
		}
		//방향키 입력
	}else if('' === cur){
		this.pre = cur;
		this.suggetion.className = 'autocomplete-suggetions hide';
	}
	/*
    else if(this.suggetion.className.indexOf('hide') === -1){
        _arrowHandler.call(this, keycode);
    }*/
};

AutoComplete.prototype._arrowHandler = function(keycode){
	var next;
	switch(keycode){
	case this.keys.UP:
		if(this.selectedIdx > 0){
			if(this.selectedIdx >= 0 ) document.querySelector('.autocomplete-suggetion:nth-child('+(this.selectedIdx+1)+')').className = 'autocomplete-suggetion';
			this.selectedIdx = this.selectedIdx - 1;
			next = document.querySelector('.autocomplete-suggetion:nth-child('+(this.selectedIdx+1)+')');
			next.className = 'autocomplete-suggetion selected';
			this._resetScroll('UP',next);
		}
		break;
	case this.keys.DOWN:
		if( this.suggetion.querySelector(':first-child').childElementCount !== (this.selectedIdx + 1)){
			this.selectedIdx = this.selectedIdx + 1;
			document.querySelector('.autocomplete-suggetion:nth-child('+this.selectedIdx+')').className = 'autocomplete-suggetion';
			next = document.querySelector('.autocomplete-suggetion:nth-child('+(this.selectedIdx+1)+')');
			next.className = 'autocomplete-suggetion selected';
			this._resetScroll('DOWN',next);
		}
		break;
	case this.keys.ENTER:
		if(this.selectedIdx != -1){
			this._selectValue(parseInt(document.querySelector('.autocomplete-suggetion:nth-child('+(this.selectedIdx+1)+')').dataset.idx));
		}
		break;
	case this.keys.LEFT: case this.keys.RIGHT:default:
		break;
	}
};

AutoComplete.prototype._resetScroll = function(cursor, next){
	var offset = next.offsetTop;
	if(cursor === 'DOWN'){
		offset = offset + next.offsetHeight -  this.scroll.parentHeight;
		if(offset > 0){
			this.suggetion.scrollTop = offset;
		}else if(offset <= 0)  this.suggetion.scrollTop = 0;
	}else if(cursor === 'UP' && offset < this.suggetion.scrollTop){
		this.suggetion.scrollTop = offset;
	}
};

AutoComplete.prototype._createSuggetion = function(cur){
	var tmpcur = cur.toLocaleLowerCase();
	var frag = document.createDocumentFragment();
	var fragDiv = this.suggetion.firstChild.cloneNode(false);
	frag.appendChild(fragDiv);
	this.opt.datas.forEach((v,i)=>{
		if(this.opt.renderItem && this.opt.renderItem instanceof Function) v = this.opt.renderItem(v);
		var tmpv = v.toLocaleLowerCase();
		var idx  = tmpv.indexOf(tmpcur);
		var div = null;
		var str = '';
		while( idx > -1){
			if(!div){
				div = document.createElement('div');
				div.className = 'autocomplete-suggetion';
				div.dataset.idx = i;
			}
			str += v.slice(0,idx) + '<em>'+v.substr(idx,tmpcur.length) + '</em>';
			tmpv = tmpv.slice(idx+tmpcur.length);
			v = v.slice(idx+tmpcur.length);
			idx  = tmpv.indexOf(tmpcur);
		}
		if(div) {
			if(this.opt.selectFirst && fragDiv.childElementCount=== 0 ){
				this.selectedIdx = 0;
				div.className += ' selected';
			} 
			str += v;
			div.innerHTML  = str;
			fragDiv.appendChild(div);
		}
	});

	if(this.suggetion.className.indexOf('hide') > -1 ) this.suggetion.className = 'autocomplete-suggetions';
	this.suggetion.replaceChild(fragDiv, this.suggetion.firstChild);
	this.pre = cur;
	setTimeout((function(){
		this.scroll.parentHeight = this.suggetion.offsetHeight;
	}).bind(this),0);
};

AutoComplete.prototype._selectValue = function(idx){
	if(this.opt.renderItem && this.opt.renderItem instanceof Function) this.pre = this.opt.renderItem(this.opt.datas[parseInt(idx)]);
	else this.pre = this.opt.datas[parseInt(idx)];
	this.input.value  = this.pre;
	this.suggetion.className = 'autocomplete-suggetions hide';
};
 
