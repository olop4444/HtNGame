#ifndef GRAPH_H
#define GRAPH_H

struct distlast *spaths(struct icemap im);
size_t state_to_index(struct icemap im, struct state st);

// inverse of the above
struct state index_to_state(struct icemap im, size_t idx);

#endif
