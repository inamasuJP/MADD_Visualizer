/* 2020/10/13 もとのプログラムの操作順を可視化するプログラム */
// (Memo) Read modify write (RMW)

const vebose = true;

let canvas1, ctx1;
let canvas2, ctx2;
let canvas3, ctx3;
let div1,div2,div3;

const BATCH = 1, IC = 3, IM = 4, OC = 3, M = 4; K = 3;
// const BATCH = 10, IC = 9, IM =12, OC = 32, M = 12; K = 3; // mnist
let leftFlg = false, rightFlg = false;
let step = 0; // 0 <= step < M*M*OC*BATCH*IC*K*K - 1
console.log(0+"<= step <"+M*M*OC*BATCH*IC*K*K);


function init(){
  div1 = document.getElementById("div1");
  div2 = document.getElementById("div2");
  div3 = document.getElementById("div3");
  // div_add(div1,"OC",OC);
  // div_add(div1,"BATCH",BATCH);
  canvas1 = document.getElementById("canvas1");
  ctx1 = canvas1.getContext('2d');
  canvas2 = document.getElementById("canvas2");
  ctx2 = canvas2.getContext('2d');
  canvas3 = document.getElementById("canvas3");
  ctx3 = canvas3.getContext('2d');
  if (canvas1.getContext && canvas2.getContext && canvas3.getContext) move_2loop();
  else console.log("Error");
  document.addEventListener("keydown", KeyDownFunc);
  document.addEventListener("keyup", KeyUpFunc);
}

function div_add(div,name,max){
  const text = document.createTextNode(name);
  const num = document.createElement("input");
    num.setAttribute('type','number');
    num.setAttribute('id','num_'+name);
    num.addEventListener('change',move_2loop);
    num.setAttribute('value','1');
    num.setAttribute('min','1');
    num.setAttribute('max',max);
  const text_end = document.createTextNode("/" +max+ " ");
  div.appendChild(text);
  div.appendChild(num);
  div.appendChild(text_end);
}
function KeyDownFunc(e){
  if (e.keyCode == 37) leftFlg = true;
  else if(e.keyCode == 39) rightFlg = true;
  move_2loop();
}
function KeyUpFunc(e){
  if ( e.keyCode == 37 ) leftFlg = false;
  else if(e.keyCode == 39) rightFlg = false;
}

function calc_2loop(val){
    /* step is img*ch*mat = BATCH * (IC*K*K) * (M*M*OC)  */
  val.img = parseInt(step / ((IC*K*K) * (M*M*OC)) );
  val.ch  = parseInt(step % ((IC*K*K)*(M*M*OC)) / (M*M*OC) );
  val.mat = parseInt(step % (M*M*OC) );

  let x0, y0;
  // if (K == 1 || IM-K+1 == M) { y0 = 0; x0 = 0; }
  // else if (IM == M)          { y0 = parseInt(-K/2); x0 = parseInt(-K/2); }
  y0 = parseInt(-K/2); x0 = parseInt(-K/2); 
  val.ic = parseInt( val.ch/(K*K) );
  val.y = parseInt(val.ch%(K*K)/K) + y0;
  val.x = parseInt(val.ch%K) + x0;

  val.rofs = parseInt( val.mat / (M*OC) );
  val.cofs = parseInt( val.mat % (M*OC)/OC );
  val.oc = parseInt( val.mat % OC );

}

function move_2loop() {
  // let img=0,ch=0,mat=0,ic=0,y=0,x=0,oc=0,rofs=0,cofs=0;
  let val = { img:0,ch:0,mat:0,ic:0,y:0,x:0,oc:0,rofs:0,cofs:0 };

  /* Change address by keyboard input */
  if (leftFlg && 0 < step) step--;
  else if(rightFlg && step < M*M*OC*BATCH*IC*K*K -1) step++;
  calc_2loop(val);


  /* Skip */
  while( val.ic<0 || val.oc<0 || val.rofs+val.y < 0 || IM <= val.rofs+val.y || val.cofs+val.x < 0 || IM <= val.cofs+val.x ){
    step++;
    if(M*M*OC*BATCH*IC*K*K -1 < step) {
      step = 0;
      console.log("Reset step: "+step);
    }
    if(vebose) console.log("Skip step: "+step);
    calc_2loop(val);
  }
  calc_2loop(val);
  if(vebose)console.log("step:"+step+" img:"+val.img+" ch:"+val.ch+" mat:"+val.mat+" ic:"+val.ic+" y:"+val.y+" x:"+val.x+" oc:"+val.oc+" rofs:"+val.rofs+" cofs:"+val.cofs);

  /* Out to HTML input num */
  // document.getElementById("num_OC").value = val.oc+1;
  // document.getElementById("num_BATCH").value = val.img+1;

  /* draw() */
  let ip0 =  parseInt( val.img*IC*IM*IM + val.ic*IM*IM + (val.y+val.rofs)*IM + (val.x+val.cofs) );
  let out0 = parseInt( val.img*M*M*OC   + val.oc*M*M   + val.rofs*M          + val.cofs);
  let ker = parseInt(val.oc*IC*K*K+val.ch);
  if( (val.ic<0 || val.oc<0 ) || (val.rofs+val.y < 0 || IM < val.rofs+val.y || val.cofs+val.x < 0 || IM < val.cofs+val.x) ) console.log("Error");
  else draw(ip0,ker,out0);
}


function move() {
  /* Calculate cofs,rofs,ch */
  let cofs = parseInt(step % M);
  let rofs = parseInt(step % (M*M) / M);
  let ch = parseInt(step/(M*M*OC*BATCH));

  /* Read HTML input num */
  let oc = document.getElementById("num_OC").value -1;
  let img = document.getElementById("num_BATCH").value -1;
  /* Apply change oc,batch to step */
  step = cofs + M*rofs + M*M*oc + M*M*OC*img + M*M*OC*BATCH*ch;
  /* Change address by keyboard input */
  if (leftFlg && 0 < step) step--;
  else if(rightFlg && step < M*M*OC*BATCH*IC*K*K -1) step++;
  /* Skip */
  let x0, y0;
  if (K == 1 || IM-K+1 == M) { y0 = 0; x0 = 0; }
  else if (IM == M)          { y0 = -1; x0 = -1; }
  let x  = parseInt(ch%(K*K)%K + x0);
  let y  = parseInt(ch%(K*K)/K + y0);
  if(vebose) console.log("rofs: "+rofs+" y: "+y+" cofs: "+cofs+" x: "+x+" rofs+y: "+(rofs+y)+" cofs+x: "+ (cofs+x) );
  while(step < M*M*OC*BATCH*IC*K*K -1 && (x < 0 || y < 0) || !(0<=rofs+y && rofs+y<IM && 0<=cofs+x && cofs+x<IM) ){
    step++;
    if(M*M*OC*BATCH*IC*K*K -1 < step) {
      step = 0;
      console.log("Reset step: "+step);
    }
    if(vebose) console.log("Skip step: "+step);
    ch = parseInt(step/(M*M*OC*BATCH));
    x  = parseInt(ch%(K*K)%K + x0);
    y  = parseInt(ch%(K*K)/K + y0);
  }

  /* Out to HTML input num */
  oc = parseInt(step%(M*M*OC)/(M*M));
  img = parseInt(step%(M*M*OC*BATCH)/(M*M*OC));
  document.getElementById("num_OC").value = oc+1;
  document.getElementById("num_BATCH").value = img+1;

  /* Calculate cofs,rofs*/
  cofs = parseInt(step % M);
  rofs = parseInt(step % (M*M) / M);

  /* Calculate ip0,ker,out0 address & draw() */
  let ic = parseInt(ch/(K*K));
  let ip0 = parseInt((img*IC+ic)*IM*IM+y*IM+x + rofs*IM+cofs);
  let ker = parseInt(oc*IC*K*K+ch);
  let out0 = parseInt(img*M*M*OC+oc*M*M+rofs*M+cofs);
  if(vebose) console.log("step: " +step+" cofs: "+cofs+" rofs: "+rofs+" oc: "+oc+" img: "+img+" ch: "+ch+" x: "+x+" y: "+y+" ic: "+ic);
  if(0<=x && 0<=y) draw(ip0,ker,out0);
  else console.log("Error");
}

function draw(ip0,ker,out0){
  /* draw_4D_order(ctx,X軸名,y軸名,z軸名,w軸名,x軸最大値,y軸最大値,z軸最大値,w軸最大値,Enable_Red, address) */
  draw_4D_order(ctx1,"IM","IM","IC","BATCH",IM,IM,IC,BATCH,true,ip0);
  draw_4D_order(ctx2,"K","K","IC","OC",K,K,IC,OC,false,ker);
  draw_4D_order(ctx3,"M","M","OC","BATCH",M,M,OC,BATCH,false,out0);
  // draw_4D_test(ctx1,"IM","IM","IC","BATCH",IM,IM,IC,BATCH,true,ip0);
  // draw_4D_test(ctx2,"K","K","IC","OC",K,K,IC,OC,false,ker);
  // draw_4D_test(ctx3,"M","M","OC","BATCH",M,M,OC,BATCH,false,out0);
}

function draw_4D_test(ctx,str_X,str_Y,str_Z,str_W, X, Y, Z, W, selectFlg,address){
    /* Convert address to x,y,z,w */
    let x = -1, y = -1, z = 0, w = 0;
    if(0<=address && address < X*Y*Z*W){
      x = parseInt(address % X);
      y = parseInt(address % (X*Y) / X);
      z = parseInt(address % (X*Y*Z) / (X*Y));
      w = parseInt(address / (X*Y*Z) );
    }
    else console.log("draw_4D_order_Error");
}

function draw_4D_order(ctx,str_X,str_Y,str_Z,str_W, X, Y, Z, W, selectFlg,address){
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