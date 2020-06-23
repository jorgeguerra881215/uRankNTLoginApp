# RiskID

RiskID is a web application designed to generate fully labeled connection datasets. It uses visualization techniques and label recommendations to give the user greater support in the labeling process.
## Getting Started 🚀

### Prerequisites 📋
For a correct operation of RiskID, you should have the following:
 - An Ubuntu 16.04 (or high) server and a regular, non-root user with sudo privileges.
 - A MongoDB database server
 - A NodeJS cross-platform JavaScript run-time environment

If you do not have any of these tools installed, follow these steps for easy installation. (This simple guide was developed using an Ubuntu 18.04 operating system)

First update your local package index:
```
$ sudo apt update
```
Installing MongoDB
Install the MongoDB package:
```
$ sudo apt install -y mongodb
```
This command installs several packages containing the latest stable version of MongoDB, along with helpful management tools for the MongoDB server. The database server is automatically started after installation.

Installing NodeJS
Install Node.js from the repositories:
```
$ sudo apt install nodejs
```
You'll also want to also install npm, the Node.js package manager. You can do this by typing:
```
$ sudo apt install npm
```


### Installing 🔧

If the prerequisites are met, installing the RiskID app and starting to label is very easy.

First download the RiskID project.
```
$ git clone https://github.com/jorgeguerra881215/uRankNTLoginApp.git
```

Once you clone the RiskID repository, move the project inside apache web server launch folder.
```
$ sudo mv uRankNTLoginApp /var/www/html/
```

Run node project
```
$ node uRankNTLoginApp/app.js
```

Finally point the web browser to http://localhots:3000


## Running the tests ⚙️

Initially the application comes with a set of previously loaded connections. A part of this dataset has been labeled and the rest has a label recommendation. To start using the application it is necessary to create a user and start session.


## Live Demo

A live demo of the app is located at: http://riskid.ingenieria.uncuyo.edu.ar  You will need to sign-up for using the app.

## Docker

A docker image with the last version of RiskID is also available. Just run the image as usual and the access port 3000.

```

docker run --restart=always -d -p 3000:3000 --name riskidv1 harpomaxx/riskid-web-app
```


## Built With 🛠️

This version of RiskID was developed using:
* [PyCharm](https://www.jetbrains.com/pycharm/) - IDE
* [D3JS](https://d3js.org/) -  Data-Driven Documents
* [NODEJS](https://nodejs.org/) - Environment


## Publications


* **Active learning approach to label network traffic datasets**, Journal of Information Security and Applications, ELSEVIER. 2019
* **A Study on Labeling Network Hostile Behavior with Intelligent InteractiveTools**,16th IEEE Symposium on Visualization for Cyber Security VizSec 2019, Vancouver, Canada
* **Visual Exploration of Network Hostile Behavior**, ESIDA '17: Proceedings of the 2017 ACM Workshop on Exploratory Search and Interactive Data Analytics Limassol,Cyprus 
* **Improving the Generation of Labeled Network Traffic Datasets Through Machine Learning Techniques,** XXIII Argentine Conference on Computer Science, La Plata, Argentina

## Authors ✒️

* **Jorge L. Guerra** - *Main developer* - [jorge](https://github.com/jorgeguerra881215)
* **Eduardo Veas** - *Visualization skill* - [eduveas]()
* **Carlos Catania** - *Machine Learning skill* - [ccatania]()


## Acknowledgments 🎁

* Special thanks to National Scientific and Technical Research Council (CONICET, Argentina)

---
