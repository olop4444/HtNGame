#lang racket
;; module for solving an instance of the sliding ice puzzle

(require graph)

(define cell? (or/c 'ice 'boulder)) ;; TODO: add dirt
(define row? (vectorof cell?))
(define point? (cons/c integer? integer?))

(define-struct/contract icemap (
  [width integer?]
  [height integer?]
  [rows (vectorof row?)] ;; vector of rows (which are vectors of cells)
  [start point?] ;; starting point of the puzzle
) #:transparent)

;; gets the (i,j) cell in an icemap im
(define/contract (imref im i j)
  (-> icemap? integer? integer? cell?)
  (vector-ref (vector-ref (icemap-rows im) j) i))

;; given a point p and an icemap im, produces a (possibly redundant/trivial) list of the points p
;; can reach in one move
(define/contract (reach im p)
  (-> icemap? point? (cons/c point? (listof point?)))
  ;; helper function which finds the reachable point in a given direction from q
  (define (dirpt q xdif ydif)
    (define next (cons (+ (car q) xdif) (+ (cdr q) ydif)))
    (match (imref im (car next) (cdr next))
      ['boulder q]
      ['ice (dirpt next xdif ydif)]))
  (list (dirpt p 0 1) (dirpt p 0 -1) (dirpt p 1 0) (dirpt p -1 0)))

;; gets the path found by dijkstra from src to dest
(define/contract (dpath paths src dest)
  (-> hash? any/c any/c (listof any/c))
  (cond
    [(equal? src dest) (list src)]
    [else (append (dpath paths src (hash-ref paths dest)) (list dest))]))

;; chooses the furthest endpoint from start; returns the endpoint and smallest number of moves
;; required to reach it
(define/contract (solve im)
  (-> icemap? (cons/c point? integer?))
  (match-define (icemap width height rows start) im)
  (define g (unweighted-graph/directed '()))
  (define (add-nbrs! p)
    (for ([q (reach im p)])
      (define seen-q (has-vertex? g q))
      (add-directed-edge! g p q)
      (unless seen-q (add-nbrs! q))))
  (add-nbrs! start)
  (define-values (lens paths) (dijkstra g start))
  ;; TODO: the below might err in trivial cases
  (define longest (foldr (lambda (x y) (if (> (cdr x) (cdr y)) x y)) (cons #f 0) (hash->list lens)))
  (define path (dpath paths start (car longest)))
  longest)


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
          (cons 14 13))) ;; TODO: un-hardcode
