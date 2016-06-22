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
    if (!js_tpl) {
        console.error("astro-js-tpl",
            '请在项目配置中设置模板格式，如："$tpl({name},{file},{content})"，具体请参看 https://github.com/lemonabc/astros-js-tpl');
        next(asset);
        return;
    }
    // let matches;
    // if (!asset.prjCfg['_astro-js-tpl']) {
    //     matches = {
    //         names: []
    //     };

    //     matches.regexp = new RegExp(js_tpl.replace(/\{([^}]*)\}/ig, function(a, b) {
    //         matches.names.push(b)
    //         return '(.*?)';
    //     }).replace(/[$.()^\[\]]/ig, function(a) {
    //         return '\\' + a;
    //     }), 'ig');
    //     asset.prjCfg['_astro-js-tpl'] = matches;
    // } else {
    //     matches = asset.prjCfg['_astro-js-tpl']
    // }



    let tpls = [],
        self = this,
        jsLibs = asset.jsLibs[1],
        project = asset.project,
        imported = {},      // 已引用的模板
        manutalTpl = [],    // 手动引用的模板
        tpl_assets = [];    // 模板asset对象

    asset.data.replace(/\$tpl_require\('(.*?)'\)/ig, function(a, b) {
        manutalTpl.push(b);
    });

    if (manutalTpl.length) {
        manutalTpl.forEach(function(h) {
            let filePath = path.join(asset.prjCfg.jsCom, h + '.' + asset.prjCfg.htmlExt);
            if (!fs.existsSync(filePath)) {
                return;
            } else {
                tpl_assets.push(new astro.Asset({
                    modType: 'jsCom',
                    name: h,
                    fileType: 'html',
                    filePath: filePath
                }));
            }
        });
    }

    jsLibs.forEach(function(cpt) {
        var filePath = path.join(asset.prjCfg.jsCom, cpt);
        if (!fs.existsSync(filePath)) {
            return;
        }
        var fileList = file.getAllFilesSync(filePath, ['.' + asset.prjCfg.htmlExt]);
        fileList.forEach(function(file) {
            var content = fs.readFileSync(file, 'utf-8');

            var a = new astro.Asset({
                modType: 'jsCom',
                name: cpt+'/'+ path.basename(file, '.' + asset.prjCfg.htmlExt),
                fileType: 'html',
            });
            a.filePath = file;
            tpl_assets.push(a)
        });
    });

    if (tpl_assets.length) {
        astro.Asset.getContents(tpl_assets, function(asts) {
            asts.forEach(function(a) {
                if(imported[a.name]){
                    return
                }
                imported[a.name] = true;
                var content = a.data;
                if (content) {
                    content = content.trim();
                    content = content.replace(/\s*\n\s*/g, '');
                    content = JSON.stringify(content)
                        .replace(/^['"]|['"]$/g, '')
                        .replace(/'/g, '\\\'');
                    var fileName = path.basename(a.filePath, '.' + asset.prjCfg.htmlExt);
                    //var com = `$res.${js}.${fileName}=${content};\n`;

                    tpls.push(js_tpl.replace(/\{name\}/g, a.name)
                        // .replace(/\{file\}/g, fileName)
                        .replace(/\{content\}/g, content));
                }
            });
            tpls.push('');

            asset.data = (self.config.define?self.config.define+'\n\n': '') + tpls.join(';\n')+ '\n' + asset.data;
            next(asset);

        });
    } else {
        next(asset);
    }

});