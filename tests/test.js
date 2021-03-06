var expect = require('expect.js');
var fs = require('fs');
var path = require('path');

var jaw = require('../');

describe('api', function() {
  it('#parse', function() {
    expect(jaw.parse).to.be.a(Function);
  });
});

describe('simple', function() {
  it('none', function() {
    var s = '';
    var res = jaw.parse(s);
    expect(res).to.eql({"default":{}});
  });
  it('empty', function() {
    var s = 'a{}';
    var res = jaw.parse(s);
    expect(res).to.eql({"default":{"a":{"_v":[],"_p":[0,0,1]}}});
  });
  it('single', function() {
    var s = 'a{color:#F00}';
    var res = jaw.parse(s);
    expect(res).to.eql({"default":{"a":{"_v":[[0,"color:#F00"]],"_p":[0,0,1]}}});
  });
  it('repeat', function() {
    var s = 'a{color:#F00}a{margin:0}';
    var res = jaw.parse(s);
    expect(res).to.eql({"default":{"a":{"_v":[[0,"color:#F00"],[1,"margin:0"]],"_p":[0,0,1]}}});
  });
  it('double', function() {
    var s = 'a{color:#F00}div{margin:0}';
    var res = jaw.parse(s);
    expect(res).to.eql({"default":{"a":{"_v":[[0,"color:#F00"]],"_p":[0,0,1]},"div":{"_v":[[1,"margin:0"]],"_p":[0,0,1]}}});
  });
  it('insert blank', function() {
    var s = 'a{color:#F00}div{}a{margin:0}';
    var res = jaw.parse(s);
    expect(res).to.eql({"default":{"a":{"_v":[[0,"color:#F00"],[2,"margin:0"]],"_p":[0,0,1]},"div":{"_v":[],"_p":[0,0,1]}}});
  });
  it('multi css', function() {
    var s = 'a{color:#F00;padding:0}';
    var res = jaw.parse(s);
    expect(res).to.eql({"default":{"a":{"_v":[[0,"color:#F00"],[0,"padding:0"]],"_p":[0,0,1]}}});
  });
  it('nest', function() {
    var s = 'div a{margin:0}';
    var res = jaw.parse(s);
    expect(res).to.eql({"default":{"a":{"div":{"_v":[[0,"margin:0"]],"_p":[0,0,2]}}}});
  });
  it('nest with single', function() {
    var s = 'div a{margin:0}a{padding:0}';
    var res = jaw.parse(s);
    expect(res).to.eql({"default":{"a":{"div":{"_v":[[0,"margin:0"]],"_p":[0,0,2]},"_v":[[1,"padding:0"]],"_p":[0,0,1]}}});
  });
  it('repeat nest', function() {
    var s = 'div a{margin:0}div a{padding:0}';
    var res = jaw.parse(s);
    expect(res).to.eql({"default":{"a":{"div":{"_v":[[0,"margin:0"],[1,"padding:0"]],"_p":[0,0,2]}}}});
  });
  it('double nest', function() {
    var s = 'div a{margin:0}div span{padding:0}';
    var res = jaw.parse(s);
    expect(res).to.eql({"default":{"a":{"div":{"_v":[[0,"margin:0"]],"_p":[0,0,2]}},"span":{"div":{"_v":[[1,"padding:0"]],"_p":[0,0,2]}}}});
  });
  it('#id', function() {
    var s = '#id{margin:0}';
    var res = jaw.parse(s);
    expect(res).to.eql({"default":{"#id":{"_v":[[0,"margin:0"]],"_p":[1,0,0]}}});
  });
  it('.class', function() {
    var s = '.c{margin:0}';
    var res = jaw.parse(s);
    expect(res).to.eql({"default":{".c":{"_v":[[0,"margin:0"]],"_p":[0,1,0]}}});
  });
  it('nest .class', function() {
    var s = '.b .c{margin:0}';
    var res = jaw.parse(s);
    expect(res).to.eql({"default":{".c":{".b":{"_v":[[0,"margin:0"]],"_p":[0,2,0]}}}});
  });
  it('multi .class', function() {
    var s = '.b.a.c{margin:0}';
    var res = jaw.parse(s);
    expect(res).to.eql({"default":{".c.b.a":{"_v":[[0,"margin:0"]],"_p":[0,3,0]}}});
  });
  it('long .class', function() {
    var s = '.g.d.a.t.v.x.c.q.u.i{margin:0}';
    var res = jaw.parse(s);
    expect(res).to.eql({"default":{".x.v.u.t.q.i.g.d.c.a":{"_v":[[0,"margin:0"]],"_p":[0,10,0]}}});
  });
  it('combo', function() {
    var s = 'div.test#id{margin:0}';
    var res = jaw.parse(s);
    expect(res).to.eql({"default":{"div.test#id":{"_v":[[0,"margin:0"]],"_p":[1,1,1]}}});
  });
  it('combo sort', function() {
    var s = 'div#id.test{margin:0}';
    var res = jaw.parse(s);
    expect(res).to.eql({"default":{"div.test#id":{"_v":[[0,"margin:0"]],"_p":[1,1,1]}}});
  });
  it('long nest', function() {
    var s = 'body .test #id div a{margin:0}';
    var res = jaw.parse(s);
    expect(res).to.eql({"default":{"a":{"div":{"#id":{".test":{"body":{"_v":[[0,"margin:0"]],"_p":[1,1,3]}}}}}}});
  });
  it('*', function() {
    var s = '*{margin:0}';
    var res = jaw.parse(s);
    expect(res).to.eql({"default":{"_*":true,"*":{"_v":[[0,"margin:0"]],"_p":[0,0,1]}}});
  });
  it('nest *', function() {
    var s = 'div *{margin:0}';
    var res = jaw.parse(s);
    expect(res).to.eql({"default":{"_*":true,"*":{"div":{"_v":[[0,"margin:0"]],"_p":[0,0,2]}}}});
  });
  it(',', function() {
    var s = 'div,a{margin:0}';
    var res = jaw.parse(s);
    expect(res).to.eql({"default":{"div":{"_v":[[0,"margin:0"]],"_p":[0,0,1]},"a":{"_v":[[0,"margin:0"]],"_p":[0,0,1]}}});
  });
  it(',*', function() {
    var s = 'div,*{margin:0}';
    var res = jaw.parse(s);
    expect(res).to.eql({"default":{"div":{"_v":[[0,"margin:0"]],"_p":[0,0,1]},"_*":true,"*":{"_v":[[0,"margin:0"]],"_p":[0,0,1]}}});
  });
  it('both tag/class/id', function() {
    var s = '*.a#b{margin:0}';
    var res = jaw.parse(s);
    expect(res).to.eql({"default":{"_*":true,"_*.#":true,"*.a#b":{"_v":[[0,"margin:0"]],"_p":[1,1,1]}}});
  });
  it('*/class', function() {
    var s = '*.a{margin:0}';
    var res = jaw.parse(s);
    expect(res).to.eql({"default":{"_*":true,"_*.":true,"*.a":{"_v":[[0,"margin:0"]],"_p":[0,1,1]}}});
  });
  it('*/id', function() {
    var s = '*#a{margin:0}';
    var res = jaw.parse(s);
    expect(res).to.eql({"default":{"_*":true,"_*#":true,"*#a":{"_v":[[0,"margin:0"]],"_p":[1,0,1]}}});
  });
  it('nest */class', function() {
    var s = 'div *.a{margin:0}';
    var res = jaw.parse(s);
    expect(res).to.eql({"default":{"_*":true,"_*.":true,"*.a":{"div":{"_v":[[0,"margin:0"]],"_p":[0,1,2]}}}});
  });
  it('nest */id', function() {
    var s = 'div *#a{margin:0}';
    var res = jaw.parse(s);
    expect(res).to.eql({"default":{"_*":true,"_*#":true,"*#a":{"div":{"_v":[[0,"margin:0"]],"_p":[1,0,2]}}}});
  });
  it('nest tag/class/id', function() {
    var s = 'div *.a#b{margin:0}';
    var res = jaw.parse(s);
    expect(res).to.eql({"default":{"_*":true,"_*.#":true,"*.a#b":{"div":{"_v":[[0,"margin:0"]],"_p":[1,1,2]}}}});
  });
});

describe(':pseudo', function() {
  it(':hover', function() {
    var s = 'a:hover{margin:0}';
    var res = jaw.parse(s);
    expect(res).to.eql({"default":{"a":{"_:":[[["hover"],{"_v":[[0,"margin:0"]],"_p":[0,0,2]}]]}}});
  });
  it('double', function() {
    var s = 'a:hover:active{margin:0}';
    var res = jaw.parse(s);
    expect(res).to.eql({"default":{"a":{"_:":[[["hover","active"],{"_v":[[0,"margin:0"]],"_p":[0,0,3]}]]}}});
  });
  it('repeat', function() {
    var s = 'a:hover{margin:0}a:hover{padding:0}';
    var res = jaw.parse(s);
    expect(res).to.eql({"default":{"a":{"_:":[[["hover"],{"_v":[[0,"margin:0"],[1,"padding:0"]],"_p":[0,0,2]}]]}}});
  });
  it('no tagname', function() {
    var s = ':hover{margin:0}';
    var res = jaw.parse(s);
    expect(res).to.eql({"default":{"_*":true,"*":{"_:":[[["hover"],{"_v":[[0,"margin:0"]],"_p":[0,0,1]}]]}}});
  });
  it('*', function() {
    var s = '*:hover{margin:0}';
    var res = jaw.parse(s);
    expect(res).to.eql({"default":{"_*":true,"*":{"_:":[[["hover"],{"_v":[[0,"margin:0"]],"_p":[0,0,2]}]]}}});
  });
  it(',', function() {
    var s = 'a:hover,div:hover{margin:0}';
    var res = jaw.parse(s);
    expect(res).to.eql({"default":{"a":{"_:":[[["hover"],{"_v":[[0,"margin:0"]],"_p":[0,0,2]}]]},"div":{"_:":[[["hover"],{"_v":[[0,"margin:0"]],"_p":[0,0,2]}]]}}});
  });
  it('multi', function() {
    var s = 'a:hover:first-child:last-child{margin:0}';
    var res = jaw.parse(s);
    expect(res).to.eql({"default":{"a":{"_:":[[["last-child","hover","first-child"],{"_v":[[0,"margin:0"]],"_p":[0,0,4]}]]}}});
  });
  it('long', function() {
    var s = 'div p a:hover{margin:0}';
    var res = jaw.parse(s);
    expect(res).to.eql({"default":{"a":{"_:":[[["hover"],{"p":{"div":{"_v":[[0,"margin:0"]],"_p":[0,0,4]}}}]]}}});
  });
  it('*.', function() {
    var s = '*.a:hover{margin:0}';
    var res = jaw.parse(s);
    expect(res).to.eql({"default":{"_*":true,"_*.":true,"*.a":{"_:":[[["hover"],{"_v":[[0,"margin:0"]],"_p":[0,1,2]}]]}}});
  });
  it('*#', function() {
    var s = '*#a:hover{margin:0}';
    var res = jaw.parse(s);
    expect(res).to.eql({"default":{"_*":true,"_*#":true,"*#a":{"_:":[[["hover"],{"_v":[[0,"margin:0"]],"_p":[1,0,2]}]]}}});
  });
  it('*.#', function() {
    var s = '*.a#b:hover{margin:0}';
    var res = jaw.parse(s);
    expect(res).to.eql({"default":{"_*":true,"_*.#":true,"*.a#b":{"_:":[[["hover"],{"_v":[[0,"margin:0"]],"_p":[1,1,2]}]]}}});
  });
  it('(n)', function() {
    var s = 'a:nth-of-type(3){}';
    var res = jaw.parse(s);
    expect(res).to.eql({"default":{"a":{"_:":[[["nth-of-type(3)"],{"_v":[],"_p":[0,0,2]}]]}}});
  });
  it('(odd)', function() {
    var s = 'a:nth-of-type(odd){}';
    var res = jaw.parse(s);
    expect(res).to.eql({"default":{"a":{"_:":[[["nth-of-type(odd)"],{"_v":[],"_p":[0,0,2]}]]}}});
  });
  it('(n+)', function() {
    var s = 'a:nth-of-type(2n+1){}';
    var res = jaw.parse(s);
    expect(res).to.eql({"default":{"a":{"_:":[[["nth-of-type(2n+1)"],{"_v":[],"_p":[0,0,2]}]]}}});
  });
});

describe('attr', function() {
  it('single', function() {
    var s = 'a[href="#"]{margin:0}';
    var res = jaw.parse(s);
    expect(res).to.eql({"default":{"a":{"_[":[[[["href","=","#"]],{"_v":[[0,"margin:0"]],"_p":[0,1,1]}]]}}});
  });
  it('multi', function() {
    var s = 'a[href="#"][title="123"]{margin:0}';
    var res = jaw.parse(s);
    expect(res).to.eql({"default":{"a":{"_[":[[[["title","=","123"],["href","=","#"]],{"_v":[[0,"margin:0"]],"_p":[0,2,1]}]]}}});
  });
  it('repeat', function() {
    var s = 'a[href="#"]{margin:0}a[href="#"]{padding:0}';
    var res = jaw.parse(s);
    expect(res).to.eql({"default":{"a":{"_[":[[[["href","=","#"]],{"_v":[[0,"margin:0"],[1,"padding:0"]],"_p":[0,1,1]}]]}}});
  });
  it('*', function() {
    var s = '*[href="#"]{margin:0}';
    var res = jaw.parse(s);
    expect(res).to.eql({"default":{"_*":true,"*":{"_[":[[[["href","=","#"]],{"_v":[[0,"margin:0"]],"_p":[0,1,1]}]]}}});
  });
  it('no tagname', function() {
    var s = '[href="#"]{margin:0}';
    var res = jaw.parse(s);
    expect(res).to.eql({"default":{"_*":true,"*":{"_[":[[[["href","=","#"]],{"_v":[[0,"margin:0"]],"_p":[0,1,0]}]]}}});
  });
  it(',', function() {
    var s = 'a[href="#"],div[href="#"]{margin:0}';
    var res = jaw.parse(s);
    expect(res).to.eql({"default":{"a":{"_[":[[[["href","=","#"]],{"_v":[[0,"margin:0"]],"_p":[0,1,1]}]]},"div":{"_[":[[[["href","=","#"]],{"_v":[[0,"margin:0"]],"_p":[0,1,1]}]]}}});
  });
  it('$=', function() {
    var s = 'a[href$="#"]{margin:0}';
    var res = jaw.parse(s);
    expect(res).to.eql({"default":{"a":{"_[":[[[["href","$=","#"]],{"_v":[[0,"margin:0"]],"_p":[0,1,1]}]]}}});
  });
  it('long', function() {
    var s = 'div p a[href$="#"]{margin:0}';
    var res = jaw.parse(s);
    expect(res).to.eql({"default":{"a":{"_[":[[[["href","$=","#"]],{"p":{"div":{"_v":[[0,"margin:0"]],"_p":[0,1,3]}}}]]}}});
  });
  it('*.', function() {
    var s = '*.a[attr]{margin:0}';
    var res = jaw.parse(s);
    expect(res).to.eql({"default":{"_*":true,"_*.":true,"*.a":{"_[":[[[["attr"]],{"_v":[[0,"margin:0"]],"_p":[0,2,1]}]]}}});
  });
  it('*#', function() {
    var s = '*#a[attr]{margin:0}';
    var res = jaw.parse(s);
    expect(res).to.eql({"default":{"_*":true,"_*#":true,"*#a":{"_[":[[[["attr"]],{"_v":[[0,"margin:0"]],"_p":[1,1,1]}]]}}});
  });
  it('*.#', function() {
    var s = '*.a#b[attr]{margin:0}';
    var res = jaw.parse(s);
    expect(res).to.eql({"default":{"_*":true,"_*.#":true,"*.a#b":{"_[":[[[["attr"]],{"_v":[[0,"margin:0"]],"_p":[1,2,1]}]]}}});
  });
});

describe('relation', function() {
  it('single', function() {
    var s = 'a+div{margin:0}';
    var res = jaw.parse(s);
    expect(res).to.eql({"default":{"div":{"_+":{"a":{"_v":[[0,"margin:0"]],"_p":[0,0,2]}}}}});
  });
  it('double', function() {
    var s = '.c~.d,a+div{margin:0}';
    var res = jaw.parse(s);
    expect(res).to.eql({"default":{".d":{"_~":{".c":{"_v":[[0,"margin:0"]],"_p":[0,2,0]}}},"div":{"_+":{"a":{"_v":[[0,"margin:0"]],"_p":[0,0,2]}}}}});
  });
  it('repeat', function() {
    var s = '.c~.d{margin:0}.c~.d{padding:0}';
    var res = jaw.parse(s);
    expect(res).to.eql({"default":{".d":{"_~":{".c":{"_v":[[0,"margin:0"],[1,"padding:0"]],"_p":[0,2,0]}}}}});
  });
  it('*', function() {
    var s = '*+div{margin:0}';
    var res = jaw.parse(s);
    expect(res).to.eql({"default":{"div":{"_+":{"_*":true,"*":{"_v":[[0,"margin:0"]],"_p":[0,0,2]}}}}});
  });
  it('multi', function() {
    var s = 'a+div>.c~span{margin:0}';
    var res = jaw.parse(s);
    expect(res).to.eql({"default":{"span":{"_~":{".c":{"_>":{"div":{"_+":{"a":{"_v":[[0,"margin:0"]],"_p":[0,1,3]}}}}}}}}});
  });
});

describe('mix', function() {
  it('multi', function() {
    var s = '.a:hover.b:active.d[attr]{margin:0}';
    var res = jaw.parse(s);
    expect(res).to.eql({"default":{".d.b.a":{"_:":[[["hover","active"],{"_[":[[[["attr"]],{"_v":[[0,"margin:0"]],"_p":[0,4,2]}]]}]]}}});
  });
  it('multi 2', function() {
    var s = '[attr].a[title]#id[class="c"]{margin:0}';
    var res = jaw.parse(s);
    expect(res).to.eql({"default":{".a#id":{"_[":[[[["title"],["class","=","c"],["attr"]],{"_v":[[0,"margin:0"]],"_p":[1,4,0]}]]}}});
  });
  it('*', function() {
    var s = '[attr]:hover[attr2]{margin:0}';
    var res = jaw.parse(s);
    expect(res).to.eql({"default":{"_*":true,"*":{"_:":[[["hover"],{"_[":[[[["attr2"],["attr"]],{"_v":[[0,"margin:0"]],"_p":[0,2,1]}]]}]]}}});
  });
});

describe('join', function() {
  it('simple', function() {
    var s = 'a{ margin:0; padding:0;\n}';
    var res = jaw.parse(s);
    expect(res).to.eql({"default":{"a":{"_v":[[0,"margin:0"],[0,"padding:0"]],"_p":[0,0,1]}}});
  });
});

describe('option', function() {
  it('noPriority', function() {
    var s = 'a{color:#FFF}';
    var res = jaw.parse(s, { noPriority: true });
    expect(res).to.eql({"default":{"a":{"_v":[[0,"color:#FFF"]]}}});
  });
  it('noValue', function() {
    var s = 'a{color:#FFF}';
    var res = jaw.parse(s, { noValue: true });
    expect(res).to.eql({"default":{"a":{"_v":true,"_p":[0,0,1]}}});
  });
  it('noMedia', function() {
    var s = 'a{color:#FFF}';
    var res = jaw.parse(s, { noMedia: true });
    expect(res).to.eql({"a":{"_v":[[0,"color:#FFF"]],"_p":[0,0,1]}});
  });
  it('noPriority && noValue', function() {
    var s = 'a{color:#FFF}';
    var res = jaw.parse(s, { noPriority: true, noValue: true });
    expect(res).to.eql({"default":{"a":{"_v":true}}});
  });
  it('noPriority && noValue && noMedia', function() {
    var s = 'a{color:#FFF}';
    var res = jaw.parse(s, { noPriority: true, noValue: true, noMedia: true });
    expect(res).to.eql({"a":{"_v":true}});
  });
});

describe('media query', function() {
  it('simple', function() {
    var s = '@media all and(min-device-width:320px){a{margin:0}b{padding:0}}';
    var res = jaw.parse(s);
    expect(res).to.eql({"default":{},"media":[{"query":[[["min-device-width","320px"]]],"style":{"a":{"_v":[[0,"margin:0"]],"_p":[0,0,1]},"b":{"_v":[[1,"padding:0"]],"_p":[0,0,1]}}}]});
  });
  it('multi', function() {
    var s = '@media all and(min-device-width:320px){a{margin:0}}@media(min-device-height:100px),(width){b{padding:0}}';
    var res = jaw.parse(s);
    expect(res).to.eql({"default":{},"media":[{"query":[[["min-device-width","320px"]]],"style":{"a":{"_v":[[0,"margin:0"]],"_p":[0,0,1]}}},{"query":[[["min-device-height","100px"]],["width"]],"style":{"b":{"_v":[[1,"padding:0"]],"_p":[0,0,1]}}}]});
  });
  it('complex', function() {
    var s = 'div{color:#000}@media all and(min-device-width:320px){a{margin:0}}b{padding:0}';
    var res = jaw.parse(s);
    expect(res).to.eql({"default":{"div":{"_v":[[0,"color:#000"]],"_p":[0,0,1]},"b":{"_v":[[2,"padding:0"]],"_p":[0,0,1]}},"media":[{"query":[[["min-device-width","320px"]]],"style":{"a":{"_v":[[1,"margin:0"]],"_p":[0,0,1]}}}]});
  });
});
