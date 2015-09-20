#include <stdio.h>
#include <stdlib.h>
#include <stdint.h>

#include "types.h"
#include "graph.h"
#include "gen_im.h"

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

// prints an icemap to stdout
void print_im(struct icemap im){
    for(int y = 0; y < im.height; y++){
        for(int x = 0; x < im.width; x++){
            printf("%c", im.cells[y*im.width+x] == WALL ? 'W' : ' ');
        }
        printf("\n");
    }
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

// find the farthest reachable state from im.start; store its distance in dist
struct state gen_endpoints(struct icemap im, struct distlast *dls, size_t *dist,
                           int difficulty){
    size_t record = SIZE_MAX;
    size_t rec_dist = 0;
    struct state rec_state = im.start;
    for(size_t i = 0; i < im.width * im.width * im.height * im.height; i++){
        struct state st = index_to_state(im, i);
        struct state rev = {st.bpos, st.apos};
        size_t rev_idx = state_to_index(im, rev);
        size_t sdist = dls[i].dist < dls[rev_idx].dist ? dls[i].dist :
                                                         dls[rev_idx].dist;
        if(abs(sdist - difficulty) <= record && sdist < SIZE_MAX){
            record = abs(sdist-difficulty);
            rec_state = st;
            rec_dist = sdist;
        }
    }
    *dist = rec_dist;
    return rec_state;
}


int main(int argc, char *argv[]){
    /*
    struct icemap im = read_im();
    struct distlast *dls = spaths(im);

    struct state easy6 = { {9,6}, {9,7} };
    struct state sort_of_normal = { {14,13}, {14,8} };

    print_path(im, dls, im.start, easy6);
    printf("------------\n");
    print_path(im, dls, im.start, sort_of_normal);

    exit(0);
    */

    if(argc != 4){
        goto usage;
    }

    int width = atoi(argv[1]);
    int height = atoi(argv[2]);
    int difficulty = atoi(argv[3]);
    if(width <= 5 || height <= 5 || difficulty < 1){
        fprintf(stderr, "Width and height must be at least 6; difficulty>0\n");
        goto usage;
    }

    double boulder_density = 0.1;

    struct icemap *im = rand_icemap(width, height, boulder_density);
    //print_im(*im);
    struct distlast *dls = spaths(*im);

    size_t dist;
    struct state goal = gen_endpoints(*im, dls, &dist, difficulty);
    /*
    printf("goal: (%zd,%zd) and (%zd,%zd)\n", goal.apos.x, goal.apos.y,
                                              goal.bpos.x, goal.bpos.y);
    print_path(*im, dls, im->start, goal);
    */

    // print the created game in JSON to stdout
    printf("{\"width\" : %d,\n", width);
    printf("\"height\" : %d,\n", height);
    printf("\"A_start\" : [%zd,%zd],\n", im->start.apos.x, im->start.apos.y);
    printf("\"B_start\" : [%zd,%zd],\n", im->start.bpos.x, im->start.bpos.y);
    printf("\"end_points\" : [[%zd,%zd],[%zd,%zd]],\n",
           goal.apos.x, goal.apos.y, goal.bpos.x, goal.bpos.y);
    printf("\"min_moves\" : %zd,\n", dist);
    printf("\"cells\" : [\n");
    for(int y = 0; y < im->height; y++){
        printf("[");
        for(int x = 0; x < im->width; x++){
            char c;
            if(im->cells[y*(im->width)+x] == WALL) c = 'W';
            else if(im->cells[y*(im->width)+x] == ICE) c = ' ';
            else{
                fprintf(stderr, "FATAL ERROR: encountered non-WALL/ICE ftype\n");
                exit(1);
            }
            printf("\"%c\"", c);
            if(x < im->width-1) printf(",");
        }
        printf("]");
        if(y < im->height-1) printf(",");
        printf("\n");
    }
    printf("]}\n");

    return 0;

    usage:
        fprintf(stderr, "Usage: %s width height difficulty\n", argv[0]);
        return 1;
}
