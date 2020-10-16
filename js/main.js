/* 2020/10/14 もとのプログラムの操作順を可視化するプログラム */
/* 2020/10/16 計算順の計算の関数(calc_***();)はcalc.jsに分割した */

const vebose = true;

let canvas1, ctx1;
let canvas2, ctx2;
let canvas3, ctx3;
let div1;

const BATCH = 5, IC = 5, IM = 4, OC = 2, M = 4; K = 3;
// const BATCH = 10, IC = 9, IM =12, OC = 32, M = 12; K = 3; // mnist
let leftFlg = false, rightFlg = false;
let step = 0; // 0 <= step < M*M*OC*BATCH*IC*K*K - 1

function init(test){
  console.log(0+"<= step <"+M*M*OC*BATCH*IC*K*K);
  div1 = document.getElementById("div1");
  div_add_num(div1,"step",M*M*OC*BATCH*IC*K*K);

  canvas1 = document.getElementById("canvas1");
  ctx1 = canvas1.getContext('2d');
  canvas2 = document.getElementById("canvas2");
  ctx2 = canvas2.getContext('2d');
  canvas3 = document.getElementById("canvas3");
  ctx3 = canvas3.getContext('2d');
  if (canvas1.getContext && canvas2.getContext && canvas3.getContext) move(test);
  else console.log("Error");
  document.addEventListener("keydown", {text:test, handleEvent: KeyDownFunc});
  document.addEventListener("keyup", KeyUpFunc);
}
function div_add_num(div,name,max){
  const text = document.createTextNode(name);
  const num = document.createElement("input");
    num.setAttribute('type','number');
    num.setAttribute('id','num_'+name);
    num.addEventListener('change',move);
    num.setAttribute('value','0');
    num.setAttribute('min','0');
    num.setAttribute('max',max-1);
  const text_end = document.createTextNode("/" +(max-1)+ " ");
  div.appendChild(text);
  div.appendChild(num);
  div.appendChild(text_end);
}
function KeyDownFunc(e){
  if (e.keyCode == 37) leftFlg = true;
  else if(e.keyCode == 39) rightFlg = true;
  move(this.text);
}
function KeyUpFunc(e){
  if ( e.keyCode == 37 ) leftFlg = false;
  else if(e.keyCode == 39) rightFlg = false;
}

function move(test) {
  if(test) var func = test;
  let val = { img:0,ch:0,mat:0,ic:0,y:0,x:0,oc:0,rofs:0,cofs:0 };

  /* Read HTML input num */
  step = document.getElementById("num_step").value;

  /* Change address by keyboard input */
  if (leftFlg && 0 < step) step--;
  else if(rightFlg && step < M*M*OC*BATCH*IC*K*K -1) step++;
  // calc_2loop(val);
  eval("calc_"+func+"(val)"); // calc.js


  /* Skip */
  while( val.ic<0 || val.oc<0 || val.rofs+val.y < 0 || IM <= val.rofs+val.y || val.cofs+val.x < 0 || IM <= val.cofs+val.x ){
    step++;
    if(M*M*OC*BATCH*IC*K*K -1 < step) {
      step = 0;
      console.log("Reset step: "+step);
    }
    if(vebose) console.log("Skip step: "+step);
    eval("calc_"+func+"(val)"); // calc.js
  }
  eval("calc_"+func+"(val)"); // calc.js
  if(vebose)console.log("step:"+step+" img:"+val.img+" ch:"+val.ch+" mat:"+val.mat+" ic:"+val.ic+" y:"+val.y+" x:"+val.x+" oc:"+val.oc+" rofs:"+val.rofs+" cofs:"+val.cofs);

  /* Output to HTML input num */
  document.getElementById("num_step").value = step;

  /* draw() */
  let ip0 =  parseInt( val.img*IC*IM*IM + val.ic*IM*IM + (val.y+val.rofs)*IM + (val.x+val.cofs) );
  let out0 = parseInt( val.img*M*M*OC   + val.oc*M*M   + val.rofs*M          + val.cofs);
  let ker = parseInt(val.oc*IC*K*K+val.ch);
  if( (val.ic<0 || val.oc<0 ) || (val.rofs+val.y < 0 || IM < val.rofs+val.y || val.cofs+val.x < 0 || IM < val.cofs+val.x) ) console.log("Error");
  else draw(ip0,ker,out0);
}

function draw(ip0,ker,out0){
  /* draw_4D_order(ctx,X軸名,y軸名,z軸名,w軸名,x軸最大値,y軸最大値,z軸最大値,w軸最大値,Enable_Red, address) */
  draw_4D(ctx1,"IM","IM","IC","BATCH",IM,IM,IC,BATCH,true,ip0);
  draw_4D(ctx2,"K","K","IC","OC",K,K,IC,OC,false,ker);
  draw_4D(ctx3,"M","M","OC","BATCH",M,M,OC,BATCH,false,out0);
}

function draw_4D(ctx,str_X,str_Y,str_Z,str_W, X, Y, Z, W, selectFlg,address){
  /* Convert address to x,y,z,w */
  let x = -1, y = -1, z = 0, w = 0;
  if(0<=address && address < X*Y*Z*W){
    x = parseInt(address % X);
    y = parseInt(address % (X*Y) / X);
    z = parseInt(address % (X*Y*Z) / (X*Y));
    w = parseInt(address / (X*Y*Z) );
  }
  else console.log("draw_4D_order_Error");
  /* Clear  */
  ctx.fillStyle = "#eee";
  ctx.fillRect(0,0,640,360);
  /* Draw 3D */
  ctx.shadowColor="black";
  ctx.shadowBlur=10;
  ctx.fillStyle="gray";
  for (let i = Z-1; 0 <= i; i--){
    let width = 280; 
    let height = 280;
    let xbegin = 40;
    let ybegin = 40;
    let xofs = 10;
    let yofs = 10;
    ctx.fillRect(xbegin + xofs*(i-z), ybegin - yofs*(i-z),width,height);
  }
  /* Draw 2D Matrix */
  ctx.shadowBlur=0;
  ctx.strokeStyle="black";
  ctx.lineWidth=3;
  ctx.fillStyle="lightgray";
  ctx.fillRect(40,40,280,280);
  ctx.strokeRect(40,40,280,280);
  ctx.lineWidth=1;
  for(let i = 0; i < X ; i++){
    for(let j = 0; j<Y; j++){
      width = (280-10)/X;
      height = (280-10)/Y;
      xbegin = 40+5;
      ybegin = 40+5;
      if(i == x && j == y){
        if(selectFlg) ctx.fillStyle = "red";
        else ctx.fillStyle = "green";
        ctx.fillRect(xbegin+i*width,ybegin+j*height,width,height);
      }
      else ctx.strokeRect(xbegin+i*width,ybegin+j*height,width,height);
    }
  }
  ctx.strokeRect(45,45,270,270);

  /* Draw axis names */
  ctx.beginPath();
  ctx.moveTo(40, 40);
  ctx.arcTo(10,180,40,320, 560);
  ctx.lineTo(40, 320);
  ctx.lineWidth=1;
  ctx.stroke();
  ctx.fillStyle="black"
  ctx.font = "24px Arial";
  ctx.fillText(str_X,0,180+12);

  ctx.moveTo(40, 320);
  ctx.arcTo(180,350,320,320, 560);
  ctx.lineTo(320, 320);
  ctx.stroke();
  ctx.fillText(str_Y,180-12,357);

  ctx.moveTo(40+280 -z*10, 40+280 +z*10);
  ctx.arcTo(40+280+5*(Z-1)+20-z*10, 40+280-5*(Z-1)+20+z*10,40+280+10*(Z-1)-z*10 , 40+280-10*(Z-1)+z*10, 10);
  ctx.lineTo(40+280+10*(Z-1)-z*10 , 40+280-10*(Z-1)+z*10);
  ctx.stroke();
  ctx.fillText(str_Z,40+280+5*(Z-1)+30-z*10, 40+280-5*(Z-1)+30+z*10);

  ctx.font = "36px Arial";
  ctx.fillText(str_W +": "+ w +"/"+(W-1),620-180,360-5);
}