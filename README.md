# graphical-authentication
Shoulder Surfing Resistant Graphical Authentication Scheme for Web Based Applications

This is the code/implementation for the app discussed in my article at http://escipub.com/american-journal-of-computer-sciences-and-applications/ However, the codes in the article has been converted in the server side from PHP to nodejs.

The process of this Graphical authentication is as follows:

    1. Enter unique user Id (email address is used)
    
    2. This involes creating a graphical password
        2a. Choose one vertical line(column) by color
        2b. Choose one horizontal line(row) by color

        2c. Choose a cell relative to the intersection of the choosen lines(row and column). That is the either the central, north, south, east, west, north-east, north-west, south-east or south-west of the intersection.

        2d. Insert two numbers into the choosen cell by dragging and scrolling within the grid of cell to move the desired numbers.

        2e. Enter a recovery password. (just for testing purposes incase of anything).

        2f. Register.

    note: In the login page, the grid comprises of rows and columns. The rows are placed on top of the columns. so for example, an intersection of a green row placed on a red column is different from a red row placed on a green column.

    Thanks
