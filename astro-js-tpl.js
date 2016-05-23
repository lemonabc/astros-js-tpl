'use strict';

var url = require('url');
var path = require('path');
var fs = require('fs');
var file = require('file-plus');
var nodeUtil = require('util');

var util = require('lang-utils');

module.exports = new astro.Middleware({
    modType: 'page',
    fileType: 'js'
}, function(asset, next) {
    var js_tpl = asset.prjCfg.jsTpl || this.config.tpl;
    if(!js_tpl){
        console.error("astro-js-tpl", 
            '请在项目配置中设置，如："$addRes({name},{file},{content})"')
        next(asset);
        return;
    }
    if(!asset.jsLibs.length){
        next(asset);
        return;
    }
    let jsLibs = asset.jsLibs[1],
        project = asset.project,
        tpls = '';
    jsLibs.forEach(function(cpt) {

        var filePath = path.join(asset.prjCfg.jsCom, cpt);
        if(!fs.existsSync(filePath)){
            return;
        }
        var fileList = file.getAllFilesSync(filePath, 
                ['.'+asset.prjCfg.htmlExt]);
        fileList.forEach(function(file){
            var content = fs.readFileSync(file,'utf-8');
            if(content){
                content = content.trim();
                content = content.replace(/\s*\n\s*/g,'');
                content = JSON.stringify(content)
                            .replace(/^['"]|['"]$/g,'')
                            .replace(/'/g,'\\\'');
                var fileName = path.basename(file,'.'+asset.prjCfg.htmlExt);
                //var com = `$res.${js}.${fileName}=${content};\n`;

                tpls = js_tpl.replace(/\{name\}/g, cpt)
                        .replace(/\{file\}/g, fileName)
                        .replace(/\{content\}/g, content)+'\n' + tpls;
            }
        })
            
    });
    asset.data = tpls + asset.data;
    next(asset);
});