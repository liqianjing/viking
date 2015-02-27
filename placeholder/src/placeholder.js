/**
 * 	@Desc		兼容ie的placeholder
 * 	@Author 	lixi
 * 	@Email 		lixi@conew.com
 * 	@Version 	0.0.1
 *	@Date		2015-02-06
 */
// 使用
// 直接引入js，加一个data-placeholder的mark(注：因为脚本是兼容ie的placeholder所以脚本兼容只针对ie)
// 例如：<input type="text" value="" class="items" id="age" data-placeholder="placeholder2" placeholder="请输入你的年纪"/>
(function(_WIN){
	var PLACE = 'placeholder',
		inputs = document.getElementsByTagName('input'),
		body = document.getElementsByTagName('body')[0],
		domArr = [];
	//获取属性值
	function getStyle(element,attr){
		var result = null;
		if(element.currentStyle){
			result = element.currentStyle[attr];
		}
		// else if(window.getComputedStyle) {
		// 	result = window.getComputedStyle(element,null)[attr];
		// }
		return result;
	}
	//设置属性
	function setStyle(tar,param){
		var val;
		if(Object.prototype.toString.call(param) === '[object Object]') {
			for(i in param){
				val = param[i];
				tar.style[i] = val;
			}
		}
	}
	//获取元素的绝对位置
	function getElementAbsPos(e) {  
	    var offsetTop = e.offsetTop,
			offsetLeft = e.offsetLeft;  
	    while(e = e.offsetParent) {  
	        offsetTop += e.offsetTop;  
	    	offsetLeft += e.offsetLeft;  
	    } 
	    return {left:offsetLeft,top:offsetTop};  
	}
	//设置label
	function setLabel(tar,labelDom){
		var hei = getStyle(tar,'height') || 0,
			wid = getStyle(tar,'width') || 0, 
			paddingLeft = getStyle(tar,'padding-left') || 0
			scrollHeight = document.body.scrollHeight,
			currentHei = parseFloat(getStyle(tar.parentNode,'height')),
			tarPosition = getElementAbsPos(tar);

		setStyle(labelDom,{'height':hei, 'width':wid, 'paddingLeft':paddingLeft, 
			'display':'block', 'position':'absolute', 'lineHeight':hei,
			'top':tarPosition.top + 'px', 'left':tarPosition.left + 'px',
			'fontSize':'14px', 'color':'#999'});
	}
	//获取元素的属性
	function getAttr(target,property){
		var value = target.getAttribute(property);
		return value;
	}
	//绑定事件的公共方法
	function bindDomEvent(obj, evtType, handler) {
        var oldHandler;
        // if (obj.addEventListener) {
        //     obj.addEventListener(evtType, handler, false);
        // } else {
            evtType = evtType.toLowerCase();
            if (obj.attachEvent) {
                obj.attachEvent('on' + evtType, handler);
            } else {
                oldHandler = obj['on' + evtType];
                obj['on' + evtType] = function () {
                    if (oldHandler) {
                        oldHandler.apply(this, arguments);
                    }
                    return handler.apply(this, arguments);
                };
            }
        //}
    }
    //label的点击事件
	function clickFn(that,labelDom){
		bindDomEvent(labelDom,'click',function(){
			setStyle(labelDom,{'color':'#ccc'});
			//兼容ie7
			that.focus();
		});
	}
	//input的键盘事件
	function keydownFn(that,labelDom){
		bindDomEvent(that,'keydown',function(){
			setStyle(labelDom,{'color':'#999', 'display':'none'});
		});
	}
	//input的焦点事件
	function blurFn(that,labelDom){
		var result = null;
		bindDomEvent(that,'blur',function(){
			if(that.value){
				result = 'none';
			}else {
				result = 'block';
			}
			setStyle(labelDom,{'color':'#999','display':result});
		});
	}
	//入口执行
	if(!(PLACE in document.createElement('input'))){
		body.style.position = 'relative';
		for(var z = 0, len = inputs.length; z < len; z++){
			var that = inputs[z];
			if(getAttr(that,'data-placeholder')){
				var placeholderVal = getAttr(that,'data-placeholder'),
					val = getAttr(that,PLACE) || '';
				if(placeholderVal){
					var labelDom = document.createElement('label'),
						id = getAttr(that,'id');
					labelDom.className = 'label' + z;
					labelDom.setAttribute('for',id);
					labelDom.innerHTML = val;
					body.appendChild(labelDom);
					//调用设置label
					setLabel(that,labelDom);
					//绑定事件
					clickFn(that,labelDom);
					keydownFn(that,labelDom);
					blurFn(that,labelDom);
				}
			}
		}
	}
})(window);