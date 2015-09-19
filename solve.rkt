#lang racket
;; module for solving an instance of the sliding ice puzzle

(require graph)

(define cell? (or/c 'ice 'boulder)) ;; TODO: add dirt
(define row? (vectorof cell?))
(define point? (cons/c integer? integer?))
(define imstate? (cons/c point? point?)) ;; state is (cons player-a-loc player-b-loc)

;; struct holding a map of an ice puzzle, with starting locations
(define-struct/contract icemap (
  [width integer?]
  [height integer?]
  [rows (vectorof row?)] ;; vector of rows (which are vectors of cells)
  [start imstate?] ;; initial state, i.e., locations of player A and player B
) #:transparent)

;; gets the (i,j) cell in an icemap im
(define/contract (imref im i j)
  (-> icemap? integer? integer? cell?)
  (vector-ref (vector-ref (icemap-rows im) j) i))

;; given imstate ist and an icemap im, produces a list containing all points p can
;; reach in one move
(define/contract (reach im ist)
  (-> icemap? imstate? (listof imstate?))
  ;; helper function which finds the reachable point in a given direction from q, with a point b
  ;; blocked; returns the resulting state
  (define (dirpt q xdif ydif b)
    (define next (cons (+ (car q) xdif) (+ (cdr q) ydif)))
    (cond
      [(equal? next b) q]
      [else (match (imref im (car next) (cdr next))
              ['boulder q]
              ['ice (dirpt next xdif ydif b)])]))
  (for*/list ([dir '((0 . 1) (0 . -1) (1 . 0) (-1 . 0))]
              [move-a '(#t #f)])
    (match-define (cons a b) ist)
    (if move-a
        (cons (dirpt a (car dir) (cdr dir) b) b)
        (cons a (dirpt b (car dir) (cdr dir) a)))))

;; gets the path found by dijkstra from src to dest
(define/contract (dpath paths src dest)
  (-> hash? any/c any/c (listof any/c))
  (cond
    [(equal? src dest) (list src)]
    [else (append (dpath paths src (hash-ref paths dest)) (list dest))]))

;; chooses the furthest endpoint from start; returns the endpoint and smallest number of moves
;; required to reach it
(define/contract (solve im)
  ;(-> icemap? (cons/c imstate? integer?))
  (-> icemap? any/c)
  (match-define (icemap width height rows start) im)
  (define g (unweighted-graph/directed '()))
  (define (add-nbrs! ist)
    (for ([new-ist (reach im ist)])
      (define seen-new-ist (has-vertex? g new-ist))
      (add-directed-edge! g ist new-ist)
      (unless seen-new-ist (add-nbrs! new-ist))))
  (printf "Constructing graph...\n")
  (add-nbrs! start)
  (printf "Running dijkstra...\n")
  (define-values (lens paths) (dijkstra g start))
  ;; TODO: the below might err in trivial cases
  (define longest (foldr (lambda (x y) (if (> (cdr x) (cdr y)) x y)) (cons #f 0) (hash->list lens)))
  (define path (dpath paths start (car longest)))
  ;longest)
  (list g longest path))


;; TODO: debug only
;; reads an icemap from stdin
(define/contract (read-icemap)
  (-> icemap?)
  (define rows (for/vector ([line (in-lines)])
                 (for/vector ([ch line])
                   (match ch
                     [#\space 'ice]
                     [#\W 'boulder]))))
  (icemap (vector-length (vector-ref rows 0))
          (vector-length rows)
          rows
          '((14 . 13) . (14 . 12)))) ;; TODO: un-hardcode

;(match-define (list g longest path) (solve (with-input-from-file "slide.txt" read-icemap)))

