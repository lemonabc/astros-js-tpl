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
    if(!asset.prjCfg.jsTpl){
        console.error("astro-js-tpl", 
            '请在项目配置中设置jsTpl，如："$addRes(\'{name}\',\'{file}\',\'{content}\')"')
        next(asset);
        return;
    }
    if(!asset.jsLibs.length){
        next(asset);
    }
    let jsLibs = asset.jsLibs[1],
        project = asset.project,
        tpls = '';
    jsLibs.forEach(function(cpt) {
        var filePath = path.join(asset.prjCfg.jsCom,cpt);
        var fileList = file.getAllFilesSync(filePath,['.'+asset.prjCfg.htmlExt]);
        fileList.forEach(function(file){
            var content = fs.readFileSync(file,'utf-8');
            content = content.trim();
            content = content.replace(/\s*\n\s*/g,'');
            content = JSON.stringify(content);
            if(content != ''){
                var fileName = path.basename(file,'.'+asset.prjCfg.htmlExt);
                //var com = `$res.${js}.${fileName}=${content};\n`;

                tpls = asset.prjCfg.jsTpl.replace('{name}', cpt)
                        .replace('{file}', fileName)
                        .replace('{content}', content)+'\n' + tpls;
            }
        })
            
    });
    asset.data = tpls + asset.data;
    next(asset);
});