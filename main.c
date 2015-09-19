#include <stdio.h>
#include <stdlib.h>

#include "types.h"
#include "graph.h"
#include "stdint.h"

// read a map from stdin; 'W' means wall, ' ' means ice, 'd' means dirt
struct icemap read_im(){
    struct icemap im;
    scanf("%zd\n", &(im.width));
    scanf("%zd\n", &(im.height));
    im.cells = malloc(sizeof(ftype) * im.width * im.height);
    for(int i = 0; i < im.width*im.height; i++){
        char c = getchar();
        if(c == '\n'){
            i--;
        }else if(c == ' '){
            im.cells[i] = ICE;
        }else if(c == 'W'){
            im.cells[i] = WALL;
        }else if(c == 'd'){
            im.cells[i] = DIRT;
        }else{
            printf("ERROR: stdin has unexpected character: '%c' (%d)\n", c, c);
            exit(1);
        }
    }

    // TODO: unhardcode or change or something
    im.start.apos.x = 14;
    im.start.apos.y = 13;
    im.start.bpos.x = 14;
    im.start.bpos.y = 12;

    return im;
}

// given a state, print out the shortest path to get there
void print_path(struct icemap im, struct distlast *dls, struct state src,
                struct state st){
    size_t src_idx = state_to_index(im, src);
    size_t st_idx = state_to_index(im, st);
    if(dls[st_idx].dist == SIZE_MAX){
        printf("Unreachable.\n");
        return;
    }

    do{
        struct state newst = index_to_state(im, st_idx);
        printf("A(%zd,%zd)  B(%zd,%zd)\n",
               newst.apos.x, newst.apos.y, newst.bpos.x, newst.bpos.y);
        st_idx = dls[st_idx].last;
    }while(src_idx != st_idx);
        printf("A(%zd,%zd)  B(%zd,%zd)\n",
               src.apos.x, src.apos.y, src.bpos.x, src.bpos.y);
}


int main(){
    struct icemap im = read_im();
    struct distlast *dls = spaths(im);

    struct state easy6 = { {9,6}, {9,7} };
    struct state sort_of_normal = { {14,13}, {14,8} };

    print_path(im, dls, im.start, easy6);
    printf("------------\n");
    print_path(im, dls, im.start, sort_of_normal);

    exit(0);
}
