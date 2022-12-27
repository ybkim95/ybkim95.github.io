---
layout: page
title: Play
# description: Lorem ipsum dolor est
image: assets/images/ice_hockey.png
# nav-menu: true
---

<!-- Main -->
<div id="main">

<!-- <meta name="viewport" content="width=device-width, initial-scale=1"> -->
<!-- <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css"> -->
<style>
  .hero-image {
    background-image: linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url("/assets/images/item-3-digital-companion.png");
    height: 60%;
    background-position: center;
    background-repeat: no-repeat;
    background-size: cover;
    position: relative;
  }
  .hero-text {
    text-align: left;
    position: absolute;
    top: 70%;
    left: 50%;
    transform: translate(-50%, -50%);
    color: white;
  }
  .hero-text button {
    border: none;
    outline: 0;
    display: inline-block;
    padding: 10px 25px;
    color: black;
    background-color: #ddd;
    text-align: center;
    cursor: pointer;
  }
  .hero-text button:hover {
    background-color: #555;
    color: white;
  }
*{
  padding: 0;
  margin: 0;
  text-decoration: none;
  list-style: none;
  box-sizing: border-box;
}
body{
  font-family: Arial;
}
nav{
  /* background-color: white; */
  background-color: rgba(255, 255, 255, 0.4);
  opacity: 0.99;
  /* background: #0082e6; */
  height: 80px;
  width: 100%;
}
label.logo{
  background-image: url('/assets/image/ybk.jpg');
  opacity: 0.97;
  /* color: black;
  font-size: 35px;
  line-height: 80px;
  padding: 0 100px;
  font-weight: bold; */
}
nav ul{
  /* background-color: gray; */
  float: right;
  margin-right: 20px;
}
nav ul li{
  display: inline-block;
  line-height: 80px;
  margin: 0 5px;
}
nav ul li a{
  color: black;
  font-size: 17px;
  padding: 0px 13px;
  border-radius: 3px;
  text-transform: uppercase;
}
/* a.active,a:hover{
  background: #1b9bff;
  transition: .5s;
} */
.checkbtn{
  font-size: 30px;
  color: white;
  float: right;
  line-height: 80px;
  margin-right: 40px;
  cursor: pointer;
  display: none;
}
#check{
  display: none;
}
@media (max-width: 952px){
  label.logo{
    font-size: 30px;
    padding-left: 50px;
  }
  nav ul li a{
    font-size: 16px;
  }
}
@media (max-width: 858px){
  .checkbtn{
    display: block;
  }
  ul{
    position: fixed;
    width: 100%;
    /* height: 100vh; */
    background: #2c3e50;
    /* top: 80px; */
    left: -100%;
    text-align: center;
    transition: all .5s;
  }
  nav ul li{
    display: block;
    margin: 50px 0;
    line-height: 30px;
  }
  nav ul li a{
    font-size: 20px;
  }
  a:hover,a.active{
    /* background: none; */
    color: #0082e6;
  }
  #check:checked ~ ul{
    left: 0;
  }
}
section{
  /* background: url(bg1.jpg) no-repeat; */
  /* background-size: cover; */
  background-color: white;
  height: calc(100vh - 80px);
}
</style>
<style type='text/css'>
  h1, h2, h3, h4, h5 {
      font-family: Arial;
      /* color: maroon; */
      /* border-bottom: 1px solid rgb(200, 200, 200); */
  }
  h6 {
    font-family: Arial;
    color: gray;
  }
  rt {
    font-family: Arial;
    color: gray;
    font-size: 16px;
  }
</style>
<style>
.btn {
  outline: none;
  border: none;
  font-size: 16px;
  /* cursor: pointer; */
  /* display: inline-block; */
}
/* .btn:hover {background: #eee;} */
.success {color: black;}
/* .info {color: dodgerblue;}
.warning {color: orange;}
.danger {color: red;}
.default {color: black;} */
projectbutton {
    position:absolute;
    top: 67%;
    padding-left: 3%;
    font-family: Arial;
    font-weight: bold;
    font-size: 20px;
    color: black;
    background-color: transparent;
    background-repeat: no-repeat;
    border: none;
    cursor: pointer;
    overflow: hidden;
    outline: none;
}
duration {
    position:absolute;
    top: 75%;
    padding-left: 4%;
    font-family: Arial;
    font-size: 15px;
    color: gray;
    background-color: transparent;
    /* background-repeat: no-repeat; */
    /* border: none; */
    /* cursor: pointer; */
    /* overflow: hidden; */
    /* outline: none; */
}
organization {
    position:absolute;
    top: 79%;
    padding-left: 4%;
    font-family: Arial;
    font-size: 15px;
    color: gray;
    background-color: transparent;
    /* background-repeat: no-repeat; */
    /* border: none; */
    /* cursor: pointer; */
    /* overflow: hidden; */
    /* outline: none; */
}

/* takeaways */
main {
  padding: 0 64px 64px;
}

.card {
  border-radius: 5px;
  margin: 0 auto;
  width: 200px;
  overflow: hidden;
  /* background-image: url(https://source.unsplash.com/collection/905011/1000x1000); */
  background-size: cover;
}

.info {
  position: relative;
  width: 100%;
  /* height: 100px; */
  background-color: #fff;
  transform: translateY(100%)
    translateY(-45px)
    translateZ(0);
  transition: transform 0.5s ease-out;
}

.info:before {
  z-index: -1;
  display: block;
  position: absolute;
  content: ' ';
  width: 100%;
  height: 100%;
  overflow: hidden;
  background-color: red;
  /* background-image: url(https://source.unsplash.com/collection/905011/1000x1000); */
  /* filter: blur(10px); */
  background-size: cover;
  opacity: 0.2;
  transform: translateY(-100%)
    translateY(45px)
    translateZ(0);
  transition: transform 0.5s ease-out;
}

.card:hover .info,
.card:hover .info:before {
  transform: translateY(0) translateZ(0);
}

.title {
  margin: 0;
  padding: 20px;
  font-size: 14px;
  line-height: 1;
  color: rgba(0, 0, 0, 0.87);
}

.description {
  margin: 0;
  padding: 0 24px 24px;
  font-size: 10px;
  line-height: 1.5;
}

/* General layout and typography stuff */
@import url("https://fonts.googleapis.com/css?family=Open+Sans:300,400");

* {
  box-sizing: border-box;
  position: relative;
  transition: all .3s ease
}

html {
  font-size: 16px
}

body {
  font-family: Open Sans, Verdana, sans-serif;
  color: rgba(0, 0, 0, .87);
  font-weight: 400;
  line-height: 1.45
}

/* body,
header {
  background: #fafafa
} */

header {
  padding: 40px;
  min-height: 200px;
  text-align: center;
  color: rgba(0, 0, 0, .87)
}

header > * {
  max-width: 800px;
  margin-left: auto;
  margin-right: auto
}

header>:last-child {
  margin-bottom: 0
}

h1 {
  margin-bottom: 0.5em;
  font-weight: inherit;
  line-height: 1.2;
  color: #1c5b72;
  font-size: 2.618em
}

@media (min-width:800px) {
  h1 {
    font-size: 4.236em;
    font-weight: 300
  }
}

p {
  margin-bottom: 1.3em;
  line-height: 1.618
}

@media (min-width:800px) {
  p {
    font-size: 1.3em
  }
}

a {
  color: #e03616;
  text-decoration: none
}
.card-container {
  /* background-color: #0F6; */
  width: 100%;
  height: auto;
  margin: auto 0;
  display: flex;
  justify-content: center;
}

.card-container ul {
  float: left;
  text-align: center;
  margin: auto 0;
}

.card-container li {
  list-style-type: none;
  padding: .5em .5em .5em .5em;
  text-align: left;
}

</style>

<head>
  <meta charset="utf-8">
  <title>Responsive Navbar | CodingNepal</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="stylesheet" href="style.css">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.3/css/all.min.css"/>
</head>
<body>
<section>
  <div class="hero-image">
    <div class="hero-text">
      <h1 style="font-size:40px; color:white; font-family:Arial;">Digital Companion Robot Design for Older Adults</h1>
    </div>
    <nav>
      <input onClick="window.location.href='../'" type="image" src="/assets/images/white_logo.png" style="height:90%" />
        <ul>
            <!-- <li><a class="active" href="#">Home</a></li>
            <li><a href="#">About</a></li>
            <li><a href="#">Services</a></li> 
            <li><a href="#">Contact</a></li> 
            <li><a href="#">Feedback</a></li> -->
        </ul>
    </nav>
  </div>
    <br>
    <projectbutton><a href="../#sec_project">< Projects</a></projectbutton>
    <br>
    <duration>April 2018 ~ Dec 2018</duration>
    <br>
    <organization> Technology and Design<br>Research Center, <br>Yonsei University </organization>
    <center>
        <div style="max-width:900px; word-wrap:break-word; font-size:24px; font-weight:bold">
            <div align="left">
              Digital Companion Robot Design for Older Adults
            </div>
        </div>
        <br>
        <img src="/assets/images/aging_population_in_korea.png" alt="tdrc-1" style="width:35%;"><br>
        <rt>Image Source: Aging of South Korea in 2020 (<a href="https://link.springer.com/article/10.1007/s40980-020-00061-8">Kee Whan Kim et al</a>)</rt><br>
        <div style="max-width:900px; word-wrap:break-word; font-size:18px;">
          <div align="left"><br>
          Social connections in our life help us in improving the quality and well-being of our lives. However, chances of being socially connected decrease in the cases of older adults, making them vulnerable to depression. <br>In 2017, South Korea had ofcially become an aged society, with more than 14 percent of its citizens 65 years old or older. It took only 17 years after South Korea became an aging society in 2000, while Japan took 24  years for the same transition (Chosun 2017). <b>Companion robots</b> can satisfy their needs since they are developed as technological intervention tools by providing service, companionship, and assistance in daily life.<br>
          In this project, our goal was to first understand the needs of older adults, evaluate the designed concepts, and finally prototype a companion robot.
          <br><br> 
            <h6> Research Topics </h6>
            <rt>
              # companion robots # elder care # living-lab experiment
            </rt>
            <br><br><br><br>
            <div style="max-width:900px; word-wrap:break-word; font-size:24px; font-weight:bold">
              <div align="left">
                Overview
              </div>
            </div>
            <br>
            <img src="/assets/images/dori_overview.png" alt="aamas-1">
            <br><br><br>
            <div style="max-width:900px; word-wrap:break-word; font-size:24px; font-weight:bold">
              <div align="left">
                Experiments
              </div>
            </div>
            <br>
            <img src="/assets/images/dori_experiment.png" alt="aamas-1">
            <br><br>
            To investigate older adults’ living accommodations and their life patterns closely, we decided to conduct living-lab experiments with 22 participants between the ages of 70 and 90 for two weeks
            <br>
            <br>
            <br>
            <br>
            <br>
            <div style="max-width:900px; word-wrap:break-word; font-size:24px; font-weight:bold">
              <div align="left">
                Takeaways
              </div>
            </div>
            <br>
            <br>
            The needs extracted from the caregivers and older adults during the FGI are organized as below:
            <br><br>
            <ul class='card-container'>
              <li>
                <div class='card'>
                  <div class='info'>
                    <h1 class='title'>LOS</h1>
                    <p class='description'>dasds.</p>
                  </div>
                </div>
              </li>
              <br>
              <li>
                <div class='card'>
                  <div class='info'>
                    <h1 class='title'>MED</h1>
                    <p class='description'>dasds.</p>
                  </div>
                </div>
              </li>
              <br>
              <li>
                <div class='card'>
                  <div class='info'>
                    <h1 class='title'>CON</h1>
                    <p class='description'>dasds.</p>
                  </div>
                </div>
              </li>
              <br>
              <li>
                <div class='card'>
                  <div class='info'>
                    <h1 class='title'>ENV</h1>
                    <p class='description'>dasds.</p>
                  </div>
                </div>
              </li>
            </ul>
            <ul class='card-container'>
              <li>
                <div class='card'>
                  <div class='info'>
                    <h1 class='title'>PAT</h1>
                    <p class='description'>dasds.</p>
                  </div>
                </div>
              </li>
              <br>
              <li>
                <div class='card'>
                  <div class='info'>
                    <h1 class='title'>HEA</h1>
                    <p class='description'>dasds.</p>
                  </div>
                </div>
              </li>
              <br>
              <li>
                <div class='card'>
                  <div class='info'>
                    <h1 class='title'>EAT</h1>
                    <p class='description'>dasds.</p>
                  </div>
                </div>
              </li>
              <br>
              <li>
                <div class='card'>
                  <div class='info'>
                    <h1 class='title'>WEL</h1>
                    <p class='description'>dasds.</p>
                  </div>
                </div>
              </li>
            </ul>
            <ul class='card-container'>
              <li>
                <div class='card'>
                  <div class='info'>
                    <h1 class='title'>NEW</h1>
                    <p class='description'>dasds.</p>
                  </div>
                </div>
              </li>
              <br>
              <li>
                <div class='card'>
                  <div class='info'>
                    <h1 class='title'>WAK</h1>
                    <p class='description'>dasds.</p>
                  </div>
                </div>
              </li>
              <br>
              <li>
                <div class='card'>
                  <div class='info'>
                    <h1 class='title'>PHO</h1>
                    <p class='description'>dasds.</p>
                  </div>
                </div>
              </li>
              <br>
              <li>
                <div class='card'>
                  <div class='info'>
                    <h1 class='title'>VOC</h1>
                    <p class='description'>dasds.</p>
                  </div>
                </div>
              </li>
            </ul>
            <ul class='card-container'>
              <li>
                <div class='card'>
                  <div class='info'>
                    <h1 class='title'>FRN</h1>
                    <p class='description'>dasds.</p>
                  </div>
                </div>
              </li>
              <br>
              <li>
                <div class='card'>
                  <div class='info'>
                    <h1 class='title'>GAM</h1>
                    <p class='description'>dasds.</p>
                  </div>
                </div>
              </li>
            </ul>
            <br>
            <br>
            15 Scenarios were designed for older adults interacting with digital companion robots and below are the few examples:
            <br><br>
            # 1. Social Connections<br><br>
            <center>
              <img src="/assets/images/scenario_dori.png" style="width: 90%">
            </center>
            <br><br>
            # 2. Social Connections<br><br>
            <center>
              <img src="/assets/images/scenario_dori1.png" style="width: 90%">
            </center>
            <!-- <div style="max-width:900px; word-wrap:break-word; font-size:24px; font-weight:bold">
              <div align="left">
                Reference
              </div>
            </div> -->
            <br>
            <p>
              <font size="3">
              <!-- <a href="/about/about_team.htm">Explainable Representations of Human Interaction: Engagement Recognition model with Video Augmentation.<br>Y.B.KIM, H.Chen, S.M.Algohwinem, C.Breazeal, H.W.Park, "Joint Engagement Classification using Video Augmentation Techniques for Multi-person Human-robot Interaction." under review at AAMAS 2023.</a> -->
              </font>
            </p>
          </div>
        </div>
    </center>
    <br>
    <br>
    <br>
    <br>
    

</section>
</body>


