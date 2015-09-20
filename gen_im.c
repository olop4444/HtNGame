#include "gen_im.h"
#include "types.h"

#include <stdlib.h>
#include <assert.h>

struct icemap *rand_icemap(size_t width, size_t height, double density){
    assert(width > 5 && height > 5);
    int num_bldrs = (int) (density * (width-2) * (height-2));

    struct icemap *im = malloc(sizeof(struct icemap));
    assert(im);
    im->cells = malloc(sizeof(ftype) * width * height);
    assert(im->cells);
    im->width = width;
    im->height = height;

    im->start.apos.x = 1;
    im->start.apos.y = 1;
    im->start.bpos.x = 2;
    im->start.bpos.y = 1;

    // generate ice floor and border
    for(int i = 0; i < width*height; i++){
        if(0 < i%width && i%width < width-1 && 0 < i/width && i/width < height-1){
            im->cells[i] = ICE;
        }else{
            im->cells[i] = WALL;
        }
    }

    // generate random boulders
    for(int i = 0; i < num_bldrs; i++){
        // TODO: this could go on forever or something, but whatever
        size_t bx,by;
        do{
            by = rand() % (height-2) + 1;
            if(by == 1){ // special case to avoid starting on boulders
                bx = rand() % (width-4) + 3;
            }else{
                bx = rand() % (width-2) + 1;
            }
        }while(im->cells[by*width + bx] == WALL);
        
        im->cells[by*width + bx] = WALL;
    }

    return im;
}
