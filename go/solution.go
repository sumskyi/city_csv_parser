package main

import (
	"fmt"
	"os"
)

func main() {
	data, err := os.ReadFile("../cities.csv")
	if err != nil {
		fmt.Print(err)
	}

	raw_csv := string(data)
	fmt.Println(raw_csv)
}
