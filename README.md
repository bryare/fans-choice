# Fans Choice 

Hello! Welcome to **Fans Choice**. Fans Choice is a music ranking platform that allows you to look at top rated albums and singles in a database, and review them. Fans Choice was built with websites like MetaCritic in mind, however, MetaCritic has personal admin reviews, and that can cause bias. More importantly, Fans Choice believes that the fans are always right, and they are the only ones who have a say.

This project was built using **NodeJS, Express, and MySql.**

## Installation

1) Download the repo by clicking the green download button OR by typing 

      **git clone "https://github.com/BryAre/FansChoice.git"**

   on your terminal

2) Install [node.js](https://nodejs.org/en/)

3) Run the script located at `fanschoice/sql/FansChoice.sql`

   To run the `FansChoice.sql` script you can try `mysql -u USERNAME -p < /PATH/TO/social.sql` or from the mysql command          line try `source ./PATH/TO/fanschoice.sql`.
   
   Can also try mysql -u root -p fanschoice < FansChoice.sql, you should cd to where SQL file is and next to p is name of        database. Create database by going to Mariadb and doing Create DATABASENAME; 

4) From the command line `cd path/to/FansChoice; npm install`

5) **`node index.js`**

6) Go to [http://localhost:3000](http://localhost:3000

## Capabilities 

1) The ability to look at the top albums

2) The ability to look at the top songs

3) Post a review

4) Like or disliked after posting a review

5) Seeing own review/reviews of others



