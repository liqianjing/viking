/**
 * 用于数据上报
 *
 * @Author      lixi@conew.com
 * @Date        2015-01-21
 * @Version     1.0.0
 *
 * 注意:如果点击的是a链接，就找一层父级对象（原因：a链接的href和ajax冲突）但是属性要绑定到a标签上
 * 支持嵌套（添加请求地址,运行实例可看到结果）
 */
//加载方式
//TRANCE传入一个数组
//  TRANCE([{
//     //如果是事件触发的上报
//     url : '', //上报数据的地址
//     target : {'way':'byTagName','name':'body'}, //这个只接收一个对象，way是指查找的方式，name是指target名称
//     event : 'click', //时间类型
//     handle : function(tar) { //参数tar为当前的操作对象，这个函数需要最终返回一个对象，作为ajax的data
//         //tar为里面返回的当前的点击对象
//         var data = null,
//             index = tar.getAttribute('data-index'),
//             rtime = 41235124351;
//         data = {'index' : index, 'rtime' : rtime};
//         //最后返回要上报的数据(ajax的data)
//         return data;
//     }
// },{
//     //如果进入页面就触发
//     url : '',
//     domready : true, //进入页面就上报
//     handle : function() {
//         //tar为里面返回的当前的点击对象
//         var data = null,
//             rtime = 0987654321,
//             page = 'page1';
//         data = {'page' : page, 'rtime' : rtime};
//         //最后返回要上报的数据(ajax的data)
//         return data;
//     }
// }]);
(function(param){
    var defaultParam = { //默认的配置参数（如果有某些参数没有传入直接走默认的）
        domready : false, //是否进页面就上报
        url : '', //请求的地址
        target : {}, //监控的区域
        event : 'click', //事件（绑定很多事件）
        handle : null //回调函数
    },
    _object = {},
    doc = window.document,
    elements = [],
    //判断数据类型
    typeFn = function(type){
        return function(obj) {
            return _object.toString.call(obj) == "[object " + type + "]";
        }
    }
    //工具函数
    tooles = {
        //操作class
        classControl : {
            //判断是否含有class
            hasClass : function hasClass(obj, cls){
                var obj_class = obj.className,//获取 class 内容.
                    obj_class_lst = obj_class.split(/\s+/),//通过split空字符将cls转换成数组.
                    x = 0;
                for(x in obj_class_lst) {
                    if(obj_class_lst[x] == cls) {//循环数组, 判断是否包含cls
                        return true;
                    }
                }
                return false;
            }
        },
        //updata 查找方式直接命中，修改通过特殊标识查找的方式
        //dom 查找
        findDom : {
            byId : function(target){
                elements.push(doc.getElementById(target));
                return elements;
            },
            byTagName : function(target){
                return doc.getElementsByTagName(target);
            },
            byClassName : function(target){
                if(doc.getElementsByClassName){
                    return doc.getElementsByClassName(target);
                }else { //如果该浏览器不支持className
                    var $body = doc.getElementsByTagName('body')[0],
                            children = $body.getElementsByTagName('*'); //查找所有的元素

                    for (var i = 0, l = children.length; i < l; i++) {
                        //如果元素上含有class的名字就push到elements数组里面
                        if(tooles.classControl.hasClass(children[i],target)) {
                            elements.push(children[i]);
                        }
                    }
                    return elements;
                }
            }
        },
        //调用typeFn判断
        type : {
            //判断数组
            isArray : typeFn('Array'),
            //判断对象
            isObject : typeFn('Object'),
            //空对象
            isPlainObject: function (obj) {
                //首先应该判断目标是否为对象
                if(tools.type.isObject(obj)){
                    return false;
                }
                for (var n in obj) {
                    return false;
                }
                return true;
            },
            isFunction : typeFn('Function'),
            isString : typeFn('String')
        },
        //合并对象
        extend: function () {
            var options, name, src, copy, copyIsArray, clone,
                    target = arguments[0] || {},
                    i = 1,
                    length = arguments.length,
                    deep = false;

            // Handle a deep copy situation
            if (typeof target === "boolean") {
                deep = target;

                // skip the boolean and the target
                target = arguments[i] || {};
                i++;
            }

            // Handle case when target is a string or something (possible in deep copy)
            if (typeof target !== "object" && tooles.type.isFunction(target)) {
                target = {};
            }

            // extend $T itself if only one argument is passed
            if (i === length) {
                target = this;
                i--;
            }

            for (; i < length; i++) {
                // Only deal with non-null/undefined values
                if ((options = arguments[i]) !== null) {
                    // Extend the base object
                    for (name in options) {
                        src = target[name];
                        copy = options[name];

                        // Prevent never-ending loop
                        if (target === copy) {
                            continue;
                        }

                        // Recurse if we're merging plain objects or arrays
                        if (deep && copy && (tooles.type.isPlainObject(copy) || (copyIsArray = tooles.type.isArray(copy)))) {
                            if (copyIsArray) {
                                copyIsArray = false;
                                clone = src && tooles.type.isArray(src) ? src : [];
                            } else {
                                clone = src && tooles.type.isPlainObject(src) ? src : {};
                            }

                            // Never move original objects, clone them
                            target[name] = tooles.extend(deep, clone, copy);

                            // Don't bring in undefined values
                        } else if (copy !== undefined) {
                            target[name] = copy;
                        }
                    }
                }
            }

            // Return the modified object
            return target;
        },
        //创建js加载
        addScriptTag : function (src){
            var script = document.createElement('script');
            script.setAttribute("type","text/javascript");
            script.src = src;
            document.body.appendChild(script);
        },
        //这个是数据上报的回调函数
        callback : function (data) {
            //console.log(data);
        },
        //添加事件
        addEvent : function(tar,event,fn){
            tar.attachEvent ? tar.attachEvent('on'+event,fn) : tar.addEventListener(event,fn,false);
            return tar;
        }
    },
    //主要的逻辑
    domReady = function(param){
        //类型判断
        if (param && tooles.type.isObject(param)) {
            var target = param.target,
                handle = param.handle;
            //如果进入页面的时候就上报数据
            if(param.domready){
                var data = param.handle(),
                    urlParam = '';
                for(i in data) {
                    urlParam += ''+ i +'='+ data[i] +'&';
                }
                //tooles.addScriptTag(""+ param.url +"?"+ urlParam +"callback=tooles.callback");

            }else {
                //1.得到参数并判断其合法性
                if(target && tooles.type.isObject(target) && tooles.type.isFunction(handle)) {
                    //var wrap = tooles.findDom(target);
                    var theWay = target.way || '',
                        target = target.name || '',
                        wrap = tooles.findDom[theWay](target);

                    for(var j = 0,len = wrap.length,item; j < len; j++){

                        tooles.addEvent(wrap[j],param.event,function(event){
                            //从这个外框开始阻止冒泡
                            event.stopPropagation();

                            item = event.target;
                            var term = null;
                            //这里做一个拦截，如果是a标签就找一层父级对象
                            if(item.nodeName === 'A') {
                                var par = null;
                                term = tooles.classControl.hasClass(item.parentNode,'trance');
                            }else {
                                term = tooles.classControl.hasClass(item,'trance');
                            }
                            if(term){
                                var data = handle(item); //这个是上报数据需要的data参数
                                link = tooles.type.isString(param.url) ? param.url : '';

                                if(tooles.type.isObject(data)) { //如果handle返回的是一个对象
                                    var urlParam = '';
                                    for(i in data) {
                                        urlParam += ''+ i +'='+ data[i] +'&';
                                    }
                                    alert(urlParam);
                                    //tooles.addScriptTag(""+ link +"?"+ urlParam +"callback=tooles.callback");
                                }
                            }
                        });

                    }
                }
            }
        };
    },
    //这个函数是入口函数,处理参数传入domReady
    init = function(arr){
        for(var i = 0,len = arr.length, resultParam; i < len; i++){
            resultParam = tooles.extend({},defaultParam,arr[i]);
            domReady(resultParam);
        }
    };

    //传入的参数（每一个对象是一组要监控的内容）
    window.TRANCE = init;

})();