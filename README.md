# MADD_addressViewer

Visualize the address of the multiply-add operation.

## Description

To improve performance in IMAX, we need to reduce transfers between main memory and local memory(LMM).

This web application visualizes the address of the multiply-add operation of 4D arrays.

## Author

Hidenari Inamasu 

## How to use

Access【Program Link】 , and Press the right arrow (→) key.

## Program Links

### 1. PBL1-5_Original

- Original C code for PBL1-5.

[【Program Link】](pbl1_5_original.html)

```c
if (K == 1 || IM-K+1 == M) { y0 = 0;    x0 = 0;    }
else if (IM == M)          { y0 = -K/2; x0 = -K/2; }
for (ch=0;ch<IC*K*K;ch++) { /*5x5, 8x3x3*/
  ic = ch/(K*K);
  y  = ch%(K*K)/K + y0;
  x  = ch%(K*K)%K + x0;
  for (img=0;img<BATCH;img++) { /*100, 100*/
    for (oc=0; oc<OC; oc++) {
      op0 = &i_out[img*M*M*OC+oc*M*M];
      ip0 = &i_inp[(img*IC+ic)*IM*IM+y*IM+x];
      float cker = *(float*)&i_ker[oc*IC*K*K+ch];
      for (rofs=0;rofs<M;rofs++) { /*24, 10*/
        for (cofs=0;cofs<M;cofs++) { /*24, 10*/
          if (0<=rofs+y && rofs+y<IM && 0<=cofs+x && cofs+x<IM)
            *(float*)&ip0[rofs*IM+cofs] += cker * *(float*)&op0[rofs*M+cofs];
        }
      }
    }
  }
```

### 2. PBL1-5_2loop

- Reduced the number of "for" in PBL1-5 code.
- Changed innermost "for" to OC.


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
    for (mat=0;mat<M*M*OC;mat++){ // LOOP0
      rofs = mat / (M*OC);
      cofs = mat % (M*OC) / OC;
      oc   = mat & M;

      if (0<=rofs+y && rofs+y<IM && 0<=cofs+x && cofs+x<IM){
        ip0 =  &in0[img*IC*IM*IM + ic*IM*IM + (y+rofs)*IM + x+cofs];
        op0 = &out0[img*M*M*OC   + oc*M*M   + rofs*M      + cofs];
        float cker = *(float*)&ker[oc*IC*K*K+ch];
        *(float*)ip0 += cker * *(float*)op0;
} } } }
```
### 3. PBL1-5_Stop_ip0

- Changed the address order of A to be continuous.

[【Program Link】](pbl1_5_Stop_ip0.html)

```c
memset(in0, 0, sizeof(in0[0])*BATCH*IC*IM*IM);
if (K == 1 || IM-K+1 == M) { y0 = 0;    x0 = 0;    }
else if (IM == M)          { y0 = -K/2; x0 = -K/2; }

for (img=0;img<BATCH;img++) { // IMAXの64段やCHIPに展開
  for (ic=0;ic<IC;ic++) {
    for (Ty=0;Ty<IM;Ty++) { // Ty = rofs + y
      for (Tx=0;Tx<IM;Tx++) { // Tx = cofs + x
        for (y=y0;y<=K+y0;y++) { 
          for (x=x0;x<=K+x0;x++) {
              for (oc=0; oc<OC; oc++) {
                rofs = Ty - y;
                cofs = Tx - x;
                if (0<=rofs && rofs<IM && 0<=cofs && cofs<IM){
                  ip0 =  &in0[img*IC*IM*IM + ic*IM*IM + Ty*IM + Tx];
                  op0 = &out0[img*M*M*OC   + oc*M*M   + rofs*M      + cofs];
                  float cker = *(float*)&ker[oc*IC*K*K+ch];
                  *(float*)ip0 += cker * *(float*)op0;
} } } } } } } } }
```