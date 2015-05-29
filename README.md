# Parasitize CSS into JSX for migi

`jaw`取自动漫寄生兽中寄生于下巴上的Parasite，意指将css寄生在jsx上。

## INSTALL
```
npm install jaw
```

[![logo](https://raw.githubusercontent.com/migijs/jaw/master/logo.jpg)](https://github.com/migijs/jaw)

## 文档
https://github.com/migijs/jaw/wiki/%E6%96%87%E6%A1%A3

## API
* parse(code:String):Object 传入要解析的css代码，返回格式化好的json对象
* tokens():Array<Token> 返回css的token列表
* ast():Object 返回css的语法树

## Demo
* demo目录下是一个web端的实时转换例子，本地浏览需要`npm install`安装依赖
* 依赖的语法解析器来自于`homunculus`：https://github.com/army8735/homunculus
* 在线地址：http://army8735.me/migijs/jaw/demo/

# License
[MIT License]
