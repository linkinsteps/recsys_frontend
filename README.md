# RecSys Frontend

## How to start a NodeJS app
### Step 1
Install NodeJS. Please access this page (http://nodejs.org/) for more details.

### Step 2
Install NodeJS dependencies via command: `npm install`

### Step 3
Run NodeJS app via command: `node app.js` (for Window) and `nodejs app.js` (for Unix)

## How to setup your own testing site
### Step 1
Clone source code of `RecSys Frontend`

### Step 2 - Point rs-cdn to your own backend location
1. Open file `/recsys_frontend/rs-cdn/public/rs-cdn/rs.js`
2. Change `rs.HOST_NAME` value at `line 40` to your own backend location
3. Save this file

### Step 3 - Init your own rs-cdn
1. Open file `/recsys_frontend/rs-cdn/app.js`
2. At `line 59`, change `6969` to your expected port number
3. Run NodeJS app for `rs-cdn`

*Note: Your own rs-cdn location will be `http://yourhost:yourport/rs-cdn/rs.js`

### Step 4 - Point local-vbuzz to your own rs-cdn
1. Open file `/recsys_frontend/local-vbuzz/view/detail.ejs`
2. At `line 316`, change `rsScript.src` value to your own rs-cdn location
3. Save this file

### Step 5 - Init your own local-vbuzz
1. Open file `/recsys_frontend/local-vbuzzn/app.js`
2. At `line 63`, change `3000` to your expected port number
3. Run NodeJS app for `local-vbuzz`

*Note: Your own local-vbuzz location will be `http://yourhost:yourport/vbuzz/`
