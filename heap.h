#ifndef HEAP_H
#define HEAP_H

#include "types.h"

typedef size_t node;

void heap_add(struct heap *h, node nd);
node heap_remove(struct heap *h);
void heap_fix(struct heap *h, node nd);

#endif
