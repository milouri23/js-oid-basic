// {
//   "_id": {
//     "$oid": "65ad377d80f38f709b64dd28"
//   },
//   "timestamp": 1705850749,
//   "machine_identifier": 8450959,
//   "process_identifier": 28827,
//   "counter": 6610216
// }

// "65ad377d"
// -> ["6", "5", "a", "d", "3", "7", "7", "d"], 8
// -> [6, 5, 10, 13, 3, 7, 7, 13], 8
// -> 6 * 16^7 + 5 * 16^6 + 10 * 16^5 + 13 * 16^4 + 3 * 16^3 + 7 * 16^2 + 7 * 16^1 + 13 * 16^0
// -> 1705850749

const fs = require("fs");
const path = require("path");

const readline = require("readline");
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const hexMap = require("./hexMap");
const defaultObjectId = "65ad377d80f38f709b64dd28";

rl.question("Please enter the objectId: ", (objectId) => {
  try {
    objectIdToDateTime(objectId);
  } catch (error) {
    console.error(`\nError: ${error.message}`);
    console.log(
      `Program will use default objectId instead: ${defaultObjectId}\n`
    );

    // Delay the call to objectIdToDateTime with the default ObjectId
    // To let the user read the message
    setTimeout(() => {
      objectIdToDateTime(defaultObjectId);
    }, 2000);
  }
  rl.close();
});

function objectIdToDateTime(objectId) {
  console.log(objectId);

  // Check that objectId is a string and has 24 hex characters
  if (
    typeof objectId !== "string" ||
    objectId.length != 24 ||
    !isHexString(objectId)
  ) {
    throw new Error("objectId must be a string with 24 hex characters.");
  }

  let totalHexCharacters = objectId.length;
  let totalBytes = totalHexCharacters / 2;

  console.log(`It has ${objectId.length} hexadecimal characters`);
  console.log(`That means it has ${totalBytes} bytes\n`);

  let first8characters = objectId.substring(0, 8);
  console.log(
    `The first 8 hex characters (i.e the first 4 bytes): ${first8characters} represents the timestamp in seconds`
  );

  let hexCharactersArray = first8characters.split("");
  console.log(`Each hex character: ${hexCharactersArray} represents a positional element in base 16 number system.
  To get the timestamp we need to convert it to decimal`);

  let timestamp = hexToDecimal(hexCharactersArray);

  console.log(`\n\nThe result is ${timestamp}`);
  console.log(
    `That indicates that ${timestamp} seconds has passed since the beggining of 01-01-1970`
  );

  let humanReadingDate = getHumanReadingDate(timestamp);

  console.log(humanReadingDate);
  console.log("Next is the datetime in ISO 8601 format:");
  console.log(`${humanReadingDate}`);

  let { toString, ...dateInfo } = humanReadingDate;
  dateInfo.ISOTimestamp = toString.call(dateInfo);
  dateInfo.hexCharacters = first8characters;

  let machineIdentifierHexArray = objectId.substring(8, 14).split("");
  let machineIdentifier = hexToDecimal(machineIdentifierHexArray);

  let processIdentifierHexArray = objectId.substring(14, 18).split("");
  let processIdentifier = hexToDecimal(processIdentifierHexArray);

  let counterHexArray = objectId.substring(18, 24).split("");
  let counter = hexToDecimal(counterHexArray);

  let objectIdInfo = {
    objectId: objectId,
    dateInfo: dateInfo,
    machineIdentifier: {
      value: machineIdentifier,
      hexCharacters: objectId.substring(8, 14),
    },
    processIdentifier: {
      value: processIdentifier,
      hexCharacters: objectId.substring(14, 18),
    },
    counter: {
      value: counter,
      hexCharacters: objectId.substring(18, 24),
    },
  };

  WriteOutputFile(objectIdInfo);
}

function WriteOutputFile(dateInfo) {
  const filePath = path.join(__dirname, "out", "dateInfo.json");
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(dateInfo, null, 2));

  console.log(`${filePath} has been saved`);
}

function isHexString(str) {
  const hexRegex = /^[0-9a-fA-F]+$/;
  return hexRegex.test(str);
}

function hexToDecimal(hexArray) {
  let greatestPower = hexArray.length - 1;

  console.log("Performing operation: ");
  process.stdout.write("\t");

  // let timestamp = 0;
  // hexArray.forEach((hexChar, index) => {
  //   let decimalDigit = hexCharToDecimalDigit(hexChar);
  //   let power = greatestPower - index;

  //   timestamp += decimalDigit * Math.pow(16, power);

  //   process.stdout.write(`(${decimalDigit} * 16^${power})`);
  //   if (index != greatestPower) {
  //     process.stdout.write(" + ");
  //   }
  // });
  let timestamp = hexArray.reduce((acc, hexChar) => {
    let decimalDigit = hexCharToDecimalDigit(hexChar);
    let power = greatestPower--;

    // acc += decimalDigit * Math.pow(16, power);
    // acc += decimalDigit * (16 ** power);
    // acc += decimalDigit * (Array(power).fill(16).reduce((powAcc, item) => item * powAcc, 1));
    acc +=
      decimalDigit *
      (() => {
        let result = 1;

        for (let i = 0; i < power; i++) {
          result *= 16;
        }
        return result;
      })();

    process.stdout.write(`(${decimalDigit} * 16^${power})`);
    if (greatestPower >= 0) {
      process.stdout.write(" + ");
    }

    return acc;
  }, 0);

  console.log();

  return timestamp;
}

function hexCharToDecimalDigit(hexChar) {
  // Check if the input is a single character
  if (typeof hexChar !== "string" || hexChar.length !== 1) {
    throw new Error("Input must be a single character.");
  }

  // If the character is a digit, convert it to a number
  if (!isNaN(Number(hexChar))) {
    return Number(hexChar);
  }

  // Convert the input to lowercase
  hexChar = hexChar.toLowerCase();

  // Check if the input is a valid hexadecimal character
  if (!hexMap.hasOwnProperty(hexChar)) {
    throw new Error("Input must be a valid hexadecimal character.");
  }

  return hexMap[hexChar];
}

function getHumanReadingDate(timestamp) {
  const initialYear = 1970;

  let seconds = timestamp % 60;

  let minutesPassed = Math.floor(timestamp / 60);
  let minutes = minutesPassed % 60;

  let hoursPassed = Math.floor(minutesPassed / 60);
  let hours = hoursPassed % 24;

  let daysLeft = Math.floor(hoursPassed / 24);

  let year = initialYear;
  while (daysLeft >= 365) {
    if (isLeapYear(year)) {
      if (daysLeft >= 366) {
        daysLeft -= 366;
        year += 1;
      } else {
        break;
      }
    } else {
      daysLeft -= 365;
      year += 1;
    }
  }

  // Define the number of days in each month (for a non-leap year)
  const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

  // Adjust for leap year
  if (isLeapYear(year)) {
    daysInMonth[1] = 29; // February has 29 days in a leap year
  }

  let month = 0;
  while (daysLeft >= daysInMonth[month]) {
    daysLeft -= daysInMonth[month];
    month += 1;
  }

  return {
    timestamp: timestamp,
    year: year,
    month: month + 1,
    day: daysLeft + 1,
    hours: hours,
    minutes: minutes,
    seconds: seconds,
    toString: function () {
      return `${this.year}-${this.month.toString().padStart(2, "0")}-${this.day
        .toString()
        .padStart(2, "0")}T${this.hours
        .toString()
        .padStart(2, "0")}:${this.minutes
        .toString()
        .padStart(2, "0")}:${this.seconds.toString().padStart(2, "0")}Z`;
    },
  };
}

function isLeapYear(year) {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

function getHumanReadingDateOptimal(timestamp) {
  // Create a new Date object from the timestamp
  const date = new Date(timestamp * 1000); // JavaScript uses milliseconds

  return {
    year: date.getUTCFullYear(),
    month: date.getUTCMonth() + 1, // getUTCMonth() returns a zero-based month
    day: date.getUTCDate(),
    hours: date.getUTCHours(),
    minutes: date.getUTCMinutes(),
    seconds: date.getUTCSeconds(),
    toString: function () {
      return `${this.year}-${this.month.toString().padStart(2, "0")}-${this.day
        .toString()
        .padStart(2, "0")}T${this.hours
        .toString()
        .padStart(2, "0")}:${this.minutes
        .toString()
        .padStart(2, "0")}:${this.seconds.toString().padStart(2, "0")}Z`;
    },
  };
}
