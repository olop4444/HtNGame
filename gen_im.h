#ifndef GEN_IM_H
#define GEN_IM_H
#include "types.h"

// randomly generates an icemap with the given dimensions and boulder density
struct icemap *rand_icemap(size_t width, size_t height, double density);

#endif
