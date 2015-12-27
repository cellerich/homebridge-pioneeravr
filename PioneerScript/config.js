function MM_preloadImages(){ //v3.0
var d=document; if(d.images){ if(!d.MM_p) d.MM_p=new Array();
var i,j=d.MM_p.length,a=MM_preloadImages.arguments; for(i=0; i<a.length; i++)
if(a[i].indexOf("#")!==0){ d.MM_p[j]=new Image; d.MM_p[j++].src=a[i];}}
}

function MM_swapImgRestore(){ //v3.0
var i,x,a=document.MM_sr; for(i=0;a&&i<a.length&&(x=a[i])&&x.oSrc;i++) x.src=x.oSrc;
}

function MM_findObj(n, d){ //v4.01
var p,i,x; if(!d) d=document; if((p=n.indexOf("?"))>0&&parent.frames.length){
d=parent.frames[n.substring(p+1)].document; n=n.substring(0,p);}
if(!(x=d[n])&&d.all) x=d.all[n]; for(i=0;!x&&i<d.forms.length;i++) x=d.forms[i][n];
for(i=0;!x&&d.layers&&i<d.layers.length;i++) x=MM_findObj(n,d.layers[i].document);
if(!x && d.getElementById) x=d.getElementById(n); return x;
}

function MM_swapImage(){ //v3.0
var i,j=0,x,a=MM_swapImage.arguments; document.MM_sr=new Array; for(i=0;i<(a.length-2);i+=3)
if((x=MM_findObj(a[i]))!==null){document.MM_sr[j++]=x; if(!x.oSrc) x.oSrc=x.src; x.src=a[i+2];}
}

var webCon={};

webCon.inited=false;
webCon.avail=false;
webCon.sn=true;
webCon.zone=null;
webCon.http=null;
webCon.radio=null;

webCon.init=function(zone){
try{
if(zone==="MZ"){
webCon.zone=new MainZone();
}
else if(zone==="Z2"){
webCon.zone=new ExtensionZone(zone);
}
else if(zone==="Z3"){
webCon.zone=new Zone(zone);
}
else if(zone==="RS"){
webCon.zone=new Zone("Dummy");
webCon.radio=new RadioSetup();
}
else{
throw new Error("e:webCon.init");
}
webCon.http=new HttpRequest();
if(!webCon.http.getVal()){
webCon.inited=true;
}
else{
window.setTimeout('window.location.reload()',5000);
}
}
catch (e){
alert(e.message);
}
}

webCon.startup=function(){
try{
if(webCon.inited===false){
return;
}
webCon.zone.init();
webCon.http.tid=window.setTimeout('webCon.http.getTxt(0)',5000);
}
catch (e){
alert(e.message);
}
}

webCon.startupRS=function(){
try{
if(webCon.inited===false){
throw new Error("e:webCon.startupRS");
}
webCon.radio.init();
webCon.http.getRadioSetting();
}
catch (e){
alert(e.message);
}
}

webCon.wrZ3Row=function(){
var d=document;
if(webCon.zone.num > 2){
var s="";
if(webCon.sn===true){
s="html";
}
else{
s="asp";
}
d.write("<td align='left' valign='top'><a href='zone_3."+s+"' tabindex='3'><img src='img/btn_main3a.gif' alt='ZONE 3' width='170' height='36' border='0' id='Image3' onmousedown='MM_swapImage(\"Image3\",\"\",\"img/btn_main3c.gif\",1)' onmouseout='MM_swapImgRestore()' /></a></td>");
}
else{
d.write("<td align='left' valign='top' width='170' height='36' border='0'></td>");
}
}

webCon.wrSetupRow=function(){
var d=document;
if(webCon.sn===true){
d.write("<td align='left'><a href='radio_setup.html' tabindex='4'><img src='img/btn_main4a.gif' alt='Set Up' width='170' height='36' border='0' id='Image4' onmousedown='MM_swapImage(\"Image4\",\"\",\"img/btn_main4c.gif\",1)' onmouseout='MM_swapImgRestore()' /></a> </td>");
}
else{
d.write("<td align='left'><a href='fw_index.asp' tabindex='4'><img src='img/btn_main4a.gif' alt='Go' width='170' height='36' border='0' id='Image4' onmousedown='MM_swapImage(\"Image4\",\"\",\"img/btn_main4c.gif\",1)' onmouseout='MM_swapImgRestore()' /></a> </td>");
}
}

function HttpRequest(){
this.tid=0;
this._factories=[
function(){ return new XMLHttpRequest(); },
function(){ return new ActiveXObject("Msxml2.XMLHTTP"); },
function(){ return new ActiveXObject("Microsoft.XMLHTTP"); }
];
this._factory=null;
}

HttpRequest.prototype.toString=function(){
return "[object HttpRequest]";
}

HttpRequest.prototype.newRequest=function(){
var i;

if(this._factory!==null){
return this._factory();
}
for(i=0; i<this._factories.length; i++){
try{
var factory=this._factories[i];
var req=factory();
if(req!==null){
this._factory=factory;
return req;
}
}
catch(e){
continue;
}
}
this._factory=function(){
throw new Error("e:HttpRequest.newRequest");
}
this._factory();
}

HttpRequest.prototype.getTxt=function(sync){
var req=this.newRequest();
if(!sync){
if(req!==null){
req.onreadystatechange=function(){
if(req.readyState===4){
clearTimeout(webCon.http.tid);
if(req.status===200){
webCon.zone.setTxt(req.responseText);
if(webCon.sn===false){
var s=["?AST","?RGC"];
webCon.http.sndRs232cEventUpdate(s);
}
}
else{
webCon.zone.powerOff();
}
webCon.http.tid=window.setTimeout('webCon.http.getTxt(0)',5000);
}
}
req.open("get","/StatusHandler.asp",true);
req.setRequestHeader("If-Modified-Since","Thu, 1 Jan 1970 00:00:00 GMT");
req.send(null);
}
}
else{
if(req!==null){
req.open("get","/StatusHandler.asp",false);
req.setRequestHeader("If-Modified-Since","Thu, 1 Jan 1970 00:00:00 GMT");
req.send(null);
if(req.readyState===4){
clearTimeout(webCon.http.tid);
if(req.status===200){
webCon.zone.setTxt(req.responseText);
}
else{
webCon.zone.powerOff();
}
webCon.http.tid=window.setTimeout('webCon.http.getTxt(0)',5000);
}
}
}
}

HttpRequest.prototype.getVal=function(){
var req=this.newRequest();

if(req!==null){
req.open("get","/StatusHandler.asp",false);
req.setRequestHeader("If-Modified-Since","Thu, 1 Jan 1970 00:00:00 GMT");
req.send(null);
if(req.readyState===4){
if(req.status===200){
try{
webCon.zone.setVal(req.responseText);
}
catch(e){
return -1;
}
}
else{
return -1;
}
}
}
else{
return -1;
}
return 0;
}

HttpRequest.prototype.getRadioSetting=function(){
var req=this.newRequest();

if(req!==null){
req.open("get","/InternetRadioSettingListHandler.asp",false);
req.setRequestHeader("If-Modified-Since","Thu, 1 Jan 1970 00:00:00 GMT");
req.send(null);
if(req.readyState===4){
if(req.status===200){
webCon.radio.setTxt(req.responseText);
}
}
}
else{
throw new Error("e:HttpRequest.getRadioSetting");
}
}

HttpRequest.prototype.sndRs232cEventUpdate=function(s){
var i,a,b,c;

for(i=0;i<s.length;i++){
var req=this.newRequest();
if(req){
a="EventHandler.asp?WebToHostItem=";
b=encodeURIComponent(s[i]);
c=a+b;
req.open("get",c,true);
req.setRequestHeader("If-Modified-Since","Thu, 1 Jan 1970 00:00:00 GMT");
req.send(null);
}
}
}

HttpRequest.prototype.sndRs232cEvent=function(query){
var req=this.newRequest();
var a,b,c;

if(req){
clearTimeout(webCon.http.tid);
a="EventHandler.asp?WebToHostItem=";
b=encodeURIComponent(query);
c=a+b;
req.open("get",c,true);
req.setRequestHeader("If-Modified-Since","Thu, 1 Jan 1970 00:00:00 GMT");
req.send(null);
webCon.http.tid=window.setTimeout('webCon.http.getTxt(0)',2000);
}
}

HttpRequest.prototype.sndPower=function(cmd){
this.sndRs232cEvent(cmd);
}

HttpRequest.prototype.sndVol=function(cmd){
this.sndRs232cEvent(cmd);
}

HttpRequest.prototype.sndMute=function(cmd){
this.sndRs232cEvent(cmd);
}

HttpRequest.prototype.sndInput=function(cmd){
this.sndRs232cEvent(cmd);
}

HttpRequest.prototype.sndListenMode=function(cmd){
this.sndRs232cEvent(cmd);
}

HttpRequest.prototype.sndRadioInfo=function(i,sTt,sURL){
var req=this.newRequest();
var tt=encodeURIComponent(sTt);
var url=encodeURI(sURL);
if(req){
req.onreadystatechange=function(){
if(req.readyState===4){
if(req.status===200){
webCon.radio.setSts(req.responseText);
}
else{
webCon.radio.setStsPict(i,0);
}
}
}
webCon.radio.setStsPict(i,1);
req.open("post","/InternetRadioSettingUpdateHandler.asp",true);
req.setRequestHeader("If-Modified-Since","Thu, 1 Jan 1970 00:00:00 GMT");
req.send("Channel="+i+"&Title="+tt+"&URL="+url);
}
}

function InputParam(){
this.P=0;
this.N="";
}

function Zone(name){
this.name= name;
this.num=0;
this.tblInput=null;
this.power=0;
this.upower=false;
this.cpower=-1;
this.inputs=null;
this.cinput=0;
this.ainput=-1;
this.upinputl=false;
this.upinputf=false;
}

Zone.prototype.toString=function(){
return "[object Zone]";
}

Zone.prototype.init=function(){
var d=document;
if(d.all){
d.form1.power[0].attachEvent("onclick",this.clkPower);
d.form1.power[1].attachEvent("onclick",this.clkPower);
d.form1.select.attachEvent("onchange",this.chgInput);
}
else{
d.form1.power[0].addEventListener("click",this.clkPower,false);
d.form1.power[1].addEventListener("click",this.clkPower,false);
d.form1.select.addEventListener("change",this.chgInput,false);
d.form1.select.addEventListener("keyup",this.chgInputByKey,false);
}
this.update();
}

Zone.prototype.powerOff=function(){
this.power=0;
this.upower=true;
this.cpower=-1;
this.update();
}

Zone.prototype.getZoneId=function(){
var id;
if(this.name==="MZ"){
id=0;
}
else if(this.name==="Z2"){
id=1;
}
else if(this.name==="Z3"){
id=2;
}
else{
id=0;
}
return id;
}

Zone.prototype.update=function(){
var d=document;
var i,j,len,tbllen;
if(this.power===0){
if(this.upower===true){
d.form1.power[1].checked=true;
if(this.inputs!==null){
this.inputs.length=0;
}
d.form1.select.options.length=0;
d.form1.select.options[0]= new Option("---",0);
}
}
else{
if(this.upower===true){
d.form1.power[0].checked=true;
}
if(this.inputs!==null){
len=this.inputs.length;
if(this.upinputl===true){
var s="";
d.form1.select.options.length=0;
for(i=0;i<len;i++){
tbllen=this.tblInput.length;
for(j=0;j<tbllen;j++){
if(this.tblInput[j].P===this.inputs[i]){
break;
}
}
if(d.all){
d.form1.select.options[i]= new Option(this.tblInput[j].N,this.tblInput[j].P);
}
else{
s+="<option value='"+this.tblInput[j].P+"'>"+this.tblInput[j].N.replace(/[\u0020]/g,"&nbsp;")+"</option>";
}
}
if(!d.all){
d.form1.select.innerHTML=s;
}
}
if(this.upinputf===true){
for(i=0;i<len;i++){
if(this.inputs[i]===this.cinput){
break;
}
}
if(i<len){
d.form1.select.selectedIndex=i;
}
else{
d.form1.select.selectedIndex=0;
}
}
}
}
}

Zone.prototype.cmpTbl=function(a1,a2,a3){
var i,len;
if(a1===null||a2===null||a3===null){
return false;
}
if(a1.length!==a2.length){
return false;
}
len=a1.length;
for(i=0;i<len;i++){
if(a1[i].P!==a3[i]||a1[i].N!==a2[i]){
return false;
}
}
return true;
}

Zone.prototype.cmpArray=function(a1, a2){
var i,len;
if(a1===null||a2===null){
return false;
}
if(a1.length!==a2.length){
return false;
}
len=a1.length;
for(i=0;i<len;i++){
if(a1[i]!==a2[i]){
return false;
}
}
return true;
}

Zone.prototype.setTxt=function(txt){
var j=eval("("+txt+")");
var id=this.getZoneId();
var i,len;

this.upower=false;
this.upinputl=false;
this.upinputf=false;

if(this.power!==j.Z[id].P || this.cpower>1){
this.power=j.Z[id].P;
this.upower=true;
if(this.power===1){
this.upinputl=true;
this.upinputf=true;
}
this.cpower=-1;
}
else{
if(this.cpower!==-1){
this.cpower++;
}
}
if(this.cmpTbl(this.tblInput,j.IL,j.Z[0].I)===false){
len=j.IL.length;
if(this.tblInput!==null){
this.tblInput.length=0;
}
this.tblInput=new Array;
for(i=0; i<len; i++){
var p=new InputParam;
p.P=j.Z[0].I[i];
p.N=j.IL[i];

this.tblInput.push(p);
}
this.upinputl=true;
this.upinputf=true;
}
if(this.cmpArray(this.inputs, j.Z[id].I)===false){
len=j.Z[id].I.length;
if(this.inputs!==null){
delete this.inputs;
}
this.inputs=new Array(len);
for(i=0; i<len; i++){
this.inputs[i]=j.Z[id].I[i];
}
this.upinputl=true;
this.upinputf=true;
}
if(this.cinput!==j.Z[id].C && (this.ainput===-1 || this.ainput>1)){
this.upinputf=true;
this.cinput=j.Z[id].C;
this.ainput=-1;
}
else{
if(this.ainput!==-1){
if(this.ainput>1){
this.ainput=-1;
}
else{
this.ainput++;
}
}
}
this.update();
}

Zone.prototype.setVal=function(txt){
var j=eval("("+txt+")");
this.num=j.Z.length;
var id=this.getZoneId();
var i=0;

this.power=j.Z[id].P;
this.upower=true;
len=j.IL.length;
this.tblInput=new Array;

for(i=0; i<len; i++){
var p=new InputParam;
p.P=j.Z[0].I[i];
p.N=j.IL[i];
this.tblInput.push(p);
}
var len=j.Z[id].I.length;
this.inputs=new Array(len);
for(i=0;i<len;i++){
this.inputs[i]=j.Z[id].I[i];
}
this.cinput=j.Z[id].C;
this.upinputl=true;
this.upinputf=true;
if(j.S===1){
webCon.sn=true;
}
else{
webCon.sn=false;
}
if(j.B===1){
webCon.avail=true;
}
else{
webCon.avail=false;
}
}

Zone.prototype.clkPower=function(){
webCon.zone.cpower=0;
if(document.form1.power[0].checked){
webCon.http.sndPower("BPO");
}
else{
webCon.http.sndPower("BPF");
}
}

Zone.prototype.chgInput=function(){
if(webCon.zone.power===0){return;}
var s=document.form1.select.value+"";
webCon.zone.cinput=document.form1.select.value-0;
webCon.zone.ainput=0;
if(document.form1.select.value<10){
s="0"+s;
}
webCon.http.sndInput(s+"ZT");
}

Zone.prototype.chgInputByKey=function(evt){
var e=evt.keyCode;
if(e!==37&&e!==38&&e!==39&&e!=40){
return;
}
webCon.zone.chgInput();
}

Zone.prototype.wrZ3Tag=function(){
var d=document;
if(this.num>=3){
if(this.name!=="Z3"){
var s="";
if(webCon.sn===true){
s="html";
}
else{
s="asp";
}
d.write("<td align='center'><a href='zone_3."+s+"' tabindex='3'><img src='img/btn_tab3a.gif' alt='ZONE 3' width='250' height='32' border='0' id='Image2' onmousedown='MM_swapImage(\"Image2\",\"\",\"img/btn_tab3c.gif\",1)' onmouseout='MM_swapImgRestore()' /></a></td>");
}
else{
d.write("<td align='center'><img src='img/btn_tab3d.gif' alt='ZONE 3' width='250' height='32' border='0' id='Image2' /></td>");
}
}
else{
d.write("<td align='center' width='250' height='32' border='0' />");
}
}

function ExtensionZone(name){
Zone.call(this,name);
this.vol=0;
this.mute=0;
this.umute=false;
this.cmute=-1;
}

ExtensionZone.prototype=new Zone();
delete ExtensionZone.prototype.name;
delete ExtensionZone.prototype.num;
delete ExtensionZone.prototype.power;
delete ExtensionZone.prototype.upower;
delete ExtensionZone.prototype.cpower;
delete ExtensionZone.prototype.inputs;
delete ExtensionZone.prototype.tblInput;
delete ExtensionZone.prototype.cinput;
delete ExtensionZone.prototype.ainput;
delete ExtensionZone.prototype.upinputl;
delete ExtensionZone.prototype.upinputf;
ExtensionZone.prototype.contstructor=Zone;

ExtensionZone.prototype.toString=function(){
return "[object ExtensionZone]";
}

ExtensionZone.prototype.init=function(){
var d=document;

if(d.all){
d.getElementById("volumeup").attachEvent("onclick",this.clkVolUp);
d.getElementById("volumedown").attachEvent("onclick",this.clkVolDown);
d.form1.checkbox.attachEvent("onclick",this.clkMute);
}
else{
d.getElementById("volumeup").addEventListener("click",this.clkVolUp,false);
d.getElementById("volumedown").addEventListener("click",this.clkVolDown,false);
d.form1.checkbox.addEventListener("click",this.clkMute,false);
}
Zone.prototype.init.call(this);
}

ExtensionZone.prototype.calcVol=function(v){
v-=81;
return v;
}

ExtensionZone.prototype.upVol=function(){
if(this.vol<81){
this.vol+=1;
}
this.updateField();
}

ExtensionZone.prototype.downVol=function(){
if(this.vol>0){
this.vol-=1;
}
this.updateField();
}

ExtensionZone.prototype.updateField=function(){
var i=this.getZoneId();
var d=document;

if(this.power===0){
d.getElementById("volume").innerHTML="---";
d.form1.checkbox.checked=false;
d.form1.checkbox.disabled=true;
}
else{
var iv = this.calcVol(this.vol);
if(iv>0){
d.getElementById("volume").innerHTML="+"+iv.toFixed(1)+"dB";
}
else if(iv>=-80){
d.getElementById("volume").innerHTML=iv.toFixed(1)+"dB";
}
else{
d.getElementById("volume").innerHTML="---";
}
d.form1.checkbox.disabled=false;
}
if(this.umute===true){
if(this.mute===1){
d.form1.checkbox.checked=true;
}
else{
d.form1.checkbox.checked=false;
}
}
if(this.vol===-1){
d.getElementById("volume_table").style.display="none";
}
else{
d.getElementById("volume_table").style.display="block";
}
}

ExtensionZone.prototype.update=function(){
this.updateField();
Zone.prototype.update.call(this);
}

ExtensionZone.prototype.setTxt=function(txt){
var j=eval("("+txt+")");
var i=this.getZoneId();

this.vol = j.Z[i].V;
this.umute=false;
if(this.mute!==j.Z[i].M || this.cmute>1){
this.mute=j.Z[i].M;
this.umute=true;
this.cmute=-1;
}
else{
if(this.cmute!==-1){
this.cmute++;
}
}
Zone.prototype.setTxt.call(this,txt);
}

ExtensionZone.prototype.setVal=function(txt){
Zone.prototype.setVal.call(this,txt);
var j=eval("("+txt+")");
var i=this.getZoneId();

this.vol=j.Z[i].V;
this.mute=j.Z[i].M;
this.umute=true;
}

ExtensionZone.prototype.clkPower=function(){
webCon.zone.cpower=0;
if(document.form1.power[0].checked){
webCon.http.sndPower('APO');
}
else{
webCon.http.sndPower('APF');
}
}

ExtensionZone.prototype.clkVolUp=function(){
if(webCon.zone.power===0){return;}
webCon.zone.upVol();
webCon.http.sndVol("ZU");
}

ExtensionZone.prototype.clkVolDown=function(){
if(webCon.zone.power===0){return;}
webCon.zone.downVol();
webCon.http.sndVol("ZD");
}

ExtensionZone.prototype.clkMute=function(){
if(webCon.zone.power===0){return;}
webCon.zone.cmute=0;
if(document.form1.checkbox.checked===true){
webCon.http.sndMute("Z2MO");
}
else{
webCon.http.sndMute("Z2MF");
}
}

ExtensionZone.prototype.chgInput=function(){
if(webCon.zone.power===0){return;}
var s=document.form1.select.value + "";
webCon.zone.cinput=document.form1.select.value-0;
webCon.zone.ainput=0;
if(document.form1.select.value<10){
s="0"+s;
}
webCon.http.sndInput(s+"ZS");
}

function MainZone(){
ExtensionZone.call(this,"MZ");
this.hasTHX=false;
this.lmode="";
this.sig=0;
this.tblListeningMode={
"0001":"STEREO","0002":"F.S.SURR FOCUS","0003":"F.S.SURR WIDE","0004":"RETRIEVER AIR",
"0101":"DOLBY PLIIx MOVIE","0102":"DOLBY PLII MOVIE","0103":"DOLBY PLIIx MUSIC","0104":"DOLBY PLII MUSIC","0105":"DOLBY PLIIx GAME","0106":"DOLBY PLII GAME","0107":"DOLBY PRO LOGIC","0108":"Neo:6 CINEMA","0109":"Neo:6 MUSIC","010a":"XM HD Surround","010b":"NEURAL SURR","010c":"","010d":"DOLBY PLIIz HEIGHT","010e":"WIDE SURR MOV","010f":"WIDE SURR MUS",
"1101":"DOLBY PLIIx MOVIE","1102":"DOLBY PLIIx MUSIC","1103":"DOLBY DIGITAL EX","1104":"","1105":"ES MATRIX","1106":"ES DISCRETE","1107":"DTS-ES 7.1","1108":"","1109":"DOLBY PLIIz HEIGHT","110a":"WIDE SURR MOV","110b":"WIDE SURR MUS",
"0201":"ACTION","0202":"DRAMA","0203":"SCI-FI","0204":"MONO FILM","0205":"ENT.SHOW","0206":"EXPANDED","0207":"TV SURROUND","0208":"ADVANCED GAME","0209":"SPORTS","020a":"CLASSICAL","020b":"ROCK/POP","020c":"UNPLUGGED","020d":"EXT.STEREO","020e":"PHONES SURR",
"0301":"DOLBY PLIIx MV +THX","0302":"DOLBY PLII MV +THX","0303":"DOLBY PL +THX CIN","0304":"Neo:6 CIN +THX","0305":"THX CINEMA","0306":"DOLBY PLIIx MS +THX","0307":"DOLBY PLII MS +THX","0308":"DOLBY PL +THX MS","0309":"Neo:6 MUS +THX","030a":"THX MUSIC","030b":"DOLBY PLIIx GM +THX","030c":"DOLBY PLII GM +THX","030d":"DOLBY PL +THX GM","030e":"THX ULTRA2 GM","030f":"THX SELCT2 GM","0310":"THX GAMES","0311":"DOLBY PLIIz +THX CN","0312":"DOLBY PLIIz +THX MU","0313":"DOLBY PLIIz +THX GM",
"1301":"THX Surr EX","1302":"Neo:6 +THX CIN","1303":"ES MTRX+THX CN","1304":"ES DISC+THX CN","1305":"ES 7.1+THX CIN","1306":"DOLBY PLIIx MV +THX","1307":"THX ULTRA2 CIN","1308":"THX SELCT2 CIN","1309":"THX CINEMA","130a":"Neo:6 +THX MS","130b":"ES MTRX+THX MS","130c":"ES DISC+THX MS","130d":"ES 7.1 +THX MS","130e":"DOLBY PLIIx MS +THX","130f":"THX ULTRA2 MS","1310":"THX SELCT2 MS","1311":"THX MUSIC","1312":"Neo:6 +THX GM","1313":"ES MTRX+THX GM","1314":"ES DISC+THX GM","1315":"ES 7.1 +THX GM","1316":"DOLBY EX +THX GM","1317":"THX ULTRA2 GM","1318":"THX SELCT2 GM","1319":"THX GAMES","131a":"DOLBY PLIIz +THX CN","131b":"DOLBY PLIIz +THX MU","131c":"DOLBY PLIIz +THX GM",
"0401":"STEREO","0402":"DOLBY PLII MOVIE","0403":"DOLBY PLIIx MOVIE","0404":"Neo:6 CINEMA","0405":"","0406":"DOLBY DIGITAL EX","0407":"DOLBY PLIIx MOVIE","0408":"DTS+Neo:6","0409":"ES MATRIX","040a":"ES DISCRETE","040b":"DTS-ES 7.1","040c":"XM HD Surround","040d":"NEURAL SURR","040e":"RETRIEVER AIR",
"0501":"STEREO","0502":"DOLBY PLII MOVIE","0503":"DOLBY PLIIx MOVIE","0504":"Neo:6 CINEMA","0505":"","0506":"DOLBY DIGITAL EX","0507":"DOLBY PLIIx MOVIE","0508":"DTS+Neo:6","0509":"ES MATRIX","050a":"ES DISCRETE","050b":"DTS-ES 7.1","050c":"XM HD Surround","050d":"NEURAL SURR","050e":"RETRIEVER AIR",
"0601":"STEREO","0602":"DOLBY PLII MOVIE","0603":"DOLBY PLIIx MOVIE","0604":"Neo:6 CINEMA","0605":"","0606":"DOLBY DIGITAL EX","0607":"DOLBY PLIIx MOVIE","0608":"","0609":"ES MATRIX","060a":"ES DISCRETE","060b":"DTS-ES 7.1",
"0701":"","0702":"DOLBY PLII MOVIE","0703":"DOLBY PLIIx MOVIE","0704":"Neo:6 CINEMA","0705":"","0706":"DOLBY DIGITAL EX","0707":"DOLBY PLIIx MOVIE","0708":"","0709":"ES MATRIX","070a":"ES DISCRETE","070b":"DTS-ES 7.1",
"0881":"OPTIMUM","0e01":"HDMI THROUGH","0f01":"MULTI CH IN"
};
this.tblListeningModeExtra = [
[ "STEREO","","","","","","ANALOG DIRECT",""],
[ "STEREO","","","","","","ANALOG DIRECT",""],
[ "STEREO","","","","","","ANALOG DIRECT",""],
[ "PCM","","","","","","PCM DIRECT",""],
[ "PCM","","PCM","PCM","PCM","PCM","PCM DIRECT","PCM DIRECT"],
[ "DOLBY DIGITAL","","DOLBY DIGITAL","DOLBY DIGITAL","DOLBY DIGITAL","DOLBY DIGITAL","STEREO","DOLBY DIGITAL"],
[ "DTS","DTS+Neo:6","DTS","DTS","DTS","DTS","STEREO","DTS"],
[ "","","DTS","DTS","DTS","DTS","","DTS"],
[ "","","DTS","DTS","DTS","DTS","","DTS"],
[ "DTS","DTS+Neo:6","DTS","DTS","DTS","DTS","STEREO","DTS"],
[ "","","DTS","DTS","DTS","DTS","","DTS"],
[ "","","DTS","DTS","DTS","DTS","","DTS"],
[ "MPEG-2 AAC","","MPEG-2 AAC","MPEG-2 AAC","MPEG-2 AAC","MPEG-2 AAC","STEREO","MPEG-2 AAC"],
[ "WMA9 PRO","","WMA9 PRO","WMA9 PRO","WMA9 PRO","WMA9 PRO","STEREO","WMA9 PRO"],
[ "SACD","","SACD","SACD","SACD","SACD","STEREO","SACD"],
[ "","","","","","","",""],
[ "DOLBY DIGITAL PLUS","","DOLBY DIGITAL PLUS","DOLBY DIGITAL PLUS","DOLBY DIGITAL PLUS","DOLBY DIGITAL PLUS","STEREO","DOLBY DIGITAL PLUS"],
[ "DOLBY TrueHD","","DOLBY TrueHD","DOLBY TrueHD","DOLBY TrueHD","DOLBY TrueHD","STEREO","DOLBY TrueHD"],
[ "DTS Express","DTS+Neo:6","DTS Express","DTS Express","DTS Express","DTS Express","STEREO","DTS Express"],
[ "DTS-HD MSTR","DTS-HD+Neo:6","DTS-HD MSTR","DTS-HD MSTR","DTS-HD MSTR","DTS-HD MSTR","STEREO","DTS-HD MSTR"],
[ "DTS-HD HI RES","DTS-HD+Neo:6","DTS-HD HI RES","DTS-HD HI RES","DTS-HD HI RES","DTS-HD HI RES","STEREO","DTS-HD HI RES"],
[ "DTS-HD HI RES","DTS-HD+Neo:6","DTS-HD HI RES","DTS-HD HI RES","DTS-HD HI RES","DTS-HD HI RES","STEREO","DTS-HD HI RES"],
[ "DTS-HD HI RES","DTS-HD+Neo:6","DTS-HD HI RES","DTS-HD HI RES","DTS-HD HI RES","DTS-HD HI RES","STEREO","DTS-HD HI RES"],
[ "DTS-HD HI RES","DTS-HD+Neo:6","DTS-HD HI RES","DTS-HD HI RES","DTS-HD HI RES","DTS-HD HI RES","STEREO","DTS-HD HI RES"],
[ "DTS-HD HI RES","DTS-HD+Neo:6","DTS-HD HI RES","DTS-HD HI RES","DTS-HD HI RES","DTS-HD HI RES","STEREO","DTS-HD HI RES"],
[ "DTS-HD HI RES","DTS-HD+Neo:6","DTS-HD HI RES","DTS-HD HI RES","DTS-HD HI RES","DTS-HD HI RES","STEREO","DTS-HD HI RES"],
[ "DTS-HD HI RES","DTS-HD+Neo:6","DTS-HD HI RES","DTS-HD HI RES","DTS-HD HI RES","DTS-HD HI RES","STEREO","DTS-HD HI RES"],
[ "DTS-HD MSTR","DTS-HD+Neo:6","DTS-HD MSTR","DTS-HD MSTR","DTS-HD MSTR","DTS-HD MSTR","STEREO","DTS-HD MSTR"]
];

}

MainZone.prototype=new ExtensionZone();
delete MainZone.prototype.name;
delete MainZone.prototype.num;
delete MainZone.prototype.power;
delete MainZone.prototype.upower;
delete MainZone.prototype.cpower;
delete MainZone.prototype.inputs;
delete MainZone.prototype.tblInput;
delete MainZone.prototype.cinput;
delete MainZone.prototype.ainput;
delete MainZone.prototype.upinputl;
delete MainZone.prototype.upinputf;
delete MainZone.prototype.vol;
delete MainZone.prototype.mute;
delete MainZone.prototype.umute;
delete MainZone.prototype.cmute;
MainZone.prototype.contstructor=MainZone;

MainZone.prototype.toString=function(){
return "[object MainZone]";
}

MainZone.prototype.upVol=function(){
if(this.vol<185){
this.vol+=1;
}
ExtensionZone.prototype.updateField.call(this);
}

MainZone.prototype.downVol=function(){
if(this.vol>0){
this.vol-=1;
}
ExtensionZone.prototype.updateField.call(this);
}

MainZone.prototype.calcVol=function(v){
v-=161;
v*=0.5;
return v;
}

MainZone.prototype.init=function(){
var d=document;

if(d.all){
d.getElementById("auto_surr").attachEvent("onclick",this.clkAutoSurr);
if(this.hasTHX===true){
d.getElementById("home_thx").attachEvent("onclick",this.clkHomeThx);
}
d.getElementById("standard_surround").attachEvent("onclick",this.clkStandardSurround);
d.getElementById("advanced_surround").attachEvent("onclick",this.clkAdvancedSurround);
d.getElementById("stereo_surround").attachEvent("onclick",this.clkStereoSurround);
}
else{
d.getElementById("auto_surr").addEventListener("click",this.clkAutoSurr,false);
if(this.hasTHX===true){
d.getElementById("home_thx").addEventListener("click",this.clkHomeThx,false);
}
d.getElementById("standard_surround").addEventListener("click",this.clkStandardSurround,false);
d.getElementById("advanced_surround").addEventListener("click",this.clkAdvancedSurround,false);
d.getElementById("stereo_surround").addEventListener("click",this.clkStereoSurround,false);
}
ExtensionZone.prototype.init.call(this);
}

MainZone.prototype.update=function(){
if(this.power===0){
document.getElementById("listening_mode").innerHTML="---";
}
else{
document.getElementById("listening_mode").innerHTML=this.lmode;
}
ExtensionZone.prototype.update.call(this);
}

MainZone.prototype.getListeningModeStr=function(txt){
var j=eval("("+txt+")");
var i=-1,l=j.L,a=j.A;
var s=l.toString(16);

if(l===-1){
return "";
}
if(l<4096){s="0"+s;}
if(l<256){s="0"+s;}
if(l<16){s="0"+s;}

if(s==="010c"){i=0;}
else if(s==="1104"){i=1;}
else if(s==="1108"){i=2;}
else if(s==="0405"){i=3;}
else if(s==="0505"){i=4;}
else if(s==="0605"){i=5;}
else if(s==="0701"){i=6;}
else if(s==="0705"){i=7;}

try{
if(i===-1){
return this.tblListeningMode[s];
}
else{
return this.tblListeningModeExtra[a][i];
}
}catch(e){
return "";
}
}

MainZone.prototype.setTxt=function(txt){
var j=eval("("+txt+")");
this.lmode=this.getListeningModeStr(txt);
ExtensionZone.prototype.setTxt.call(this,txt);
}

MainZone.prototype.setVal=function(txt){
ExtensionZone.prototype.setVal.call(this,txt);
var j=eval("("+txt+")");

if(j.H===1){
this.hasTHX=true;
}
else{
this.hasTHX=false;
}
this.lmode=this.getListeningModeStr(txt);
}

MainZone.prototype.clkPower=function(){
webCon.zone.cpower=0;
if(document.form1.power[0].checked){
webCon.http.sndPower('PO');
}
else{
webCon.http.sndPower('PF');
}
}

MainZone.prototype.clkVolUp=function(){
if(webCon.zone.power===0){return;}
webCon.zone.upVol();
webCon.http.sndVol("VU");
}

MainZone.prototype.clkVolDown=function(){
if(webCon.zone.power===0){return;}
webCon.zone.downVol();
webCon.http.sndVol("VD");
}

MainZone.prototype.chgInput=function(){
if(webCon.zone.power===0){return;}
var s=document.form1.select.value + "";
webCon.zone.cinput=document.form1.select.value-0;
webCon.zone.ainput=0;
if(document.form1.select.value<10){
s="0"+s;
}
webCon.http.sndInput(s+"FN");
}

MainZone.prototype.clkMute=function(){
if(webCon.zone.power===0){return;}
webCon.zone.cmute=0;
if(document.form1.checkbox.checked===true){
webCon.http.sndMute("MO");
}
else{
webCon.http.sndMute("MF");
}
}

MainZone.prototype.clkAutoSurr=function(){
if(webCon.zone.power===0){return;}
webCon.http.sndListenMode("0005SR");
}

MainZone.prototype.clkHomeThx=function(){
if(webCon.zone.power===0){return;}
webCon.http.sndListenMode("0050SR");
}

MainZone.prototype.clkStandardSurround=function(){
if(webCon.zone.power===0){return;}
webCon.http.sndListenMode("0010SR");
}

MainZone.prototype.clkAdvancedSurround=function(){
if(webCon.zone.power===0){return;}
webCon.http.sndListenMode("0100SR");
}

MainZone.prototype.clkStereoSurround=function(){
if(webCon.zone.power===0){return;}
webCon.http.sndListenMode("0001SR");
}

MainZone.prototype.wrListenModeTable=function(){
var d=document;

if(this.hasTHX===true){
d.write("<tr>");
d.write("<td align='left'><img src='img/_spacer.gif' alt='' width='13' height='15' /></td>");
d.write("<td align='left'><img src='img/_spacer.gif' alt='' width='140' height='15' /></td>");
d.write("<td align='left'><img src='img/_spacer.gif' alt='' width='8' height='15' /></td>");
d.write("<td align='left'><img src='img/_spacer.gif' alt='' width='140' height='15' /></td>");
d.write("<td align='left'><img src='img/_spacer.gif' alt='' width='8' height='15' /></td>");
d.write("<td align='left'><img src='img/_spacer.gif' alt='' width='140' height='15' /></td>");
d.write("<td align='left'><img src='img/_spacer.gif' alt='' width='8' height='15' /></td>");
d.write("<td align='left'><img src='img/_spacer.gif' alt='' width='140' height='15' /></td>");
d.write("<td align='left'><img src='img/_spacer.gif' alt='' width='8' height='15' /></td>");
d.write("<td align='left'><img src='img/_spacer.gif' alt='' width='140' height='15' /></td>");
d.write("<td align='left'><img src='img/_spacer.gif' alt='' width='13' height='15' /></td>");
d.write("</tr>");
d.write("<tr>");
d.write("<td align='left'>&nbsp;</td>");
d.write("<td align='left'><a href='javascript:void(0)' tabindex='10' id='auto_surr'><img src='img/btn_toggle1.gif' alt='AUTO SURR/ALC/STREAM DIRECT' width='140' height='42' border='0' id='Image3' onmousedown=\"MM_swapImage('Image3','','img/btn_5toggle1c.gif',1)\" onmouseout='MM_swapImgRestore()' onmouseup='MM_swapImgRestore()'/></a></td>");
d.write("<td align='left'>&nbsp;</td>");
d.write("<td align='left'><a href='javascript:void(0)' tabindex='11' id='home_thx'><img src='img/btn_toggle2.gif' alt='HOME THX' width='140' height='42' border='0' id='Image4' onmousedown=\"MM_swapImage('Image4','','img/btn_5toggle2c.gif',1)\" onmouseout='MM_swapImgRestore()' onmouseup='MM_swapImgRestore()' /></a></td>");
d.write("<td align='left'>&nbsp;</td>");
d.write("<td align='left'><a href='javascript:void(0)' tabindex='12' id='standard_surround'><img src='img/btn_toggle3.gif' alt='STANDARD SURROUND' width='140' height='42' border='0' id='Image5' onmousedown=\"MM_swapImage('Image5','','img/btn_5toggle3c.gif',1)\" onmouseout='MM_swapImgRestore()' onmouseup='MM_swapImgRestore()' /></a></td>");
d.write("<td align='left'>&nbsp;</td>");
d.write("<td align='left'><a href='javascript:void(0)' tabindex='13' id='advanced_surround'><img src='img/btn_toggle4.gif' alt='ADVANCED SURROUND' width='140' height='42' border='0' id='Image6' onmousedown=\"MM_swapImage('Image6','','img/btn_5toggle4c.gif',1)\" onmouseout='MM_swapImgRestore()' onmouseup='MM_swapImgRestore()' /></a></td>");
d.write("<td align='left'>&nbsp;</td>");
d.write("<td align='left'><a href='javascript:void(0)' tabindex='14' id='stereo_surround'><img src='img/btn_toggle5.gif' alt='STEREO' width='140' height='42' border='0' id='Image7' onmousedown=\"MM_swapImage('Image7','','img/btn_5toggle5c.gif',1)\" onmouseout='MM_swapImgRestore()' onmouseup='MM_swapImgRestore()' /></a></td>");
d.write("<td align='left'>&nbsp;</td>");
d.write("</tr>");
d.write("<tr>");
d.write("<td colspan='11' align='left'><img src='img/_spacer.gif' alt='' width='758' height='15' /></td>");
d.write("</tr>");
}
else{
d.write("<tr>");
d.write("<td align='left'><img src='img/_spacer.gif' alt='' width='13' height='15' /></td>");
d.write("<td align='left'><img src='img/_spacer.gif' alt='' width='177' height='15' /></td>");
d.write("<td align='left'><img src='img/_spacer.gif' alt='' width='8' height='15' /></td>");
d.write("<td align='left'><img src='img/_spacer.gif' alt='' width='177' height='15' /></td>");
d.write("<td align='left'><img src='img/_spacer.gif' alt='' width='8' height='15' /></td>");
d.write("<td align='left'><img src='img/_spacer.gif' alt='' width='177' height='15' /></td>");
d.write("<td align='left'><img src='img/_spacer.gif' alt='' width='8' height='15' /></td>");
d.write("<td align='left'><img src='img/_spacer.gif' alt='' width='177' height='15' /></td>");
d.write("<td align='left'><img src='img/_spacer.gif' alt='' width='13' height='15' /></td>");
d.write("</tr>");
d.write("<tr>");
d.write("<td align='left'>&nbsp;</td>");
d.write("<td align='left'><a href='javascript:void(0)' tabindex='10' id='auto_surr'><img src='img/btn_4toggle1a.gif' alt='AUTO SURR/ALC/ STREAM DIRECT' width='177' height='42' border='0' id='Image8' onmousedown=\"MM_swapImage('Image8','','img/btn_4toggle1c.gif',1)\" onmouseout='MM_swapImgRestore()' onmouseup='MM_swapImgRestore()' /></a></td>");
d.write("<td align='left'>&nbsp;</td>");
d.write("<td align='left'><a href='javascript:void(0)' tabindex='12' id='standard_surround'><img src='img/btn_4toggle3a.gif' alt='STANDARD SURROUND' width='177' height='42' border='0' id='Image9' onmousedown=\"MM_swapImage('Image9','','img/btn_4toggle3c.gif',1)\" onmouseout='MM_swapImgRestore()' onmouseup='MM_swapImgRestore()' /></a></td>");
d.write("<td align='left'>&nbsp;</td>");
d.write("<td align='left'><a href='javascript:void(0)' tabindex='13' id='advanced_surround'><img src='img/btn_4toggle4a.gif' alt='ADVANCED SURROUND' width='177' height='42' border='0' id='Image10' onmousedown=\"MM_swapImage('Image10','','img/btn_4toggle4c.gif',1)\" onmouseout='MM_swapImgRestore()' onmouseup='MM_swapImgRestore()' /></a></td>");
d.write("<td align='left'>&nbsp;</td>");
d.write("<td align='left'><a href='javascript:void(0)' tabindex='14' id='stereo_surround'><img src='img/btn_4toggle5a.gif' alt='STEREO' width='177' height='42' border='0' id='Image11' onmousedown=\"MM_swapImage('Image11','','img/btn_4toggle5c.gif',1)\" onmouseout='MM_swapImgRestore()' onmouseup='MM_swapImgRestore()' /></a></td>");
d.write("<td align='left'>&nbsp;</td>");
d.write("</tr>");
d.write("<tr>");
d.write("<td align='left'><img src='img/_spacer.gif' alt='' width='13' height='15' /></td>");
d.write("<td align='left'>&nbsp;</td>");
d.write("<td align='left'>&nbsp;</td>");
d.write("<td align='left'>&nbsp;</td>");
d.write("<td align='left'>&nbsp;</td>");
d.write("<td align='left'>&nbsp;</td>");
d.write("<td align='left'>&nbsp;</td>");
d.write("<td align='left'>&nbsp;</td>");
d.write("<td align='left'>&nbsp;</td>");
d.write("</tr>");
}
}
