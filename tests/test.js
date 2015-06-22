var expect = require('expect.js');
var fs = require('fs');
var path = require('path');

var jaw = require('../');

describe('api', function() {
  it('#parse', function() {
    expect(jaw.parse).to.be.a(Function);
  });
  it('tokens', function() {
    jaw.parse('');
    expect(jaw.tokens).to.be.a(Array);
  });
  it('ast', function() {
    jaw.parse('');
    expect(jaw.ast).to.be.a(Object);
  });
});

describe('simple', function() {
  it('none', function() {
    var s = '';
    var res = jaw.parse(s);
    expect(res).to.eql({});
  });
  it('empty', function() {
    var s = 'a{}';
    var res = jaw.parse(s);
    expect(res).to.eql({"a":{"_v":[],"_p":1}});
  });
  it('single', function() {
    var s = 'a{color:#F00}';
    var res = jaw.parse(s);
    expect(res).to.eql({"a":{"_v":[[0,"color:#F00"]],"_p":1}});
  });
  it('repeat', function() {
    var s = 'a{color:#F00}a{margin:0}';
    var res = jaw.parse(s);
    expect(res).to.eql({"a":{"_v":[[0,"color:#F00"],[1,"margin:0"]],"_p":1}});
  });
  it('double', function() {
    var s = 'a{color:#F00}div{margin:0}';
    var res = jaw.parse(s);
    expect(res).to.eql({"a":{"_v":[[0,"color:#F00"]],"_p":1},"div":{"_v":[[1,"margin:0"]],"_p":1}});
  });
  it('insert blank', function() {
    var s = 'a{color:#F00}div{}a{margin:0}';
    var res = jaw.parse(s);
    expect(res).to.eql({"a":{"_v":[[0,"color:#F00"],[2,"margin:0"]],"_p":1},"div":{"_v":[],"_p":1}});
  });
  it('multi css', function() {
    var s = 'a{color:#F00;padding:0}';
    var res = jaw.parse(s);
    expect(res).to.eql({"a":{"_v":[[0,"color:#F00"],[0,"padding:0"]],"_p":1}});
  });
  it('nest', function() {
    var s = 'div a{margin:0}';
    var res = jaw.parse(s);
    expect(res).to.eql({"a":{"div":{"_v":[[0,"margin:0"]],"_p":2}},"_d":1});
  });
  it('nest with single', function() {
    var s = 'div a{margin:0}a{padding:0}';
    var res = jaw.parse(s);
    expect(res).to.eql({"a":{"div":{"_v":[[0,"margin:0"]],"_p":2},"_v":[[1,"padding:0"]],"_p":1},"_d":1});
  });
  it('repeat nest', function() {
    var s = 'div a{margin:0}div a{padding:0}';
    var res = jaw.parse(s);
    expect(res).to.eql({"a":{"div":{"_v":[[0,"margin:0"],[1,"padding:0"]],"_p":2}},"_d":1});
  });
  it('double nest', function() {
    var s = 'div a{margin:0}div span{padding:0}';
    var res = jaw.parse(s);
    expect(res).to.eql({"a":{"div":{"_v":[[0,"margin:0"]],"_p":2}},"span":{"div":{"_v":[[1,"padding:0"]],"_p":2}},"_d":1});
  });
  it('#id', function() {
    var s = '#id{margin:0}';
    var res = jaw.parse(s);
    expect(res).to.eql({"#id":{"_v":[[0,"margin:0"]],"_p":100}});
  });
  it('.class', function() {
    var s = '.c{margin:0}';
    var res = jaw.parse(s);
    expect(res).to.eql({".c":{"_v":[[0,"margin:0"]],"_p":10}});
  });
  it('nest .class', function() {
    var s = '.b .c{margin:0}';
    var res = jaw.parse(s);
    expect(res).to.eql({".c":{".b":{"_v":[[0,"margin:0"]],"_p":20}},"_d":1});
  });
  it('multi .class', function() {
    var s = '.b.a.c{margin:0}';
    var res = jaw.parse(s);
    expect(res).to.eql({".c.b.a":{"_v":[[0,"margin:0"]],"_p":30}});
  });
  it('long .class', function() {
    var s = '.g.d.a.t.v.x.c.q.u.i{margin:0}';
    var res = jaw.parse(s);
    expect(res).to.eql({".x.v.u.t.q.i.g.d.c.a":{"_v":[[0,"margin:0"]],"_p":100}});
  });
  it('combo', function() {
    var s = 'div.test#id{margin:0}';
    var res = jaw.parse(s);
    expect(res).to.eql({"div.test#id":{"_v":[[0,"margin:0"]],"_p":111}});
  });
  it('combo sort', function() {
    var s = 'div#id.test{margin:0}';
    var res = jaw.parse(s);
    expect(res).to.eql({"div.test#id":{"_v":[[0,"margin:0"]],"_p":111}});
  });
  it('long nest', function() {
    var s = 'body .test #id div a{margin:0}';
    var res = jaw.parse(s);
    expect(res).to.eql({"a":{"div":{"#id":{".test":{"body":{"_v":[[0,"margin:0"]],"_p":113}},"_d":1},"_d":2},"_d":3},"_d":4});
  });
  it('*', function() {
    var s = '*{margin:0}';
    var res = jaw.parse(s);
    expect(res).to.eql({"*":{"_v":[[0,"margin:0"]],"_p":1}});
  });
  it('nest *', function() {
    var s = 'div *{margin:0}';
    var res = jaw.parse(s);
    expect(res).to.eql({"*":{"div":{"_v":[[0,"margin:0"]],"_p":2}},"_d":1});
  });
  it(',', function() {
    var s = 'div,a{margin:0}';
    var res = jaw.parse(s);
    expect(res).to.eql({"div":{"_v":[[0,"margin:0"]],"_p":1},"a":{"_v":[[0,"margin:0"]],"_p":1}});
  });
});

describe(':pseudo', function() {
  it(':hover', function() {
    var s = 'a:hover{margin:0}';
    var res = jaw.parse(s);
    expect(res).to.eql({"a":{"_:":[[["hover"],{"_v":[[0,"margin:0"]],"_p":2}]]}});
  });
  it('double', function() {
    var s = 'a:hover:active{margin:0}';
    var res = jaw.parse(s);
    expect(res).to.eql({"a":{"_:":[[["hover","active"],{"_v":[[0,"margin:0"]],"_p":3}]]}});
  });
  it('repeat', function() {
    var s = 'a:hover{margin:0}a:hover{padding:0}';
    var res = jaw.parse(s);
    expect(res).to.eql({"a":{"_:":[[["hover"],{"_v":[[0,"margin:0"],[1,"padding:0"]],"_p":2}]]}});
  });
  it('no tagname', function() {
    var s = ':hover{margin:0}';
    var res = jaw.parse(s);
    expect(res).to.eql({"*":{"_:":[[["hover"],{"_v":[[0,"margin:0"]],"_p":1}]]}});
  });
  it('*', function() {
    var s = '*:hover{margin:0}';
    var res = jaw.parse(s);
    expect(res).to.eql({"*":{"_:":[[["hover"],{"_v":[[0,"margin:0"]],"_p":2}]]}});
  });
  it(',', function() {
    var s = 'a:hover,div:hover{margin:0}';
    var res = jaw.parse(s);
    expect(res).to.eql({"a":{"_:":[[["hover"],{"_v":[[0,"margin:0"]],"_p":2}]]},"div":{"_:":[[["hover"],{"_v":[[0,"margin:0"]],"_p":2}]]}});
  });
  it('multi', function() {
    var s = 'a:hover:first-child:last-child{margin:0}';
    var res = jaw.parse(s);
    expect(res).to.eql({"a":{"_:":[[["last-child","hover","first-child"],{"_v":[[0,"margin:0"]],"_p":4}]]}});
  });
  it('long', function() {
    var s = 'div p a:hover{margin:0}';
    var res = jaw.parse(s);
    expect(res).to.eql({"a":{"_:":[[["hover"],{"p":{"div":{"_v":[[0,"margin:0"]],"_p":4}},"_d":1}]]}});
  });
});

describe('attr', function() {
  it('single', function() {
    var s = 'a[href="#"]{margin:0}';
    var res = jaw.parse(s);
    expect(res).to.eql({"a":{"_[":[[[["href","=","#"]],{"_v":[[0,"margin:0"]],"_p":11}]]}});
  });
  it('multi', function() {
    var s = 'a[href="#"][title="123"]{margin:0}';
    var res = jaw.parse(s);
    expect(res).to.eql({"a":{"_[":[[[["title","=","123"],["href","=","#"]],{"_v":[[0,"margin:0"]],"_p":21}]]}});
  });
  it('repeat', function() {
    var s = 'a[href="#"]{margin:0}a[href="#"]{padding:0}';
    var res = jaw.parse(s);
    expect(res).to.eql({"a":{"_[":[[[["href","=","#"]],{"_v":[[0,"margin:0"],[1,"padding:0"]],"_p":11}]]}});
  });
  it('*', function() {
    var s = '*[href="#"]{margin:0}';
    var res = jaw.parse(s);
    expect(res).to.eql({"*":{"_[":[[[["href","=","#"]],{"_v":[[0,"margin:0"]],"_p":11}]]}});
  });
  it('no tagname', function() {
    var s = '[href="#"]{margin:0}';
    var res = jaw.parse(s);
    expect(res).to.eql({"*":{"_[":[[[["href","=","#"]],{"_v":[[0,"margin:0"]],"_p":10}]]}});
  });
  it(',', function() {
    var s = 'a[href="#"],div[href="#"]{margin:0}';
    var res = jaw.parse(s);
    expect(res).to.eql({"a":{"_[":[[[["href","=","#"]],{"_v":[[0,"margin:0"]],"_p":11}]]},"div":{"_[":[[[["href","=","#"]],{"_v":[[0,"margin:0"]],"_p":11}]]}});
  });
  it('$=', function() {
    var s = 'a[href$="#"]{margin:0}';
    var res = jaw.parse(s);
    expect(res).to.eql({"a":{"_[":[[[["href","$=","#"]],{"_v":[[0,"margin:0"]],"_p":11}]]}});
  });
  it('long', function() {
    var s = 'div p a[href$="#"]{margin:0}';
    var res = jaw.parse(s);
    expect(res).to.eql({"a":{"_[":[[[["href","$=","#"]],{"p":{"div":{"_v":[[0,"margin:0"]],"_p":13}},"_d":1}]]}});
  });
});

describe('relation', function() {
  it('single', function() {
    var s = 'a+div{margin:0}';
    var res = jaw.parse(s);
    expect(res).to.eql({"div":{"_+":{"a":{"_v":[[0,"margin:0"]],"_p":2}}}});
  });
  it('double', function() {
    var s = '.c~.d,a+div{margin:0}';
    var res = jaw.parse(s);
    expect(res).to.eql({".d":{"_~":{".c":{"_v":[[0,"margin:0"]],"_p":20}}},"div":{"_+":{"a":{"_v":[[0,"margin:0"]],"_p":2}}}});
  });
  it('repeat', function() {
    var s = '.c~.d{margin:0}.c~.d{padding:0}';
    var res = jaw.parse(s);
    expect(res).to.eql({".d":{"_~":{".c":{"_v":[[0,"margin:0"],[1,"padding:0"]],"_p":20}}}});
  });
  it('*', function() {
    var s = '*+div{margin:0}';
    var res = jaw.parse(s);
    expect(res).to.eql({"div":{"_+":{"*":{"_v":[[0,"margin:0"]],"_p":2}}}});
  });
  it('multi', function() {
    var s = 'a+div>.c~span{margin:0}';
    var res = jaw.parse(s);
    expect(res).to.eql({"span":{"_~":{".c":{"_>":{"div":{"_+":{"a":{"_v":[[0,"margin:0"]],"_p":13}}}}}}}});
  });
});

describe('join', function() {
  it('simple', function() {
    var s = 'a{ margin:0; padding:0;\n}';
    var res = jaw.parse(s);
    expect(res).to.eql({"a":{"_v":[[0,"margin:0"],[0,"padding:0"]],"_p":1}});
  });
});