--[[
  https://github.com/kikito/inspect.lua
  [sudo] luarocks install inspect
]]
local inspect = require 'inspect'

local function readCSV(fileName)
  local file = io.open("../cities.csv", "r")
  if not file then error("Failed to open CSV file.") end

  local fileContent = file:read("*all")
  file:close()

  return fileContent
end

-- the whole CSV as a table
local function readLines(fileContent)
  local lines = {}
  for line in fileContent:gmatch("[^\r\n]+") do
    table.insert(lines, line)
  end

  return lines
end

local function split(input, delimiter)
  local result = {}

  for match in (input .. delimiter):gmatch("(.-)" .. delimiter) do
    table.insert(result, match)
  end
  return result
end

local function extractHeader(lines)
  return split(lines[1], ",") -- array
end

local function extractBody(lines, header)
  local body = {}
  for i = 2, #lines do
    local fields = split(lines[i], ",")
    local record = {}

    for j, key in ipairs(header) do
      record[key] = fields[j]
    end

    table.insert(body, record)
  end

  return body
end

local function addDensityPercentageColumn(body)
  --[[
    memoize because of multiple calls with the same argument
    https://www.lua.org/pil/17.1.html
  ]]
  local results = {}
  setmetatable(results, {__mode = "v"})  -- make values weak
  local function getMaxDensity(body)
    if results[body] then
      return results[body]
    else
      local density = 0
      for i, row in ipairs(body) do
        if (tonumber(row.density) > tonumber(density)) then density = row.density end
      end

      results[body] = density
      return density
    end
  end

  for i, row in ipairs(body) do
    local raw_density =row.density / getMaxDensity(body) * 100
    row["percentage"] = math.floor(raw_density + 0.5) -- the trick for round
  end

  return body
end -- addDensityPercentageColumn


local fileContent = readCSV("../cities.csv");
local lines = readLines(fileContent)
local header = extractHeader(lines)
local body = extractBody(lines, header)
body = addDensityPercentageColumn(body)

print(inspect(body))
