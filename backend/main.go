package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"

	"github.com/gorilla/mux"
	"github.com/rs/cors"
)

type Point struct {
    X int `json:"x"`
    Y int `json:"y"`
}

type PathRequest struct {
    Start Point `json:"start"`
    End   Point `json:"end"`
}

type PathResponse struct {
    Path []Point `json:"path"`
}

const GRID_SIZE = 20

func main() {
    r := mux.NewRouter()
    r.HandleFunc("/find-path", findPathHandler).Methods("POST")

    c := cors.New(cors.Options{
        AllowedOrigins: []string{"http://localhost:5173"},
        AllowedMethods: []string{"POST"},
        AllowedHeaders: []string{"Content-Type"},
    })

    handler := c.Handler(r)
    log.Fatal(http.ListenAndServe(":8080", handler))
}

func findPathHandler(w http.ResponseWriter, r *http.Request) {
    var req PathRequest
    if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
        http.Error(w, err.Error(), http.StatusBadRequest)
        return
    }

    path := findPath(req.Start, req.End)
    
    response := PathResponse{Path: path}
    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(response)
}

func findPath(start, end Point) []Point {
    visited := make(map[string]bool)
    path := make([]Point, 0)
    
    if dfs(start, end, visited, &path) {
        return append([]Point{start}, path...)
    }
    return nil
}

func dfs(current, end Point, visited map[string]bool, path *[]Point) bool {
    key := pointToKey(current)
    if visited[key] {
        return false
    }
    
    visited[key] = true
    if current.X == end.X && current.Y == end.Y {
        return true
    }
    moves := []Point{{0, -1}, {1, 0}, {0, 1}, {-1, 0}}
    
    for _, move := range moves {
        next := Point{
            X: current.X + move.X,
            Y: current.Y + move.Y,
        }
        
        if isValid(next) && !visited[pointToKey(next)] {
            *path = append(*path, next)
            if dfs(next, end, visited, path) {
                return true
            }
            *path = (*path)[:len(*path)-1]
        }
    }
    
    return false
}

func isValid(p Point) bool {
    return p.X >= 0 && p.X < GRID_SIZE && p.Y >= 0 && p.Y < GRID_SIZE
}

func pointToKey(p Point) string {
    return fmt.Sprintf("%d,%d", p.X, p.Y)
}