# astro js模版中间件

  实现js模板自动加载机制

## Installation

```bash
$ npm install astro-js-tpl
```

## Usage

中间件自动搜索js目录下的模板文件。以以下代码插入到js文件最上部。

    $addRes('{jsname}.{tplname}',{content});
    
此方法已在mojs种子内实现，如果不用mojs，需要自己实现此方法或替换插入形式。

