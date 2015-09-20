#include "heap.h"

#include <assert.h>

void heap_add(struct heap *h, node nd){
    if(h->idcs[nd] != -1) return;
    assert(h->used < h->cap);

    h->data[h->used] = nd;
    h->idcs[nd] = h->used;
    (h->used)++;
    
    heap_fix(h, nd);
}

// swaps two nodes in a heap
void swap(struct heap *h, int a_idx, int b_idx){
    node a = h->data[a_idx];
    node b = h->data[b_idx];

    h->idcs[a] = b_idx;
    h->idcs[b] = a_idx;
    h->data[a_idx] = b;
    h->data[b_idx] = a;
}

node heap_remove(struct heap *h){
    assert(h->used > 0);

    node ret = h->data[0];
    swap(h, 0, h->used - 1);
    h->idcs[ret] = -2;
    (h->used)--;

    int idx = 0;
    while(2*idx+1 < h->used){
        int min_idx = 2*idx+1;
        if(2*idx+2 < h->used && h->dls[h->data[2*idx+2]].dist <
                                h->dls[h->data[2*idx+1]].dist){
            min_idx = 2*idx+2;
        }

        if(h->dls[h->data[min_idx]].dist < h->dls[h->data[idx]].dist){
            swap(h, min_idx, idx);
            idx = min_idx;
        }else{
            break;
        }
    }
    return ret;
}

void heap_fix(struct heap *h, node nd){
    assert(h->idcs[nd] != -1);

    if(h->idcs[nd] == 0) return;
    int node_idx = h->idcs[nd];
    int parent_idx = (node_idx-1)/2;

    if(h->dls[h->data[parent_idx]].dist > h->dls[nd].dist){
        swap(h, node_idx, parent_idx);
        heap_fix(h, nd);
    }
}
