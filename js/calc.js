
function calc_pbl1_5_original(val){
    /* step is ch*img*oc*rofs*cfos = (IC*K*K) * BATCH * OC * M * M  */
    val.ch  = parseInt(step / (BATCH * OC * M * M));
    val.img = parseInt(step % (BATCH * OC * M * M) / (OC * M * M) );
    val.mat = -1;
    val.oc = parseInt(step % (OC * M * M) / (M * M) );
    val.rofs = parseInt(step % (M * M) / M );
    val.cofs = parseInt(step % M );
  
    let x0, y0;
    y0 = parseInt(-K/2); x0 = parseInt(-K/2); 
    val.ic = parseInt( val.ch/(K*K) );
    val.y = parseInt(val.ch%(K*K)/K) + y0;
    val.x = parseInt(val.ch%K) + x0;
  }
  
  function calc_pbl1_5_2loop(val){
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