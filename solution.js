import { readFileSync } from 'fs';

let data = readFileSync('./cities.csv', 'utf8', (err, data) => { return data });

let clone = (any) => { return JSON.parse(JSON.stringify(any)) }

class CityParser {
  constructor(data, separator) {
    this.separator = separator;
    this.lines = data.split('\n').map((line) => line.trim());
    this.header = this.lines.shift();
  }

  call() {
    this.#makeTable();
    this.#addDensityPercentageColumn();
    this.#sortByPercentage();

    return this.table;
  }

  #makeTable() {
    const cityStruct = this.#makeStruct(this.header);

    this.table = this.lines.reduce((acc, value) => {
      acc.push(new cityStruct(...value.split(this.separator)));
      return acc;
    }, []
    );
  }

  #makeStruct(keys) {
    if (!keys) return null;

    const keyArray = keys.split(this.separator);
    const keyCount = keyArray.length;

    return class {
      constructor(...args) {
        for (let i = 0; i < keyCount; i++) {
          this[keyArray[i]] = args[i];
        }
      }
    };
  }

  #addDensityPercentageColumn() {
    this.table = clone(this.table).reduce((acc, value) => {
      const currentVaue = {
        ...value,
        percentage: (Math.round((value.density * 100) / this.#maxDensity).toString())
      };

      acc.push(currentVaue);
      return acc;
    }, []);

    return this.table;
  }

  #sortByPercentage () {
    this.table = this.table.sort((a, b) => b.percentage - a.percentage);
  }

  get #maxDensity(){
    return this.table.sort((a, b) => a.density - b.density)[this.table.length - 1].density;
  }
}

class Printer {
  constructor(table) {
    this.table = table;
  }

  call() {
    this.maxLengthData = this.#maxLengthsData();
    const padRight = 3;

    const printRow = (city) => {
      return city.city.padEnd(this.maxLengthData.city + padRight) +
             city.population.padStart(this.maxLengthData.population + padRight) +
             city.area.padStart(this.maxLengthData.area + padRight) +
             city.density.padStart(this.maxLengthData.density + padRight) +
             city.country.padStart(this.maxLengthData.country + padRight) +
             city.percentage.padStart(this.maxLengthData.percentage + padRight)
      ;
    }

    for(const city of this.table) {
      console.log(printRow(city));
    }
  }

  #maxLengthsData(){
    const maxLength = (col) => {
      const maxBy = clone(this.table).sort((a, b) => b[col].length - a[col].length)[0];

      return maxBy[col].length;
    }

    return {
      city: maxLength('city'),
      population: maxLength('population'),
      area: maxLength('area'),
      density: maxLength('density'),
      country: maxLength('country'),
      percentage: maxLength('percentage')
    }
  }
}

let cities = new CityParser(data, ',').call();
new Printer(cities).call();