package main

import (
	"encoding/csv"
	"fmt"
	"io"
	"log"
	"os"
	"strings"
)

func main() {
	data, err := os.ReadFile("../cities.csv")
	if err != nil {
		fmt.Print(err)
	}

	raw_csv := string(data)
	row := csv.NewReader(strings.NewReader(raw_csv))

	for {
		record, err := row.Read()
		if err == io.EOF {
			break
		}
		if err != nil {
			log.Fatal(err)
		}

		// fmt.Println(reflect.TypeOf(record))
		fmt.Println(record)
	}
}
