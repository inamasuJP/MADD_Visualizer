let canvas1, ctx1;
let canvas2, ctx2;
let canvas3, ctx3;
let div1,div2,div3;
const BATCH = 5, IC = 9, xIM = 12,yIM = 12,IM =12, OC = 32, xM = 12, yM = 12, M = 12;xK = 3, yK = 3;
let cofs = 0,rofs = 0;
let xim = 0, yim = 0,ic = 0, img = 0, oc = 0, xm = 0, ym = 0, xk = 0, yk = 0, ch = 0;
var leftFlg = false, rightFlg = false, upFlg = false, downFlg = false;

let AB = new Array(xIM*yIM*IC*BATCH);
let AC = new Array(xIM*yIM*IC*BATCH);

function calc(){
  let M = xM, K = xK, IM = xIM;
  let img, oc, top, ic, y, x, rofs,cofs;
  var ip0,ker,out0;
  let y0, x0, ch;
  if (K == 1 || IM-K+1 == M) { y0 = 0;    x0 = 0;    }
  else if (IM == M)          { y0 = -1; x0 = -1; }
  for (ch=0;ch<IC*K*K;ch++) { /*5x5, 8x3x3*/
    ic = parseInt(ch/(K*K));
    y  = parseInt(ch%(K*K)/K + y0);
    x  = parseInt(ch%(K*K)%K + x0);
    for (img=0;img<BATCH;img++) { /*100, 100*/
      for (oc=0; oc<OC; oc++) {
        for (rofs=0;rofs<M;rofs++) { /*24, 10*/
          for (cofs=0;cofs<M;cofs++) { /* 24, 10*/
            // if (0<=rofs+y && rofs+y<IM && 0<=cofs+x && cofs+x<IM){
            if(0<=rofs+y && rofs+y<IM && 0<=x && x<IM && 0<=cofs && cofs<IM){
              ip0 = parseInt(((img*IC+ic)*IM+rofs+y)*IM+x);
              ker = parseInt(oc*IC*K*K+ch);
              out0 = parseInt(img*M*M*OC+oc*M*M+rofs*M+cofs);
              if(0 < ip0 && ip0 < xIM*yIM*IC*1) {
                AB[ip0][ker]++;
                AC[ip0][out0]++;
              }
            }
            ip0++;
  } } } } }
  console.log(AB);
  document.getElementById("div2").appendChild(document.createTextNode(" Complete!"));
  move();
}

function div_add(div,name,max){
  // const check = document.createElement("input");
  //   check.setAttribute('type','checkbox');
  //   check.setAttribute('id','check_'+name);
  //   check.setAttribute('onclick','move();');
  const text = document.createTextNode(name);
  const num = document.createElement("input");
    num.setAttribute('type','number');
    num.setAttribute('id','num_'+name);
    num.addEventListener('change',move);
    num.setAttribute('value','1');
    num.setAttribute('min','1');
    num.setAttribute('max',max);
  const text_end = document.createTextNode("/" +max+ " ");
  // div.appendChild(check);
  div.appendChild(text);
  div.appendChild(num);
  div.appendChild(text_end);
}


function init(){
  // for (let i = 0; i < xIM*yIM*IC*BATCH;i++){
  //   AB[i] = new Array(xK*yK*IC*OC);
  //   AC[i] = new Array(xIM*yIM*OC*BATCH);
  //   AB[i].fill(0);
  //   AC[i].fill(0);
  // }
  // console.log(AB);

  div1 = document.getElementById("div1");
  div2 = document.getElementById("div2");
  div3 = document.getElementById("div3");
  // div_add(div1,"xIM",xIM);
  // div_add(div1,"yIM",yIM);
  div_add(div1,"IC",IC);
  div_add(div1,"OC",OC);
  div_add(div1,"BATCH",BATCH);

  // const button = document.createElement("button");
  // button.setAttribute('onclick','calc();');
  // button.textContent = 'Calculation'
  // div2.appendChild(button);
  // div_add(div2,"xM",xM);
  // div_add(div2,"yM",yM);
  // div_add(div3,"xK",xK);
  // div_add(div3,"yK",yK);

  canvas1 = document.getElementById("canvas1");
  ctx1 = canvas1.getContext('2d');
  canvas2 = document.getElementById("canvas2");
  ctx2 = canvas2.getContext('2d');
  canvas3 = document.getElementById("canvas3");
  ctx3 = canvas3.getContext('2d');
  if (canvas1.getContext && canvas2.getContext && canvas3.getContext){
    draw();
    // setInterval( draw , 33 );
  }
  document.addEventListener("keydown", KeyDownFunc);
  document.addEventListener("keyup", KeyUpFunc);
  // setInterval(move, 1000/10);
}

function KeyDownFunc(e){
  // console.log(e.keyCode);
  if (e.keyCode == 37) leftFlg = true;
  else if(e.keyCode == 39) rightFlg = true;
  move();
}

function KeyUpFunc(e){
  if ( e.keyCode == 37 ) leftFlg = false;
  else if(e.keyCode == 39) rightFlg = false;
  move();
}


function move() {
  // xim = document.getElementById("num_xIM").value -1;
  // yim = document.getElementById("num_yIM").value -1;
  ic = document.getElementById("num_IC").value -1;
  img = document.getElementById("num_BATCH").value -1;
  // // xm = document.getElementById("num_xM").value -1;
  // // ym = document.getElementById("num_yM").value -1;
  // // xk = document.getElementById("num_xK").value -1;
  // // yk = document.getElementById("num_yK").value -1;
  oc = document.getElementById("num_OC").value -1;

  // let i = xIM * yim + xim;
  ch = ic * xK*yK;
  let i = cofs + M*rofs + M*M*oc + M*M*OC*img + M*M*OC*BATCH*ch;
  if (leftFlg) {
    if(0 < i) i--;
  }
  if(rightFlg) {
    if(i < M*M*OC*BATCH*IC*xK*yK -1) i++;
  }
  console.log("i: " +i+" cofs: "+cofs+" rofs: "+rofs+" oc: "+oc+" img: "+img+" ch: "+ch);

  cofs = parseInt(i%M);
  rofs = parseInt(i%(M*M)/M);
  oc = parseInt(i%(M*M*OC)/(M*M));
  img = parseInt(i%(M*M*OC*BATCH)/(M*M*OC));
  ch = parseInt(i/(M*M*OC*BATCH));
  // xim = parseInt(i%xIM);
  // yim = parseInt(i/xIM);
  // document.getElementById("num_xIM").value = xim+1;
  // document.getElementById("num_yIM").value = yim+1;
  document.getElementById("num_IC").value = parseInt(ch/(xK*yK))+1;
  document.getElementById("num_BATCH").value = img+1;
  document.getElementById("num_OC").value = oc+1;

  let x  = parseInt(ch%(xK*yK)%xK -1);
  let y  = parseInt(ch%(xK*yK)/xK -1);
  let ip0 = parseInt(((img*IC+ic)*yIM+rofs+y)*xIM+x);
  let ker = parseInt(oc*IC*xK*yK+ch);
  let out0 = parseInt(img*xM*yM*OC+oc*xM*yM+rofs*xM+cofs);
  draw(ip0,ker,out0);
}


function draw(ip0,ker,out0){
  // draw_4D(ctx1,"xIM","yIM","IC","BATCH",xIM,yIM,IC,BATCH, xim,yim,ic,img,true,ip0);
  // draw_4D(ctx2,"xK","yK","IC","OC",xK,yK,IC,OC, xk,yk,ic,oc,false,ker);
  // draw_4D(ctx3,"xM","yM","OC","BATCH",xM,yM,OC,BATCH, xm,ym,oc,img,false,out0);
  draw_4D_order(ctx1,"xIM","yIM","IC","BATCH",xIM,yIM,IC,BATCH,true,ip0);
  draw_4D_order(ctx2,"xK","yK","IC","OC",xK,yK,IC,OC,false,ker);
  draw_4D_order(ctx3,"xM","yM","OC","BATCH",xM,yM,OC,BATCH,false,out0);
}

function draw_4D_order(ctx,str_X,str_Y,str_Z,str_W, X, Y, Z, W, selectFlg,num){
  /* Convert num to x,y,z,w */
  let x = parseInt(num % X);
  let y = parseInt(num % (X*X) / X);
  let z = parseInt(num % (X*Y*Z) / X*Y);
  let w = parseInt(num / (X*Y*Z*W) );
  /* Clear */
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
  /*Draw Matrix */
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
          if(selectFlg && i == x && j == y) {
            ctx.fillStyle = "red";
            ctx.fillRect(xbegin+i*width,ybegin+j*height,width,height);
          }
          else if (!selectFlg && i == x && j == y) 
          {
            ctx.fillStyle = "green";
            ctx.fillRect(xbegin+i*width,ybegin+j*height,width,height);
          }
          else ctx.strokeRect(xbegin+i*width,ybegin+j*height,width,height);
      }
  }
  ctx.strokeRect(45,45,270,270);

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
  ctx.arcTo(40+280+5*(Z-1)+20-z*10, 40+280-5*(Z-1)+20+z*10,40+280+10*(Z-1)-z*10 , 40+280-10*(Z-1)+z*10, 100);
  ctx.lineTo(40+280+10*(Z-1)-z*10 , 40+280-10*(Z-1)+z*10);
  ctx.stroke();
  ctx.fillText(str_Z,40+280+5*(Z-1)+30-z*10, 40+280-5*(Z-1)+30+z*10);

  ctx.font = "36px Arial";
  ctx.fillText(str_W +": "+ w,620-180,360-5);
}

function draw_4D(ctx,str_X,str_Y,str_Z,str_W, X, Y, Z, W, x, y, z, w,selectFlg,A){
  ctx.fillStyle = "#eee";
  ctx.fillRect(0,0,640,360); // clear
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
          if(selectFlg && i == x && j == y) {
            ctx.fillStyle = "red";
            ctx.fillRect(xbegin+i*width,ybegin+j*height,width,height);
          }
          else if (!selectFlg && parseInt(((w*Z+z)*Y+y)*X+x)!=0) 
          {
            ctx.fillStyle = "green";
            ctx.fillRect(xbegin+i*width,ybegin+j*height,width,height);
          }
          else ctx.strokeRect(xbegin+i*width,ybegin+j*height,width,height);
      }
  }
  ctx.strokeRect(45,45,270,270);

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
  ctx.arcTo(40+280+5*(Z-1)+20-z*10, 40+280-5*(Z-1)+20+z*10,40+280+10*(Z-1)-z*10 , 40+280-10*(Z-1)+z*10, 100);
  ctx.lineTo(40+280+10*(Z-1)-z*10 , 40+280-10*(Z-1)+z*10);
  ctx.stroke();
  ctx.fillText(str_Z,40+280+5*(Z-1)+30-z*10, 40+280-5*(Z-1)+30+z*10);

  ctx.font = "36px Arial";
  ctx.fillText(str_W +": "+ w,620-180,360-5);

}