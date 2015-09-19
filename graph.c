#include "types.h"
#include "heap.h"

#include <stdio.h>
#include <stdlib.h>
#include <math.h>
#include <limits.h>
#include <assert.h>
#include <stdint.h>

typedef enum {UNSEEN, SEEN, DONE} dstatus;

// sends a state to a unique index
size_t state_to_index(struct icemap im, struct state st){
    size_t num_spaces = im.width * im.height;
    return (st.apos.y*im.width + st.apos.x) * num_spaces
            + (st.bpos.y*im.width + st.bpos.x);
}

// inverse of the above
struct state index_to_state(struct icemap im, size_t idx){
    size_t aidx = idx / (im.width * im.height);
    size_t bidx = idx % (im.width * im.height);
    struct point a = {aidx%im.width, aidx/im.width};
    struct point b = {bidx%im.width, bidx/im.width};
    struct state st = {a,b};
    return st;
}

// given an icemap im, a position p, and a blocked point b (i.e. the other
// player), determines where p will end up if they move in direction (xd, yd)
struct point move_res(struct icemap im, struct point p, struct point b,
                      int xd, int yd){
    struct point q = {p.x+xd, p.y+yd};
    while(1 <= q.x && q.x < im.width && 1 <= q.y && q.y < im.height &&
          !(q.x == b.x && q.y == b.y) && im.cells[q.y*im.width + q.x] == ICE){
        p = q;
        q.x += xd;
        q.y += yd;
    }
    if(1 <= q.x && q.x < im.width && 1 <= q.y && q.y < im.height &&
       im.cells[q.x*im.width + q.y] == DIRT){
        return q;
    }else{
        return p;
    }
}

// update a single node's heap/dls status, given a newly found path length
void update_node(struct heap *h, struct distlast *dls, size_t src, size_t dest,
                 size_t len, struct icemap im){ // TODO: remove im
    struct state sst = index_to_state(im, src);
    struct state dst = index_to_state(im, dest);
    if(dls[dest].dist == SIZE_MAX){
        dls[dest].dist = len;
        dls[dest].last = src;
        heap_add(h, dest);
    }else if(len < dls[dest].dist){
        dls[dest].dist = len;
        dls[dest].last = src;
        heap_fix(h, dest);
    }
}

// add all of a node's neighbours to the heap h and update their dls entries
void update_nbrs(struct icemap im, struct heap *h, struct distlast *dls,
                 size_t src){
    size_t cur_dist = dls[src].dist;
    struct state st = index_to_state(im, src);
    struct point a = st.apos;
    struct point b = st.bpos;

    // inelegant, but it works and is fast
    struct state aup = {move_res(im, a, b, 0, -1), b};
    struct state adown = {move_res(im, a, b, 0, 1), b};
    struct state aleft = {move_res(im, a, b, -1, 0), b};
    struct state aright = {move_res(im, a, b, 1, 0), b};
    struct state bup = {a, move_res(im, b, a, 0, -1)};
    struct state bdown = {a, move_res(im, b, a, 0, 1)};
    struct state bleft = {a, move_res(im, b, a, -1, 0)};
    struct state bright = {a, move_res(im, b, a, 1, 0)};

    update_node(h, dls, src, state_to_index(im, aup), cur_dist+1, im);
    update_node(h, dls, src, state_to_index(im, adown), cur_dist+1, im);
    update_node(h, dls, src, state_to_index(im, aleft), cur_dist+1, im);
    update_node(h, dls, src, state_to_index(im, aright), cur_dist+1, im);
    update_node(h, dls, src, state_to_index(im, bup), cur_dist+1, im);
    update_node(h, dls, src, state_to_index(im, bdown), cur_dist+1, im);
    update_node(h, dls, src, state_to_index(im, bleft), cur_dist+1, im);
    update_node(h, dls, src, state_to_index(im, bright), cur_dist+1, im);
}

// given an icemap, produces the dijkstra matrix of the shortest paths from its
// starting state
struct distlast *spaths(struct icemap im){
    size_t nverts = im.width * im.width * im.height * im.height;
    size_t src = state_to_index(im, im.start);
    struct distlast *dls = malloc(sizeof(struct distlast) * nverts);
    //dstatus *ds = malloc(sizeof(dstatus) * nverts);
    assert(dls);
    for(int i = 0; i < im.width * im.height * im.width * im.height; i++){
        dls[i].dist = SIZE_MAX;
    }

    dls[src].dist = 0;
    dls[src].last = src;

    struct heap h;

    node heap_data[nverts];
    int heap_idcs[nverts];
    h.cap = nverts;
    h.used = 0;
    h.data = heap_data;
    h.idcs = heap_idcs;
    h.dls = dls;

    for(int i = 0; i < nverts; i++){
        h.idcs[i] = -1;
    }


    update_nbrs(im, &h, dls, src);

    while(h.used > 0){
        node nd = heap_remove(&h);

        // TODO: remove
        struct state st = index_to_state(im, nd);
        //printf("DEBUG: adding state A(%zd,%zd) B(%zd,%zd)\n",
               //st.apos.x, st.apos.y, st.bpos.x, st.bpos.y);
        update_nbrs(im, &h, dls, nd);
    }

    return dls;
}
