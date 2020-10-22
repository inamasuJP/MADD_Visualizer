
function calc_pbl1_5_original(val){
    /* step is ch*img*oc*rofs*cfos = (IC*K*K) * BATCH * OC * M * M  */
    let ch  = parseInt(step / (BATCH * OC * M * M));
    val.img = parseInt(step % (BATCH * OC * M * M) / (OC * M * M) );
    val.oc = parseInt(step % (OC * M * M) / (M * M) );
    val.rofs = parseInt(step % (M * M) / M );
    val.cofs = parseInt(step % M );
  
    let x0, y0;
    y0 = parseInt(-K/2); x0 = parseInt(-K/2); 
    val.ic = parseInt( ch/(K*K) );
    val.y = parseInt(ch%(K*K)/K) + y0;
    val.x = parseInt(ch%K) + x0;
    val.skip = (val.ic<0 || val.oc<0 || val.rofs+val.y < 0 || IM <= val.rofs+val.y || val.cofs+val.x < 0 || IM <= val.cofs+val.x );

  }
  
  function calc_pbl1_5_2loop(val){
    /* step is img*ch*mat = BATCH * (IC*K*K) * (M*M*OC)  */
    val.img = parseInt(step / ((IC*K*K) * (M*M*OC)) );
    let ch  = parseInt(step % ((IC*K*K)*(M*M*OC)) / (M*M*OC) );
    let mat = parseInt(step % (M*M*OC) );
  
    let x0, y0;
    // if (K == 1 || IM-K+1 == M) { y0 = 0; x0 = 0; }
    // else if (IM == M)          { y0 = parseInt(-K/2); x0 = parseInt(-K/2); }
    y0 = parseInt(-K/2); x0 = parseInt(-K/2); 
    val.ic = parseInt( ch/(K*K) );
    val.y = parseInt(ch%(K*K)/K) + y0;
    val.x = parseInt(ch%K) + x0;
  
    val.rofs = parseInt( mat / (M*OC) );
    val.cofs = parseInt( mat % (M*OC)/OC );
    val.oc = parseInt( mat % OC );
    val.skip = (val.ic<0 || val.oc<0 || val.rofs+val.y < 0 || IM <= val.rofs+val.y || val.cofs+val.x < 0 || IM <= val.cofs+val.x );
  }

  function calc_pbl1_5_Stop_ip0(val){
    /* step is img*ic*Ty*Tx*y*x*oc  */
    /* Ty = rofs + y */
    /* Tx = cofs + x */    
    let y0, x0 ,Ty,Tx;
    y0 = parseInt(-K/2); x0 = parseInt(-K/2); 

    val.img = parseInt(step / (IC*M*M*K*K*OC) );
    val.ic = parseInt(step % (IC*M*M*K*K*OC) / (M*M*K*K*OC) );
    Ty = parseInt(step % (M*M*K*K*OC) / (M*K*K*OC) );
    Tx = parseInt(step % (M*K*K*OC) / (K*K*OC) );
    val.y = parseInt(step % (K*K*OC) / (K*OC) ) + y0;
    val.x = parseInt(step % (K*OC) / OC ) + x0;
    val.oc = parseInt(step % OC );

    val.ch  = (K*K*val.ic + K*(val.y-y0) + val.x-x0);
    val.rofs = Ty - val.y;
    val.cofs = Tx - val.x;

    val.skip = (val.ic<0 || val.oc<0 || val.rofs< 0 || IM <= val.rofs || val.cofs< 0 || IM <= val.cofs );
    // console.log("cofs: "+val.cofs+" x: "+val.x+" Tx: "+Tx + " StopIP0");
  }