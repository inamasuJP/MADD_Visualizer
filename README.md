# MADD_Visualizer

Visualize the address of the multiply-add operation.

## Description

To improve performance in IMAX, we need to reduce transfers between main memory and local memory(LMM).

This web application visualizes the address of the multiply-add operation of 4D arrays.

## Author

Hidenari Inamasu

## Programs

### 1. PBL1-5_2loop

Reduced the number of for loop in PBL1-5 code to 2.

[【Program Link】](pbl1_5_2loop.html)

```c
memset(in0, 0, sizeof(in0[0])*BATCH*IC*IM*IM);
if (K == 1 || IM-K+1 == M) { y0 = 0;    x0 = 0;    }
else if (IM == M)          { y0 = -K/2; x0 = -K/2; }

for (img=0;img<BATCH;img++) { // IMAXの64段やCHIPに展開
  for (ch=0;ch<IC*K*K;ch++) { // LOOP1
    ic = ch/(K*K);
    y  = ch%(K*K)/K + y0;
    x  = ch%(K*K)%K + x0;
    for (mat=0;mat<OC*M*M;mat++){ // LOOP0
      oc   = mat / (M*M);
      rofs = mat % (M*M) / M;
      cofs = mat % M;

      if (0<=rofs+y && rofs+y<IM && 0<=cofs+x && cofs+x<IM){
        ip0 =  &in0[img*IC*IM*IM + ic*IM*IM + (y+rofs)*IM + x+cofs];
        op0 = &out0[img*M*M*OC   + oc*M*M   + rofs*M      + cofs];
        float cker = *(float*)&ker[oc*IC*K*K+ch];
        *(float*)ip0 += cker * *(float*)op0;
} } } }
```
