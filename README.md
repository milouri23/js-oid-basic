# ObjectId to Timestamp educational program

## Description
This program is designed to convert MongoDB ObjectIds into timestamps. It's an educational tool that not only performs the conversion, but also prints out the steps of the conversion process. This makes it a great resource for learning how ObjectId to timestamp conversion works.

## How it Works
The program takes a MongoDB ObjectId as input. It then extracts the timestamp portion of the ObjectId (the first 8 hexadecimal digits), and converts this hexadecimal timestamp into a decimal timestamp.

The program calculates the decimal value of the hexadecimal timestamp by breaking it down into individual characters (digits), each of which is converted to its decimal equivalent.

The program then calculates the decimal value of the hexadecimal timestamp by multiplying each decimal digit by 16 raised to the power of its position in the hexadecimal number (counting from right to left, starting from 0), and summing up these products.

The program prints out each step of this process, showing the multiplication and addition operations it's performing.

The program subsequently transforms the timestamp into a date, taking into consideration that the timestamp represents the number of seconds that have passed since 1970-01-01T00:00:00Z.

Upon completion, the program generates a JSON file containing the pertinent date information.

## Usage
To use the program, simply run it in a Node.js environment, and provide a MongoDB ObjectId as input when prompted.

## Note
This program is for educational purposes and is not intended for use in production environments.