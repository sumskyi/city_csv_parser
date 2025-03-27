import { readFileSync } from 'fs';

const data: string = readFileSync('../cities.csv', 'utf8');

const clone = <T>(obj: T): T => {
  return JSON.parse(JSON.stringify(obj));
}

interface City {
  readonly city: string,
  readonly population: number,
  readonly area: number,
  readonly density: number,
  readonly country: string,
  percentage: number
}

interface MaxLengthData {
  readonly city: number;
  readonly population: number;
  readonly area: number;
  readonly density: number;
  readonly country: number;
  readonly percentage: number;
}
class CityParser {
  memoizedMaxDensity: number | undefined;
  separator: string;
  lines: string[];
  table: City[] = []

  constructor(data: string, separator: string) {
    this.separator = separator;
    this.lines = data.split('\n').map((line) => line.trim());

    this.lines.shift();
  }

  call(): City[] {
    this.#makeTable();
    this.#addDensityPercentageColumn();
    this.#sortByPercentage();

    return this.table;
  }

  #makeTable(): void {
    this.table = this.lines.reduce((acc: City[], value: string) => {
      acc.push(this.#makeCity(value));

      return acc;
    }, []);
  }

  #makeCity(line: string): City {
    const cityData = line.split(this.separator);

    const city: City = {
      city: cityData[0],
      population: parseInt(cityData[1]),
      area: parseInt(cityData[2]),
      density: parseInt(cityData[3]),
      country: cityData[4],
      percentage: 0
    };

    return city;
  }

  #addDensityPercentageColumn(): void {
    const maxDensity = () => {
      if(undefined === this.memoizedMaxDensity) {
        return this.memoizedMaxDensity = this.table.sort((a: City, b: City) => a.density - b.density)[this.table.length - 1].density;
      } else {
        return this.memoizedMaxDensity;
      }
    }

    this.table = clone(this.table).reduce((acc: City[], value: City) => {
      const currentVaue: City = {
        ...value,
        percentage: Math.round((value.density * 100) / maxDensity())
      };

      acc.push(currentVaue);
      return acc;
    }, []);
  }

  #sortByPercentage (): void {
    this.table = this.table.sort((a: City, b: City) => b.percentage - a.percentage);
  }
}

class Printer {
  table: City[];

  constructor(table: City[]) {
    this.table = table;
  }

  call() {
    const maxLengthData: MaxLengthData = this.#maxLengthsData();
    const padRight = 3;

    const printRow = (city: City) => {
      return city.city.padEnd(maxLengthData.city + padRight) +
             city.population.toString().padStart(maxLengthData.population + padRight) +
             city.area.toString().padStart(maxLengthData.area + padRight) +
             city.density.toString().padStart(maxLengthData.density + padRight) +
             city.country.toString().padStart(maxLengthData.country + padRight) +
             city.percentage.toString().padStart(maxLengthData.percentage + padRight)
      ;
    }

    for(const city of this.table) {
      console.log(printRow(city));
    }
  }

  #maxLengthsData(): MaxLengthData{
    const maxLength = (col: keyof City): number => {
      const maxBy = clone(this.table).sort((a: City, b: City) => {
        return b[col].toString().length - a[col].toString().length;
      })[0];

      return maxBy[col].toString().length;
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

const cities = new CityParser(data, ',').call();
new Printer(cities).call();