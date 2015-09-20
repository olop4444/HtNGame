#ifndef TYPES_H
#define TYPES_H

#include <stddef.h>

typedef enum {ICE, WALL, DIRT} ftype;

struct point {
    size_t x,y;
};

// holds a game state, i.e., the position of player A and player B
struct state {
    struct point apos, bpos;
};

struct icemap {
    size_t width, height;
    ftype *cells; // row-major array of lengths width*height
    struct state start;
};

// a struct holding the distance of a shortest path to a state, and the (index
// of the) last node travelled on this path
struct distlast {
    size_t dist, last;
};

// min-heap
struct heap {
    size_t cap; // total capacity of the heap
    size_t used; // number of items in the heap
    struct distlast *dls; // dls[i].dist represents the "weight" of data[i]
    
    // array of length cap; holds the nodes in the heap
    size_t *data;

    // maps (the index of) a state to its index in data, or to -1 if
    // it is not in the heap
    int *idcs;
};

#endif
