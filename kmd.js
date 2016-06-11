/* kmdjs Kill Module Definition 0.1.0
 * By dntzhang(����)
 * Github: https://github.com/kmdjs/kmdjs
 * MIT Licensed.
 */
var kmdjs = {};
kmdjs.setting = null;
kmdjs.loadedScript = 0;
kmdjs.moduleCount = 0;
kmdjs.buildEnd = null;
kmdjs.factories = [];

(function() {

    var JSLoader = {};
    JSLoader.cache = {};
    JSLoader.mapping = {};

    JSLoader.get = function (url, callback) {
        if (!JSLoader.mapping[url]) {
            JSLoader.mapping[url] = [];
        }
        callback && JSLoader.mapping[url].push(callback);

        if (JSLoader.cache[url]) {
            if (JSLoader.cache[url].state === 'done') {
                JSLoader.exec(url);
            }
            return;
        }

        JSLoader.cache[url] = {};
        JSLoader.cache[url].state = 'loading';

        var script = document.createElement("script");
        script.type = "text/javascript";

        if("onload" in script){
            script.onload = onload;
        }else {
            script.onreadystatechange = function() {
                if (/loaded|complete/.test(script.readyState)) {
                    onload()
                }
            }
        }

        function onload() {
            JSLoader.cache[url].state = 'done';
            JSLoader.exec(url);

            script.onload = script.onreadystatechange = null;
            document.body.removeChild(script);
            script= null;
        }

        script.src = url;
        document.body.appendChild(script);
    };

    JSLoader.exec = function (url) {
        var callbacks = JSLoader.mapping[url];
        while (callbacks.length) {
            callbacks.shift()();
        }
    };

    JSLoader.getByUrls = function (urls, callback) {
        var loadedCount=0;
        for(var i= 0,len= urls.length;i<len;i++){
            JSLoader.get(urls[i],function(){
                loadedCount++;
                if(loadedCount===len){
                    callback&&callback();
                }
            })
        }
    };
    kmdjs.define = function (namespace, deps, factory) {
        kmdjs.loadedScript ++;
        var argLen = arguments.length;
        if (argLen === 2) {
            kmdjs.factories.push([namespace,[], deps]);
        } else {
            kmdjs.factories.push([namespace, deps, factory]);
            var len = deps.length;
            var urls = [],
                i = 0;
            for (; i < len; i++) {
                urls.push(kmdjs.setting[deps[i]]);
            }
            JSLoader.getByUrls(urls)
        }
       if(kmdjs.loadedScript === kmdjs.moduleCount){
           eval(buildBundler());
        }
    };

    function buildBundler(){
        var topNsStr = "";
        each(kmdjs.factories, function (item) {
            var arr = nsToCode(item[0]);
            topNsStr+= arr+'\n';
        });
        topNsStr+="\n";
        each(kmdjs.factories, function (item) {
            topNsStr+=item[0]+' = ('+item[2]+')();\n\n' ;
        });
        if(kmdjs.buildEnd) kmdjs.buildEnd(topNsStr);
        return topNsStr;
    }

    function each(array, action) {
        for (var i = array.length - 1; i > -1; i--) {
            var result = action(array[i],i);
            if (result === false) break;
        }
    }
    function nsToCode(ns) {
        var result = [];
        var nsSplitArr = ns.split(".");
        result.push("var " + nsSplitArr[0] + "={};");
        for (var i = 1; i < nsSplitArr.length -1; i++) {
            var str = nsSplitArr[0];
            for (var j = 1; j < i + 1; j++) str += "." + nsSplitArr[j];
            result.push(str + "={};");
        }
        return result;
    }

    kmdjs.main = function (callback) {
        JSLoader.get(kmdjs.setting['main'])
        kmdjs.buildEnd = callback;
    };

    kmdjs.config = function (setting) {
        kmdjs.setting = setting;
        kmdjs.moduleCount = 0;
        for(var prop in kmdjs.setting){
            if(kmdjs.setting.hasOwnProperty(prop)) {
                kmdjs.moduleCount++;
            }
        }
    }
})();