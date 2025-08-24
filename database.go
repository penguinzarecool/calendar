package main

import (
	"database/sql"
	"fmt"
	"os"
	"path/filepath"

	_ "github.com/mattn/go-sqlite3"
)

type Event struct {
	Date        string `json:"date"`
	Description string `json:"description"`
	Urgency     int    `json:"urgency"`
	Time        string `json:"time"`
}

func initDatabase() (*sql.DB, error) {
	home, err := os.UserHomeDir()
	if err != nil {
		return nil, fmt.Errorf("could not get HOME directory: %w", err)
	}

	dbDir := filepath.Join(home, ".local", "share", "addisons-calendar")
	if _, err := os.Stat(dbDir); os.IsNotExist(err) {
		if err := os.MkdirAll(dbDir, 0755); err != nil {
			return nil, fmt.Errorf("failed to create db dir: %w", err)
		}
	}

	dbPath := filepath.Join(dbDir, "events.db")
	db, err := sql.Open("sqlite3", dbPath)
	if err != nil {
		return nil, fmt.Errorf("failed to open db: %w", err)
	}

	schema := `
	CREATE TABLE IF NOT EXISTS Events (
		ID INTEGER PRIMARY KEY AUTOINCREMENT,
		Date TEXT NOT NULL,
		Description TEXT NOT NULL,
		Urgency INTEGER NOT NULL CHECK (Urgency >= 1 AND Urgency <= 5),
		Time TEXT NOT NULL
	);`
	if _, err := db.Exec(schema); err != nil {
		return nil, fmt.Errorf("failed to create schema: %w", err)
	}

	return db, nil
}

func addEvent(db *sql.DB, e Event) error {
	_, err := db.Exec(
		"INSERT INTO Events (Date, Description, Urgency, Time) VALUES (?, ?, ?, ?)",
		e.Date, e.Description, e.Urgency, e.Time,
	)
	return err
}

func getEventsForMonth(db *sql.DB, month, year int) ([]Event, error) {
    rows, err := db.Query(`
        SELECT Date, Description, Urgency, Time 
        FROM Events
        WHERE strftime('%m', Date) = printf('%02d', ?)
          AND strftime('%Y', Date) = ?;
    `, month, year)
    if err != nil {
        return nil, err
    }
    defer rows.Close()

    var events []Event
    for rows.Next() {
        var e Event
        if err := rows.Scan(&e.Date, &e.Description, &e.Urgency, &e.Time); err != nil {
            return nil, err
        }
        events = append(events, e)
    }

    if events == nil {
        events = []Event{}
    }

    return events, nil
}

