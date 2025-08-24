package main

import (
	"log"
	"path/filepath"

	webview "github.com/webview/webview_go"
)

func main() {
	debug := true
	w := webview.New(debug)
	defer w.Destroy()
	w.SetTitle("Addison's Calendar")
	w.SetSize(800, 600, webview.HintNone)

	// Init DB
	db, err := initDatabase()
	if err != nil {
		log.Fatal(err)
	}
	defer db.Close()

	// Expose bindings to JS
	w.Bind("saveEvent", func(e Event) {
		if err := addEvent(db, e); err != nil {
			log.Println("Error saving event:", err)
		}
	})

    w.Bind("loadEvents", func(month, year int) ([]Event, error) {
        return getEventsForMonth(db, month, year)
    })


	// Serve UI
	path, _ := filepath.Abs("static/index.html")
	url := "file://" + path
	w.Navigate(url)
	w.Run()
}

