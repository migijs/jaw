# Parasitize CSS into JSX for migi

`jaw`取自动漫寄生兽中寄生于下巴上的Parasite，意指将css寄生在jsx上。

[![NPM version](https://badge.fury.io/js/jaw.png)](https://npmjs.org/package/jaw)
[![Build Status](https://travis-ci.org/migijs/jaw.svg?branch=master)](https://travis-ci.org/migijs/jaw)
[![Coverage Status](https://coveralls.io/repos/migijs/jaw/badge.png)](https://coveralls.io/r/migijs/jaw)
[![Dependency Status](https://david-dm.org/migijs/jaw.png)](https://david-dm.org/migijs/jaw)

## INSTALL
```
npm install jaw
```

[![logo](https://raw.githubusercontent.com/migijs/jaw/master/logo.jpg)](https://github.com/migijs/jaw)

## 文档
https://github.com/migijs/jaw/wiki/%E6%96%87%E6%A1%A3

## API
* parse(code:String, option:Object):JSON 传入要解析的css代码，返回格式化好的json对象，option参数如下
 * noMedia:Boolean 无需default和media键，即没有media query逻辑，如事件代理使用
 * noValaue:Boolean 无需值，在有值的时候_v字段仅为true，如事件代理使用
 * noPriority:Boolean 无需优先级，json中没有_p字段
* tokens():Array\<Token> 返回css的token列表
* ast():Object 返回css的语法树

## Demo
* demo目录下是一个web端的实时转换例子，本地浏览需要`npm install`安装依赖
* 依赖的语法解析器来自于`homunculus`：https://github.com/army8735/homunculus
* 在线地址：http://army8735.me/migijs/jaw/demo/

# License
[MIT License]
